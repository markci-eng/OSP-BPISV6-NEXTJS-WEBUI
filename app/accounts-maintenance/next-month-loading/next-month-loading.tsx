"use client";

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PrimaryMdFlexButton, SelectFloatingLabel } from "st-peter-ui";
import { LuCalendar, LuCircleCheck, LuLoader } from "react-icons/lu";

import Page from "@/components/layout/page/Page";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { PremiumCircularProgress } from "@/components/common/progressbar/dynamic-progress-bar";
import { useProgressController } from "@/components/common/progressbar/progress-bar-controller";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import InfoCard from "@/claude components/info-card/info-card";

import { TrxMonth } from "../data/transaction-month";

const accounts = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
  { id: 5 },
];

export default function NextMonthLoadingPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { messageBox } = useMessageDialog();

  const selectedMonthLabel =
    TrxMonth.items.find((i) => i.value === selectedMonth)?.label ?? "";

  const progress = useProgressController({ total: accounts.length });

  const handleConfirm = async () => {
    if (!selectedMonth) {
      setErrorMessage("Please select a transaction month before proceeding.");
      return;
    }
    setErrorMessage("");

    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to process next month loading?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (confirmed) {
      await nextMonthLoad();
    }
  };

  const nextMonthLoad = async () => {
    setIsProcessing(true);
    setIsComplete(false);
    progress.start();

    for (const account of accounts) {
      await new Promise((res) => setTimeout(res, 200));
      progress.increment();
    }

    setIsProcessing(false);
    setIsComplete(true);

    messageBox({
      title: "SUCCESS",
      message: "Next month load successfully processed.",
      confirmText: "Ok",
      variant: "success",
    });
  };

  return (
    <Page.Root
      title="Next Month Loading"
      description="Process the next billing cycle for all active accounts"
    >
      <Page.MainContent>
        {/* TRANSACTION MONTH */}
        <Page.Row>
          <InfoCardAccordion
            icon={<LuCalendar size={18} />}
            title="Transaction Month"
            subtitle="Select the billing cycle month to process"
            defaultOpen
          >
            <Flex
              // direction={{ base: "column", md: "row" }}
              gap={4}
              align="flex-start"
            >
              <Box flex="1" maxW={"full"}>
                <SelectFloatingLabel
                  label="Select Transaction Month"
                  collection={TrxMonth}
                  w="full"
                  onValueChanged={(value) => {
                    setSelectedMonth(value[0]);
                    setErrorMessage("");
                  }}
                />
                {errorMessage && (
                  <Text color="red.500" fontSize="sm" mt="6px">
                    {errorMessage}
                  </Text>
                )}
              </Box>

              {selectedMonth && (
                <Box flex="1" pt={{ base: 0, md: "6px" }}>
                  <InfoCard icon={LuCalendar}>
                    Selected month: <strong>{selectedMonthLabel}</strong>
                  </InfoCard>
                </Box>
              )}
            </Flex>
          </InfoCardAccordion>
        </Page.Row>

        {/* PROCESSING STATUS */}
        {(isProcessing || isComplete) && (
          <Page.Row>
            <InfoCardAccordion
              icon={
                isComplete ? (
                  <LuCircleCheck size={18} />
                ) : (
                  <LuLoader size={18} />
                )
              }
              title={isComplete ? "Processing Complete" : "Processing…"}
              subtitle={
                isComplete
                  ? `All ${accounts.length} accounts processed successfully`
                  : `${progress.current} of ${progress.total} accounts processed`
              }
              defaultOpen
            >
              <Flex justify="center" py={6}>
                <PremiumCircularProgress
                  value={progress.percentage}
                  size={200}
                  loadingLabel={`${progress.current} of ${progress.total} accounts processed`}
                  completeLabel="All accounts processed successfully"
                />
              </Flex>
            </InfoCardAccordion>
          </Page.Row>
        )}

        {/* ACTION */}
        <Page.Row>
          <Flex justify="flex-end">
            <Box w={{ base: "full", md: "auto" }}>
              <PrimaryMdFlexButton
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                Process Next Month Load
              </PrimaryMdFlexButton>
            </Box>
          </Flex>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
