// Franchise Deductions — the rows the page lists, read off the service payables
// model.
//
// THE PERSON WHO WORKS THIS PAGE IS NOT A PROCESSOR (user, 2026-10-01). They
// type the ROYALTY a franchise owes, as another team's system gives it to them,
// and the LOAN is the backend's. So there is no queue here and no accounts:
// one row per franchise billing — its number, the mortuary, the period, the
// money — and never a planholder or an LPA.

import {
  defaultMortCodeFor,
  getBillingMortCode,
  getMortuary,
  getServiceBillings,
  isDeductionEditable,
  liveLoanFor,
  type BillingStage,
  type ServiceBilling,
} from "../service-payables/service-payables-data";
import { stageSince } from "../service-payables/conveyor/billing-queue";

/**
 * WHO MAY POST. Everybody on the claims team can open this page; only the
 * deductions user may post (user, 2026-10-01: "they can but they cant post").
 *
 * A PROTOTYPE FLAG, not a role — there is one `claims` role and the user asked
 * for no new one. True so the page can be worked end to end; flipping it shows
 * the claims team's read-only view. When the role exists, this is where it is
 * asked.
 */
export const CAN_POST_DEDUCTIONS = true;

/** The page's three tabs. */
export type DeductionTab = "pending" | "posted" | "all";

export const DEDUCTION_TABS: { key: DeductionTab; label: string }[] = [
  { key: "pending", label: "For Deduction" },
  { key: "posted", label: "Posted" },
  { key: "all", label: "All" },
];

/** A posted billing's status, as the Status column reads it. */
export const DEDUCTION_STATUS: Partial<
  Record<BillingStage, { label: string; color: string; bg: string }>
> = {
  "for-deduction": { label: "For Deduction", color: "#b45309", bg: "#fdf2e3" },
  processed: { label: "For Verification", color: "#2b5fb4", bg: "#e9f0fb" },
  verified: { label: "For Approval", color: "#2b5fb4", bg: "#e9f0fb" },
  approved: { label: "Approved", color: "#0c7a3b", bg: "#e7f5ec" },
};

export interface DeductionRow {
  billingCode: string;
  billingNo: string;
  mortCode: string;
  mortuary: string;
  periodLabel: string;
  /** "2026-06" — what the Month filter matches. */
  monthKey: string;
  stage: BillingStage;
  gross: number;
  /** Posted, or — while waiting — the backend's figure right now. */
  loan: number;
  /** Posted; `null` while the billing is still waiting for one. */
  royalty: number | null;
  /** Posted net; `null` while waiting. The table shows the live one. */
  net: number | null;
  editable: boolean;
  /** Oldest first, by when it reached the stage it is at. */
  since: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "June 2026" for a "2026-06" key. */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

function toRow(billing: ServiceBilling): DeductionRow {
  const mortCode =
    getBillingMortCode(billing.billingCode) ||
    defaultMortCodeFor(billing.chapelCode);
  const { period } = billing;
  return {
    billingCode: billing.billingCode,
    billingNo: billing.billingNo ?? billing.billingCode,
    mortCode,
    mortuary: getMortuary(mortCode)?.mortuary ?? billing.chapelDesc,
    periodLabel: billing.periodLabel,
    monthKey: `${period.year}-${String(period.month + 1).padStart(2, "0")}`,
    stage: billing.stage,
    gross: billing.totalCSP,
    loan:
      billing.deduction?.loan ??
      liveLoanFor(billing.chapelCode, billing.totalCSP),
    royalty: billing.deduction?.royalty ?? null,
    net: billing.deduction?.net ?? null,
    editable: isDeductionEditable(billing),
    since: stageSince(billing),
  };
}

/**
 * Every franchise billing that has been processed — waiting for its deduction
 * or past it. For Process ones are left out: they have nothing to deduct from
 * yet.
 */
export function getDeductionRows(): DeductionRow[] {
  return getServiceBillings()
    .filter((b) => b.isFranchise && b.stage !== "for-process")
    .map(toRow)
    .sort(
      (a, b) =>
        a.since.localeCompare(b.since) ||
        a.billingNo.localeCompare(b.billingNo),
    );
}

export function inTab(row: DeductionRow, tab: DeductionTab): boolean {
  if (tab === "all") return true;
  return tab === "pending"
    ? row.stage === "for-deduction"
    : row.stage !== "for-deduction";
}

/** "3,375.00" — typed amounts are tidied to this on blur. */
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** What was typed, as a number — `null` when blank, `NaN` when not a number. */
export function parseAmount(text: string): number | null {
  const trimmed = text.replace(/,/g, "").trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : Number.NaN;
}
