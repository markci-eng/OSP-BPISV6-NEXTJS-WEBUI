"use client";

import * as React from "react";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { X } from "lucide-react";

import { type Agent, type DocumentRecord, expState, fmt } from "../data";
import { AgentAvatar } from "./atoms";

type Props = {
  agent: Agent;
  documents: DocumentRecord[];
  onClear: () => void;
};

function Stat({
  label,
  value,
  tone = "fg",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <VStack
      align="start"
      gap={0.5}
      px={5}
      borderLeftWidth="1px"
      borderColor="border.muted"
    >
      <Text fontSize="xl" fontWeight="700" fontFamily="mono" color={tone} lineHeight="1.1">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.muted" fontWeight="medium">
        {label}
      </Text>
    </VStack>
  );
}

export default function AgentSummaryCard({ agent, documents, onClear }: Props) {
  const docs = documents.filter((d) => d.agentId === agent.id);
  const totalRemaining = docs.reduce((s, d) => s + d.remaining, 0);
  const near = docs.filter((d) => expState(d.expiry) === "near").length;
  const blocked = docs.filter((d) => d.status === "Blocked").length;

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="xl"
      px={5}
      py={4}
      shadow="xs"
    >
      <HStack gap={5} flexWrap="wrap" align="center">
        <HStack gap={3.5} pr={2}>
          <AgentAvatar agent={agent} size={48} />
          <Box>
            <Text fontSize="md" fontWeight="700" color="fg">
              {agent.name}
            </Text>
            <HStack fontSize="xs" color="fg.muted" gap={2}>
              <Text fontFamily="mono">{agent.emp}</Text>
              <Box w="3px" h="3px" borderRadius="full" bg="border.emphasized" />
              <Text>{agent.branch}</Text>
            </HStack>
          </Box>
        </HStack>

        <HStack flexWrap="wrap" rowGap={3} ml="auto">
          <Stat label="Assigned Docs" value={fmt(docs.length)} />
          <Stat label="Remaining Qty" value={fmt(totalRemaining)} />
          <Stat
            label="Near Expiry"
            value={fmt(near)}
            tone={near > 0 ? "orange.600" : "fg"}
          />
          <Stat
            label="Blocked"
            value={fmt(blocked)}
            tone={blocked > 0 ? "red.600" : "fg"}
          />
        </HStack>

        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={15} /> Clear agent
        </Button>
      </HStack>
    </Box>
  );
}
