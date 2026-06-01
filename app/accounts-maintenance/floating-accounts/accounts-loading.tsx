import {
  Flex,
  Grid,
  GridItem,
  Separator,
  SimpleGrid,
  Strong,
} from "@chakra-ui/react";
import {
  Box,
  PrimaryMdButton,
  PrimarySmButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import Page from "@/components/layout/page/Page";
import { STLList, TrxMonth } from "../data/transaction-month";
import FloatingAccountList from "./floating-list";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "../accounts-transfer/sales-force-lookup_data";
import { useState } from "react";
import LookUp from "../../../components/common/reusable-lookup/dynamic-lookup";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";


export default function AccountsLoadingPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);

  const { messageBox } = useMessageDialog();

  const confirmLoad = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to load account(s)?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });

    if (confirmed) {
      await loadAccounts();
    }
  };

  const loadAccounts = async () => {
    await messageBox({
      title: "SUCCESS",
      message: "Account(s) successfully loaded.",
      confirmText: "Ok",
      variant: "success",
    });
  };

  // const confirmLoad = async () => {
  //   await messageBox({
  //     title: "CONFIRMATION",
  //     message: "Do you want to load account(s)?",
  //     confirmText: "Yes",
  //     cancelText: "No",
  //     variant: "confirmation",
  //     onConfirm: () => {
  //       loadAccounts();
  //     },
  //   });

  //   // if (confirmed) {
  //   //   await loadAccounts();
  //   // }
  // };

  // const loadAccounts = async () => {
  //   await messageBox({
  //     title: "SUCCESS",
  //     message: "Account(s) successfully loaded.",
  //     confirmText: "Ok",
  //     variant: "success",
  //   });
  // };

  return (
    <Page.Root title="Floating Accounts">
      <Page.MainContent>
        <Page.Row>
        <Box
          p={3}
          bg="white"
          boxShadow="sm"
          borderRadius="lg"
          borderWidth="0.5px"
        >
          <Strong color="var(--chakra-colors-primary)">
            Sales Team Leader\Transaction Month
          </Strong>
          <Separator my={2} />

          <Grid
            templateColumns={{
              base: "1fr",
              sm: "1fr",
              md: "1fr 1fr",
              lg: "max-content auto",
            }}
            gap={4}
          >
            {/* Row 2 - Select Month */}
            <GridItem>
              <SelectFloatingLabel
                label="Select Transaction Month"
                collection={TrxMonth}
                w={{ base: "100%", md: "360px" }}
              />
            </GridItem>

            <GridItem>
              <SelectFloatingLabel
                label="Select Sales Team Leader"
                collection={STLList}
                w={{ base: "100%", md: "360px" }}
              />
            </GridItem>
          </Grid>
        </Box>
        </Page.Row>

        <Page.Row>
          <FloatingAccountList />
        </Page.Row>

        <Page.Row>
        <Box
          p={3}
          bg="white"
          boxShadow="sm"
          borderRadius="lg"
          borderWidth="0.5px"
        >
          <Strong color="var(--chakra-colors-primary)">Sales Agent 2</Strong>
          <Separator my={2} />

          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr",
              lg: "max-content auto",
            }}
            gap={4}
            justifyContent="end"
          >
            {/* Search Employee */}
            <GridItem>
              <Box w={{ base: "100%", md: "360px" }}>
                <LookUp<SalesForceLookUpData>
                  placeholder="Search Sales Agent 2"
                  modalTitle="Sales Force List"
                  data={salesForceLookUp}
                  headers={salesForceHeaders}
                  onSelect={setSelectedAgent}
                  getInputValue={(item) =>
                    `${item.AgentName} (${item.SalesForceCode})`
                  }
                />
              </Box>
            </GridItem>

            {/* Button */}
            <GridItem justifySelf={{ base: "stretch", lg: "end" }}>
              <PrimaryMdButton onClick={confirmLoad}>
                Load Account/s
              </PrimaryMdButton>
            </GridItem>
          </Grid>
        </Box>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
