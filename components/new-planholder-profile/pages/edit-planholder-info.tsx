"use client";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/claude components/FormSteps";
import { LuFileText, LuUser } from "react-icons/lu";
import { EditDocumentsPage } from "./edit-documents-page";
import { useState } from "react";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { FaFileShield } from "react-icons/fa6";
import { OSPBadge } from "@/components/common/badge/badge";
import PlanholderInfoForm from "../forms/planholder-info-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { StepItem } from "@/components/FormSteps";
import { Box } from "@chakra-ui/react";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import EditPlanholderReview from "./edit-planholder-review";

const mockPlanholder: SalesAgent = {
  id: "PH001",
  name: "Santos, Maria",
  firstName: "Maria",
  lastName: "Santos",
  middleName: "Cruz",
  suffix: "",
  placeOfBirth: "Quezon City",
  birthDate: "1985-03-22",
  gender: "FEMALE",
  civilStatus: "Married",
  nationality: "Filipino",
  naturalizationDate: "N/A",
  height: "5'4\"",
  weight: "120 lbs",
  position: "SA1",
  hireDate: "2010-06-15",
  employeeStatus: "Active",
  branch: "Quezon City",
  superiorId: "STL1",
  sssNumber: "04-1234567-8",
  nbiNumber: "10-987654321-0",
  tinNumber: "2000-0001-0001",
  landline: "8123-4567",
  mobile: "+63 918 222 3344",
  email: "maria.santos@email.com",
  address: {
    unit: "Blk 5 Lot 12",
    street: "Mindanao Ave.",
    barangay: "Bagong Pag-asa",
    district: "District 2",
    city: "Quezon City",
    province: "Metro Manila",
    zipCode: "1105",
  },
  isContractPrinted: true,
  isSFIDPrinted: false,
  employer: "",
};

export function EditPlanholderInfoPage() {
  const [selectedDocuments, setSelectedDocuments] = useState<UploadedFile[]>(
    [],
  );
  const [currentStep, setCurrentStep] = useState(0);

  const { messageBox } = useMessageDialog();

  const stepsData = [
    {
      title: "Documents",
      content: (
        <EditDocumentsPage
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
      title: "Planholder Info",
      content: (
        <PlanholderInfoForm selectedAgent={mockPlanholder} hideActions />
      ),
      icon: LuUser,
    },
    {
      title: "Review",
      description: "Review your application before submission.",
      content: (
        <EditPlanholderReview
          planholder={mockPlanholder}
          selectedDocuments={selectedDocuments}
          onEditStep={setCurrentStep}
        />
      ),
      icon: FaFileShield,
    },
  ] as StepItem[];
  return (
    <Page.Root
      title={"Edit Planholder Information"}
      description="Keep planholder information on track."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={async () => {
            const confirmed = await messageBox({
              title: "Confirm Submission",
              message:
                "Are you sure you want to submit the changes to the planholder information?",
              variant: "warning",
              confirmText: "Yes, Submit",
              showCancel: true,
              cancelText: "Cancel",
            });

            if (confirmed) {
              window.location.href = window.location.href + "/success";
            }
          }}
          submitButtonText="Submit Changes"
        />
      </Page.MainContent>
    </Page.Root>
  );
}
