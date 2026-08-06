import { useQuery, type QueryKey } from "@tanstack/react-query";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const DEFAULT_STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

type ResourceQueryResult<T> = {
  data: T;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => unknown;
};

/**
 * Builds a `useXList`/`useXResource`-style hook around react-query with this
 * app's shared retry/stale-time defaults, so callers only supply what
 * actually varies: the query key, the fetcher, and an optional fallback
 * value returned while data is undefined (e.g. `[]` for list resources).
 */
export function createResourceQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: { staleTimeMs?: number; fallback: T },
): () => ResourceQueryResult<T>;
export function createResourceQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: { staleTimeMs?: number },
): () => ResourceQueryResult<T | undefined>;
export function createResourceQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: { staleTimeMs?: number; fallback?: T },
) {
  return function useResourceQuery(): ResourceQueryResult<T | undefined> {
    const query = useQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTimeMs ?? DEFAULT_STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: RETRY_COUNT,
      retryDelay: (attempt) => RETRY_BASE_DELAY_MS * 2 ** attempt,
    });

    return {
      data: query.data ?? options?.fallback,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error,
      refetch: query.refetch,
    };
  };
}
