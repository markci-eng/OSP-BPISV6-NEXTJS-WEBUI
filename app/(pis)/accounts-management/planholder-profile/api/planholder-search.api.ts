import { delay } from "@/lib/delay";
import { planholderLookup } from "../data/planholder-lookup";
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

export function filterPlanholders(
  query: string,
  status: string,
): PlanholderLookup[] {
  const queryFiltered = filterPlanholdersByQuery(query);
  if (status === "All") return queryFiltered;

  return queryFiltered.filter((ph) => ph.accountStatus === status);
}

export async function getPlanholdersByQuery(
  query: string,
): Promise<PlanholderLookup[]> {
  await delay(300);

  return filterPlanholdersByQuery(query);
}

export async function getPlanholderPage({
  pageParam,
  query,
  status,
}: {
  pageParam: number;
  query: string;
  status: string;
}): Promise<{ items: PlanholderLookup[]; nextPage: number | undefined }> {
  await delay(300);

  const all = filterPlanholders(query, status);
  const start = (pageParam - 1) * PLANHOLDER_PAGE_SIZE;

  return {
    items: all.slice(start, start + PLANHOLDER_PAGE_SIZE),
    nextPage: start + PLANHOLDER_PAGE_SIZE < all.length ? pageParam + 1 : undefined,
  };
}
