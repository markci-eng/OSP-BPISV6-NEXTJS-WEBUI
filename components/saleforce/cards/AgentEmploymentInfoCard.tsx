import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import LabelText from "@/components/texts/LabelText";
import { Box, Flex, Separator } from "@chakra-ui/react";

interface AgentEmploymentInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
}

interface Agent {
  value: SalesAgent | undefined | null;
}

const InfoDetail = ({ value }: Agent) => {
  return (
    <>
      {value ? (
        <Flex direction="column" gap={2}>
          <LabelText label="Position" value={value?.position ?? "N/A"} />
          <Separator />
          <LabelText label="Date Hired" value={value?.hireDate ?? "N/A"} />
          <Separator />
          <LabelText label="Employee Status" value={value?.employeeStatus ?? "N/A"} />
          <Separator />
          <LabelText label="Branch" value={value?.branch ?? "N/A"} />
          <Separator />
          <LabelText label="Supervisor" value={value?.superiorId ?? "N/A"} />
          <Separator />
          <LabelText label="SSS No." value={value?.sssNumber ?? "N/A"} />
          <Separator />
          <LabelText label="NBI No." value={value?.nbiNumber ?? "N/A"} />
          <Separator />
          <LabelText label="TIN No." value={value?.tinNumber ?? "N/A"} />
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

const InfoDetailInCard = ({ value }: Agent) => {
  return (
    <Card.Root title="Employment">
      <Card.MainContent>
        <Box px={1}>
          <InfoDetail value={value} />
        </Box>
      </Card.MainContent>
    </Card.Root>
  );
};

const AgentEmploymentInfoCard = ({
  agent,
  removeCard,
}: AgentEmploymentInfoCardProps) => {
  return (
    <>
      {removeCard ? (
        <InfoDetail value={agent} />
      ) : (
        <InfoDetailInCard value={agent} />
      )}
    </>
  );
};

export default AgentEmploymentInfoCard;
