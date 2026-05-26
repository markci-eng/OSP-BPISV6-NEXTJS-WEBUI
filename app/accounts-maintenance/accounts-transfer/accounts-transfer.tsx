import {
  Box,
  Grid,
  GridItem,
  HStack,
  Separator,
  Strong,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  PrimaryMdButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { TransferType, TrxMonth } from "../data/transaction-month";
import TransferAccountList from "./account-transfer-list";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "./sales-force-lookup_data";
import { useState } from "react";
import LookUp from "../../../components/common/reusable-lookup/dynamic-lookup";
import { TbTransferIn, TbTransferOut } from "react-icons/tb";
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
    label: "Transfer of Accounts",
  },
];

export default function AccountsTransferPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);
  const [remarks, setRemarks] = useState("");
  const { messageBox } = useMessageDialog();

  const sectionCardProps = {
    p: { base: 4, md: 5 },
    bg: BRAND_COLORS.white,
    boxShadow: STANDARD_SHADOWS.level1,
    borderRadius: STANDARD_RADIUS.md,
    borderWidth: "1px",
    borderColor: BRAND_COLORS.neutralBorder,
  } as const;

  const confirmTransfer = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to transfer account(s)?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });

    if (confirmed) {
      await handleTransfer();
    }
  };

  const handleTransfer = async () => {
    await messageBox({
      title: "SUCCESS",
      message: "Account(s) successfully transfered.",
      confirmText: "Ok",
      variant: "success",
    });
  };

  const renderTransferToSection = () => (
    <Box {...sectionCardProps}>
      <Strong color={BRAND_COLORS.primaryGreen}>Transfer To</Strong>
      <Separator my={2} />

      <Grid
        templateColumns={{
          base: "1fr",
          lg: "repeat(3, 1fr)",
        }}
        gap={4}
        alignItems="start"
      >
        <GridItem>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter the reason here..."
            resize="vertical"
            minH="96px"
            borderColor={BRAND_COLORS.neutralBorder}
          />
        </GridItem>

        <GridItem>
          <SelectFloatingLabel
            label="Select Transaction Month"
            collection={TrxMonth}
          />
        </GridItem>

        <GridItem>
          <LookUp<SalesForceLookUpData>
            placeholder="Search Transfer To"
            modalTitle="Sales Force List"
            data={salesForceLookUp}
            headers={salesForceHeaders}
            onSelect={setSelectedAgent}
            getInputValue={(item) =>
              `${item.AgentName} (${item.SalesForceCode})`
            }
          />
        </GridItem>
      </Grid>
    </Box>
  );

  const renderTransferAction = () => (
    <Grid templateColumns={{ base: "1fr" }} gap={4}>
      <GridItem justifySelf={{ base: "stretch", lg: "end" }} mt={1}>
        <PrimaryMdButton onClick={confirmTransfer}>
          Transfer Account(s)
        </PrimaryMdButton>
      </GridItem>
    </Grid>
  );

  return (
    <Page
      breadcrumbItems={bcrumb}
      title="Transfer of Accounts"
      description="Move selected accounts within the branch or to another branch while preserving account details."
    >
      <Box display="flex" flexDirection="column" gap={{ base: 4, md: 5 }}>
        <Tabs.Root defaultValue="withinBranch" variant="enclosed">
          <Tabs.List
            bg={BRAND_COLORS.subtleBg}
            border="1px solid"
            borderColor={BRAND_COLORS.neutralBorder}
            borderRadius={STANDARD_RADIUS.md}
            p={1}
          >
            <Tabs.Trigger value="withinBranch">
              <HStack gap={2}>
                <TbTransferIn size={16} color={BRAND_COLORS.primaryGreen} />
                <Text color={BRAND_COLORS.primaryGreen}>
                  Within the Branch
                </Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="otherBranch">
              <HStack gap={2}>
                <TbTransferOut size={16} color={BRAND_COLORS.primaryGreen} />
                <Text color={BRAND_COLORS.primaryGreen}>
                  To Other Branch
                </Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="withinBranch">
            <Box display="flex" flexDirection="column" gap={{ base: 4, md: 5 }}>
              <Box {...sectionCardProps}>
                <Strong color={BRAND_COLORS.primaryGreen}>
                  Sales Agent / Transaction Month
                </Strong>
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
                </Grid>
              </Box>

              <Box flex="1" minW={0} overflow="hidden">
                <TransferAccountList />
              </Box>

              {renderTransferToSection()}
              {renderTransferAction()}
            </Box>
          </Tabs.Content>

          <Tabs.Content value="otherBranch">
            <Box display="flex" flexDirection="column" gap={{ base: 4, md: 5 }}>
              <Box {...sectionCardProps}>
                <Strong color={BRAND_COLORS.primaryGreen}>
                  Transfer Type / Transaction Month / Sales Agent
                </Strong>
                <Separator my={2} />

                <Grid
                  templateColumns={{
                    base: "1fr",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={4}
                  alignItems="start"
                >
                  <GridItem>
                    <SelectFloatingLabel
                      label="Select Transfer Type"
                      collection={TransferType}
                    />
                  </GridItem>

                  <GridItem>
                    <SelectFloatingLabel
                      label="Select Transaction Month"
                      collection={TrxMonth}
                    />
                  </GridItem>

                  <GridItem>
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
                  </GridItem>
                </Grid>
              </Box>

              <Box flex="1" minW={0} overflow="hidden">
                <TransferAccountList />
              </Box>

              {renderTransferToSection()}
              {renderTransferAction()}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Page>
  );
}
