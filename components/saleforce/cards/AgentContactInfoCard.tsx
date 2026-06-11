import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Flex } from "@chakra-ui/react";
import { LuPhone } from "react-icons/lu";

interface AgentContactInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ContactInfo = ({ agent }: AgentContactInfoCardProps) => {
  if (!agent) return null;
  return (
    <Flex direction="column">
      <RowItem label="Email" value={agent.email} />
      <RowItem label="Mobile Number" value={agent.mobile} />
      <RowItem label="Landline Number" value={agent.landline} />
    </Flex>
  );
};

const AgentContactInfoCard = ({
  agent,
  removeCard,
  isOpen,
  onToggle,
}: AgentContactInfoCardProps) => {
  if (removeCard) {
    return <ContactInfo agent={agent} />;
  }
  return (
    <InfoCardAccordion
      icon={<LuPhone />}
      title="Contact Information"
      subtitle="Contact Information"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <ContactInfo agent={agent} />
    </InfoCardAccordion>
  );
};

export default AgentContactInfoCard;
