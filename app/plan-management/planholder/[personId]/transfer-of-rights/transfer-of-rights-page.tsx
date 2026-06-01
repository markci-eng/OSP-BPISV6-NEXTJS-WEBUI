"use client";
import { useState } from "react";
import { CheckedPlan } from "./transfer-of-rights.types";
import { TransferDocumentsPage } from "./tf-documents-page";
import { NewPlanHolderInfoForm } from "./new-ph-form";
import { LuFileText, LuUserRound } from "react-icons/lu";
import TFReviewApplicationPage from "./tf-review-application-page";
import { FaFileShield } from "react-icons/fa6";
import Page from "@/components/layout/page/Page";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

export function TransferOfRightsPage() {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);
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
      title: "New PH Information",
      content: <NewPlanHolderInfoForm />,
      icon: LuUserRound,
    },
    {
      title: "Review Application",
      description: "Review your application before submission.",
      content: <TFReviewApplicationPage />,
      icon: FaFileShield,
    },
  ];

  return (
    // <FormSteps
    //   stepsData={stepsData}
    //   title={"Transfer of Rights"}
    //   description={"Transfer your plan to your loved ones—simple and seamless."}
    // />
    <Page.Root
      title={"Transfer of Rights Application"}
      description="Transfer your plan to your loved ones—simple and seamless."
    >
      <Page.MainContent>
        <FormStepper
          steps={stepsData}
          onSubmit={async () => {
            const confirm = await messageBox({
              title: "Proceed Application",
              message: "Are you sure you want to proceed?",
              confirmText: "Proceed",
              cancelText: "No",
              variant: "warning",
            });

            if (confirm) {
              window.location.href += "/success";
            }
          }}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
