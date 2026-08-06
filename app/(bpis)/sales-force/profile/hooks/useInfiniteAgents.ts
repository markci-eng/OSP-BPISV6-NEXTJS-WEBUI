import { createInfinitePagedQuery } from "@/hooks/query/createInfinitePagedQuery";
import { getAgentPage } from "../api/agent-search.api";

/** Paginated agent feed for the mobile infinite-scroll list. */
export const useInfiniteAgents = createInfinitePagedQuery(
  "sales-agents",
  (pageParam, query, position) => getAgentPage({ pageParam, query, position }),
);
