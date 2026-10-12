"use client";

import { useRouter } from "next/navigation";
import { Page, useMessageDialog } from "osp-ui-kit";
import { PHPlans, PlanTypes } from "@/app/(bpis)/data/plan-management/change-of-mode/data";
import {
  ChangeOfModeTable,
  type ModePlan,
} from "@/app/(bpis)/plan-management/planholder/[personId]/change-of-mode/components/change-of-mode-table";

// The signed-in planholder's plans. The mock carries each plan's code and
// installment amount, so the mode dialog prices changes without a lookup.
const PLANS: ModePlan[] = PHPlans.map((plan) => ({
  lpaNo: plan.lpa_no,
  planDescription: plan.plan_type.toUpperCase(),
  mode: plan.mode.toUpperCase(),
  term: String(
    PlanTypes.find((t) => t.plan_code === plan.plan_code)?.term ?? 5,
  ),
  instNo: plan.installment_no,
  totalAmountPayable: plan.total_amount_payable,
  balance: plan.balance,
  planCode: plan.plan_code,
  installmentAmount: plan.installment_amount,
}));

export default function ChangeOfModeRoute() {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  const handleChangeMode = async () => {
    const confirmed = await messageBox({
      title: "Proceed Application",
      message: "Are you sure you want to proceed?",
      confirmText: "Proceed",
      cancelText: "No",
      variant: "warning",
    });
    if (confirmed) router.push("/plan-management/change-of-mode/success");
  };

  return (
    <Page.Root
      headerButton="menu"
      title={"Change of Mode Application"}
      description="Switch your payment mode anytime."
    >
      <Page.MainContent>
        <ChangeOfModeTable plans={PLANS} onChangeMode={handleChangeMode} />
      </Page.MainContent>
    </Page.Root>
  );
}
