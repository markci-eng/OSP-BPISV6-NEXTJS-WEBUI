"use client";

import { Box } from "@chakra-ui/react";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { AgentDetails } from "@/components/saleforce/pages/agent-plan-details";
import AgentDetailsMobile from "@/components/saleforce/pages/agent-plan-details-mobile";

export function AgentProfilePage({ agent }: { agent: SalesAgent }) {
  const { messageBox } = useMessageDialog();

  return (
    <>
      <Box display={{ base: "none", md: "block" }} h="100%">
        <AgentDetails
          selectedAgent={agent}
          onDeleteAgent={() =>
            messageBox({
              title: "Unable to delete agent.",
              message: "Unable to delete agent with active contracts.",
              confirmText: "Dismiss",
              variant: "error",
            })
          }
        />
      </Box>
      <Box display={{ base: "block", md: "none" }} h="100%">
        <AgentDetailsMobile selectedAgent={agent} />
      </Box>
    </>
  );
}
