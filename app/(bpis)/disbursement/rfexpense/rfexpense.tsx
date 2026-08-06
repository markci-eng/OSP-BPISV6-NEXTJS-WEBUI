"use client";

import { AccountName } from "@/app/(bpis)/payment/data/paymentDetails";
import {
  StaticCard,
  DataTable,
  FloatingLabelInput,
  FloatingLabelSelect,
  InfoCardAccordion,
  Page,
} from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  Box,
  Flex,
  Grid,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { BsPrinter } from "react-icons/bs";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { PrimaryMdFlexButton } from "st-peter-ui";

export default function RFexpense() {
  const expense = 25000;
  const fundBalance = 75000;

  return (
    <Page.Root
      title="Revolving Fund Expense"
      description="Manage your Revolving Fund Expense"
      headerButton="menu"
    >
      <Page.MainContent>
        {/* SUMMARY CARDS */}
        <Page.Row>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <StaticCard
              activeIcon={<FaMoneyBillWave size={18} />}
              title="Current Expense"
              subtitle="Total expenses recorded"
            >
              <Flex justify="center" align="center" py={3}>
                <Text
                  fontSize="4xl"
                  fontWeight="800"
                  color="red.500"
                  lineHeight="1"
                >
                  ₱ {expense.toLocaleString()}
                </Text>
              </Flex>
            </StaticCard>

            <StaticCard
              activeIcon={<FaWallet size={18} />}
              title="Current Fund Balance"
              subtitle="Remaining available fund"
            >
              <Flex justify="center" align="center" py={3}>
                <Text
                  fontSize="4xl"
                  fontWeight="800"
                  color={BRAND_COLORS.primaryGreen}
                  lineHeight="1"
                >
                  ₱ {fundBalance.toLocaleString()}
                </Text>
              </Flex>
            </StaticCard>
          </SimpleGrid>
        </Page.Row>

        {/* ENCODE EXPENSE FORM */}
        <Page.Row>
          <InfoCardAccordion
            icon={<LuPencilLine size={18} />}
            title="Encode Expense"
            subtitle="Fill in PCV details to record an expense"
            defaultOpen
          >
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gapX={{ base: 0, md: 2 }}
            >
              <FloatingLabelInput label="PCV Number" />
              <FloatingLabelSelect label="Account Name">
                {AccountName.items.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </FloatingLabelSelect>
              <FloatingLabelInput type="date" label="PCV Date" />
              <FloatingLabelInput type="number" label="PCV Amount" />
              <FloatingLabelInput label="Pay To" />
              <FloatingLabelInput label="Remarks" />
            </Grid>

            <Flex justify="flex-end" mt={4}>
              <Box width={{ base: "full", md: "auto" }} minW="32">
                <PrimaryMdFlexButton>Save</PrimaryMdFlexButton>
              </Box>
            </Flex>
          </InfoCardAccordion>
        </Page.Row>

        {/* EXPENSE RECORDS TABLE */}
        <Page.Row>
          <DataTable
            columns={[]}
            data={[]}
            features={{
              search: true,
              sorting: true,
              selection: false,
              filtering: true,
              columnToggle: true,
            }}
            headerActions={
              <Flex w="full" justify="flex-end">
                <IconButton variant="ghost" aria-label="Print records">
                  <BsPrinter />
                </IconButton>
              </Flex>
            }
          />
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
