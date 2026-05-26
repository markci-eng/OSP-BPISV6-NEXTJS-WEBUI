import { getAgentById } from "@/components/common/agent-lookup/agent-lookup.type";
import { AgentDetails } from "@/components/saleforce/pages/agent-plan-details";
import AgentDetailsMobile from "@/components/saleforce/pages/agent-plan-details-mobile";
import { Box } from "@chakra-ui/react";
import { Breadcrumb } from "st-peter-ui";

const SalesAgentProfileWithIdParams = async ({
  params,
}: {
  params: Promise<{ saleforceId: string }>;
}) => {
  const { saleforceId } = await params;
  const agent = getAgentById(saleforceId);

  const breadItem = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Sale Agent Management",
      href: "",
    },
    {
      label: "Sales Agent Profile",
      href: "/sales-force/profile",
    },
    {
      label: agent ? agent.name : "Agent Not Found",
    },
  ];
  return (
    <>
      <Box display={{ base: "none", md: "block" }}>
        <AgentDetails selectedAgent={agent} breadItem={breadItem} />
      </Box>

      <Box display={{ base: "block", md: "none" }}>
        <AgentDetailsMobile selectedAgent={agent} breadItem={[]} />
      </Box>
    </>
  );
};

export default SalesAgentProfileWithIdParams;
