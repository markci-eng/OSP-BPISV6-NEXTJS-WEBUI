import {
  Flex,
  Grid,
  GridItem,
  Separator,
  SimpleGrid,
  Span,
  Strong,
  Table,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";

import {
  Body,
  InputFloatingLabel,
  PrimaryLgFlexButton,
  PrimaryMdButton,
  PrimarySmButton,
  SelectFloatingLabel,
  Small,
} from "st-peter-ui";
import Page from "@/components/layout/page/Page";

import { TrxMonth } from "../data/transaction-month";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "../accounts-transfer/sales-force-lookup_data";
import { useEffect, useState } from "react";
import MCPRDataPage from "./mcpr-data";
import LookUp from "@/components/common/reusable-lookup/dynamic-lookup";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";


export default function MCPRPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);
  const [isBranch, setIsBranch] = useState(false);
  const { messageBox } = useMessageDialog();

  const handlePrint = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to print Incentive Report?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });
  };

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; osp_user=`);
    const role = parts.length === 2 ? decodeURIComponent(parts.pop()!.split(";").shift() ?? "") : null;
    setIsBranch(role === "branch");
  }, []);

  return (
    <Page.Root title="Monthly Collection and Performance Report">
      <Page.MainContent>
        {isBranch && (
          <Page.Row>
          <Box
            p={3}
            bg="white"
            boxShadow="sm"
            borderRadius="lg"
            borderWidth="0.5px"
          >
            <Strong color="var(--chakra-colors-primary)">Sales Force</Strong>
            <Separator my={2} />

            <Grid
              templateColumns={{
                base: "1fr",
                sm: "1fr",
                md: "1fr 1fr",
                lg: "max-content auto",
              }}
              gap={4}
              justifyContent="end"
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
                <Box w={{ base: "100%", md: "360px" }} mt={2}>
                  <LookUp<SalesForceLookUpData>
                    placeholder="Select Sales Force"
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
            </Grid>
          </Box>
          </Page.Row>
        )}

        <Page.Row>
          <MCPRDataPage />
        </Page.Row>

        <Page.Row>
        <Grid
          templateColumns={{
            base: "1fr",
          }}
          gap={4}
        >
          {/* Button */}
          <GridItem justifySelf={{ base: "stretch", lg: "end" }} mt={3}>
            <PrimaryMdButton onClick={handlePrint}>
              View Incentives
            </PrimaryMdButton>
          </GridItem>
        </Grid>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <VStack gap={1} align="start" minW={0}>
    <Small color="gray.500">{label}</Small>
    <Body>
      <Span fontWeight="regular">{value}</Span>
    </Body>
  </VStack>
);
