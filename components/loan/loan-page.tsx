"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { FaFileShield } from "react-icons/fa6";

import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/claude components/FormSteps";
import InfoCard from "@/claude components/info-card/info-card";
import { FiBriefcase, FiFileText, FiUser } from "react-icons/fi";
import LoanInfoForm, {
  LoanApplicantInfo,
  initialLoanApplicantInfo,
} from "@/app/(bpis)/plan-management/planholder/[personId]/loan/loan-application";
import {
  REQUIRED_DOCUMENTS,
  LoanDocumentsPage,
} from "@/app/(bpis)/plan-management/planholder/[personId]/loan/loan-documents";
import LoanApplicationPage from "@/app/(bpis)/plan-management/planholder/[personId]/loan/loan-review-application-page";
import {
  LoanRecord,
  initialLoanData,
  LoanSelectPlanStep,
} from "@/app/(bpis)/plan-management/planholder/[personId]/loan/loan-select-plan";

// ---- Main exported component ----
export function LoanPage({ onProceed }: { onProceed: () => void }) {
  const [tableData] = useState<LoanRecord[]>(initialLoanData);
  const [selectedLpaNumbers, setSelectedLpaNumbers] = useState<string[]>([]);
  const [applicantInfo, setApplicantInfo] = useState<LoanApplicantInfo>(
    initialLoanApplicantInfo,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const { messageBox } = useMessageDialog();

  const selectedRecords = tableData.filter((r) =>
    selectedLpaNumbers.includes(r.lpaNo),
  );

  const handleSubmit = async () => {
    const confirmed = await messageBox({
      title: "Confirm Submission",
      message: "Are you sure you want to submit this Loan application?",
      variant: "warning",
      confirmText: "Yes, Submit",
      showCancel: true,
      cancelText: "Cancel",
    });
    if (confirmed) {
      sessionStorage.setItem("selectedRows", JSON.stringify(selectedRecords));
      onProceed();
    }
  };

  const stepsData = [
    {
      title: "Choose Plan",
      icon: FiUser,
      content: (
        <LoanSelectPlanStep
          tableData={tableData}
          selectedLpaNumbers={selectedLpaNumbers}
          onSelectionChange={setSelectedLpaNumbers}
        />
      ),
      validateBeforeNext: () => {
        if (selectedLpaNumbers.length === 0) {
          messageBox({
            title: "No Plan Selected",
            message: "Please select at least one plan to proceed.",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "Application",
      icon: FiBriefcase,
      content: (
        <Box py={3}>
          <InfoCard>
            Please ensure the details below match your prepared documents:{" "}
            {REQUIRED_DOCUMENTS.filter((doc) => doc.required)
              .map((doc) => doc.label)
              .join(", ")}
            .
          </InfoCard>
          <Box mt={4}>
            <LoanInfoForm
              value={applicantInfo}
              onChange={setApplicantInfo}
              selectedPlans={selectedRecords}
            />
          </Box>
        </Box>
      ),
    },
    {
      title: "Requirement",
      icon: FiFileText,
      content: (
        <Box py={3}>
          <InfoCard>
            Before You Upload — please prepare clear, legible scanned copies or
            photos of all required documents listed below. Ensure all pages are
            complete and signatures are visible. Accepted formats: PDF, JPG,
            PNG, DOC, DOCX — max 20 MB per file.
          </InfoCard>
          <Box mt={4}>
            <LoanDocumentsPage
              onFilesChange={() => {
                throw new Error("Function not implemented.");
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      title: "Review",
      icon: FaFileShield,
      content: (
        <Box py={3}>
          <InfoCard>
            Please review all the information below before submitting. Once
            submitted, changes may require additional processing time.
          </InfoCard>
          <Box mt={4}>
            <LoanApplicationPage
              applicantInfo={applicantInfo}
              selectedPlans={selectedRecords}
            />
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Page.Root
      title="Loan Application"
      description="Apply for a loan application."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={handleSubmit}
          submitButtonText="Submit Application"
        />
      </Page.MainContent>
    </Page.Root>
  );
}
