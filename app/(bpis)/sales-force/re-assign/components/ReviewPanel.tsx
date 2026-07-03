"use client";

import {
  getAgentNameById,
  getPositionDesc,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Card } from "@/claude components/card-accordion/card";
import { Avatar, Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import {
  LuLayoutDashboard,
  LuTriangleAlert,
  LuUserRoundCheck,
  LuUsers,
} from "react-icons/lu";
import { fullName, initials } from "../utils";
import { StatusBadge } from "./shared";

/* ─── Review & Confirm ───────────────────────────────────────────────────── */

const ReviewRow = ({ agent }: { agent: SalesAgent }) => (
  <Flex
    align="center"
    gap={3}
    px={3}
    py={2.5}
    borderRadius="10px"
    borderWidth="1px"
    borderColor="gray.100"
    bg="gray.50"
  >
    <Avatar.Root colorPalette={"gray"} size="sm" flexShrink={0}>
      <Avatar.Fallback>{initials(agent)}</Avatar.Fallback>
    </Avatar.Root>
    <Box flex={1} minW={0}>
      <Text fontSize="13px" fontWeight="600" color="gray.900" truncate>
        {fullName(agent)}
      </Text>
      <Text fontSize="11px" color="gray.500">
        {agent.id} · {getPositionDesc(agent.position)} · {agent.branch}
      </Text>
    </Box>
    <Flex direction="column" align="flex-end" flexShrink={0}>
      <Text fontSize="10px" color="gray.400">
        from
      </Text>
      <Text fontSize="12px" color="gray.600" fontWeight="600" truncate>
        {getAgentNameById(agent.superiorId ?? "") ?? "—"}
      </Text>
    </Flex>
  </Flex>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Flex align="center" py={1.5} fontSize="sm" gap={3}>
    <Text color="gray.500" whiteSpace="nowrap">
      {label}
    </Text>
    <Box flex={1} borderBottom="1px dashed" borderColor="gray.200" />
    <Text fontWeight="600" color="gray.900" textAlign="right">
      {value}
    </Text>
  </Flex>
);

export const ReviewPanel = ({
  superior,
  agents,
}: {
  superior: SalesAgent;
  agents: SalesAgent[];
}) => (
  <Flex direction="column" gap={4}>
    {/* Notice */}
    <Flex
      align="flex-start"
      gap={2.5}
      px={4}
      py={3}
      borderRadius="12px"
      borderWidth="1px"
      borderColor="#F4CE7B"
      bg="#FEF7E7"
    >
      <Box color="#B7791F" flexShrink={0} mt="1px">
        <LuTriangleAlert size={18} />
      </Box>
      <Text fontSize="13px" color="#7A5B12" lineHeight="1.5">
        Please review all information carefully. Once submitted, this
        reorganization request will proceed for approval and may not be
        editable.
      </Text>
    </Flex>

    <Flex direction={{ base: "column", lg: "row" }} gap={4} align="stretch">
      {/* Receiving superior */}
      <Box flex={1} minW={0}>
        <Card
          activeIcon={<LuUserRoundCheck size={16} />}
          title="Receiving Superior"
          subtitle="Destination for the selected agents"
        >
          <HStack gap={3} mb={3}>
            <Avatar.Root colorPalette={"gray"} size="lg" flexShrink={0}>
              <Avatar.Fallback>{initials(superior)}</Avatar.Fallback>
            </Avatar.Root>
            <Box minW={0}>
              <Text fontWeight="700" fontSize="md" color="gray.900" truncate>
                {fullName(superior)}
              </Text>
              <StatusBadge status={superior.employeeStatus} />
            </Box>
          </HStack>
          <InfoRow label="Agent Code" value={superior.id} />
          <InfoRow
            label="Position"
            value={getPositionDesc(superior.position) ?? superior.position}
          />
          <InfoRow label="Branch" value={superior.branch} />
          <InfoRow label="Area" value={superior.address.province} />
        </Card>
      </Box>

      {/* Summary */}
      <Box flex={1} minW={0}>
        <Card
          activeIcon={<LuLayoutDashboard size={16} />}
          title="Summary"
          subtitle="Reorganization overview"
        >
          <Flex
            align="center"
            justify="space-between"
            p={4}
            mb={3}
            borderRadius="12px"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Box>
              <Text fontSize="12px" color="gray.500" fontWeight="600">
                Total agents affected
              </Text>
              <Text
                fontSize="28px"
                fontWeight="800"
                color="gray.900"
                lineHeight="1.1"
              >
                {agents.length}
              </Text>
            </Box>
            <Flex
              align="center"
              justify="center"
              boxSize="48px"
              borderRadius="full"
              bg="gray.800"
              color="white"
            >
              <LuUsers size={22} />
            </Flex>
          </Flex>
          <InfoRow
            label="Effective receiving superior"
            value={fullName(superior)}
          />
          <InfoRow label="Superior code" value={superior.id} />
          <InfoRow label="Request type" value="Re-organization" />
        </Card>
      </Box>
    </Flex>

    {/* Selected agents list */}
    <Card
      activeIcon={<LuUsers size={16} />}
      title="Selected Agents"
      subtitle={`${agents.length} agent${agents.length === 1 ? "" : "s"} will be moved`}
      headerAction={
        <Badge
          colorPalette="gray"
          variant="subtle"
          borderRadius="full"
          px={2.5}
        >
          <Text fontSize="11px" fontWeight="700">
            {agents.length} total
          </Text>
        </Badge>
      }
    >
      <VStack align="stretch" gap={2} maxH="360px" overflowY="auto" pr={1}>
        {agents.map((a) => (
          <ReviewRow key={a.id} agent={a} />
        ))}
      </VStack>
    </Card>
  </Flex>
);
