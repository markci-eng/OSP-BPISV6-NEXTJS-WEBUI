"use client";

import React from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Strong,
  Text,
} from "@chakra-ui/react";
import { PrimaryMdButton } from "st-peter-ui";
import { useRouter } from "next/navigation";
import {
  LuFileBadge2,
  LuUsers,
  LuFileText,
  LuTriangleAlert,
} from "react-icons/lu";

import { FormStepper, StepItem } from "@/components/form-stepper/form-stepper";
import { PlanholderInfoData } from "@/app/plan-management/data/planholder-info.data";
import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";

import ClaimInfoForm from "./claim-info-form";
import ClaimsPayeeForm from "./claim-payee";
import ClaimFormSummary from "./claim-form-summary";
import {
  ClaimInfoState,
  PayeeInfo,
  initialClaimInfo,
  initialPayees,
} from "./claims.types";
import Page from "@/components/layout/page/Page";

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
  const [planholder, setPlanholder] = React.useState<
    PlanholderInfoType | undefined
  >(() => PlanholderInfoData[0]);
  const [claimInfo, setClaimInfo] =
    React.useState<ClaimInfoState>(initialClaimInfo);
  const [payees, setPayees] = React.useState<PayeeInfo[]>(initialPayees);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

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

  const handleSubmitClick = () => setConfirmOpen(true);

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    router.push("/claims/success");
  };

  const steps: StepItem[] = [
    {
      title: "Claim Info",
      icon: LuFileBadge2,
      content: (
        <ClaimInfoForm
          planholder={planholder}
          claimInfo={claimInfo}
          onClaimInfoChange={setClaimInfo}
        />
      ),
    },
    {
      title: "Payee",
      icon: LuUsers,
      content: <ClaimsPayeeForm payees={payees} onPayeesChange={setPayees} />,
    },
    {
      title: "Summary",
      icon: LuFileText,
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
    <>
      <Page.Root
        title="Claim Application"
        description="Please fill out the following details."
      >
        <Page.MainContent>
        <FormStepper steps={steps} onSubmit={handleSubmitClick} />

        <Dialog.Root
          open={confirmOpen}
          onOpenChange={(e) => setConfirmOpen(e.open)}
          size={{ base: "full", md: "md" }}
          lazyMount
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner p={{ base: 0, md: undefined }}>
              <Dialog.Content borderRadius={{ base: 0, md: undefined }}>
                <Dialog.Header>
                  <Flex align="center" gap={2}>
                    <LuTriangleAlert color="var(--chakra-colors-orange-500)" />
                    <Dialog.Title>
                      <Strong color="gray.700">Confirm Claim Submission</Strong>
                    </Dialog.Title>
                  </Flex>
                </Dialog.Header>
                <Dialog.Body>
                  <Text color="gray.600">
                    Please note that this claim is{" "}
                    <Text as="span" fontWeight="bold">
                      subject to review and confirmation
                    </Text>{" "}
                    by our Claims Department. You will be notified once the
                    verification process has been completed.
                  </Text>
                  <Text color="gray.600" mt={3}>
                    Are you sure you want to submit this claim?
                  </Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <PrimaryMdButton onClick={handleConfirmSubmit}>
                    Confirm &amp; Submit
                  </PrimaryMdButton>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
        </Page.MainContent>
      </Page.Root>
    </>
  );
};

export default ClaimsPage;
