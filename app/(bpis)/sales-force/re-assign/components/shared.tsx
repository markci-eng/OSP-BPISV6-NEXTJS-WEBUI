"use client";

import {
  getPositionDesc,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { BrandedAvatar, OSPBadge } from "osp-ui-kit";
import React from "react";
import { fullName, initials } from "../utils";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { AGENT_EMPLOYEE_STATUS_COLOR } from "@/lib/status/agent-employee-status";

/* ─── Shared presentational bits ─────────────────────────────────────────── */

export const StatusBadge = ({ status }: { status: string }) => (
  <OSPBadge
    type={
      AGENT_EMPLOYEE_STATUS_COLOR[
        status as keyof typeof AGENT_EMPLOYEE_STATUS_COLOR
      ] ?? null
    }
    variant="subtle"
    borderRadius="full"
    px={2.5}
    py={0.5}
    fontSize="11px"
    fontWeight="600"
  >
    {status}
  </OSPBadge>
);

export const RankBadge = ({ position }: { position: string }) => (
  <OSPBadge>{getPositionDesc(position) ?? position}</OSPBadge>
);

export const MetaItem = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <HStack gap={1} color="gray.500" minW={0}>
    <Box flexShrink={0} display="flex">
      {icon}
    </Box>
    <Text fontSize="xs" truncate>
      {children}
    </Text>
  </HStack>
);

/* ─── Empty state ────────────────────────────────────────────────────────── */

export const EmptyState = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    gap={2}
    py={10}
    px={4}
    color="gray.400"
    textAlign="center"
  >
    {icon}
    <Text fontSize="sm" maxW="280px">
      {children}
    </Text>
  </Flex>
);

/* ─── Agent identity cell (table) ────────────────────────────────────────── */

export const AgentIdentityCell = ({ agent }: { agent: SalesAgent }) => (
  <HStack gap={2.5} minW={0}>
    <BrandedAvatar
      name={fullName(agent)}
      imageUrl={mockAvatarUrl(agent.id)}
      ringed
    />
    <Box minW={0}>
      <Text fontSize="13px" fontWeight="600" color="gray.900" truncate>
        {fullName(agent)}
      </Text>
      <Text fontSize="11px" color="gray.500">
        {agent.id}
      </Text>
    </Box>
  </HStack>
);
