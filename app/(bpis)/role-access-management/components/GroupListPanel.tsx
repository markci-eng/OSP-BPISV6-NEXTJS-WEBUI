"use client";

import { useMemo, useState } from "react";
import { Box, Flex, HStack, Input, Text } from "@chakra-ui/react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { PrimarySmButton } from "osp-ui-kit";

import { TOTAL_PERMISSION_COUNT } from "../data/access-modules";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type { AccessGroup } from "../types";

type GroupListPanelProps = {
  groups: AccessGroup[];
  selectedCode: string | null;
  onSelect: (group: AccessGroup) => void;
  onCreate: () => void;
  /** Granted permissions per group code. */
  permissionCounts: Record<string, number>;
  /** Users holding each group. */
  memberCounts: Record<string, number>;
  /**
   * The group with unsaved edits, if any. Only the selected group is editable,
   * so at most one row can be marked — the others have no local draft to differ
   * from what the server holds.
   */
  dirtyCode?: string | null;
};

function GroupRow({
  group,
  active,
  dirty,
  granted,
  members,
  onSelect,
}: {
  group: AccessGroup;
  active: boolean;
  dirty: boolean;
  granted: number;
  members: number;
  onSelect: () => void;
}) {
  const complete = granted === TOTAL_PERMISSION_COUNT;

  return (
    // A real <button> so the rows are focusable and respond to Enter/Space.
    <Box
      as="button"
      textAlign="left"
      w="full"
      px={3.5}
      py={3}
      borderRadius="lg"
      borderWidth="1px"
      cursor="pointer"
      borderColor={active ? ACCESS_COLORS.accent : "gray.100"}
      bg={
        active
          ? "color-mix(in srgb, var(--chakra-colors-primary) 8%, transparent)"
          : "white"
      }
      shadow={active ? "none" : "xs"}
      _hover={{ borderColor: active ? ACCESS_COLORS.accent : "gray.300" }}
      onClick={onSelect}
    >
      <HStack gap={2}>
        <Text
          fontFamily={CODE_FONT}
          fontSize="11px"
          fontWeight="500"
          px={1.5}
          py="2px"
          borderRadius="sm"
          bg={active ? "white" : "gray.100"}
          color="gray.600"
        >
          {group.code}
        </Text>

        {group.system && (
          <Text
            fontSize="9.5px"
            fontWeight="600"
            letterSpacing="0.04em"
            textTransform="uppercase"
            color="gray.500"
            bg="gray.100"
            px={1.5}
            borderRadius="sm"
          >
            System
          </Text>
        )}

        {dirty && (
          <Box
            ml="auto"
            w="7px"
            h="7px"
            borderRadius="full"
            flexShrink={0}
            bg={ACCESS_COLORS.pendingDot}
          />
        )}
      </HStack>

      <Text
        fontSize="sm"
        fontWeight="600"
        color="gray.800"
        mt={1.5}
        lineClamp={1}
      >
        {group.description}
      </Text>

      <HStack gap={2} mt={1} fontSize="11.5px" color="gray.500">
        <Text>
          {granted} of {TOTAL_PERMISSION_COUNT} permissions
        </Text>
        <Text color="gray.300">·</Text>
        <Text>{members} user(s)</Text>
      </HStack>

      <Box
        h="4px"
        mt={2}
        borderRadius="full"
        bg="gray.100"
        overflow="hidden"
      >
        <Box
          h="100%"
          borderRadius="full"
          transition="width 0.18s ease"
          width={`${Math.round((granted / TOTAL_PERMISSION_COUNT) * 100)}%`}
          bg={complete ? ACCESS_COLORS.grantText : ACCESS_COLORS.accent}
        />
      </Box>
    </Box>
  );
}

/**
 * The access group rail: search, create, and the list of groups to edit.
 *
 * Docks to the left of the permission editor from `lg`, and stacks above it
 * below that. Either way the panel fills the height its wrapper gives it and
 * the group list scrolls inside rather than growing with it, so the editor
 * stays reachable without paging past every group.
 */
export function GroupListPanel({
  groups,
  selectedCode,
  onSelect,
  onCreate,
  permissionCounts,
  memberCounts,
  dirtyCode,
}: GroupListPanelProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (group) =>
        group.description.toLowerCase().includes(q) ||
        group.code.toLowerCase().includes(q),
    );
  }, [groups, query]);

  return (
    <Flex
      direction="column"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
      overflow="hidden"
      h="100%"
    >
      <Box px={4} py={3.5} borderBottomWidth="1px" borderColor="gray.100">
        <Box position="relative">
          <Box
            position="absolute"
            left="11px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
            pointerEvents="none"
            zIndex={1}
          >
            <LuSearch size={15} />
          </Box>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search access groups…"
            pl="33px"
            fontSize="sm"
            bg="white"
            borderColor="gray.300"
            _focusVisible={{
              borderColor: ACCESS_COLORS.accent,
              boxShadow:
                "0 0 0 3px color-mix(in srgb, var(--chakra-colors-primary) 14%, transparent)",
            }}
          />
        </Box>

        <PrimarySmButton
          mt={2.5}
          w="full"
          leftIcon={<LuPlus size={14} />}
          onClick={onCreate}
        >
          New access group
        </PrimarySmButton>
      </Box>

      <Flex
        direction="column"
        gap={1.5}
        p={2}
        flex="1"
        minH={0}
        overflowY="auto"
      >
        {results.map((group) => (
          <GroupRow
            key={group.code}
            group={group}
            active={group.code === selectedCode}
            dirty={!!dirtyCode && dirtyCode === group.code}
            granted={permissionCounts[group.code] ?? 0}
            members={memberCounts[group.code] ?? 0}
            onSelect={() => onSelect(group)}
          />
        ))}

        {results.length === 0 && (
          <Box py={9} px={3} textAlign="center">
            <Text fontSize="xs" color="gray.400">
              No access groups match &ldquo;{query}&rdquo;
            </Text>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
