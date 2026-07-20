"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuUser,
  LuPhone,
  LuBuilding2,
  LuFileText,
  LuScan,
} from "react-icons/lu";
import { toast } from "sonner";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/claude components/FormSteps";
import AgentSummary from "@/components/saleforce/pages/agent-summary";
import {
  ApplicationProvider,
  useApplication,
} from "./application/application-context";
import { DocumentUploadStep } from "./application/components/DocumentUploadStep";
import { PersonalInfoStep } from "./application/steps/PersonalInfoStep";
import { ContactAddressStep } from "./application/steps/ContactAddressStep";
import { EmploymentStep } from "./application/steps/EmploymentStep";

function NewSalesForceFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { requiredComplete, applyExtraction, clearAll } = useApplication();

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const stepsData = [
    {
      title: "Documents",
      icon: LuScan,
      content: <DocumentUploadStep />,
      // Require the mandatory documents, then push extraction into the form
      // before advancing so the next steps arrive pre-filled.
      validateBeforeNext: () => {
        if (!requiredComplete) {
          toast.error(
            "Please upload and process the required documents before continuing.",
          );
          return false;
        }
        applyExtraction();
        return true;
      },
    },
    {
      title: "Personal Info",
      icon: LuUser,
      content: <PersonalInfoStep />,
    },
    {
      title: "Contact & Address",
      icon: LuPhone,
      content: <ContactAddressStep />,
    },
    {
      title: "Employment",
      icon: LuBuilding2,
      content: <EmploymentStep />,
    },
    {
      title: "Summary",
      icon: LuFileText,
      content: <AgentSummary onEditStep={goToStep} />,
    },
  ];

  return (
    <Page.Root
      headerButton="menu"
      title="New Sales Agent"
      description="Upload documents to autofill, then review and register."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={() => {
            clearAll();
            router.push("/sales-force/new/success");
          }}
          submitButtonText="Create Agent"
        />
      </Page.MainContent>
    </Page.Root>
  );
}

export default function CreateSalesForcePage() {
  return (
    <ApplicationProvider>
      <NewSalesForceFlow />
    </ApplicationProvider>
  );
}
