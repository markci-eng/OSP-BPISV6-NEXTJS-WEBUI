"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { EmptyStateCard, Page } from "osp-ui-kit";
import { toast } from "sonner";

import type { AccessFilter, AccessUser, PermissionMap } from "./types";
import {
  ACCESS_MODULES,
  TOTAL_PERMISSION_COUNT,
  countGranted,
  emptyPermissionMap,
  isLocked,
} from "./data/access-modules";
import {
  computeDiff,
  filterModules,
  moduleStats,
} from "./lib/access-selectors";
import {
  useAccessUsers,
  useSaveUserPermissions,
  useUserPermissions,
} from "./hooks/useUserAccess";
import { AccessListSkeleton } from "./components/AccessListSkeleton";
import { AccessToolbar } from "./components/AccessToolbar";
import { ConfirmSaveDialog } from "./components/ConfirmSaveDialog";
import { ModuleAccessCard } from "./components/ModuleAccessCard";
import { SaveAccessBar } from "./components/SaveAccessBar";
import { UserSelectCard } from "./components/UserSelectCard";

/** Modules opened by default, so the page never lands fully collapsed. */
const DEFAULT_EXPANDED: Record<string, boolean> = { DB: true, APR: true };

const SAVED_AT_FORMAT = new Intl.DateTimeFormat("en-PH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function UserAccessManagementPage() {
  const { users } = useAccessUsers();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PermissionMap>(emptyPermissionMap);
  const [permQuery, setPermQuery] = useState("");
  const [filter, setFilter] = useState<AccessFilter>("All");
  const [expanded, setExpanded] =
    useState<Record<string, boolean>>(DEFAULT_EXPANDED);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const {
    permissions: saved,
    isLoading,
    error,
    refetch,
  } = useUserPermissions(selectedUserId);
  const saveMutation = useSaveUserPermissions();

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  // The draft is seeded from whatever the server last confirmed. A new object
  // identity means fresh server truth (first load, user switch, or a save that
  // wrote through the cache), so the working copy restarts from it.
  const appliedRef = useRef<PermissionMap | null>(null);
  useEffect(() => {
    if (!saved || saved === appliedRef.current) return;
    appliedRef.current = saved;
    setDraft({ ...saved });
  }, [saved]);

  const base = saved ?? emptyPermissionMap();
  const diff = useMemo(() => computeDiff(base, draft), [base, draft]);
  const dirty = diff.granted.length + diff.revoked.length > 0;

  const grantedCount = useMemo(() => countGranted(draft), [draft]);
  const filterCounts: Record<AccessFilter, number> = {
    All: TOTAL_PERMISSION_COUNT,
    Assigned: grantedCount,
    "Not assigned": TOTAL_PERMISSION_COUNT - grantedCount,
  };

  const visibleModules = useMemo(
    () => filterModules(permQuery, filter, draft),
    [permQuery, filter, draft],
  );

  // While searching or filtering, every surviving module opens — a collapsed
  // card would hide the very rows the query just selected.
  const searching = permQuery.trim().length > 0 || filter !== "All";
  const isExpanded = (code: string) => searching || !!expanded[code];
  const allExpanded =
    visibleModules.length > 0 &&
    visibleModules.every(({ module }) => isExpanded(module.code));

  const selectUser = (user: AccessUser) => {
    setSelectedUserId(user.id);
    setPermQuery("");
    setFilter("All");
    setExpanded(DEFAULT_EXPANDED);
    setLastSavedAt(null);
    appliedRef.current = null;
  };

  const togglePermission = (code: string) => {
    if (isLocked(code)) return;
    setDraft((current) => ({ ...current, [code]: !current[code] }));
  };

  const toggleModule = (moduleCode: string) => {
    const module = ACCESS_MODULES.find((m) => m.code === moduleCode);
    if (!module) return;

    setDraft((current) => {
      const grantAll = !module.functions.every((fn) => current[fn.code]);
      const next = { ...current };
      module.functions.forEach((fn) => {
        if (!isLocked(fn.code)) next[fn.code] = grantAll;
      });
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpanded({});
      return;
    }
    const next: Record<string, boolean> = {};
    ACCESS_MODULES.forEach((module) => {
      next[module.code] = true;
    });
    setExpanded(next);
  };

  const clearSearch = () => {
    setPermQuery("");
    setFilter("All");
  };

  const cancelChanges = () => {
    if (!saved) return;
    setDraft({ ...saved });
  };

  const save = () => {
    if (!selectedUserId || !selectedUser) return;

    const grantCount = diff.granted.length;
    const revokeCount = diff.revoked.length;

    saveMutation.mutate(
      { userId: selectedUserId, permissions: draft },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setLastSavedAt(new Date());
          toast.success("Permissions updated", {
            description: `${grantCount} granted · ${revokeCount} revoked. Effective on next sign-in.`,
          });
        },
        onError: () => {
          setConfirmOpen(false);
          toast.error("Couldn’t save permissions", {
            description:
              "The policy service did not respond. Your changes are still here — try again.",
            action: { label: "Retry save", onClick: save },
          });
        },
      },
    );
  };

  const savedLabel = lastSavedAt
    ? `All changes saved · last updated ${SAVED_AT_FORMAT.format(lastSavedAt)}`
    : "All changes saved";

  const noResultsHint = permQuery.trim()
    ? `Nothing matches “${permQuery.trim()}” under the ${filter.toLowerCase()} filter.`
    : `No permissions match the ${filter.toLowerCase()} filter.`;

  return (
    <Page.Root
      title="User Access Management"
      subtitle="Administration"
      description="Grant or revoke module permissions for a user."
      headerButton="menu"
    >
      <Page.MainContent>
        <UserSelectCard
          users={users}
          selectedUser={selectedUser}
          onSelect={selectUser}
          grantedLabel={`${grantedCount} / ${TOTAL_PERMISSION_COUNT}`}
        />

        {!selectedUser && (
          <EmptyStateCard
            title="No user selected"
            description="Search for a user above to view and configure their access permissions."
            py={16}
          />
        )}

        {selectedUser && (
          <Flex direction="column" gap={3.5}>
            <AccessToolbar
              query={permQuery}
              onQueryChange={setPermQuery}
              filter={filter}
              onFilterChange={setFilter}
              counts={filterCounts}
              allExpanded={allExpanded}
              onToggleExpandAll={toggleExpandAll}
            />

            {isLoading && <AccessListSkeleton userName={selectedUser.name} />}

            {!isLoading && error && (
              <EmptyStateCard
                title="Couldn’t load permissions"
                description="The policy service did not respond. Try loading this user again."
                py={12}
              >
                <Button
                  mt={4}
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </EmptyStateCard>
            )}

            {!isLoading && !error && visibleModules.length > 0 && (
              <Flex direction="column" gap={2.5}>
                {visibleModules.map((visible) => (
                  <ModuleAccessCard
                    key={visible.module.code}
                    visible={visible}
                    stats={moduleStats(visible.module, base, draft)}
                    base={base}
                    draft={draft}
                    expanded={isExpanded(visible.module.code)}
                    onToggleExpand={() =>
                      setExpanded((current) => ({
                        ...current,
                        [visible.module.code]: !isExpanded(visible.module.code),
                      }))
                    }
                    onToggleModule={() => toggleModule(visible.module.code)}
                    onTogglePermission={togglePermission}
                  />
                ))}
              </Flex>
            )}

            {!isLoading && !error && visibleModules.length === 0 && (
              <EmptyStateCard
                title="No permissions found"
                description={noResultsHint}
                py={14}
              >
                <Button
                  mt={4}
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  onClick={clearSearch}
                >
                  Clear search &amp; filters
                </Button>
              </EmptyStateCard>
            )}

            <SaveAccessBar
              dirty={dirty}
              loading={isLoading}
              grantCount={diff.granted.length}
              revokeCount={diff.revoked.length}
              savedLabel={savedLabel}
              onCancel={cancelChanges}
              onSave={() => setConfirmOpen(true)}
            />
          </Flex>
        )}

        {selectedUser && confirmOpen && (
          <ConfirmSaveDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            user={selectedUser}
            diff={diff}
            saving={saveMutation.isPending}
            onConfirm={save}
          />
        )}
      </Page.MainContent>
    </Page.Root>
  );
}

