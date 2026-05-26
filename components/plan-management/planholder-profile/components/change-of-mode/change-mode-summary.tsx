import { LuClipboardCheck } from "react-icons/lu";
import type { CheckedPlanType } from "./change-mode.types";
import SummaryForm from "@/components/common/text/SummaryForm";
import { Box } from "@chakra-ui/react";
import SummaryBox from "@/components/common/text/SummaryBox";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
// import { GrandSummary, type SummaryItems, SummarySection } from "../../components/summary-component/summary-section";

interface RevRIProps {
  selectedPlans: CheckedPlanType[] | undefined;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChangeModeSummaryPage({ selectedPlans }: RevRIProps) {
  if (!selectedPlans) return;
  const totalCMFee = selectedPlans.reduce((sum) => sum + 100, 0);
  const totalInstPayment = selectedPlans.reduce(
    (sum, p) => sum + p.new_installment_amount + p.pending_installment_amount,
    0,
  );
  const totalDue = totalCMFee + totalInstPayment;

  // const summaryItems = (): SummaryItems[] => {
  //   return selectedPlans.flatMap((item) => [
  //     { label: "LPA Number", value: item.lpa_no },
  //     { label: "New Plan Code", value: item.new_plan_code },
  //     { label: "Installment Payment", value: item.new_installment_amount, type: "currency"},
  //     { label: "Change of Mode Fee", value: 100, type: "currency" },
  //   ]);
  // };

  return (
    <>
      <SummaryForm title={"Change of Mode Summary"} data={[]} />
      <Box mt={{ base: 0, md: -10 }}>
        {selectedPlans.map((plan, index) => (
          <Box key={index} my={{ base: 3, md: 5 }} borderRadius={STANDARD_RADIUS.md}>
            <SummaryBox
              key={index}
              title={`LPA #: ${plan.lpa_no}`}
              data={[
                { label: "New Plan Code", value: plan.new_plan_code },
                {
                  label: "Installment Payment",
                  value: plan.new_installment_amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                  }),
                },
                { label: "Change of Mode Fee", value: "PHP 100.00" },
              ]}
            />
          </Box>
        ))}
      </Box>
    </>
    // <SummarySection
    //   columns={4}
    //   icon={<LuClipboardCheck />}
    //   title={"Change of Mode Summary"}
    //   items={summaryItems()}
    //   grandSummary={
    //     <GrandSummary
    //       label={"Total Amount Payable"}
    //       value={totalDue}
    //       type="currency"
    //     />
    //   }
    // />
  );
}
