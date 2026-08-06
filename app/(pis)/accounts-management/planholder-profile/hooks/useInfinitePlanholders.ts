import { createInfinitePagedQuery } from "@/hooks/query/createInfinitePagedQuery";
import { getPlanholderPage } from "../api/planholder-search.api";

/** Paginated planholder feed for the mobile infinite-scroll list. */
export const useInfinitePlanholders = createInfinitePagedQuery(
  "planholders",
  (pageParam, query, status) => getPlanholderPage({ pageParam, query, status }),
);
