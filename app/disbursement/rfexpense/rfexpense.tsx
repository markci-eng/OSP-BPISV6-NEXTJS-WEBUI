"use client";
import { AccountName } from "@/app/payment/data/paymentDetails";
import Card from "@/components/cards/Card";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

import { Page } from "@/components/page/page";
import { Box, Flex, Grid, HStack, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import { BsPrinter } from "react-icons/bs";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa6";
import {
  Body,
  InputFloatingLabel,
  PrimaryMdFlexButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_ICON_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export default function RFexpense() {
  // SAMPLE STATE (replace with real data)
  const expense = 25000;
  const fundBalance = 75000;

  // const AccountName = [];
  const breadCrumb = [
    {
      label: "Home",
    },
    {
      label: "Disbursement",
    },
    {
      label: "Revolving Fund Expense",
    },
  ];

  return (
    <Page
      breadcrumbItems={breadCrumb}
      title={"Revolving Fund Expense"}
      description="Encode revolving fund expenses and review the prepared expense list."
    >
      {/* SUMMARY CARDS */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap={{ base: 4, md: 5 }}
        mb={{ base: 4, md: 5 }}
      >
        {/* CURRENT EXPENSE */}
        <Box
          p={{ base: 4, md: 5 }}
          borderRadius={STANDARD_RADIUS.md}
          bg={BRAND_COLORS.errorBg}
          border="1px solid"
          borderColor={BRAND_COLORS.errorRed}
          boxShadow={STANDARD_SHADOWS.level1}
        >
          <HStack justify="space-between" mb={2}>
            <Body
              fontSize="sm"
              color={BRAND_COLORS.destructiveRed}
              fontWeight="medium"
            >
              Current Expense
            </Body>
            <FaMoneyBillWave color={BRAND_COLORS.destructiveRed} />
          </HStack>

          <Body
            fontSize="2xl"
            fontWeight="bold"
            color={BRAND_COLORS.destructiveRed}
          >
            ₱ {expense.toLocaleString()}
          </Body>

          <Body fontSize="xs" color="gray.500">
            Total expenses recorded
          </Body>
        </Box>

        {/* CURRENT FUND BALANCE */}
        <Box
          p={{ base: 4, md: 5 }}
          borderRadius={STANDARD_RADIUS.md}
          bg={BRAND_COLORS.successBg}
          border="1px solid"
          borderColor={BRAND_COLORS.softGreen}
          boxShadow={STANDARD_SHADOWS.level1}
        >
          <HStack justify="space-between" mb={2}>
            <Body
              fontSize="sm"
              color={BRAND_COLORS.primaryGreen}
              fontWeight="medium"
            >
              Current Fund Balance
            </Body>
            <FaWallet color={BRAND_COLORS.primaryGreen} />
          </HStack>

          <Body
            fontSize="2xl"
            fontWeight="bold"
            color={BRAND_COLORS.primaryGreen}
          >
            ₱ {fundBalance.toLocaleString()}
          </Body>

          <Body fontSize="xs" color="gray.500">
            Remaining available fund
          </Body>
        </Box>
      </Grid>

      {/* FORM CARD */}
      <Card.Root title={"Encode Expense"}>
        <Card.MainContent>
          {/* FORM GRID */}
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            columnGap={{ base: 0, md: 4 }}
            rowGap={4}
          >
            <InputFloatingLabel label="PCV Number" />

            <SelectFloatingLabel
              label="Account Name"
              collection={AccountName}
            />

            <InputFloatingLabel type="date" label="PCV Date" />

            <InputFloatingLabel type="number" label="PCV Amount" />

            <InputFloatingLabel label="Pay To" />

            <InputFloatingLabel label="Remarks" />
          </Grid>

          {/* SAVE BUTTON */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify={{ base: "flex-end" }}
            mt={4}
            gap={3}
            width="full"
          >
            <Box width={{ base: "full", md: "auto" }} minW={"32"}>
              <PrimaryMdFlexButton>SAVE</PrimaryMdFlexButton>
            </Box>
          </Flex>

          {/* TABLE */}
          <Box mt={5}>
            <DataTable
              columns={[]}
              data={[]}
              features={{
                search: true,
                sorting: false,
                draggable: false,
                selection: false,
                filtering: false,
                columnToggle: false,
              }}
              headerActions={
                <Flex w={"full"} justify={"flex-end"}>
                  <IconButton
                    {...STANDARD_ICON_BUTTON_STYLES.md}
                    aria-label="Print revolving fund expense"
                    variant="outline"
                    borderColor={BRAND_COLORS.neutralBorder}
                    color={BRAND_COLORS.primaryGreen}
                  >
                    <BsPrinter />
                  </IconButton>
                </Flex>
              }
            />
          </Box>
        </Card.MainContent>
      </Card.Root>
    </Page>
  );
}
