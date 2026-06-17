"use client";
import {
  SalesAgent,
  getPositionDesc,
} from "@/components/common/agent-lookup/agent-lookup.type";
import Page from "@/claude components/layout/page/Page";
import Card from "@/components/cards/Card";
import { Flex, Box, Separator, Strong } from "@chakra-ui/react";
import { Body, PrimaryMdButton, Small } from "st-peter-ui";
import { LuPrinter, LuIdCard } from "react-icons/lu";
import { toast } from "sonner";

export default function PrintingPage({ agent }: { agent: SalesAgent }) {
  const handlePrintSfid = () => {
    toast.success(`Printing SFID card for ${agent.name}...`);
  };

  const handlePrintContract = () => {
    toast.success(`Printing contract for ${agent.name}...`);
  };

  return (
    <Page.Root
      title="Reprint SFID"
      description="Reprint the SFID card and contract for this sales agent."
    >
      <Page.MainContent>
        <Flex flexDir="column" gap={4} my={2}>
          <Card.Root title="Agent Information">
            <Card.MainContent>
              <Flex flexDir="column" gap={2}>
                <Box>
                  <Small color="gray.500" display="block">
                    Agent ID
                  </Small>
                  <Strong>{agent.id}</Strong>
                </Box>
                <Separator />
                <Box>
                  <Small color="gray.500" display="block">
                    Full Name
                  </Small>
                  <Strong>{agent.name}</Strong>
                </Box>
                <Separator />
                <Box>
                  <Small color="gray.500" display="block">
                    Position
                  </Small>
                  <Body>{getPositionDesc(agent.position)}</Body>
                </Box>
              </Flex>
            </Card.MainContent>
          </Card.Root>

          <Card.Root title="Print Options">
            <Card.MainContent>
              <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                <PrimaryMdButton onClick={handlePrintSfid}>
                  <LuIdCard /> Print SFID Card
                </PrimaryMdButton>
                <PrimaryMdButton onClick={handlePrintContract}>
                  <LuPrinter /> Print Contract
                </PrimaryMdButton>
              </Flex>
            </Card.MainContent>
          </Card.Root>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}
