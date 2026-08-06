import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Builds a `useInfiniteX`-style hook for the mobile infinite-scroll list
 * pattern: a free-text query plus a single secondary filter, paginated by
 * numeric page number. `fetchPage` receives the raw (pageParam, query,
 * filter) triple so each caller can map it onto its own API's param names.
 */
export function createInfinitePagedQuery<TPage extends { nextPage?: number }>(
  keyPrefix: string,
  fetchPage: (pageParam: number, query: string, filter: string) => Promise<TPage>,
) {
  return function useInfinitePagedQuery(query: string, filter: string) {
    const result = useInfiniteQuery({
      queryKey: [keyPrefix, "infinite", query, filter] as const,
      queryFn: ({ pageParam }) => fetchPage(pageParam as number, query, filter),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    return {
      data: result.data,
      fetchNextPage: result.fetchNextPage,
      hasNextPage: result.hasNextPage,
      isFetchingNextPage: result.isFetchingNextPage,
      isLoading: result.isLoading,
      error: result.error,
    };
  };
}
