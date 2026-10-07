"use client";

// THE USER'S OWN BILLINGS — what the History card at the foot of the rail counts.
//
// THE DEATH CLAIM'S CARD, WITH A BILLING'S ROWS (user, 2026-09-30). Same card,
// same Weekly / Monthly / Yearly switch, same arrows; what differs is only what
// a billing can become:
//
//   For verification  processed, waiting on a verifier.
//   For approval      verified, waiting on the approvals desk.
//   Approved          the end. Approval endorses to accounting automatically,
//                     and a billing is never denied or sent back — so there is
//                     no Endorsed, Denied or Returned row.
//
// ONE LIST, WHOEVER IS READING. A verifier can also process, so the card does
// not split by desk: a billing is in it if this user processed it OR verified
// it, and sits under the row for where it is now. Each billing appears once, so
// the three narrow rows always add up to All.
//
// COUNTED BY THE AUDIT DATE (user, 2026-09-30), the day this user signed it —
// not the billing period it bills. Where they did both, the later signature:
// that is their most recent work on it.

import { db } from "../../../data";
import {
  servicesOf,
  type ServiceBilling,
} from "../service-payables-data";
import {
  CREATED_BY,
  getCreatedBilling,
  getTermination,
  getVerifiedBilling,
} from "../service-payables-store";
import type { WorkListRow } from "../../death-claim/conveyor/work-lists";

/** A History row's key — the billing's stage, or everything. */
export type BillingHistoryKey =
  | "all"
  | "for-deduction"
  | "processed"
  | "verified"
  | "approved";

export const BILLING_HISTORY_ROWS: WorkListRow<BillingHistoryKey>[] = [
  { key: "all", label: "All", title: "All your billings" },
  // A franchise billing processed and still waiting on its deductions.
  { key: "for-deduction", label: "For deduction", title: "Waiting for deduction" },
  { key: "processed", label: "For verification", title: "Waiting for verification" },
  { key: "verified", label: "For approval", title: "Waiting for approval" },
  { key: "approved", label: "Approved", title: "Approved billings" },
];

/** One billing in the user's history, and the day that puts it in a period. */
export interface BillingHistoryEntry {
  billing: ServiceBilling;
  /** "YYYY-MM-DD" — the audit date. See the note at the top. */
  atISO: string;
}

/**
 * When the billing was PROCESSED, as an ISO date.
 *
 * On file it is `dateProcessed`. A billing put through this session has no such
 * column written — Process Billing terminates the accounts and the completion
 * rule does the rest — so its date is the last termination posted against it,
 * which is the moment it was finished.
 */
function processedOn(billing: ServiceBilling): string | undefined {
  const onFile = db.getClaimsBillingByCode(billing.billingCode);
  if (onFile?.dateProcessed) return onFile.dateProcessed;

  const posted = servicesOf(billing)
    .map((service) => getTermination(service.id)?.auditDate)
    .filter((date): date is string => Boolean(date))
    .sort();
  return (
    posted.at(-1)?.slice(0, 10) ??
    getCreatedBilling(billing.billingCode)?.cisUploadDate ??
    onFile?.cisUploadDate
  );
}

/** Who verified the billing and when — this session's signature, else the row's. */
function verification(
  billing: ServiceBilling,
): { by: string; on: string } | undefined {
  const signed = getVerifiedBilling(billing.billingCode);
  if (signed) return { by: signed.verifiedBy, on: signed.dateVerified };
  const onFile = db.getClaimsBillingByCode(billing.billingCode);
  return onFile?.verifiedBy && onFile.dateVerified
    ? { by: onFile.verifiedBy, on: onFile.dateVerified }
    : undefined;
}

/**
 * Every billing this user processed or verified, oldest audit date first.
 *
 * FOR PROCESS IS LEFT OUT, even where this user's name is on it: a billing
 * still being worked is not history yet, and its name is only the one that
 * minted the number.
 */
export function billingHistory(
  billings: ServiceBilling[],
  user: string = CREATED_BY,
): BillingHistoryEntry[] {
  const entries: BillingHistoryEntry[] = [];
  for (const billing of billings) {
    if (billing.stage === "for-process") continue;

    const dates: string[] = [];
    if (billing.processedBy === user) {
      const on = processedOn(billing);
      if (on) dates.push(on);
    }
    const verified = verification(billing);
    if (verified?.by === user) dates.push(verified.on);

    if (dates.length === 0) continue;
    entries.push({ billing, atISO: dates.sort().at(-1)! });
  }
  return entries.sort(
    (a, b) =>
      a.atISO.localeCompare(b.atISO) ||
      a.billing.billingCode.localeCompare(b.billing.billingCode),
  );
}

/** The entries a History row holds. */
export function historyRow(
  entries: BillingHistoryEntry[],
  key: BillingHistoryKey,
): BillingHistoryEntry[] {
  return key === "all"
    ? entries
    : entries.filter((entry) => entry.billing.stage === key);
}
