"use client";

import { Box, Flex, Grid } from "@chakra-ui/react";
import { Body, PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { LuArrowRight, LuTriangleAlert } from "react-icons/lu";
import { useMemo, useState } from "react";
import {
  getAgentById,
  getPositionDesc,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import SuperiorLookup from "../pickers/superior-lookup";
import RequestSubmittedDialog from "../dialogs/request-submitted-dialog";
import Card from "@/components/cards/Card";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import SectionTitle from "@/components/texts/SectionTitle";

interface AgentReassignFormProps {
  selectedAgent: SalesAgent;
  onCancel: () => void;
  onSubmitted?: () => void;
  hideActions?: boolean;
}

export function AgentReassignForm({
  selectedAgent,
  onCancel,
  onSubmitted,
  hideActions,
}: AgentReassignFormProps) {
  const [newSuperior, setNewSuperior] = useState<SalesAgent | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [txnId, setTxnId] = useState<string>("");

  const currentSuperior = useMemo(
    () =>
      selectedAgent.superiorId
        ? (getAgentById(selectedAgent.superiorId) ?? null)
        : null,
    [selectedAgent.superiorId],
  );

  const isSame =
    newSuperior != null &&
    currentSuperior != null &&
    newSuperior.id === currentSuperior.id;

  const canSubmit = newSuperior != null && !isSame;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = `RA-${Date.now().toString().slice(-7)}`;
    setTxnId(id);
    setSuccessOpen(true);
  };

  return (
    <Box my={2}>
      <Flex
        direction="column"
        gap={2}
        mb={{
          base: 2,
          md: 4,
        }}
      >
        <Flex align="center" gap={2}>
          <FormTitle label={"Re-Organized Agent"} />
        </Flex>

        <Caption>
          Assign a new superior for this sales agent. The request will be
          submitted for approval.
        </Caption>
      </Flex>

      <Flex gap={6} alignItems="start" direction="column">
        {/* LEFT — agent + current superior details */}
        <AgentProfileHeaderCard agent={selectedAgent} />

        {/* RIGHT — the form */}
        <Card.Root>
          <Card.MainContent>
            <Flex direction="column" gap={6}>
              <Flex
                direction="column"
                gap={{
                  base: 2,
                }}
              >
                <Flex flexDir="column">
                  <SectionTitle>Select New Superior</SectionTitle>

                  <Caption>
                    Search and pick a superior who ranks one level above this
                    agent.
                  </Caption>
                </Flex>

                <SuperiorLookup
                  currentAgent={selectedAgent}
                  value={newSuperior}
                  onSelect={setNewSuperior}
                />
              </Flex>

              {isSame ? (
                <Flex
                  gap={2}
                  align="center"
                  p={3}
                  bg="yellow.50"
                  borderWidth={1}
                  borderColor="yellow.200"
                  borderRadius="md"
                  color="yellow.700"
                >
                  <LuTriangleAlert />
                  <Body>
                    The selected superior is the same as the current one. Pick a
                    different one.
                  </Body>
                </Flex>
              ) : null}

              <Box
                borderWidth={1}
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
                p={4}
              >
                <Body fontWeight="bold" color="gray.500" letterSpacing="wide">
                  SUMMARY
                </Body>

                <Grid
                  mt={3}
                  templateColumns={{
                    base: "1fr",
                    sm: "1fr auto 1fr",
                  }}
                  gap={{
                    base: 2,
                    md: 3,
                  }}
                  alignItems="center"
                >
                  <SummaryEndpoint
                    label="From"
                    name={
                      currentSuperior ? currentSuperior.name : "No superior"
                    }
                    sub={
                      currentSuperior
                        ? `${getPositionDesc(currentSuperior.position)} · ${currentSuperior.id}`
                        : "Not assigned"
                    }
                    tone="muted"
                  />
                  <Box
                    display={{ base: "none", sm: "flex" }}
                    color="gray.400"
                    justifyContent="center"
                  >
                    <LuArrowRight size={20} />
                  </Box>
                  <SummaryEndpoint
                    label="To"
                    name={newSuperior?.name ?? "Not selected"}
                    sub={
                      newSuperior
                        ? `${getPositionDesc(newSuperior.position)} · ${newSuperior.id}`
                        : "Pick a superior above"
                    }
                    tone={newSuperior && !isSame ? "primary" : "muted"}
                  />
                </Grid>
              </Box>

              {hideActions ? null : (
                <Flex justify="flex-end" gap={2}>
                  <SecondaryMdButton onClick={onCancel}>
                    Cancel
                  </SecondaryMdButton>
                  <PrimaryMdButton onClick={handleSubmit} disabled={!canSubmit}>
                    Submit
                  </PrimaryMdButton>
                </Flex>
              )}
            </Flex>
          </Card.MainContent>
        </Card.Root>
      </Flex>

      <RequestSubmittedDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Re-Organization Requested"
        description={`The re-organization of ${selectedAgent.name} to ${
          newSuperior?.name ?? ""
        } has been submitted and is subject to approval.`}
        transactionId={txnId}
        onConfirm={() => {
          onSubmitted?.();
        }}
      />
    </Box>
  );
}

const SummaryEndpoint = ({
  label,
  name,
  sub,
  tone,
}: {
  label: string;
  name: string;
  sub: string;
  tone: "muted" | "primary";
}) => {
  const isPrimary = tone === "primary";
  return (
    <Box minW={0}>
      <Body color="gray.500" letterSpacing="wide">
        {label.toUpperCase()}
      </Body>

      <Body
        fontWeight="bold"
        color={isPrimary ? "var(--chakra-colors-primary)" : "gray.700"}
        truncate
      >
        {name}
      </Body>

      <Body color="gray.500">{sub}</Body>
    </Box>
  );
};

export default AgentReassignForm;
