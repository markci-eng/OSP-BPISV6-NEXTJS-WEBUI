// Death Claims data access.
//
// Built on top of the shared PIS data layer (`app/(pis)/data`).
//
// The processor's queue is driven by CLAIM REQUESTS, not by claim headers. A
// branch files a `ClaimRequest`; the `ClaimsHdrDC` does not exist until the
// processor opens one on the create form. So "For Process" = death-claim
// requests still pending, minus any the processor has already worked
// (`claim-store`). Everything the dashboard shows is derivable from the
// request and its plan holder — including the benefit, which is encoded in the
// request number (`CLQCITY2026`**CAB**`000001`).
//
// NOTE: the seed still carries `ClaimsHdrDC` rows for the pending requests.
// They are ignored HERE — a pending request has no header, so nothing on this
// dashboard reads one. Only the endorsed ("For Approval") claims read their
// header, which is correct: those have been processed.
//
// Do NOT delete those rows from the seed, though. `ClaimsPayee` is keyed only
// by `claimNo`, so a pending request's header row is the sole join to the payee
// filed with it (see `payeeRecordsForRequest` in `../claims-data`). They become
// safe to drop once `ClaimsPayee.ClaimsRequest` exists in the data layer.
//
// A death claim's nature ("special" vs "regular") is DERIVED from how soon
// after the incident the claim was filed: within 7 days is a special claim
// (SC), otherwise regular (RC). Mirrors `ClaimsHdrDC.natureCode`.

import {
  db,
  formatFiledDateTime,
  type ClaimRequest as ClaimRequestModel,
  type ClaimsHdrDC,
  type DeathBenefit,
  type Planholder,
} from "../../data";
import {
  getClaimRework,
  getClaimVerdict,
  getCreatedDeathClaim,
  hasCreatedDeathClaim,
  recordVerdict,
} from "../claim-store";
// Moved up a level so the plan holder profile can read it too — see the note at
// the top of that file. This module still owns everything BUILT from it.
import { activityFeed } from "../claim-activity";
import {
  ageOfDeathFor,
  deathClaimNatureCode,
  planholderName,
  toProcessor,
  type ClaimKind,
  type ClaimPhase,
  type ClaimProcessor,
  type PersonName,
} from "../claims-data";

// Re-export the shared helpers/types so death-claim consumers can keep
// importing everything they need from this one module.
export {
  toFullName,
  toSurnameFirst,
  toInitials,
  phaseBadgeType,
  getPlanholder,
  planholderName,
} from "../claims-data";
export type { PersonName, ClaimPhase } from "../claims-data";

export type DeathClaimType = "regular" | "special";

/**
 * Benefit codes in the order they must be tested. "ECAB" has to be checked
 * before "CAB", since a request number ending in ECAB also ends in CAB.
 */
const BENEFIT_CODES: DeathBenefit[] = ["ECAB", "ADB", "USB", "CAB"];

/**
 * The benefit the branch filed for, read out of the request number:
 * "CL" + branch + year + BENEFIT + 6-digit sequence. This is what the create
 * form prefills; the processor can still change it before opening the claim.
 */
export function benefitFromRequestNo(requestNo: string): DeathBenefit {
  const head = requestNo.replace(/\d{6}$/, "");
  return BENEFIT_CODES.find((code) => head.endsWith(code)) ?? "CAB";
}

/**
 * A death claim as the dashboard renders it — a flat view over a claim
 * REQUEST joined to its plan holder. Requests that have already been processed
 * also carry their claim header's detail.
 */
export interface DeathClaim {
  id: string;
  /** Public reference number (the claim request's primary key). */
  reference: string;
  lpaNo: string;
  type: DeathClaimType;
  /**
   * Which NATURE of claim this is — "Death Claim", "Waiver of Installment",
   * "Dismemberment".
   *
   * CARRIED EVEN THOUGH THIS QUEUE IS ALL DEATH CLAIMS. The selectors below
   * filter to `claimType === "Death Claim"` and everything they return says the
   * same thing, so this field is a constant today. It exists anyway, and the
   * screens read it rather than assuming: the moment a WOI or a dismemberment
   * queue is built, every one of them is already labelled correctly and nothing
   * has to be hunted down and changed. A hard-coded "Death Claim" in a heading
   * is exactly what would be missed.
   */
  kind: ClaimKind;
  /** ISO date the plan holder died (taken as the incident date). */
  dateOfDeath: string;
  /** ISO date the incident occurred. */
  incidentDate: string;
  /** Cause / type of incident, e.g. "Natural Causes", "Drowning". */
  typeOfIncident: string;
  /** Machine-sortable filed date (ISO). */
  filedAt: string;
  /** Human-friendly filed label, e.g. "Apr 18 · 8:00 am". */
  filedDisplay: string;
  processor: ClaimProcessor;
  phase: ClaimPhase;
  /** Branch that filed the claim, e.g. "Davao City Branch". */
  requestingBranch: string;
  /** Raw branch code, e.g. "DAVAO" — supplies the claim no's territory. */
  requestingBranchCode: string;
  /**
   * The branch's territory, e.g. "MW1". Read off the branch record rather than
   * parsed back out of the claim no: a pending request has no claim no at all,
   * and the queue filters by territory before any of them do.
   */
  territoryCode: string;
  /** Benefit code (CAB / ECAB / ADB / USB) filed for. */
  benefits: DeathBenefit;
  /** Age of the deceased, "61 yrs 1 mos 5 days". */
  ageOfDeath: string;
  /** Claim No — only once a processor has opened the claim header. */
  claimNo?: string;
}

/**
 * Which of a claim's two numbers identifies it at the stage it has reached.
 *
 * A claim carries both, but only one of them is ever the answer to "which claim
 * is this?". Until a processor opens it, all it has is the REQUEST number the
 * branch filed under; opening it mints the CLAIM number, and from then on that
 * is the reference the whole system quotes.
 */
/**
 * The filed moment in full — "Apr 27, 2026 · 8:00 am".
 *
 * THE YEAR IS NOT DECORATION. `filedDisplay` carries no year at all, and claim
 * requests in this file run from 2020 to 2026: two claims a year apart read as
 * the same day in a list whose entire ordering rule is FIFO, so the queue looks
 * mis-sorted while being perfectly sorted.
 *
 * Built by putting the year INTO the app's own filed-date wording rather than
 * formatting `filedAt` afresh, so this cannot drift into a second date format.
 *
 * Shared, because every screen that shows a queue position needs it — the
 * compact queue row and the served claim both did the same surgery on the same
 * string before this existed.
 */
export function filedFullDisplay(claim: DeathClaim): string {
  const [datePart = "", timePart = ""] = claim.filedDisplay
    .split("·")
    .map((part) => part.trim());
  const year = new Date(claim.filedAt).getFullYear();
  return timePart
    ? `${datePart}, ${year} · ${timePart}`
    : `${datePart}, ${year}`;
}

/**
 * THE ORDER A QUEUE IS WORKED IN: special claims first, and within each group
 * the oldest request first.
 *
 * FIFO is the rule — a claim filed on the 2nd is worked before one filed on the
 * 19th, because the branch that filed first has been waiting longest. The
 * special/regular split sits ABOVE it rather than beside it: a special claim is
 * one filed within seven days of the incident, and the whole reason that
 * category exists is that it is meant to overtake. So the two are a primary and
 * a secondary key, not a single blended score.
 *
 * `localeCompare` on the ISO timestamp is a plain ascending sort — ISO dates
 * order correctly as strings, which is why nothing here parses them into `Date`
 * objects only to subtract them again.
 *
 * THE PRIORITY HALF IS A DEATH CLAIM RULE, and it is now ASKED rather than
 * assumed (user, 2026-09-15: "prioritize the special when death claim then by
 * Filed Date"). Special comes from filing within seven days of the incident and
 * no other nature has the category, so the split is applied only when BOTH
 * claims are death claims; anything else is plain FIFO, which is the right
 * answer for them.
 *
 * This used to say it degraded that way and did not — it compared `type` on any
 * two claims, and `type` is derived for every request, so a waiver filed inside
 * seven days would have overtaken on a rule that does not apply to it. No
 * behaviour changes today, because every queue this sorts holds death claims
 * only; it changes the day one does not. Same question `conveyor-card` asks
 * before drawing the badge at all — see `hasPriority` there.
 *
 * EXPORTED so every screen that shows a queue orders it identically. It was
 * written inline in the rail first; a second screen serving claims one at a time
 * made two copies of the one rule the whole feature turns on, which is the kind
 * of thing that drifts silently and is then very hard to see.
 *
 * `sort` mutates, so callers copy first — these arrays come from memoised
 * selectors that other callers are holding.
 */
export function compareByQueueOrder(a: DeathClaim, b: DeathClaim): number {
  const bothDeathClaims =
    a.kind === "Death Claim" && b.kind === "Death Claim";
  if (bothDeathClaims && a.type !== b.type) {
    return a.type === "special" ? -1 : 1;
  }
  return a.filedAt.localeCompare(b.filedAt);
}

export type ClaimIdentifier = "request" | "claim";

/** Shown where a claim's identifying number is missing. */
export const NO_IDENTITY = "—";

/**
 * The number a claim is known by at a given stage — what a card leads with, and
 * what the queue table's one identity column holds.
 *
 * Deliberately WITHOUT a fallback to the other number. A claim that has reached
 * a queue of opened claims without a claim no is a claim something has gone
 * wrong with, and quietly printing its request number in the same slot hides
 * that: the number looks like an answer, and nothing about it says it came from
 * the wrong field. A blank is the honest report, and it is the same blank the
 * table shows.
 */
export function claimIdentity(
  claim: Pick<DeathClaim, "reference" | "claimNo">,
  identifier: ClaimIdentifier,
): string {
  const number = identifier === "claim" ? claim.claimNo : claim.reference;
  return number || NO_IDENTITY;
}

/* ------------------------------ derivation ------------------------------ */

/**
 * Flatten a claim request into the dashboard view-model. `header` is passed
 * only for claims that have already been processed.
 */
function toDeathClaim(
  request: ClaimRequestModel,
  planholder: Planholder | undefined,
  header?: ClaimsHdrDC,
): DeathClaim {
  return {
    id: header?.claimNo ?? request.requestNo,
    reference: request.requestNo,
    lpaNo: request.lpaNo,
    type: deathClaimNatureCode(request) === "SC" ? "special" : "regular",
    kind: request.claimType,
    dateOfDeath: request.incidentDateISO,
    incidentDate: request.incidentDateISO,
    typeOfIncident: request.causeOfIncident,
    filedAt: request.fileDateISO,
    filedDisplay: formatFiledDateTime(request.fileDateISO),
    processor: toProcessor(header?.processor ?? request.auditUser),
    phase: request.statusLabel,
    requestingBranch: request.requestingBranch,
    requestingBranchCode: request.requestingBranchCode,
    // Falls back to the branch code so a branch missing from the reference
    // table still groups with itself rather than into a nameless bucket.
    territoryCode:
      db.getBranch(request.requestingBranchCode)?.territoryCode ??
      request.requestingBranchCode,
    benefits: header?.benefits ?? benefitFromRequestNo(request.requestNo),
    ageOfDeath: header?.ageOfDeath ?? ageOfDeathFor(request, planholder),
    claimNo: header?.claimNo,
  };
}

/* ------------------------------ queries ------------------------------ */

/**
 * Every death-claim request on file. `db` has no "all requests" query, so the
 * requests are collected per plan holder — every request belongs to exactly
 * one plan.
 */
function allDeathClaimRequests(): {
  request: ClaimRequestModel;
  planholder: Planholder;
}[] {
  return db.getPlanholders().flatMap((planholder) =>
    db
      .getClaimRequestsByLpa(planholder.lpaNo)
      .filter((request) => request.claimType === "Death Claim")
      .map((request) => ({ request, planholder })),
  );
}

/** Every death claim on file, flattened for the dashboard. */
export const deathClaims: DeathClaim[] = allDeathClaimRequests().map(
  ({ request, planholder }) => toDeathClaim(request, planholder),
);

/** A single death claim by its request reference. */
export function getDeathClaim(reference: string): DeathClaim | undefined {
  return deathClaims.find((claim) => claim.reference === reference);
}

/**
 * Processor queue — death-claim requests that have NO `ClaimsHdrDC` yet.
 *
 * That is the whole rule, and it is why nothing here shows a status: every
 * item is an unworked request. Opening the claim header endorses it in the
 * same action, which moves it to {@link getForVerificationClaims}.
 *
 * Call this from a component that also calls `useClaimStore()`, so the queue
 * re-renders when a claim is created.
 */
export function getForProcessClaims(): DeathClaim[] {
  return deathClaims.filter(
    (claim) =>
      claim.phase === "Pending" && !hasCreatedDeathClaim(claim.reference),
  );
}

/**
 * Statuses that put a claim in the supervisor's queue. A processor endorses a
 * claim with a recommendation — pay it ("For Approval") or reject it ("For
 * Denial") — and either way the supervisor is the one who decides. Both are
 * waiting on the same person, so both belong in the same queue.
 */
export const VERIFICATION_PHASES: ClaimPhase[] = ["For Approval", "For Denial"];

/**
 * Supervisor queue — claims a processor has worked and endorsed, now awaiting
 * the supervisor's decision. These are the only claims read from a
 * `ClaimsHdrDC`: unlike the pending requests, they genuinely have a header,
 * because they have been processed.
 *
 * Covers both the claims already endorsed in the seed and the ones created
 * this session — creating a claim endorses it, so it arrives here immediately.
 * Freshly created claims sort first, so a processor sees their own work at the
 * top of the queue.
 *
 * Call this from a component that also calls `useClaimStore()`.
 */
export function getForVerificationClaims(): DeathClaim[] {
  // Endorsed this session.
  const created = deathClaims.flatMap((claim) => {
    const header = getCreatedDeathClaim(claim.reference);
    if (!header) return [];
    return [
      {
        ...claim,
        id: header.claimNo,
        claimNo: header.claimNo,
        benefits: header.benefits,
        phase: header.statusLabel,
      },
    ];
  });

  // Endorsed already, per the seed — minus any the store has a newer take on.
  const endorsedThisSession = new Set(created.map((c) => c.reference));
  const seeded = db
    .getDeathClaims()
    .filter(
      (header) =>
        VERIFICATION_PHASES.includes(header.statusLabel) &&
        !endorsedThisSession.has(header.claimRequest.requestNo),
    )
    .map((header) =>
      toDeathClaim(header.claimRequest, header.planholder, header),
    );

  return [...created, ...seeded];
}

/**
 * FOR APPROVAL — claims a supervisor has VERIFIED, waiting on the approver.
 *
 * THE THIRD STAGE OF THREE (user, 2026-09-15): a claim is reviewed, then
 * verified, then approved. `recordVerdict` names the same run — "the supervisor
 * is the second reader, not the last one". This is the queue between the second
 * and the third, and it is what `/claims/approvals` lists.
 *
 * WHAT IT IS NOT is {@link getForVerificationClaims}. That queue is claims
 * waiting FOR verification — the conveyor's Verify tab is working them right
 * now, and putting them on the approval page would offer a decision on a claim
 * nobody has checked yet. The approval page listed exactly that queue for half a
 * day; the user's correction is what this function exists for.
 *
 * BOTH RECOMMENDATIONS COME THROUGH IT. A claim endorsed "For Denial" is
 * verified the same way one endorsed "For Approval" is, and both arrive here —
 * what the approver is agreeing with is the column the table calls "Endorsed
 * As", not the question of whether the claim reaches them.
 *
 * READ OFF THE VERDICT, which is SESSION STATE — `recordVerdict` is the only
 * thing that writes one, and the data layer has no column for it. So the queue
 * starts from {@link seedSupervisorVerdicts} and grows as claims are verified on
 * the conveyor, which is also exactly when they LEAVE that screen's Verify tab
 * (see `verificationQueue` on the death claim page, which excludes anything with
 * a verdict). The two screens hand work to each other with no claim in both. It
 * stops being session state the day `TblClaimsHdrDC` carries the verified pair,
 * and nothing that calls this has to change when it does.
 *
 * Rework is excluded on the same rule the conveyor uses: a claim sent back to
 * the processor has left this part of the pipeline.
 *
 * Both halves are searched because a claim can reach a verdict from either — one
 * endorsed in the seed (it has a header, so `getForVerificationClaims` has it),
 * or one a processor endorsed on the conveyor this session (still `Pending` with
 * no header, so only `getForProcessClaims` has it). Missing the second half is
 * the bug `verificationQueue` documents one stage back.
 *
 * Call this from a component that also calls `useClaimStore()`.
 */
export function getForApprovalClaims(): DeathClaim[] {
  const verified = (claim: DeathClaim) =>
    Boolean(getClaimVerdict(claim.reference)) &&
    !getClaimRework(claim.reference);

  const endorsedHere = getForProcessClaims().filter(verified);
  const seen = new Set(endorsedHere.map((claim) => claim.reference));
  const rest = getForVerificationClaims().filter(
    (claim) => !seen.has(claim.reference) && verified(claim),
  );

  return [...endorsedHere, ...rest].sort(compareByQueueOrder);
}

/**
 * One in every {@link SEEDED_VERDICT_STRIDE} claims in the Verify queue arrives
 * already verified, so For Approval has work on a cold start.
 *
 * WHY THIS EXISTS AT ALL. Service payables opens with seven billings waiting on
 * an approver because `TblClaimsBilling` carries the verified pair and the seed
 * writes it. The claims side has no such column — a verdict lives only in
 * `claim-store` — so a freshly loaded Approvals page showed an empty Death Claim
 * queue and there was no way to see the screen without first going and verifying
 * something. This is the missing half of the seed, not a feature.
 *
 * A THIRD, NOT ALL OF THEM. Both queues have to have something in them: verify
 * everything and the conveyor's Verify tab is the empty one instead, which is
 * the same problem facing the other way. The same reasoning as
 * `BILLED_STAGE_LADDER` on the billing side — work arrives at one stage and
 * drains through the ones behind it.
 *
 * THE VERDICT AGREES WITH THE RECOMMENDATION, because a supervisor who
 * disagreed is the interesting case and a seed should not manufacture interest.
 * A claim endorsed "For Denial" is seeded with a denial verdict and still
 * reaches For Approval — both recommendations pass through, which is the rule
 * {@link getForApprovalClaims} describes.
 *
 * THE DATE IS DERIVED FROM THE CLAIM, never sampled. This module is evaluated on
 * the server and again on the client; two `new Date()` calls would write two
 * different histories for one claim and hydration would disagree about the
 * trail. The filing date is used as-is — the day it was verified is not a fact
 * anybody has, and inventing an offset would only dress that up.
 *
 * DELETE THIS whole block the day the data layer can say a claim was verified.
 * Nothing else has to change: the queue is already read off the verdict.
 */
const SEEDED_VERDICT_STRIDE = 3;

/** Who signed the seeded verifications. The processor seed's own supervisor. */
const SEED_VERIFIER = "MARITES BELIESTA";

function seedSupervisorVerdicts(): void {
  // IN QUEUE ORDER, not in whatever order the selector happens to return. A
  // supervisor works down the queue, so the claims already verified are the ones
  // that were at the FRONT of it — which means the seeded approval queue carries
  // the specials the ordering rule promotes, instead of whichever claims an
  // unsorted list put at indexes 0, 3, 6. Striding rather than taking the first
  // N so both queues keep a mix of Special and Regular.
  [...getForVerificationClaims()]
    .sort(compareByQueueOrder)
    .forEach((claim, index) => {
    if (index % SEEDED_VERDICT_STRIDE !== 0) return;
    recordVerdict(
      claim.reference,
      claim.phase === "For Denial" ? "denial" : "approval",
      undefined,
      SEED_VERIFIER,
      claim.filedAt,
    );
  });
}

seedSupervisorVerdicts();

/**
 * Statuses that put a claim in the endorsement queue — the stage AFTER the
 * supervisor decides. The claim has been approved or denied and now has to be
 * endorsed onward.
 */
export const ENDORSEMENT_PHASES: ClaimPhase[] = ["Approved", "Denied"];

/**
 * Endorsement queue — decided claims waiting to be endorsed onward.
 *
 * PLACEHOLDER, and the reason is worth stating plainly: the seed models exactly
 * two states for a death claim — a request with no header ("Pending") and a
 * header endorsed to the supervisor ("For Approval"). Nothing in it is Approved
 * or Denied, so a queue read straight off {@link ENDORSEMENT_PHASES} would be
 * empty on every device.
 *
 * So it is read off {@link activityFeed} instead — the same generated
 * status-change history the Recent Updates deck runs on, which already assigns
 * decided phases to real claims. Every item here is therefore a REAL claim, with
 * a real plan holder, a real Claim No and a real branch; only the phase saying it
 * has been decided is generated, exactly as it is for the feed.
 *
 * Claims already sitting with the supervisor are excluded, so a Claim No cannot
 * appear in both this queue and For Verification. Some do still overlap with For
 * Process — the feed has always disagreed with the request seed that way — and
 * that resolves by itself once the real endorsement rule replaces this function.
 *
 * When it does, this becomes the one-liner the other two queues already are:
 * filter {@link deathClaims} by {@link ENDORSEMENT_PHASES}. Nothing above this
 * line needs to change, and neither does anything that calls it.
 */
export function getForEndorsementClaims(): DeathClaim[] {
  const withSupervisor = new Set(
    getForVerificationClaims().map((claim) => claim.reference),
  );

  return activityFeed.flatMap((event) => {
    if (!ENDORSEMENT_PHASES.includes(event.phase)) return [];
    if (withSupervisor.has(event.reference)) return [];

    const claim = claimByReference.get(event.reference);
    if (!claim) return [];

    const header = db.getDeathClaimByRequest(claim.reference);
    return [
      {
        ...claim,
        claimNo: header?.claimNo ?? claim.claimNo,
        phase: event.phase,
      },
    ];
  });
}

/**
 * A single item in the "Recent Updates" feed shown on mobile. This is a
 * lightweight activity entry (some items reference claims not in the list
 * above), so it carries the deceased's name inline rather than via a plan.
 */
export interface ClaimUpdate {
  id: string;
  reference: string;
  /** Plan the claim was filed against — and the key the feed navigates by. */
  lpaNo: string;
  /** Claim No, present once a header has been opened against the request. */
  claimNo?: string;
  deceased: PersonName;
  type: DeathClaimType;
  phase: ClaimPhase;
  /** The remark recorded with the status change. */
  remarks: string;
  /** Relative time label, e.g. "25m ago". */
  timeAgo: string;
}

/**
 * How many updates the dashboard's deck carries. How they are split into swipes
 * is the deck's business — the page size is measured against the device — but the
 * pool it pages through is fixed here, and enforced by slicing rather than left to
 * the length of {@link activityFeed}, so adding an event cannot silently lengthen
 * the carousel.
 *
 * 12 was chosen for dividing cleanly by 3, 4 and 6 — three of the four page sizes
 * a phone measures out. Only a measured 5 leaves a remainder, and those two
 * updates are still in the drawer.
 */
export const RECENT_UPDATES_COUNT = 12;

/** Real death claims keyed by request reference, for the activity feed. */
const claimByReference = new Map(deathClaims.map((c) => [c.reference, c]));

/**
 * The processor's FULL status-change history, newest first. Each event points at
 * a real claim in the seed (so names and references are real), while the status
 * change itself is generated so the feed exercises every phase.
 * See {@link activityFeed}.
 *
 * This is the drawer's list, and it is the one that grows over time — which is
 * why the drawer pages through it in batches instead of rendering it whole.
 */
export const allClaimUpdates: ClaimUpdate[] = activityFeed.flatMap(
  (event, i) => {
    const claim = claimByReference.get(event.reference);
    if (!claim) return [];
    const name = planholderName(claim.lpaNo);
    return [
      {
        id: `u-${i + 1}`,
        reference: claim.reference,
        lpaNo: claim.lpaNo,
        // Every request in the feed has had a header opened against it, so the
        // Claim No resolves. Left optional on the type all the same — a
        // returned-to-pending claim need not have one.
        claimNo: db.getDeathClaimByRequest(claim.reference)?.claimNo,
        deceased: name ?? { firstName: "", lastName: "—" },
        type: claim.type,
        phase: event.phase,
        remarks: event.remarks,
        timeAgo: event.timeAgo,
      },
    ];
  },
);

/**
 * The most recent slice of {@link allClaimUpdates} — what the dashboard deck
 * shows. Always {@link RECENT_UPDATES_COUNT} items long.
 */
export const recentClaimUpdates: ClaimUpdate[] = allClaimUpdates.slice(
  0,
  RECENT_UPDATES_COUNT,
);
