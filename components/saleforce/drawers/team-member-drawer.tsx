"use client";

import { Box, Separator, Text, VStack } from "@chakra-ui/react";
import {
  SalesAgent,
  getAgentNameById,
  getPositionDesc,
} from "../../common/agent-lookup/agent-lookup.type";
import BottomQuickActions, {
  QuickActionsHeaderCard,
} from "@/claude components/drawer/bottom-quick-actions";
import { RowItem } from "@/claude components/info-card/row-item";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS, STANDARD_SPACING } from "@/lib/theme/standard-design-tokens";

interface TeamMemberDrawerProps {
  agent: SalesAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
  const [last, first] = name.split(",").map((s) => s.trim());
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg={BRAND_COLORS.subtleBg}
      borderRadius={STANDARD_RADIUS.lg}
      borderWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      px={STANDARD_SPACING.sm}
      pt="12px"
      pb="10px"
    >
      <Text
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.06em"
        textTransform="uppercase"
        color={BRAND_COLORS.grey}
        mb="8px"
      >
        {title}
      </Text>
      <Separator borderColor={BRAND_COLORS.neutralBorder} mb="10px" />
      {children}
    </Box>
  );
}

export function TeamMemberDrawer({
  agent,
  open,
  onOpenChange,
}: TeamMemberDrawerProps) {
  const headerSlot = agent ? (
    <VStack gap={STANDARD_SPACING.xs} align="stretch">
      <QuickActionsHeaderCard
        initials={getInitials(agent.name)}
        label={agent.name}
        meta={`${getPositionDesc(agent.position)} · ${agent.branch}`}
      />

      <SectionCard title="Basic Information">
        <RowItem label="Agent ID" value={agent.id} />
        <RowItem label="Position" value={getPositionDesc(agent.position)} />
        <RowItem label="Status" value={agent.employeeStatus} />
        <RowItem label="Hire Date" value={agent.hireDate} />
        <RowItem label="Branch" value={agent.branch} />
        <RowItem
          label="Direct Superior"
          value={getAgentNameById(agent.superiorId ?? "") ?? "—"}
        />
      </SectionCard>

      <SectionCard title="Document Status">
        <RowItem
          label="Contract"
          value={agent.isContractPrinted ? "Printed" : "Not Printed"}
        />
        <RowItem
          label="SFID Card"
          value={agent.isSFIDPrinted ? "Printed" : "Not Printed"}
        />
      </SectionCard>
    </VStack>
  ) : undefined;

  return (
    <BottomQuickActions
      open={open}
      onOpenChange={onOpenChange}
      title="Team Member"
      subtitle="Agent profile and details"
      headerSlot={headerSlot}
      actions={[]}
    />
  );
}

export default TeamMemberDrawer;
