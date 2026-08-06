import { createResourceQuery } from "@/hooks/query/createResourceQuery";
import { getSamplePayments } from "../api/payment.api";

export const useSamplePayments = createResourceQuery(
  ["payment", "sample-payments"] as const,
  getSamplePayments,
  { fallback: [] },
);
