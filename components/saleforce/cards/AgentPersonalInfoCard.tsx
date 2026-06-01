import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import LabelText from "@/components/texts/LabelText";
import { Box, Flex, Separator } from "@chakra-ui/react";

interface AgentPersonalInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
}

const PersonalInfo = ({ agent }: AgentPersonalInfoCardProps) => {
  return (
    <>
      {agent ? (
        <Flex direction="column" gap={2}>
          <LabelText label="Place of Birth" value={agent.placeOfBirth} />
          <Separator />
          <LabelText label="Date of Birth" value={agent.birthDate} />
          <Separator />
          <LabelText label="Gender" value={agent.gender} />
          <Separator />
          <LabelText label="Civil Status" value={agent.civilStatus} />
          <Separator />
          <LabelText label="Nationality" value={agent.nationality} />
          <Separator />
          <LabelText
            label="Naturalization Date"
            value={agent.naturalizationDate ?? "N/A"}
          />
          <Separator />
          <LabelText label="Height" value={agent.height ?? "N/A"} />
          <Separator />
          <LabelText label="Weight" value={agent.weight ?? "N/A"} />
        </Flex>
      ) : (
        <EmptyStateCard
          title="No Agent Selected"
          description="Select an agent to view their personal information."
        />
      )}
    </>
  );
};

const PersonalInfoCard = ({ agent }: AgentPersonalInfoCardProps) => {
  return (
    <Card.Root title="Personal">
      <Card.MainContent>
        <Box px={1}>
          <PersonalInfo agent={agent} />
        </Box>
      </Card.MainContent>
    </Card.Root>
  );
};

const AgentPersonalInfoCard = ({
  agent,
  removeCard,
}: AgentPersonalInfoCardProps) => {
  return (
    <>
      {removeCard ? (
        <PersonalInfo agent={agent} />
      ) : (
        <PersonalInfoCard agent={agent} />
      )}
    </>
  );
};

export default AgentPersonalInfoCard;
