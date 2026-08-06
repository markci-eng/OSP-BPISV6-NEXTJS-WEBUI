import { createSearchQuery } from "@/hooks/query/createSearchQuery";
import { getAgentsByQuery } from "../api/agent-search.api";

/** Query-matched agents (position-independent). Desktop table and the
 * position summary cards each slice this further, client-side, by position. */
export const useAgentSearch = createSearchQuery("sales-agents", getAgentsByQuery);
