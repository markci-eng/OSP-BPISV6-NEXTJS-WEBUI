"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlanInfo } from "../api/planholder-profile.api";

/**
 * One plan's details, beneficiaries and payments. Keyed by `lpaNo`, so
 * switching between a planholder's plans never shows the previous plan's
 * details. `data` is null when there is no such plan.
 */
export function usePlanInfo(lpaNo: string) {
  return useQuery({
    queryKey: ["plan-management", "plan-info", lpaNo],
    queryFn: () => getPlanInfo(lpaNo),
    enabled: Boolean(lpaNo),
    staleTime: 30_000,
    retry: 1,
  });
}
