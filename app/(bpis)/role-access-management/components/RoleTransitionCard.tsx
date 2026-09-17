"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuArrowRight } from "react-icons/lu";

import type { PermissionMap } from "../types";
import {
  countGranted,
  TOTAL_PERMISSION_COUNT,
} from "../data/access-modules";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type { AccessGroup } from "../types";

type RoleTransitionCardProps = {
  groups: AccessGroup[];
  currentCodes: string[];
  pendingCodes: string[];
  currentAccess: PermissionMap;
  pendingAccess: PermissionMap;
  /** Only then is the "new roles" side worth drawing. */
  dirty: boolean;
};

function RoleChip({
  code,
  description,
  tone,
}: {
  code: string;
  description: string;
  tone: "current" | "new";
}) {
  const isNew = tone === "new";
  return (
    <HStack
      gap={2}
      px={2.5}
      py={1}
      borderRadius="full"
      borderWidth="1px"
      borderColor={isNew ? ACCESS_COLORS.pendingBorder : "gray.200"}
      bg={isNew ? ACCESS_COLORS.pendingBg : "gray.100"}
    >
      <Text
        fontFamily={CODE_FONT}
        fontSize="11px"
        color={isNew ? ACCESS_COLORS.pendingText : "gray.500"}
      >
        {code}
      </Text>
      <Text
        fontSize="xs"
        fontWeight="500"
        color={isNew ? ACCESS_COLORS.pendingText : "gray.700"}
      >
        {description}
      </Text>
    </HStack>
  );
}

function RoleColumn({
  heading,
  codes,
  groups,
  access,
  tone,
}: {
  heading: string;
  codes: string[];
  groups: AccessGroup[];
  access: PermissionMap;
  tone: "current" | "new";
}) {
  const describe = (code: string) =>
    groups.find((group) => group.code === code)?.description ?? code;

  return (
    <Box minW="220px" flex="1">
      <Text
        fontSize="11px"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing="0.04em"
        color={tone === "new" ? ACCESS_COLORS.pendingText : "gray.500"}
      >
        {heading}
      </Text>

      <Flex gap={2} mt={2} wrap="wrap">
        {codes.map((code) => (
          <RoleChip
            key={code}
            code={code}
            description={describe(code)}
            tone={tone}
          />
        ))}
        {codes.length === 0 && (
          <Text fontSize="xs" color="gray.400">
            No roles selected
          </Text>
        )}
      </Flex>

      <Text
        fontSize="xs"
        mt={2}
        color={tone === "new" ? ACCESS_COLORS.pendingText : "gray.500"}
      >
        {codes.length} role(s) · {countGranted(access)} of{" "}
        {TOTAL_PERMISSION_COUNT} permissions
      </Text>
    </Box>
  );
}

/** Before/after of the user's role holdings, with the permission totals each implies. */
export function RoleTransitionCard({
  groups,
  currentCodes,
  pendingCodes,
  currentAccess,
  pendingAccess,
  dirty,
}: RoleTransitionCardProps) {
  return (
    <Flex
      align="flex-start"
      gap={4}
      px={4}
      py={3.5}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
      wrap="wrap"
    >
      <RoleColumn
        heading="Current roles"
        codes={currentCodes}
        groups={groups}
        access={currentAccess}
        tone="current"
      />

      {dirty && (
        <>
          <Box color="gray.400" pt={5} display={{ base: "none", md: "block" }}>
            <LuArrowRight size={16} />
          </Box>
          <RoleColumn
            heading="New roles"
            codes={pendingCodes}
            groups={groups}
            access={pendingAccess}
            tone="new"
          />
        </>
      )}
    </Flex>
  );
}
