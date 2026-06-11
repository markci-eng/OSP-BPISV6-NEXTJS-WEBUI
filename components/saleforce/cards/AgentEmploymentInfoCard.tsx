import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Flex } from "@chakra-ui/react";
import { LuBriefcase } from "react-icons/lu";

interface AgentEmploymentInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const EmploymentInfo = ({ agent }: AgentEmploymentInfoCardProps) => {
  if (!agent) return null;
  return (
    <Flex direction="column">
      <RowItem label="Position" value={agent.position ?? "N/A"} />
      <RowItem label="Date Hired" value={agent.hireDate ?? "N/A"} />
      <RowItem label="Employee Status" value={agent.employeeStatus ?? "N/A"} />
      <RowItem label="Branch" value={agent.branch ?? "N/A"} />
      <RowItem label="Supervisor" value={agent.superiorId ?? "N/A"} />
      <RowItem label="SSS No." value={agent.sssNumber ?? "N/A"} />
      <RowItem label="NBI No." value={agent.nbiNumber ?? "N/A"} />
      <RowItem label="TIN No." value={agent.tinNumber ?? "N/A"} />
    </Flex>
  );
};

const AgentEmploymentInfoCard = ({
  agent,
  removeCard,
  isOpen,
  onToggle,
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
    >
      <EmploymentInfo agent={agent} />
    </InfoCardAccordion>
  );
};

export default AgentEmploymentInfoCard;
