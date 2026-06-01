"use client";

import {
  Box,
  Flex,
  Grid,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import {
  SalesAgent,
  getAgentNameById,
  getPositionDesc,
} from "../../common/agent-lookup/agent-lookup.type";
import { LuIdCard, LuCalendar, LuUsers, LuBriefcase } from "react-icons/lu";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import Drawer from "@/components/drawers/Drawer";

interface TeamMemberDrawerProps {
  agent: SalesAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Flex align="start" gap={3}>
    <Box color="var(--chakra-colors-primary)" pt={1}>
      {icon}
    </Box>
    <VStack align="start" gap={0}>
      <Small color="gray.500">{label}</Small>
      <Body>{value}</Body>
    </VStack>
  </Flex>
);

export function TeamMemberDrawer({
  agent,
  open,
  onOpenChange,
}: TeamMemberDrawerProps) {
  return (
    <Drawer
      title="Team Member Details"
      open={open}
      onOpenChange={onOpenChange}
    >
      {agent ? (
        <Flex direction="column" gap={6} pt={2}>
          <AgentProfileHeaderCard agent={agent} />

          <Box
            p={4}
            borderRadius="md"
            borderWidth={1}
            borderColor="gray.200"
          >
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="var(--chakra-colors-primary)"
              mb={2}
            >
              Basic Information
            </Text>
            <Separator mb={4} />
            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
            >
              <DetailRow
                icon={<LuIdCard size={16} />}
                label="Agent ID"
                value={agent.id}
              />
              <DetailRow
                icon={<LuBriefcase size={16} />}
                label="Position"
                value={getPositionDesc(agent.position)}
              />
              <DetailRow
                icon={<LuCalendar size={16} />}
                label="Hire Date"
                value={agent.hireDate}
              />
              <DetailRow
                icon={<LuUsers size={16} />}
                label="Superior"
                value={getAgentNameById(agent.superiorId ?? "") ?? "—"}
              />
            </Grid>
          </Box>

          <Box
            p={4}
            borderRadius="md"
            borderWidth={1}
            borderColor="gray.200"
          >
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="var(--chakra-colors-primary)"
              mb={2}
            >
              Document Status
            </Text>
            <Separator mb={4} />
            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
            >
              <VStack align="start" gap={0}>
                <Small color="gray.500">Contract Printed</Small>
                <Body>{agent.isContractPrinted ? "Yes" : "No"}</Body>
              </VStack>
              <VStack align="start" gap={0}>
                <Small color="gray.500">SFID Printed</Small>
                <Body>{agent.isSFIDPrinted ? "Yes" : "No"}</Body>
              </VStack>
            </Grid>
          </Box>
        </Flex>
      ) : (
        <Text color="gray.500">No agent selected.</Text>
      )}
    </Drawer>
  );
}

export default TeamMemberDrawer;
