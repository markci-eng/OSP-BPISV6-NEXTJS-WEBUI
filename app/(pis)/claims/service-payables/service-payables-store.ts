"use client";

// Service-payables write store.
//
// Same arrangement as `claim-store`, and for the same reason: the shared PIS
// data layer is read-only, and this module needs exactly two writes —
//
//   1. creating a billing, which mints its Billing No, and
//   2. terminating a plan holder's plan into that billing.
//
// EXCEPT FOR ONE COLUMN, since 2026-08-26. Terminating does a third thing that
// the two above do not: it changes a row that was already on file, setting the
// PLAN's `TermiStatCode` to `SP` or `SA`. That is not a row this module owns and
// not something a store in front of the data layer can usefully hold — every
// screen that reads a plan holder has to see it, and most of them have never
// heard of service payables. So it is written THROUGH to the mock database, via
// `db.setTerminationStatus`, and this store's job for it is only to know when
// and to what. See {@link terminationStatusFor}.
//
// THOSE TWO WRITES ARE TWO TABLES, and since 2026-08-25 this store keeps them as
// exactly that. Creating a billing writes a `TblClaimsBilling` row; terminating
// an account writes a `TblClaimsSP` row against that billing's number. Both
// shapes come from the shared data layer, so a row written here is the same
// object the mock DB hands back for a billing that was created before this
// session — see `models.ts` and `billing-seed.ts`.
//
// The store sits IN FRONT of the read model: `service-payables-data` reads the
// billing tables and then overlays whatever this holds. Nothing is persisted; a
// refresh clears it.
//
// This file imports NOTHING from `service-payables-data`. The dependency runs
// one way — data reads the store — and {@link reserveBillingSequenceFrom} is
// how the read model tells the store which numbers are already in use, without
// the store having to reach back for them.

import { useSyncExternalStore } from "react";

import { db } from "../../data";
import type {
  BillingPeriod,
  ClaimsBillingRecord,
  ClaimsSpRecord,
  PersonName,
  TerminationStatus,
} from "../../data";

/* ------------------------------ model ------------------------------ */

/**
 * What the user fills in on the create form. Everything else about a billing is
 * either derived (the code, the period, the total) or generated (the number).
 *
 * `mortuaryCode` and `mortuaryName` travel together because the form picks one
 * and fills the other — see the note on `MORTUARIES` about the rules behind
 * that pairing, which are not settled yet.
 */
export interface BillingDetails {
  /** ISO date on the cash voucher. */
  cvDateISO: string;
  mortuaryCode: string;
  mortuaryName: string;
}

/**
 * The service record for one plan holder — everything the processor fills in on
 * the service record screen.
 *
 * These are the fields the OLD screen's "Claims Info" block carried, less the
 * ones that are not the processor's to set: the LPA number, the plan and the
 * chapel identify the record and come off the service, so they are not here.
 *
 * The mortuary is here even though the billing already carries one. The billing
 * is raised against a mortuary and so is each service on it, and in the source
 * system they are separate columns — a service transferred in from another
 * chapel keeps the mortuary that rendered it. The form defaults this to the
 * billing's, which is right nearly every time and still editable.
 */
export interface ServiceRecordDetails {
  status: string;
  /** ISO. When the branch filed the claim this service answers. */
  dateFiledISO: string;
  dateOfDeathISO: string;
  requestingBranchCode: string;
  branchManager: string;
  deceasedLastName: string;
  deceasedFirstName: string;
  mortuaryCode: string;
  /**
   * A `RefMortuaryCSP` code — derived from the plan and confirmed here. Real
   * since 2026-08-26; see `CSP_CODES`.
   */
  cspCode: string;
  /**
   * Pesos. Overrides the derived amount on the billing — see the CSP note.
   *
   * IT IS STILL AN OVERRIDE now that the rate table prices this, and that is the
   * point rather than a leftover: the form fills the field from
   * `RefMortuaryCSPRate` and the processor may still type over it, because a
   * mortuary with no rate on file for a plan has to be answered by somebody.
   */
  cspAmount: number;
  natureOfService: string;
  /** Pesos, as a code — see `WREATH_AMOUNTS`. */
  withWreath: string;
  creditOfService: string;
  /** The old screen's "Double Used" tick: the plan was used for two services. */
  doubleUsed: boolean;
}

/** A service record the user has saved, as the store keeps it. */
export interface SavedServiceRecord extends ServiceRecordDetails {
  /** The service this record belongs to — `ServiceRecord.id`. */
  serviceId: string;
  savedAtISO: string;
  savedBy: string;
}

/**
 * A plan holder keyed in BY HAND against a billing — the franchise path.
 *
 * A franchise that cannot use the system sends its endorsement on paper, so
 * nothing about the service reaches the data layer on its own: the processor
 * types the plan number off the documents and the rest is looked up from it.
 * That is the only difference from an owned chapel's service. Everything after
 * this point — the record, the discrepancy check, the termination — is the same
 * process, which is exactly what the rules say it should be.
 *
 * `deceased` is the one field that is NOT looked up, and it is the point of the
 * exercise: it is the name the franchise wrote on its paperwork, kept verbatim
 * so it can be compared against the plan holder on file. When the two differ,
 * that is the name discrepancy.
 *
 * IT IS STORED IN TWO PARTS because that is how the service record asks for it —
 * `ServiceRecordForm` has a Deceased Lastname and a Deceased Firstname, and a
 * single string keyed here would have to be guessed apart to fill them. Typed
 * apart, what the processor enters is what the form opens with.
 */
export interface ManualService {
  /** Stable id — the `ServiceRecord.id` this becomes. */
  id: string;
  /** The billing it was keyed in against. */
  billingCode: string;
  chapelCode: string;
  /** The plan number off the franchise's paperwork. */
  lpaNo: string;
  /** The deceased, as the franchise wrote it. Verbatim, both parts. */
  deceased: PersonName;
  /** ISO. When the chapel rendered the service. */
  serviceDateISO: string;
  /** ISO. */
  dateOfDeathISO: string;
  /** Whatever the processor wanted recorded about the paperwork. */
  remarks?: string;
  addedAtISO: string;
  addedBy: string;
}

/**
 * A BILLING RAISED BY HAND AGAINST A MORTUARY — the paper franchise's, and the
 * only kind of billing in this module that is not derived from something.
 *
 * WHY IT NEEDS A RECORD OF ITS OWN. Every other billing exists because the data
 * says it does: a `TblBillingHdr` row, or services carrying a code. A franchise
 * that submits on paper endorses nothing through the system, so until a
 * processor raises one there is no billing anywhere — and the moment they do,
 * it has no accounts on it either. Without this map that billing would be
 * invisible between being created and having its first plan holder keyed in,
 * which is precisely the window the whole path opens in.
 *
 * IT IS THE MORTUARY THAT IS BILLED, not a chapel. `RefMortuary.branchCode`
 * names a chapel and for a franchise row it often does not resolve — one has
 * none at all — so {@link chapelCode} may be empty and nothing may depend on
 * it. The mortuary is what was typed, what prices the accounts, and what the
 * billing is read by.
 */
export interface FranchiseBilling {
  /**
   * The key this billing is held under everywhere in the module — see
   * {@link franchiseBillingCode}.
   *
   * IT IS NOT A CIS BILLING CODE and must never be shown as one. A paper
   * franchise has no CIS code; this is a local handle, minted so the maps that
   * key on `billingCode` have something to key on.
   */
  billingCode: string;
  /** `RefMortuary.mortCode` — the franchisee, and the rate every account prices at. */
  mortCode: string;
  mortuaryName: string;
  /** The mortuary's chapel, when its own `branchCode` resolves. Often empty. */
  chapelCode: string;
  period: BillingPeriod;
  /** "SEPTEMBER 1-7, 2026". */
  periodLabel: string;
  /** ISO date on the cash voucher. */
  cvDateISO: string;
  createdAtISO: string;
  createdBy: string;
}

/**
 * A discrepancy a processor has since put right.
 *
 * WHAT HAPPENS NEXT DEPENDS ON THE BILLING, not on this record, which is why
 * nothing here says where the service goes. A billing that has not yet been
 * endorsed to accounting simply takes the corrected plan as it would have all
 * along; one that HAS been endorsed cannot be reopened, so the corrected plan is
 * billed supplementarily instead. `service-payables-data` reads the billing's
 * stage and decides. See `getSupplementaryItems` there.
 */
export interface ResolvedDiscrepancy {
  /** The service put right — `ServiceRecord.id`. */
  serviceId: string;
  /** What was corrected, in the processor's words. */
  note: string;
  resolvedAtISO: string;
  resolvedBy: string;
}

/**
 * A deficiency that has been COMPLIED WITH — the missing paperwork arrived.
 *
 * `ResolvedDiscrepancy`'s counterpart, and the two are kept apart because they
 * are not the same kind of fact. A discrepancy means the plan could not be
 * serviced and something on record had to be CORRECTED. A deficiency means the
 * folder was short a document and the branch has now sent it: the plan was
 * always serviceable, it was the paperwork that was not there.
 *
 * Which is why this exists at all. Until it did, the deficiency a service
 * carries on record could not be cleared by anything in this application — so a
 * service one document short was permanently unbillable, which is not what a
 * deficiency is.
 */
export interface CompliedDeficiency {
  /** The service whose paperwork is now complete — `ServiceRecord.id`. */
  serviceId: string;
  /** What arrived, in the processor's words. */
  note: string;
  compliedAtISO: string;
  compliedBy: string;
}

/**
 * One account signed off by a verifier — see {@link verifiedByServiceId}.
 *
 * The same two fields `TblClaimsBilling` records a verification with, because
 * they are the same act one level down: who said it was right, and when.
 */
export interface VerifiedAccount {
  verifiedBy: string;
  /** ISO date, `YYYY-MM-DD`. */
  dateVerified: string;
}

/**
 * The chapel-period a billing is being created FOR — what the `TblClaimsBilling`
 * row needs that the form does not ask for.
 *
 * Passed in rather than looked up because this file deliberately knows nothing
 * about how a billing is derived: the caller has the billing in front of it.
 */
export interface BillingTarget {
  /** The billing code — chapel + cut + month + year. */
  billingCode: string;
  chapelCode: string;
  /** The period in words, e.g. "AUGUST 1-7, 2026". */
  periodLabel: string;
  /** The period's year — the billing-number sequence runs per year. */
  year: number;
  /** How many accounts are on the billing. */
  accountCount: number;
  /** The company that owes it. */
  company: string;
}

/**
 * The account a termination is being written FOR — the identity half of a
 * `TblClaimsSP` row, as against the form half in {@link ServiceRecordDetails}.
 */
export interface ServiceTarget {
  /** The service being recorded — `ServiceRecord.id`. */
  serviceId: string;
  /**
   * The PLAN being terminated — what its termination status is written against.
   *
   * A service id identifies the service and not the plan (a manual row and a
   * derived one for the same plan are two different services), and it is the
   * plan whose `TermiStatCode` changes. See {@link terminationStatusFor}.
   */
  lpaNo: string;
  /** The billing NO it is terminated into. Empty when nothing is terminated. */
  billingNo: string;
  /** The claim this service answers — `TblClaimsSP`'s own key. */
  claimNo: string;
  /** The CIS contract number, falling back to the policy number. */
  contractNo: string;
  /** The chapel that rendered the service. */
  servicingChapel: string;
  /** Special (SC) or regular (RC), off the claim. */
  natureCode: string;
}

/**
 * Whoever is signed in creates the billing. Hard-coded for now, exactly as the
 * processor's name is on the death-claim side — the signed-in user is not wired
 * into this area yet.
 *
 * MUST MATCH `PROCESSOR` in `app/(pis)/data/seed.ts` and `ACTING_USER` in
 * `service-documents-store.ts`: three copies of one fact, and a billing created
 * this session that disagrees with the seed opens a processor group of its own
 * on the dashboard. It moved off MARITES BELIESTA on 2026-09-14, who is on the
 * death claim team; see `PROCESSORS` in `billing-seed.ts`.
 */
const CREATED_BY = "JACKIE PANES";

/* -------------------------- billing numbers -------------------------- */

/**
 * A Billing No: "B" + the 2-digit year + a 6-digit sequence, e.g. "B20004427".
 *
 * The sequence counts the services billed IN THAT YEAR, so it restarts each
 * January — which is why the year is part of the number rather than something
 * read off the billing's period.
 */
export function formatBillingNo(year: number, sequence: number): string {
  return `B${String(year).slice(-2)}${String(sequence).padStart(6, "0")}`;
}

/**
 * The next sequence to hand out, per year.
 *
 * Seeded by {@link reserveBillingSequenceFrom} rather than starting at 1: the
 * derived model already carries billings numbered in earlier periods, and a
 * fresh billing must not collide with one of those.
 */
const nextSequenceByYear = new Map<number, number>();

/**
 * Tell the store that `sequence` numbers are already in use for `year`, so the
 * next one it mints comes after them. Idempotent, and only ever moves forward —
 * calling it with a lower figure than one already recorded changes nothing.
 */
export function reserveBillingSequenceFrom(year: number, sequence: number) {
  const current = nextSequenceByYear.get(year) ?? 1;
  if (sequence > current) nextSequenceByYear.set(year, sequence);
}

function takeSequence(year: number): number {
  const seq = nextSequenceByYear.get(year) ?? 1;
  nextSequenceByYear.set(year, seq + 1);
  return seq;
}

/* ------------------------------ state ------------------------------ */

/** `TblClaimsBilling` rows written this session, keyed by billing code. */
const billingsByCode = new Map<string, ClaimsBillingRecord>();

/** Service records saved this session, keyed by service id. */
const recordsByServiceId = new Map<string, SavedServiceRecord>();

/**
 * `TblClaimsSP` rows written this session, keyed by service id.
 *
 * A map of ROWS and no longer a set of ids, which is the 2026-08-25 change:
 * terminating an account is an insert, not a flag, and what it inserts is the
 * plan's own line on the billing. Keyed by service id all the same, because that
 * is what every caller has in its hand.
 */
const terminationsByServiceId = new Map<string, ClaimsSpRecord>();

/** Plan holders keyed in by hand this session, by billing code. */
const manualServicesByBilling = new Map<string, ManualService[]>();

/**
 * Billings raised by hand against a mortuary this session — the paper
 * franchise's. See {@link FranchiseBilling}.
 *
 * SEPARATE FROM {@link billingsByCode} though every entry here has one there
 * too. That map is the `TblClaimsBilling` row — the number, the CV date, the
 * signatures — and it is the same row whether the billing was derived or
 * raised. This one holds what a derived billing gets from its CODE and a paper
 * franchise has nowhere else to get: which mortuary, which period, and the fact
 * that it was raised by hand at all.
 */
const franchiseBillingByCode = new Map<string, FranchiseBilling>();

/**
 * Paper-franchise billings whose ENTRY IS CLOSED — the stack of hard copies has
 * been keyed in, and nothing more may be added.
 *
 * IT LOCKS THE ENTRY. IT DOES NOT COMPLETE THE BILLING (user, 2026-09-15: "what
 * the close billing does? it should be clickable if that was the locking of
 * billing in order not allowed to be added"). Those are two different facts and
 * conflating them is what made this act unusable for a day: the button meant
 * both, so it could only be offered once every account was terminated — by which
 * point the one thing it is actually for, stopping anything else being added,
 * had had no chance to matter.
 *
 * WHY THE LOCK HAS TO BE A PERSON'S ACT. Every other billing completes by a rule
 * the data can check — every plan that can be terminated has been, and the data
 * knows how many there are because they arrived through the system. Nothing
 * arrives for a paper franchise. Its accounts come into being one at a time as
 * they are typed, so "all of them are terminated" is TRUE AFTER THE FIRST ONE.
 * Only the processor knows the stack is finished.
 *
 * WHAT COMPLETION IS, NOW THAT THIS IS ONLY THE LOCK: the module's ordinary rule
 * — numbered, and every plan that can be terminated has been — asked of a list
 * that can no longer grow. See `getServiceBillings`, where the two meet. So a
 * paper franchise does not get a special completion rule any more; it gets the
 * normal one plus a gate that says the list is final.
 */
const closedFranchiseEntryByCode = new Map<string, VerifiedAccount>();

/**
 * Notes written against a service, oldest first — the processor's own working
 * notes on the record.
 *
 * THE DEATH CLAIM'S NOTES, one screen over: `claim-store` keeps exactly this
 * map against a claim request, for the same reason and with the same shape. A
 * note is what somebody wants REMEMBERED about a record — why the amount was
 * typed over, who at the branch was spoken to, what the paperwork actually said
 * — as against a remark, which records what HAPPENED to it.
 *
 * SEPARATE FROM {@link SavedServiceRecord} deliberately, though both belong to
 * the service. A record is a form and re-saving overwrites it; notes accumulate
 * and nothing takes one back. Folding them into the record would make the
 * second save silently drop the first note.
 *
 * A `string[]` and not a row of its own, because the same is true of the claim's
 * and there is no `TblClaimsSPNotes` in the structure drops. When one lands this
 * becomes it.
 */
const notesByServiceId = new Map<string, string[]>();

/**
 * Accounts VERIFIED this session, by service id — the For Verification queue's
 * one write.
 *
 * WHERE THIS BELONGS WHEN THE COLUMN EXISTS. Verification is signed on the
 * BILLING in the structure drops — `TblClaimsBilling` carries `VerifiedBy` and
 * `DateVerified` and nothing carries them per account. But a verifier works
 * ACCOUNT BY ACCOUNT: they read a chapel's paperwork against one plan holder at
 * a time, and a queue that can only record "all of it, at once" cannot describe
 * a billing half-checked when the phone goes.
 *
 * So this is a per-account record, keyed the way every other write here is, and
 * the row it is waiting for is `TblClaimsSP`'s — that is the account's OWN line
 * on the billing, written when the plan was terminated into it, and a
 * `VerifiedBy`/`DateVerified` pair on it is the natural shape of what this map
 * holds. Until that column lands this is session state, exactly as
 * {@link terminationsByServiceId} was before its row was modelled.
 *
 * THE BILLING'S OWN SIGNATURE IS NOT DERIVED FROM IT — see
 * {@link verifiedBillingByCode}, which is a second and deliberate act. This map
 * says which ACCOUNTS have been read; that one says the billing has been put
 * through. Signing the last account no longer moves the billing on.
 */
const verifiedByServiceId = new Map<string, VerifiedAccount>();

/**
 * Billings VERIFIED this session, by billing code — the signature on the
 * billing itself.
 *
 * A SECOND ACT AND NOT A CONSEQUENCE (user, 2026-08-27). It was derived: a
 * billing counted as verified the moment every account on it was, on the
 * reasoning that two places recording one fact is how they come to disagree.
 * They are not one fact. Reading an account is checking a family's paperwork;
 * verifying the BILLING is putting a numbered document through to accounting,
 * and a verifier who has finished reading is not necessarily ready to do that —
 * they may want to print it first, or come back after lunch, or hand it to
 * somebody else. Derived, the queue took the decision away from them: the last
 * tick posted the billing and the card vanished mid-thought.
 *
 * THE ROW IS ALREADY THERE FOR IT. `TblClaimsBilling` carries `VerifiedBy` and
 * `DateVerified` and nothing carries them per account — this map is exactly
 * those two columns, and the per-ACCOUNT map above is the one still waiting for
 * a row to live on. So of the two, this is the one that is not session state in
 * spirit; it is session state only because nothing here writes to the seed.
 */
const verifiedBillingByCode = new Map<string, VerifiedAccount>();

/**
 * Billings APPROVED this session, by billing code — the signature after the
 * verifier's.
 *
 * A THIRD MAP AND NOT A FIELD ON THE SECOND, because they are two acts by two
 * people: `TblClaimsBilling` records them in two column pairs for exactly that
 * reason, and the one arrangement this data must not show is a billing approved
 * by whoever verified it. Keyed the same way, written once the same way.
 *
 * IT REUSES {@link VerifiedAccount} rather than declaring a twin with the fields
 * renamed. The shape is the shape of a signature — who, and when — and it is the
 * same shape wherever this module records one; a second interface differing only
 * in the words `verifiedBy` and `approvedBy` would be two types to keep in step
 * for no reader's benefit. What the signature MEANS is said by which map it is
 * in, which is the same thing the table says with its column names.
 */
const approvedBillingByCode = new Map<string, VerifiedAccount>();

/**
 * Billings ENDORSED this session, by billing code — the last signature this
 * module takes, and the one that hands the payable to accounting.
 *
 * THE FOURTH MAP, for the reason there are three above it: a fourth act by a
 * fourth person. It was the one stage with no act at all until 2026-09-14 — the
 * conveyor's last queue offered a "Next billing" button that paged past the
 * billing without writing anything, because the endorsement had never been
 * described. What the user asked for (2026-09-14) was the button named Endorse,
 * and a button named after an act has to perform it.
 *
 * WHAT IT DOES NOT DO IS MOVE THE BILLING TO A FIFTH STAGE. `BillingStage` has
 * four, the queue tiles show four, and endorsement is where this department's
 * work ENDS rather than another desk it lands on — so an endorsed billing simply
 * leaves the conveyor's last queue. See `billingQueue`, which filters on this.
 * When accounting's own side is described, that is when a fifth stage earns its
 * place; until then a stage nobody works would be a queue that only ever fills.
 */
const endorsedBillingByCode = new Map<string, VerifiedAccount>();

/** Discrepancies put right this session, by service id. */
const resolvedByServiceId = new Map<string, ResolvedDiscrepancy>();

/** Compliance recorded against a service's deficiency, by service id. */
const compliedByServiceId = new Map<string, CompliedDeficiency>();

/** Counter behind the ids minted for manual services. Never reset. */
let manualSeq = 0;

const listeners = new Set<() => void>();

/**
 * Bumped on every write. `useSyncExternalStore` compares this rather than the
 * collections themselves, so mutable ones are safe to hand out.
 */
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVersion = () => version;
/** The store is always empty on the server — nothing has been created yet. */
const getServerVersion = () => 0;

/* ------------------------------ writes ------------------------------ */

/**
 * Create the billing for a chapel's period, minting its Billing No.
 *
 * This is the action the "+" on a chapel row performs, and it is what unlocks
 * terminating the plans listed against it: until a billing has a number there
 * is nothing for a terminated plan to be billed under.
 *
 * Creating twice for the same billing code returns the FIRST result untouched.
 * A billing number is quoted outside this system once issued, so re-running the
 * action must not quietly issue a second one for the same period.
 *
 * @param year The billing period's year — the sequence runs per year.
 */
export function createBilling(
  target: BillingTarget,
  details: BillingDetails,
): ClaimsBillingRecord {
  const existing = billingsByCode.get(target.billingCode);
  if (existing) return existing;

  const billing: ClaimsBillingRecord = {
    billingNo: formatBillingNo(target.year, takeSequence(target.year)),
    // Accounting raises the voucher afterwards; the columns are on the row
    // because the table has them, and they are filled in outside this module.
    cvNo: "",
    cvDate: details.cvDateISO,
    mortCode: details.mortuaryCode,
    period: target.periodLabel,
    // Nothing is signed at creation — that is what For Verification is for.
    verifiedBy: "",
    dateVerified: "",
    approvedBy: "",
    dateApproved: "",
    // NOR IS IT PROCESSED. Creating mints the number so the plans under it can
    // be terminated; the work itself is what follows. A billing created here
    // stays in For Process until every billable plan on it is terminated, which
    // is the completion rule in `getServiceBillings` and not this row.
    dateProcessed: "",
    cisBillingNo: target.billingCode,
    cisUploadDate: new Date().toISOString().slice(0, 10),
    company: target.company,
    chapel: target.chapelCode,
    noOfAccount: String(target.accountCount),
    processedBy: CREATED_BY,
  };

  billingsByCode.set(target.billingCode, billing);
  emit();
  return billing;
}

/* --------------------------- paper franchise --------------------------- */

/**
 * The mark a paper franchise's local key carries, and the thing that makes it
 * unmistakable for a CIS billing code: no derived code contains a colon.
 */
export const FRANCHISE_BILLING_PREFIX = "FR:";

const MONTH_ABBR = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/**
 * The key a paper franchise's billing is held under — `FR:BT1-01:1SEP26`.
 *
 * IT IS DERIVED, AND THAT IS THE POINT. A paper franchise has no CIS billing
 * code, but every map in this module keys on one, so it needs a handle. Making
 * that handle a function of the mortuary and the period rather than a fresh id
 * buys the one rule this path most needs enforcing: {@link createBilling}
 * returns the first result untouched for a code it has already seen, so keying
 * the SAME franchisee for the SAME cut twice cannot mint a second billing
 * number. Numbering off a counter would have needed a guard written by hand,
 * and a guard written by hand is one somebody can forget to ask.
 *
 * SHAPED LIKE `billingCodeFor` BUT NOT PRODUCED BY IT. The derived code is
 * chapel + cut + month + year, and this is mortuary + cut + month + year behind
 * a prefix — close enough to read at a glance, marked clearly enough that
 * nothing mistakes it for the real thing. `periodFromBillingCode` is never
 * asked about one: a franchise billing carries its period as a field.
 */
export function franchiseBillingCode(
  mortCode: string,
  period: BillingPeriod,
): string {
  const tail = `${period.cut}${MONTH_ABBR[period.month]}${String(period.year).slice(-2)}`;
  return `${FRANCHISE_BILLING_PREFIX}${mortCode}:${tail}`;
}

/** Whether a billing code is a paper franchise's local key rather than a CIS one. */
export function isFranchiseBillingCode(billingCode: string): boolean {
  return billingCode.startsWith(FRANCHISE_BILLING_PREFIX);
}

/**
 * Raise a billing for a franchise that submits on paper — the franchise
 * intake's one write.
 *
 * TWO RECORDS, ONE ACT. The `TblClaimsBilling` row is written by
 * {@link createBilling} exactly as it is for any other billing, because it IS
 * the same row — the number, the CV date, the mortuary. What this adds is the
 * franchise record beside it, holding the mortuary and the period that a
 * derived billing would have got from its code.
 *
 * RAISED EMPTY, AND THAT IS THE ORDER OF THE PROCESS rather than a compromise.
 * Nothing has been endorsed, so there is nothing to count: the number comes
 * first because a terminated plan has to be posted against something, and the
 * plan holders are keyed in against it afterwards, one at a time. See
 * `canAddManualService`, which has always said exactly this.
 *
 * SAFE TO CALL TWICE. The key is derived from the mortuary and the period, so
 * a processor who raises the same franchisee's same cut again gets the billing
 * they already have, with the number it was already given.
 */
export function createFranchiseBilling(input: {
  mortCode: string;
  mortuaryName: string;
  chapelCode: string;
  period: BillingPeriod;
  periodLabel: string;
  cvDateISO: string;
  company: string;
}): { franchise: FranchiseBilling; billing: ClaimsBillingRecord } {
  const billingCode = franchiseBillingCode(input.mortCode, input.period);

  const existing = franchiseBillingByCode.get(billingCode);
  if (existing) {
    return { franchise: existing, billing: billingsByCode.get(billingCode)! };
  }

  const billing = createBilling(
    {
      billingCode,
      chapelCode: input.chapelCode,
      periodLabel: input.periodLabel,
      // The PERIOD's year and not the clock's, the rule every other minting
      // follows: the sequence in a billing number counts that year's services.
      year: input.period.year,
      // Nothing on it yet. The figure is a snapshot of the row at creation, as
      // it is for every billing; what the module counts is the accounts
      // themselves.
      accountCount: 0,
      company: input.company,
    },
    {
      cvDateISO: input.cvDateISO,
      mortuaryCode: input.mortCode,
      mortuaryName: input.mortuaryName,
    },
  );

  const franchise: FranchiseBilling = {
    billingCode,
    mortCode: input.mortCode,
    mortuaryName: input.mortuaryName,
    chapelCode: input.chapelCode,
    period: input.period,
    periodLabel: input.periodLabel,
    cvDateISO: input.cvDateISO,
    createdAtISO: new Date().toISOString(),
    createdBy: CREATED_BY,
  };

  franchiseBillingByCode.set(billingCode, franchise);
  emit();
  return { franchise, billing };
}

/** A paper-franchise billing by its key, if this session raised one. */
export function getFranchiseBilling(
  billingCode: string,
): FranchiseBilling | undefined {
  return franchiseBillingByCode.get(billingCode);
}

/** Every paper-franchise billing raised this session. */
export function getFranchiseBillings(): FranchiseBilling[] {
  return [...franchiseBillingByCode.values()];
}

/**
 * Close a paper franchise's ENTRY — the processor saying the stack of hard
 * copies has all been keyed in.
 *
 * WHAT IT STOPS is anything else being added. What it does NOT do is finish the
 * billing: the accounts still have to be terminated, and the ordinary
 * completion rule takes it from there. See {@link closedFranchiseEntryByCode}.
 *
 * Written once, like every other signature in this file — and there is
 * deliberately no re-opening. A list declared final that can be un-declared is
 * not a lock, and the answer to a sheet found afterwards is the supplementary
 * billing, which is what that module is for.
 */
export function closeFranchiseEntry(billingCode: string): void {
  if (closedFranchiseEntryByCode.has(billingCode)) return;
  closedFranchiseEntryByCode.set(billingCode, {
    verifiedBy: CREATED_BY,
    dateVerified: new Date().toISOString().slice(0, 10),
  });
  emit();
}

/** The lock on a paper franchise's entry, if the processor has closed it. */
export function getClosedFranchiseEntry(
  billingCode: string,
): VerifiedAccount | undefined {
  return closedFranchiseEntryByCode.get(billingCode);
}

/**
 * Save one plan holder's service record, and — when the billing it sits on can
 * take it — terminate the plan into that billing.
 *
 * ONE write, not two, because it is one action: the screen this replaces called
 * that button "Save Service Record" and ours calls it "Terminate", but either
 * way committing the record is what puts the plan's termination through.
 * Splitting it would bump `version` twice and let a component see a record saved
 * against an un-terminated plan.
 *
 * IT IS THE ONLY WAY TO TERMINATE, which is the other half of the same point. A
 * bare `terminatePlan(serviceId)` used to sit beside this with nothing calling
 * it; now that terminating INSERTS a row rather than setting a flag, a function
 * that could only write half of one would be an invitation to a `TblClaimsSP`
 * line with no service record behind it.
 *
 * `terminate` is the CALLER's decision rather than this function's, because the
 * rule behind it belongs to the billing: a plan cannot be terminated into a
 * billing that has no number yet, and the store deliberately knows nothing about
 * how a billing is derived. The page asks the billing and passes the answer.
 *
 * Re-saving overwrites. A service record is a form, not a ledger entry — unlike
 * {@link createBilling}, whose number is quoted outside this system and so is
 * issued once.
 */
/**
 * What terminating a plan sets its `TermiStatCode` to — off the NATURE OF
 * SERVICE the processor recorded (user-confirmed 2026-08-26).
 *
 *   ASSIGNED   → `SA`, SERVICED - ASSIGNED
 *   everything else (`IP OVER`, `IP WITHIN`, `NIP`) → `SP`, SERVICED - PLANHOLDER
 *
 * THE TWO CODES ARE THE SAME DISTINCTION THE FIELD IS, which is why the mapping
 * is one line and not a table: `RefTermiStatCode` has exactly one serviced code
 * for an assigned plan and one for the plan holder's own, and ASSIGNED is the
 * only value of the four that says the service was assigned. The other three are
 * about the deceased's insurable period, which does not change WHOSE plan was
 * used — so all three land on `SP`.
 *
 * A DEFAULT RATHER THAN A THROW for anything unrecognised. The value comes off a
 * dropdown this module fills, so a fourth answer would mean the list changed and
 * this did not; the safe side of that is the plan holder's own code, since `SA`
 * asserts something specific about how the service arrived.
 *
 * IT OVERRIDES WHATEVER THE PLAN SAID, `SP` and `SA` included — see
 * `PisDatabase.setTerminationStatus`.
 */
export function terminationStatusFor(
  natureOfService: string,
): TerminationStatus {
  return natureOfService === "ASSIGNED" ? "SA" : "SP";
}

export function saveServiceRecord(
  target: ServiceTarget,
  details: ServiceRecordDetails,
  terminate: boolean,
): SavedServiceRecord {
  const savedAtISO = new Date().toISOString();
  const record: SavedServiceRecord = {
    ...details,
    serviceId: target.serviceId,
    savedAtISO,
    savedBy: CREATED_BY,
  };

  recordsByServiceId.set(target.serviceId, record);

  // THE TERMINATION IS THE INSERT. The record above is a form the processor
  // filled in; this is the line the billing is actually paid from, and the two
  // halves of it come from the two arguments — who and what from `target`, how
  // much and against which mortuary from the form.
  if (terminate) {
    terminationsByServiceId.set(target.serviceId, {
      claimNo: target.claimNo,
      cisContractNo: target.contractNo,
      servicingChapel: target.servicingChapel,
      natureCode: target.natureCode,
      billingNo: target.billingNo,
      deceasedFirstName: details.deceasedFirstName,
      deceasedLastName: details.deceasedLastName,
      dateOfDeath: details.dateOfDeathISO,
      mortCode: details.mortuaryCode,
      cspCode: details.cspCode,
      creditOfService: details.creditOfService,
      // One field on the form, two columns on the row: the allowance is a peso
      // amount and the tick is whether there is one at all.
      isWithWreath: Number(details.withWreath) > 0,
      wreathAmt: Number(details.withWreath) || 0,
      auditUser: CREATED_BY,
      auditDate: savedAtISO,
    });

    // AND THE PLAN ITSELF MOVES. The insert above is the line the billing is
    // paid from; this is what becomes of the plan that was serviced, and it is
    // the one thing terminating writes outside this module's own tables.
    db.setTerminationStatus(
      target.lpaNo,
      terminationStatusFor(details.natureOfService),
    );
  }

  emit();
  return record;
}

/**
 * Key a plan holder in against a billing — the franchise path. See
 * {@link ManualService}.
 *
 * The id is minted here and is deliberately prefixed rather than shaped like a
 * derived service's `chapel-lpa`: a manual row and a derived one for the same
 * plan are two different services (one chapel served, one franchise reported),
 * and a colliding id would make the second overwrite the first everywhere ids
 * are the key — the service record, the documents, the termination flag.
 *
 * The SAME PLAN CAN BE KEYED IN TWICE, and nothing here stops it. A franchise
 * that sends the same endorsement twice is a real thing, and telling the two
 * apart is the processor's job with the paperwork in front of them; refusing the
 * second would only lose one of the two services a chapel is owed for when they
 * genuinely are two.
 */
export function addManualService(
  input: Omit<ManualService, "id" | "addedAtISO" | "addedBy">,
): ManualService {
  manualSeq += 1;
  const service: ManualService = {
    ...input,
    id: `manual-${input.billingCode}-${manualSeq}`,
    addedAtISO: new Date().toISOString(),
    addedBy: CREATED_BY,
  };

  const list = manualServicesByBilling.get(input.billingCode) ?? [];
  manualServicesByBilling.set(input.billingCode, [...list, service]);
  emit();
  return service;
}

/**
 * Take a keyed-in plan holder back off a billing — the undo for a row entered
 * against the wrong billing, or against the wrong plan.
 *
 * Only ever a manual row: a derived service is what the data says happened and
 * is not this store's to remove. The termination and the saved record that may
 * have been made against it go too, because they were about a service that is
 * no longer there.
 */
export function removeManualService(billingCode: string, serviceId: string) {
  const list = manualServicesByBilling.get(billingCode);
  const service = list?.find((s) => s.id === serviceId);
  if (!service) return;
  manualServicesByBilling.set(
    billingCode,
    list!.filter((s) => s.id !== serviceId),
  );

  // THE PLAN GOES BACK TOO, when this row had terminated it. Removing the
  // service without it would leave a plan reading SERVICED for a termination
  // that no longer exists anywhere — the one place in the module where a
  // termination is reversed, and so the one place that has to put the plan's own
  // status back.
  //
  // Conditional on there having BEEN a termination: a manual row taken off a
  // billing that was never created never terminated anything, and clearing the
  // status then would undo a termination that some other service made.
  if (terminationsByServiceId.has(serviceId)) {
    db.clearTerminationStatus(service.lpaNo);
  }

  terminationsByServiceId.delete(serviceId);
  recordsByServiceId.delete(serviceId);
  resolvedByServiceId.delete(serviceId);
  compliedByServiceId.delete(serviceId);
  notesByServiceId.delete(serviceId);
  emit();
}

/**
 * Record that a service's discrepancy has been put right.
 *
 * NOTHING CALLS THIS YET, and it is a waiting state rather than dead code — the
 * same position `complyDeficiency` is in one function down. A discrepancy is
 * corrected in a module that has not been built (user-confirmed 2026-08-25), and
 * this is the write that module makes when it lands. Its button was removed from
 * the record because recording a fix this workspace cannot make let a processor
 * mark an unfixed account fixed. See `ResolveDiscrepancyDialog`, kept with it.
 *
 * Says nothing about where the service goes next — that is the billing's
 * question, not this record's. See {@link ResolvedDiscrepancy}.
 *
 * Re-resolving overwrites, so a correction can be re-worded; there is
 * deliberately no un-resolve, for the same reason there is no un-terminate.
 */
export function resolveDiscrepancy(
  serviceId: string,
  note: string,
): ResolvedDiscrepancy {
  const resolved: ResolvedDiscrepancy = {
    serviceId,
    note: note.trim(),
    resolvedAtISO: new Date().toISOString(),
    resolvedBy: CREATED_BY,
  };
  resolvedByServiceId.set(serviceId, resolved);
  emit();
  return resolved;
}

/**
 * Record that a service's deficiency has been COMPLIED WITH — the document the
 * folder was short of has arrived.
 *
 * {@link resolveDiscrepancy}'s shape, one bucket over, and the same two rules:
 * it says nothing about where the service goes next — that is the billing's
 * question — and re-complying overwrites so the note can be re-worded.
 *
 * What it unlocks is the difference. A complied deficiency puts the service back
 * among the BILLABLE ones: it counts towards the billing's total again and its
 * plan can be terminated. A resolved discrepancy may not go back onto the same
 * billing at all, because a corrected plan on a billing that has already been
 * endorsed to accounting is the supplementary module's business.
 */
/*
 * NOTHING CALLS THIS YET, and that is a waiting state rather than dead code.
 *
 * Its one caller was `useComplyDeficiency`, behind the "Mark Complied" button on
 * the service record. Both are gone: compliance is a state of the FOLDER — the
 * documents a claim requires against the documents that have arrived — not a
 * judgement a processor presses a button to make, and a button meant the two
 * could disagree in either direction.
 *
 * What will call it is the claims info for the service on the plan holder
 * profile, once that exists: the moment a required document is filed, that is
 * the compliance, and this is where it gets recorded. The shape is already right
 * for it, so it stays.
 */
export function complyDeficiency(
  serviceId: string,
  note: string,
): CompliedDeficiency {
  const complied: CompliedDeficiency = {
    serviceId,
    note: note.trim(),
    compliedAtISO: new Date().toISOString(),
    compliedBy: CREATED_BY,
  };
  compliedByServiceId.set(serviceId, complied);
  emit();
  return complied;
}

/* ------------------------------ reads ------------------------------ */

/**
 * Plan holders keyed in by hand — for one billing, or every one of them when no
 * billing is named.
 */
export function getManualServices(billingCode?: string): ManualService[] {
  if (billingCode) return manualServicesByBilling.get(billingCode) ?? [];
  return [...manualServicesByBilling.values()].flat();
}

/**
 * Sign off a set of accounts as verified — the For Verification queue's action.
 *
 * TAKES A SET AND WRITES IT AS ONE, because that is what the button does: a
 * verifier ticks the rows they have checked and puts them through together, and
 * a version bump per account would have the stack re-deriving itself under them
 * once for every tick.
 *
 * ALREADY-VERIFIED ACCOUNTS ARE LEFT ALONE, not re-stamped. The signature says
 * who checked the account and when, and checking it again does not make that
 * earlier reading untrue — re-stamping would quietly rewrite the audit trail
 * this exists to be. The same rule `createBilling` follows for a number already
 * minted.
 *
 * Silent when there is nothing new to write, so a caller need not check first;
 * `emit` is skipped in that case rather than waking every subscriber to say
 * nothing happened.
 */
export function verifyServices(serviceIds: string[]): void {
  const dateVerified = new Date().toISOString().slice(0, 10);
  let wrote = false;

  for (const serviceId of serviceIds) {
    if (verifiedByServiceId.has(serviceId)) continue;
    verifiedByServiceId.set(serviceId, {
      verifiedBy: CREATED_BY,
      dateVerified,
    });
    wrote = true;
  }

  if (wrote) emit();
}

/** The signature against an account, if a verifier has put it through. */
export function getVerifiedAccount(
  serviceId: string,
): VerifiedAccount | undefined {
  return verifiedByServiceId.get(serviceId);
}

/**
 * Sign the BILLING itself — the act that sends it on to For Approval.
 *
 * SEPARATE FROM ITS ACCOUNTS, and the caller is trusted to have checked they are
 * all signed: `canVerifyBilling` is the rule and it is asked where the button is
 * drawn, not here. This function's job is the write.
 *
 * WRITTEN ONCE, like every other signature in this file: a billing already
 * verified keeps the date it was verified on, because re-stamping would rewrite
 * the audit trail this exists to be.
 */
export function verifyBilling(billingCode: string): void {
  if (verifiedBillingByCode.has(billingCode)) return;
  verifiedBillingByCode.set(billingCode, {
    verifiedBy: CREATED_BY,
    dateVerified: new Date().toISOString().slice(0, 10),
  });
  emit();
}

/** The signature on a billing, if one has been put through this session. */
export function getVerifiedBilling(
  billingCode: string,
): VerifiedAccount | undefined {
  return verifiedBillingByCode.get(billingCode);
}

/**
 * Approve a billing — the act that sends it on to For Endorsement.
 *
 * THE VERIFICATION'S COUNTERPART one stage on, and written the same way for the
 * same reasons: `TblClaimsBilling` carries `ApprovedBy` and `DateApproved` next
 * to the verified pair, this map is those two columns, and a billing already
 * approved keeps the date it was approved on.
 *
 * The caller is trusted to have checked the billing is ready — `canApproveBilling`
 * is that rule and it is asked where the button is drawn.
 */
export function approveBilling(billingCode: string): void {
  if (approvedBillingByCode.has(billingCode)) return;
  approvedBillingByCode.set(billingCode, {
    verifiedBy: CREATED_BY,
    dateVerified: new Date().toISOString().slice(0, 10),
  });
  emit();
}

/** The approval on a billing, if one has been given this session. */
export function getApprovedBilling(
  billingCode: string,
): VerifiedAccount | undefined {
  return approvedBillingByCode.get(billingCode);
}

/**
 * Endorse a billing — the act that hands it to accounting, and the last thing
 * this module does to it.
 *
 * THE APPROVAL'S COUNTERPART one stage on, written the same way: signed once,
 * and a billing already endorsed keeps the date it was endorsed on. What has no
 * counterpart is the destination — verifying sends a billing to For Approval and
 * approving sends it to For Endorsement, while this sends it OUT. See
 * {@link endorsedBillingByCode}.
 *
 * NOTHING IN `TblClaimsBilling` HOLDS IT YET. The row carries the verified and
 * approved pairs and no third; this map is the shape that column pair will have
 * when it exists, which is what the other three did before their columns were
 * confirmed.
 */
export function endorseBilling(billingCode: string): void {
  if (endorsedBillingByCode.has(billingCode)) return;
  endorsedBillingByCode.set(billingCode, {
    verifiedBy: CREATED_BY,
    dateVerified: new Date().toISOString().slice(0, 10),
  });
  emit();
}

/** The endorsement on a billing, if one has been given this session. */
export function getEndorsedBilling(
  billingCode: string,
): VerifiedAccount | undefined {
  return endorsedBillingByCode.get(billingCode);
}

/** How many of these accounts have been verified. */
export function countVerified(serviceIds: string[]): number {
  return serviceIds.reduce(
    (total, id) => total + (verifiedByServiceId.has(id) ? 1 : 0),
    0,
  );
}

/** The correction recorded against a service's discrepancy, if any. */
export function getResolvedDiscrepancy(
  serviceId: string,
): ResolvedDiscrepancy | undefined {
  return resolvedByServiceId.get(serviceId);
}

/** The compliance recorded against a service's deficiency, if any. */
export function getCompliedDeficiency(
  serviceId: string,
): CompliedDeficiency | undefined {
  return compliedByServiceId.get(serviceId);
}

/** The service record saved against a service this session, if any. */
export function getSavedServiceRecord(
  serviceId: string,
): SavedServiceRecord | undefined {
  return recordsByServiceId.get(serviceId);
}

/** The billing created against a billing code this session, if any. */
export function getCreatedBilling(
  billingCode: string,
): ClaimsBillingRecord | undefined {
  return billingsByCode.get(billingCode);
}

export function hasCreatedBilling(billingCode: string): boolean {
  return billingsByCode.has(billingCode);
}

/**
 * Write a note against a service. Blank notes are ignored.
 *
 * `addClaimNote`'s twin — see {@link notesByServiceId}.
 *
 * NOT BLOCKED BY A TERMINATED PLAN, and that is the same call the documents
 * section gets: terminating closes the RECORD, not the folder. A note explaining
 * why an amount was typed over is most likely to be written after the fact, and
 * it changes nothing that was billed.
 */
export function addServiceNote(serviceId: string, text: string): void {
  const note = text.trim();
  if (!note) return;
  const existing = notesByServiceId.get(serviceId) ?? [];
  notesByServiceId.set(serviceId, [...existing, note]);
  emit();
}

/** A service's notes, oldest first. */
export function getServiceNotes(serviceId: string): string[] {
  return notesByServiceId.get(serviceId) ?? [];
}

/** Whether this service's plan has been terminated into its billing. */
export function isPlanTerminated(serviceId: string): boolean {
  return terminationsByServiceId.has(serviceId);
}

/** How many of the given services have been terminated. */
export function countTerminated(serviceIds: string[]): number {
  return serviceIds.reduce(
    (n, id) => (terminationsByServiceId.has(id) ? n + 1 : n),
    0,
  );
}

/**
 * The `TblClaimsSP` row written for a service, if its plan has been terminated.
 *
 * The row rather than the flag, for the screens that show what was actually
 * posted — the mortuary it went against, the CSP code, the wreath.
 */
export function getTermination(serviceId: string): ClaimsSpRecord | undefined {
  return terminationsByServiceId.get(serviceId);
}

/** Every account terminated this session — the `TblClaimsSP` rows in full. */
export function getTerminations(): ClaimsSpRecord[] {
  return [...terminationsByServiceId.values()];
}

/**
 * Subscribe a component to the store. Returns the version, which is what makes
 * the component re-render — read the data itself through
 * `service-payables-data`, which overlays this store on the derived model:
 *
 *   useServicePayablesStore();            // subscribe
 *   const billings = getServiceBillings(); // read
 */
export function useServicePayablesStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getServerVersion);
}
