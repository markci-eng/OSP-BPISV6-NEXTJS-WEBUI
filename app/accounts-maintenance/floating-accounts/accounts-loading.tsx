import {
  Box,
  Grid,
  GridItem,
  Separator,
  Strong,
} from "@chakra-ui/react";
import {
  PrimaryMdButton,
  SelectFloatingLabel,
} from "st-peter-ui";
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
    label: "Floating Accounts",
  },
];

export default function AccountsLoadingPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);

  const { messageBox } = useMessageDialog();

  const sectionCardProps = {
    p: { base: 4, md: 5 },
    bg: BRAND_COLORS.white,
    boxShadow: STANDARD_SHADOWS.level1,
    borderRadius: STANDARD_RADIUS.md,
    borderWidth: "1px",
    borderColor: BRAND_COLORS.neutralBorder,
  } as const;

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

  return (
    <Page
      breadcrumbItems={bcrumb}
      title="Floating Accounts"
      description="Review floating accounts and load selected accounts to a sales agent."
    >
      <Box display="flex" flexDirection="column" gap={{ base: 4, md: 5 }}>
        <Box {...sectionCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>
            Sales Team Leader / Transaction Month
          </Strong>
          <Separator my={2} />

          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr",
              lg: "max-content auto",
            }}
            gap={4}
          >
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

        <Box flex="1" minW={0} overflow="hidden">
          <FloatingAccountList />
        </Box>

        <Box {...sectionCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>Sales Agent 2</Strong>
          <Separator my={2} />

          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr auto",
            }}
            gap={4}
            alignItems="start"
          >
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

            <GridItem justifySelf={{ base: "stretch", md: "end" }}>
              <PrimaryMdButton onClick={confirmLoad}>
                Load Account/s
              </PrimaryMdButton>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </Page>
  );
}
