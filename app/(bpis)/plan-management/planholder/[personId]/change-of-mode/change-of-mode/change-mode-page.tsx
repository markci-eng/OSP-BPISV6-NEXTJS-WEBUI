import { Box } from "@chakra-ui/react";
import { useState } from "react";
import type { CheckedPlanType } from "@/data/plan-management/change-of-mode/change-mode.types";
import { ChangeModeForm } from "./change-mode-form";
import { PHPlans } from "@/data/plan-management/change-of-mode/data";
import { ChangeModeSummaryPage } from "./change-mode-summary";
import { FaFileAlt } from "react-icons/fa";
import { FaFileShield } from "react-icons/fa6";
import Page from "@/claude components/layout/page/Page";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import FormSteps from "@/claude components/FormSteps";

export function ChangeModePage({
  onSuccess,
  successLink,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
}) {
  const [checkedPlans, setCheckedPlans] = useState<
    CheckedPlanType[] | undefined
  >([]);
  const [currentStep, setCurrentStep] = useState(0);

  const { messageBox } = useMessageDialog();

  const handleSubmit = async () => {
    const confirmed = await messageBox({
      title: "Confirm Submission",
      message: "Are you sure you want to submit this application?",
      variant: "warning",
      confirmText: "Yes",
      showCancel: true,
      cancelText: "No",
    });
    if (confirmed) {
      window.location.href = window.location.href + "/success";
    }
  };

  const stepsData = [
    {
      title: "Select Plan",
      icon: FaFileAlt,
      content: (
        <ChangeModeForm
          activePlans={PHPlans}
          onCheckedPlansChange={(checked) => setCheckedPlans(checked)}
        />
      ),
      validateBeforeNext: () => {
        if (!checkedPlans?.length) {
          messageBox({
            title: "Unable to proceed",
            message: "Please select a plan",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "Summary",
      icon: FaFileShield,
      content: (
        <ChangeModeSummaryPage
          selectedPlans={checkedPlans}
          onSubmit={handleSubmit}
          onBack={() => {}}
        />
      ),
    },
  ];

  return (
    <Page.Root
      headerButton="back"
      title={"Change of Mode Application"}
      description="Switch your payment mode anytime."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={handleSubmit}
          submitButtonText={"Submit Application"}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
