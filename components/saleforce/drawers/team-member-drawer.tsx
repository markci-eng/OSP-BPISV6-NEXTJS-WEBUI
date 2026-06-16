"use client";

import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { User, FileText } from "lucide-react";
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
import {
  STANDARD_RADIUS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

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
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="lg"
      borderWidth="1px"
      borderColor="border.muted"
      overflow="hidden"
    >
      <HStack
        gap={2}
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg.subtle"
      >
        {icon && <Box color="fg.muted">{icon}</Box>}
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
      </HStack>

      <Box bg="bg" p={{ base: 3, md: 4 }}>
        {children}
      </Box>
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

      <SectionCard title="Basic Information" icon={<User size={14} />}>
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

      <SectionCard title="Document Status" icon={<FileText size={14} />}>
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
