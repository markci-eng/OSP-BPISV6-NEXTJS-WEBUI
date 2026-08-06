import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getDashboardOverview } from "../api/dashboard.api";

export const useDashboardOverview = createResourceQuery(
  ["dashboard", "overview"] as const,
  getDashboardOverview,
  { staleTimeMs: 60_000 },
);
