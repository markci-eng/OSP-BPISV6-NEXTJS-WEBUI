import { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { PhPaymentType } from "../pages/statement-of-accounts";

/**
 * Single source of truth for a plan's statement of accounts.
 *
 * Every figure shown on the LPA button and on the Statement of Accounts page is
 * derived here from the same `PlanDetailType`, so the two views always agree:
 *   totalPayments + balance === totalAmountPayable
 *   installmentsPaid <= totalInstallments
 *   paymentRecords.length === installmentsPaid
 *   sum(paymentRecords.siAmount) === totalPayments
 */

// How many months each payment period covers, keyed by plan mode.
const MODE_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  "SEMI-ANNUAL": 6,
  ANNUAL: 12,
  CASH: 0, // one-time, single installment
};

// Fixed "today" for the mock so the derived figures are deterministic.
const AS_OF = new Date("2026-07-13T00:00:00");

export interface PlanStatement {
  totalInstallments: number;
  installmentsPaid: number;
  installmentAmount: number;
  totalAmountPayable: number;
  totalPayments: number;
  balance: number;
  /** Whole-number percent paid (0–100). */
  progress: number;
  /** Due date of the next unpaid installment (or the last one, if fully paid). */
  nextDueDate: Date;
  terminationValue: number;
  paymentRecords: PhPaymentType[];
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Guard against month overflow (e.g. Jan 31 + 1 month -> Mar 3).
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function pad(n: number): string {
  return String(n).padStart(5, "0");
}

export function getPlanStatement(
  plan: PlanDetailType,
  asOf: Date = AS_OF,
): PlanStatement {
  const totalInstallments = Math.max(
    1,
    Math.round(plan.totalAmountPayable / plan.installmentAmount),
  );
  const monthsPerInstallment = MODE_MONTHS[plan.mode?.toUpperCase()] ?? 1;
  const start =
    plan.effectivityDate instanceof Date
      ? plan.effectivityDate
      : new Date(plan.effectivityDate);

  // Due date of installment n (1-based): n periods after effectivity.
  const dueDateOf = (n: number) =>
    monthsPerInstallment === 0
      ? new Date(start)
      : addMonths(start, n * monthsPerInstallment);

  // Count installments whose due date has already passed as of `asOf`.
  let installmentsPaid: number;
  if (monthsPerInstallment === 0) {
    installmentsPaid = totalInstallments; // CASH: paid in full up front
  } else {
    installmentsPaid = 0;
    for (let n = 1; n <= totalInstallments; n++) {
      if (dueDateOf(n) <= asOf) installmentsPaid = n;
      else break;
    }
  }

  const totalPayments = installmentsPaid * plan.installmentAmount;
  const balance = plan.totalAmountPayable - totalPayments;
  const progress = Math.round((totalPayments / plan.totalAmountPayable) * 100);
  const nextDueDate = dueDateOf(
    Math.min(installmentsPaid + 1, totalInstallments),
  );
  // Early-surrender value: a conservative fraction of what has been paid in.
  const terminationValue = Math.round(totalPayments * 0.6);

  // One receipt per paid installment (newest first, matching the table order).
  const paymentRecords: PhPaymentType[] = [];
  for (let n = installmentsPaid; n >= 1; n--) {
    const siDate = dueDateOf(n);
    const auditDate = addMonths(siDate, 0);
    auditDate.setDate(auditDate.getDate() + 1);
    const year = siDate.getFullYear();
    paymentRecords.push({
      lpaNumber: plan.lpaNumber,
      payClass: n === 1 ? "NS" : "DC",
      siNumber: `SI-${year}-${pad(n)}`,
      siDate,
      siAmount: plan.installmentAmount,
      planCode: plan.planCode,
      installmentNumber: n,
      nextDueDate: dueDateOf(Math.min(n + 1, totalInstallments)),
      cvNumber: `CV-${year}-${pad(n)}`,
      pcvNumber: `PCV-${year}-${pad(n)}`,
      auditDate,
    });
  }

  return {
    totalInstallments,
    installmentsPaid,
    installmentAmount: plan.installmentAmount,
    totalAmountPayable: plan.totalAmountPayable,
    totalPayments,
    balance,
    progress,
    nextDueDate,
    terminationValue,
    paymentRecords,
  };
}
