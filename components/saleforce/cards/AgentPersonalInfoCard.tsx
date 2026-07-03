import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import InfoItem from "@/components/common/info-item/info-item";
import { Box, Flex, Grid, Separator, Strong } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";

interface AgentPersonalInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  h?: string | Record<string, string>;
}

const PersonalInfo = ({ agent }: AgentPersonalInfoCardProps) => {
  if (!agent) return null;
  return (
    <>
      {/* Mobile / tablet: stacked rows */}
      <Flex direction="column" hideFrom="lg">
        <RowItem label="Place of Birth" value={agent.placeOfBirth} />
        <RowItem label="Date of Birth" value={agent.birthDate} />
        <RowItem label="Gender" value={agent.gender} />
        <RowItem label="Civil Status" value={agent.civilStatus} />
        <RowItem label="Nationality" value={agent.nationality} />
        <RowItem
          label="Naturalization Date"
          value={agent.naturalizationDate ?? "N/A"}
        />
        <RowItem label="Height" value={agent.height ?? "N/A"} />
        <RowItem label="Weight" value={agent.weight ?? "N/A"} />
      </Flex>

      {/* Desktop: 4-column grid grouped by section */}
      <Box hideBelow="lg">
        <Grid templateColumns="repeat(4, 1fr)" gapX={2} gapY={4} padding={4}>
          <InfoItem label="Place of Birth" value={agent.placeOfBirth} />
          <InfoItem label="Date of Birth" value={agent.birthDate} />
          <InfoItem label="Nationality" value={agent.nationality} />
          <InfoItem
            label="Naturalization Date"
            value={agent.naturalizationDate ?? "N/A"}
          />
          <InfoItem label="Gender" value={agent.gender} />
          <InfoItem label="Civil Status" value={agent.civilStatus} />
          <InfoItem label="Height" value={agent.height ?? "N/A"} />
          <InfoItem label="Weight" value={agent.weight ?? "N/A"} />
        </Grid>
      </Box>
    </>
  );
};

const AgentPersonalInfoCard = ({
  agent,
  removeCard,
  isOpen,
  onToggle,
  h,
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
      h={h}
    >
      <PersonalInfo agent={agent} />
    </InfoCardAccordion>
  );
};

export default AgentPersonalInfoCard;
