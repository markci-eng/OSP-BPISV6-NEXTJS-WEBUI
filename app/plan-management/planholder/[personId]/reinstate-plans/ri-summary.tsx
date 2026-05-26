"use client";
import SummaryBox from "@/components/common/text/SummaryBox";
import SummaryForm from "@/components/common/text/SummaryForm";
import { Box } from "@chakra-ui/react";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

interface CheckedPlan {
  lpaNo: string;
  planType: string;
  isFullyPaid: boolean;
  reinstatementFee: number;
  reinstatementPayment: number;
}

interface RevRIProps {
  selectedPlans: CheckedPlan[];
  onSubmit: () => void;
  onBack: () => void;
}

export function ReinstatementSummaryPage({ selectedPlans }: RevRIProps) {
  const totalRIFee = selectedPlans.reduce(
    (sum, p) => sum + p.reinstatementFee,
    0,
  );
  const totalRIPayment = selectedPlans.reduce(
    (sum, p) => sum + p.reinstatementPayment,
    0,
  );
  const totalDue = totalRIFee + totalRIPayment;

  return (
    <>
      <SummaryForm title={"Reinstatement Summary"} data={[]} />
      <Box mt={{ base: 0, md: -8 }}>
        {selectedPlans.map((plan, index) => (
          <Box key={index} my={{ base: 2, md: 3 }} borderRadius={STANDARD_RADIUS.md}>
            <SummaryBox
              key={index}
              title={`LPA #: ${plan.lpaNo}`}
              data={[
                { label: "Plan Type", value: plan.planType },
                {
                  label: "Is Fully Paid",
                  value: plan.isFullyPaid ? "Yes" : "No",
                },
                { label: "Reinstatement Fee", value: plan.reinstatementFee },
                {
                  label: "Reinstatement Payment",
                  value: plan.reinstatementPayment,
                },
              ]}
            />
          </Box>
        ))}
      </Box>
    </>
  );
}
