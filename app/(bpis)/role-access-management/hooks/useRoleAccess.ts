import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PermissionMap } from "../types";
import type { AccessGroup, CreateGroupInput } from "../types";
import {
  submitUserAssignment,
  type UserAssignmentInput,
} from "@/app/(bpis)/approvals/api/approvals.api";
import {
  createAccessGroup,
  getAccessGroups,
  getGroupPreset,
  getGroupPresets,
  getUserRoles,
  saveGroupPreset,
  saveUserRoles,
} from "../api/role-access.api";

const RETRY_COUNT = 2;
const RETRY_BASE_DELAY_MS = 1000;
const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

const SHARED = {
  staleTime: STALE_TIME_MS,
  gcTime: GC_TIME_MS,
  retry: RETRY_COUNT,
  retryDelay: (attempt: number) => RETRY_BASE_DELAY_MS * 2 ** attempt,
} as const;

/**
 * Shared empty fallbacks. A `?? []` / `?? {}` written inline would hand out a
 * fresh object on every render while the query has no data, which changes the
 * identity of anything memoised from it — and an effect keyed on that identity
 * would then re-run forever. These are allocated once so "no data" is a stable
 * value like any other.
 */
const NO_GROUPS: AccessGroup[] = [];
const NO_PRESETS: Record<string, PermissionMap> = {};
const NO_USER_ROLES: Record<string, string[]> = {};

export function useAccessGroups() {
  const query = useQuery({
    queryKey: ["role-access", "groups"] as const,
    queryFn: getAccessGroups,
    ...SHARED,
  });

  return {
    groups: query.data ?? NO_GROUPS,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/** Every preset at once — the role cards and effective-access views need all of them. */
export function useGroupPresets() {
  const query = useQuery({
    queryKey: ["role-access", "presets"] as const,
    queryFn: getGroupPresets,
    ...SHARED,
  });

  return {
    presets: query.data ?? NO_PRESETS,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useGroupPreset(groupCode: string | null) {
  const query = useQuery({
    queryKey: ["role-access", "preset", groupCode] as const,
    queryFn: () => getGroupPreset(groupCode as string),
    enabled: !!groupCode,
    // A background refetch would replace the baseline object and reset the
    // in-progress draft, so this query only refetches when asked to.
    refetchOnWindowFocus: false,
    ...SHARED,
  });

  return {
    preset: query.data,
    // `isLoading` stays false while the query is disabled, so the skeleton only
    // shows once a group is actually selected.
    isLoading: query.isLoading && !!groupCode,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSaveGroupPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupCode,
      permissions,
    }: {
      groupCode: string;
      permissions: PermissionMap;
    }) => saveGroupPreset(groupCode, permissions),
    onSuccess: (saved, { groupCode }) => {
      queryClient.setQueryData(
        ["role-access", "preset", groupCode] as const,
        saved,
      );
      // The group list shows per-group counts and the presets map feeds role
      // assignment, so both go stale the moment a preset is written.
      queryClient.invalidateQueries({ queryKey: ["role-access", "presets"] });
      queryClient.invalidateQueries({ queryKey: ["role-access", "groups"] });
    },
  });
}

export function useCreateAccessGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => createAccessGroup(input),
    onSuccess: (group: AccessGroup) => {
      // Written through rather than only invalidated: the page selects the new
      // group straight away, and a list that does not contain it yet would
      // resolve the selection to null and flash the empty state until the
      // refetch lands. The invalidation below still reconciles with the server.
      queryClient.setQueryData<AccessGroup[]>(
        ["role-access", "groups"] as const,
        (current) => [...(current ?? []), group],
      );
      queryClient.invalidateQueries({ queryKey: ["role-access", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["role-access", "presets"] });
      queryClient.invalidateQueries({
        queryKey: ["role-access", "preset", group.code],
      });
    },
  });
}

export function useUserRoles() {
  const query = useQuery({
    queryKey: ["role-access", "user-roles"] as const,
    queryFn: getUserRoles,
    refetchOnWindowFocus: false,
    ...SHARED,
  });

  return {
    userRoles: query.data ?? NO_USER_ROLES,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useSaveUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleCodes,
    }: {
      userId: string;
      roleCodes: string[];
    }) => saveUserRoles(userId, roleCodes),
    onSuccess: (saved, { userId }) => {
      queryClient.setQueryData<Record<string, string[]>>(
        ["role-access", "user-roles"] as const,
        (current) => ({ ...(current ?? {}), [userId]: saved }),
      );
    },
  });
}

/**
 * Files a role change for approval instead of applying it.
 *
 * Assigning an access group is an approver's decision, so the console reaches
 * across to the approvals queue here rather than writing through
 * {@link useSaveUserRoles} — which is what the approval itself would call once
 * the request is granted.
 */
export function useRequestUserAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserAssignmentInput) => submitUserAssignment(input),
    onSuccess: () => {
      // The queue has a row it did not have a moment ago.
      queryClient.invalidateQueries({
        queryKey: ["approvals", "user-assignment"],
      });
    },
  });
}
