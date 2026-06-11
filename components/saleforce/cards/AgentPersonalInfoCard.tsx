import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Flex } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";

interface AgentPersonalInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const PersonalInfo = ({ agent }: AgentPersonalInfoCardProps) => {
  if (!agent) return null;
  return (
    <Flex direction="column">
      <RowItem label="Place of Birth" value={agent.placeOfBirth} />
      <RowItem label="Date of Birth" value={agent.birthDate} />
      <RowItem label="Gender" value={agent.gender} />
      <RowItem label="Civil Status" value={agent.civilStatus} />
      <RowItem label="Nationality" value={agent.nationality} />
      <RowItem label="Naturalization Date" value={agent.naturalizationDate ?? "N/A"} />
      <RowItem label="Height" value={agent.height ?? "N/A"} />
      <RowItem label="Weight" value={agent.weight ?? "N/A"} />
    </Flex>
  );
};

const AgentPersonalInfoCard = ({
  agent,
  removeCard,
  isOpen,
  onToggle,
}: AgentPersonalInfoCardProps) => {
  if (removeCard) {
    return <PersonalInfo agent={agent} />;
  }
  return (
    <InfoCardAccordion
      icon={<LuUser />}
      title="Personal Information"
      subtitle="Personal Information"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <PersonalInfo agent={agent} />
    </InfoCardAccordion>
  );
};

export default AgentPersonalInfoCard;
