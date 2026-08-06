import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getDepositList } from "../api/payment.api";

export const useDepositList = createResourceQuery(
  ["payment", "deposit-list"] as const,
  getDepositList,
  { fallback: [] },
);
