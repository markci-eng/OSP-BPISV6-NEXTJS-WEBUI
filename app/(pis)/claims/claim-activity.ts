// The processor's status-change history — which claims have MOVED ON, and when.
//
// Lives here, one level above the death-claim module that grew it, because two
// different parts of the app need the same answer and only one of them is about
// death claims. The dashboard's Recent Updates deck reads it as a feed; the plan
// holder profile reads it as a FACT — that a request named here has had a claim
// opened against it, so the claim no on its header is real.
//
// Without that second reader the two disagreed. The feed resolved a claim no for
// every event ("every request in the feed has had a header opened against it"),
// while the profile went by the request's own status, which the seed leaves at
// "Pending" for most of them — so a claim the dashboard was reporting as
// approved was, on the plan holder's page, a request nobody had opened. Same
// claim, two answers.
//
// It imports `ClaimPhase` as a TYPE only. `claims-data` imports this module at
// runtime, and a value import back the other way would close the loop.

import { bulkDecidedClaimRefs } from "../data";
import type { ClaimPhase } from "./claims-data";

/**
 * A single status-change event on a real death claim, keyed by the claim's
 * request reference. The seed only stores each claim's CURRENT status (mostly
 * "Pending"), so the activity history is written here.
 *
 * Deliberately carries NO "Pending" events. A pending claim is already counted
 * on the dashboard's Claims Overview and listed in full under For Process
 * Claims, so repeating it here would say nothing new. This is for claims that
 * have MOVED ON — endorsed, approved or denied.
 */
export interface ActivityEvent {
  reference: string;
  phase: ClaimPhase;
  remarks: string;
  timeAgo: string;
}

export const activityFeed: ActivityEvent[] = [
  {
    reference: "CLTACLOBAN2026ADB000015",
    phase: "For Approval",
    remarks: "Submitted for approval",
    timeAgo: "15m ago",
  },
  {
    reference: "CLCDO2026ADB000014",
    phase: "Approved",
    remarks: "Approved for release",
    timeAgo: "40m ago",
  },
  {
    reference: "CLBAGUIO2026ADB000013",
    phase: "Denied",
    remarks: "Denied — beyond contestability period",
    timeAgo: "1h ago",
  },
  {
    reference: "CLANGELES2026CAB000011",
    phase: "Approved",
    remarks: "Benefit released to beneficiary",
    timeAgo: "3h ago",
  },
  {
    reference: "CLVIGAN2026CAB000010",
    phase: "For Approval",
    remarks: "Endorsed for approval",
    timeAgo: "5h ago",
  },
  {
    reference: "CLLUCENA2026USB000009",
    phase: "Denied",
    remarks: "Denied — insufficient supporting documents",
    timeAgo: "Yesterday",
  },
  {
    reference: "CLMANILA2026CAB000007",
    phase: "Approved",
    remarks: "Approved for release",
    timeAgo: "2d ago",
  },
  {
    reference: "CLMANILA2026CAB000003",
    phase: "For Approval",
    remarks: "Submitted for approval",
    timeAgo: "2d ago",
  },
  {
    reference: "CLILOILO2026CAB000005",
    phase: "Approved",
    remarks: "Approved for release — payee verified and cleared for payout",
    timeAgo: "3d ago",
  },
  {
    reference: "CLBATANGAS2026ECAB000004",
    phase: "Denied",
    remarks:
      "Denied — the plan was already lapsed on the date of the incident, so no benefit is payable",
    timeAgo: "3d ago",
  },
  {
    reference: "CLCEBU2026CAB000002",
    phase: "For Approval",
    remarks: "Endorsed for approval — complete requirements on file",
    timeAgo: "4d ago",
  },
  {
    reference: "CLQCITY2026CAB000001",
    phase: "Approved",
    remarks: "Benefit released to the named beneficiary",
    timeAgo: "5d ago",
  },
  // Older history. Everything from here down is past the 12 the dashboard deck
  // shows, and is only ever seen in the drawer — which is the point: it is what
  // the batched loading there exists to page through.
  {
    reference: "CLSANFER2026CAB000006",
    phase: "Approved",
    remarks: "Approved for release",
    timeAgo: "5d ago",
  },
  {
    reference: "CLNAGA2026CAB000008",
    phase: "Denied",
    remarks: "Denied — the incident falls outside the coverage of the plan",
    timeAgo: "6d ago",
  },
  {
    reference: "CLDAVAO2026ADB000012",
    phase: "For Approval",
    remarks:
      "Endorsed for approval after the branch completed the requirements",
    timeAgo: "6d ago",
  },
  {
    reference: "CLQCITY2026CAB000016",
    phase: "Approved",
    remarks: "Benefit released to beneficiary",
    timeAgo: "1w ago",
  },
  {
    reference: "CLCEBU2026CAB000017",
    phase: "For Approval",
    remarks: "Submitted for approval",
    timeAgo: "1w ago",
  },
  {
    reference: "CLMANILA2026ECAB000018",
    phase: "Denied",
    remarks: "Denied — cause of death excluded under the extended coverage",
    timeAgo: "1w ago",
  },
  {
    reference: "CLDAVAO2026ADB000019",
    phase: "Approved",
    remarks: "Approved for release — cleared for payout",
    timeAgo: "2w ago",
  },
  {
    reference: "CLILOILO2026CAB000020",
    phase: "For Approval",
    remarks: "Endorsed for approval",
    timeAgo: "2w ago",
  },
  // The bulk claims the seed marked as decided. The endorsement queue is driven
  // by this history rather than by status alone (see `getForEndorsementClaims`),
  // so a decided claim only reaches it once something here names it — which is
  // why these are generated from the seed's own list rather than written out.
  ...bulkDecidedClaimRefs.map((reference, index) => ({
    reference,
    phase: (index % 4 === 0 ? "Denied" : "Approved") as ClaimPhase,
    remarks:
      index % 4 === 0
        ? "Denied — beyond the contestability period"
        : "Approved for release",
    timeAgo: `${index + 3}w ago`,
  })),
];

/**
 * Requests that have had a claim opened against them.
 *
 * Every event above is a status a claim reached AFTER being created, so being
 * named here is proof the claim exists — and therefore that the header joined to
 * the request carries a real claim no rather than the stub a pending request has
 * for its payee.
 *
 * This is what lets the plan holder's Claim Requests section list a claim the
 * dashboard is already reporting on. Read `getClaimRequests` for where it is
 * applied and what it overrides.
 */
export const openedClaimReferences: ReadonlySet<string> = new Set(
  activityFeed.map((event) => event.reference),
);

/**
 * The status each claim was last reported at, by request reference.
 *
 * The feed is ordered newest first, so the FIRST event naming a reference is its
 * latest status — hence the guard against overwriting.
 *
 * This exists because knowing a claim was opened is only half the answer. The
 * seed leaves the request at "Pending" and its header at whatever it was written
 * with, so a claim listed on the strength of the history above would otherwise
 * appear as a claim no next to the word "Pending" — a claim that has been
 * created and not yet started, which is not a state that exists. The status the
 * history reports is the one the dashboard shows for the same claim, and now the
 * one the plan holder's page shows too.
 */
export const openedClaimPhases: ReadonlyMap<string, ClaimPhase> = (() => {
  const phases = new Map<string, ClaimPhase>();
  for (const event of activityFeed) {
    if (!phases.has(event.reference)) phases.set(event.reference, event.phase);
  }
  return phases;
})();
