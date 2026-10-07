"use client";

// WHERE THIS DESK HAS GOT WITH EACH ACCOUNT — the one question the stepper's
// strip, its "who" line and the Jump list all ask, answered once.
//
// FOUR STATES (user, 2026-09-25):
//
//   untouched  nobody at this stage has had the record on screen.
//   opened     shown, but the stage's act has not been done to it.
//   done       terminated (For Process) or verified (For Verification).
//   held       a discrepancy — listed so the processor sees why the chapel is
//              short a payable, but never counted and never worked here.
//
// "DONE" ONLY EXISTS WHERE THE STAGE WORKS ACCOUNT BY ACCOUNT. `isAccountDone`
// reports every account done on the two reading queues, so asking it there
// would paint the whole strip green on arrival. Those queues get opened /
// untouched only, which is the question a reader of them actually has.

import {
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import { isAccountOpened } from "../service-payables-store";
import {
  isAccountDone,
  worksAccountByAccount,
  STAGE_DONE_WORD,
} from "./billing-queue";

export type AccountMark = "untouched" | "opened" | "done" | "held";

export function accountMark(
  billing: ServiceBilling,
  service: ServiceRecord,
  stage: BillingStage,
): AccountMark {
  if (service.discrepancy) return "held";
  if (worksAccountByAccount(stage) && isAccountDone(billing, service, stage)) {
    return "done";
  }
  return isAccountOpened(stage, service.id) ? "opened" : "untouched";
}

/**
 * Nobody at this stage has had the record on screen, and the stage's act has
 * not been done to it.
 *
 * WIDER THAN `mark === "untouched"`: a discrepancy nobody has opened is
 * unviewed too, because Process Billing wants every account seen (user,
 * 2026-09-25). The Not opened chip, its Jump filter and Next unviewed all ask
 * this, so the three cannot disagree.
 */
export function isUnviewed(
  billing: ServiceBilling,
  service: ServiceRecord,
  stage: BillingStage,
): boolean {
  if (isAccountOpened(stage, service.id)) return false;
  return accountMark(billing, service, stage) !== "done";
}

/** What each state is called at this stage — "done" takes the stage's verb. */
export function accountMarkLabel(mark: AccountMark, stage: BillingStage): string {
  switch (mark) {
    case "held":
      return "Discrepancy";
    case "done": {
      const word = worksAccountByAccount(stage) ? STAGE_DONE_WORD[stage] : "done";
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    case "opened":
      return "Opened";
    default:
      return "Not opened";
  }
}
