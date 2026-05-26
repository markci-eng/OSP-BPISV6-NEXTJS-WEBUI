"use client";
import { Page } from "@/components/page/page";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { LuFileText, LuUser } from "react-icons/lu";
import { TransferDocumentsPage } from "@/app/plan-management/planholder/[personId]/transfer-of-rights/tf-documents-page";
import { useState } from "react";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { FaFileShield } from "react-icons/fa6";
import { Badge } from "../components/badge/badge";
import PlanholderInfoForm from "../forms/planholder-info-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { StepItem } from "@/components/form-stepper/form-stepper";

const breadcrumbItems = [
  {
    label: "Home",
    href: "/",
  },

  {
    label: "Planholder",
    href: "/plan-management/planholder",
  },

  {
    label: "PI123453I",
    href: "/plan-management/planholder/PI123453I",
  },
  {
    label: "Edit",
    href: "#",
  },
];

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
      content: <Badge />,
      icon: FaFileShield,
    },
  ] as StepItem[];
  return (
    <Page
      breadcrumbItems={breadcrumbItems}
      title={"Edit Planholder Information"}
      description="Keep planholder information on track."
    >
      <FormStepper steps={stepsData} />
    </Page>
  );
}
