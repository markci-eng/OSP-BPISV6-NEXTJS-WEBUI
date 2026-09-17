"use client";

import { Box, Flex, Grid, HStack, Text } from "@chakra-ui/react";
import { LuChevronRight, LuLock } from "react-icons/lu";
import { Checkbox, Tooltip } from "osp-ui-kit";

import type { AccessFunction, PermissionMap } from "../types";
import type { ModuleStats, VisibleModule } from "../lib/access-selectors";
import { formatChangeLabel } from "../lib/access-selectors";
import { isLocked } from "../data/access-modules";
import { ACCESS_COLORS, CODE_FONT } from "../lib/access-theme";

type ModuleAccessCardProps = {
  visible: VisibleModule;
  stats: ModuleStats;
  base: PermissionMap;
  draft: PermissionMap;
  expanded: boolean;
  /**
   * Shows the permissions without offering to change them — a system group's
   * preset is fixed. Expanding still works: this is about editing, not reading.
   */
  readOnly?: boolean;
  onToggleExpand: () => void;
  onToggleModule: () => void;
  onTogglePermission: (code: string) => void;
};

function PermissionRow({
  fn,
  checked,
  changed,
  wasGranted,
  readOnly,
  onToggle,
}: {
  fn: AccessFunction;
  checked: boolean;
  changed: boolean;
  wasGranted: boolean;
  readOnly: boolean;
  onToggle: () => void;
}) {
  // The chip marks a permission the security policy pins for everyone; a
  // read-only card freezes the whole preset, which is the group's doing and is
  // already said once in its header. Both stop the toggle; only one is a badge.
  const policyLocked = isLocked(fn.code);
  const locked = policyLocked || readOnly;

  return (
    <HStack
      gap={2.5}
      px={2.5}
      py={{ base: 3, md: 2 }}
      borderRadius="md"
      cursor={locked ? "not-allowed" : "pointer"}
      bg={changed ? ACCESS_COLORS.pendingRowBg : "transparent"}
      // boxShadow={changed ? `inset 2px 0 0 ${ACCESS_COLORS.pendingDot}` : "none"}
      _hover={{ bg: changed ? ACCESS_COLORS.pendingRowBg : "gray.50" }}
      onClick={() => {
        if (!locked) onToggle();
      }}
    >
      <Checkbox
        checked={checked}
        disabled={locked}
        onCheckedChange={() => {
          if (!locked) onToggle();
        }}
        aria-label={fn.description}
        // The row already handles the click; without this the checkbox would
        // toggle twice on a direct hit.
        onClick={(event) => event.stopPropagation()}
      />

      <Text
        flex="1"
        minW={0}
        fontSize="sm"
        lineClamp={{ base: 2, md: 1 }}
        color={checked ? "gray.800" : "gray.700"}
        fontWeight={checked ? "500" : "400"}
      >
        {fn.description}
      </Text>

      {/* <Text
        fontFamily={CODE_FONT}
        fontSize="11px"
        color="gray.400"
        flexShrink={0}
        display={{ base: "none", sm: "block" }}
      >
        {fn.code}
      </Text> */}

      {policyLocked && (
        <Tooltip content="Locked by security policy">
          <HStack
            gap={1}
            flexShrink={0}
            px={1.5}
            py="1px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="gray.200"
            bg="gray.100"
            color="gray.500"
          >
            <LuLock size={9} />
            <Text fontSize="10.5px">Locked</Text>
          </HStack>
        </Tooltip>
      )}

      {changed && (
        <Text
          flexShrink={0}
          fontSize="10.5px"
          fontWeight="600"
          whiteSpace="nowrap"
          px={2}
          py="2px"
          borderRadius="full"
          color={
            wasGranted ? ACCESS_COLORS.revokeText : ACCESS_COLORS.grantText
          }
          bg={wasGranted ? ACCESS_COLORS.revokeBg : ACCESS_COLORS.grantBg}
        >
          {wasGranted ? "Revoked" : "Granted"}
        </Text>
      )}
    </HStack>
  );
}

export function ModuleAccessCard({
  visible,
  stats,
  base,
  draft,
  expanded,
  readOnly = false,
  onToggleExpand,
  onToggleModule,
  onTogglePermission,
}: ModuleAccessCardProps) {
  const { module, functions } = visible;
  const countColor = stats.isNone
    ? "gray.400"
    : stats.isAll
      ? ACCESS_COLORS.grantText
      : "gray.600";

  return (
    <Box
      as="section"
      bg="white"
      borderWidth="1px"
      borderColor={
        stats.changeCount ? ACCESS_COLORS.pendingCardBorder : "gray.200"
      }
      borderRadius="xl"
      shadow="xs"
      overflow="hidden"
    >
      <Flex align="center" gap={3} px={4} py={3}>
        <Checkbox
          checked={stats.isAll ? true : stats.isNone ? false : "indeterminate"}
          disabled={readOnly}
          onCheckedChange={onToggleModule}
          aria-label={`Toggle all ${module.name} permissions`}
        />

        <Flex
          flex="1"
          minW={0}
          align="center"
          gap={2.5}
          cursor="pointer"
          onClick={onToggleExpand}
        >
          <Box
            color="gray.400"
            flexShrink={0}
            transition="transform 0.15s ease"
            transform={expanded ? "rotate(90deg)" : "rotate(0deg)"}
          >
            <LuChevronRight size={14} />
          </Box>

          <Text fontSize="sm" fontWeight="600" color="gray.800" lineClamp={1}>
            {module.name}
          </Text>

          {/* <Text
            fontFamily={CODE_FONT}
            fontSize="11px"
            color="gray.400"
            bg="gray.100"
            px={1.5}
            py="2px"
            borderRadius="sm"
            flexShrink={0}
            display={{ base: "none", sm: "block" }}
          >
            {module.code}
          </Text> */}

          {stats.changeCount > 0 && (
            <Text
              flexShrink={0}
              fontSize="11px"
              fontWeight="600"
              px={2}
              py="2px"
              borderRadius="full"
              borderWidth="1px"
              color={ACCESS_COLORS.pendingText}
              bg={ACCESS_COLORS.pendingBg}
              borderColor={ACCESS_COLORS.pendingBorder}
            >
              {formatChangeLabel(stats.addedCount, stats.removedCount)}
            </Text>
          )}
        </Flex>

        <HStack gap={3} flexShrink={0}>
          <Box
            w="64px"
            h="5px"
            borderRadius="full"
            bg="gray.100"
            overflow="hidden"
            display={{ base: "none", sm: "block" }}
          >
            <Box
              h="100%"
              borderRadius="full"
              transition="width 0.18s ease"
              width={`${Math.round((stats.granted / stats.total) * 100)}%`}
              bg={stats.isAll ? ACCESS_COLORS.grantText : ACCESS_COLORS.accent}
            />
          </Box>
          <Text
            fontSize="xs"
            fontWeight="500"
            minW="52px"
            textAlign="right"
            color={countColor}
          >
            {stats.granted} / {stats.total}
          </Text>
        </HStack>
      </Flex>

      {expanded && (
        <Grid
          borderTopWidth="1px"
          borderColor="gray.100"
          px={{ base: 1.5, md: 3 }}
          pt={2}
          pb={3}
          templateColumns={{
            base: "1fr",
            lg: "repeat(auto-fill, minmax(330px, 1fr))",
          }}
          columnGap={3}
          rowGap={{ base: 0, md: "2px" }}
        >
          {functions.map((fn) => (
            <PermissionRow
              key={fn.code}
              fn={fn}
              checked={!!draft[fn.code]}
              changed={!!draft[fn.code] !== !!base[fn.code]}
              wasGranted={!!base[fn.code]}
              readOnly={readOnly}
              onToggle={() => onTogglePermission(fn.code)}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}
