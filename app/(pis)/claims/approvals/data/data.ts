// The approval queues, built from the claims data the rest of the module runs
// on rather than from a seed of their own.
//
// Nothing here invents a row. A service payable awaiting approval is a billing
// the processor has VERIFIED (`BILLING_QUEUE_LABELS.verified` is literally "For
// Approval"), and a death claim awaiting approval is one a processor has
// endorsed. Both queues already exist and are already worked elsewhere; this
// page is the supervisor's view onto the same records, so it reads the same
// selectors. A separate seed would drift the moment either queue changed.

import {
  cutRange,
  getBillingsByStage,
  periodLabel as formatPeriod,
  type BillingStage,
  type ServiceBilling,
} from "../../service-payables/service-payables-data";
import {
  filedFullDisplay,
  getForApprovalClaims,
  planholderName,
  toSurnameFirst,
  type DeathClaim,
} from "../../death-claim/death-claims-data";
import { formatFiledDate } from "../../claims-data";
import type {
  ApprovalStatus,
  DeathClaimApproval,
  ServiceApproval,
} from "./types";

/* ------------------------------ service payables ------------------------------ */

/**
 * The ONE billing stage this page lists: `verified`.
 *
 * ONLY WHAT AWAITS A DECISION (user, 2026-09-15) — "in for approval only the
 * verified claims and service would be listed there". `verified` IS the For
 * Approval queue; see `BILLING_QUEUE_LABELS`, which spells it out.
 *
 * THE `approved` STAGE WAS LISTED HERE TOO for half a day, so the Approved card
 * would have something to count. It was the wrong trade: a queue that also shows
 * finished work is a queue you have to read before you can tell what is left,
 * and the page's whole job is to say what is left. Approved billings are worked
 * at For Endorsement on the service payables conveyor, which is where they
 * belong. The card now counts what this session approved, and starts at zero.
 */
const SERVICE_STAGE: BillingStage = "verified";

function toServiceApproval(
  billing: ServiceBilling,
  status: ApprovalStatus,
): ServiceApproval {
  const { toISO } = cutRange(billing.period);

  return {
    billingCode: billing.billingCode,
    // A billing past For Process always carries a number; the fallback is the
    // billing code rather than a blank, because this row has to be identifiable
    // by SOMETHING and the code is what the queue screens show when there is no
    // number yet.
    billingNo: billing.billingNo ?? billing.billingCode,
    chapelCode: billing.chapelCode,
    chapelDesc: billing.chapelDesc,
    territoryCode: billing.territoryCode,
    periodLabel: billing.periodLabel || formatPeriod(billing.period),
    periodEndISO: toISO,
    requestDate: formatFiledDate(toISO),
    serviceCount: billing.services.length,
    // A subset of `services`, not a bucket beside it — see `ServiceBilling`.
    deficientCount: billing.deficient.length,
    totalAmount: billing.totalCSP,
    requester: billing.processedBy ?? "—",
    isFranchise: billing.isFranchise,
    status,
  };
}

/** Verified service payables waiting on the approver, newest period first. */
export function getServiceApprovals(): ServiceApproval[] {
  return getBillingsByStage(SERVICE_STAGE)
    .map((billing) => toServiceApproval(billing, "Pending"))
    .sort((a, b) => b.periodEndISO.localeCompare(a.periodEndISO));
}

/* -------------------------------- death claims -------------------------------- */

function toDeathClaimApproval(claim: DeathClaim): DeathClaimApproval {
  const name = planholderName(claim.lpaNo);

  return {
    id: claim.claimNo || claim.reference,
    claimNo: claim.claimNo ?? "",
    reference: claim.reference,
    lpaNo: claim.lpaNo,
    // Read off the claim rather than assumed — which is the whole reason
    // `DeathClaim.kind` exists; see its note.
    kind: claim.kind,
    // Blank for a nature the seven-day rule does not apply to — see `priority`.
    priority:
      claim.kind === "Death Claim"
        ? claim.type === "special"
          ? "Special"
          : "Regular"
        : "",
    planholder: name ? toSurnameFirst(name) : "—",
    benefit: claim.benefits,
    dateOfDeath: formatFiledDate(claim.dateOfDeath),
    // The filed moment with its year — two claims a year apart read as the same
    // day without it, in a list whose ordering rule is FIFO.
    filedDate: filedFullDisplay(claim).split("·")[0].trim(),
    filedAt: claim.filedAt,
    requester: claim.processor.name,
    requestingBranch: claim.requestingBranch,
    // EVERY ROW IS PENDING, because every row is a claim nobody has approved
    // yet — see `getForApprovalClaims`. A row only carries another status once
    // this session decides it.
    status: "Pending",
  };
}

/**
 * Verified death claims waiting on the approver.
 *
 * ALREADY IN QUEUE ORDER — SPECIAL FIRST, THEN OLDEST FILED (user, 2026-09-15).
 * `getForApprovalClaims` sorts with `compareByQueueOrder`, the same comparator
 * the conveyor's queues use, so this page and that one cannot disagree about
 * what "next" means. Nothing re-sorts here; a second copy of the one rule the
 * whole feature turns on is exactly what drifts.
 */
export function getDeathClaimApprovals(): DeathClaimApproval[] {
  return getForApprovalClaims().map(toDeathClaimApproval);
}
