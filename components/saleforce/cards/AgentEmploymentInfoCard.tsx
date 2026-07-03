import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import InfoItem from "@/components/common/info-item/info-item";
import { Badge, Box, Flex, Grid, Strong } from "@chakra-ui/react";
import { LuBriefcase } from "react-icons/lu";

interface AgentEmploymentInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  h?: string | Record<string, string>;
}

const statusColorPalette: Record<SalesAgent["employeeStatus"], string> = {
  Active: "green",
  Inactive: "orange",
  Resigned: "red",
};

const EmployeeStatusBadge = ({
  status,
}: {
  status: SalesAgent["employeeStatus"];
}) => (
  <Badge
    colorPalette={statusColorPalette[status] ?? "gray"}
    variant="subtle"
    borderRadius="full"
    px={3}
    py={1}
    gap={2}
  >
    <Box boxSize={2} borderRadius="full" bg="colorPalette.solid" />
    {status}
  </Badge>
);

const EmploymentInfo = ({ agent }: AgentEmploymentInfoCardProps) => {
  if (!agent) return null;
  return (
    <>
      {/* Mobile / tablet: stacked rows */}
      <Flex direction="column" hideFrom="lg">
        <RowItem label="Position" value={agent.position ?? "N/A"} />
        <RowItem label="Employer" value={agent.employer ?? "N/A"} />
        <RowItem label="Date Hired" value={agent.hireDate ?? "N/A"} />
        <RowItem label="Employee Status" value={agent.employeeStatus ?? "N/A"} />
        <RowItem label="Branch" value={agent.branch ?? "N/A"} />
        <RowItem label="Supervisor" value={agent.superiorId ?? "N/A"} />
        <RowItem label="SSS No." value={agent.sssNumber ?? "N/A"} />
        <RowItem label="NBI No." value={agent.nbiNumber ?? "N/A"} />
        <RowItem label="TIN No." value={agent.tinNumber ?? "N/A"} />
      </Flex>

      {/* Desktop: employee status badge header + 2-column grid */}
      <Box hideBelow="lg" padding={4}>
        <Flex align="center" justify="space-between" mb={4}>
          <Strong color="gray.700">Employee Status</Strong>
          <EmployeeStatusBadge status={agent.employeeStatus} />
        </Flex>
        <Grid templateColumns="repeat(2, 1fr)" gapX={2} gapY={4}>
          <InfoItem label="Position" value={agent.position} />
          <InfoItem label="Employer" value={agent.employer} />
          <InfoItem label="Date Hired" value={agent.hireDate} />
          <InfoItem label="Branch" value={agent.branch} />
          <InfoItem label="Supervisor" value={agent.superiorId ?? "N/A"} />
          <InfoItem label="SSS No." value={agent.sssNumber} />
          <InfoItem label="NBI No." value={agent.nbiNumber} />
          <InfoItem label="TIN No." value={agent.tinNumber} />
        </Grid>
      </Box>
    </>
  );
};

const AgentEmploymentInfoCard = ({
  agent,
  removeCard,
  isOpen,
  onToggle,
  h,
}: AgentEmploymentInfoCardProps) => {
  if (removeCard) {
    return <EmploymentInfo agent={agent} />;
  }
  return (
    <InfoCardAccordion
      icon={<LuBriefcase />}
      title="Employment Information"
      subtitle="Employment Information"
      isOpen={isOpen}
      onToggle={onToggle}
      h={h}
    >
      <EmploymentInfo agent={agent} />
    </InfoCardAccordion>
  );
};

export default AgentEmploymentInfoCard;
