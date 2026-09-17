"use client";

import { useMemo, useState } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { EmptyStateCard, Page } from "osp-ui-kit";
import { toast } from "sonner";

import { countGranted } from "../data/access-modules";
import { useAccessUsers } from "../hooks/useUserAccess";

import type { AccessGroup, CreateGroupInput } from "../types";
import { membersOf } from "../lib/role-selectors";
import {
  useAccessGroups,
  useCreateAccessGroup,
  useGroupPresets,
  useUserRoles,
} from "../hooks/useRoleAccess";
import { GroupListPanel } from "../components/GroupListPanel";
import {
  GroupAccessEditor,
  type GroupEditorState,
} from "../components/GroupAccessEditor";
import { CreateGroupDialog } from "../components/CreateGroupDialog";

/**
 * Height of the left-docked group rail: the viewport less the app header and
 * the page padding above/below it. The rail scrolls internally rather than
 * growing with the list.
 */
const RAIL_HEIGHT = "calc(100vh - 140px)";

/** Where a group's own page lives, for the widths that open one. */
const detailHref = (code: string) =>
  `/role-access-management/access-groups/${encodeURIComponent(code)}`;

/** The draft the editor is holding, tagged with the group it belongs to. */
type LiveDraft = GroupEditorState & { code: string };

export default function AccessGroupsPage() {
  const router = useRouter();

  const { groups } = useAccessGroups();
  const { presets } = useGroupPresets();
  const { users } = useAccessUsers();
  const { userRoles } = useUserRoles();
  const createMutation = useCreateAccessGroup();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [liveDraft, setLiveDraft] = useState<LiveDraft | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /**
   * Whether the detail column exists at this width.
   *
   * Below `lg` it does not — there is no room for two columns — so a group
   * opens on a page of its own instead. Read from the theme's own breakpoints
   * so this turns over on the same pixel as the CSS that hides the column.
   *
   * `false` until it has measured, which is one render: a tap that somehow
   * landed in that first beat would select the group without navigating, which
   * is the harmless way round — the next tap opens it.
   */
  const isNarrow = useBreakpointValue({ base: true, lg: false }) ?? false;

  const selectedGroup = useMemo<AccessGroup | null>(
    () => groups.find((group) => group.code === selectedCode) ?? null,
    [groups, selectedCode],
  );

  /** Saved permission counts per group, for the rail and the create dialog. */
  const permissionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(presets).forEach((code) => {
      counts[code] = countGranted(presets[code]);
    });
    return counts;
  }, [presets]);

  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    groups.forEach((group) => {
      counts[group.code] = membersOf(group.code, users, userRoles).length;
    });
    return counts;
  }, [groups, users, userRoles]);

  // A draft only counts for the row it was made against: the editor reports on
  // mount, so a stale report from the group before would otherwise put the
  // previous group's numbers on the newly selected row for a paint.
  const draft = liveDraft?.code === selectedCode ? liveDraft : null;

  /**
   * Counts for the rail. The selected group reports its unsaved draft rather
   * than the saved preset, so its row and bar track edits as they are made;
   * every other row still shows what the server holds.
   */
  const railPermissionCounts = useMemo(
    () =>
      draft
        ? { ...permissionCounts, [draft.code]: draft.grantedCount }
        : permissionCounts,
    [permissionCounts, draft],
  );

  /**
   * Opening a group from the rail. The selection is recorded either way, so the
   * row stays marked for a return from the detail page; only the wide layout
   * has somewhere to show it without leaving.
   */
  const openGroup = (group: AccessGroup) => {
    setSelectedCode(group.code);
    if (isNarrow) router.push(detailHref(group.code));
  };

  const createGroup = (input: CreateGroupInput) => {
    setCreateError(null);
    createMutation.mutate(input, {
      onSuccess: (group) => {
        setCreateOpen(false);
        openGroup(group);
        toast.success("Access group created", {
          description: `${group.description} (${group.code}). Adjust the preset below, then save.`,
        });
      },
      onError: (err: unknown) => {
        setCreateError(
          err instanceof Error
            ? err.message
            : "The access group could not be created.",
        );
      },
    });
  };

  return (
    <Page.Root
      title="Access Groups"
      subtitle="Role & Access Group Management"
      description="Define the permission preset behind each role. Saving re-syncs every user who holds the group."
      headerButton="menu"
    >
      <Page.MainContent>
        <Flex
          align="flex-start"
          gap={4}
          direction={{ base: "column", lg: "row" }}
        >
          {/* Docked to the left from `lg`, and the whole page below that.
              Sticky and viewport-tall so it stays put while the permission
              editor, much the taller column, scrolls past it. The wrapper owns
              the height; the rail fills it and scrolls inside rather than
              growing with the list, at every breakpoint. */}
          <Box
            w={{ base: "full", lg: "320px" }}
            h={RAIL_HEIGHT}
            flexShrink={0}
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: 2 }}
          >
            <GroupListPanel
              groups={groups}
              selectedCode={selectedCode}
              onSelect={openGroup}
              onCreate={() => setCreateOpen(true)}
              permissionCounts={railPermissionCounts}
              memberCounts={memberCounts}
              dirtyCode={draft?.dirty ? draft.code : null}
            />
          </Box>

          {/* Hidden rather than skipped below `lg`: the width decides this in
              CSS, so the column is never briefly the wrong one on first paint.
              Narrow widths reach the same editor at `detailHref`. */}
          <Flex
            direction="column"
            flex="1"
            minW={0}
            w="full"
            display={{ base: "none", lg: "flex" }}
          >
            {!selectedGroup && (
              <EmptyStateCard
                title="No access group selected"
                description="Pick an access group from the list to review and edit the permissions it grants, or create a new one."
                py={16}
              />
            )}

            {selectedGroup && (
              <GroupAccessEditor
                key={selectedGroup.code}
                group={selectedGroup}
                onStateChange={(state) =>
                  setLiveDraft({ code: selectedGroup.code, ...state })
                }
              />
            )}
          </Flex>
        </Flex>

        <CreateGroupDialog
          open={createOpen}
          onOpenChange={(next) => {
            setCreateOpen(next);
            if (!next) setCreateError(null);
          }}
          groups={groups}
          permissionCounts={permissionCounts}
          creating={createMutation.isPending}
          error={createError}
          onSubmit={createGroup}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
