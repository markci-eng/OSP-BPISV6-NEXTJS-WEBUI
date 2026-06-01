"use client";
import Page from "@/components/layout/page/Page";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { LuFileText, LuUser } from "react-icons/lu";
import { TransferDocumentsPage } from "@/app/plan-management/planholder/[personId]/transfer-of-rights/tf-documents-page";
import { useState } from "react";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { FaFileShield } from "react-icons/fa6";
import { OSPBadge } from "@/components/common/badge/badge";
import PlanholderInfoForm from "../forms/planholder-info-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { StepItem } from "@/components/form-stepper/form-stepper";

export function EditPlanholderInfoPage() {
  const [selectedDocuments, setSelectedDocuments] = useState<UploadedFile[]>(
    [],
  );

  const { messageBox } = useMessageDialog();

  const stepsData = [
    {
      title: "Update Planholder Information",
      content: <PlanholderInfoForm />,
      icon: LuUser,
    },
    {
      title: "Supporting Documents",
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
      title: "Review Application",
      description: "Review your application before submission.",
      content: <OSPBadge />,
      icon: FaFileShield,
    },
  ] as StepItem[];
  return (
    <Page.Root
      title={"Edit Planholder Information"}
      description="Keep planholder information on track."
    >
      <Page.MainContent>
        <FormStepper steps={stepsData} />
      </Page.MainContent>
    </Page.Root>
  );
}
