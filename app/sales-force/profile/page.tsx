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
    },
  ];

  return (
    <>
      <Box display={{ base: "none", md: "block" }}>
        <AgentDetails
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
          breadItem={breadItem}
        />
      </Box>

      <Box display={{ base: "block", md: "none" }}>
        <AgentDetailsMobile
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
          breadItem={breadItem}
        />
      </Box>
    </>
  );
};

export default SalesForcePage;
