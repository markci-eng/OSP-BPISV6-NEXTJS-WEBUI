import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PermissionMap } from "../types";
import {
  getAccessUsers,
  getUserPermissions,
  saveUserPermissions,
} from "../api/user-access.api";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

export function useAccessUsers() {
  const query = useQuery({
    queryKey: ["user-access", "users"] as const,
    queryFn: getAccessUsers,
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    retry: RETRY_COUNT,
    retryDelay: (attempt) => RETRY_BASE_DELAY_MS * 2 ** attempt,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useUserPermissions(userId: string | null) {
  const query = useQuery({
    queryKey: ["user-access", "permissions", userId] as const,
    queryFn: () => getUserPermissions(userId as string),
    enabled: !!userId,
    // A background refetch would replace the baseline object and reset the
    // in-progress draft, so this query only refetches when asked to.
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    retry: RETRY_COUNT,
    retryDelay: (attempt) => RETRY_BASE_DELAY_MS * 2 ** attempt,
  });

  return {
    permissions: query.data,
    // `isLoading` stays false while the query is disabled, so the skeleton
    // only shows once a user is actually selected.
    isLoading: query.isLoading && !!userId,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSaveUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: PermissionMap;
    }) => saveUserPermissions(userId, permissions),
    onSuccess: (saved, { userId }) => {
      queryClient.setQueryData(
        ["user-access", "permissions", userId] as const,
        saved,
      );
    },
  });
}
