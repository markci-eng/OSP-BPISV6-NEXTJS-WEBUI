"use client";

import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import {
  SalesAgent,
  getAgentNameById,
  getPositionDesc,
} from "../../common/agent-lookup/agent-lookup.type";
import { LuBriefcase, LuCalendar, LuIdCard, LuUsers } from "react-icons/lu";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import Drawer from "@/components/drawers/Drawer";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

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
  <Flex align="start" gap={3} minW={0}>
    <Box color={BRAND_COLORS.primaryGreen} pt={1}>
      {icon}
    </Box>
    <VStack align="start" gap={0} minW={0}>
      <Small color="gray.500">{label}</Small>
      <Body color={BRAND_COLORS.neutralText}>{value}</Body>
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
        <Flex direction="column" gap={{ base: 4, md: 5 }} pt={2}>
          <AgentProfileHeaderCard agent={agent} />

          <ProfileSectionCard title="Basic Information">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
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
                value={getAgentNameById(agent.superiorId ?? "") ?? "-"}
              />
            </Grid>
          </ProfileSectionCard>

          <ProfileSectionCard title="Document Status">
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <VStack align="start" gap={0}>
                <Small color="gray.500">Contract Printed</Small>
                <Body color={BRAND_COLORS.neutralText}>
                  {agent.isContractPrinted ? "Yes" : "No"}
                </Body>
              </VStack>
              <VStack align="start" gap={0}>
                <Small color="gray.500">SFID Printed</Small>
                <Body color={BRAND_COLORS.neutralText}>
                  {agent.isSFIDPrinted ? "Yes" : "No"}
                </Body>
              </VStack>
            </Grid>
          </ProfileSectionCard>
        </Flex>
      ) : (
        <Text color="gray.500" py={4}>
          No agent selected.
        </Text>
      )}
    </Drawer>
  );
}

export default TeamMemberDrawer;
