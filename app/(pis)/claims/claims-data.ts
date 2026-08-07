// Claims-area data access.
//
// The domain model and the seed database now live in the shared PIS data layer
// (`app/(pis)/data`). This module is a thin adapter over that layer: it
// re-exports the model types/helpers the claims UI uses and turns the domain
// objects (`Planholder`, `ClaimRequest`) into the view-models the existing
// components expect. Point new claims features at `@/app/(pis)/data` directly.

import {
  db,
  deathBenefitLabel,
  formatAgeOfDeath,
  formatFiledDate,
  fullYearsBetween,
  toFullName,
  toSurnameFirst,
  type ClaimKind,
  type ClaimPhase,
  type ClaimRequest as ClaimRequestModel,
  type ClaimsPayeeRecord,
  type Contestability,
  type Person,
  type PersonName,
  type Planholder as PlanholderModel,
} from "../data";
// Read-only: the seed rows carry a verification date the domain class does not
// expose yet. See `verifiedDateByRequest` below. `addressSeed` is read for the
// same reason — `Address` exposes only the one-line `formatted` string, and the
// beneficiary form binds to the individual parts. See `addressPartsOf`.
import { addressSeed, claimsHdrDCSeed } from "../data/seed";
import {
  getClaimEdit,
  getClaimEndorsement,
  getClaimNotes,
  getClaimRemarks,
  getClaimVerification,
  getCreatedDeathClaim,
  payeeDraftAddress,
  payeeDraftName,
  type CreatedDeathClaim,
  type DeathClaimComputation,
  type EndorsementTarget,
} from "./claim-store";

/* ------------------------------ re-exports ------------------------------ */

export {
  toFullName,
  toSurnameFirst,
  toInitials,
  // Re-exported so a payee added in the UI formats its date of birth exactly
  // as one read off a `Person` does, rather than growing a second format.
  formatFiledDate,
  Planholder,
  Person,
} from "../data";
export type {
  PersonName,
  PlanDetail,
  AccountStatus,
  Contestability,
  ClaimPhase,
  ClaimKind,
  Gender,
  CivilStatus,
} from "../data";

/* ------------------------------ lookups ------------------------------ */

export function getPerson(personId: string) {
  return db.getPerson(personId);
}

export function getPlanholder(lpaNo: string) {
  return db.getPlanholder(lpaNo);
}

/** Convenience: the plan holder's name for a given LPA number. */
export function planholderName(lpaNo: string): PersonName | undefined {
  return db.getPlanholder(lpaNo)?.name;
}

/** One row of the plan holder search — enough to identify a match and link to it. */
export interface PlanholderSearchResult {
  lpaNo: string;
  personId: string;
  /** Surname-first, as the profile header renders it. */
  name: string;
  /** Plan name, e.g. "ST.ANNE". */
  planDesc: string;
}

/**
 * Plan holders matching `query`, by LPA number or name.
 *
 * Matching is case-insensitive and substring-based on both the LPA number and
 * the full name — a processor holding a claim form types whichever of the two
 * the paperwork gave them, and part of it is enough. An empty query matches
 * nothing rather than everything: the search is a way in, not a directory.
 */
export function searchPlanholders(
  query: string,
  limit = 20,
): PlanholderSearchResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const results: PlanholderSearchResult[] = [];
  for (const planholder of db.getPlanholders()) {
    const name = planholder.name ? toFullName(planholder.name) : "";
    const matches =
      planholder.lpaNo.toLowerCase().includes(needle) ||
      name.toLowerCase().includes(needle);
    if (!matches) continue;

    results.push({
      lpaNo: planholder.lpaNo,
      personId: planholder.personId,
      name: planholder.name ? toSurnameFirst(planholder.name) : "—",
      planDesc: planholder.planDesc,
    });
    if (results.length >= limit) break;
  }
  return results;
}

/**
 * Every plan holder on file, in the shape the search results use.
 *
 * For a caller that does its OWN matching over a whole set rather than asking
 * for the matches — the kit's `LookupField`, which filters, sorts, filters by
 * column and paginates the array it is handed. `searchPlanholders` above is the
 * same rows, already narrowed; this is the set they are narrowed from.
 */
export function listPlanholders(): PlanholderSearchResult[] {
  return db.getPlanholders().map((planholder) => ({
    lpaNo: planholder.lpaNo,
    personId: planholder.personId,
    name: planholder.name ? toSurnameFirst(planholder.name) : "—",
    planDesc: planholder.planDesc,
  }));
}

/* ------------------------------ claim requests ------------------------------ */

export interface ClaimProcessor {
  name: string;
  initial: string;
}

/** Build a processor chip from a processor's name. */
export function toProcessor(name: string): ClaimProcessor {
  return { name, initial: (name[0] ?? "?").toUpperCase() };
}

/** A payee (claimant) on a claim — the person claiming that claim no. */
export interface ClaimPayeeView {
  personId: string;
  /** Full name of the claimant. */
  name: string;
  relation: string;
  amount: number;
}

/**
 * The flat claim row the plan holder's history list renders. Joins the claim
 * request to its claim header (for death claims) so the card can surface the
 * details the user cares about: Claim No, Claim Type, Status, Date of Death,
 * Age of Death, Contestability and the payee (claimant).
 */
export interface ClaimRequest {
  id: string;
  /** Public reference number (the request's primary key). */
  reference: string;
  lpaNo: string;
  /** The claim request type, e.g. "Death Claim", "Loan". */
  kind?: ClaimKind;
  /** Claim No — the claim header's key. Absent until a claim is opened. */
  claimNo?: string;
  /** Benefit full name (e.g. "Cash Assistance Benefits") — the claim "type". */
  benefit?: string;
  /** Machine-sortable filed date (ISO). */
  filedAt: string;
  /** Human-friendly filed label, e.g. "Apr 18, 2026". */
  filedDisplay: string;
  processor: ClaimProcessor;
  /** Claim Status. */
  phase: ClaimPhase;
  /** "within" / "over" — from the plan's effectivity. */
  contestability?: Contestability;
  /** Date of Death label (death claims only). */
  dateOfDeathDisplay?: string;
  /** Date of Death as an ISO date ("2026-04-14") — for edit form inputs. */
  dateOfDeathISO?: string;
  /** Age of Death, "61 yrs 1 mos 5 days" (death claims only). */
  ageOfDeath?: string;
  /** Payees (claimants) named on this claim. */
  payees?: ClaimPayeeView[];
  /** Branch that filed the request, e.g. "Quezon City Branch". */
  requestingBranch: string;
  /** Cause of the incident, e.g. "Natural Causes". */
  causeOfIncident: string;
  /** "Regular" / "Special" — from how soon after the incident it was filed. */
  natureOfClaim?: string;
  /** When the request was recorded, e.g. "Apr 18, 2026". */
  auditDateDisplay: string;
  /**
   * When the branch's paperwork reached the processor. Only set once a claim
   * has been opened — it is captured on the create form.
   */
  dateReceivedDisplay?: string;
  /** Date Received as an ISO date — for edit form inputs. */
  dateReceivedISO?: string;
  /** The claim computation, once a processor has worked it out. */
  computation?: DeathClaimComputation;
  /** Where the claim was last endorsed to, if it has been endorsed. */
  endorsedTo?: EndorsementTarget;
  /** "MARITES BELIESTA · Jul 27, 2026" — who endorsed it and when. */
  endorsedDisplay?: string;
  /**
   * Remarks written against this claim, oldest first, as one block of text —
   * the claim's audit trail. Verifying or endorsing adds a line here.
   */
  remarks: string;
  /**
   * Notes written against this claim, oldest first, as one block of text — a
   * processor's own working notes, kept apart from the remarks trail.
   */
  notes: string;
  /** Whether the claim's details have been checked over. */
  isVerified: boolean;
  /** "Jimwell Ocsio · Jul 27, 2026" — who verified it and when. */
  verifiedDisplay?: string;
}

/* ------------------------- remarks already on file ------------------------- */

/**
 * Verification dates from the claim headers, keyed by request number.
 *
 * `ClaimsHdrDC` exposes `isVerified` and `verifiedBy` but not `verifiedDate`,
 * so the date is read off the seed rows directly. Replace this with
 * `hdr.verifiedDate` as soon as the domain class gains that getter — it is a
 * one-line addition in `data/models.ts`, which this session may not edit.
 */
const verifiedDateByRequest = new Map(
  claimsHdrDCSeed
    .filter((hdr) => hdr.isVerified && hdr.verifiedDate)
    .map((hdr) => [hdr.claimRequest, hdr.verifiedDate as string]),
);

/**
 * The remarks a claim already carries from the source data, oldest first.
 *
 * A claim verified before this session should open with that on its record —
 * who checked it and when — rather than an empty trail that starts only when
 * someone touches it here.
 */
function remarksOnFile(requestNo: string): string[] {
  const hdr = db.getDeathClaimByRequest(requestNo);
  if (!hdr?.isVerified || !hdr.verifiedBy) return [];

  const verifiedAt = verifiedDateByRequest.get(requestNo);
  return [
    verifiedAt
      ? `${formatFiledDate(verifiedAt)} — Verified by ${hdr.verifiedBy}.`
      : `Verified by ${hdr.verifiedBy}.`,
  ];
}

/* --------------------- derived death-claim properties --------------------- */
//
// A pending request has no `ClaimsHdrDC` to read these off, so they are derived
// from the request itself — the same rules the domain class applies.

/** Filed within this many days of the incident, a claim is "special" (SC). */
const SPECIAL_CLAIM_DAYS = 7;

/**
 * "SC" (Special Claim) when the claim was filed within a week of the incident,
 * otherwise "RC" (Regular Claim). Mirrors `ClaimsHdrDC.natureCode`.
 */
export function deathClaimNatureCode(
  request: ClaimRequestModel,
): "SC" | "RC" {
  const days =
    (request.fileDate.getTime() - request.incidentDate.getTime()) / 86_400_000;
  return days <= SPECIAL_CLAIM_DAYS ? "SC" : "RC";
}

/** The nature of claim as a label — "Special" / "Regular". */
export function natureOfClaim(request: ClaimRequestModel): string {
  return deathClaimNatureCode(request) === "SC" ? "Special" : "Regular";
}

/**
 * Age of the deceased at the date of death, "61 yrs 1 mos 5 days". Mirrors
 * `ClaimsHdrDC.ageOfDeath`; "—" when the plan holder's birth date is unknown.
 */
export function ageOfDeathFor(
  request: ClaimRequestModel,
  planholder?: PlanholderModel,
): string {
  const dob = (planholder ?? db.getPlanholder(request.lpaNo))?.dateOfBirth;
  return dob ? formatAgeOfDeath(dob, request.incidentDate) : "—";
}

/** Payees filed against a request, trimmed to what the list card shows. */
function payeeViewsForRequest(requestNo: string): ClaimPayeeView[] {
  return payeeRecordsForRequest(requestNo).flatMap((p) => {
    const ids = payeePersonIds(p);
    return ids.map((pid) => {
      const person = db.getPerson(pid);
      return {
        personId: pid,
        name: person ? toFullName(person.name) : pid,
        relation: p.relation,
        amount: p.amount / ids.length,
      };
    });
  });
}

/**
 * Relationship shown for a payee named on the create form. The form captures a
 * name and address but not a relationship to the deceased, so the payee reads
 * as named-on-the-claim until one is recorded during processing.
 */
const CREATED_PAYEE_RELATION = "Named Payee";

/**
 * Fold a claim the processor opened this session over the request's view. This
 * is the only place the write store meets the read model — see `claim-store`.
 */
function applyCreatedClaim(view: ClaimRequest, created: CreatedDeathClaim) {
  view.claimNo = created.claimNo;
  view.benefit = deathBenefitLabel(created.benefits);
  // Creating the claim endorses it, so it is no longer "Pending".
  view.phase = created.statusLabel;
  view.contestability = created.contestability;
  view.dateOfDeathDisplay = formatFiledDate(created.dateOfDeathISO);
  view.dateOfDeathISO = created.dateOfDeathISO;
  view.causeOfIncident = created.causeOfDeath;
  view.natureOfClaim = created.natureCode === "SC" ? "Special" : "Regular";
  view.auditDateDisplay = formatFiledDate(created.createdAtISO);
  view.computation = created.computation;
  view.processor = toProcessor(created.processor);
  if (created.dateReceivedISO) {
    view.dateReceivedDisplay = formatFiledDate(created.dateReceivedISO);
    view.dateReceivedISO = created.dateReceivedISO;
  }

  // Opening the claim is when the computation is worked out, so it now decides
  // what the payees filed with the request are paid.
  const records = payeeRecordsForRequest(created.requestNo);
  if (records.length > 0) {
    const shareOf = netProceedsShare(records, created.computation.netProceeds);
    view.payees = records.flatMap((p) => {
      const ids = payeePersonIds(p);
      const share = shareOf(p) / ids.length;
      return ids.map((pid) => {
        const person = db.getPerson(pid);
        return {
          personId: pid,
          name: person ? toFullName(person.name) : pid,
          relation: p.relation,
          amount: share,
        };
      });
    });
  } else if (created.payee) {
    // No payee was filed with the request — a USB claim can name one on the
    // create form, so surface that.
    view.payees = [
      {
        personId: "",
        name: payeeDraftName(created.payee),
        relation: CREATED_PAYEE_RELATION,
        amount: created.computation.netProceeds,
      },
    ];
  }
}

/**
 * Fold a processor's corrections over the claim's view — the last word on the
 * four fields the drawer's Edit form can change.
 *
 * Only the date of death carries anything else with it: the age at death is
 * computed from it, so it is recomputed here rather than left describing the
 * date that was replaced.
 */
function applyClaimEdit(view: ClaimRequest, request: ClaimRequestModel) {
  const edit = getClaimEdit(request.requestNo);
  if (!edit) return;

  view.phase = edit.statusLabel;
  view.causeOfIncident = edit.causeOfDeath;

  // The edit holds the full set of values, so a field left blank was CLEARED —
  // it must not fall back to what the create form or the seed header said, or
  // the remark would record a change the claim does not show.
  view.dateOfDeathISO = edit.dateOfDeathISO || undefined;
  view.dateOfDeathDisplay = edit.dateOfDeathISO
    ? formatFiledDate(edit.dateOfDeathISO)
    : undefined;

  const dob = db.getPlanholder(request.lpaNo)?.dateOfBirth;
  view.ageOfDeath =
    dob && edit.dateOfDeathISO
      ? formatAgeOfDeath(dob, new Date(edit.dateOfDeathISO))
      : undefined;

  view.dateReceivedISO = edit.dateReceivedISO || undefined;
  view.dateReceivedDisplay = edit.dateReceivedISO
    ? formatFiledDate(edit.dateReceivedISO)
    : undefined;
}

/**
 * All claims filed against a plan, most recent first, each enriched with its
 * death-claim header details where available. Returns an empty array for plans
 * with no history yet.
 *
 * A pending death-claim request has NO header — the processor opens one on the
 * create form — so it renders with its reference in place of a claim no until
 * then. Call this from a component that also calls `useClaimStore()` so the
 * list re-renders when a claim is created.
 */
export function getClaimRequests(lpaNo: string): ClaimRequest[] {
  const contestability = db.getPlanholder(lpaNo)?.contestability;

  return db.getClaimRequestsByLpa(lpaNo).map((request) => {
    const view: ClaimRequest = {
      id: request.requestNo,
      reference: request.requestNo,
      lpaNo: request.lpaNo,
      kind: request.claimType,
      filedAt: request.fileDateISO,
      filedDisplay: formatFiledDate(request.fileDateISO),
      processor: toProcessor(request.auditUser),
      phase: request.statusLabel,
      contestability,
      requestingBranch: request.requestingBranch,
      causeOfIncident: request.causeOfIncident,
      auditDateDisplay: formatFiledDate(request.fileDateISO),
      // What the source data already records, then anything added this session.
      remarks: [
        ...remarksOnFile(request.requestNo),
        ...getClaimRemarks(request.requestNo),
      ].join("\n"),
      // Notes only ever come from this session — the source data has none.
      notes: getClaimNotes(request.requestNo).join("\n"),
      isVerified: false,
    };

    // Endorsements and verifications apply to any claim, whether it came from
    // the seed or was created this session.
    const endorsement = getClaimEndorsement(request.requestNo);
    if (endorsement) {
      view.endorsedTo = endorsement.target;
      view.endorsedDisplay = `${endorsement.endorsedBy} · ${formatFiledDate(
        endorsement.endorsedAtISO,
      )}`;
    }

    const verification = getClaimVerification(request.requestNo);
    if (verification) {
      view.isVerified = true;
      view.verifiedDisplay = `${verification.verifiedBy} · ${formatFiledDate(
        verification.verifiedAtISO,
      )}`;
    }

    // Death claims carry extra header detail (claim no, dates, age). The
    // header comes from the store for claims opened this session, and from the
    // mock database for ones that were already processed.
    if (request.claimType === "Death Claim") {
      view.dateOfDeathDisplay = formatFiledDate(request.incidentDateISO);
      view.dateOfDeathISO = request.incidentDateISO.slice(0, 10);
      view.natureOfClaim = natureOfClaim(request);
      view.ageOfDeath = ageOfDeathFor(request);

      // The payee is filed WITH the request, so every death claim has one —
      // pending or not. It may well not be the beneficiary.
      view.payees = payeeViewsForRequest(request.requestNo);

      const created = getCreatedDeathClaim(request.requestNo);
      const hdr = created
        ? undefined
        : db.getDeathClaimByRequest(request.requestNo);

      if (created) {
        applyCreatedClaim(view, created);
      } else if (hdr && request.statusLabel !== "Pending") {
        // A pending request has no header yet; its seed header exists only to
        // join the request to its payee. See `payeeRecordsForRequest`.
        view.claimNo = hdr.claimNo;
        view.benefit = deathBenefitLabel(hdr.benefits);
        view.phase = hdr.statusLabel;
        view.contestability = hdr.contestability;
        view.dateOfDeathDisplay = formatFiledDate(hdr.dateOfDeathISO);
        view.dateOfDeathISO = hdr.dateOfDeathISO.slice(0, 10);
        view.ageOfDeath = hdr.ageOfDeath;
        // Claims verified before this session. A verification recorded above
        // is more recent, so it wins.
        if (!view.isVerified && hdr.isVerified && hdr.verifiedBy) {
          const verifiedAt = verifiedDateByRequest.get(request.requestNo);
          view.isVerified = true;
          view.verifiedDisplay = verifiedAt
            ? `${hdr.verifiedBy} · ${formatFiledDate(verifiedAt)}`
            : hdr.verifiedBy;
        }
      }
    }

    // Corrections a processor made by hand. Applied LAST so they win over both
    // the seed header and the create form — correcting a claim is the whole
    // point of the edit, and every change is on the record as a remark.
    applyClaimEdit(view, request);

    // Living-benefit claims (Dismemberment, Waiver of Installment) are paid to
    // the plan holder, who is still alive to receive them — they carry no
    // `ClaimsPayee` row, so default to the plan holder.
    //
    // Death claims are deliberately excluded: they are paid to the payee named
    // on the request, and defaulting a death claim here would name the DECEASED
    // as their own payee.
    if (
      request.claimType !== "Death Claim" &&
      (!view.payees || view.payees.length === 0)
    ) {
      const ph = db.getPlanholder(request.lpaNo);
      if (ph?.person) {
        view.payees = [
          {
            personId: ph.personId,
            name: toFullName(ph.person.name),
            relation: "Plan Holder",
            amount: ph.planDetail.contractPrice,
          },
        ];
      }
    }

    return view;
  });
}

/* ------------------------------ badges ------------------------------ */

/** Map a claim status to the OSPBadge type used across the app. */
export function phaseBadgeType(
  phase: ClaimPhase,
): "success" | "warning" | "danger" | undefined {
  switch (phase) {
    case "Approved":
      return "success";
    case "For Approval":
      return "warning";
    case "For Denial":
    case "Denied":
      return "danger";
    default:
      return undefined;
  }
}

/* ------------------------------ remarks & notes ------------------------------ */

/** Remarks recorded against a plan, as one block of text. */
export function getPlanholderRemarks(lpaNo: string): string {
  return db
    .getPlanholderRemarks(lpaNo)
    .map((r) => r.value)
    .join("\n\n");
}

/** Notes recorded against a plan, as one block of text. */
export function getPlanholderNotes(lpaNo: string): string {
  return db
    .getPlanholderNotes(lpaNo)
    .map((n) => n.value)
    .join("\n\n");
}

/* ------------------------------ payees ------------------------------ */

/** The person id(s) named on a payee row — payee one, then payee two if any. */
function payeePersonIds(p: {
  payeeOneId: string;
  payeeTwoId?: string;
}): string[] {
  return p.payeeTwoId ? [p.payeeOneId, p.payeeTwoId] : [p.payeeOneId];
}

/**
 * The payee rows filed against a claim request.
 *
 * A payee is captured WITH the request — filing one is required — so a claim
 * has a named payee long before a processor opens its header. The payee is not
 * the beneficiary: it can be someone else entirely.
 *
 * In the source model `ClaimsPayee` references both the request and the header
 * (`ClaimsPayee.ClaimsRequest` / `.ClaimNo`). The seed rows only carry
 * `claimNo`, so the request's header row is used as the join table that
 * `ClaimsRequest` will replace. That is the ONLY reason the seed keeps a header
 * on a pending request — see the note in `death/death-claims-data.ts`.
 */
function payeeRecordsForRequest(requestNo: string): ClaimsPayeeRecord[] {
  const claimNo = db.getDeathClaimByRequest(requestNo)?.claimNo;
  return claimNo ? db.getPayees(claimNo) : [];
}

/**
 * Share out a claim's net proceeds across its payee rows, in proportion to the
 * amounts they were filed with. The computation is worked out when the claim
 * header is opened, so it only replaces the filed amounts once that happens.
 */
function netProceedsShare(
  records: ClaimsPayeeRecord[],
  netProceeds: number,
): (record: ClaimsPayeeRecord) => number {
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  return (record) =>
    total > 0
      ? (record.amount / total) * netProceeds
      : netProceeds / records.length;
}

/** A payee named on a claim, flattened with the person's contact details. */
export interface ClaimPayee {
  idx: number;
  claimNo: string;
  personId: string;
  /** Payee's full name, e.g. "Juan D. Dela Cruz". */
  name: string;
  /** Relationship to the deceased, e.g. "Spouse". */
  relation: string;
  amount: number;
  /** Peso-formatted amount, e.g. "₱125,000.00". */
  amountDisplay: string;
  /** Date of birth, formatted "Apr 18, 2026", or "—". */
  birthDate: string;
  /** Date of birth as an ISO date ("1962-04-14"), or "" — for edit form inputs. */
  birthDateISO: string;
  /** One-line primary address, or "—". */
  address: string;
  /** Primary contact number, or "—". */
  contact: string;
  email?: string;
  /** Whether the payout is currently on hold. */
  isOnHold: boolean;
  /** Free-text remarks on the payee/payout, if any. */
  remarks?: string;
  /** Where the benefit is released, e.g. "BDO •••••7890". "—" if none. */
  payout: string;
  /** Payout channel display name, e.g. "BDO" / "GCash". "—" if none. */
  channelName: string;
  /** Payout channel reference code, or "" — used to preselect the edit form. */
  channelCode: string;
  /** Full, unmasked account number — shown on demand for confirmation. "—" if none. */
  accountNo: string;
  /** Account number with all but the last four digits masked. "—" if none. */
  accountNoMasked: string;
  /** The payout branch / bank location, or "—". */
  payoutBranch: string;
}

/**
 * Flatten payee rows, joining each named person's contact and payout details.
 * A row naming two (joint) payees becomes two entries splitting the amount.
 *
 * `amountOf` decides what the row is worth: the amount it was filed with by
 * default, or the processor's computed share once the claim header exists.
 */
function toClaimPayees(
  records: ClaimsPayeeRecord[],
  amountOf: (record: ClaimsPayeeRecord) => number = (record) => record.amount,
): ClaimPayee[] {
  return records.flatMap((p) => {
    const ids = payeePersonIds(p);
    const share = amountOf(p) / ids.length;
    return ids.map((pid) => {
      const person = db.getPerson(pid);
      const account =
        person?.payoutAccounts.find((a) => a.isActive) ??
        person?.payoutAccounts[0];
      return {
        idx: p.idx,
        claimNo: p.claimNo,
        personId: pid,
        name: person ? toFullName(person.name) : pid,
        relation: p.relation,
        amount: share,
        amountDisplay:
          "₱" + share.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
        birthDate: person
          ? formatFiledDate(person.dateOfBirth.toISOString())
          : "—",
        birthDateISO: person
          ? person.dateOfBirth.toISOString().slice(0, 10)
          : "",
        address: person?.address ?? "—",
        contact: person?.contact ?? "—",
        email: person?.email,
        isOnHold: p.isOnHold,
        remarks: p.remarks,
        payout: account
          ? `${account.channelName} ${account.maskedAccountNo}`
          : "—",
        channelName: account?.channelName ?? "—",
        channelCode: account?.channelCode ?? "",
        accountNo: account?.accountNo ?? "—",
        accountNoMasked: account?.maskedAccountNo ?? "—",
        payoutBranch: account?.payoutBranch ?? "—",
      };
    });
  });
}

/** Payees named on a claim, joined to each person's name and contact info. */
export function getClaimPayees(claimNo: string): ClaimPayee[] {
  return toClaimPayees(db.getPayees(claimNo));
}

/**
 * Payees to render for a claim request.
 *
 * The payee is filed with the request, so this returns one whether or not a
 * processor has opened the claim yet. Once the header exists its computation
 * takes over what the payee is paid — the computation is worked out as part of
 * opening the claim, so before that the filed amount stands.
 */
export function getClaimPayeesForRequest(requestNo: string): ClaimPayee[] {
  const created = getCreatedDeathClaim(requestNo);
  const records = payeeRecordsForRequest(requestNo);

  if (records.length > 0) {
    return created
      ? toClaimPayees(
          records,
          netProceedsShare(records, created.computation.netProceeds),
        )
      : toClaimPayees(records);
  }

  // No payee on file. A USB claim can name one on the create form, so fall
  // back to that; otherwise the claim genuinely has no payee yet.
  if (created?.payee) {
    const amount = created.computation.netProceeds;
    return [
      {
        idx: 1,
        claimNo: created.claimNo,
        personId: "",
        name: payeeDraftName(created.payee),
        relation: CREATED_PAYEE_RELATION,
        amount,
        amountDisplay:
          "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
        birthDate: "—",
        birthDateISO: "",
        address: payeeDraftAddress(created.payee),
        contact: "—",
        isOnHold: false,
        payout: "—",
        channelName: "—",
        channelCode: "",
        accountNo: "—",
        accountNoMasked: "—",
        payoutBranch: "—",
      },
    ];
  }
  return [];
}

/** Payout channel options for the payee edit form ({ label, value } pairs). */
export function getPayoutChannelOptions(): { label: string; value: string }[] {
  return db
    .getPayoutChannels()
    .map((c) => ({ label: c.channelDesc, value: c.channelCode }));
}

/* ------------------------------ documents ------------------------------ */

/** A document on file, flattened for the plan holder's Documents list. */
export interface PlanholderDocument {
  id: number;
  /** Document type code, e.g. "CS000456". */
  code: string;
  /** Document type name, e.g. "REGISTERED DEATH CERTIFICATE". */
  name: string;
  /** File name at the end of the stored path, e.g. "death-cert.pdf". */
  fileName: string;
  /** Uppercase file extension, e.g. "PDF". */
  format: string;
  /** Where the file is stored. */
  url: string;
}

/** A selectable document type — the kind of file being added. */
export interface DocumentType {
  code: string;
  name: string;
}

/** Every document type on file, for the "add document" type picker. */
export function getDocumentTypes(): DocumentType[] {
  return db
    .getDocumentTypes()
    .map((d) => ({ code: d.documentCode, name: d.documentDesc }));
}

/** Documents filed for a person, joined to their document type. */
export function getPlanholderDocuments(personId: string): PlanholderDocument[] {
  return db.getDocuments(personId).map((doc) => {
    const fileName = doc.value.split("/").pop() ?? doc.value;
    const ext = fileName.includes(".") ? fileName.split(".").pop()! : "";
    return {
      id: doc.docId,
      code: doc.documentCode,
      name: db.getDocumentType(doc.documentCode)?.documentDesc ?? doc.documentCode,
      fileName,
      format: ext.toUpperCase(),
      url: doc.value,
    };
  });
}

/* ------------------------------ payments ------------------------------ */

/** A plan's payment (official receipt) as flattened for the payments list. */
export interface PlanholderPayment {
  /** Official Receipt number — the row's stable key. */
  orNo: string;
  /** Pay class name, e.g. "NEW SALE" / "DEFFERED COLLECTION". */
  payClass: string;
  /** OR date, formatted for display, e.g. "Jan 05, 2021". */
  orDate: string;
  /** Raw OR date (`YYYY-MM-DD`) — sorts the display date chronologically. */
  orDateISO: string;
  /** Peso-formatted amount, e.g. "₱1,250.00". */
  amountDisplay: string;
  /** Raw amount — sorts the display amount numerically. */
  amount: number;
}

/* ------------------------------ other plans ------------------------------ */

/** Another plan owned by the same person, for the Other Plans section. */
export interface PlanholderOtherPlan {
  /** The plan's LPA number — the row's key and its navigation target. */
  lpaNo: string;
  /** Plan name, e.g. "ST.ANNE". */
  planDesc: string;
  /** Plan code, e.g. "B5M10". */
  planCode: string;
  /** Whether the plan is active — drives the row's status pill. */
  isActive: boolean;
  /** Account status label, "Active" or "Lapsed". */
  statusLabel: string;
  /** Effectivity date, formatted for display, e.g. "May 01, 2021". */
  effectivity: string;
}

/**
 * The OTHER plans owned by the person on this plan — every plan sharing the
 * same `personId`, minus the one being viewed.
 *
 * A person buying more than one plan is ordinary, and a processor working a
 * claim needs to see the rest. Returns an empty array when this is the person's
 * only plan; the section hides itself on that.
 */
export function getOtherPlansForPerson(
  personId: string,
  currentLpaNo: string,
): PlanholderOtherPlan[] {
  return db
    .getPlanholders()
    .filter((p) => p.personId === personId && p.lpaNo !== currentLpaNo)
    .map((p) => ({
      lpaNo: p.lpaNo,
      planDesc: p.planDesc,
      planCode: p.planCode,
      isActive: p.accountStatus === "AC",
      statusLabel: p.accountStatus === "AC" ? "Active" : "Lapsed",
      effectivity: formatFiledDate(p.effectivityDate.toISOString()),
    }));
}

/* ---------------------------- beneficiaries ---------------------------- */

/**
 * A beneficiary named on a plan, flattened for the Beneficiaries section.
 *
 * NOT the same as a claim payee ({@link ClaimPayee}): a beneficiary is declared
 * by the plan holder when the plan is bought and belongs to the PLAN, while a
 * payee is filed against a specific CLAIM and can be someone else entirely.
 */
export interface PlanholderBeneficiary {
  /** `Beneficiary.beneficiaryId`, or a generated id for one added in-session. */
  id: string;
  /** The person named, or "" for one added in-session (no Person row yet). */
  personId: string;
  /** Full name, e.g. "Rogelio C. Santos" — what the row displays. */
  name: string;
  /** Name broken into parts — what the edit form binds to. */
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  /** Age in full years, derived from `birthDateISO`. */
  age: number;
  /** Date of birth as an ISO date ("1965-01-19"), or "" — for the date input. */
  birthDateISO: string;
  /** Relationship to the plan holder, e.g. "Spouse". "—" when not on file. */
  relation: string;
  /** One-line address, or "" — what the row and drawer display. */
  address: string;
  /**
   * The payout channels registered for this beneficiary. Empty means nothing
   * is on file — the form's Payout Channel section opens ready to add one.
   */
  payouts: BeneficiaryPayout[];
  /** Address broken into parts — what the edit form binds to. */
  lotBldgUnit: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

/** The address parts a beneficiary form binds to, all blank when none is on file. */
const NO_ADDRESS = {
  lotBldgUnit: "",
  street: "",
  barangay: "",
  district: "",
  city: "",
  province: "",
  zipCode: "",
};

/**
 * A person's primary address, broken into the parts the form edits.
 *
 * Read off the seed row rather than the `Address` domain class: that class
 * exposes only the assembled one-line `formatted` string. `AddressRecord` has
 * no district column, so `district` is always blank — the field exists for
 * parity with the payee form, which captures one.
 */
function addressPartsOf(personId: string): typeof NO_ADDRESS {
  const record = addressSeed.find((a) => a.personId === personId);
  if (!record) return { ...NO_ADDRESS };
  return {
    lotBldgUnit: record.addressNo ?? "",
    street: record.street ?? "",
    barangay: record.barangay ?? "",
    district: "",
    city: record.city ?? "",
    province: record.province ?? "",
    zipCode: record.zipCode ? String(record.zipCode) : "",
  };
}

/** Age in full years today from an ISO date of birth. 0 when not given. */
export function ageFromBirthDateISO(iso: string): number {
  if (!iso) return 0;
  const dob = new Date(iso);
  return Number.isNaN(dob.getTime()) ? 0 : fullYearsBetween(dob, new Date());
}

/** A date as an ISO date string ("1965-01-19"), for date inputs. */
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** One payout channel registered against a beneficiary. */
export interface BeneficiaryPayout {
  /** `payoutId`, or a generated id for one added in-session. */
  id: string;
  /** Channel code, e.g. "93" — the value the channel select binds to. */
  channelCode: string;
  /** Channel display name, e.g. "GCASH" / "BDO NETWORK BANK". */
  channelName: string;
  /** Channel type, e.g. "EWALLET". "" when the code is unknown. */
  channelType: string;
  /** Full payout account number. */
  accountNo: string;
  /** Account number with all but the last four digits masked. */
  accountNoMasked: string;
}

/** Mask all but the last four digits, matching `PayoutAccount`. */
export function maskAccountNo(raw: string): string {
  return raw.length <= 4
    ? raw
    : `${"•".repeat(raw.length - 4)}${raw.slice(-4)}`;
}

/**
 * A channel's display name and type by code — what a newly registered payout
 * needs to render like one that came off a `PayoutAccount`.
 */
export function getPayoutChannelByCode(
  channelCode: string,
): { channelName: string; channelType: string } | undefined {
  const channel = db.getPayoutChannel(channelCode);
  return channel
    ? { channelName: channel.channelDesc, channelType: channel.channelType }
    : undefined;
}

/**
 * A person's registered payout channels — the active one first, so the primary
 * account heads the list the way the claim payee view resolves it.
 */
function payoutsOf(person: Person | undefined): BeneficiaryPayout[] {
  const accounts = [...(person?.payoutAccounts ?? [])].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );
  return accounts.map((account) => ({
    id: account.payoutId,
    channelCode: account.channelCode,
    channelName: account.channelName,
    channelType: account.channelType ?? "",
    accountNo: account.accountNo,
    accountNoMasked: account.maskedAccountNo,
  }));
}

/** The relationships offered by the beneficiary form's Relationship select. */
export function getBeneficiaryRelationOptions(): {
  label: string;
  value: string;
}[] {
  return ["Spouse", "Child", "Parent", "Sibling", "Other"].map((r) => ({
    label: r,
    value: r,
  }));
}

/**
 * The beneficiaries declared on a plan, for the Beneficiaries section.
 *
 * `db.getBeneficiaries` already resolves the `Person` navigation property and
 * computes the age, so this only flattens the domain object into the row's
 * view-model.
 */
export function getPlanholderBeneficiaries(
  lpaNo: string,
): PlanholderBeneficiary[] {
  return db.getBeneficiaries(lpaNo).map((b) => ({
    id: b.beneficiaryId,
    personId: b.personId,
    name: b.name ? toFullName(b.name) : b.personId,
    lastName: b.name?.lastName ?? "",
    firstName: b.name?.firstName ?? "",
    middleName: b.name?.middleName ?? "",
    suffix: b.name?.suffix ?? "",
    age: b.age ?? 0,
    birthDateISO: b.person ? toISODate(b.person.dateOfBirth) : "",
    relation: b.relation,
    address: b.person?.addresses[0]?.formatted ?? "",
    ...addressPartsOf(b.personId),
    payouts: payoutsOf(b.person),
  }));
}

/** A plan's payment ledger (most recent first) for the payments section. */
export function getPlanholderPayments(lpaNo: string): PlanholderPayment[] {
  return db
    .getPayments(lpaNo)
    .map((p) => ({
      orNo: p.orNo,
      payClass: p.payClassName,
      orDate: formatFiledDate(p.orDateISO),
      orDateISO: p.orDateISO,
      amountDisplay:
        "₱" + p.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
      amount: p.amount,
    }))
    .reverse();
}
