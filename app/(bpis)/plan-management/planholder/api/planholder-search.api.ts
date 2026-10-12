import { delay } from "@/lib/delay";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";

export const PLANHOLDER_PAGE_SIZE = 20;

export function filterPlanholdersByQuery(query: string): PlanholderLookup[] {
  const q = query.trim().toUpperCase();
  if (!q) return planholderLookup;

  return planholderLookup.filter(
    (ph) =>
      ph.lpaNumber.includes(q) ||
      ph.firstName.includes(q) ||
      ph.lastName.includes(q) ||
      ph.middleName.includes(q) ||
      ph.personId.includes(q),
  );
}

export async function getPlanholdersByQuery(
  query: string,
): Promise<PlanholderLookup[]> {
  await delay(300);

  return filterPlanholdersByQuery(query);
}
