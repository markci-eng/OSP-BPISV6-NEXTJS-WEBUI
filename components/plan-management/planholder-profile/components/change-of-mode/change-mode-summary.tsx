"use client";

import { Flex } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";
import type { CheckedPlanType } from "@/app/(bpis)/data/plan-management/change-of-mode/change-mode.types";
import { FieldSummaryCard, SummaryField } from "osp-ui-kit";

interface RevRIProps {
  selectedPlans: CheckedPlanType[] | undefined;
  planholderName?: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChangeModeSummaryPage({
  selectedPlans,
  planholderName = "Juan Dela Cruz",
  onBack,
}: RevRIProps) {
  if (!selectedPlans) return null;

  return (
    <Flex flexDir="column" gap={4} pb={2}>
      {selectedPlans.map((plan, index) => {
        const fields: SummaryField[] = [
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
          <FieldSummaryCard
            key={index}
            title={planholderName}
            subtitle={plan.lpa_no}
            icon={LuUser}
            fields={fields}
            onEdit={onBack}
          />
        );
      })}
    </Flex>
  );
}
