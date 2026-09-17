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
  /**
   * USB claims only — the nature code for the unrendered service (CP, NA, OP,
   * RP, SP, TC, TT, TV). Undefined for every other benefit, which has no such
   * classification. The create form opens on "NA" (Not Applicable), so a USB
   * claim always carries one.
   */
  usbType?: string;
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
 * Pending: opening the header starts the work, it does not finish it. The
 * processor still has documents to gather and a computation to settle, and a
 * claim that announced itself as For Approval the moment it was opened would
 * be asking a supervisor to look at something nobody has worked yet.
 *
 * Only the default — the processor picks the status on the form (see
 * {@link SELECTABLE_CLAIM_STATUSES}) and can endorse it on the spot when the
 * claim really is ready, or send it down the denial route.
 */
export const CREATED_CLAIM_STATUS: ClaimPhase = "Pending";

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
 * "MCETDC26009805" for a Davao (territory MCET) claim opened in 2026.
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
 * The processor's verdict on a claim in the For Process queue.
 *
 * A RECOMMENDATION AND NOT THE VERDICT ITSELF, which is why the outcomes are
 * named for where the claim goes rather than for what it becomes. "Approved" and
 * "Denied" are the supervisor's call on an endorsed claim — see the note on
 * {@link SELECTABLE_CLAIM_STATUSES}, which leaves both out of the processor's
 * reach for the same reason. What a processor decides is which of the two a
 * claim is sent for.
 */
export type ClaimOutcome = "approval" | "denial";

/**
 * A claim handed back to the branch because something is missing.
 *
 * NOT A VERDICT, which is why it is recorded apart from {@link ClaimDecision}.
 * Approve and deny are the processor saying what should happen to the claim;
 * this is the processor saying the claim cannot be judged yet. It leaves the
 * queue the same way, and comes back when the branch supplies what is listed.
 */
export interface ClaimComplianceReturn {
  requestNo: string;
  returnedBy: string;
  returnedAtISO: string;
  /** The document types outstanding when it was sent back. */
  missing: string[];
  /** What the branch is being asked — see the parameter on the function. */
  reason?: string;
}

export interface ClaimDecision {
  requestNo: string;
  outcome: ClaimOutcome;
  /** Why — see the parameter on {@link decideClaim}. */
  reason?: string;
  decidedBy: string;
  decidedAtISO: string;
}

/**
 * THE SUPERVISOR'S VERDICT — the real one.
 *
 * `ClaimDecision` above is a RECOMMENDATION: a processor cannot approve a claim,
 * only send it for approval. This is the answer to that, and it is what makes a
 * claim Approved or Denied on the record.
 *
 * `agreed` is derived and stored rather than recomputed, because the
 * recommendation it was measured against can be re-recorded: a claim sent back
 * for rework and endorsed again carries a newer recommendation, and whether the
 * supervisor agreed with the OLD one is a fact about the moment they decided.
 */
export interface ClaimVerdict {
  requestNo: string;
  outcome: ClaimOutcome;
  /** Required on a denial, and recorded on an approval when given. */
  reason?: string;
  /** Whether this matched what the processor recommended. */
  agreed: boolean;
  verifiedBy: string;
  verifiedAtISO: string;
}

/** A claim handed back to the processor to work again. */
export interface ClaimRework {
  requestNo: string;
  reason: string;
  returnedBy: string;
  /**
   * WHO IT WENT BACK TO — the processor who worked it.
   *
   * RECORDED RATHER THAN RE-DERIVED, and that is the difference between a
   * return and a return that reaches somebody. "Returned for compliance" with
   * no destination is a claim sitting in a queue waiting for whoever notices;
   * with a name on it, it is work assigned to the person who already knows the
   * file. The name is taken from the endorsement — the processor who actually
   * handled it — and not from the claim's audit user, which is the branch that
   * filed it.
   */
  returnedTo: string;
  returnedAtISO: string;
}

/**
 * The grounds a death claim is sent for denial on.
 *
 * PLACEHOLDERS, AND THEY MUST BE CONFIRMED BEFORE THIS GOES NEAR A USER. These
 * are the denials a life plan operation plausibly makes, written to give the
 * screen something true-shaped to work with — they are NOT the company's own
 * reason codes, and the real list almost certainly differs in both wording and
 * coverage. A denial reason is quoted back to a claimant in a letter; guessing
 * one is worse than leaving the field free text.
 *
 * `code` exists for the same reason: whatever the business calls these, it calls
 * them something short, and a screen that stores the LABEL will have to be
 * migrated the first time a word in it changes.
 */
export interface DenialReason {
  code: string;
  label: string;
  /** The line under it — when this ground applies. */
  description: string;
}

export const DENIAL_REASONS: DenialReason[] = [
  {
    code: "LAPSED",
    label: "Plan not in force",
    description: "The plan had lapsed or terminated before the date of death.",
  },
  {
    code: "CONTESTABLE",
    label: "Misrepresentation within contestability",
    description:
      "Death inside the contestable period, with a discrepancy in what was declared.",
  },
  {
    code: "EXCLUDED",
    label: "Cause of death excluded",
    description: "The cause falls under an exclusion in the plan's terms.",
  },
  {
    code: "NOT_ENTITLED",
    label: "Claimant not entitled",
    description:
      "The person claiming is not the named beneficiary or authorised payee.",
  },
  {
    code: "UNRESOLVED",
    label: "Requirements never completed",
    description:
      "Returned for compliance and the outstanding documents were not supplied.",
  },
  {
    code: "DUPLICATE",
    label: "Duplicate claim",
    description: "The benefit has already been claimed or released.",
  },
  {
    code: "OTHER",
    label: "Other",
    description: "None of the above — state the ground in your own words.",
  },
];

/**
 * The grounds a claim is handed back to the branch on.
 *
 * PLACEHOLDERS TOO — the same caveat as {@link DENIAL_REASONS}, and for the same
 * reason: this text reaches a branch as an instruction, and an invented one
 * sends somebody looking for a document nobody wanted.
 *
 * A SEPARATE LIST FROM THE DENIALS, and deliberately so even though two entries
 * nearly rhyme. A denial ends the claim; a return asks for something and expects
 * it back. One list serving both would put "Duplicate claim" in front of a
 * processor deciding what to ask a branch for, which is not a request anyone can
 * act on.
 */
export const COMPLIANCE_REASONS: DenialReason[] = [
  {
    code: "MISSING_DOCS",
    label: "Documents outstanding",
    description: "Requirements named on the claim have not been filed.",
  },
  {
    code: "ILLEGIBLE",
    label: "Document unreadable",
    description: "A document is on file but cannot be read or verified.",
  },
  {
    code: "MISMATCH",
    label: "Details do not match the record",
    description:
      "Names, dates or amounts on the filing disagree with the plan.",
  },
  {
    code: "PAYEE",
    label: "Payee details incomplete",
    description: "Nobody is named to pay, or their details are unusable.",
  },
  {
    code: "SIGNATURE",
    label: "Unsigned or uncertified",
    description: "A form is missing a signature, seal or certification.",
  },
  {
    code: "OTHER",
    label: "Other",
    description: "None of the above — say what the branch should send.",
  },
];

/**
 * The grounds a supervisor sends a claim BACK TO THE PROCESSOR on.
 *
 * A THIRD LIST, and the third thing it is not. A denial ends the claim; a
 * compliance return asks the branch for something; this asks the PROCESSOR to
 * work it again. The grounds are about the processing, not about the claim —
 * which is why none of them would make sense in either list above.
 *
 * Placeholders, like the other two. See {@link DENIAL_REASONS}.
 */
export const REWORK_REASONS: DenialReason[] = [
  {
    code: "RECOMMENDATION",
    label: "Recommendation not supported",
    description: "What is on file does not carry the verdict recommended.",
  },
  {
    code: "PAYEE_CHECK",
    label: "Payee needs checking",
    description: "The named payee or their details have not been verified.",
  },
  {
    code: "DOCS_CHECK",
    label: "Requirements not checked",
    description: "The folder was not reconciled against what the claim needs.",
  },
  {
    code: "COMPUTATION",
    label: "Benefit or computation wrong",
    description: "The benefit claimed or the amount does not follow the plan.",
  },
  {
    code: "OTHER",
    label: "Other",
    description: "None of the above — say what the processor should redo.",
  },
];

/**
 * The code all three lists use for "type it yourself".
 *
 * ONE CONSTANT FOR BOTH, because the dialog that renders them is one component
 * and it should not have to be told which list it is showing to know which entry
 * opens the text box.
 */
export const OTHER_DENIAL_REASON = "OTHER";

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
 * Processor decisions, keyed by request number. Same reasoning as endorsements:
 * a claim that arrived from the seed can be decided without having been created
 * in this session.
 */
const decisionsByRequest = new Map<string, ClaimDecision>();

/** Compliance returns, keyed by request number. Same reasoning as decisions. */
const complianceByRequest = new Map<string, ClaimComplianceReturn>();

/**
 * SUPERVISOR verdicts, keyed by request number — held apart from
 * {@link decisionsByRequest} rather than overwriting it.
 *
 * The two are different facts about the same claim: the processor RECOMMENDED
 * approval, and the supervisor then approved or did not. Writing the verdict
 * over the recommendation would destroy the more interesting half of the record
 * — whether the second reader agreed with the first — which is the only thing
 * this step exists to establish.
 */
const verdictsByRequest = new Map<string, ClaimVerdict>();

/** Claims a supervisor has sent back to the processor to work again. */
const reworkByRequest = new Map<string, ClaimRework>();

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

/**
 * Record the processor's verdict on a claim, and write it into the claim's audit
 * trail.
 *
 * IT DOES NOT MOVE THE CLAIM between queues, which is deliberate and matches
 * {@link verifyClaim} directly above: what a processor does is recorded against
 * the claim, and where the claim then sits is the read model's business. Nothing
 * in the queue selectors reads decisions yet, so a decided claim stays on the
 * For Process list with its verdict shown on it — visible, and not silently
 * vanished out of a list someone is working down.
 *
 * Deciding twice overwrites, refreshing who and when. The caller decides whether
 * to offer that; the work column does not, so a second tap cannot litter the
 * trail with contradictory lines.
 */
export function decideClaim(
  requestNo: string,
  outcome: ClaimOutcome,
  /**
   * Why, in the processor's own words or off {@link DENIAL_REASONS}.
   *
   * OPTIONAL ON THE SIGNATURE AND EXPECTED ON A DENIAL. An approval explains
   * itself — the claim met the terms — but a denial is the one outcome somebody
   * will be asked to justify, possibly years later and possibly by a regulator,
   * and "denied by J. Cruz" answers nothing. The type does not force it because
   * the same function serves both outcomes; the screen that denies does.
   */
  reason?: string,
  decidedBy: string = CLAIM_AUDIT_USER,
): ClaimDecision {
  const decision: ClaimDecision = {
    requestNo,
    outcome,
    reason,
    decidedBy,
    decidedAtISO: new Date().toISOString(),
  };
  decisionsByRequest.set(requestNo, decision);
  appendRemark(
    requestNo,
    `${formatFiledDate(decision.decidedAtISO)} — Sent for ${outcome} by ${decidedBy}` +
      // INTO THE REMARK, not only onto the decision record. The remarks are what
      // the claim's history IS on every screen that shows one; a reason held
      // only on the decision would be invisible everywhere the trail is read.
      (reason ? `: ${reason}.` : "."),
  );
  emit();
  return decision;
}

/**
 * Record the SUPERVISOR'S verdict on an endorsed claim.
 *
 * THE TRAIL SAYS WHETHER THEY AGREED, not only what they decided. "Approved"
 * under "Sent for approval" is a rubber stamp and reads as one; "Approved,
 * against a recommendation to deny" is the line somebody will want years later,
 * and it costs one word to write now. It is derived here rather than at the
 * screen so every caller records it the same way.
 */
export function recordVerdict(
  requestNo: string,
  outcome: ClaimOutcome,
  reason?: string,
  verifiedBy: string = CLAIM_AUDIT_USER,
  /**
   * WHEN, for a verdict that is being seeded rather than made.
   *
   * Defaults to now, which is right for every real caller — a supervisor
   * pressing Verify is verifying it now. It is passed only by
   * {@link seedSupervisorVerdicts}, which needs the date to be DERIVED rather
   * than sampled: this module is evaluated on the server and again on the
   * client, and two `new Date()` calls a few hundred milliseconds apart would
   * seed two different histories for the same claim.
   */
  verifiedAtISO: string = new Date().toISOString(),
): ClaimVerdict {
  const recommended = decisionsByRequest.get(requestNo)?.outcome;
  const verdict: ClaimVerdict = {
    requestNo,
    outcome,
    reason,
    // No recommendation on file counts as agreement: there is nothing to
    // disagree WITH, and flagging it as a departure would put a warning on
    // every seeded claim this session did not endorse itself.
    agreed: recommended === undefined || recommended === outcome,
    verifiedBy,
    verifiedAtISO,
  };
  verdictsByRequest.set(requestNo, verdict);
  appendRemark(
    requestNo,
    `${formatFiledDate(verdict.verifiedAtISO)} — ` +
      // VERIFIED, NOT APPROVED. The supervisor is the second reader, not the
      // last one: the pipeline runs Review → Verification → Approval, so what
      // they do to a sound claim is verify it and pass it for approval. Only
      // the denial ends here, which is why only the denial is named for its
      // outcome.
      `${outcome === "approval" ? "Verified for approval" : "Denied"} by ${verifiedBy}` +
      (verdict.agreed
        ? ""
        : `, against a recommendation to ${recommended === "approval" ? "approve" : "deny"}`) +
      (reason ? `: ${reason}` : "") +
      ".",
  );
  emit();
  return verdict;
}

/**
 * Send a claim back to the processor to work again.
 *
 * NOT A COMPLIANCE RETURN, which goes to the BRANCH and asks for a document.
 * This says the processing itself is not finished, and the claim lands back in
 * the For Process queue rather than with the branch. Two exits that both look
 * like "send it back" and mean entirely different things to different people —
 * see {@link REWORK_REASONS} for the grounds that separate them.
 */
export function returnToProcessor(
  requestNo: string,
  reason: string,
  /**
   * The processor it goes back to. Defaults to whoever endorsed it, which is
   * the person who worked the claim — see `returnedTo`. A claim with no
   * endorsement on file has nobody to name, and says so rather than inventing
   * one.
   */
  returnedTo: string = decisionsByRequest.get(requestNo)?.decidedBy ??
    "the processor",
  returnedBy: string = CLAIM_AUDIT_USER,
): ClaimRework {
  const record: ClaimRework = {
    requestNo,
    reason,
    returnedBy,
    returnedTo,
    returnedAtISO: new Date().toISOString(),
  };
  reworkByRequest.set(requestNo, record);
  // The RECOMMENDATION goes with it. The claim is being worked again, and a
  // stale "sent for approval" sitting on it would have the processor answering
  // a question they already answered — and the supervisor's own queue counting
  // a claim that is no longer theirs.
  decisionsByRequest.delete(requestNo);
  appendRemark(
    requestNo,
    `${formatFiledDate(record.returnedAtISO)} — Returned for compliance by ${returnedBy} to ${returnedTo}: ${reason}.`,
  );
  emit();
  return record;
}

/** The supervisor's verdict, if one has been recorded this session. */
export function getClaimVerdict(requestNo: string): ClaimVerdict | undefined {
  return verdictsByRequest.get(requestNo);
}

/** Whether a supervisor has sent this claim back to be worked again. */
export function getClaimRework(requestNo: string): ClaimRework | undefined {
  return reworkByRequest.get(requestNo);
}

/**
 * Hand a claim back to the branch, naming what is missing, and write it into
 * the claim's audit trail.
 *
 * The list is recorded rather than re-derived later: what was outstanding on the
 * day it went back is the fact the branch was asked to answer, and the folder
 * will have moved on by the time anyone reads the trail.
 */
export function returnClaimForCompliance(
  requestNo: string,
  missing: string[],
  /**
   * Why it is going back, in the processor's words or off
   * {@link COMPLIANCE_REASONS}.
   *
   * NOT THE SAME FACT AS `missing`, which is why both are recorded. The list is
   * what the folder was short of; the reason is what the branch is being ASKED
   * — and they part company often. A document can be on file and illegible, or
   * complete and contradicted by the record, in which case `missing` is empty
   * and the return would otherwise read "requirements incomplete" to a branch
   * that can see nothing incomplete.
   */
  reason?: string,
  returnedBy: string = CLAIM_AUDIT_USER,
): ClaimComplianceReturn {
  const record: ClaimComplianceReturn = {
    requestNo,
    returnedBy,
    returnedAtISO: new Date().toISOString(),
    missing,
    reason,
  };
  complianceByRequest.set(requestNo, record);
  appendRemark(
    requestNo,
    `${formatFiledDate(record.returnedAtISO)} — Returned for compliance by ${returnedBy}: ` +
      // THE REASON LEADS, the outstanding list follows it. A branch reading this
      // needs to know what is being asked before it reads an inventory, and when
      // the two say different things the sentence is the one that was meant.
      (reason ?? "requirements incomplete") +
      (missing.length ? ` — outstanding: ${missing.join(", ")}` : "") +
      ".",
  );
  emit();
  return record;
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
/** The compliance return on a claim, if one has been recorded this session. */
export function getClaimComplianceReturn(
  requestNo: string,
): ClaimComplianceReturn | undefined {
  return complianceByRequest.get(requestNo);
}

/** The processor's verdict on a claim, if one has been recorded this session. */
export function getClaimDecision(requestNo: string): ClaimDecision | undefined {
  return decisionsByRequest.get(requestNo);
}

export function getClaimVerification(
  requestNo: string,
): ClaimVerification | undefined {
  return verificationsByRequest.get(requestNo);
}

/**
 * Whether a processor has done anything to this claim this session.
 *
 * THE FOUR THINGS A PROCESSOR CAN DO TO A CLAIM, asked as one question: it has
 * been decided, sent back to the branch for compliance, verified, or endorsed to
 * another desk. Any one of them means the claim passed through somebody's hands
 * and is no longer merely waiting.
 *
 * ASKED IN ONE PLACE because "processed" is a definition, not a filter. A screen
 * listing a processor's work that assembled its own version of this would go on
 * agreeing with every other screen right up until somebody added a fifth action
 * — and then would quietly stop, in the one place nobody looks.
 *
 * NOT "BY THIS PROCESSOR", despite how it reads. Every record here carries who
 * acted, but `CLAIM_AUDIT_USER` is still a hard-coded name and roles are not
 * wired into these screens, so the honest reading today is "acted on in this
 * session". When there is a signed-in user, this takes one.
 */
export function hasProcessorActivity(requestNo: string): boolean {
  return (
    decisionsByRequest.has(requestNo) ||
    complianceByRequest.has(requestNo) ||
    verificationsByRequest.has(requestNo) ||
    endorsementsByRequest.has(requestNo) ||
    // The supervisor's two answers count as work on the claim for the same
    // reason the processor's do — somebody read it and said something.
    verdictsByRequest.has(requestNo) ||
    reworkByRequest.has(requestNo)
  );
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
