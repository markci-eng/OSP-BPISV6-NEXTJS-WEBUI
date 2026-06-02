"use client";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/components/layout/page/Page";
import {
  LifePlanApplicationFormWrapper,
  Beneficiary,
  HealthDeclaration,
} from "new-sales-page-component";
import { FaFileAlt } from "react-icons/fa";
import { LuHeartPulse, LuUsersRound } from "react-icons/lu";

export default function NewSalePage() {
  const { messageBox } = useMessageDialog();

  const stepsData = [
    {
      title: "Life Plan Application",
      icon: FaFileAlt,
      content: <LifePlanApplicationFormWrapper />,
    },
    {
      title: "Beneficiaries",
      icon: LuUsersRound,
      content: <Beneficiary />,
    },
    {
      title: "Health Declaration",
      icon: LuHeartPulse,
      content: <HealthDeclaration />,
    },
  ];

  return (
    <Page.Root
      title="New Sales Application"
      description="Complete the life plan application, add beneficiaries, and declare health information."
    >
      <Page.MainContent>
        <FormStepper
          steps={stepsData}
          onSubmit={async () => {
            const confirmed = await messageBox({
              title: "Submit Application",
              message:
                "Are you sure you want to submit this sales application?",
              confirmText: "Submit",
              cancelText: "Cancel",
              variant: "warning",
            });

            if (confirmed) {
              window.location.href += "/success";
            }
          }}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
