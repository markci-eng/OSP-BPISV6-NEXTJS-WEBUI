"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { Breadcrumb } from "st-peter-ui";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { AgentDetails } from "@/components/saleforce/pages/agent-plan-details";
import AgentDetailsMobile from "@/components/saleforce/pages/agent-plan-details-mobile";

export const SalesForcePage = () => {
  const [selectedAgent, setSelectedAgent] = React.useState<
    SalesAgent | undefined
  >(undefined);

  return (
    <>
      <Box display={{ base: "none", md: "block" }} h="100%">
        <AgentDetails
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }} h="100%">
        <AgentDetailsMobile
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
        />
      </Box>
    </>
  );
};

export default SalesForcePage;
