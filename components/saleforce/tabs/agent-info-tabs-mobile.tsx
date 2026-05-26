import { Box, Flex, Grid, Separator, Strong, Tabs } from "@chakra-ui/react";
import { LuNotebook, LuUser } from "react-icons/lu";
import {
  getAgentNameById,
  getPositionDesc,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import LabelText from "@/components/texts/LabelText";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import AgentEmploymentInfoCard from "../cards/AgentEmploymentInfoCard";
import SectionTitle from "@/components/texts/SectionTitle";
import AgentPersonalInfoCard from "../cards/AgentPersonalInfoCard";
import AgentContactInfoCard from "../cards/AgentContactInfoCard";

interface AgentInfoTabsMobileProps {
  agent?: SalesAgent;
}

const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const titleCase = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "—";

const buildResidentialAddress = (agent?: SalesAgent): string => {
  if (!agent) return "—";
  const a = agent.address;
  return [a.unit, a.street, a.barangay, a.city, a.province, a.zipCode]
    .filter(Boolean)
    .join(", ");
};

const AgentInfoTabsMobile = ({ agent }: AgentInfoTabsMobileProps) => {
  return (
    <Tabs.Root defaultValue="personal-info" variant="enclosed">
      <Flex justify="center" align="center">
        <Tabs.List bg="#f8f8ff">
          <Tabs.Trigger
            value="personal-info"
            color="var(--chakra-colors-primary)"
          >
            <LuUser /> Personal
          </Tabs.Trigger>

          <Tabs.Trigger
            value="contact-address-info"
            color="var(--chakra-colors-primary)"
          >
            <LuNotebook /> Contact & Address
          </Tabs.Trigger>
        </Tabs.List>
      </Flex>

      <Tabs.Content value="personal-info">
        {agent ? (
          <>
            <Box p={1}>
              <SectionTitle>Demographic</SectionTitle>
              <Box p={1}>
                <AgentPersonalInfoCard removeCard agent={agent} />
              </Box>
            </Box>

            <Separator marginY={1} />

            <Box p={1}>
              <SectionTitle>Employment</SectionTitle>
              <Box p={1}>
                <AgentEmploymentInfoCard removeCard agent={agent} />
              </Box>
            </Box>
          </>
        ) : (
          <>
            <EmptyStateCard
              title="No Selected Agent"
              description="Please select an Agent"
            ></EmptyStateCard>
          </>
        )}
      </Tabs.Content>

      <Tabs.Content value="contact-address-info">
        {agent ? (
          <>
            <AgentContactInfoCard removeCard agent={agent} />
          </>
        ) : (
          <>
            <EmptyStateCard
              title="No Selected Agent"
              description="Please select an Agent"
            ></EmptyStateCard>
          </>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AgentInfoTabsMobile;
