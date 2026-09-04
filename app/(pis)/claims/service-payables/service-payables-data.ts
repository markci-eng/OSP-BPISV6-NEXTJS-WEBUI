// Service Payables data access.
//
// Built on top of the shared PIS data layer (`app/(pis)/data`), the same way
// `death-claims-data` is, and read through the same overlay pattern: this
// module derives every billing from the seed and then lays
// `service-payables-store` over the top, so a billing created this session
// reads as a numbered billing everywhere.
//
// WHAT A SERVICE PAYABLE IS
//
// A chapel renders the funeral service a plan was bought for, and the company
// owes that chapel for it. The debt is not settled service by service: a
// chapel's services are grouped by the period they fall in, and the group is
// what gets billed. So the unit of work here is a BILLING — one chapel, one
// period — and the plan holders it covers hang off it.
//
// THE TWO NUMBERS, which are different things and are not interchangeable:
//
//   Billing Code   DONSOL1AUG26 — chapel + cut + month + 2-digit year. DERIVED.
//                  It exists the moment a chapel has a service in a period;
//                  nothing has to happen for it to be true.
//   Billing No     B26000042 — "B" + 2-digit year + a per-year sequence. MINTED
//                  when the billing is created, and only then. A billing with
//                  no number has not been created yet.
//
// Terminating a plan holder's plan is what puts their service INTO the billing,
// and it cannot happen before the billing has a number — see the store.
//
// Those two steps are ONE sitting at one screen, which is why the "For Process"
// queue is not "billings without a number": it holds billings whose work is
// unfinished, numbered or not. See the stage rule in `getServiceBillings`.
//
// WHERE THE BILLINGS COME FROM (2026-08-25: they come from the tables now)
//
// The four tables a service payable is made of are in the data layer, and this
// module reads them rather than deriving billings from chapels and deaths:
//
//   TblBillingHdr              one row per chapel-period — the BILLING CODE, and
//                              what a `ServiceBilling` is built around.
//   TblICIS_Billing_Processed  the accounts under that code, one per plan a
//                              chapel has serviced — one `ServiceRecord` each.
//   TblClaimsBilling           written when the billing is created. It carries
//                              the BILLING NO, so a code with no row here is
//                              exactly what "For Process" means.
//   TblClaimsSP                one row per plan terminated into that number.
//
// See `app/(pis)/data/models.ts` for the four, and `billing-seed.ts` for where
// their rows come from.
//
// WHAT IS STILL DERIVED HERE, because no table was given for it: the
// deficiencies, and the discrepancy rule — though the discrepancy now reads real
// columns rather than a stand-in, since the endorsed name is
// `TblICIS_Billing_Processed.Planholder` and the plan's status is the plan's
// own. Each is one function, so replacing it with a real table stays a local
// change.
//
// THE CSP AMOUNT IS NO LONGER ONE OF THEM (2026-08-26). It was the longest-
// standing stand-in in this module and it is now two lookups against two real
// reference tables — `RefMortuaryCSP` for the code and `RefMortuaryCSPRate` for
// the money. See "the CSP rule" below.

import {
  BILLING_COMPANY,
  db,
  periodFromBillingCode,
  periodKey,
  periodLabel,
  periodOf,
  toFullName,
  type BillingPeriod,
  type BillingProcessed,
  type Mortuary,
  type PersonName,
  type Planholder,
  type ServiceBlockReason,
} from "../../data";
import {
  countTerminated,
  getCompliedDeficiency,
  getCreatedBilling,
  getManualServices,
  getResolvedDiscrepancy,
  getApprovedBilling,
  getSavedServiceRecord,
  getVerifiedBilling,
  isPlanTerminated,
  reserveBillingSequenceFrom,
  type CompliedDeficiency,
  type ManualService,
  type ResolvedDiscrepancy,
} from "./service-payables-store";

/* ============================== the period ============================== */
//
// MOVED TO THE DATA LAYER, and re-exported here so the screens still read one
// module. The billing code is a column — `TblBillingHdr.BillingCode` — so the
// seed has to be able to write one, and the seed cannot reach into a feature
// module. The period arithmetic went with it because the code is made of it.
//
// See `app/(pis)/data/billing-period.ts` for all of it, including the two rules
// that used to live here: the four half-month cuts, and the "-FR" a franchise's
// code carries.

export {
  CUTS_PER_MONTH,
  FRANCHISE_CODE_SUFFIX,
  SERVICE_DAYS_AFTER_DEATH,
  billingCodeFor,
  cutForDay,
  cutRange,
  periodFromBillingCode,
  periodKey,
  periodLabel,
  periodOf,
  serviceDateFor,
  splitBillingCode,
  type BillingPeriod,
} from "../../data";

/* =============================== the model =============================== */

/** Where a billing has got to. */
export type BillingStage = "for-process" | "processed" | "verified" | "approved";

export const BILLING_STAGES: BillingStage[] = [
  "for-process",
  "processed",
  "verified",
  "approved",
];

export const BILLING_STAGE_LABELS: Record<BillingStage, string> = {
  "for-process": "For Process",
  processed: "Processed",
  verified: "Verified",
  approved: "Approved",
};

/**
 * The same four stages named as QUEUES — what the billings sitting there are
 * waiting for, rather than what they already are.
 *
 * TWO SETS OF NAMES FOR ONE RUN OF STAGES, and both are right about different
 * things. {@link BILLING_STAGE_LABELS} describes a BILLING: this one has been
 * processed, that one is verified — which is what a row, a chip or a history
 * line needs. These describe a PILE OF WORK: a billing that has been processed
 * is sitting in the For Verification queue, and somebody is going there to
 * verify it. A processor navigates by the second and reads records by the
 * first.
 *
 * Note the offset that falls out of it — "Processed" is the For VERIFICATION
 * queue, not the For Process one. That is not a mistake and it is the reason
 * these live together: read apart, the two vocabularies look like they disagree
 * about where a billing is.
 *
 * Shared so the queue tabs and the dashboard's quick links cannot drift into
 * two spellings of the same destination.
 */
export const BILLING_QUEUE_LABELS: Record<BillingStage, string> = {
  "for-process": "For Process",
  processed: "For Verification",
  verified: "For Approval",
  approved: "For Endorsement",
};

/**
 * Where each stage is WORKED — the workspace route behind its queue.
 *
 * The paths cannot be derived from the stage keys, and this map is where that is
 * dealt with. ALL FOUR are named for the QUEUE and not for the stage — a billing
 * that is `processed` is worked at `/for-verification`, a `verified` one at
 * `/for-approval`, an `approved` one at `/for-endorsement` — so the URL and the
 * page title match the label the user pressed to get there. The stage keys keep
 * their own names, which is the offset `BILLING_QUEUE_LABELS` explains.
 *
 * Written out once here, so no caller has to guess.
 */
export const BILLING_STAGE_ROUTES: Record<BillingStage, string> = {
  "for-process": "/claims/service-payables/for-process",
  processed: "/claims/service-payables/for-verification",
  verified: "/claims/service-payables/for-approval",
  approved: "/claims/service-payables/for-endorsement",
};

/**
 * Whether a stage is listed by the PERSON who put the billing through rather
 * than by the territory it sits in.
 *
 * The two halves of the dashboard answer different questions. "For Process" is
 * work not yet done, and work is found the way the old screen made you find it:
 * pick a territory, then a chapel inside it. Everything past it is work that HAS
 * been done — a billing only leaves For Process once it carries a number and
 * every plan holder under it has been terminated — so the fact worth carrying is
 * no longer where it is, but who put it through.
 *
 * Applied to Verified and Approved as well as Processed: those billings were
 * processed by someone too, and a tab strip that grouped one way on three tabs
 * and another way on a fourth would be read as a bug. Narrowing this to
 * `stage === "processed"` is the whole change if that turns out to be wanted.
 */
export function isProcessorStage(stage: BillingStage): boolean {
  return stage !== "for-process";
}

/**
 * Whether a billing has gone to ACCOUNTING and can no longer be reopened.
 *
 * This is the line the supplementary rule turns on, and it is drawn at Verified.
 * A billing that is still For Process or Processed has not left this department:
 * a plan holder whose discrepancy is put right can simply be terminated into it,
 * as they would have been all along. Once it is Verified it has been endorsed
 * outward, its total is a figure accounting is working to, and adding a plan to
 * it after the fact would move a number somebody else has already booked. That
 * plan is billed supplementarily instead — see {@link getSupplementaryItems}.
 *
 * Approved is past Verified and so is also endorsed. Verified is the earliest
 * stage at which it is true, which is why the test names it rather than listing
 * both: "not yet endorse or verified" is the rule as given, and the two words
 * name one moment.
 */
export function isEndorsedToAccounting(stage: BillingStage): boolean {
  return stage === "verified" || stage === "approved";
}

/* =============================== mortuaries =============================== */


/**
 * The mortuary reference table now LIVES IN THE SHARED DATA LAYER, where every
 * other genuine PIS reference table lives — `RefMortuary` alongside Territory,
 * ChapelBranch and RefPayClass. It stood here for as long as service payables
 * was the only screen reading it; the 2026-08-18 structure drop settled that it
 * is a real table with a real class column, and it moved.
 *
 * What is left in this module is ORDERING — which mortuary to offer first on a
 * given chapel — which is a service-payables question and not the table's.
 */

/** A mortuary by its code — how the form pairs the two fields. */
export function getMortuary(mortCode: string): Mortuary | undefined {
  return db.getMortuary(mortCode);
}

/**
 * The mortuaries of one chapel, the likeliest first — and the first of them is
 * the answer the create-billing form opens on and the rate a service is priced
 * at before its billing exists ({@link defaultMortCodeFor}).
 *
 * THE RULE ITSELF IS THE DATABASE'S NOW (2026-08-26). It was here — a name
 * match, a rank and a stable sort — for as long as this screen was the only
 * caller. It is not: `billing-seed` writes a mortuary into every
 * `TblClaimsBilling` row it raises, and while this module kept its own copy the
 * seed used the raw chapel-code filter instead, so a billing on file and a
 * billing created in the browser for the same chapel could name different
 * funeral homes. See `PisDatabase.getMortuariesForChapel` for the rule, what the
 * description LIKE is, and what it costs.
 *
 * NOT A FILTER ON THE PICKER, and that part IS this module's. A service
 * transferred in from another chapel is billed against the mortuary that
 * rendered it, so every one of the 424 stays reachable — what the designation is
 * for here is ORDER. See {@link getMortuaryOptions}.
 */
export function getMortuariesForChapel(chapelCode: string): Mortuary[] {
  return db.getMortuariesForChapel(chapelCode);
}

/**
 * Every mortuary, with the given chapel's own first — in the order
 * {@link getMortuariesForChapel} puts them, so the top of the list is the same
 * mortuary the form filled in.
 *
 * WHAT FOLLOWS THE CHAPEL'S OWN is the same territory's, then the rest —
 * because the chapel's own is usually one or two rows and the processor moving a
 * transferred-in service still has 424 funeral homes to scroll. Province first is
 * the difference between a list and a haystack. Nothing is removed; only the
 * order changes.
 *
 * WHICH ONES ARE "ITS OWN" IS NOT ASKED HERE any more (2026-08-26). It used to
 * be a second `chapelCode` filter written out on the spot, which quietly made
 * this disagree with the designation the moment that stopped being how a chapel
 * finds its mortuary. One definition, read from it.
 *
 * The chapel is optional: with none, this is the list in source order.
 */
export function getMortuaryOptions(chapelCode?: string): Mortuary[] {
  const all = db.getMortuaries();
  if (!chapelCode) return all;

  const chapel = db.getChapel(chapelCode);
  const own = getMortuariesForChapel(chapelCode);
  const ownCodes = new Set(own.map((m) => m.mortCode));

  const rest = all.filter((m) => !ownCodes.has(m.mortCode));
  if (!chapel?.territoryCode) return [...own, ...rest];

  // A mortuary's territory is its own chapel's, so this leaves out the ones
  // whose chapel code does not resolve — they sit with the remainder, which is
  // where an unplaceable row belongs.
  const near = rest.filter((m) => m.territoryCode === chapel.territoryCode);
  const far = rest.filter((m) => m.territoryCode !== chapel.territoryCode);
  return [...own, ...near, ...far];
}

/* ========================= service record lookups ========================= */

/**
 * The fields on the service record that are chosen from a list rather than
 * typed.
 *
 * THREE OF THE FIVE ARE REAL NOW and two are still stand-ins, and the three did
 * not all arrive the same way:
 *
 *   credit of service  `RefCreditOfService` (2026-08-25), read off the table.
 *   CSP code           `RefMortuaryCSP` (2026-08-26), read off the table.
 *   nature of service  its four VALUES were given (2026-08-26) with no table
 *                      named, so the list is written out below — real values,
 *                      no query behind them yet.
 *
 * STATUS AND THE WREATH ALLOWANCE are what is left. Neither has a table or a
 * value list, so what is kept from the old screen is the value it was showing —
 * status PENDING, wreath 500 — with a plausible neighbour or two beside it,
 * there so the control is a real choice and not a single-option dropdown.
 *
 * These are `label`/`value` pairs rather than bare strings because a code and
 * its meaning are two things — "SC" alone tells a new processor nothing, and the
 * paperwork names the code, so neither half can be dropped.
 */
export interface CodedOption {
  value: string;
  label: string;
}

/** Where the service record has got to. */
export const SERVICE_RECORD_STATUSES: CodedOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "FOR VERIFICATION", label: "For Verification" },
  { value: "VERIFIED", label: "Verified" },
];

/**
 * What the service is charged under — `RefMortuaryCSP`, and the second field on
 * this form to stop being a stand-in (2026-08-26).
 *
 * It was three invented values — GR/SP/TR, "regular", "special", "transferred" —
 * on the reading that a CSP code said what KIND of payable it was. It does not.
 * It names the PLAN in the payables world's own vocabulary: SC is ST. CLAIRE,
 * SA is ST. ANNE, and the codes that are not plans are caskets. So the field is
 * derived rather than chosen now, and the list is here for the times the
 * derivation comes up empty or the processor disagrees with it.
 *
 * ALL 47 ROWS, IN NAME ORDER rather than the table's own — the table sorts by
 * description already, but a picker is read by its labels and "BARON" before
 * "ST. ANDREW" is the order a reader expects. Nothing is filtered: a code with
 * no rate at the chosen mortuary is still a code the processor may need.
 */
export const CSP_CODES: CodedOption[] = db
  .getCSPTypes()
  .map((row) => ({ value: row.cspCode, label: `${row.cspCode} - ${row.cspDesc}` }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * How the chapel came to render the service — the real four (2026-08-26).
 *
 * IT WAS ASSIGNED / WALK-IN / REFERRED, which was a guess at what the field
 * meant: how the FAMILY reached the chapel. It is not that. Three of the four
 * are about the PLAN — whether the deceased was inside the insurable period —
 * and only ASSIGNED is about how the service came to this chapel at all:
 *
 *   ASSIGNED    the service was assigned to the chapel.
 *   IP WITHIN   within the insurable period.
 *   IP OVER     over it.
 *   NIP         not in the insurable period.
 *
 * THE VALUE IS ITS OWN LABEL, exactly as {@link CREDIT_OF_SERVICE_OPTIONS} does
 * and for the same reason: four values arrived and no codes did, and IP and NIP
 * are acronyms the paperwork uses — expanding them into a friendly label here
 * would be inventing the wording a processor is meant to recognise. "Ip Over" is
 * worse than "IP OVER" in every way that matters.
 *
 * STILL A LIST IN THIS MODULE rather than a table read, because no table was
 * named for it — unlike `RefCreditOfService` and `RefMortuaryCSP`, which are
 * read off the data layer. When one lands, this constant is the only thing that
 * changes.
 *
 * WORTH NOTICING, AND NOT WIRED UP: `IP WITHIN` / `IP OVER` line up with the
 * plan's own contestability, which `PlanholderPanel` already shows above this
 * form. Whether the field should therefore default from the plan rather than
 * from {@link SERVICE_RECORD_DEFAULTS} is a rule nobody has stated, so it does
 * not.
 */
export const NATURE_OF_SERVICE: CodedOption[] = [
  { value: "ASSIGNED", label: "ASSIGNED" },
  { value: "IP OVER", label: "IP OVER" },
  { value: "IP WITHIN", label: "IP WITHIN" },
  { value: "NIP", label: "NIP" },
];

/**
 * STAND-IN: the wreath allowance, in pesos.
 *
 * A number on the old screen, and kept a choice rather than a free input for the
 * same reason it was one there: it is an allowance the company sets, not an
 * amount the processor works out.
 */
export const WREATH_AMOUNTS: CodedOption[] = [
  { value: "0", label: "None" },
  { value: "500", label: "500" },
  { value: "1000", label: "1,000" },
];

/**
 * How the service is credited to the chapel — and the one field on this form
 * that is NOT a stand-in any more.
 *
 * `RefCreditOfService` arrived in the 2026-08-17 structure drop with no rows,
 * so the field was a free text input defaulted to "NONE" for a week. The four
 * values landed on 2026-08-25 and it is a real reference list now: 1ST POINT,
 * 2ND POINT, CREM ONLY, REGULAR.
 *
 * READ FROM THE TABLE rather than written out here, which is what every coded
 * field on this form should eventually do — the others are still lists in this
 * module because their tables have not been given.
 *
 * The value is its own label because the source gives no codes; see the seed.
 */
export const CREDIT_OF_SERVICE_OPTIONS: CodedOption[] = db
  .getCreditOfServiceOptions()
  .map((row) => ({
    value: row.creditOfServiceId,
    label: row.creditOfServiceDesc,
  }));

/**
 * The value a fresh service record opens on, per field.
 *
 * THE FIELDS WITH NOTHING TO LOOK THE ANSWER UP IN, and only those. A field
 * whose value can be looked up does not have a default here — it has a source:
 *
 *   CSP code           off the PLAN, through `RefMortuaryCSP` — see
 *                      {@link cspCodeFor}. Empty when the plan names no CSP row,
 *                      which leaves the dropdown unanswered rather than guessing.
 *   CSP amount         off the MORTUARY and that code, through
 *                      `RefMortuaryCSPRate` — see {@link cspAmountFor}.
 *   credit of service  off the SERVICE: the endorsement already carries one
 *                      (`TblICIS_Billing_Processed.CreditOfService`), so the
 *                      field opens on what was sent in. The constant below is
 *                      the fallback for a service that arrived without one — a
 *                      plan holder keyed in by hand, say.
 *
 * NATURE OF SERVICE IS A REAL VALUE THAT IS STILL A DEFAULT. Its four values
 * arrived on 2026-08-26 and ASSIGNED is one of them rather than a stand-in — but
 * nothing on file says which of the four a given service is, so the field opens
 * on the commonest and the processor answers it. See {@link NATURE_OF_SERVICE}
 * for the one place a rule could come from, and why it has not been assumed.
 *
 * See `ServiceRecordForm`.
 */
export const SERVICE_RECORD_DEFAULTS = {
  status: "PENDING",
  natureOfService: "ASSIGNED",
  withWreath: "500",
  creditOfService: "REGULAR",
} as const;

/** The label for a code, falling back to the code itself. */
export function labelFor(options: CodedOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/* ========================= required documents ========================= */

/**
 * STAND-IN: the documents a service payable must have on file before it can be
 * billed.
 *
 * THE REAL RULE IS PER SERVICE and it is not in this data layer yet. A death
 * claim carries its own requirement list, and so does each kind of service —
 * a transferred service asks for papers a walk-in does not. There is no
 * `ServiceRequirement` table to read that from, so until there is, EVERY
 * service is checked against this one list.
 *
 * FIXED, not sampled. A list drawn at random per service would give the same
 * plan holder a different set of requirements each time their record was
 * opened, which is worse than a wrong list — it is a list that cannot be
 * worked, because nothing a processor does to satisfy it stays satisfied.
 *
 * These six are the codes the old screen's service-payable folders actually
 * carried: the plan and its proof, the death registered, and the two parties
 * identified. Replacing this with a real per-service list is a change to this
 * one constant and {@link getRequiredDocuments}.
 */
export const REQUIRED_DOCUMENT_CODES: string[] = [
  "CS000126", // LPA
  "CS000140", // COFP
  "CS000456", // REGISTERED DEATH CERTIFICATE
  "CS000415", // VALID ID OF PH
  "C000014", // STATEMENT OF CLAIMANT
  "CS000414", // VALID ID OF CLAIMANT
];

/** One document a service is required to have on file. */
export interface RequiredDocument {
  documentCode: string;
  documentDesc: string;
}

/**
 * The documents this service must have on file, in the order they are asked
 * for.
 *
 * Takes the service so the signature is already the one a per-service rule
 * needs; it is deliberately unused while {@link REQUIRED_DOCUMENT_CODES} is the
 * whole answer.
 */
export function getRequiredDocuments(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _service?: ServiceRecord,
): RequiredDocument[] {
  return REQUIRED_DOCUMENT_CODES.map((code) => ({
    documentCode: code,
    documentDesc: db.getDocumentType(code)?.documentDesc ?? code,
  }));
}

/** True while {@link getRequiredDocuments} is a stand-in — the UI says so. */
export const REQUIRED_DOCUMENTS_RULE_PENDING = true;

/**
 * A REQUIREMENT NOT COMPLIED WITH — the thing the source screen's "With
 * Deficiencies" table and its Send / View Deficiency actions are about.
 *
 * A DEFICIENCY IS NOT A DISCREPANCY. The line between them, as the user drew it
 * (2026-08-25), is what is wrong rather than how serious it is:
 *
 *   Deficiency   A REQUIREMENT HAS NOT BEEN COMPLIED WITH. Something the folder
 *                is supposed to carry is not there — a document, or the plan
 *                holder's own ID. Answered by ASKING FOR IT: the branch is sent
 *                a notice, it posts what is missing, the deficiency goes. This
 *                is the state that carries View and Send / Resend.
 *   Discrepancy  AN ACCOUNT THAT VIOLATES THE RULES AND SHOULD NOT HAVE BEEN
 *                SERVED. Nothing can be sent for, because nothing is missing —
 *                the plan itself was not one this company owed a service on.
 *                It carries no notice, only a correction. See
 *                {@link ServiceDiscrepancy}.
 *
 * WHICH BUTTONS EACH GETS follows from that and is not a UI choice: sending for
 * something only makes sense when something is coming. See `RecordActions`.
 *
 * Both hold a service back from being billed, and neither holds up the OTHER
 * plan holders on the billing.
 */
export interface ServiceDeficiency {
  /** What is missing, e.g. "Registered Death Certificate not attached". */
  reason: string;
  /** ISO date the deficiency was raised. */
  raisedAtISO: string;
}

/**
 * The deficiency for a service whose plan number names no plan on file.
 *
 * THE PLAN HOLDER'S ID IS ITSELF A REQUIREMENT, and this is the case that moved
 * across the line on 2026-08-25: an endorsement that cannot be matched to a plan
 * used to be filed as a discrepancy, which took away the one control that
 * answers it. Nobody has to decide whether this account should have been served
 * — nothing is known about it yet. The branch is asked for the plan number, and
 * when it arrives the service goes back among the billable ones.
 *
 * It is where a PAPER FRANCHISE'S endorsements land in practice: the number is
 * keyed in off a hard copy, and a number read off a photocopy is a number that
 * can be wrong.
 */
function unresolvedPlanDeficiency(
  lpaNo: string,
  raisedAtISO: string,
): ServiceDeficiency {
  return {
    reason: lpaNo
      ? `No plan on file under LPA ${lpaNo} — plan holder's ID not confirmed`
      : "No plan number on the endorsement — plan holder's ID not confirmed",
    raisedAtISO,
  };
}

/**
 * What kind of disagreement is holding a service.
 *
 * THE RULE AS IT NOW STANDS (2026-08-25). A discrepancy is named two ways, and
 * the FIRST of them is the name:
 *
 * `NAME`    the plan holder on the endorsement is not the plan holder on file.
 *           IT CANNOT HAPPEN AT AN OWNED CHAPEL — an owned chapel endorses
 *           through the system, so the name it sends is the plan's own and has
 *           nothing to disagree with. It is a FRANCHISE that sends paper, and
 *           paper carries whatever the family said at the counter. Read off two
 *           real columns: `TblICIS_Billing_Processed.Planholder`, which the
 *           source keeps independent for exactly this check, against the plan.
 * `ROP`     the plan was returned as premium — termination status FR or RP.
 *           There was nothing left to render service against, because the plan
 *           holder had already taken the money back. The other half of the rule
 *           as it is written.
 *
 * AND TWO THE EARLIER RULES NAMED, kept at the user's instruction (2026-08-25)
 * although the latest text does not repeat them. Both are the same shape as ROP
 * — a plan that was never one the company owed a service on:
 *
 * `CLAIMED` the plan has already been claimed — serviced under an earlier claim,
 *           most often by ANOTHER BRANCH. One plan buys one funeral, so the
 *           second service was never owed.
 * `UNPAID`  the account never reached fully paid, so the plan had not yet earned
 *           the service it was bought for. The other half of the serviceability
 *           rule: `AcctStatCode` must be FP.
 *
 * NONE OF THEM IS CLEARED BY SENDING FOR A DOCUMENT, which is the whole
 * distinction from a deficiency: something on record has to be corrected first.
 * And none of them holds up the REST of the billing — the other plan holders are
 * processed without waiting.
 */
export type DiscrepancyKind = "CLAIMED" | "ROP" | "UNPAID" | "NAME";

/** A disagreement holding one service. See {@link DiscrepancyKind}. */
export interface ServiceDiscrepancy {
  kind: DiscrepancyKind;
  /** What disagrees, in a sentence a processor can act on. */
  reason: string;
  /**
   * The name the chapel endorsed, when the kind is `NAME`. Kept beside the
   * reason so the two names can be shown against each other.
   */
  endorsedName?: string;
  /**
   * Who serviced the plan the FIRST time, when the kind is `CLAIMED` — the
   * branch code of the earlier claim.
   *
   * Carried rather than folded into {@link reason} alone because it is the
   * answer to the processor's next question: the correction is a conversation
   * with that branch, and they have to be named to be rung.
   */
  claimedByBranchCode?: string;
  /** ISO date the discrepancy was raised. */
  raisedAtISO: string;
}

/** How each kind reads as a heading. */
export const DISCREPANCY_KIND_LABELS: Record<DiscrepancyKind, string> = {
  CLAIMED: "Already claimed",
  ROP: "Return of premium",
  UNPAID: "Account not fully paid",
  NAME: "Name mismatch",
};

/**
 * One service a chapel rendered for one deceased plan holder — a row of the
 * plan-holder table beside the chapel list, and the thing a Total CSP sums.
 */
export interface ServiceRecord {
  /** Stable id — chapel and plan, which is unique: a plan is serviced once. */
  id: string;
  /**
   * The billing this account is on — `TblICIS_Billing_Processed.BillingCode`.
   *
   * A COLUMN, not a derivation, which is the 2026-08-25 change. It used to be
   * worked out from the chapel and the report period every time a service was
   * grouped; now the row carries it, so a service and its billing cannot fall
   * out of step over a period boundary.
   */
  billingCode: string;
  /**
   * The death claim this service answers — what the termination is written
   * against, since `TblClaimsSP.ClaimNo` is that table's own key.
   *
   * Empty where there is no claim behind the service: a plan holder keyed in
   * from a franchise's paperwork was never filed through the system.
   */
  claimNo: string;
  /** Special (SC) or regular (RC), off the claim. Empty when there is none. */
  natureCode: string;
  /**
   * The CIS contract number — `TblICIS_Billing_Processed.ContractNo`, which the
   * source queries this table by. Falls back to the policy number while the
   * column has no format; see the record's own note in `models.ts`.
   */
  contractNo: string;
  /**
   * How the endorsement credits the service — one of
   * {@link CREDIT_OF_SERVICE_OPTIONS}, off
   * `TblICIS_Billing_Processed.CreditOfService`.
   *
   * IT IS A DEFAULT, NOT A VERDICT (user-confirmed 2026-08-25). The value comes
   * in with the request, and the processor is authorised to correct it — so the
   * record's field opens on this and stays editable rather than being shown
   * read-only.
   */
  creditOfService: string;
  chapelCode: string;
  lpaNo: string;
  /** The deceased, who in this data is also the plan holder — see below. */
  deceased: PersonName;
  /**
   * The plan holder of record.
   *
   * Every plan in the seed is held by the person it covers, so this is the same
   * name as {@link deceased}. It is carried separately all the same, because
   * the two are different columns in the source system and a plan bought for a
   * dependant would have them differ.
   */
  planholder: PersonName;
  planCode: string;
  /** e.g. "ST.GEORGE". */
  planDesc: string;
  dateOfDeathISO: string;
  /** When the branch filed the death claim — the service record's "Date Filed". */
  filedDateISO: string;
  /** The plan's effectivity date — the "Contract Date" column. */
  contractDateISO: string;
  /** When the chapel rendered the service. */
  serviceDateISO: string;
  /** The cut {@link serviceDateISO} falls in — when the work was DONE. */
  period: BillingPeriod;
  /**
   * The cut the chapel actually reported this service in — when it was BILLED.
   *
   * Usually the same as {@link period}, and deliberately a separate field
   * because it is not always: a chapel does not endorse a report of one or two
   * services if it can help it. A week that comes up short is carried into the
   * next transaction week and reported together, so a service rendered in the
   * first cut of June can appear on the second cut's billing.
   *
   * This is the one the billing is coded by, and it is read back OUT of
   * {@link billingCode} rather than worked out — the code is made of it. The
   * carry-forward rule itself now lives with the seed that writes those codes;
   * see `MIN_SERVICES_PER_REPORT` in `app/(pis)/data/billing-seed.ts`.
   */
  reportPeriod: BillingPeriod;
  /**
   * True while the chapel is still HOLDING this service, waiting for enough
   * others to make up a report.
   *
   * ALWAYS FALSE NOW, and kept because the state is real rather than because it
   * is reachable here. A held service has not been endorsed, so it never reached
   * `TblICIS_Billing_Processed` and this module cannot see it at all — where it
   * used to be a row this list carried and skipped, it is now a row that does
   * not exist. It becomes one the week the chapel's count is made up.
   */
  isHeld: boolean;
  /**
   * The CSP code this service is charged under — `RefMortuaryCSP`, matched on
   * the plan's description. See {@link cspCodeFor}.
   *
   * EMPTY IS POSSIBLE and means the plan names no row in the code list. The
   * service is then unpriced until the processor picks a code on the record.
   */
  cspCode: string;
  /**
   * Chapel service payable, in pesos — {@link cspCode} at the mortuary the
   * billing is raised against. See {@link cspAmountFor}.
   *
   * ZERO MEANS NOT PRICED, not free: either the plan resolved to no CSP code, or
   * the mortuary has no rate on file for the one it did. A processor's own
   * amount on the service record overrides this — see `getServiceBillings`.
   */
  csp: number;
  /** The branch that collects on the plan ("PHBranch"). */
  phBranchCode: string;
  /** The branch that handled the claim ("ServicingBranch"). */
  servicingBranchCode: string;
  /** Where the service transaction was recorded — the chapel itself. */
  trxPoint: string;
  /**
   * The plan holder's name AS THE CHAPEL ENDORSED IT.
   *
   * The same as {@link planholder} nearly always, and a separate field because
   * the times it is not are the whole point — a franchise's paperwork carries
   * whatever was written at the counter, and comparing the two is what raises
   * {@link discrepancy}. An owned chapel endorses through the system, so its
   * endorsed name is the plan's own by construction.
   */
  endorsedName: string;
  /** Whether the chapel that rendered this service is a franchise. */
  isFranchise: boolean;
  /**
   * Whether the processor keyed this service in by hand — the manual-franchise
   * path. See `ManualService` in the store.
   */
  isManual: boolean;
  /**
   * A requirement not yet complied with — a document, or the plan holder's ID.
   *
   * IT HOLDS NOTHING (2026-08-25). The service is on its billing, in the total
   * and terminable; this says what is still owed to the folder and who is being
   * asked for it. That is the whole difference between this and a
   * {@link discrepancy}: a deficient plan was always serviceable and something
   * is on its way, where a discrepant one is an account that should not have
   * been served at all.
   *
   * ABSENT ONCE IT HAS BEEN COMPLIED WITH — the document arrived.
   */
  deficiency?: ServiceDeficiency;
  /**
   * The compliance, when one has been recorded — what cleared
   * {@link deficiency}. Carried so the service can still say what happened to
   * it after the deficiency itself is gone, exactly as
   * {@link resolvedDiscrepancy} does for the other bucket.
   */
  compliedDeficiency?: CompliedDeficiency;
  /**
   * A disagreement holding this service — see {@link ServiceDiscrepancy}.
   *
   * ABSENT ONCE IT HAS BEEN PUT RIGHT. A correction clears it here, and where
   * the corrected service is then billed depends on whether its billing has
   * already gone to accounting — see {@link getSupplementaryItems}.
   */
  discrepancy?: ServiceDiscrepancy;
  /**
   * The correction, when one has been recorded — what cleared
   * {@link discrepancy}. Carried so the service can still say what happened to
   * it after the discrepancy itself is gone.
   */
  resolvedDiscrepancy?: ResolvedDiscrepancy;
}

/** One chapel's services for one period — the unit the queue is worked in. */
export interface ServiceBilling {
  /** Derived: chapel + cut + month + year. Always present. */
  billingCode: string;
  /** Minted when the billing is created. Absent means "For Process". */
  billingNo?: string;
  chapelCode: string;
  chapelDesc: string;
  territoryCode: string;
  period: BillingPeriod;
  /** "AUGUST 1-7, 2026". */
  periodLabel: string;
  /**
   * The company that owes it — `TblBillingHdr.Company`, carried through so a
   * billing created here writes back the same string its header holds.
   */
  company: string;
  stage: BillingStage;
  /** The chapel is a franchise — this billing follows the franchise process. */
  isFranchise: boolean;
  /**
   * The chapel is a franchise that cannot use the system, so its plan holders
   * are keyed in by hand rather than arriving with the endorsement.
   */
  isManualFranchise: boolean;
  /**
   * The billing has been endorsed to accounting and can no longer be reopened.
   * See {@link isEndorsedToAccounting}.
   */
  isEndorsed: boolean;
  /**
   * The services ON this billing — everything the chapel is owed for.
   *
   * That is every service without a DISCREPANCY, outstanding paperwork
   * included. A requirement not yet complied with does not take a chapel's
   * payable off the billing; see {@link deficient}.
   */
  services: ServiceRecord[];
  /**
   * Services waiting on a requirement — a document, or the plan holder's ID.
   *
   * A SUBSET OF {@link services} AND NOT A BUCKET BESIDE IT (2026-08-25). These
   * are billed, terminated and counted in {@link totalCSP} like any other; the
   * list exists so the queue can say what is outstanding and to whom the notice
   * goes. Adding this length to `services.length` counts the same rows twice.
   */
  deficient: ServiceRecord[];
  /**
   * Services HELD — an account that violates the rules and should not have been
   * served. See {@link ServiceDiscrepancy}.
   *
   * The only kind of hold there is. Not counted in {@link totalCSP}, and
   * deliberately NOT a bar on the billing moving either: the rest of the plan
   * holders are processed without waiting.
   *
   * A service with both a discrepancy and outstanding paperwork is here and not
   * in {@link services} — the discrepancy is what decides whether it is billed
   * at all, so it is the one that names the bucket.
   */
  discrepant: ServiceRecord[];
  /** Sum of the billable services' CSP. */
  totalCSP: number;
  /** How many of {@link services} have had their plan terminated. */
  terminatedCount: number;
  /**
   * Who created the billing — and, once it is past For Process, who processed
   * it: the two are the same person, because creating the billing and
   * terminating the plans under it are one sitting at one screen.
   *
   * Absent until the billing has been created. A billing with no number has
   * nobody's name on it yet.
   */
  processedBy?: string;
}

/** A territory as the dashboard's cards show it, for one stage. */
export interface TerritorySummary {
  territoryCode: string;
  /** e.g. "BICOL TERRITORY". */
  description: string;
  /**
   * Distinct chapels with a billing at this stage.
   *
   * The dashboard counts CHAPELS and not billings, and the two are not quite
   * the same number: a chapel that reports a service late gets a second billing
   * for the same month in a different cut, so a territory can have more
   * billings than chapels. That distinction is real and the workspace shows it
   * — every billing is its own row there — but it is noise at this altitude,
   * where the question is only which territory to open. One chapel, one line.
   */
  chapelCount: number;
  /**
   * How {@link chapelCount} splits by who runs the chapel.
   *
   * TWO FIGURES AND NOT A RATIO, because they are two different queues of work
   * rather than one queue cut two ways. An owned chapel's billing arrives with
   * its services on it and is processed; a franchise's may have to be created
   * empty and keyed in from paper (see `canAddManualService`), and its
   * endorsements are the ones whose names disagree with the plan. A territory
   * with four franchises is a territory with four of the slow kind, and that is
   * worth knowing before opening it — which is why these are columns on the
   * dashboard and not a detail inside.
   *
   * They sum to `chapelCount`: every chapel is one or the other.
   */
  franchiseCount: number;
  ownedCount: number;
  /** Billable services across those billings. */
  serviceCount: number;
  /** Services waiting on a requirement across those billings. On the billing —
   * see `ServiceBilling.deficient`; this is a marker, not a deduction. */
  deficientCount: number;
  /** Services HELD by a discrepancy across those billings — off the billing. */
  discrepantCount: number;
  totalCSP: number;
}

/**
 * One processor's billings at a stage — the row the dashboard shows once work
 * has been put through. See {@link isProcessorStage}.
 */
export interface ProcessorSummary {
  /** The name as it is stamped on the billing, e.g. "MARITES BELIESTA". */
  processor: string;
  /**
   * Billings at this stage with this name on them.
   *
   * Counted rather than the chapels, which is the opposite of what
   * {@link TerritorySummary} does — and deliberately. A territory is a place and
   * its chapels are what it holds; a processor is a person and BILLINGS are what
   * they put through, one at a time, whichever chapel each belongs to.
   */
  billingCount: number;
  /** Distinct chapels across those billings. */
  chapelCount: number;
  /** How many territories the work spans — the reach of what they handled. */
  territoryCount: number;
  /** Billable services across those billings. */
  serviceCount: number;
  /**
   * Services waiting on a requirement across those billings. On the billing —
   * see `ServiceBilling.deficient`; this is a marker, not a deduction.
   *
   * NON-ZERO AT EVERY STAGE, and that changed with the 2026-08-18 rules. It used
   * to be nought everywhere the dashboard groups this way, because nothing could
   * leave For Process while anything was outstanding against it. Now the rest of
   * a billing's plan holders are processed without waiting, so a Processed
   * billing carrying an unanswered deficiency is the ordinary case rather than a
   * contradiction. See the `complete` rule in {@link getServiceBillings}.
   */
  deficientCount: number;
  /** Services HELD by a discrepancy across those billings — off the billing. */
  discrepantCount: number;
  totalCSP: number;
}

/** The figures at the top of the dashboard, for one stage. */
export interface StageTotals {
  totalCSP: number;
  /** Distinct chapels with work at this stage. */
  chapels: number;
  services: number;
  /**
   * Services waiting on a requirement at this stage — counted in
   * {@link services} as well, because they are ON the billing.
   *
   * NON-ZERO AT ANY STAGE. Until the 2026-08-18 rules this could only ever
   * appear at "For Process", because a billing did not move while anything was
   * outstanding against it; now the remaining plan holders go through without
   * waiting and whatever is unanswered travels with the billing. The overview
   * shows it on every tab.
   */
  deficient: number;
  /** Services HELD by a discrepancy at this stage — not in {@link services}. */
  discrepant: number;
  /** Distinct people whose name is on a billing at this stage. */
  processors: number;
}

/* ============================== the CSP rule ============================== */
//
// THE RULE LANDED ON 2026-08-26 and this section is what it replaced: a ladder
// of eight plausible pesos, dealt out by a service's position in the table,
// which is what stood here for as long as no table priced anything. Two arrived
// together and between them they answer it — `RefMortuaryCSP` and
// `RefMortuaryCSPRate`, both in the shared data layer where every other genuine
// reference table lives.
//
// IT IS TWO LOOKUPS AND NOT ONE, which is the shape of the rule:
//
//   the PLAN says which code    — "ST.CLAIRE" is SC, off `RefMortuaryCSP`
//   the MORTUARY says how much  — SC at GME2-01 is ₱31,000, off the rate table
//
// So the amount is not a property of the plan at all. The same plan is worth
// different money at two funeral homes, because the rate is a term of the
// mortuary's own contract — which is why a service cannot be priced until it is
// known which mortuary the billing is raised against, and why
// {@link defaultMortCodeFor} exists for the queue that has not got that far.
//
// A ZERO IS NOT A PRICE anywhere below. Both lookups can come up empty — a plan
// that names no CSP row, a mortuary with no rate for the one it does — and the
// number a service carries then is zero only because a total has to add up. What
// it means is "not priced yet", which is what `formatServiceCSP` prints as a
// dash and what the processor answers on the record.

/**
 * The CSP code a plan is charged under — step one.
 *
 * Empty where the plan's description names no CSP row. That is an answer and not
 * a failure: the record's dropdown opens unanswered and the processor picks,
 * which is better than a near miss picked here. See `getCSPCodeForPlan`.
 */
export function cspCodeFor(planDesc: string): string {
  return db.getCSPCodeForPlan(planDesc) ?? "";
}

/**
 * What a CSP code is worth at a mortuary — step two, straight off the rate
 * table.
 *
 * UNDEFINED WHERE THERE IS NO RATE, which happens three ways and all of them are
 * ordinary: the plan named no CSP code, the chapel has no mortuary of its own so
 * there is nothing to price against yet, or the mortuary has no rate on file for
 * that plan. None of the three is zero, and keeping them apart from zero is the
 * point — a caller building a TOTAL falls back to zero because a total has to
 * add up, and the record's form leaves the field alone for the processor.
 */
export function cspAmountFor(
  mortCode: string,
  cspCode: string,
): number | undefined {
  if (!mortCode || !cspCode) return undefined;
  return db.getCSPRate(mortCode, cspCode);
}

/**
 * The mortuary a chapel's services are priced against BEFORE its billing exists.
 *
 * A service in the For Process queue has no billing row yet, so it has no
 * mortuary — and a queue that showed every payable as ₱0 until somebody opened
 * the create dialog would be useless for deciding which chapel to open. This is
 * the mortuary that dialog will itself open on ({@link getMortuariesForChapel}'s
 * first), so the figure the queue shows is the figure the billing will carry
 * unless the processor chooses otherwise.
 *
 * Once the billing IS created the real choice takes over; see
 * {@link getBillingMortCode} — and the two agree by construction, because the
 * seed writes this same designation into the row it raises.
 */
export function defaultMortCodeFor(chapelCode: string): string {
  return db.getDesignatedMortCode(chapelCode);
}

/**
 * FALSE SINCE 2026-08-26 — the amount is read from `RefMortuaryCSPRate` now
 * rather than invented, so the dashboard stops calling its totals provisional.
 * Kept as a constant rather than deleted with its uses: it is the flag this
 * module raises whenever a figure on it is a stand-in, and it has been raised
 * once already.
 */
export const CSP_RULE_PENDING = false;

/* ============================== derivation ============================== */

/**
 * A small, stable hash of a string — used only to spread derived values (which
 * chapel served a plan, which service is deficient) evenly and repeatably.
 * Never for identity, and nothing depends on the exact numbers it returns.
 */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** ISO date `n` days after the given one. */
function daysAfter(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DEFICIENCY_REASONS = [
  "Registered Death Certificate not attached",
  "LPA copy missing",
  "Service contract unsigned",
  "Interment date not indicated",
  "Chapel service invoice not attached",
  "Valid ID of plan holder missing",
];

/**
 * STAND-IN: one service in every seven is missing a document.
 *
 * There is no deficiency table yet. Seven is chosen to be a visible minority —
 * enough that the deficiency section is never empty in a territory being worked,
 * few enough that it does not read as the normal case.
 */
const DEFICIENT_EVERY = 7;

/* ============================ discrepancies ============================ */

/**
 * Whether the name a chapel endorsed disagrees with the plan holder on file.
 *
 * Compared on the WHOLE name, case- and punctuation-insensitively, because the
 * two sides are typed by different people in different places: a franchise
 * writing "Ma. Corazon Almeda" and a plan reading "MA CORAZON ALMEDA" is not a
 * discrepancy, and raising one would bury the real mismatches under noise.
 * Anything left after that — a different surname, a missing given name, a
 * different person entirely — is a genuine disagreement.
 */
function namesDisagree(endorsed: string, onFile: string): boolean {
  const normalise = (name: string) =>
    name
      .toUpperCase()
      .replace(/[.,]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .join(" ");
  return normalise(endorsed) !== normalise(onFile);
}

/**
 * STAND-IN: which branch serviced the plan the FIRST time — see
 * {@link ALREADY_CLAIMED}.
 *
 * THE BRANCH THAT COLLECTS ON THE PLAN, when that is not the branch that filed
 * this claim. That pairing is what a double-claim actually looks like: the plan
 * was sold and paid for at one branch, the family died somewhere else, and a
 * chapel in the second place serviced it without the first knowing it had
 * already been serviced there. Both branch codes are real facts on the service —
 * `phBranchCode` off the payment ledger, `servicingBranchCode` off the claim
 * request — so the row names two branches that genuinely have a relationship to
 * this plan rather than an invented one.
 *
 * Returns nothing when the two are the same branch, which is most services: one
 * branch cannot claim against itself twice without noticing, and a discrepancy
 * naming the servicing branch as the culprit would read as nonsense.
 */
function earlierClaimBranch(
  phBranchCode: string,
  servicingBranchCode: string,
): string | undefined {
  if (!phBranchCode || phBranchCode === servicingBranchCode) return undefined;
  return phBranchCode;
}

/**
 * The discrepancy holding a service, if any — the one rule, in one place.
 *
 * ORDER MATTERS, and it is not the order the rules NAME the kinds in. The plan's
 * own status is checked before the name, because a plan returned as premium is
 * not serviceable whatever it is called: correcting the spelling of a name on an
 * ROP plan would clear the wrong thing and leave a processor thinking the
 * payable was ready. A service can only carry one of these at a time, and the
 * one it carries is the one that has to be answered first.
 *
 * A PLAN NUMBER THAT RESOLVES TO NOTHING IS NOT A DISCREPANCY, and that is the
 * 2026-08-25 correction. It used to return one here, on the reasoning that "no
 * plan to pay against" was the worst version of "should not have been serviced".
 * It is not a version of it at all: a discrepancy is AN ACCOUNT THAT VIOLATES
 * THE RULES, and an account nobody can find has not violated anything — what is
 * missing is the plan holder's ID on the paperwork. That is a requirement not
 * complied with, which is a DEFICIENCY: it is answered by asking the branch for
 * the number and it clears when the number arrives, which is exactly the View /
 * Send pair a deficiency carries and a discrepancy must not.
 *
 * So this returns nothing for a plan that does not resolve — including for the
 * name check, which has nothing to compare against — and the caller raises the
 * deficiency instead. See {@link unresolvedPlanDeficiency}.
 */
function discrepancyFor(
  planholder: Planholder | undefined,
  endorsedName: string,
  onFileName: string,
  raisedAtISO: string,
  claimedByBranchCode?: string,
): ServiceDiscrepancy | undefined {
  if (!planholder) return undefined;

  // ALREADY CLAIMED OUTRANKS EVERYTHING, because it is the only one of these
  // where a SECOND company has already been paid for the same plan. Whatever
  // else is wrong with the record, the money question is settled first and it
  // is settled with the other branch, not by correcting anything here.
  if (claimedByBranchCode) {
    const branch = db.getBranch(claimedByBranchCode);
    return {
      kind: "CLAIMED",
      reason: `Plan already serviced under an earlier claim by ${
        branch?.description ?? claimedByBranchCode
      }`,
      claimedByBranchCode,
      raisedAtISO,
    };
  }

  const block: ServiceBlockReason | undefined = planholder.serviceBlock;
  if (block === "rop") {
    return {
      kind: "ROP",
      reason: `Plan returned as premium — ${planholder.terminationStatus}`,
      raisedAtISO,
    };
  }
  if (block === "not-paid") {
    return {
      kind: "UNPAID",
      reason: `Account is ${planholder.accountStatusLabel}, not Fully Paid`,
      raisedAtISO,
    };
  }

  if (namesDisagree(endorsedName, onFileName)) {
    return {
      kind: "NAME",
      reason: `Endorsed as "${endorsedName}" — plan holder on file is "${onFileName}"`,
      endorsedName,
      raisedAtISO,
    };
  }

  return undefined;
}

/**
 * STAND-IN: how many services in the queue are a SECOND claim on a plan another
 * branch has already serviced. ONE.
 *
 * It is a stand-in and not a rule read off the data because the data cannot
 * express it yet: every plan in the seed carries at most one death claim, from
 * one branch, and no plan carries a SERVICED termination status (SA / SP) — so
 * there is nothing on file that says "this one has been claimed before".
 * Representing it properly needs either a second death claim against a plan or a
 * serviced status on one, and both of those live in the shared seed.
 *
 * So one service in the queue is nominated here instead. When the seed can say
 * it, this constant and `earlierClaimBranch` come out and the rule reads the
 * plan's own history — `discrepancyFor` does not change at all, because it
 * already takes the answer rather than working it out.
 *
 * ONE, because a discrepancy of any kind happens about once in a thousand
 * services and one is the smallest number that keeps the path reachable: the
 * Resolve Discrepancy dialog, the mark on the row, the supplementary route for a
 * correction made after endorsement all need a single example to stand on.
 */
const ALREADY_CLAIMED = 1;

/* =============================== the services =============================== */

/**
 * The death claim this service answers — the earliest one filed against the
 * plan, since a plan is serviced once.
 *
 * `TblICIS_Billing_Processed` does not name a claim: it is an ICIS table and it
 * knows about policies, not claims. The claim is what the termination is written
 * against though (`TblClaimsSP.ClaimNo` is that table's own key), so the two are
 * joined here, on the plan.
 */
function claimFor(lpaNo: string) {
  const requests = db
    .getClaimRequestsByLpa(lpaNo)
    .filter((r) => r.claimType === "Death Claim");
  if (!requests.length) return undefined;

  const request = requests.reduce((earliest, r) =>
    r.fileDateISO < earliest.fileDateISO ? r : earliest,
  );
  return {
    fileDateISO: request.fileDateISO.slice(0, 10),
    claim: db.getDeathClaimByRequest(request.requestNo),
  };
}

/**
 * A name the source keeps as ONE STRING, read back into parts.
 *
 * Only for the deceased, and only when they are not the plan holder — every
 * other name in this module arrives already in parts from a `Person` record,
 * and this is never used on one of those. `TblICIS_Billing_Processed.
 * DeceasedName` is a single column with nobody behind it, so when it names
 * somebody the plan does not, this is the only reading available.
 *
 * FIRST / MIDDLE / LAST ON WHITESPACE, which is the shape every name in this
 * data actually has — "Purificacion Reyes Villaflor". It is a convention and
 * not a parser, and it is wrong about a compound surname ("Dela Cruz" would
 * read as a middle name and a last): the parts are used for the record form's
 * two name fields, where the processor can see and correct them, and the tables
 * print the string whole via {@link deceasedName}. A real system keeps the parts
 * and does not have to guess; this one has one column and one row using it.
 */
function splitFullName(full: string): PersonName {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: full };
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : undefined,
    lastName: parts[parts.length - 1],
  };
}

/**
 * One row of `TblICIS_Billing_Processed`, read as a service.
 *
 * WHAT IS ON THE ROW and what is looked up around it. The chapel, the endorsed
 * name, the branches, the plan, the date of death and the billing code are
 * columns. The plan holder's own name, their plan code and the contract date are
 * read off the plan the policy number names — which may resolve to nothing, and
 * that is a discrepancy rather than an error: `PolicyNo` is text with no foreign
 * key behind it.
 *
 * `index` is the row's position in the table, and it decides the one thing this
 * module still has to invent: which services are short a document
 * ({@link DEFICIENT_EVERY}). It used to decide the AMOUNT as well — that is off
 * a reference table since 2026-08-26, see the CSP rule above.
 */
function toServiceRecord(
  row: BillingProcessed,
  index: number,
  id: string,
  claimedByBranchCode?: string,
): ServiceRecord {
  const planholder = row.planholder;
  const name = planholder?.name;
  const onFileName = name ? toFullName(name) : "";
  // A plan that resolves gives a name in parts; one that does not leaves only
  // the string the chapel endorsed, which is still the best answer available.
  const holderName: PersonName = name ?? {
    firstName: "",
    lastName: row.deceasedName,
  };

  /**
   * THE DECEASED, WHO IS USUALLY THE PLAN HOLDER AND SOMETIMES IS NOT.
   *
   * The two were one field here until 2026-08-26 — `planholder: deceased` — and
   * on the data that existed then it was even true. `TblICIS_Billing_Processed`
   * has always had both columns, deliberately independent so they can be checked
   * against each other, and a plan ASSIGNED to bury somebody else (termination
   * status `SA`) is the case that makes them differ.
   *
   * So the plan's own name is the PLAN HOLDER, and the row's `deceasedName` is
   * the DECEASED — read back into parts, since the source keeps it as one
   * string. Where they agree, which is nearly always, the plan's parts are used
   * as they were before rather than the split of a string that was built from
   * them: a round trip that can only lose.
   */
  const deceased: PersonName =
    name && row.deceasedName !== onFileName
      ? splitFullName(row.deceasedName)
      : holderName;

  const serviceDateISO = row.serviceDateISO;
  const raisedAtISO = daysAfter(serviceDateISO, 2);
  const filed = claimFor(row.policyNo);

  // OFF THE ROW'S OWN PLAN COLUMN and not off the plan holder's, deliberately:
  // `Plan` is what the chapel endorsed and it is there whether or not `PolicyNo`
  // resolves to anything. A service whose plan is not on file is still priced.
  const cspCode = cspCodeFor(row.plan);

  return {
    id,
    billingCode: row.billingCode,
    claimNo: filed?.claim?.claimNo ?? "",
    natureCode: filed?.claim?.natureCode ?? "",
    contractNo: row.contractNo,
    creditOfService: row.creditOfService,
    chapelCode: row.chapelCode,
    lpaNo: row.policyNo,
    deceased,
    planholder: holderName,
    planCode: planholder?.planCode ?? "",
    planDesc: row.plan,
    dateOfDeathISO: row.dateOfDeathISO,
    filedDateISO: filed?.fileDateISO ?? row.dateOfDeathISO,
    contractDateISO:
      planholder?.effectivityDate.toISOString().slice(0, 10) ?? "",
    serviceDateISO,
    period: periodOf(serviceDateISO),
    // The period the billing is FOR, taken back out of its code — see
    // `periodFromBillingCode`. It is the report week rather than the service
    // week whenever a chapel carried a short week forward, which is the whole
    // reason the two are separate fields.
    reportPeriod:
      periodFromBillingCode(row.billingCode, row.chapelCode) ??
      periodOf(serviceDateISO),
    isHeld: false,
    cspCode,
    // PRICED AGAINST THE CHAPEL'S LIKELY MORTUARY, because this row is built at
    // import and a For Process service has no billing yet to name a real one.
    // `getServiceBillings` re-prices it against the billing's own the moment
    // there is one; see {@link defaultMortCodeFor}.
    csp: cspAmountFor(defaultMortCodeFor(row.chapelCode), cspCode) ?? 0,
    phBranchCode: row.phBranch,
    servicingBranchCode: row.servicingBranch,
    trxPoint: row.chapelCode,
    endorsedName: row.endorsedName,
    isFranchise: row.chapel?.isFranchise ?? false,
    isManual: false,
    discrepancy: discrepancyFor(
      planholder,
      row.endorsedName,
      onFileName,
      raisedAtISO,
      claimedByBranchCode,
    ),
    // A PLAN THAT DOES NOT RESOLVE OUTRANKS THE STAND-IN, and it is the only
    // deficiency here that is read off the data rather than invented: the plan
    // holder's ID has not been confirmed, so nothing else about the folder can
    // be assessed yet. See {@link unresolvedPlanDeficiency}.
    deficiency: !planholder
      ? unresolvedPlanDeficiency(row.policyNo, raisedAtISO)
      : index % DEFICIENT_EVERY === 0
        ? {
            reason:
              DEFICIENCY_REASONS[hash(row.policyNo) % DEFICIENCY_REASONS.length],
            raisedAtISO,
          }
        : undefined,
  };
}

/**
 * Every service on file: one per row of `TblICIS_Billing_Processed`, in the
 * table's own order.
 *
 * THAT TABLE IS THE LIST OF SERVICES ALREADY RENDERED, which is why nothing is
 * filtered out of it here. A service the chapel is still holding for a fuller
 * report never reached the table in the first place — it has not been endorsed,
 * so the source system has never heard of it. See `billing-seed.ts`.
 *
 * One row per PLAN, not per person: a plan holder who held three plans has three
 * rows, because terminating a plan is what puts a service into a billing and
 * each of those plans is terminated separately. One funeral therefore appears
 * three times, and each of the three is priced — `RefMortuaryCSPRate` is keyed by
 * mortuary and CSP CODE, so three plans of three kinds carry three rates and
 * nothing in either table says a funeral is charged once. That reading follows
 * from the tables rather than being decided here; it is the one thing about the
 * CSP rule the drop does not state outright.
 *
 * Built once, at import, and read by everything: the store is overlaid on top in
 * {@link getServiceBillings} rather than written back into this.
 */
const services: ServiceRecord[] = (() => {
  const rows: ServiceRecord[] = [];

  /** How many second-claims have been let through — see {@link ALREADY_CLAIMED}. */
  let alreadyClaimed = 0;

  /**
   * How many rows each chapel-and-plan pair has had.
   *
   * THE ID HAS TO BE UNIQUE and the pair nearly always is: a plan is serviced
   * once, so one chapel has one row for it. Nearly. Two rows for the same plan
   * at the same chapel are what a franchise sending an endorsement twice looks
   * like, and the id is what the service record, its documents and its
   * termination are all keyed on — so a second row must not quietly become the
   * first one again. The first keeps the plain id and each repeat is numbered.
   */
  const seen = new Map<string, number>();

  for (const row of db.getBillingProcessed()) {
    const onFileName = row.planholder?.name
      ? toFullName(row.planholder.name)
      : "";

    // A SECOND CLAIM ON A PLAN THAT HAS ALREADY BEEN SERVICED — see
    // {@link ALREADY_CLAIMED}, and `earlierClaimBranch` for which branch is
    // named as having had it first. Only where the plan is otherwise sound:
    // stacking this on top of an ROP or a mismatched name would hide one
    // discrepancy behind another and leave the queue with fewer distinct
    // examples than it has kinds.
    const earlierBranch =
      alreadyClaimed < ALREADY_CLAIMED &&
      row.planholder &&
      !row.planholder.serviceBlock &&
      !namesDisagree(row.endorsedName, onFileName)
        ? earlierClaimBranch(row.phBranch, row.servicingBranch)
        : undefined;
    if (earlierBranch) alreadyClaimed += 1;

    const pair = `${row.chapelCode}-${row.policyNo}`;
    const repeat = seen.get(pair) ?? 0;
    seen.set(pair, repeat + 1);

    rows.push(
      toServiceRecord(
        row,
        rows.length,
        repeat === 0 ? pair : `${pair}-${repeat + 1}`,
        earlierBranch,
      ),
    );
  }

  return rows;
})();


/* ========================== the franchise path ========================== */

/*
 * TWO KINDS OF FRANCHISE, AND ONLY ONE OF THEM IS ON THIS SCREEN
 * (user-confirmed 2026-08-24).
 *
 *   ON THE SYSTEM   endorses through the system like any company-owned chapel.
 *                   Its services are derived, its billing code is derived from
 *                   its chapel code and period, and the plan holders are already
 *                   in the request. Nothing about the process differs — the
 *                   billing code says it is a franchise (see
 *                   {@link FRANCHISE_CODE_SUFFIX}) and that is the whole of it.
 *
 *   ON PAPER        cannot use the system at all, and therefore HAS NO BILLING
 *                   CODE. There is nothing to derive one from: no endorsement,
 *                   no request, no period on file. The processor searches the
 *                   MORTUARY CODE in the franchise module, mints a billing
 *                   number directly, and keys the plan holders in one at a time
 *                   off the hard copies the franchise submitted.
 *
 * THE SECOND ONE IS NOT WORKED HERE. This workspace is picked through by
 * territory and then by billing code, and a paper franchise has neither in a
 * form this screen could offer — a row for one would be an entry with no code,
 * inviting the wrong process.
 *
 * WHAT WAS HERE UNTIL NOW: an empty billing per paper franchise per period,
 * seeded into the For Process list so its plan holders could be keyed in from
 * the workspace. That was built on the assumption that a paper franchise's
 * billing is the same object as everyone else's, only empty. It is not — it has
 * no code — so the seeding is gone and the entries with it.
 *
 * The machinery those entries used is NOT gone: `addManualService`, its dialog,
 * and the rule in `canAddManualService` that plan holders may only be keyed in
 * once a billing number exists. That order is exactly the one the franchise
 * module needs — number first, then plan holders one at a time — so it waits
 * here rather than being rewritten from scratch. What that module has to add is
 * a billing identified by its NUMBER rather than by a code, and a mortuary
 * search to mint it against.
 */

/**
 * Turn a plan holder keyed in by hand into a service the rest of this module
 * cannot tell from a derived one.
 *
 * THAT IS THE WHOLE DESIGN, and it is the rule rather than a convenience: a
 * franchise that cannot use the system submits its paperwork manually, and the
 * process from there is the same. So a manual row goes through the same
 * discrepancy check, sits in the same buckets, is terminated by the same button
 * and counts towards the same completion rule. The only thing that differs is
 * how the row arrived, which {@link ServiceRecord.isManual} records so the UI
 * can say so and so it can be taken back off again.
 *
 * WHAT IS LOOKED UP AND WHAT IS TYPED. Everything except the endorsed name, the
 * dates and the plan number is read off the plan — the processor is keying in
 * WHICH plan was serviced, not re-entering the plan.
 *
 * A NUMBER THAT RESOLVES TO NOTHING STILL PRODUCES A ROW — losing the entry
 * would lose the only record that the franchise sent it — and that row carries a
 * DEFICIENCY rather than a discrepancy. The plan holder's ID has not been
 * confirmed, which is a requirement to comply with and not an account that broke
 * a rule, so the answer is to send for the number. See
 * {@link unresolvedPlanDeficiency}; this is the case it exists for.
 */
function toManualServiceRecord(manual: ManualService): ServiceRecord {
  const planholder = db.getPlanholder(manual.lpaNo);
  const name = planholder?.name;
  const onFileName = name ? toFullName(name) : "";

  const chapel = db.getChapel(manual.chapelCode);
  const period = periodOf(manual.serviceDateISO);

  // No claim was filed through the system, so there is no requesting branch to
  // read: the chapel's own territory is the nearest true answer, and the branch
  // that collects on the plan is still on its payment ledger.
  const phBranchCode = db.getPayments(manual.lpaNo)[0]?.branchCode ?? "";
  const servicingBranchCode =
    phBranchCode ||
    db.getBranchesByTerritory(chapel?.territoryCode ?? "")[0]?.branchCode ||
    "";

  const blank: PersonName = { firstName: "", lastName: manual.endorsedName };
  const manualCSPCode = cspCodeFor(planholder?.planDesc ?? "");

  return {
    id: manual.id,
    // The billing it was keyed in AGAINST. A manual row has no
    // `TblICIS_Billing_Processed` row behind it to read one off — the processor
    // chose it, which is the whole of what a paper endorsement amounts to.
    billingCode: manual.billingCode,
    // Nothing was filed through the system, so there is no claim to answer and
    // no nature to read off one. The contract number is the policy, as it is
    // everywhere else while that column has no format.
    claimNo: "",
    natureCode: "",
    contractNo: manual.lpaNo,
    // Nothing was endorsed through the system, so no credit came with it — the
    // processor picks one on the record. See `SERVICE_RECORD_DEFAULTS`.
    creditOfService: "",
    chapelCode: manual.chapelCode,
    lpaNo: manual.lpaNo,
    // Falls back to the endorsed name when the plan does not resolve, so the row
    // still says who the franchise buried rather than rendering blank.
    deceased: name ?? blank,
    planholder: name ?? blank,
    endorsedName: manual.endorsedName,
    isFranchise: chapel?.isFranchise ?? true,
    isManual: true,
    planCode: planholder?.planCode ?? "",
    planDesc: planholder?.planDesc ?? "—",
    dateOfDeathISO: manual.dateOfDeathISO,
    // The franchise's paperwork IS the filing — there is no earlier date to
    // read, because nothing was filed through the system.
    filedDateISO: manual.addedAtISO.slice(0, 10),
    contractDateISO:
      planholder?.effectivityDate.toISOString().slice(0, 10) ?? "",
    serviceDateISO: manual.serviceDateISO,
    period,
    // Keyed in from the paperwork in front of the processor, so it is reported
    // in the period it is being billed in. Nothing is held on this path.
    reportPeriod: period,
    isHeld: false,
    // Off the PLAN, which a manual row only has if its number resolved. One that
    // did not is unpriced, and the deficiency below is what says why: the plan
    // holder's ID has not been confirmed, so there is nothing to price yet.
    cspCode: manualCSPCode,
    csp: cspAmountFor(defaultMortCodeFor(manual.chapelCode), manualCSPCode) ?? 0,
    phBranchCode,
    servicingBranchCode,
    trxPoint: manual.chapelCode,
    discrepancy: discrepancyFor(
      planholder,
      manual.endorsedName,
      onFileName,
      manual.addedAtISO,
    ),
    // The number off the hard copy names no plan — see the note above.
    deficiency: planholder
      ? undefined
      : unresolvedPlanDeficiency(manual.lpaNo, manual.addedAtISO),
  };
}

/**
 * Every billing on file: the services grouped by chapel and period, with the
 * store's created billings laid over the top.
 *
 * Rebuilt on each call rather than cached, because the store's contents are
 * part of the answer — call it from a component that also calls
 * `useServicePayablesStore()`.
 */
export function getServiceBillings(): ServiceBilling[] {
  const groups = new Map<string, ServiceRecord[]>();
  /**
   * What each billing IS — its chapel and its period — kept beside the group
   * rather than read off its first service.
   *
   * Because a group can be EMPTY. A manual franchise's billing starts with
   * nothing on it, and `group[0].chapelCode` on an empty array is how that ends
   * as a crash rather than as an empty table.
   */
  const meta = new Map<
    string,
    { chapelCode: string; period: BillingPeriod; company: string }
  >();

  // EVERY BILLING CODE ON FILE, whether or not anything hangs off it — the rows
  // of `TblBillingHdr`. Taken first and taken whole, because the header is what
  // says a billing exists: a code is not something this module works out from
  // the services it can see.
  for (const hdr of db.getBillingHdrs()) {
    const period = periodFromBillingCode(hdr.billingCode, hdr.chapelCode);
    if (!period) continue;
    meta.set(hdr.billingCode, {
      chapelCode: hdr.chapelCode,
      period,
      company: hdr.company,
    });
    groups.set(hdr.billingCode, []);
  }

  // Then the accounts under each code. Grouped by the code the account CARRIES
  // rather than by the week its service happened in — a short week carried
  // forward was reported, and therefore billed, in the week it was carried into.
  for (const service of services) {
    groups.get(service.billingCode)?.push(service);
  }

  // Plan holders keyed in by hand go on the billing they were keyed in against,
  // which is the whole of what a manual franchise's endorsement amounts to. They
  // are never held: the processor has the paperwork in front of them, so there
  // is no waiting for the chapel to make up a report.
  //
  // A manual row can name a billing that has no derived services at all — which
  // is the ordinary case for a franchise that has never endorsed through the
  // system, and the reason this creates the group rather than only adding to it.
  for (const manual of getManualServices()) {
    const row = toManualServiceRecord(manual);
    meta.set(manual.billingCode, {
      chapelCode: row.chapelCode,
      period: row.reportPeriod,
      // A paper franchise's billing has no header row to read a company off —
      // it was never endorsed through the system. There is one company.
      company:
        db.getBillingHdr(manual.billingCode)?.company ?? BILLING_COMPANY,
    });
    const group = groups.get(manual.billingCode);
    if (group) group.push(row);
    else groups.set(manual.billingCode, [row]);
  }

  // NO EMPTY BILLING FOR A PAPER FRANCHISE, which is where one used to be
  // seeded — one per chapel per period, so the workspace had somewhere to key
  // its plan holders in. A paper franchise has no billing code at all, so there
  // was nothing for those rows to be; see the note at the top of "the franchise
  // path". They are created by number in the franchise module instead.

  const billings: ServiceBilling[] = [];
  let billedIndex = 0;

  // Newest period first, which is also the order the queue is worked in.
  const codes = [...groups.keys()].sort((a, b) =>
    periodKey(meta.get(b)!.period).localeCompare(periodKey(meta.get(a)!.period)),
  );

  for (const billingCode of codes) {
    const seeded = groups.get(billingCode)!;
    const { chapelCode, period, company } = meta.get(billingCode)!;
    const chapel = db.getChapel(chapelCode);

    // THE MORTUARY THIS BILLING IS RAISED AGAINST, which is what prices every
    // service on it — a rate is a term of the mortuary's contract, so the same
    // plan is worth different money under a different one. Nothing until the
    // billing is created, and the chapel's likeliest stands in until then: see
    // {@link defaultMortCodeFor}, which is also what the create dialog opens on.
    const mortCode =
      getBillingMortCode(billingCode) || defaultMortCodeFor(chapelCode);

    // A saved service record overrides the derived CSP, so the amount a
    // processor typed on the record is the amount the billing totals. Copied
    // rather than written back: `services` is built once at import and read by
    // everything, and a store overlay must not edit what it overlays.
    //
    // Only the amount. Everything else the record carries is the record's own
    // and is read from the store where it is shown.
    //
    // A discrepancy PUT RIGHT is lifted here for the same reason: the correction
    // lives in the store, the discrepancy is derived, and the overlay is where
    // the two meet. What happens to the corrected service next depends on
    // whether this billing has gone to accounting — see `getSupplementaryItems`.
    const group = seeded.map((service) => {
      const saved = getSavedServiceRecord(service.id);
      const resolved = getResolvedDiscrepancy(service.id);
      // COMPLIANCE LIFTS A DEFICIENCY the same way a correction lifts a
      // discrepancy, and through the same overlay for the same reason: the
      // deficiency is derived, the compliance lives in the store, and this is
      // where the two meet.
      //
      // What follows from it is the whole point of the distinction. The service
      // drops out of `deficient` and into `billable` two lines below, so it
      // rejoins the billing's total and its plan becomes terminable — a plan
      // that was serviceable all along and was only waiting on a folder. A
      // resolved discrepancy does not necessarily come back to this billing at
      // all; see `getSupplementaryItems`.
      const complied = getCompliedDeficiency(service.id);

      // Re-priced against THIS billing's mortuary. The row was built at import
      // against the chapel's likeliest one, which is the same mortuary until the
      // processor chooses another on the create dialog — so this changes nothing
      // in the ordinary case and is the whole answer in the unusual one.
      const priced = cspAmountFor(mortCode, service.cspCode) ?? 0;

      if (!saved && !resolved && !complied && priced === service.csp) {
        return service;
      }
      return {
        ...service,
        csp: priced,
        ...(saved ? { csp: saved.cspAmount } : {}),
        ...(resolved
          ? { discrepancy: undefined, resolvedDiscrepancy: resolved }
          : {}),
        ...(complied
          ? { deficiency: undefined, compliedDeficiency: complied }
          : {}),
      };
    });

    // TWO BUCKETS AND A MARKER, which is the 2026-08-25 rule change.
    //
    // ONLY A DISCREPANCY HOLDS A SERVICE. It is an account that violates the
    // rules and should not have been served, so there is nothing to bill and
    // nothing to send for. Everything else is billable.
    //
    // A DEFICIENCY DOES NOT HOLD ANYTHING ANY MORE. It is a requirement not yet
    // complied with — a document, an ID — and the user's own example is what
    // settled it: a missing COPY OF THE LPA is not grave, and it has no business
    // keeping a chapel's payable out of a billing. The service is billed and its
    // plan terminated; the notice goes to the branch and the document follows.
    // `deficient` is therefore a SUBSET of `billable` rather than a bucket
    // beside it — a flag on rows that are on the billing, not a list of rows
    // that are off it. Anything summing the buckets must count `billable` and
    // `discrepant` only.
    const discrepant = group.filter((s) => s.discrepancy);
    const billable = group.filter((s) => !s.discrepancy);
    const deficient = billable.filter((s) => s.deficiency);

    // THE BILLING ITSELF — `TblClaimsBilling`, which exists only once the
    // billing has been created. On file from before this session, or written
    // this session by the store; either way it is the same row and it is what
    // carries the Billing No.
    const onFile = db.getClaimsBillingByCode(billingCode);
    const created = getCreatedBilling(billingCode);

    let stage: BillingStage = "for-process";
    let billingNo: string | undefined;
    let processedBy: string | undefined;
    // A billing that is past For Process has had every billable plan terminated
    // — that is the rule that got it there — so one that was billed before this
    // session reports its plans terminated rather than the zero the (empty)
    // store would say. Nothing this session terminated them, but they were
    // terminated all the same, and `TblClaimsSP` is not seeded for them: which
    // of a historical billing's accounts were terminated turns on the
    // discrepancy rule that lives in THIS module, so the data layer cannot
    // honestly say.
    const terminatedCount = onFile
      ? billable.length
      : countTerminated(billable.map((s) => s.id));

    if (onFile) {
      // WHERE IT HAS GOT TO IS TWO SIGNATURES, not a status column: verified and
      // approved are people and dates on the row. Read in reverse order, because
      // an approved billing is also a verified one.
      stage = onFile.dateApproved
        ? "approved"
        : onFile.dateVerified
          ? "verified"
          : "processed";
      billingNo = onFile.billingNo;
      processedBy = onFile.processedBy;
    } else {
      billingNo = created?.billingNo;
      processedBy = created?.processedBy;

      // A billing leaves "For Process" when its WORK is done, not when its
      // number is issued — and the difference matters, because the number is
      // what makes the rest of the work possible.
      //
      // Creating the billing and terminating the plans under it are one sitting
      // at one screen: the number is minted first because a terminated plan has
      // to be posted against something. If issuing it moved the billing out of
      // this queue, the chapel would vanish from the list at the exact moment
      // its plans became terminable, and there would be nowhere left to
      // terminate them. The screen this replaces agrees — its For Process panel
      // lists a billing that already carries B20004427.
      //
      // So: numbered, and every plan that CAN be terminated has been.
      //
      // WHAT IS OUTSTANDING NO LONGER HOLDS THE BILLING, and that is the
      // 2026-08-18 rule change. It used to be that a single discrepancy kept a
      // billing in this queue until somebody cleared it, which meant one
      // unanswerable plan holder froze the payable for every other family the
      // chapel had buried that week. The rule now: process the rest and do not
      // wait. A discrepancy holds ITS OWN service out of the billing and nothing
      // else.
      //
      // So `billable` is the denominator rather than the whole group and
      // `discrepant` is simply not in it. What becomes of those afterwards is the
      // supplementary question — see {@link getSupplementaryItems}.
      //
      // A PLAN WAITING ON A DOCUMENT IS IN THE DENOMINATOR (2026-08-25), because
      // it is on the billing: the requirement is chased in parallel and the plan
      // is terminated meanwhile. It used to sit outside, which quietly said a
      // billing could be finished while a plan holder on it had not been dealt
      // with at all.
      //
      // A billing with NOTHING billable does not complete. Every plan on it is
      // held by a discrepancy, so there is no work to have finished; it stays
      // here until one of them is cleared, which is the same rule read from the
      // other end.
      const complete =
        Boolean(billingNo) &&
        billable.length > 0 &&
        terminatedCount === billable.length;

      if (complete) stage = "processed";
    }

    // ── VERIFIED THIS SESSION ──
    //
    // THE BILLING'S OWN SIGNATURE, and nothing else (user, 2026-08-27). It used
    // to be DERIVED — a billing counted as verified the moment every account on
    // it was — and that made the last account's tick post the billing, which
    // took the decision away from the person taking it: the card left the queue
    // mid-sitting, before they could print it or look at it whole. Reading the
    // accounts and putting the billing through are two acts now, and this reads
    // the second. See `verifyBilling`.
    //
    // WHAT ENFORCES THE ORDER is not here. `canVerifyBilling` will not let the
    // billing be signed while an account on it is unread, and that rule lives
    // with the button; this line only asks whether it HAS been signed. A stage
    // derivation that also re-checked the accounts would be the same rule in two
    // places, disagreeing the first time one of them changed.
    //
    // OUTSIDE THE `onFile` BRANCH ON PURPOSE, unlike the completion rule above
    // it. Everything in the For Verification queue today is an on-file billing,
    // so a rule written inside the `else` would be a rule that never runs; and a
    // billing created and processed in one sitting can be verified in the same
    // sitting, which the `if` would have made impossible. It only ever moves a
    // billing FORWARD from `processed`, so an already-verified or approved one
    // is left exactly as its signatures found it.
    if (stage === "processed" && getVerifiedBilling(billingCode)) {
      stage = "verified";
    }

    // ── APPROVED THIS SESSION ──
    //
    // The same shape one stage on, and it must be read AFTER the rule above so a
    // billing verified and approved in one sitting can travel both steps: the
    // first moves it to `verified`, and this one then finds it there. Written
    // the other way round it would take two page loads to cross two stages.
    if (stage === "verified" && getApprovedBilling(billingCode)) {
      stage = "approved";
    }

    billings.push({
      billingCode,
      billingNo,
      chapelCode,
      chapelDesc: chapel?.chapelDesc ?? chapelCode,
      territoryCode: chapel?.territoryCode ?? "",
      period,
      periodLabel: periodLabel(period),
      company,
      stage,
      isFranchise: chapel?.isFranchise ?? false,
      isManualFranchise: chapel?.isManualFranchise ?? false,
      isEndorsed: isEndorsedToAccounting(stage),
      services: billable,
      deficient,
      discrepant,
      totalCSP: billable.reduce((sum, s) => sum + s.csp, 0),
      terminatedCount,
      processedBy,
    });
  }

  return billings;
}

// WHICH BILLINGS HAVE ALREADY BEEN BILLED IS NO LONGER ASKED HERE.
//
// It used to be a rule in this module: a period whose services were more than
// 45 days old was treated as billed, numbered on the spot and given one of the
// three billed stages in turn. All of that is a fact about the billing rather
// than a way of reading it, so it moved to the data layer with the tables — a
// billing has been billed when it has a `TblClaimsBilling` row, and the row
// carries the number, the processor and the two signatures. See
// `billing-seed.ts`.

// WHAT USED TO BE PASS 5, and why it is gone.
//
// A pass here once lifted every deficiency off an already-billed period, on the
// reasoning that a billing could not leave For Process while anything was
// outstanding against it — so a Processed billing showing one was a
// contradiction rather than a warning.
//
// The 2026-08-18 rules removed the premise. A billing now moves on with its
// unanswered plan holders still unanswered: the rest are processed without
// waiting, and what is outstanding travels WITH the billing. A Processed billing
// carrying a discrepancy is the ordinary case, and one carrying a discrepancy
// that has since been corrected is exactly what the supplementary module exists
// to bill. Stripping them at this point would have hidden the whole mechanism.
//
// The counts and their comments moved with the rule — see `StageTotals` and
// `getStageTotals`.

// Tell the store which numbers are already in use, so the first billing created
// this session continues the run instead of colliding with one.
//
// Read back off the billings rather than recomputed, so there is one rule for
// what those numbers are and no second copy of it to drift. Runs once, at
// import — the store is still empty here, so every number seen is on file.
(() => {
  const byYear = new Map<number, number>();
  for (const billing of getServiceBillings()) {
    if (!billing.billingNo) continue;
    const sequence = Number(billing.billingNo.slice(-6));
    if (!Number.isFinite(sequence)) continue;
    const highest = byYear.get(billing.period.year) ?? 0;
    if (sequence >= highest) byYear.set(billing.period.year, sequence + 1);
  }
  for (const [year, next] of byYear) reserveBillingSequenceFrom(year, next);
})();

/* =============================== queries =============================== */

export function getBillingsByStage(stage: BillingStage): ServiceBilling[] {
  return getServiceBillings().filter((b) => b.stage === stage);
}

/** One chapel-period's billing, by its code. */
export function getBilling(billingCode: string): ServiceBilling | undefined {
  return getServiceBillings().find((b) => b.billingCode === billingCode);
}

/**
 * The mortuary a billing was raised against, if it has been created.
 *
 * What the service record's own mortuary field opens on: a service is billed
 * against the mortuary its billing was raised against nearly every time, and the
 * exception — a service transferred in from another chapel — is the processor's
 * to change. Nothing to offer before the billing exists.
 *
 * Reads the store first and the table second, because they are the same row at
 * two ages: created this session, or created before it.
 */
export function getBillingMortCode(billingCode: string): string {
  return (
    getCreatedBilling(billingCode)?.mortCode ??
    db.getClaimsBillingByCode(billingCode)?.mortCode ??
    ""
  );
}

/**
 * Every service on a billing, billable first and held last.
 *
 * The order the table lists them in, and — because a service record is opened
 * from that table and looked back up by id — the set the open record is found
 * in.
 *
 * TWO LISTS AND NOT THREE. `deficient` is a subset of `services` now, so adding
 * it here would list every plan waiting on a document twice — which is exactly
 * what a table keyed by service id cannot survive.
 */
export function servicesOf(billing: ServiceBilling): ServiceRecord[] {
  return [...billing.services, ...billing.discrepant];
}

/**
 * The billings of one territory at one stage — the chapel list on the workspace
 * page, in the order the source system lists it: by chapel, newest period first.
 */
export function getBillingsByTerritory(
  territoryCode: string,
  stage?: BillingStage,
): ServiceBilling[] {
  return getServiceBillings()
    .filter(
      (b) =>
        b.territoryCode === territoryCode && (!stage || b.stage === stage),
    )
    .sort(
      (a, b) =>
        a.chapelCode.localeCompare(b.chapelCode) ||
        periodKey(b.period).localeCompare(periodKey(a.period)),
    );
}

/**
 * Every territory that has work at the given stage, as the dashboard's cards
 * show it — largest payable first, since that is what a territory is picked by.
 *
 * Territories with nothing at this stage are left out entirely. A card that
 * said "0 chapels, ₱0" would be a row to read and dismiss on every visit, and
 * three of the thirteen territories have no chapels at all.
 */
export function getTerritorySummaries(stage: BillingStage): TerritorySummary[] {
  const byTerritory = new Map<string, ServiceBilling[]>();

  for (const billing of getServiceBillings()) {
    if (billing.stage !== stage) continue;
    if (!billing.territoryCode) continue;
    const group = byTerritory.get(billing.territoryCode);
    if (group) group.push(billing);
    else byTerritory.set(billing.territoryCode, [billing]);
  }

  return [...byTerritory.entries()]
    .map(([territoryCode, billings]) => ({
      territoryCode,
      description: db.getTerritoryName(territoryCode),
      chapelCount: new Set(billings.map((b) => b.chapelCode)).size,
      // Counted over DISTINCT CHAPELS, like `chapelCount` above and for the same
      // reason — a chapel with two billings in one month is one franchise, not
      // two — which is also what makes the two figures sum to it.
      franchiseCount: new Set(
        billings.filter((b) => b.isFranchise).map((b) => b.chapelCode),
      ).size,
      ownedCount: new Set(
        billings.filter((b) => !b.isFranchise).map((b) => b.chapelCode),
      ).size,
      serviceCount: billings.reduce((n, b) => n + b.services.length, 0),
      deficientCount: billings.reduce((n, b) => n + b.deficient.length, 0),
      discrepantCount: billings.reduce((n, b) => n + b.discrepant.length, 0),
      totalCSP: billings.reduce((sum, b) => sum + b.totalCSP, 0),
    }))
    .sort((a, b) => b.totalCSP - a.totalCSP);
}

/**
 * The billings one person put through at one stage — the billing list on the
 * Processed workspace.
 *
 * The processor's counterpart to {@link getBillingsByTerritory}, ordered the
 * same way (by chapel, newest period first) for the same reason: it feeds the
 * same list component, and a user who has learnt the order on one stage should
 * not have to learn a second one on the next.
 */
export function getBillingsByProcessor(
  processor: string,
  stage?: BillingStage,
): ServiceBilling[] {
  return getServiceBillings()
    .filter(
      (b) => b.processedBy === processor && (!stage || b.stage === stage),
    )
    .sort(
      (a, b) =>
        a.chapelCode.localeCompare(b.chapelCode) ||
        periodKey(b.period).localeCompare(periodKey(a.period)),
    );
}

/** One person as the staff picker lists them. */
export interface ProcessorOption {
  /** The name as it is stamped on the billing, e.g. "MARITES BELIESTA". */
  processor: string;
  /** Billings this person has at the stage being worked. */
  billingCount: number;
}

/**
 * Everyone who processes billings, with what each has at this stage.
 *
 * EVERY NAME IS LISTED, including the ones with nothing — the rule
 * {@link getTerritorySummaries} deliberately does not follow, and for the reason
 * given on `TerritoryPicker`: a picker has to be able to say "that one is
 * empty", where a CARD offering an empty group is a door onto an empty room. So
 * this feeds the picker and {@link getProcessorSummaries} feeds the cards.
 *
 * By name, not by payable. A person is found in a list of names alphabetically;
 * ordering the field by how much each is owed would move a colleague's name
 * between two visits.
 */
export function getProcessorOptions(stage: BillingStage): ProcessorOption[] {
  // Seeded with the known names so someone with nothing at this stage still
  // appears; anyone found on a billing and not in that list is added below,
  // which is what keeps this right once the names come off a real audit trail.
  const counts = new Map<string, number>(
    db.getProcessors().map((name) => [name, 0]),
  );

  for (const billing of getServiceBillings()) {
    if (billing.stage !== stage || !billing.processedBy) continue;
    counts.set(billing.processedBy, (counts.get(billing.processedBy) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([processor, billingCount]) => ({ processor, billingCount }))
    .sort((a, b) => a.processor.localeCompare(b.processor));
}

/**
 * Every processor with work at the given stage, largest payable first — what
 * the dashboard lists once a billing is past For Process. See
 * {@link isProcessorStage}.
 *
 * A billing with no name on it is left out rather than pooled under an "—".
 * That can only happen at For Process, which is not a stage this is called for,
 * and a bucket that is always empty is a bucket that will one day quietly fill.
 */
export function getProcessorSummaries(stage: BillingStage): ProcessorSummary[] {
  const byProcessor = new Map<string, ServiceBilling[]>();

  for (const billing of getServiceBillings()) {
    if (billing.stage !== stage) continue;
    if (!billing.processedBy) continue;
    const group = byProcessor.get(billing.processedBy);
    if (group) group.push(billing);
    else byProcessor.set(billing.processedBy, [billing]);
  }

  return [...byProcessor.entries()]
    .map(([processor, billings]) => ({
      processor,
      billingCount: billings.length,
      chapelCount: new Set(billings.map((b) => b.chapelCode)).size,
      territoryCount: new Set(
        billings.map((b) => b.territoryCode).filter(Boolean),
      ).size,
      serviceCount: billings.reduce((n, b) => n + b.services.length, 0),
      deficientCount: billings.reduce((n, b) => n + b.deficient.length, 0),
      discrepantCount: billings.reduce((n, b) => n + b.discrepant.length, 0),
      totalCSP: billings.reduce((sum, b) => sum + b.totalCSP, 0),
    }))
    .sort((a, b) => b.totalCSP - a.totalCSP);
}

/**
 * The overview figures for a stage.
 *
 * Read off the billings rather than summed from whichever list the dashboard is
 * showing, because the two groupings do not agree on one of them: a territory
 * holds a chapel outright, but two of a chapel's billings can have been put
 * through by two different people — so summing `chapelCount` across processors
 * would count that chapel twice. The figures at the top of the page must be the
 * same figures whichever way the list below them is cut.
 */
export function getStageTotals(stage: BillingStage): StageTotals {
  const billings = getServiceBillings().filter((b) => b.stage === stage);

  return {
    totalCSP: billings.reduce((sum, b) => sum + b.totalCSP, 0),
    chapels: new Set(billings.map((b) => b.chapelCode)).size,
    services: billings.reduce((n, b) => n + b.services.length, 0),
    deficient: billings.reduce((n, b) => n + b.deficient.length, 0),
    discrepant: billings.reduce((n, b) => n + b.discrepant.length, 0),
    processors: new Set(
      billings.map((b) => b.processedBy).filter(Boolean),
    ).size,
  };
}

/**
 * Every service waiting on a requirement — the table under the billing lists.
 * Scoped to a territory when one is given, which is how the workspace shows it.
 *
 * These are ON their billings and being paid; what this lists is what is still
 * owed to the folder, so somebody can chase it.
 */
export function getDeficientServices(territoryCode?: string): ServiceRecord[] {
  return getServiceBillings()
    .filter((b) => !territoryCode || b.territoryCode === territoryCode)
    .flatMap((b) => b.deficient);
}

/**
 * Every service held by a disagreement, scoped the same way.
 *
 * NOTHING CALLS THIS SINCE THE DASHBOARD STOPPED REPORTING DISCREPANCIES — the
 * rail's `DiscrepancyPanel` was its only reader and both are gone, replaced by
 * the queue links. Kept because it is the other half of `getDeficientServices`
 * above it and the pair is how this module answers "what is held", which the
 * supplementary module will need to ask.
 *
 * Discrepancies themselves are not hidden: one still marks its billing's card,
 * tints its own row in the table, and states its reason on the record.
 */
export function getDiscrepantServices(territoryCode?: string): ServiceRecord[] {
  return getServiceBillings()
    .filter((b) => !territoryCode || b.territoryCode === territoryCode)
    .flatMap((b) => b.discrepant);
}

/* ========================= the supplementary rule ========================= */

/**
 * A corrected plan holder whose billing has already gone to accounting — the
 * supplementary module's queue.
 *
 * THE RULE, in the order it is asked:
 *
 *   1. The service had a discrepancy and somebody has since put it right.
 *   2. The billing it belongs to is ENDORSED — Verified or beyond. See
 *      {@link isEndorsedToAccounting}.
 *
 * Both, or it is not here. A correction on a billing that has NOT been endorsed
 * needs nothing special at all: the service simply becomes billable on the
 * billing it was always on, the processor terminates it as they would have, and
 * the total moves before anyone outside has seen it. That is the ordinary path
 * and it produces no supplementary anything — which is why this list is short
 * and why an empty one is the healthy state rather than a missing feature.
 *
 * WHAT IS NOT DECIDED YET is what happens after. The rules describe two options
 * for a corrected discrepancy and explicitly leave the choice for later, so this
 * identifies the work and stops: no supplementary billing number is minted, no
 * amount is committed. See {@link SUPPLEMENTARY_RULE_PENDING}.
 */
export interface SupplementaryItem {
  service: ServiceRecord;
  /** The billing the service was on when it was endorsed. */
  billing: ServiceBilling;
  /** The correction that brought it here. */
  resolved: ResolvedDiscrepancy;
}

export function getSupplementaryItems(
  /** Narrow to one endorsed stage. Omit for every one of them. */
  stage?: BillingStage,
): SupplementaryItem[] {
  const items: SupplementaryItem[] = [];

  for (const billing of getServiceBillings()) {
    if (!billing.isEndorsed) continue;
    if (stage && billing.stage !== stage) continue;
    for (const service of servicesOf(billing)) {
      // `resolvedDiscrepancy` is only ever set where a discrepancy WAS — the
      // overlay in `getServiceBillings` lifts the one and records the other
      // together — so this is already "had one, and it was corrected".
      if (!service.resolvedDiscrepancy) continue;
      items.push({
        service,
        billing,
        resolved: service.resolvedDiscrepancy,
      });
    }
  }

  // Newest correction first: this is a queue of things that have just happened,
  // and the one that just happened is the one being looked for.
  return items.sort((a, b) =>
    b.resolved.resolvedAtISO.localeCompare(a.resolved.resolvedAtISO),
  );
}

/**
 * True while what a supplementary billing DOES is undecided — the UI says so
 * rather than implying a number will be issued.
 */
export const SUPPLEMENTARY_RULE_PENDING = true;

/**
 * Where a corrected discrepancy goes — the question the supplementary rule
 * answers, asked one service at a time.
 *
 * `billing`       back onto the billing it was always on. Nothing has left this
 *                 department, so the plan is terminated normally.
 * `supplementary` the billing is endorsed and cannot be reopened, so the plan is
 *                 billed supplementarily.
 */
export function correctionRouteFor(
  billing: ServiceBilling,
): "billing" | "supplementary" {
  return billing.isEndorsed ? "supplementary" : "billing";
}

/**
 * Whether this service's plan has been terminated into its billing THIS SESSION.
 * Re-exported from the store so a component reads one module rather than two.
 *
 * ASK {@link isServiceTerminated} INSTEAD unless you specifically mean "did we
 * write the row". This one answers off the store alone and so says NO for every
 * account on every billing that was already past For Process when the session
 * started — which is all of For Verification.
 */
export { isPlanTerminated };

/**
 * Whether this service's plan is terminated into its billing — however it got
 * that way.
 *
 * TWO WAYS, and a screen that knows only the first is wrong about most of the
 * data. The store knows what THIS SESSION terminated. Everything else was
 * terminated before it began, and `TblClaimsSP` is deliberately not seeded for
 * those (see `getServiceBillings`, which computes `terminatedCount` the same two
 * ways for the same reason) — so a plan on a billing that has left For Process
 * is terminated by the very rule that let it leave, whether or not there is a
 * row in hand to prove it.
 *
 * FOUND ON 2026-08-26, when For Verification's rows became clickable and opened
 * a record that had never been reachable from that queue before.
 * `ServiceRecordView` locks itself against a terminated plan, was asking
 * `isPlanTerminated`, and got NO for every historical account — so it offered an
 * editable form and a live Terminate button on plans that were terminated weeks
 * ago. Re-saving would have written a second `TblClaimsSP` row against a billing
 * that already had one.
 *
 * A DISCREPANT SERVICE IS NEVER TERMINATED, whatever stage its billing reached.
 * It is held out of `services` and out of the money, and the stage rule counts
 * only what is billable — so it must be excluded here too, or a plan that could
 * not be serviced would read as one that was.
 */
export function isServiceTerminated(
  billing: ServiceBilling,
  service: ServiceRecord,
): boolean {
  if (isPlanTerminated(service.id)) return true;
  return billing.stage !== "for-process" && !service.discrepancy;
}

/** The deceased's name as the tables print it. */
export function deceasedName(service: ServiceRecord): string {
  return toFullName(service.deceased);
}

/**
 * The plan holder of record's name, as the tables print it.
 *
 * THE SAME STRING AS {@link deceasedName} ON EVERY ROW IN THE SEED, and worth
 * having anyway: they are two columns in the source system, and the case they
 * come apart is the one the table is being read for — a plan bought for a
 * dependant is held by one person and claimed on the death of another. A table
 * that printed the deceased under a "Planholder" heading could not show that,
 * and for two years it would look right.
 *
 * Not to be confused with `ServiceRecord.endorsedName`, which is this name as
 * the CHAPEL wrote it down. That comparison is the discrepancy check and it is
 * already made for the processor — see `discrepancyFor`.
 */
export function planholderName(service: ServiceRecord): string {
  return toFullName(service.planholder);
}

/**
 * Whether the deceased is somebody OTHER than the plan holder — a plan used to
 * bury a person who did not own it.
 *
 * ONE PLACE FOR THE COMPARISON, because it compares two formatted NAMES and not
 * two ids: `TblICIS_Billing_Processed` keeps the deceased as a single string
 * with nobody behind it, so there is nothing else to compare. Two callers doing
 * that for themselves would eventually do it two ways.
 *
 * IT IS THE ASSIGNED-PLAN CASE — termination status `SA` — and it is the one
 * thing a list of PLAN HOLDERS has to say out loud: the row is filed under the
 * person who owns the plan, and the funeral the chapel is being paid for was
 * somebody else's. See `PlanholderServiceList`, which grows a row for it.
 */
export function hasOtherDeceased(service: ServiceRecord): boolean {
  return deceasedName(service) !== planholderName(service);
}

/**
 * How a count of held services is written wherever one appears — "1 deficiency",
 * "2 deficiencies"; "1 discrepancy", "2 discrepancies".
 *
 * Here rather than in each component because it is the WORD that matters: the
 * same count is shown on a card, in a table cell, in a rail panel and on the
 * territory page, and four components each spelling it out is four places for
 * the vocabulary to drift.
 *
 * THE TWO WORDS ARE NOT INTERCHANGEABLE, and they were used as though they were
 * until the 2026-08-18 rules separated them. A DEFICIENCY is a requirement not
 * complied with — a document that has not arrived, or a plan holder's ID that
 * has not been confirmed. It is the source screen's own "With Deficiencies"
 * table and its Send / View Deficiency actions, and it is answered by asking for
 * what is missing. A DISCREPANCY is an ACCOUNT THAT VIOLATES THE RULES AND
 * SHOULD NOT HAVE BEEN SERVED: nothing can be sent for, because nothing is
 * missing. One is answered by attaching a file and the other by correcting a
 * record, so a screen that calls both by one name is a screen telling a
 * processor to do the wrong thing — and, worse, offering them the wrong button.
 * See {@link ServiceDeficiency} and {@link ServiceDiscrepancy}.
 */
export function deficiencyLabel(count: number): string {
  return `${count} ${count === 1 ? "deficiency" : "deficiencies"}`;
}

/**
 * The other half of {@link deficiencyLabel} — accounts that should not have been
 * served, not requirements outstanding. These are the ones actually held.
 */
export function discrepancyLabel(count: number): string {
  return `${count} ${count === 1 ? "discrepancy" : "discrepancies"}`;
}

/**
 * Both counts as one line — "2 deficiencies · 1 discrepancy" — for the cards and
 * tables that have room for one line and not two.
 *
 * THE TWO NUMBERS ARE NOT THE SAME KIND OF THING, whatever this function's name
 * suggests. The deficiencies are on the billing and being paid; only the
 * discrepancies are held. It reads as one line because both are work outstanding
 * on a chapel, not because both are money withheld.
 *
 * A count of nought is left out rather than written, so a billing short one
 * document reads "1 deficiency" and not "1 deficiency · 0 discrepancies". Both
 * nought gives an empty string, which is the caller's signal to show nothing at
 * all: an empty line is still a line, and a list of chapels with one mark on it
 * should have nine clean rows and not nine blank ones.
 *
 * DEFICIENCIES LEAD because they are the commoner and the cheaper to answer.
 * When a chapel has both, the documents are what a processor chases first while
 * the correction goes back to the branch.
 */
export function heldLabel(deficient: number, discrepant: number): string {
  return [
    deficient > 0 ? deficiencyLabel(deficient) : "",
    discrepant > 0 ? discrepancyLabel(discrepant) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Peso amount as the totals print it, e.g. "Php 118,450.00". */
export function formatCSP(amount: number): string {
  return `Php ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * ONE SERVICE's amount — the same figure, except that a zero prints as "—".
 *
 * Because a zero on a service row is not a price. It means the pair that would
 * have priced it came up empty: the plan named no CSP code, or the mortuary has
 * no rate on file for the one it did, or the chapel has no mortuary of its own
 * so there is not yet anything to price against. "Php 0.00" states all three as
 * a settled amount of nothing, which is the one thing they are not — and it is
 * a figure a processor would reasonably initial and move past.
 *
 * TOTALS STILL USE {@link formatCSP}, deliberately: a billing whose services are
 * all unpriced IS owed nothing so far, and a dash at the foot of a column of
 * dashes would only be harder to read.
 */
export function formatServiceCSP(amount: number): string {
  return amount === 0 ? "—" : formatCSP(amount);
}
