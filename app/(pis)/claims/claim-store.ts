"use client";

// Claims-local write store.
//
// The shared PIS data layer (`app/(pis)/data`) is read-only: `db` serves seed
// rows and nothing in the app can change them. The death-claim flow needs
// exactly one write — the processor opens a `ClaimsHdrDC` against a
// `ClaimRequest` that the branch already filed — so that write lives here,
// next to the claims UI rather than in the shared layer.
//
// The store sits IN FRONT of `db`: `claims-data.ts` and `death-claims-data.ts`
// read the seed and then overlay whatever this holds. A request with a created
// claim leaves the processor's queue and starts rendering as a real claim on
// the plan holder's page.
//
// When the real API is wired in, `createDeathClaim` becomes the POST and the
// read helpers become cache reads. Nothing is persisted — a refresh clears it.

import { useSyncExternalStore } from "react";
import {
  db,
  formatFiledDate,
  type Contestability,
  type DeathBenefit,
} from "../data";
import type { ClaimPhase } from "../data";

/* ------------------------------ model ------------------------------ */

/**
 * The claim computation the processor works out on the create form. Held here
 * because `ClaimsHdrDCRecord` has no columns for it — see the note at the top
 * of this file.
 */
export interface DeathClaimComputation {
  planValue: number;
  percentRate: number;
  /** planValue × percentRate ÷ 100. */
  gross: number;
  processingFee: number;
  others: number;
  /** gross − processingFee − others. */
  netProceeds: number;
}

/**
 * The payee captured on the create form. Only Unrendered Service Benefit (USB)
 * claims name one here — every other benefit gets its payee added later, on
 * the plan holder's page.
 */
export interface DeathClaimPayeeDraft {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  lotBldgUnit?: string;
  street?: string;
  barangay?: string;
  district?: string;
  city?: string;
  province?: string;
  zipCode?: string;
}

/** A death claim header the processor opened, as the store keeps it. */
export interface CreatedDeathClaim {
  /** Generated on creation — territory + "DC" + 2-digit year + 6-digit seq. */
  claimNo: string;
  /** The `ClaimRequest` this claim was opened against. */
  requestNo: string;
  lpaNo: string;
  benefits: DeathBenefit;
  /** ISO date the branch's paperwork reached the processor. "" if not given. */
  dateReceivedISO: string;
  dateOfDeathISO: string;
  causeOfDeath: string;
  natureCode: "SC" | "RC";
  contestability: Contestability;
  statusLabel: ClaimPhase;
  processor: string;
  /** ISO timestamp the claim was opened (the header's audit date). */
  createdAtISO: string;
  computation: DeathClaimComputation;
  payee?: DeathClaimPayeeDraft;
}

/**
 * The status a new claim is suggested to take.
 *
 * Opening the header is normally the endorsement: the processor works the claim
 * and submits it, which hands it to the supervisor for approval. That is only
 * the default, though — the processor picks the status on the form (see
 * {@link SELECTABLE_CLAIM_STATUSES}), because a claim can also be parked as
 * Pending or sent down the denial route instead.
 */
export const CREATED_CLAIM_STATUS: ClaimPhase = "For Approval";

/**
 * The statuses a processor may put a claim into.
 *
 * "Approved" and "Denied" are deliberately absent: those are the supervisor's
 * verdict on an endorsed claim, not something the processor opening the header
 * can assign to it.
 */
export const SELECTABLE_CLAIM_STATUSES: ClaimPhase[] = [
  "Pending",
  "For Approval",
  "For Denial",
];

/**
 * What `createDeathClaim` needs — everything but the generated identifiers,
 * which creating the claim decides.
 */
export type CreateDeathClaimInput = Omit<
  CreatedDeathClaim,
  "claimNo" | "createdAtISO"
> & {
  /** Raw branch code (e.g. "DAVAO") — supplies the claim no's territory. */
  requestingBranchCode: string;
};

/* ------------------------------ claim numbers ------------------------------ */

/**
 * Next sequence number, seeded from the highest one already on file so a
 * created claim never collides with the mock database.
 */
let nextSequence = (() => {
  const highest = db
    .getDeathClaims()
    .reduce((max, c) => Math.max(max, Number(c.claimNo.slice(-6)) || 0), 0);
  return highest + 1;
})();

/**
 * Build a claim no the same way the source system does: the branch's territory
 * code, the "DC" claim code, a 2-digit year and a 6-digit sequence — e.g.
 * "MW1DC26009805" for a Davao (territory MW1) claim opened in 2026.
 */
function generateClaimNo(branchCode: string, createdAt: Date): string {
  const territory = db.getBranch(branchCode)?.territoryCode ?? branchCode;
  const year = String(createdAt.getFullYear()).slice(-2);
  const seq = String(nextSequence++).padStart(6, "0");
  return `${territory}DC${year}${seq}`;
}

/* ------------------------------ endorsement ------------------------------ */

/**
 * Who a claim can be endorsed to. A claim moves up one level at a time: a
 * processor hands their finished work to a supervisor, and a supervisor hands
 * a reviewed claim to a manager.
 */
export type EndorsementTarget = "Supervisor" | "Manager" | "Accounting";

/**
 * The endorsement options offered in the drawer, in the order they escalate:
 * a processor hands work to a supervisor, a supervisor to a manager, and an
 * approved claim goes to accounting to be released.
 *
 * Every option is shown to everyone for now — which one applies depends on the
 * signed-in user's role, and roles are not wired into this screen yet.
 */
export const ENDORSEMENT_TARGETS: {
  target: EndorsementTarget;
  label: string;
  description: string;
}[] = [
  {
    target: "Supervisor",
    label: "To Supervisor",
    description: "A processor endorsing a claim they have finished working.",
  },
  {
    target: "Manager",
    label: "To Manager",
    description: "A supervisor endorsing a claim they have reviewed.",
  },
  {
    target: "Accounting",
    label: "To Accounting",
    description: "An approved claim going out for release of the benefit.",
  },
];

/** A recorded endorsement — who sent the claim onward, to whom, and when. */
export interface ClaimEndorsement {
  requestNo: string;
  target: EndorsementTarget;
  endorsedBy: string;
  endorsedAtISO: string;
}

/* ------------------------------ edits ------------------------------ */

/**
 * The fields a processor may correct on a claim after it has been filed,
 * mapped to how they read in the audit trail.
 *
 * Everything else on the claim is either an identifier, derived from the plan
 * (contestability, age at death), or worked out on the create form — so this is
 * deliberately short: the details a branch commonly gets wrong on the paperwork,
 * plus the status, which is how the claim is moved by hand.
 */
export const EDITABLE_CLAIM_FIELDS = {
  causeOfDeath: "Cause of Death",
  dateOfDeathISO: "Date of Death",
  dateReceivedISO: "Date Received",
  statusLabel: "Claim Status",
} as const;

export type EditableClaimField = keyof typeof EDITABLE_CLAIM_FIELDS;

/** The editable values, as the edit form holds them. Dates are ISO ("2026-04-18"). */
export interface ClaimEditValues {
  causeOfDeath: string;
  dateOfDeathISO: string;
  dateReceivedISO: string;
  statusLabel: ClaimPhase;
}

/** A recorded edit — the corrected values, plus who changed them and when. */
export interface ClaimEdit extends ClaimEditValues {
  requestNo: string;
  editedBy: string;
  editedAtISO: string;
}

/** A recorded verification — who checked the claim over, and when. */
export interface ClaimVerification {
  requestNo: string;
  verifiedBy: string;
  verifiedAtISO: string;
}

/**
 * Who is credited for actions taken on a claim — the audit user on every
 * remark this session writes.
 *
 * Hard-coded until the claims screens can read the signed-in user: the session
 * cookie carries a role, not a name, so there is nobody real to attribute an
 * action to yet.
 */
export const CLAIM_AUDIT_USER = "Jimwell Ocsio";

/* ------------------------------ store ------------------------------ */

/** Created claims, keyed by the request number they were opened against. */
const claimsByRequest = new Map<string, CreatedDeathClaim>();

/**
 * Endorsements, keyed by request number. Kept separate from the created claims
 * above because a claim endorsed in the seed can be endorsed onward without
 * ever having been created in this session.
 */
const endorsementsByRequest = new Map<string, ClaimEndorsement>();

/**
 * Remarks written against a claim, oldest first — the claim's running audit
 * trail. Endorsing appends a line here, so the sequence of hand-offs is
 * readable on the claim itself rather than only as its current position.
 */
const remarksByRequest = new Map<string, string[]>();

/**
 * Notes written against a claim, oldest first — a processor's own working
 * notes. Kept apart from the remarks trail: remarks record what happened to the
 * claim, notes record what someone wants remembered about it.
 */
const notesByRequest = new Map<string, string[]>();

/** Verifications, keyed by request number. Same reasoning as endorsements. */
const verificationsByRequest = new Map<string, ClaimVerification>();

/**
 * Corrections, keyed by request number. Held apart from the created claims so a
 * claim that came from the seed can be corrected without first being re-created,
 * and so the read model can tell "as filed" from "as corrected".
 */
const editsByRequest = new Map<string, ClaimEdit>();

const listeners = new Set<() => void>();

/**
 * Bumped on every write. `useSyncExternalStore` compares this rather than the
 * map itself, so a mutable Map is safe to hand out.
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
 * Open a death claim header against an existing claim request. Generates the
 * claim no, records it, and notifies subscribers — which moves the claim off
 * the processor's queue and on to whoever `statusLabel` hands it to.
 *
 * Creating twice for the same request overwrites — re-submitting the form
 * corrects the claim rather than opening a second one against the same filing.
 */
export function createDeathClaim(
  input: CreateDeathClaimInput,
): CreatedDeathClaim {
  const { requestingBranchCode, ...rest } = input;
  const createdAt = new Date();

  // Keep the claim no stable when a claim is re-submitted.
  const existing = claimsByRequest.get(input.requestNo);
  const claim: CreatedDeathClaim = {
    ...rest,
    claimNo: existing?.claimNo ?? generateClaimNo(requestingBranchCode, createdAt),
    createdAtISO: existing?.createdAtISO ?? createdAt.toISOString(),
  };

  claimsByRequest.set(claim.requestNo, claim);
  emit();
  return claim;
}

/** Append a remark to a claim's audit trail. Does not notify on its own. */
function appendRemark(requestNo: string, text: string) {
  const existing = remarksByRequest.get(requestNo) ?? [];
  remarksByRequest.set(requestNo, [...existing, text]);
}

/** Write a remark against a claim. */
export function addClaimRemark(requestNo: string, text: string): void {
  appendRemark(requestNo, text);
  emit();
}

/** Write a note against a claim. Blank notes are ignored. */
export function addClaimNote(requestNo: string, text: string): void {
  const note = text.trim();
  if (!note) return;
  const existing = notesByRequest.get(requestNo) ?? [];
  notesByRequest.set(requestNo, [...existing, note]);
  emit();
}

/**
 * Endorse a claim onward — to a supervisor, up to a manager, or out to
 * accounting for release.
 *
 * Recording the endorsement does not change the claim's status: it is already
 * awaiting a decision, and this says who it is now sitting with. Endorsing
 * again replaces that position, so a claim sent to the wrong desk can be
 * corrected — but every endorsement also writes a REMARK, so the corrected
 * hand-off does not erase the record of the original one.
 */
export function endorseClaim(
  requestNo: string,
  target: EndorsementTarget,
  endorsedBy: string = CLAIM_AUDIT_USER,
): ClaimEndorsement {
  const endorsedAt = new Date();
  const endorsement: ClaimEndorsement = {
    requestNo,
    target,
    endorsedBy,
    endorsedAtISO: endorsedAt.toISOString(),
  };
  endorsementsByRequest.set(requestNo, endorsement);
  appendRemark(
    requestNo,
    `${formatFiledDate(endorsement.endorsedAtISO)} — Endorsed to ${target} by ${endorsedBy}.`,
  );
  emit();
  return endorsement;
}

/**
 * Verify a claim — the processor's confirmation that its details and payee
 * check out. Writes a remark so the check is on the claim's record.
 *
 * Verifying an already-verified claim re-records it, refreshing who and when.
 * The caller decides whether to offer that; see the drawer, which does not, so
 * a stray second tap cannot litter the audit trail.
 */
export function verifyClaim(
  requestNo: string,
  verifiedBy: string = CLAIM_AUDIT_USER,
): ClaimVerification {
  const verification: ClaimVerification = {
    requestNo,
    verifiedBy,
    verifiedAtISO: new Date().toISOString(),
  };
  verificationsByRequest.set(requestNo, verification);
  appendRemark(
    requestNo,
    `${formatFiledDate(verification.verifiedAtISO)} — Verified by ${verifiedBy}.`,
  );
  emit();
  return verification;
}

/** How a corrected value reads in the audit trail. Dates get a friendly date. */
function editedValueLabel(field: EditableClaimField, value: string): string {
  if (!value) return "cleared";
  return field === "dateOfDeathISO" || field === "dateReceivedISO"
    ? formatFiledDate(value)
    : value;
}

/**
 * Correct a claim's details — see {@link EDITABLE_CLAIM_FIELDS} for what can be
 * changed. `changed` is the subset the processor actually altered; editing with
 * nothing changed is a no-op, so re-opening the form and saving does not litter
 * the trail.
 *
 * Every correction writes a REMARK naming the fields and their new values, so a
 * date of death or a status that was changed by hand is on the claim's record
 * rather than silently replacing what the branch filed.
 */
export function editClaim(
  requestNo: string,
  values: ClaimEditValues,
  changed: EditableClaimField[],
  editedBy: string = CLAIM_AUDIT_USER,
): ClaimEdit | undefined {
  if (changed.length === 0) return editsByRequest.get(requestNo);

  const edit: ClaimEdit = {
    ...values,
    requestNo,
    editedBy,
    editedAtISO: new Date().toISOString(),
  };
  editsByRequest.set(requestNo, edit);

  const summary = changed
    .map(
      (field) =>
        `${EDITABLE_CLAIM_FIELDS[field]} → ${editedValueLabel(field, values[field])}`,
    )
    .join("; ");
  appendRemark(
    requestNo,
    `${formatFiledDate(edit.editedAtISO)} — Updated by ${editedBy}: ${summary}.`,
  );
  emit();
  return edit;
}

/* ------------------------------ reads ------------------------------ */

/** The claim opened against a request, if the processor has created one. */
export function getCreatedDeathClaim(
  requestNo: string,
): CreatedDeathClaim | undefined {
  return claimsByRequest.get(requestNo);
}

/** Whether a request has had its claim header opened. */
export function hasCreatedDeathClaim(requestNo: string): boolean {
  return claimsByRequest.has(requestNo);
}

/** Every claim created this session. */
export function getCreatedDeathClaims(): CreatedDeathClaim[] {
  return [...claimsByRequest.values()];
}

/** Where a claim was last endorsed to, if it has been endorsed this session. */
export function getClaimEndorsement(
  requestNo: string,
): ClaimEndorsement | undefined {
  return endorsementsByRequest.get(requestNo);
}

/** A claim's remarks, oldest first. */
export function getClaimRemarks(requestNo: string): string[] {
  return remarksByRequest.get(requestNo) ?? [];
}

/** A claim's notes, oldest first. */
export function getClaimNotes(requestNo: string): string[] {
  return notesByRequest.get(requestNo) ?? [];
}

/** The corrections made to a claim this session, if any. */
export function getClaimEdit(requestNo: string): ClaimEdit | undefined {
  return editsByRequest.get(requestNo);
}

/** The claim's verification, if it has been verified this session. */
export function getClaimVerification(
  requestNo: string,
): ClaimVerification | undefined {
  return verificationsByRequest.get(requestNo);
}

/* ------------------------------ react binding ------------------------------ */

/**
 * Re-render the calling component whenever the store changes. Read the store
 * through the plain functions above; this hook only supplies the subscription.
 *
 *   useClaimStore();                       // subscribe
 *   const claims = getForProcessClaims();  // read
 */
export function useClaimStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getServerVersion);
}

/* ------------------------------ derived helpers ------------------------------ */

/** A created payee's full name: "First Middle Last Suffix". */
export function payeeDraftName(payee: DeathClaimPayeeDraft): string {
  return [payee.firstName, payee.middleName, payee.lastName, payee.suffix]
    .filter(Boolean)
    .join(" ");
}

/** A created payee's address on one line, or "—" when none was entered. */
export function payeeDraftAddress(payee: DeathClaimPayeeDraft): string {
  const line = [payee.lotBldgUnit, payee.street].filter(Boolean).join(" ");
  const brgy = payee.barangay ? `Brgy. ${payee.barangay}` : "";
  const parts = [line, brgy, payee.district, payee.city, payee.province].filter(
    Boolean,
  );
  return parts.length ? parts.join(", ") : "—";
}
