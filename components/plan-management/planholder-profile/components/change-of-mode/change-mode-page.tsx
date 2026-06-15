import { Box, Container, Flex, Separator, Steps } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Body, H3, NextButton, PreviousButton } from "st-peter-ui";
import type { CheckedPlanType } from "./change-mode.types";
import { ChangeModeForm } from "./change-mode-form";
import { PHPlans } from "./data";
import { ChangeModeSummaryPage } from "./change-mode-summary";
// import PaymentPage from "../reinstatement-page/payment";
import { FaFileAlt } from "react-icons/fa";
import { FaCcMastercard, FaFileShield } from "react-icons/fa6";
import FormSteps from "@/components/FormSteps";
import Page from "@/components/layout/page/Page";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

const steps = ["Select Plan", "Application Summary"];

export function ChangeModePage({
  onSuccess,
  successLink,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
}) {
  const [checkedPlans, setCheckedPlans] = useState<
    CheckedPlanType[] | undefined
  >([]);
  const [totalAmountDue, setTotalAmountDue] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const { messageBox } = useMessageDialog();

  useEffect(() => {
    if (!checkedPlans) return;
    const totalCMFee = checkedPlans.reduce((sum) => sum + 100, 0);
    const totalInstPayment = checkedPlans.reduce(
      (sum, p) => sum + p.new_installment_amount + p.pending_installment_amount,
      0,
    );
    const totalDue = totalCMFee + totalInstPayment;
    setTotalAmountDue(totalDue);
  }, [checkedPlans]);

  const stepsData = [
    {
      title: "Select Plan",
      icon: FaFileAlt,
      content: (
        <ChangeModeForm
          activePlans={PHPlans}
          onCheckedPlansChange={(checked) => setCheckedPlans(checked)}
        />
      ),
      validateBeforeNext: () => {
        if (!checkedPlans || (checkedPlans && checkedPlans.length === 0)) {
          messageBox({
            title: "Unable to proceed",
            message: "Please select a plan",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "Application Summary",
      icon: FaFileShield,
      content: (
        <ChangeModeSummaryPage
          selectedPlans={checkedPlans}
          onSubmit={async () => {
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
          onBack={() => {}}
        />
      ),
    },
    // {
    //   title: "Payment",
    //   icon: FaCcMastercard,
    //   content: <PaymentPage successLink={successLink} />,
    // },
  ];

  return (
    <Page.Root
      title={"Change of Mode Application"}
      description="Switch your payment mode anytime—Quarterly, Semi-Annual, or Annual."
    >
      <Page.MainContent>
        <Box mt={"-30px"}>
          <FormSteps
            stepsData={stepsData}
            title=""
            description=""
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </Box>
      </Page.MainContent>
    </Page.Root>
    // <Box maxW={"7xl"} mx={"auto"} py={3}>
    //   <Container px={0}>
    //     <H3>Change of Mode Application</H3>
    //     <Body mt={1}>
    //       Switch your payment mode anytime—Quarterly, Semi-Annual, or Annual.
    //     </Body>
    //   </Container>

    //   <Steps.Root
    //     step={step}
    //     onStepChange={(e) => setStep(e.step)}
    //     count={steps.length}
    //     my={5}
    //     onStepComplete={() => onSuccess("CM-12345", totalAmountDue)}
    //   >
    //     <Steps.List>
    //       {steps.map((step, index) => (
    //         <Steps.Item key={index} index={index} title={step}>
    //           <Steps.Indicator
    //             _current={{
    //               backgroundColor: "var(--chakra-colors-primary-disabled)/50",
    //               borderColor: "var(--chakra-colors-primary)",
    //               color: "var(--chakra-colors-primary-hover)",
    //             }}
    //             _complete={{
    //               backgroundColor: "var(--chakra-colors-primary)",
    //               borderColor: "var(--chakra-colors-primary)",
    //             }}
    //           />
    //           <Steps.Title display={{ base: "block", mdDown: "none" }}>
    //             {step}
    //           </Steps.Title>
    //           <Steps.Separator
    //             _complete={{
    //               backgroundColor: "var(--chakra-colors-primary)",
    //             }}
    //           />
    //         </Steps.Item>
    //       ))}
    //     </Steps.List>

    //     <Separator />

    //     <Steps.Content index={0}>
    //       <ChangeModeForm activePlans={PHPlans} onCheckedPlansChange={(checked) => setCheckedPlans(checked)}/>
    //     </Steps.Content>
    //     <Steps.Content index={1}>
    //       <ChangeModeSummaryPage selectedPlans={checkedPlans} onSubmit={function (): void {
    //         throw new Error("Function not implemented.");
    //       } } onBack={function (): void {
    //         throw new Error("Function not implemented.");
    //       } }/>
    //     </Steps.Content>
    //     <Steps.Content index={2}>
    //       <PaymentPage/>
    //     </Steps.Content>
    //     <Steps.CompletedContent>

    //     </Steps.CompletedContent>

    //     <Flex justifyContent={"space-between"}>
    //       <Steps.PrevTrigger asChild>
    //         {step < 3 && <PreviousButton  onClick={() => window.scrollTo(0, 0)}/>}
    //       </Steps.PrevTrigger>
    //       <Steps.NextTrigger asChild>
    //         {step < 2 && (
    //           <NextButton disabled={step === 0 && checkedPlans && checkedPlans.length === 0} onClick={() => window.scrollTo(0, 0)}/>
    //         )}
    //       </Steps.NextTrigger>
    //     </Flex>
    //   </Steps.Root>
    // </Box>
  );
}
