"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuCopy } from "react-icons/lu";
import {
  EmptyStateCard,
  PrimaryMdButton,
  SecondaryMdButton,
  SecondarySmButton,
} from "osp-ui-kit";
import { toast } from "sonner";

import type {
  AccessFilter,
  PermissionMap,
} from "../types";
import {
  ACCESS_MODULES,
  TOTAL_PERMISSION_COUNT,
  countGranted,
  emptyPermissionMap,
  isLocked,
} from "../data/access-modules";
import {
  computeDiff,
  filterModules,
  moduleStats,
} from "../lib/access-selectors";
import { ACCESS_COLORS } from "../lib/access-theme";
import { useAccessUsers } from "../hooks/useUserAccess";
import { AccessListSkeleton } from "../components/AccessListSkeleton";
import { AccessToolbar } from "../components/AccessToolbar";
import { ModuleAccessCard } from "../components/ModuleAccessCard";
import { SaveAccessBar } from "../components/SaveAccessBar";

import type { AccessGroup } from "../types";
import { membersOf } from "../lib/role-selectors";
import {
  useAccessGroups,
  useGroupPreset,
  useGroupPresets,
  useSaveGroupPreset,
  useUserRoles,
} from "../hooks/useRoleAccess";
import { GroupDetailHeader } from "./GroupDetailHeader";
import { GroupMembersCard } from "./GroupMembersCard";
import { CopyFromGroupDialog } from "./CopyFromGroupDialog";
import { ConfirmGroupSaveDialog } from "./ConfirmGroupSaveDialog";

/** Modules opened by default, so the editor never lands fully collapsed. */
const DEFAULT_EXPANDED: Record<string, boolean> = { DB: true, APR: true };

/** What the editor reports back about the draft it is holding. */
export type GroupEditorState = {
  /** Permissions the working draft grants, saved or not. */
  grantedCount: number;
  dirty: boolean;
};

type GroupAccessEditorProps = {
  group: AccessGroup;
  /**
   * Reports the working draft as it changes, for a host that shows it
   * somewhere else — the group rail marks the edited row and counts its
   * unsaved permissions.
   */
  onStateChange?: (state: GroupEditorState) => void;
};

/**
 * The permission editor for one access group: identity, the module list, who
 * inherits the preset, and the save bar.
 *
 * It owns the draft, so it is the whole of what a group's detail is — the
 * desktop console renders it beside the group rail, and a phone renders it on
 * a page of its own. Mount it with `key={group.code}`: a different group is a
 * different draft, and remounting is what discards the old one along with the
 * search, filter, and expansion state that belonged to it.
 */
export function GroupAccessEditor({
  group,
  onStateChange,
}: GroupAccessEditorProps) {
  const { groups } = useAccessGroups();
  const { presets } = useGroupPresets();
  const { users } = useAccessUsers();
  const { userRoles } = useUserRoles();

  const [draft, setDraft] = useState<PermissionMap>(emptyPermissionMap);
  const [permQuery, setPermQuery] = useState("");
  const [filter, setFilter] = useState<AccessFilter>("All");
  const [expanded, setExpanded] =
    useState<Record<string, boolean>>(DEFAULT_EXPANDED);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  const {
    preset: saved,
    isLoading,
    error,
    refetch,
  } = useGroupPreset(group.code);
  const saveMutation = useSaveGroupPreset();

  const locked = !!group.system;

  // The draft is seeded from whatever the server last confirmed. A new object
  // identity means fresh server truth (first load, or a save that wrote through
  // the cache), so the working copy restarts from it.
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

  // Keyed on the two numbers alone: a host that rebuilds its handler every
  // render would otherwise make this report the same draft over and over.
  useEffect(() => {
    onStateChange?.({ grantedCount, dirty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grantedCount, dirty]);

  /** Saved permission counts per group, for the copy-from dialog. */
  const permissionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(presets).forEach((code) => {
      counts[code] = countGranted(presets[code]);
    });
    return counts;
  }, [presets]);

  const members = useMemo(
    () => membersOf(group.code, users, userRoles),
    [group.code, users, userRoles],
  );

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

  const togglePermission = (code: string) => {
    if (locked || isLocked(code)) return;
    setDraft((current) => ({ ...current, [code]: !current[code] }));
  };

  const toggleModule = (moduleCode: string) => {
    if (locked) return;
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

  const copyFrom = (sourceCode: string) => {
    const source = presets[sourceCode];
    setCopyOpen(false);
    if (!source) return;

    // Locked codes stay granted whatever the source preset says — the same
    // rule the server enforces on save.
    const next = { ...source };
    ACCESS_MODULES.forEach((module) =>
      module.functions.forEach((fn) => {
        if (isLocked(fn.code)) next[fn.code] = true;
      }),
    );
    setDraft(next);
  };

  const save = () => {
    const grantCount = diff.granted.length;
    const revokeCount = diff.revoked.length;

    saveMutation.mutate(
      { groupCode: group.code, permissions: draft },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success("Preset saved", {
            description: `${group.description}: ${grantCount} granted · ${revokeCount} revoked. Re-synced to ${members.length} user(s).`,
          });
        },
        onError: () => {
          setConfirmOpen(false);
          toast.error("Couldn’t save preset", {
            description:
              "The policy service did not respond. Your changes are still here — try again.",
            action: { label: "Retry save", onClick: save },
          });
        },
      },
    );
  };

  const noResultsHint = permQuery.trim()
    ? `Nothing matches “${permQuery.trim()}” under the ${filter.toLowerCase()} filter.`
    : `No permissions match the ${filter.toLowerCase()} filter.`;

  const savedLabel = locked
    ? "System group — permissions are fixed and cannot be edited."
    : `Preset saved · last modified ${group.modified}`;

  return (
    <Flex direction="column" gap={3.5} w="full" minW={0}>
      <GroupDetailHeader
        group={group}
        grantedLabel={`${grantedCount} / ${TOTAL_PERMISSION_COUNT}`}
        memberCount={members.length}
      />

      {dirty && (
        <HStack
          gap={2.5}
          px={3.5}
          py={2.5}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={ACCESS_COLORS.pendingBorder}
          bg={ACCESS_COLORS.pendingBg}
        >
          <Box
            w="7px"
            h="7px"
            borderRadius="full"
            flexShrink={0}
            bg={ACCESS_COLORS.pendingDot}
          />
          <Text
            fontSize="xs"
            fontWeight="500"
            color={ACCESS_COLORS.pendingText}
          >
            {diff.granted.length} to grant · {diff.revoked.length} to revoke —
            this preset is applied to {members.length} user(s); saving re-syncs
            their access.
          </Text>
        </HStack>
      )}

      <Flex gap={3} wrap="wrap" align="center">
        <Box flex="1" minW={{ base: "100%", lg: "420px" }}>
          <AccessToolbar
            query={permQuery}
            onQueryChange={setPermQuery}
            filter={filter}
            onFilterChange={setFilter}
            counts={filterCounts}
            allExpanded={allExpanded}
            onToggleExpandAll={toggleExpandAll}
          />
        </Box>

        <HStack gap={2} flexShrink={0}>
          <SecondarySmButton
            disabled={locked}
            onClick={() => setCopyOpen(true)}
          >
            <LuCopy size={14} /> Copy from group
          </SecondarySmButton>
        </HStack>
      </Flex>

      {isLoading && <AccessListSkeleton userName={group.description} />}

      {!isLoading && error && (
        <EmptyStateCard
          title="Couldn’t load this preset"
          description="The policy service did not respond. Try loading this group again."
          py={12}
        >
          <PrimaryMdButton mt={4} onClick={() => refetch()}>
            Retry
          </PrimaryMdButton>
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
              readOnly={locked}
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
          <PrimaryMdButton mt={4} onClick={clearSearch}>
            Clear search &amp; filters
          </PrimaryMdButton>
        </EmptyStateCard>
      )}

      {!isLoading && !error && (
        <GroupMembersCard
          members={members}
          action={
            <Button
              asChild
              size="xs"
              variant="outline"
              borderColor="gray.300"
              color="gray.700"
            >
              <Link href="/role-access-management/user-assignment">
                Manage assignments
              </Link>
            </Button>
          }
        />
      )}

      <SaveAccessBar
        dirty={dirty && !locked}
        loading={isLoading}
        grantCount={diff.granted.length}
        revokeCount={diff.revoked.length}
        savedLabel={savedLabel}
        saveLabel="Save preset"
        onCancel={cancelChanges}
        onSave={() => setConfirmOpen(true)}
      />

      <ConfirmGroupSaveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        group={group}
        diff={diff}
        memberCount={members.length}
        saving={saveMutation.isPending}
        onConfirm={save}
      />

      <CopyFromGroupDialog
        open={copyOpen}
        onOpenChange={setCopyOpen}
        targetGroup={group}
        groups={groups}
        permissionCounts={permissionCounts}
        onPick={copyFrom}
      />
    </Flex>
  );
}
