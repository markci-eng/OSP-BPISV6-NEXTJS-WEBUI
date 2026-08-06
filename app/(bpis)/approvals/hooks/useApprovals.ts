import { useQuery } from "@tanstack/react-query";
import type { ApprovalView } from "@/app/(bpis)/data/approvals/types";
import { getApprovals } from "../api/approvals.api";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

export function useApprovals(view: ApprovalView) {
  const query = useQuery({
    queryKey: ["approvals", view] as const,
    queryFn: () => getApprovals(view),
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    retry: RETRY_COUNT,
    retryDelay: (attempt) => RETRY_BASE_DELAY_MS * 2 ** attempt,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
