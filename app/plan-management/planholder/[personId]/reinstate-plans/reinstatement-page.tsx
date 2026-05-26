import { Box } from "@chakra-ui/react";
import type { CheckedPlan } from "./reinstatement.types";
import { useState } from "react";
import { ReinstatementForm } from "./reinstatement-form";
import { lapsedPlans } from "./data";
import { ReinstatementSummaryPage } from "./ri-summary";
import { FaFileShield } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export function ReinstatementPage({
  onSuccess,
  successLink,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);
  const requestId = "";
  const totalAmountDue = checkedPlans.reduce(
    (sum, plan) => sum + plan.reinstatementFee + plan.reinstatementPayment,
    0,
  );

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
    <Box
      bg={BRAND_COLORS.white}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius={STANDARD_RADIUS.md}
      boxShadow={STANDARD_SHADOWS.level1}
      p={{ base: 4, md: 5 }}
    >
      <FormStepper
        steps={stepsData}
        onSubmit={() => onSuccess("RI-12345", totalAmountDue)}
      />
    </Box>
  );
}
