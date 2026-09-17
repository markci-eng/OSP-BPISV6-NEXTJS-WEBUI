"use client";

// EVERYTHING IN FLIGHT AGAINST ONE PLAN, whatever raised it.
//
// WHY THIS EXISTS (user, 2026-09-16: "our planholder profile will be view now by
// Death Claim and Service so we need to make it dynamic. Instead of Claims
// section replace it with this. Pending request but the request would be claims
// and others"). The profile used to carry a CLAIM REQUESTS section, which was
// right while the only door to the profile was the claims area. It is not: a
// service payables processor opens the same plan holder from the conveyor, and
// what they need to know is not "which claims exist" but "is anything already
// running against this plan" — a claim, a service payable, or whatever is
// modelled next.
//
// SO THE SECTION ASKS A DIFFERENT QUESTION, and this file is the answer to it:
// one list, one shape, one status vocabulary, over sources that share nothing
// else. The BPIS profile answers the same question the same way one area over
// (`components/plan-management/planholder-profile/sections/pending-requests`),
// which is the screen this was asked to look like.
//
// WHY NOT REUSE THAT MODEL. `RequestProps` there is a closed union of four
// plan-management kinds — Reinstatement, Change of Mode, Transfer of Rights,
// Returned of Premium — and `/components` is read-only from this branch. A claim
// is not one of those four and must not be posted as one. So the shape is
// restated here with the union open at this end, and `ProgressCard`'s own closed
// union is the reason the card is restated too; see
// `PlanholderPendingRequests`.
//
// FOUR STEPS EACH, AND IT IS NOT A COINCIDENCE. Both pipelines this file reads
// are four-stage — a claim is filed, reviewed, verified, decided; a service
// payable is processed, verified, approved, endorsed — so the step track means
// the same distance on both cards. Anything added later that is not four steps
// carries its own `totalSteps`; nothing here assumes the number.

import type { RequestHistoryItem } from "@/app/(bpis)/data/plan-management/request-history";
import {
  getClaimRequests,
  type ClaimPhase,
  type ClaimRequest,
} from "../claims-data";
import {
  getServiceBillings,
  servicesOf,
  type BillingStage,
} from "../service-payables/service-payables-data";
import { getEndorsedBilling } from "../service-payables/service-payables-store";

/**
 * What raised the request.
 *
 * OPEN BY DESIGN — this is the union the user asked to be "claims and others",
 * and the two values below are the two sources that exist today. Adding a third
 * means adding a reader beside the two in {@link getPlanholderRequests} and an
 * icon in the card; nothing else branches on it.
 */
export type PlanholderRequestKind = "Death Claim" | "Service Payable";

/**
 * Where a request has got to, in the four words every source is mapped onto.
 *
 * THE SAME FOUR THE BPIS CARD USES, deliberately: a processor reading a status
 * pill on this profile and on that one is reading the same vocabulary. The
 * per-source pipelines are richer than this — a claim distinguishes For Approval
 * from For Denial — and that detail belongs on the claim, not on a card whose
 * job is to say whether anything is outstanding.
 */
export type PlanholderRequestStatus =
  | "Pending"
  | "In Progress"
  | "Approved"
  | "Denied";

/** One thing in flight against the plan. */
export interface PlanholderRequest {
  /** Unique within the list — source-prefixed, since two sources mint ids. */
  id: string;
  kind: PlanholderRequestKind;
  /** What the card is headed by — the kind, in practice. */
  title: string;
  /** The line under it, e.g. "LPA No. L25000123I". */
  description: string;
  /** What the request is quoted by outside this screen. */
  reference: string;
  currentStep: number;
  totalSteps: number;
  status: PlanholderRequestStatus;
  /** "May 20, 2026" — when it was raised. */
  date: string;
  /** Machine-sortable, so the list can be ordered without parsing the label. */
  sortDate: string;
  /**
   * The claim this row stands for, when it is a claim.
   *
   * CARRIED SO THE PROFILE CAN SWAP IN PLACE. Tapping a claim on this page puts
   * it in the main column beside the plan holder rather than navigating — the
   * behaviour the claim requests section had and the one thing about it worth
   * keeping. A service payable has no such view here and routes instead; see
   * {@link href}.
   */
  claim?: ClaimRequest;
  /** Where tapping goes, for a request this page cannot show in place. */
  href?: string;
}

/* ------------------------------ claims ------------------------------ */

/**
 * The claim pipeline as four steps: FILED, REVIEW, VERIFICATION, DECIDED.
 *
 * READ OFF THE PHASE, which is the only thing on a claim request that says where
 * it is. The middle of the pipeline is coarser than the steps suggest — nothing
 * on the request distinguishes "being reviewed" from "being verified" — so a
 * claim sitting with an approver reports step 3 and one merely filed reports
 * step 1. The step track is an indication of distance travelled, not a claim
 * about which desk the folder is on this minute.
 */
const CLAIM_STEP: Record<ClaimPhase, number> = {
  Pending: 1,
  "For Approval": 3,
  "For Denial": 3,
  Approved: 4,
  Denied: 4,
};

const CLAIM_STATUS: Record<ClaimPhase, PlanholderRequestStatus> = {
  Pending: "Pending",
  // BOTH DECISIONS IN FLIGHT ARE "IN PROGRESS". A claim on its way to being
  // denied is still being worked, and a card that said "Denied" before anybody
  // had denied it would be reporting an outcome as though it had happened.
  "For Approval": "In Progress",
  "For Denial": "In Progress",
  Approved: "Approved",
  Denied: "Denied",
};

/* ------------------------------ services ------------------------------ */

/**
 * The service payable pipeline as four steps, in the order the conveyor works
 * them: PROCESS, VERIFY, APPROVE, ENDORSE.
 *
 * The billing's stage IS the step, which is what makes this map one line per
 * queue. An ENDORSED billing has left all four — see below, where it is read off
 * the signature rather than the stage, because endorsement is not a fifth stage
 * in the model.
 */
const SERVICE_STEP: Record<BillingStage, number> = {
  "for-process": 1,
  processed: 2,
  verified: 3,
  approved: 4,
};

const SERVICE_STATUS: Record<BillingStage, PlanholderRequestStatus> = {
  "for-process": "Pending",
  processed: "In Progress",
  verified: "In Progress",
  approved: "In Progress",
};

/** "May 20, 2026" — the card's date, matching the BPIS one. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Everything in flight against a plan, newest first.
 *
 * IT READS BOTH SOURCES ON EVERY CALL rather than caching. Both are derived from
 * session stores that any act on either screen writes to — opening a claim,
 * terminating a plan — so a cached list is one that disagrees with the page it
 * is on. Call it from a component that subscribes to both stores.
 *
 * NEWEST FIRST, which is the opposite of the queues and right for the same
 * reason they are not: a queue is worked from the oldest end because the wait is
 * the point, and this is a plan's own history, read by somebody asking "what is
 * happening with this plan NOW".
 */
export function getPlanholderRequests(lpaNo: string): PlanholderRequest[] {
  const requests: PlanholderRequest[] = [];

  for (const claim of getClaimRequests(lpaNo)) {
    requests.push({
      id: `claim:${claim.id}`,
      kind: "Death Claim",
      // The KIND heads the card, not the benefit: this list mixes sources, so
      // the first thing a row has to say is which kind of thing it is. What
      // benefit was claimed is on the claim, one tap away.
      title: claim.kind ?? "Death Claim",
      description: `LPA No. ${claim.lpaNo}`,
      // The CLAIM NO once there is one, else the request no. A request that
      // nobody has opened is still tracked by the branch that filed it, and its
      // reference is the only number it has.
      reference: claim.claimNo ?? claim.reference,
      currentStep: CLAIM_STEP[claim.phase],
      totalSteps: 4,
      status: CLAIM_STATUS[claim.phase],
      date: claim.filedDisplay,
      sortDate: claim.filedAt,
      claim,
    });
  }

  for (const billing of getServiceBillings()) {
    for (const service of servicesOf(billing)) {
      if (service.lpaNo !== lpaNo) continue;

      // ENDORSED IS NOT A STAGE, it is a signature — the same reading
      // `billingQueue` makes so the conveyor does not serve an endorsed billing
      // twice. A billing that has gone to accounting is finished as far as this
      // plan is concerned, so it reports all four steps and settles.
      const endorsed = Boolean(getEndorsedBilling(billing.billingCode));

      requests.push({
        id: `service:${service.id}`,
        kind: "Service Payable",
        title: "Service Payable",
        description: `LPA No. ${service.lpaNo}`,
        reference: billing.billingNo ?? billing.billingCode,
        currentStep: endorsed ? 4 : SERVICE_STEP[billing.stage],
        totalSteps: 4,
        status: endorsed ? "Approved" : SERVICE_STATUS[billing.stage],
        date: formatDate(service.serviceDateISO),
        sortDate: service.serviceDateISO,
        href: "/claims/service-payables",
      });
    }
  }

  return requests.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}

/** The ones still awaiting somebody — what the card counts and shows. */
export function pendingRequests(
  requests: PlanholderRequest[],
): PlanholderRequest[] {
  return requests.filter(
    (request) => request.status === "Pending" || request.status === "In Progress",
  );
}

/**
 * The ones that are finished — what the History drawer lists.
 *
 * "PENDING" ON THIS CARD MEANS OUTSTANDING, not the claim phase of that name.
 * A claim sitting with an approver is not waiting on nobody, so it belongs on
 * the card and not in the history — which is why this is the complement of
 * {@link pendingRequests} rather than a second filter that could disagree.
 */
export function settledRequests(
  requests: PlanholderRequest[],
): PlanholderRequest[] {
  const pending = new Set(pendingRequests(requests).map((r) => r.id));
  return requests.filter((request) => !pending.has(request.id));
}

/**
 * A settled request in the shape the shared history drawer lists — the only
 * translation this page owes that component.
 *
 * THE DESCRIPTION IS THE OUTCOME, not the LPA line the card shows. The drawer
 * prints the kind as its heading and this underneath it, and what somebody
 * reading a finished request wants there is what became of it. The card's
 * `description` answers a different question ("which plan is this") and is
 * already on screen beside it.
 */
export function toHistoryItem(request: PlanholderRequest): RequestHistoryItem {
  return {
    type: request.kind,
    description: `${request.status} — ${request.title.toLowerCase()} on ${request.description.replace("LPA No. ", "LPA ")}`,
    transactionId: request.reference,
    date: request.date,
  };
}
