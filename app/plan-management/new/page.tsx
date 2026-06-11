"use client";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import {
  LifePlanApplicationFormWrapper,
  Beneficiary,
  HealthDeclaration,
} from "new-sales-page-component";
import { FaFileAlt } from "react-icons/fa";
import { LuHeartPulse, LuUsersRound } from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/components/FormSteps";
import { SetStateAction } from "react";
import SharedLifePlanApplication from "@/claude components/add-new-sale/steps/SharedLifePlanApplication";
import { Box } from "st-peter-ui";

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
    <Page.Root title="" hideBackButton>
      <Page.MainContent>
        <Box mt={"-40px"} mx={"-20px"}>
          <SharedLifePlanApplication />
        </Box>
        {/* <FormSteps
          stepsData={stepsData}
          title={"New Sales Application"}
          description={
            "Complete the life plan application, add beneficiaries, and declare health information."
          }
          currentStep={0}
          setCurrentStep={function (value: SetStateAction<number>): void {
            throw new Error("Function not implemented.");
          }}
        /> */}
        {/* <FormStepper
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
        /> */}
      </Page.MainContent>
    </Page.Root>
  );
}
