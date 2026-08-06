import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getDrsList } from "../api/payment.api";

export const useDrsList = createResourceQuery(
  ["payment", "drs-list"] as const,
  getDrsList,
  { fallback: [] },
);
