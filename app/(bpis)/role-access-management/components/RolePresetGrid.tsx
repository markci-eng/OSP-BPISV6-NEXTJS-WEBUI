"use client";

import { Box, Flex, Grid, HStack, Text } from "@chakra-ui/react";
import { Checkbox } from "osp-ui-kit";

import type { PermissionMap } from "../types";
import { TOTAL_PERMISSION_COUNT } from "../data/access-modules";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type {
  AccessGroup,
  DataScopeLevel,
  GroupPresetMap,
  GroupScopeMap,
} from "../types";
import { moduleContributions, uniqueContributionCount } from "../lib/role-selectors";
import {
  areaName,
  DATA_SCOPE_AREAS,
  DATA_SCOPE_NOUNS,
} from "../data/data-scopes";
import { SearchableChecklist } from "./SearchableChecklist";

type RolePresetGridProps = {
  groups: AccessGroup[];
  presets: GroupPresetMap;
  /** Roles in the working draft. */
  selectedCodes: string[];
  /** Roles the user currently holds, for the "Currently assigned" marker. */
  currentCodes: string[];
  onToggle: (code: string) => void;
  /** Areas picked for each selected role that carries a data scope. */
  scopes: GroupScopeMap;
  onScopeChange: (groupCode: string, areaCodes: string[]) => void;
};

/**
 * Area picker for a role restricted by data scope. Rendered inside the role's
 * card, so clicks are stopped here — otherwise picking an area would also
 * untick the role.
 */
function ScopePicker({
  level,
  selected,
  onChange,
}: {
  level: DataScopeLevel;
  selected: string[];
  onChange: (areaCodes: string[]) => void;
}) {
  const nouns = DATA_SCOPE_NOUNS[level];
  const missing = selected.length === 0;
  const options = DATA_SCOPE_AREAS[level].map((area) => ({
    value: area.code,
    label: area.name,
    description: area.parent ? areaName(area.parent) : undefined,
  }));

  return (
    // The dropdown is portalled, but React still bubbles its clicks through
    // this box — so stopping them here covers the open list as well.
    <Box
      mt={3}
      pt={3.5}
      borderTopWidth="1px"
      borderColor="gray.100"
      cursor="default"
      onClick={(event) => event.stopPropagation()}
    >
      <SearchableChecklist
        label={`Data scope · ${nouns.many}`}
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder={`Select ${nouns.many}`}
        searchPlaceholder={`Search ${nouns.many}…`}
        invalid={missing}
      />
      {missing && (
        <Text fontSize="11px" mt={1.5} color={ACCESS_COLORS.revokeText}>
          Select at least one {nouns.one} for this role.
        </Text>
      )}
    </Box>
  );
}

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
  scopes,
  onScopeChange,
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
              {group.dataScope && !picked && (
                <Text fontSize="11px" color="gray.400">
                  Scoped by {DATA_SCOPE_NOUNS[group.dataScope].one}
                </Text>
              )}
            </HStack>

            {group.dataScope && picked && (
              <ScopePicker
                level={group.dataScope}
                selected={scopes[group.code] ?? []}
                onChange={(areaCodes) => onScopeChange(group.code, areaCodes)}
              />
            )}
          </Box>
        );
      })}
    </Grid>
  );
}
