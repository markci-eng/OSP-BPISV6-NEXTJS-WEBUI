import { Box, Grid, GridItem, Separator, Strong } from "@chakra-ui/react";
import { PrimaryMdButton, SelectFloatingLabel } from "st-peter-ui";

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
    label: "MCPR",
  },
];

export default function MCPRPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);
  const [isBranch, setIsBranch] = useState(false);
  const { messageBox } = useMessageDialog();

  const handlePrint = async () => {
    await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to print Incentive Report?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });
  };

  const sectionCardProps = {
    p: { base: 4, md: 5 },
    bg: BRAND_COLORS.white,
    boxShadow: STANDARD_SHADOWS.level1,
    borderRadius: STANDARD_RADIUS.md,
    borderWidth: "1px",
    borderColor: BRAND_COLORS.neutralBorder,
  } as const;

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsBranch(user === "branch");
  }, []);

  return (
    <Page
      breadcrumbItems={bcrumb}
      title="Monthly Collection and Performance Report"
      description="Review account collections, quotas, and incentive reporting for the selected period."
    >
      <Box
        display="flex"
        flexDirection="column"
        gap={{ base: 4, md: 5 }}
        minH={{ base: "auto", md: "100%" }}
      >
        {isBranch && (
          <Box {...sectionCardProps}>
            <Strong color={BRAND_COLORS.primaryGreen}>Sales Force</Strong>
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
        )}

        <Box flex="1" minW={0} overflow="hidden">
          <MCPRDataPage />
        </Box>

        <Grid templateColumns={{ base: "1fr" }} gap={4}>
          <GridItem justifySelf={{ base: "stretch", lg: "end" }} mt={1}>
            <PrimaryMdButton onClick={handlePrint}>
              View Incentives
            </PrimaryMdButton>
          </GridItem>
        </Grid>
      </Box>
    </Page>
  );
}
