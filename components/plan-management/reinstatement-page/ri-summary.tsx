"use client";
import { GrandSummary, SummaryItems, SummarySection } from "@splpi/summary";
import { LuClipboardCheck } from "react-icons/lu";

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

  const summaryItems = (): SummaryItems[] => {
    return selectedPlans.flatMap((item) => [
      { label: "LPA Number", value: item.lpaNo },
      { label: "Plan Type", value: item.planType },
      {
        label: "Reinstatement Payment",
        value: item.reinstatementPayment,
        type: "currency",
      },
      {
        label: "Reinstatement Fee",
        value: item.reinstatementFee,
        type: "currency",
      },
      { label: "Fully Paid", value: item.isFullyPaid, type: "boolean" },
    ]);
  };

  return (
    <SummarySection
      columns={5}
      items={summaryItems()}
      icon={<LuClipboardCheck />}
      title={"Reinstatement Summary"}
      grandSummary={
        <GrandSummary
          label={"Total Amount Payable"}
          value={totalDue}
          type="currency"
        />
      }
    />
  );
}
