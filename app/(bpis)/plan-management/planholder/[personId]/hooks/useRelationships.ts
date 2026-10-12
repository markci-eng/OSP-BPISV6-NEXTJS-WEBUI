"use client";
import { useQuery } from "@tanstack/react-query";
import { getRelationships } from "../api/beneficiary.api";

/** The active relationships, alphabetically. A reference table: fetched once. */
export function useRelationships() {
  return useQuery({
    queryKey: ["reference-table", "relationships"],
    queryFn: getRelationships,
    select: (rows) =>
      rows
        .filter((row) => row.isActive)
        .sort((a, b) => a.description.localeCompare(b.description)),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
