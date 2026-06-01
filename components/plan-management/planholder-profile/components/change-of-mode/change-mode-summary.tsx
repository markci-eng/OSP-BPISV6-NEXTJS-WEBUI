import { Box, Separator } from "@chakra-ui/react";
import type { CheckedPlanType } from "./change-mode.types";
import SummaryForm from "@/components/common/text/SummaryForm";
import SummaryHeader from "@/components/common/text/SummaryHeader";
import LabelText from "@/components/texts/LabelText";
import React from "react";

interface RevRIProps {
  selectedPlans: CheckedPlanType[] | undefined;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChangeModeSummaryPage({ selectedPlans }: RevRIProps) {
  if (!selectedPlans) return;

  return (
    <>
      <SummaryForm title={"Change of Mode Summary"} data={[]} />
      <Box mt={-10}>
        {selectedPlans.map((plan, index) => {
          const items = [
            { label: "New Plan Code", value: plan.new_plan_code },
            { label: "New Mode", value: plan.new_mode },
            {
              label: "Installment Payment",
              value: plan.new_installment_amount.toLocaleString("en-US", {
                style: "currency",
                currency: "PHP",
              }),
            },
            { label: "Change of Mode Fee", value: "PHP 100.00" },
          ];

          return (
            <Box key={index} my={5}>
              <SummaryHeader>{`LPA #: ${plan.lpa_no}`}</SummaryHeader>
              <Box pt={{ base: 3, md: 5 }}>
                {items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <LabelText label={item.label} value={item.value} />
                    {idx < items.length - 1 && (
                      <Box display={{ base: "block", lg: "none" }}>
                        <Separator my={2} />
                      </Box>
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
