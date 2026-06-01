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

  return (
    <>
      <Box display={{ base: "none", md: "block" }} h="100%">
        <AgentDetails selectedAgent={agent} />
      </Box>

      <Box display={{ base: "block", md: "none" }} h="100%">
        <AgentDetailsMobile selectedAgent={agent} />
      </Box>
    </>
  );
};

export default SalesAgentProfileWithIdParams;
