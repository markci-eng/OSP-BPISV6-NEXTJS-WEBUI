"use client";

import { Box, createListCollection, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Body,
  H4,
  PrimaryMdButton,
  SecondaryMdButton,
  SelectFloatingLabel,
  Small,
} from "st-peter-ui";
import {
  LuArrowRight,
  LuMoveDown,
  LuMoveRight,
  LuMoveUp,
  LuTrendingUpDown,
  LuTriangleAlert,
} from "react-icons/lu";
import { useMemo, useState } from "react";
import {
  getPositionDesc,
  Position,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import RequestSubmittedDialog from "../dialogs/request-submitted-dialog";
import Card from "@/components/cards/Card";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import FormTitle from "@/components/texts/FormTitle";
import SectionTitle from "@/components/texts/SectionTitle";
import Caption from "@/components/texts/Caption";

interface AgentMovementFormProps {
  selectedAgent: SalesAgent;
  onCancel: () => void;
  onSubmitted?: () => void;
  hideActions?: boolean;
}

// Mirror of hierarchy in agent-lookup.type.ts (lower index = higher rank).
const hierarchy: Position[] = ["RM", "BM", "STL", "SA2", "SA1"];

type MovementType = "Promotion" | "Demotion" | "Lateral";

const getMovementType = (from: Position, to: Position): MovementType | null => {
  if (from === to) return null;
  const fromRank = hierarchy.indexOf(from);
  const toRank = hierarchy.indexOf(to);
  if (toRank < fromRank) return "Promotion";
  if (toRank > fromRank) return "Demotion";
  return "Lateral";
};

const movementColor = (type: MovementType | null) => {
  switch (type) {
    case "Promotion":
      return "green";
    case "Demotion":
      return "red";
    case "Lateral":
      return "blue";
    default:
      return "gray";
  }
};

const movementIcon = (type: MovementType | null) => {
  switch (type) {
    case "Promotion":
      return <LuMoveUp />;
    case "Demotion":
      return <LuMoveDown />;
    case "Lateral":
      return <LuMoveRight />;
    default:
      return <LuTrendingUpDown />;
  }
};

export function AgentMovementForm({
  selectedAgent,
  onCancel,
  onSubmitted,
  hideActions,
}: AgentMovementFormProps) {
  const [newPosition, setNewPosition] = useState<Position | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [txnId, setTxnId] = useState<string>("");

  const positionCollection = useMemo(
    () =>
      createListCollection({
        items: hierarchy.map((p) => ({
          label: `${getPositionDesc(p)} (${p})`,
          value: p,
          disabled: p === selectedAgent.position,
        })),
      }),
    [selectedAgent.position],
  );

  const movementType = newPosition
    ? getMovementType(selectedAgent.position, newPosition)
    : null;

  const isSame = newPosition != null && newPosition === selectedAgent.position;
  const canSubmit = newPosition != null && !isSame;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = `MV-${Date.now().toString().slice(-7)}`;
    setTxnId(id);
    setSuccessOpen(true);
  };

  return (
    <Box my={2}>
      <Flex direction="column" gap={1} mb={4}>
        <Flex align="center" gap={2}>
          <FormTitle label="Agent Movement" />
        </Flex>
        <Caption
          value="Submit a promotion, demotion, or lateral movement request for this
          sales agent. The request will be subject to approval."
        />
      </Flex>

      <Flex gap={6} alignItems="start" direction="column">
        <AgentProfileHeaderCard agent={selectedAgent} />

        <Card.Root>
          <Card.MainContent>
            <Flex direction="column" gap={6}>
              <Flex direction="column" gap={2}>
                <SectionTitle>Select New Position</SectionTitle>
                <Caption
                  value="Pick a target position. The system will determine whether the
                  movement is a promotion or a demotion."
                />

                <Box w={{ base: "full", sm: "320px" }}>
                  <SelectFloatingLabel
                    label="New Position"
                    collection={positionCollection}
                    onValueChanged={(vals) => {
                      const v = vals?.[0] as Position | undefined;
                      setNewPosition(v ?? null);
                    }}
                  />
                </Box>
              </Flex>

              {movementType ? (
                <Flex
                  gap={2}
                  align="center"
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  bg={`${movementColor(movementType)}.50`}
                  borderColor={`${movementColor(movementType)}.200`}
                  color={`${movementColor(movementType)}.700`}
                >
                  {movementIcon(movementType)}
                  <Body>
                    This movement will be recorded as a{" "}
                    <Body as="span" fontWeight="bold">
                      {movementType}
                    </Body>
                    .
                  </Body>
                </Flex>
              ) : null}

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
                    The selected position is the same as the current one. Pick a
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
                  templateColumns={{ base: "1fr", sm: "1fr auto 1fr" }}
                  gap={3}
                  alignItems="center"
                >
                  <SummaryEndpoint
                    label="From"
                    name={getPositionDesc(selectedAgent.position)}
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
                    name={
                      newPosition
                        ? getPositionDesc(newPosition)
                        : "Not selected"
                    }
                    tone={newPosition && !isSame ? "primary" : "muted"}
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
        title="Movement Requested"
        description={`The ${
          movementType?.toLowerCase() ?? "movement"
        } of ${selectedAgent.name} to ${
          newPosition ? getPositionDesc(newPosition) : ""
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
  tone,
}: {
  label: string;
  name: string;
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
    </Box>
  );
};

export default AgentMovementForm;
