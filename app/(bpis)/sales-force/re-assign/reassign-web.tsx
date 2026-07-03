"use client";

/**
 * Re-organization Module — a stepped wizard for moving agents under a new
 * receiving superior.
 *
 *   1. Select Receiving Superior
 *   2. Select Agents
 *   3. Review & Confirm  → Submit
 *
 * Both mobile and desktop are driven by the shared FormSteps component
 * (stepper header + sticky action bar). Submitting shows a loading state,
 * then an inline success screen.
 */

import {
  getAllAgents,
  getPosibleSubordinates,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/claude components/FormSteps";
import { Flex } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import React from "react";
import {
  LuLayoutDashboard,
  LuUserRound,
  LuUserRoundCheck,
  LuUsers,
} from "react-icons/lu";
import { toast } from "sonner";

import type { Phase } from "./types";
import { AgentPanel } from "./components/AgentPanel";
import { DestinationBanner } from "./components/DestinationBanner";
import { ReviewPanel } from "./components/ReviewPanel";
import { EmptyState } from "./components/shared";
import { SubmittingScreen } from "./components/SubmittingScreen";
import { SuperiorPanel } from "./components/SuperiorPanel";

/* ─── Main wizard ────────────────────────────────────────────────────────── */

const ReorganizationWizard = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("editing");
  const [superior, setSuperior] = React.useState<SalesAgent | null>(null);
  const [selectedAgents, setSelectedAgents] = React.useState<SalesAgent[]>([]);

  // Any agent can be a receiving superior (previous-version logic).
  const superiorPool = React.useMemo(() => getAllAgents(), []);

  // Movable agents come straight from getPosibleSubordinates (previous-version
  // logic): the strict next rank down, excluding those already reporting in.
  const eligibleAgents = React.useMemo(
    () => getPosibleSubordinates(superior),
    [superior],
  );

  const selectedCount = selectedAgents.length;

  const handleSelectSuperior = (a: SalesAgent) => {
    setSuperior(a);
    setSelectedAgents([]);
  };

  const handleChangeSuperior = () => {
    setSuperior(null);
    setSelectedAgents([]);
  };

  const handleSubmit = () => {
    setPhase("submitting");
    window.setTimeout(() => setPhase("done"), 1400);
  };

  // The same steps feed the FormSteps wizard on both mobile and desktop.
  const stepsData = [
    {
      title: "Receiving Superior",
      icon: LuUserRoundCheck,
      content: (
        <SuperiorPanel
          pool={superiorPool}
          superior={superior}
          onSelect={handleSelectSuperior}
          onChange={handleChangeSuperior}
        />
      ),
      validateBeforeNext: () => {
        if (!superior) {
          toast.error("Select a receiving superior to continue.");
          return false;
        }
        return true;
      },
    },
    {
      title: "Select Agents",
      icon: LuUsers,
      content: (
        <Flex direction="column" gap={4}>
          <DestinationBanner superior={superior} count={selectedCount} />
          <AgentPanel
            superior={superior}
            eligible={eligibleAgents}
            selectedCount={selectedCount}
            onSelectionChange={setSelectedAgents}
          />
        </Flex>
      ),
      validateBeforeNext: () => {
        if (selectedCount === 0) {
          toast.error("Select at least one agent to continue.");
          return false;
        }
        return true;
      },
    },
    {
      title: "Review & Confirm",
      icon: LuLayoutDashboard,
      content: (
        <Flex direction="column" gap={4}>
          <DestinationBanner superior={superior} count={selectedCount} />
          {superior ? (
            <ReviewPanel superior={superior} agents={selectedAgents} />
          ) : (
            <EmptyState icon={<LuUserRound size={30} />}>
              Go back and select a receiving superior first.
            </EmptyState>
          )}
        </Flex>
      ),
    },
  ];

  /* Submitting / success take over the whole surface. */
  if (phase !== "editing") {
    if (phase !== "submitting") {
      redirect(`${window.location.href}/success`);
    }
    return (
      <Page.Root
        headerButton="menu"
        title="Re-organization"
        description="Move agents to a new receiving superior."
      >
        <Page.MainContent>
          <SubmittingScreen />
        </Page.MainContent>
      </Page.Root>
    );
  }

  return (
    <Page.Root
      headerButton="menu"
      title="Re-organization"
      description="Move agents to a new receiving superior."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={handleSubmit}
          submitButtonText="Submit Reorganization"
        />
      </Page.MainContent>
    </Page.Root>
  );
};

export default ReorganizationWizard;
