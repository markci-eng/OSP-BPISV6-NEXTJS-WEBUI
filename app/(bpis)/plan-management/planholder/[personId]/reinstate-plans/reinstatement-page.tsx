import { Box, Container, Flex, Separator, Steps } from "@chakra-ui/react";
import type { CheckedPlan } from "@/data/plan-management/reinstate-plans/reinstatement.types";
import { Body, H3, NextButton, PreviousButton } from "st-peter-ui";
import { useState } from "react";
import { ReinstatementForm } from "./reinstatement-form";
import { lapsedPlans } from "@/data/plan-management/reinstate-plans/data";
import { ReinstatementSummaryPage } from "./ri-summary";
import PaymentPage from "./payment";
import { FaFileShield } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import FormSteps from "@/components/FormSteps";

const steps = ["Select Lapsed Plan", "Review Reinstatement", "Payment"];

export function ReinstatementPage({
  onSuccess,
  successLink,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const stepsData = [
    {
      title: "Select Lapsed Plan",
      icon: FaFileAlt,
      content: (
        <ReinstatementForm
          lapsedPlans={lapsedPlans}
          onCheckedPlansChange={(selected) => setCheckedPlans(selected)}
        />
      ),
      validateBeforeNext: () => {
        if (checkedPlans.length === 0) {
          alert("Please select at least one plan to reinstate.");
          return false;
        }
        return true;
      },
    },
    {
      title: "Review Reinstatement",
      icon: FaFileShield,
      content: (
        <ReinstatementSummaryPage
          selectedPlans={checkedPlans}
          onSubmit={() => {}}
          onBack={() => {}}
        />
      ),
    },
    // {
    //     title: "Payment",
    //     icon: FaCcMastercard,
    //     content: (<PaymentPage successLink={successLink + requestId}/>)
    // }
  ];

  return (
    <FormSteps
      stepsData={stepsData}
      title={"Reinstatement Application"}
      description={"Quickly bring your plan back on track by reactivating a lapsed plan."}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
    />
  );
}
