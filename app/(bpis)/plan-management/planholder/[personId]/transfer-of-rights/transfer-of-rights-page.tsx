"use client";
import { useState } from "react";
import { CheckedPlan } from "./transfer-of-rights.types";
import { TransferDocumentsPage } from "./tf-documents-page";
import { NewPlanHolderInfoForm } from "./new-ph-form";
import { LuFileText, LuUserRound } from "react-icons/lu";
import TFReviewApplicationPage from "./tf-review-application-page";
import { FaFileShield } from "react-icons/fa6";
import Page from "@/claude components/layout/page/Page";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import FormSteps from "@/claude components/FormSteps";
import { Box } from "@chakra-ui/react";

export function TransferOfRightsPage() {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocuments, setSelectedDocuments] = useState<UploadedFile[]>(
    [],
  );

  const { messageBox } = useMessageDialog();

  const stepsData = [
    // {
    //   title: "Select Plan",
    //   content: (
    //     <PlanSelectionPage
    //       plans={planholderLookup.filter(
    //         (plan) =>
    //           plan.accountStatus != "LAPSED" &&
    //           plan.terminationStatus == "NOT YET TERMINATED",
    //       )}
    //     />
    //   ),
    //   icon: LuListCheck,
    // },
    {
      title: "Documents",
      content: (
        <TransferDocumentsPage
          onFilesChange={(files) => setSelectedDocuments(files)}
        />
      ),
      icon: LuFileText,
      validateBeforeNext: () => {
        if (selectedDocuments.length === 0) {
          messageBox({
            title: "Unable to proceed",
            message: "Please upload at least one document.",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "New PH Info",
      content: <NewPlanHolderInfoForm />,
      icon: LuUserRound,
    },
    {
      title: "Review & Submit",
      description: "Review your application before submission.",
      content: <TFReviewApplicationPage />,
      icon: FaFileShield,
    },
  ];

  return (
    <Page.Root
      title={"Transfer of Rights"}
      description="Transfer your plan to loved ones."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title={""}
          description={""}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={async () => {
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
          }}
          submitButtonText={"Submit Application"}
        />
      </Page.MainContent>
    </Page.Root>
    // <Page.Root
    //   title={"Transfer of Rights Application"}
    //   description="Transfer your plan to your loved ones—simple and seamless."
    // >
    //   <Page.MainContent>
    //     <FormStepper
    //       steps={stepsData}
    //       onSubmit={async () => {
    //         const confirm = await messageBox({
    //           title: "Proceed Application",
    //           message: "Are you sure you want to proceed?",
    //           confirmText: "Proceed",
    //           cancelText: "No",
    //           variant: "warning",
    //         });

    //         if (confirm) {
    //           window.location.href += "/success";
    //         }
    //       }}
    //     />
    //   </Page.MainContent>
    // </Page.Root>
  );
}
