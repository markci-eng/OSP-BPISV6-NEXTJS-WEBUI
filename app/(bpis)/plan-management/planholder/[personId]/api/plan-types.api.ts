import { delay } from "@/lib/delay";
import type { RefPlanType } from "@/types/reference-table.types";
import { PlanTypesData } from "../../../data/plan-types.data";

// The mock spells modes out; the reference table stores one-letter codes.
const MODE_CODES: Record<string, string> = {
  MONTHLY: "M",
  QUARTERLY: "Q",
  "SEMI-ANNUAL": "S",
  ANNUAL: "A",
  C: "C",
};

/**
 * The plan-type reference table, from the mock catalog. A product's plan
 * codes share a catalog when they are the same plan sold under the same
 * class, whatever their mode or term.
 */
export async function getPlanTypes(): Promise<RefPlanType[]> {
  await delay(200);
  return PlanTypesData.map((t) => ({
    planCode: t.planCode,
    catalogId: `${t.planDescription}|${t.planClass}`,
    planClass: t.planClass,
    mode: MODE_CODES[t.mode.toUpperCase()] ?? t.mode,
    term: String(t.term),
    tap: t.totalAmountPayable,
    cbi: t.contractPrice,
    instAmt: t.installmentAmount,
    benefits: null,
    isActive: true,
    auditUser: null,
    auditDate: new Date(t.auditDate).toISOString(),
    editUser: null,
    editDate: null,
  }));
}
