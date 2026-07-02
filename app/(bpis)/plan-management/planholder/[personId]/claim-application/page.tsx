"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaFileAlt } from "react-icons/fa";
import { FaFileShield } from "react-icons/fa6";
import { LuUsers } from "react-icons/lu";

import FormSteps from "@/claude components/FormSteps";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { PlanholderInfoData } from "@/app/(bpis)/plan-management/data/planholder-info.data";
import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import Page from "@/claude components/layout/page/Page";

import ClaimInfoForm from "./claim-info-form";
import ClaimsPayeeForm from "./claim-payee";
import ClaimFormSummary from "./claim-form-summary";
import {
  ClaimInfoState,
  PayeeInfo,
  initialClaimInfo,
  initialPayees,
} from "./claims.types";

const PLANHOLDER_STORAGE_KEY = "claim:planholder-lpa";

const resolvePlanholder = (
  lpa: string | null | undefined,
): PlanholderInfoType | undefined => {
  if (!lpa) return PlanholderInfoData[0];
  const match = PlanholderInfoData.find((p) => p.lpaNumber === lpa);
  return match ?? PlanholderInfoData[0];
};

const ClaimsPage = () => {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  const [planholder, setPlanholder] = React.useState<
    PlanholderInfoType | undefined
  >(() => PlanholderInfoData[0]);
  const [claimInfo, setClaimInfo] =
    React.useState<ClaimInfoState>(initialClaimInfo);
  const [payees, setPayees] = React.useState<PayeeInfo[]>(initialPayees);
  const [currentStep, setCurrentStep] = React.useState(0);

  // Resolve planholder from ?lpa=... or sessionStorage on mount.
  // Read directly from window so we don't pull useSearchParams (which needs a
  // Suspense boundary in Next 14+ and was breaking static prerender).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lpa");
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(PLANHOLDER_STORAGE_KEY);
    } catch {
      // sessionStorage may be unavailable (e.g. private mode) — ignore.
    }
    setPlanholder(resolvePlanholder(fromQuery ?? stored));
  }, []);

  const handleSubmit = async () => {
    const confirmed = await messageBox({
      title: "Confirm Claim Submission",
      message:
        "This claim is subject to review and confirmation by our Claims Department. You will be notified once verification is complete. Are you sure you want to submit?",
      variant: "warning",
      confirmText: "Confirm & Submit",
      showCancel: true,
      cancelText: "Cancel",
    });
    if (confirmed) {
      router.push("./claim-application/success");
    }
  };

  const stepsData = [
    {
      title: "Claim Info",
      icon: FaFileAlt,
      content: (
        <ClaimInfoForm
          planholder={planholder}
          claimInfo={claimInfo}
          onClaimInfoChange={setClaimInfo}
        />
      ),
    },
    {
      title: "Claimants",
      icon: LuUsers,
      content: <ClaimsPayeeForm payees={payees} onPayeesChange={setPayees} />,
    },
    {
      title: "Summary",
      icon: FaFileShield,
      content: (
        <ClaimFormSummary
          planholder={planholder}
          claimInfo={claimInfo}
          payees={payees}
        />
      ),
    },
  ];

  return (
    <Page.Root
      title="Claim Application"
      description="Please fill out the following details."
      headerButton="menu"
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={handleSubmit}
          submitButtonText="Submit Claim"
        />
      </Page.MainContent>
    </Page.Root>
  );
};

export default ClaimsPage;
