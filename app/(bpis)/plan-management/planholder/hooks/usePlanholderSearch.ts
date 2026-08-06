import { createSearchQuery } from "@/hooks/query/createSearchQuery";
import { getPlanholdersByQuery } from "../api/planholder-search.api";

/** Query-matched planholders (status-independent). Desktop table and the
 * status summary cards each slice this further, client-side, by status. */
export const usePlanholderSearch = createSearchQuery(
  "planholders",
  getPlanholdersByQuery,
);
