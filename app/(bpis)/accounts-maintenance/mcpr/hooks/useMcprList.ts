import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getMcprList } from "../api/mcpr.api";

export const useMcprList = createResourceQuery(
  ["mcpr", "list"] as const,
  getMcprList,
  { fallback: [] },
);
