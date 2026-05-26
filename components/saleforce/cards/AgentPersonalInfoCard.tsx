import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import LabelText from "@/components/texts/LabelText";
import { Box, Grid } from "@chakra-ui/react";

interface AgentPersonalInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
}

const PersonalInfo = ({ agent }: AgentPersonalInfoCardProps) => {
  return (
    <>
      {agent ? (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={1}>
          <LabelText label="Place of Birth" value={agent.placeOfBirth} />
          <LabelText label="Date of Birth" value={agent.birthDate} />
          <LabelText label="Gender" value={agent.gender} />
          <LabelText label="Civil Status" value={agent.civilStatus} />
          <LabelText label="Nationality" value={agent.nationality} />
          <LabelText
            label="Naturalization Date"
            value={agent.naturalizationDate ?? "N/A"}
          />
          <LabelText label="Height" value={agent.height ?? "N/A"} />
          <LabelText label="Weight" value={agent.weight ?? "N/A"} />
        </Grid>
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
