import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getFloatingAccounts } from "../api/floating-accounts.api";

export const useFloatingAccounts = createResourceQuery(
  ["floating-accounts", "list"] as const,
  getFloatingAccounts,
  { fallback: [] },
);
