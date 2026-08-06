import { useQuery } from "@tanstack/react-query";
import { getMonthlyNewSales } from "../api/dashboard.api";
import type { MonthlySalesYear } from "../api/dashboard.types";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 60_000;
const GC_TIME_MS = 5 * 60_000;

export function useMonthlyNewSales(year: MonthlySalesYear) {
  const query = useQuery({
    queryKey: ["dashboard", "monthly-new-sales", year] as const,
    queryFn: () => getMonthlyNewSales(year),
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
