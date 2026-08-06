import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getAccountList } from "../api/accounts-transfer.api";

export const useAccountList = createResourceQuery(
  ["accounts-transfer", "account-list"] as const,
  getAccountList,
  { fallback: [] },
);
