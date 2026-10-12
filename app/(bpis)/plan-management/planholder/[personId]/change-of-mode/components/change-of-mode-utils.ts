import type { RefPlanType } from "@/types/reference-table.types";

/** Most to least frequent. A plan can only move rightwards along this. */
export const MODES = ["MONTHLY", "QUARTERLY", "SEMI-ANNUAL", "ANNUAL"] as const;
export type Mode = (typeof MODES)[number];

/**
 * `refplantype`'s mode codes. C (spot cash) is left out on purpose: it is
 * paid in full up front, not a mode an installment plan changes to.
 */
const MODE_BY_CODE: Record<string, Mode> = {
  M: "MONTHLY",
  Q: "QUARTERLY",
  S: "SEMI-ANNUAL",
  A: "ANNUAL",
};

export function monthsPerMode(mode: string) {
  switch (mode.toUpperCase()) {
    case "MONTHLY":
      return 1;
    case "QUARTERLY":
      return 3;
    case "SEMI-ANNUAL":
      return 6;
    default:
      return 12;
  }
}

/**
 * The plan types `planCode` can change to, one per mode: the rows sharing its
 * catalog. Should a catalog carry more than one term, the row with the
 * plan's own term wins.
 */
export function modeOptions(
  planTypes: RefPlanType[],
  planCode: string | undefined,
): Partial<Record<Mode, RefPlanType>> {
  const current = planTypes.find((t) => t.planCode === planCode);
  if (!current?.catalogId) return {};

  const options: Partial<Record<Mode, RefPlanType>> = {};
  for (const type of planTypes) {
    if (type.catalogId !== current.catalogId) continue;
    const mode = MODE_BY_CODE[type.mode?.toUpperCase() ?? ""];
    if (!mode) continue;
    const existing = options[mode];
    if (!existing || (type.term === current.term && existing.term !== current.term)) {
      options[mode] = type;
    }
  }
  return options;
}

/** A plan's chosen new mode and what switching to it works out to. */
export type ModeChange = {
  lpaNo: string;
  newPlanCode: string;
  newMode: Mode;
  /**
   * Old-mode installments still to pay so the months covered so far land on
   * a whole new-mode installment.
   */
  pendingInstallments: number;
  pendingAmount: number;
  newInstallmentAmount: number;
  /** New-mode installments the plan counts as paid once the pending ones are. */
  newInstallmentsDone: number;
  newInstallmentsRemaining: number;
  newBalance: number;
  newTotalAmountPayable: number;
};

/**
 * What switching `plan` to `newMode`, priced by `target`, comes to.
 *
 * The months already paid for carry over. Whatever doesn't divide evenly
 * into the new mode's installments is settled at the old installment amount
 * first, and the remaining months are billed at the new mode's.
 */
export function computeModeChange(
  plan: {
    lpaNo: string;
    mode: string;
    term: string;
    instNo: number;
    totalAmountPayable: number | null;
    balance: number | null;
  },
  currentInstallmentAmount: number,
  newMode: Mode,
  target: RefPlanType,
): ModeChange {
  const oldMonths = monthsPerMode(plan.mode);
  const newMonths = monthsPerMode(newMode);
  const totalMonths = Number(target.term ?? plan.term) * 12;
  const monthsDone = plan.instNo * oldMonths;
  const monthsRemaining = Math.max(0, totalMonths - monthsDone);

  const newInstallmentsRemaining = Math.floor(monthsRemaining / newMonths);
  const pendingInstallments =
    (monthsRemaining - newInstallmentsRemaining * newMonths) / oldMonths;
  const pendingAmount = pendingInstallments * currentInstallmentAmount;

  const amountPaid =
    plan.totalAmountPayable != null && plan.balance != null
      ? plan.totalAmountPayable - plan.balance
      : plan.instNo * currentInstallmentAmount;
  const newInstallmentAmount = target.instAmt ?? 0;
  const newBalance = newInstallmentAmount * newInstallmentsRemaining;

  return {
    lpaNo: plan.lpaNo,
    newPlanCode: target.planCode,
    newMode,
    pendingInstallments,
    pendingAmount,
    newInstallmentAmount,
    newInstallmentsDone: totalMonths / newMonths - newInstallmentsRemaining,
    newInstallmentsRemaining,
    newBalance,
    newTotalAmountPayable: newBalance + amountPaid + pendingAmount,
  };
}

export const formatPeso = (amount: number) =>
  "₱" +
  amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatCount = (value: number) => value.toLocaleString("en-US");

/** Installments paid against the plan's total, and the percentage that is. */
export function installmentProgress(plan: {
  mode: string;
  term: string;
  instNo: number;
}) {
  const total = (12 / monthsPerMode(plan.mode)) * Number(plan.term);
  const progress =
    total > 0 ? Math.min(100, Math.round((plan.instNo / total) * 100)) : 0;

  return { total, progress };
}
