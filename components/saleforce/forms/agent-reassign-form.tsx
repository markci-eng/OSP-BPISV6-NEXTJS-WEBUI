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
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import SectionTitle from "@/components/texts/SectionTitle";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_LAYOUT } from "@/lib/theme/layout-tokens";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

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
          base: 3,
          md: 4,
        }}
      >
        <FormTitle label="Re-Organized Agent" />
        <Caption value="Assign a new superior for this sales agent. The request will be submitted for approval." />
      </Flex>

      <Flex
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
        alignItems="stretch"
        direction="column"
      >
        <AgentProfileHeaderCard agent={selectedAgent} />

        <ProfileSectionCard
          title="Select New Superior"
          description="Search and pick a superior who ranks one level above this agent."
        >
          <Flex direction="column" gap={{ base: 4, md: 6 }}>
            <SuperiorLookup
              currentAgent={selectedAgent}
              value={newSuperior}
              onSelect={setNewSuperior}
            />

            {isSame ? (
              <Flex
                gap={2}
                align="center"
                p={3}
                bg={BRAND_COLORS.warningBg}
                borderWidth={1}
                borderColor={BRAND_COLORS.warningBorder}
                borderRadius={STANDARD_RADIUS.md}
                color={BRAND_COLORS.warningText}
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
              borderColor={BRAND_COLORS.neutralBorder}
              borderRadius={STANDARD_RADIUS.md}
              bg={BRAND_COLORS.subtleBg}
              p={{ base: 3, md: 4 }}
            >
              <SectionTitle>Summary</SectionTitle>

              <Grid
                mt={3}
                templateColumns={{
                  base: "1fr",
                  sm: "1fr auto 1fr",
                }}
                gap={{
                  base: 3,
                  md: 4,
                }}
                alignItems="center"
              >
                <SummaryEndpoint
                  label="From"
                  name={currentSuperior ? currentSuperior.name : "No superior"}
                  sub={
                    currentSuperior
                      ? `${getPositionDesc(currentSuperior.position)} - ${
                          currentSuperior.id
                        }`
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
                      ? `${getPositionDesc(newSuperior.position)} - ${
                          newSuperior.id
                        }`
                      : "Pick a superior above"
                  }
                  tone={newSuperior && !isSame ? "primary" : "muted"}
                />
              </Grid>
            </Box>

            {hideActions ? null : (
              <Flex
                justify={{ base: "stretch", md: "flex-end" }}
                direction={{ base: "column", sm: "row" }}
                gap={2}
              >
                <SecondaryMdButton onClick={onCancel}>Cancel</SecondaryMdButton>
                <PrimaryMdButton onClick={handleSubmit} disabled={!canSubmit}>
                  Submit
                </PrimaryMdButton>
              </Flex>
            )}
          </Flex>
        </ProfileSectionCard>
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
        color={isPrimary ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralText}
        truncate
      >
        {name}
      </Body>

      <Body color="gray.500">{sub}</Body>
    </Box>
  );
};

export default AgentReassignForm;
