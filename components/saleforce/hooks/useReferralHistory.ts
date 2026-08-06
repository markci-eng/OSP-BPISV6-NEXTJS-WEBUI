import { useQuery } from "@tanstack/react-query";
import { getReferralHistory } from "../api/referral.api";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

export function useReferralHistory() {
  const query = useQuery({
    queryKey: ["referral", "history"] as const,
    queryFn: getReferralHistory,
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
