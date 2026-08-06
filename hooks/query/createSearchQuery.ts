import { useQuery } from "@tanstack/react-query";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

/**
 * Builds a `useXSearch`-style hook: a single free-text query string, results
 * as a flat list. Shares this app's retry/stale-time defaults.
 */
export function createSearchQuery<T>(
  keyPrefix: string,
  queryFn: (query: string) => Promise<T[]>,
) {
  return function useSearchQuery(query: string) {
    const result = useQuery({
      queryKey: [keyPrefix, "search", query] as const,
      queryFn: () => queryFn(query),
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: RETRY_COUNT,
      retryDelay: (attempt) => RETRY_BASE_DELAY_MS * 2 ** attempt,
    });

    return {
      data: result.data ?? [],
      isLoading: result.isLoading,
      isFetching: result.isFetching,
      error: result.error,
      refetch: result.refetch,
    };
  };
}
