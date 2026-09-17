"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { BrandedAvatar, OSPBadge } from "osp-ui-kit";

import type { AccessUser } from "../types";
import { CODE_FONT } from "../lib/access-theme";

type GroupMembersCardProps = {
  members: AccessUser[];
  /** Rendered as the card's trailing action, e.g. a link to user assignment. */
  action?: React.ReactNode;
};

/** The users who inherit the selected preset, so the blast radius is visible. */
export function GroupMembersCard({ members, action }: GroupMembersCardProps) {
  return (
    <Box
      as="section"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={2.5}
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.100"
        wrap="wrap"
      >
        <Text fontSize="sm" fontWeight="600" color="gray.800">
          Users in this group
        </Text>
        <Text fontSize="xs" color="gray.500">
          {members.length}
        </Text>
        {action && <Box ml="auto">{action}</Box>}
      </Flex>

      {members.map((user) => (
        <Flex
          key={user.id}
          align="center"
          gap={3}
          px={4}
          py={2.5}
          borderBottomWidth="1px"
          borderColor="gray.50"
          wrap="wrap"
        >
          <BrandedAvatar name={user.name} size="sm" />
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="500" color="gray.800">
              {user.name}
            </Text>
            <Text fontSize="xs" color="gray.500" lineClamp={1}>
              {user.position} · {user.branch}
            </Text>
          </Box>
          <Text
            fontFamily={CODE_FONT}
            fontSize="xs"
            color="gray.400"
            flexShrink={0}
          >
            {user.memberCode}
          </Text>
          <OSPBadge type={user.status === "Active" ? "success" : "warning"}>
            {user.status}
          </OSPBadge>
        </Flex>
      ))}

      {members.length === 0 && (
        <Box py={7} px={4} textAlign="center">
          <Text fontSize="xs" color="gray.400">
            No users are assigned to this group yet.
          </Text>
        </Box>
      )}
    </Box>
  );
}
