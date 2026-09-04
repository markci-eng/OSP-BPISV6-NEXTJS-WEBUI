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
} from "../../../data";
import { getCreatedDeathClaim, hasCreatedDeathClaim } from "../../claim-store";
// Moved up a level so the plan holder profile can read it too — see the note at
// the top of that file. This module still owns everything BUILT from it.
import { activityFeed } from "../../claim-activity";
import {
  ageOfDeathFor,
  deathClaimNatureCode,
  planholderName,
  toProcessor,
  type ClaimPhase,
  type ClaimProcessor,
  type PersonName,
} from "../../claims-data";

// Re-export the shared helpers/types so death-claim consumers can keep
// importing everything they need from this one module.
export {
  toFullName,
  toSurnameFirst,
  toInitials,
  phaseBadgeType,
  getPlanholder,
  planholderName,
} from "../../claims-data";
export type { PersonName, ClaimPhase } from "../../claims-data";

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
