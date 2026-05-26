"use client";

import {
  Box,
  Flex,
  Grid,
  GridItem,
  Separator,
  Strong,
  Text,
} from "@chakra-ui/react";
import { PrimaryMdButton, SelectFloatingLabel } from "st-peter-ui";
import { TrxMonth } from "../data/transaction-month";
import { useState } from "react";

import { ReusableProgressBar } from "@/components/common/progressbar/progress-bar";
import { useProgressController } from "@/components/common/progressbar/progress-bar-controller";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Page } from "@/components/page/page";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

const bcrumb = [
  {
    label: "Home",
  },
  {
    label: "Accounts Maintenance",
  },
  {
    label: "Next Month Loading",
  },
];

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
  const [disableButton, setDisableButton] = useState(false);
  const { messageBox } = useMessageDialog();

  const progress = useProgressController({
    total: accounts.length,
    onComplete: () => {
      setDisableButton(false);
    },
  });

  const sectionCardProps = {
    p: { base: 4, md: 5 },
    bg: BRAND_COLORS.white,
    boxShadow: STANDARD_SHADOWS.level1,
    borderRadius: STANDARD_RADIUS.md,
    borderWidth: "1px",
    borderColor: BRAND_COLORS.neutralBorder,
  } as const;

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
    setDisableButton(true);
    progress.start();

    for (const account of accounts) {
      await new Promise((res) => setTimeout(res, 500));

      console.log("Processing account:", account.id);

      progress.increment();
    }

    messageBox({
      title: "SUCCESS",
      message: "Next monthload successfully processed.",
      confirmText: "Ok",
      variant: "success",
    });
  };

  return (
    <Page
      breadcrumbItems={bcrumb}
      title="Next Month Loading"
      description="Process account loading for the selected transaction month."
    >
      <Box display="flex" flexDirection="column" gap={{ base: 4, md: 5 }}>
        <Box {...sectionCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>Transaction Month</Strong>
          <Separator my={2} />

          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr auto",
            }}
            alignItems="start"
            gap={4}
          >
            <GridItem>
              <SelectFloatingLabel
                label="Select Transaction Month"
                collection={TrxMonth}
                w={{ base: "100%", md: "360px" }}
                onValueChanged={(value) => setSelectedMonth(value[0])}
              />

              {errorMessage && (
                <Text color={BRAND_COLORS.errorRed} mt={2} fontSize="sm">
                  {errorMessage}
                </Text>
              )}
            </GridItem>

            <GridItem justifySelf={{ base: "stretch", md: "end" }}>
              <PrimaryMdButton onClick={handleConfirm} disabled={disableButton}>
                Process Next Month Load
              </PrimaryMdButton>
            </GridItem>
          </Grid>
        </Box>

        <Flex
          justifyContent="center"
          p={{ base: 4, md: 5 }}
          borderRadius={STANDARD_RADIUS.md}
          border="1px solid"
          borderColor={BRAND_COLORS.neutralBorder}
          bg={BRAND_COLORS.white}
          boxShadow={STANDARD_SHADOWS.level1}
        >
          <ReusableProgressBar
            value={progress.percentage}
            size={250}
            loadingLabel={`Processing next month loading. (${progress.current} / ${progress.total})`}
            completeLabel="Next month load successfully processed."
          />
        </Flex>
      </Box>
    </Page>
  );
}
