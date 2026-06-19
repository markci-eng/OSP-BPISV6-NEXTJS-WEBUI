"use client";

import { useState } from "react";
import {
  Flex,
  Grid,
  GridItem,
  HStack,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Box, PrimaryMdButton, SelectFloatingLabel } from "st-peter-ui";
import { LuArrowRightLeft, LuFilter, LuUsers } from "react-icons/lu";
import { TbTransferIn, TbTransferOut } from "react-icons/tb";

import Page from "@/claude components/layout/page/Page";
import LookUp from "@/components/common/reusable-lookup/dynamic-lookup";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

import { TransferType, TrxMonth } from "../data/transaction-month";
import TransferAccountList from "./account-transfer-list";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "./sales-force-lookup_data";

export default function AccountsTransferPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);
  const [remarks, setRemarks] = useState("");
  const { messageBox } = useMessageDialog();

  const confirmTransfer = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to transfer account(s)?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });

    if (confirmed) {
      await messageBox({
        title: "SUCCESS",
        message: "Account(s) successfully transferred.",
        confirmText: "Ok",
        variant: "success",
      });
    }
  };

  return (
    <Page.Root title="Transfer of Accounts" headerButton="menu">
      <Page.MainContent>
        <Page.Row>
          <Tabs.Root defaultValue="withinBranch" variant="enclosed">
            <Tabs.List>
              <Tabs.Trigger value="withinBranch">
                <HStack gap={2}>
                  <TbTransferIn
                    size={16}
                    color="var(--chakra-colors-primary)"
                  />
                  <Text color="var(--chakra-colors-primary)">
                    Within the Branch
                  </Text>
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger value="otherBranch">
                <HStack gap={2}>
                  <TbTransferOut
                    size={16}
                    color="var(--chakra-colors-primary)"
                  />
                  <Text color="var(--chakra-colors-primary)">
                    To Other Branch
                  </Text>
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            {/* WITHIN BRANCH */}
            <Tabs.Content value="withinBranch">
              <Flex direction="column" gap={4} pt={2}>
                <InfoCardAccordion
                  icon={<LuUsers size={18} />}
                  title="Sales Agent / Transaction Month"
                  subtitle="Filter accounts by agent and billing month"
                  defaultOpen
                >
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={4}
                  >
                    <GridItem>
                      <SelectFloatingLabel
                        label="Select Transaction Month"
                        collection={TrxMonth}
                      />
                    </GridItem>
                    <GridItem>
                      <Box mt={2}>
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
                </InfoCardAccordion>

                <TransferAccountList />

                <TransferDestination
                  remarks={remarks}
                  setRemarks={setRemarks}
                  setAgent={setSelectedAgent}
                  onConfirm={confirmTransfer}
                />
              </Flex>
            </Tabs.Content>

            {/* TO OTHER BRANCH */}
            <Tabs.Content value="otherBranch">
              <Flex direction="column" gap={4} pt={2}>
                <InfoCardAccordion
                  icon={<LuFilter size={18} />}
                  title="Transfer Type / Transaction Month / Sales Agent"
                  subtitle="Configure the source details for this transfer"
                  defaultOpen
                >
                  <Grid
                    templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
                    gap={4}
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
                      <Box mt={2}>
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
                </InfoCardAccordion>

                <TransferAccountList />

                <TransferDestination
                  remarks={remarks}
                  setRemarks={setRemarks}
                  setAgent={setSelectedAgent}
                  onConfirm={confirmTransfer}
                />
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Shared "Transfer To" section used by both tabs                       */
/* ------------------------------------------------------------------ */

type TransferDestinationProps = {
  remarks: string;
  setRemarks: (v: string) => void;
  setAgent: (a: SalesForceLookUpData | null) => void;
  onConfirm: () => void;
};

function TransferDestination({
  remarks,
  setRemarks,
  setAgent,
  onConfirm,
}: TransferDestinationProps) {
  return (
    <Flex direction="column" gap={3}>
      <InfoCardAccordion
        icon={<LuArrowRightLeft size={18} />}
        title="Transfer To"
        subtitle="Enter remarks and select the destination agent"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
          <GridItem>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter the reason here..."
              resize="vertical"
              height="40px"
            />
          </GridItem>
          <GridItem>
            <SelectFloatingLabel
              label="Select Transaction Month"
              collection={TrxMonth}
            />
          </GridItem>
          <GridItem>
            <Box mt={2}>
              <LookUp<SalesForceLookUpData>
                placeholder="Search Transfer To"
                modalTitle="Sales Force List"
                data={salesForceLookUp}
                headers={salesForceHeaders}
                onSelect={setAgent}
                getInputValue={(item) =>
                  `${item.AgentName} (${item.SalesForceCode})`
                }
              />
            </Box>
          </GridItem>
        </Grid>
      </InfoCardAccordion>

      <Flex justify={{ base: "stretch", lg: "flex-end" }}>
        <Box w={{ base: "full", lg: "auto" }}>
          <PrimaryMdButton onClick={onConfirm}>
            Transfer Account(s)
          </PrimaryMdButton>
        </Box>
      </Flex>
    </Flex>
  );
}
