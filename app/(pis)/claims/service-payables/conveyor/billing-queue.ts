"use client";

// THE QUEUE RULE — which billing is served next, and which account opens on it.
//
// This is the one genuinely new thing the conveyor needed. Everything else it
// does is an existing component in a different arrangement; this is the part the
// four workspace pages never had to answer, because they asked the user instead:
// pick a territory, pick a staff member, pick a card off the stack.
//
// THE ORDER IS FIRST IN, FIRST OUT — AND "IN" MEANS INTO THIS STAGE (user,
// 2026-09-11: "the verification would also be the first one who got endorsed for
// verification"). Not the newest period, which is the order `getServiceBillings`
// returns them in, and not the largest payable. A billing that has been sitting
// in For Verification since the 3rd is served before one that arrived this
// morning, whatever period either of them covers.
//
// WHICH DATE SAYS THAT IS DIFFERENT AT EVERY STAGE, and all four are already on
// file — the `TblClaimsBilling` row carries three of them, and the fourth is the
// billing's own period:
//
//   for-process   the period's LAST DAY. There is no signature yet — nothing has
//                 happened to the billing — so the thing it has been waiting
//                 since is the close of the week it covers.
//   processed     `cisUploadDate`, written when the billing was put through,
//                 which is the moment it landed in For Verification.
//   verified      `dateVerified`.
//   approved      `dateApproved`.
//
// READ OFF THE ROW rather than added as a field to `ServiceBilling`. The stage a
// billing is at already decides which column to read, so a `stageSince` on the
// model would be the same rule written twice — once to fill the field and once
// to know which signature filled it. One rule, here.

import { db } from "../../../data";
import {
  getBillingsByStage,
  isServiceTerminated,
  servicesOf,
  type BillingPeriod,
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  getEndorsedBilling,
  getVerifiedAccount,
} from "../service-payables-store";

/**
 * The day each cut starts — 1-7, 8-15, 16-22, 23-EOM.
 *
 * The four half-month cuts are settled, and `CUT_START_DAYS` is the data
 * layer's own. It is not exported, and what this file wants is the END of a
 * cut, which nothing computes — so the starts are restated here and read
 * backwards. Only the fourth cut varies in length, which is why it is the one
 * with no start day after it to subtract from.
 */
const CUT_START_DAYS = [1, 8, 16, 23];

/** The last day of a billing period, as an ISO date. */
function periodEndISO(period: BillingPeriod): string {
  const nextCutStart = CUT_START_DAYS[period.cut]; // undefined on cut 4
  const lastDay = nextCutStart
    ? nextCutStart - 1
    : new Date(Date.UTC(period.year, period.month + 1, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${period.year}-${pad(period.month + 1)}-${pad(lastDay)}`;
}

/**
 * WHEN THIS BILLING ENTERED THE STAGE IT IS AT — what the queue is ordered by,
 * and what the served card reports as how long it has been waiting.
 *
 * Falls back to the period's end wherever the row is missing or its column is
 * blank, and that is not a guess: a billing with no signature on file has not
 * been signed, so the close of its period is genuinely the last thing that
 * happened to it.
 */
export function stageSince(billing: ServiceBilling): string {
  const row = db.getClaimsBillingByCode(billing.billingCode);
  const fallback = periodEndISO(billing.period);
  if (!row) return fallback;

  switch (billing.stage) {
    case "approved":
      return row.dateApproved || fallback;
    case "verified":
      return row.dateVerified || fallback;
    case "processed":
      return row.cisUploadDate || fallback;
    default:
      return fallback;
  }
}

/**
 * The stage's billings, longest wait first.
 *
 * TIES BROKEN BY THE CODE, so the order is STABLE. Without it two billings
 * signed on the same day could swap places between one store write and the
 * next — and on a screen that serves the head of the queue, that is the served
 * billing changing under the processor for no reason they can see.
 */
export function billingQueue(stage: BillingStage): ServiceBilling[] {
  return [...getBillingsByStage(stage)]
    // ENDORSED BILLINGS ARE OUT (2026-09-14). The other three acts move a
    // billing to the next STAGE, so the queue it just left stops returning it
    // on its own — `getBillingsByStage` reads the signature and files it one
    // stage on. Endorsement has no stage after it: `BillingStage` has four and
    // accounting's own side is not described, so the billing would otherwise
    // sit in For Endorsement with its signature on it, served again on the next
    // visit as though nothing had happened.
    //
    // FILTERED HERE AND NOT IN THE DATA LAYER, which is the same call the note
    // on `endorsedBillingByCode` makes: this is the conveyor's rule about its
    // own last queue, not a fifth stage in the model. A fifth stage is what the
    // day accounting's desk is described, and it belongs in
    // `getServiceBillings` with the other three when it comes.
    .filter((billing) => !getEndorsedBilling(billing.billingCode))
    .sort((a, b) => {
      const since = stageSince(a).localeCompare(stageSince(b));
      return since !== 0 ? since : a.billingCode.localeCompare(b.billingCode);
    });
}

/**
 * Whether this account still needs the stage's act.
 *
 * WHAT "DONE" MEANS CHANGES WITH THE QUEUE, and only two of the four have a
 * per-account act at all:
 *
 *   for-process  the plan is terminated into the billing.
 *   processed    the account carries a verifier's signature.
 *   verified     nothing — an approver signs the BILLING, not its accounts.
 *   approved     nothing, and not even the billing's act yet.
 *
 * So the last two report every account done, which is what makes the conveyor
 * treat them as readings rather than as work: there is nothing to advance
 * through, and the commit at the foot of the rail is the whole visit.
 *
 * A DISCREPANT ACCOUNT IS "DONE" HERE, and that is not the same as finished. It
 * is an account that should never have been served — held off the billing, out
 * of the total, with nothing this screen can do to it — so it must not sit in
 * the denominator holding a billing open forever. `servicesOf` still lists it,
 * because the processor needs to see WHY the chapel is short a payable.
 */
export function isAccountDone(
  billing: ServiceBilling,
  service: ServiceRecord,
  stage: BillingStage,
): boolean {
  if (service.discrepancy) return true;
  switch (stage) {
    case "for-process":
      return isServiceTerminated(billing, service);
    case "processed":
      return Boolean(getVerifiedAccount(service.id));
    default:
      return true;
  }
}

/**
 * The account the conveyor opens on — the first not yet done, else the first on
 * the billing.
 *
 * THE FALLBACK IS NOT A FAILURE STATE. On For Approval and For Endorsement every
 * account reads as done, so the fallback is the ordinary path: the record opens
 * at the top of the list and the rail is a reading. It also covers the beat
 * after a For Process billing finishes, where something has to be on screen
 * until the next billing swaps in.
 */
export function firstUndoneAccount(
  billing: ServiceBilling,
  stage: BillingStage,
): ServiceRecord | undefined {
  const services = servicesOf(billing);
  return (
    services.find((service) => !isAccountDone(billing, service, stage)) ??
    services[0]
  );
}

/** How far through this billing's accounts the stage's act has got. */
export function stageProgress(
  billing: ServiceBilling,
  stage: BillingStage,
): { done: number; total: number } {
  const services = servicesOf(billing);
  return {
    done: services.filter((service) => isAccountDone(billing, service, stage))
      .length,
    total: services.length,
  };
}

/**
 * The stages whose work is done ACCOUNT BY ACCOUNT — the only two that have
 * progress to report.
 *
 * For Process terminates each plan in turn and For Verification signs each
 * account in turn, so on both of those "how far through" is the question the
 * rail is asked all day. For Approval and For Endorsement act on the BILLING:
 * the accounts are read, nothing is done to them one at a time, and there is no
 * sequence to be part of the way through.
 */
export type AccountStage = "for-process" | "processed";

/**
 * Whether the stage works the billing one account at a time.
 *
 * A TYPE GUARD rather than a boolean, so {@link STAGE_DONE_WORD} can be typed to
 * the two stages that actually have a word — and a caller that reaches for one
 * on For Approval does not compile. The alternative was a map with "accounts"
 * filled into the other two slots, which is what it had: a word invented to fill
 * a sentence that should not have been drawn.
 */
export function worksAccountByAccount(
  stage: BillingStage,
): stage is AccountStage {
  return stage === "for-process" || stage === "processed";
}

/** What the stage's per-account act is called, in the progress line. */
export const STAGE_DONE_WORD: Record<AccountStage, string> = {
  "for-process": "terminated",
  processed: "verified",
};

/**
 * How long the billing has been waiting, in words — "3 days", "today".
 *
 * SAID IN DAYS AND NOT AS A DATE, because what needs explaining is the queue's
 * ORDER: a processor reading "waiting 9 days" understands why this billing came
 * up and not another, where a date is a fact they would have to do arithmetic
 * on. The date itself is one hover away, in the element's `title`.
 */
export function waitingFor(billing: ServiceBilling): string {
  const since = Date.parse(`${stageSince(billing)}T00:00:00`);
  if (!Number.isFinite(since)) return "";

  const days = Math.max(
    0,
    Math.floor((Date.now() - since) / (24 * 60 * 60 * 1000)),
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

/** Long enough that the wait is the notable thing about the billing. */
export const LONG_WAIT_DAYS = 20;

/** Whether this billing has been waiting long enough to say so in colour. */
export function isLongWait(billing: ServiceBilling): boolean {
  const since = Date.parse(`${stageSince(billing)}T00:00:00`);
  if (!Number.isFinite(since)) return false;
  return (Date.now() - since) / (24 * 60 * 60 * 1000) > LONG_WAIT_DAYS;
}
