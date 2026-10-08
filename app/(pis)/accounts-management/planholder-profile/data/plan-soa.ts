// The selected plan's Statement of Account, for the profile's View SOA button
// (user, 2026-10-07).
//
// THE SAME FIGURES AS THE CARDS: the ledger, totals and due date come from the
// plan statement that Planholder Details and Payment Details are built from,
// the COFP number from the COFP and ROP Details card's data, and the remarks
// from the Remarks and Notes card's. The SOA dialog is the one Return of
// Premium opens; `buildStatementOfAccount` fills whatever is not given here
// from its sample.

import type { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { getPlanStatement } from "@/components/plan-management/planholder-profile/data/plan-statement";
import {
  buildStatementOfAccount,
  type StatementOfAccount,
} from "../../data/statement-of-account";
import { buildCofpRopDetails } from "./cofp-rop.data";

/**
 * yyyy-mm-dd in LOCAL time, which is what the SOA reads. `toISOString` would
 * give the UTC date — the day before, for a local midnight in Manila.
 */
function isoDate(date?: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function buildPlanSoa({
  plan,
  name,
  birthDate,
  address,
  remarks,
}: {
  plan: PlanDetailType;
  name: string;
  birthDate?: Date | null;
  address?: string;
  remarks: string;
}): StatementOfAccount {
  const statement = getPlanStatement(plan);
  const cofpNo = buildCofpRopDetails(plan).cofp?.cofpNo ?? "";

  return buildStatementOfAccount({
    contractNo: plan.lpaNumber,
    name: name.toUpperCase(),
    birthDate: isoDate(birthDate),
    branch: plan.branch,
    address: address ?? "",
    salesAgent: plan.salesAgent1,
    salesAgent2: plan.salesAgent2,

    planType: plan.planDescription,
    contractPrice: plan.contractPrice,
    mode: plan.mode,
    termYears: plan.term,
    instAmount: plan.installmentAmount,
    planTap: plan.totalAmountPayable,
    instNo: statement.installmentsPaid,

    insurability: plan.isInsured ? "INSURABLE" : "NOT INSURABLE",
    effectivity: isoDate(new Date(plan.effectivityDate)),
    newEffectivity: isoDate(new Date(plan.newEffectivityDate)),
    dueDate: isoDate(statement.nextDueDate),
    accountStatus: plan.accountStatus,
    terminationStatus: plan.terminationStatus,
    cofpNo,

    // Oldest first, as the printed ledger runs; the statement is newest first.
    payments: [...statement.paymentRecords].reverse().map((record) => ({
      payClass: record.payClass,
      planCode: record.planCode,
      orNo: record.siNumber,
      branch: plan.branch,
      orDate: isoDate(record.siDate),
      amount: record.siAmount,
      nextDue: isoDate(record.nextDueDate),
    })),

    totalPayments: statement.totalPayments,
    balance: statement.balance,
    remarks,
  });
}
