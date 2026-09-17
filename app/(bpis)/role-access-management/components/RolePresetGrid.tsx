"use client";

import { Box, Flex, Grid, HStack, Text } from "@chakra-ui/react";
import { Checkbox } from "osp-ui-kit";

import type { PermissionMap } from "../types";
import { TOTAL_PERMISSION_COUNT } from "../data/access-modules";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type { AccessGroup, GroupPresetMap } from "../types";
import { moduleContributions, uniqueContributionCount } from "../lib/role-selectors";

type RolePresetGridProps = {
  groups: AccessGroup[];
  presets: GroupPresetMap;
  /** Roles in the working draft. */
  selectedCodes: string[];
  /** Roles the user currently holds, for the "Currently assigned" marker. */
  currentCodes: string[];
  onToggle: (code: string) => void;
};

function grantedCount(preset: PermissionMap | undefined): number {
  if (!preset) return 0;
  return Object.keys(preset).filter((code) => preset[code]).length;
}

/** Per-module coverage chip, e.g. "PAY 3/5". */
function ModuleChip({
  code,
  granted,
  total,
}: {
  code: string;
  granted: number;
  total: number;
}) {
  const none = granted === 0;
  const all = granted === total;

  return (
    <Text
      fontFamily={CODE_FONT}
      fontSize="10.5px"
      px={1.5}
      py="2px"
      borderRadius="sm"
      whiteSpace="nowrap"
      color={none ? "gray.400" : all ? ACCESS_COLORS.grantText : ACCESS_COLORS.accent}
      bg={
        none
          ? "gray.50"
          : all
            ? ACCESS_COLORS.grantBg
            : "color-mix(in srgb, var(--chakra-colors-primary) 10%, transparent)"
      }
    >
      {code} {granted}/{total}
    </Text>
  );
}

/**
 * The role presets a user can hold. Selection is additive: effective access is
 * the union of every card ticked, so the contribution line reports what each
 * role *uniquely* provides rather than its raw size.
 */
export function RolePresetGrid({
  groups,
  presets,
  selectedCodes,
  currentCodes,
  onToggle,
}: RolePresetGridProps) {
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
      }}
      gap={2.5}
    >
      {groups.map((group) => {
        const preset = presets[group.code];
        const picked = selectedCodes.includes(group.code);
        const isCurrent = currentCodes.includes(group.code);
        const unique = picked
          ? uniqueContributionCount(group.code, selectedCodes, presets)
          : 0;

        return (
          <Box
            key={group.code}
            p={3.5}
            borderRadius="xl"
            cursor="pointer"
            bg="white"
            borderWidth="1px"
            borderColor={picked ? ACCESS_COLORS.accent : "gray.200"}
            shadow={picked ? "none" : "xs"}
            outline={
              picked
                ? "3px solid color-mix(in srgb, var(--chakra-colors-primary) 10%, transparent)"
                : "none"
            }
            _hover={{ borderColor: picked ? ACCESS_COLORS.accent : "gray.300" }}
            onClick={() => onToggle(group.code)}
          >
            <HStack gap={2.5}>
              <Checkbox
                checked={picked}
                onCheckedChange={() => onToggle(group.code)}
                aria-label={`Assign ${group.description}`}
                onClick={(event) => event.stopPropagation()}
              />
              <Text
                flex="1"
                minW={0}
                fontSize="sm"
                fontWeight="600"
                color="gray.800"
                lineClamp={1}
              >
                {group.description}
              </Text>
              <Text
                flexShrink={0}
                fontFamily={CODE_FONT}
                fontSize="11px"
                px={1.5}
                py="2px"
                borderRadius="sm"
                bg="gray.100"
                color="gray.600"
              >
                {group.code}
              </Text>
            </HStack>

            <Text fontSize="xs" color="gray.500" mt={2} lineHeight="1.5">
              {group.summary}
            </Text>

            <Flex gap={1.5} mt={2.5} wrap="wrap">
              {moduleContributions(preset ?? {}).map((contribution) => (
                <ModuleChip
                  key={contribution.code}
                  code={contribution.code}
                  granted={contribution.granted}
                  total={contribution.total}
                />
              ))}
            </Flex>

            <HStack gap={2.5} mt={2.5} wrap="wrap">
              {isCurrent && (
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color={ACCESS_COLORS.grantText}
                >
                  Currently assigned
                </Text>
              )}
              <Text fontSize="11px" color="gray.500">
                {picked
                  ? `${unique} permission(s) only this role provides`
                  : `${grantedCount(preset)} of ${TOTAL_PERMISSION_COUNT} permissions`}
              </Text>
            </HStack>
          </Box>
        );
      })}
    </Grid>
  );
}
