import { Box, Separator } from "@chakra-ui/react";
import type { CheckedPlanType } from "./change-mode.types";
import SummaryForm from "@/components/common/text/SummaryForm";
import SummaryHeader from "@/components/common/text/SummaryHeader";
import LabelText from "@/components/texts/LabelText";
import React from "react";
import InfoCard from "@/claude components/info-card/info-card";
import { Card } from "@/claude components/card-accordion/card";
import { LuUser } from "react-icons/lu";
import { RowItem } from "@/claude components/info-card/row-item";
import { PrimaryMdFlexButton } from "st-peter-ui";

interface RevRIProps {
  selectedPlans: CheckedPlanType[] | undefined;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChangeModeSummaryPage({ selectedPlans, onSubmit }: RevRIProps) {
  if (!selectedPlans) return;

  return (
    <>
      <Box mt={-10}>
        {selectedPlans.map((plan, index) => {
          const items = [
            // { label: "LPA Number", value: plan.lpa_no },
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
              <Card
                activeIcon={<LuUser />}
                title={"Change of Mode Summary"}
                subtitle={"LPA #: " + plan.lpa_no}
              >
                {items.map((item) => (
                  <RowItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Card>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
