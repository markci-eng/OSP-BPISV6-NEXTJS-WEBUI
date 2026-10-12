"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlanTypes } from "../api/plan-types.api";

/** The plan-type reference table. Reference data: fetched once. */
export function usePlanTypes() {
  return useQuery({
    queryKey: ["reference-table", "plan-types"],
    queryFn: getPlanTypes,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
