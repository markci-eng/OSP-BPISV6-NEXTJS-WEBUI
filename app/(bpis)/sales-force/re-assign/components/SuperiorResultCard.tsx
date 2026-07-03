"use client";

import {
  getSubordinates,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Avatar, Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { LuBuilding2, LuCheck, LuMapPin, LuUsers } from "react-icons/lu";
import { SOFT_SHADOW } from "../constants";
import { fullName, initials } from "../utils";
import { MetaItem, RankBadge, StatusBadge } from "./shared";

/* Labeled column used by the desktop result-card layout to spread agent
   details evenly across the row instead of clustering them on the left. */
const CardColumn = ({
  label,
  width,
  flex,
  align = "flex-start",
  children,
}: {
  label: string;
  width?: string;
  flex?: string | number;
  align?: "flex-start" | "center";
  children: React.ReactNode;
}) => (
  <Flex
    direction="column"
    gap={1.5}
    width={width}
    flex={flex}
    minW={0}
    align={align}
  >
    <Text
      fontSize="9px"
      fontWeight="700"
      letterSpacing="0.06em"
      textTransform="uppercase"
      color="gray.400"
      lineHeight="1"
    >
      {label}
    </Text>
    {children}
  </Flex>
);

/* ─── Superior result card ───────────────────────────────────────────────── */

export const SuperiorResultCard = ({
  agent,
  selected,
  onSelect,
}: {
  agent: SalesAgent;
  selected: boolean;
  onSelect: () => void;
}) => {
  const teamSize = getSubordinates(agent.id).length;

  const selectionNode = selected ? (
    <Badge
      colorPalette="green"
      variant="solid"
      borderRadius="full"
      px={2.5}
      py={1}
      flexShrink={0}
    >
      <LuCheck size={12} />
      <Text ml={1} fontSize="11px" fontWeight="700">
        Selected
      </Text>
    </Badge>
  ) : (
    <Flex
      align="center"
      justify="center"
      boxSize="20px"
      borderRadius="full"
      borderWidth="2px"
      borderColor="gray.300"
      flexShrink={0}
    />
  );

  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      align="center"
      cursor="pointer"
      borderRadius="12px"
      borderWidth="1.5px"
      borderColor={selected ? "gray.400" : "gray.200"}
      bg={selected ? "gray.50" : "white"}
      transition="all 0.15s ease"
      _hover={{
        borderColor: selected ? "gray.400" : "gray.300",
        boxShadow: SOFT_SHADOW,
      }}
    >
      {/* Mobile / tablet — compact stacked layout */}
      <Flex
        display={{ base: "flex", lg: "none" }}
        flex="1"
        align="center"
        gap={3}
        px={3.5}
        py={3}
        minW={0}
      >
        <Avatar.Root colorPalette={"gray"} size="md" flexShrink={0}>
          <Avatar.Fallback>{initials(agent)}</Avatar.Fallback>
        </Avatar.Root>

        <Box flex={1} minW={0}>
          <HStack gap={2} minW={0}>
            <Text fontWeight="700" fontSize="sm" color="gray.900" truncate>
              {fullName(agent)}
            </Text>
            <RankBadge position={agent.position} />
          </HStack>
          <HStack gap={3} mt={0.5} minW={0}>
            <Text fontSize="xs" color="gray.500" flexShrink={0}>
              {agent.id}
            </Text>
            <MetaItem icon={<LuBuilding2 size={12} />}>{agent.branch}</MetaItem>
            <MetaItem icon={<LuMapPin size={12} />}>
              {agent.address.province}
            </MetaItem>
          </HStack>
          <HStack gap={2} mt={1.5}>
            <Badge
              colorPalette="gray"
              variant="subtle"
              borderRadius="full"
              px={2}
              fontSize="10px"
            >
              <LuUsers size={11} />
              <Text ml={1}>{teamSize} in team</Text>
            </Badge>
            <StatusBadge status={agent.employeeStatus} />
          </HStack>
        </Box>

        {selectionNode}
      </Flex>

      {/* Desktop — full-width row that spreads details into labeled columns */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        flex="1"
        align="center"
        gap={4}
        px={4}
        py={3}
        minW={0}
      >
        {/* Identity */}
        <HStack gap={3} flex="1.4" minW={0}>
          <Avatar.Root colorPalette={"gray"} size="md" flexShrink={0}>
            <Avatar.Fallback>{initials(agent)}</Avatar.Fallback>
          </Avatar.Root>
          <Box minW={0}>
            <HStack gap={2} minW={0}>
              <Text fontWeight="700" fontSize="sm" color="gray.900" truncate>
                {fullName(agent)}
              </Text>
              <RankBadge position={agent.position} />
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {agent.id}
            </Text>
          </Box>
        </HStack>

        <Box w="1px" alignSelf="stretch" bg="gray.200" my={1} />

        {/* Branch */}
        <CardColumn label="Branch" flex="1">
          <HStack gap={1.5} color="gray.700" minW={0}>
            <Box flexShrink={0} display="flex" color="gray.400">
              <LuBuilding2 size={13} />
            </Box>
            <Text fontSize="13px" fontWeight="600" truncate>
              {agent.branch}
            </Text>
          </HStack>
        </CardColumn>

        {/* Area */}
        <CardColumn label="Area" flex="1">
          <HStack gap={1.5} color="gray.700" minW={0}>
            <Box flexShrink={0} display="flex" color="gray.400">
              <LuMapPin size={13} />
            </Box>
            <Text fontSize="13px" fontWeight="600" truncate>
              {agent.address.province}
            </Text>
          </HStack>
        </CardColumn>

        {/* Team */}
        <CardColumn label="Team" width="64px" align="center">
          <HStack gap={1.5} color="gray.700">
            <LuUsers size={14} />
            <Text fontSize="sm" fontWeight="700">
              {teamSize}
            </Text>
          </HStack>
        </CardColumn>

        {/* Status */}
        <CardColumn label="Status" width="92px">
          <StatusBadge status={agent.employeeStatus} />
        </CardColumn>

        <Box w="1px" alignSelf="stretch" bg="gray.200" my={1} />

        {/* Selection */}
        <Flex justify="flex-end" minW="96px" flexShrink={0}>
          {selectionNode}
        </Flex>
      </Flex>
    </Flex>
  );
};
