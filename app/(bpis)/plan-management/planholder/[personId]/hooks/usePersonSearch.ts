"use client";
import { useQuery } from "@tanstack/react-query";
import type { PersonIdentity } from "@/types/plan-management.types";
import { searchPerson } from "../api/beneficiary.api";

/** The person on file matching `identity`; waits while it is null. */
export function usePersonSearch(identity: PersonIdentity | null) {
  return useQuery({
    queryKey: ["person", "search", identity] as const,
    queryFn: () => searchPerson(identity!),
    enabled: identity !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
