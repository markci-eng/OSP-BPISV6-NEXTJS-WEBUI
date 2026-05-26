import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import InfoItem from "@/components/common/info-item/info-item";
import LabelText from "@/components/texts/LabelText";
import { salesAgents } from "@/data/saleforce/sales-agent-data";
import { Box, CardDescription, Grid } from "@chakra-ui/react";

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
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={1}>
          <LabelText label="Position" value={value?.position ?? "N/A"} />
          <LabelText label="Date Hired" value={value?.hireDate ?? "N/A"} />
          <LabelText
            label="Employee Status"
            value={value?.employeeStatus ?? "N/A"}
          />
          <LabelText label="Branch" value={value?.branch ?? "N/A"} />
          <LabelText label="Supervisor" value={value?.superiorId ?? "N/A"} />
          <LabelText label="SSS No." value={value?.sssNumber ?? "N/A"} />
          <LabelText label="NBI No." value={value?.nbiNumber ?? "N/A"} />
          <LabelText label="TIN No." value={value?.tinNumber ?? "N/A"} />
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
