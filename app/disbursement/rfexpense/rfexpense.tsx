"use client";
import { AccountName } from "@/app/payment/data/paymentDetails";
import Card from "@/components/cards/Card";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

import Page from "@/components/layout/page/Page";
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

export default function RFexpense() {
  // SAMPLE STATE (replace with real data)
  const expense = 25000;
  const fundBalance = 75000;

  // const AccountName = [];
  return (
    <Page.Root
      title={"Revolving Fund Expense"}
      description="Manage your Revolving Fund Expense"
    >
      <Page.MainContent>
        {/* SUMMARY CARDS */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
          }}
          gap={4}
          // my={6}
        >
          {/* CURRENT EXPENSE */}
          <Box
            p={5}
            borderRadius="lg"
            bg="red.50"
            border="1px solid"
            borderColor="red.100"
            boxShadow="sm"
          >
            <HStack justify="space-between" mb={2}>
              <Body fontSize="sm" color="red.500" fontWeight="medium">
                Current Expense
              </Body>
              <FaMoneyBillWave color="#E53E3E" />
            </HStack>

            <Body fontSize="2xl" fontWeight="bold" color="red.600">
              ₱ {expense.toLocaleString()}
            </Body>

            <Body fontSize="xs" color="gray.500">
              Total expenses recorded
            </Body>
          </Box>

          {/* CURRENT FUND BALANCE */}
          <Box
            p={5}
            borderRadius="lg"
            bg="green.50"
            border="1px solid"
            borderColor="green.100"
            boxShadow="sm"
          >
            <HStack justify="space-between" mb={2}>
              <Body fontSize="sm" color="green.500" fontWeight="medium">
                Current Fund Balance
              </Body>
              <FaWallet color="#38A169" />
            </HStack>

            <Body fontSize="2xl" fontWeight="bold" color="green.600">
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
              gapX={{ base: 0, md: "2" }}
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
              my={4}
              gap={{ base: 2, xl: 4 }}
              width="full"
            >
              <Box width={{ base: "full", md: "auto" }} minW={"32"}>
                <PrimaryMdFlexButton>SAVE</PrimaryMdFlexButton>
              </Box>
            </Flex>

            {/* TABLE */}
            <Box mt={6}>
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
                    <IconButton>
                      <BsPrinter />
                    </IconButton>
                  </Flex>
                }
              />
            </Box>
          </Card.MainContent>
        </Card.Root>
      </Page.MainContent>
    </Page.Root>
  );
}
