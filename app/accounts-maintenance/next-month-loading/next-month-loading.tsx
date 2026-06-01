"use client";

import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { PrimaryMdFlexButton, SelectFloatingLabel } from "st-peter-ui";
import { TrxMonth } from "../data/transaction-month";
import { useState } from "react";
import { PremiumCircularProgress } from "@/components/common/progressbar/dynamic-progress-bar";
import { useProgressController } from "@/components/common/progressbar/progress-bar-controller";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";

const accounts = [
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
  { id: 5 }, { id: 5 }, { id: 5 }, { id: 5 }, { id: 5 },
  { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 5 },
  { id: 5 }, { id: 5 }, { id: 5 }, { id: 5 }, { id: 1 },
  { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 5 },
  { id: 5 }, { id: 5 }, { id: 5 }, { id: 5 }, { id: 2 },
  { id: 3 }, { id: 4 }, { id: 5 }, { id: 5 }, { id: 5 },
  { id: 5 }, { id: 5 }, { id: 5 },
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
      console.log("Processing account:", account.id);
      progress.increment();
    }

    setIsProcessing(false);
    setIsComplete(true);

    messageBox({
      title: "SUCCESS",
      message: "Next monthload successfully processed.",
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
        <Page.Row>
          <Card.Root title="Transaction Month">
            <Card.MainContent>
              <Grid
                templateColumns={{ base: "1fr", md: "380px 1fr" }}
                gap={4}
                alignItems="start"
                mt={2}
              >
                <GridItem>
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
                </GridItem>

                {selectedMonth && (
                  <GridItem>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="gray.200"
                    >
                      <Text
                        fontSize="10px"
                        color="gray.500"
                        fontWeight={700}
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        mb={1}
                      >
                        Selected Month
                      </Text>
                      <Text fontSize="md" fontWeight={600} color="gray.700">
                        {selectedMonthLabel}
                      </Text>
                    </Box>
                  </GridItem>
                )}
              </Grid>
            </Card.MainContent>
          </Card.Root>
        </Page.Row>

        {(isProcessing || isComplete) && (
          <Page.Row>
            <Card.Root title="Processing Status">
              <Card.MainContent>
                <Flex direction="column" align="center" py={8}>
                  <PremiumCircularProgress
                    value={progress.percentage}
                    size={200}
                    loadingLabel={`${progress.current} of ${progress.total} accounts processed`}
                    completeLabel="All accounts processed successfully"
                  />
                </Flex>
              </Card.MainContent>
            </Card.Root>
          </Page.Row>
        )}

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
