"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { EmptyStateCard, Page } from "osp-ui-kit";
import { toast } from "sonner";
import Link from "next/link";

import type { AccessUser } from "../types";
import {
  countGranted,
  TOTAL_PERMISSION_COUNT,
} from "../data/access-modules";
import { computeDiff } from "../lib/access-selectors";
import { ACCESS_COLORS } from "../lib/access-theme";
import { useAccessUsers } from "../hooks/useUserAccess";
import { UserSelectCard } from "../components/UserSelectCard";
import { SaveAccessBar } from "../components/SaveAccessBar";

import { sameRoles, unionOf } from "../lib/role-selectors";
import {
  useAccessGroups,
  useGroupPresets,
  useRequestUserAssignment,
  useUserRoles,
} from "../hooks/useRoleAccess";
import { RoleTransitionCard } from "../components/RoleTransitionCard";
import { RolePresetGrid } from "../components/RolePresetGrid";
import { RoleChangeEffect } from "../components/RoleChangeEffect";
import { EffectiveAccessCard } from "../components/EffectiveAccessCard";
import { ConfirmAssignDialog } from "../components/ConfirmAssignDialog";

/** Stands in when the browser has no name to offer. */
const FALLBACK_REQUESTER = "Access Administrator";

/**
 * Who the request is filed under.
 *
 * The session cookie is `httpOnly`, so the only name the browser can read is
 * the display name the kit keeps in `localStorage`. Read when the request is
 * sent rather than during render, so it never reaches the hydrated markup.
 */
function requesterName(): string {
  try {
    return (
      localStorage.getItem("user-display-name")?.trim() || FALLBACK_REQUESTER
    );
  } catch {
    return FALLBACK_REQUESTER;
  }
}

export default function UserAssignmentPage() {
  const { users } = useAccessUsers();
  const { groups } = useAccessGroups();
  const { presets } = useGroupPresets();
  const { userRoles, isLoading } = useUserRoles();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestMutation = useRequestUserAssignment();

  const selectedUser = useMemo<AccessUser | null>(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const currentRoles = useMemo(
    () => (selectedUserId ? (userRoles[selectedUserId] ?? []) : []),
    [userRoles, selectedUserId],
  );

  // The draft restarts from server truth whenever that changes — a fresh
  // selection, or a save that wrote back through the cache.
  //
  // Compared by value, not identity: an identity check re-runs this effect for
  // any new array carrying the same roles, and since the effect sets state that
  // is a render loop that locks the page up. By value, an unchanged role set is
  // always a no-op however many times it is re-created.
  const appliedRef = useRef<string[] | null>(null);
  useEffect(() => {
    if (!selectedUserId) return;
    const applied = appliedRef.current;
    if (applied && sameRoles(currentRoles, applied)) return;
    appliedRef.current = currentRoles;
    setDraftRoles([...currentRoles]);
  }, [currentRoles, selectedUserId]);

  const currentAccess = useMemo(
    () => unionOf(currentRoles, presets),
    [currentRoles, presets],
  );
  const pendingAccess = useMemo(
    () => unionOf(draftRoles, presets),
    [draftRoles, presets],
  );

  const diff = useMemo(
    () => computeDiff(currentAccess, pendingAccess),
    [currentAccess, pendingAccess],
  );

  const dirty = !sameRoles(currentRoles, draftRoles);
  const noRoles = draftRoles.length === 0;
  const canSave = dirty && !noRoles;

  const selectUser = (user: AccessUser) => {
    setSelectedUserId(user.id);
    appliedRef.current = null;
    setDraftRoles([...(userRoles[user.id] ?? [])]);
  };

  const toggleRole = (code: string) => {
    setDraftRoles((current) =>
      current.includes(code)
        ? current.filter((entry) => entry !== code)
        : [...current, code],
    );
  };

  const revert = () => setDraftRoles([...currentRoles]);

  /**
   * Files the change for approval.
   *
   * Nothing is granted here: the draft is put back to the roles the user still
   * holds, because that is what they hold until an approver says otherwise, and
   * leaving the page dirty would read as a change that had been made.
   */
  const submit = () => {
    if (!selectedUserId || !selectedUser || !canSave) return;

    const names = draftRoles.map(
      (code) =>
        groups.find((group) => group.code === code)?.description ?? code,
    );

    requestMutation.mutate(
      {
        user: selectedUser.name,
        memberCode: selectedUser.memberCode,
        position: selectedUser.position,
        branch: selectedUser.branch,
        currentGroups: currentRoles,
        requestedGroups: draftRoles,
        granted: diff.granted.length,
        revoked: diff.revoked.length,
        requester: requesterName(),
      },
      {
        onSuccess: (request) => {
          setConfirmOpen(false);
          setDraftRoles([...currentRoles]);
          toast.success("Sent for approval", {
            description: `${request.id} — ${selectedUser.name} requested for ${draftRoles.length} role(s): ${names.join(", ")}. Access changes once it is approved under Approvals › User Assignment.`,
          });
        },
        onError: () => {
          setConfirmOpen(false);
          toast.error("Couldn’t send for approval", {
            description:
              "The policy service did not respond. Your changes are still here — try again.",
            action: { label: "Retry", onClick: submit },
          });
        },
      },
    );
  };

  const savedLabel = `No pending change · ${currentRoles.length} role(s) assigned`;

  return (
    <Page.Root
      title="User Assignment"
      subtitle="Role & Access Group Management"
      description="Assign role presets to a user. Effective access is the union of every preset they hold."
      headerButton="menu"
    >
      <Page.MainContent>
        <UserSelectCard
          users={users}
          selectedUser={selectedUser}
          onSelect={selectUser}
          grantedLabel={`${countGranted(pendingAccess)} / ${TOTAL_PERMISSION_COUNT}`}
        />

        {!selectedUser && (
          <EmptyStateCard
            title="No user selected"
            description="Search for a user above to review the role presets they hold and change their assignment."
            py={16}
          />
        )}

        {selectedUser && (
          <Flex direction="column" gap={3.5}>
            <RoleTransitionCard
              groups={groups}
              currentCodes={currentRoles}
              pendingCodes={draftRoles}
              currentAccess={currentAccess}
              pendingAccess={pendingAccess}
              dirty={dirty}
            />

            {noRoles && (
              <HStack
                gap={2.5}
                px={3.5}
                py={2.5}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="#F5C7C2"
                bg={ACCESS_COLORS.revokeBg}
              >
                <Box
                  w="7px"
                  h="7px"
                  borderRadius="full"
                  flexShrink={0}
                  bg={ACCESS_COLORS.revokeText}
                />
                <Text
                  fontSize="xs"
                  fontWeight="500"
                  color={ACCESS_COLORS.revokeText}
                >
                  A user must hold at least one role — select a preset below
                  before saving.
                </Text>
              </HStack>
            )}

            <Box>
              <Flex align="baseline" gap={2.5} wrap="wrap" mb={2.5}>
                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  Assign role presets
                </Text>
                <Text fontSize="xs" color="gray.500" flex="1" minW="180px">
                  A user can hold several roles — effective access is the union
                  of every selected preset.
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  px={2.5}
                  py="3px"
                  borderRadius="full"
                  color={ACCESS_COLORS.accent}
                  bg="color-mix(in srgb, var(--chakra-colors-primary) 10%, transparent)"
                >
                  {draftRoles.length} of {groups.length} roles selected
                </Text>
              </Flex>

              {groups.length === 0 && !isLoading ? (
                <EmptyStateCard
                  title="No access groups yet"
                  description="Create an access group before assigning roles to users."
                  py={12}
                >
                  {/* Primary styling applied by token rather than by using
                      `PrimaryMdButton`: the kit's buttons always render a
                      three-slot children array (leftIcon/children/rightIcon),
                      which `asChild` cannot merge onto. Keeping `asChild` keeps
                      this a real anchor. */}
                  <Button
                    asChild
                    mt={4}
                    bg="primary"
                    color="primaryForeground"
                    _hover={{ bg: "primaryHover" }}
                  >
                    <Link href="/role-access-management/access-groups">
                      Go to Access Groups
                    </Link>
                  </Button>
                </EmptyStateCard>
              ) : (
                <RolePresetGrid
                  groups={groups}
                  presets={presets}
                  selectedCodes={draftRoles}
                  currentCodes={currentRoles}
                  onToggle={toggleRole}
                />
              )}
            </Box>

            {dirty && <RoleChangeEffect diff={diff} onRevert={revert} />}

            <EffectiveAccessCard
              effective={pendingAccess}
              current={currentAccess}
            />

            <SaveAccessBar
              dirty={canSave}
              loading={isLoading}
              grantCount={diff.granted.length}
              revokeCount={diff.revoked.length}
              savedLabel={
                noRoles
                  ? "At least one role is required before saving."
                  : savedLabel
              }
              saveLabel="Submit for approval"
              onCancel={revert}
              onSave={() => setConfirmOpen(true)}
            />
          </Flex>
        )}

        {selectedUser && (
          <ConfirmAssignDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            user={selectedUser}
            groups={groups}
            pendingCodes={draftRoles}
            diff={diff}
            saving={requestMutation.isPending}
            onConfirm={submit}
          />
        )}
      </Page.MainContent>
    </Page.Root>
  );
}
