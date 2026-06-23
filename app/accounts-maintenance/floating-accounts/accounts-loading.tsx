"use client";

import { useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import {
  Box,
  PrimaryMdButton,
  PrimaryMdFlexButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { LuFilter, LuUserCheck } from "react-icons/lu";

import Page from "@/claude components/layout/page/Page";
import { LookupField } from "@/components/common/reusable-lookup/LookUpField";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

import { STLList, TrxMonth } from "../data/transaction-month";
import {
  salesForceLookUp,
  SalesForceLookUpData,
} from "../accounts-transfer/sales-force-lookup_data";
import FloatingAccountList from "./floating-list";

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
      await messageBox({
        title: "SUCCESS",
        message: "Account(s) successfully loaded.",
        confirmText: "Ok",
        variant: "success",
      });
    }
  };

  return (
    <Page.Root title="Floating Accounts" headerButton="menu">
      <Page.MainContent>
        {/* FILTER */}
        <Page.Row>
          <InfoCardAccordion
            icon={<LuFilter size={18} />}
            title="Sales Team Leader"
            subtitle="Filter by transaction month and team leader"
            defaultOpen
          >
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <SelectFloatingLabel
                  label="Select Transaction Month"
                  collection={TrxMonth}
                />
              </GridItem>
              <GridItem>
                <SelectFloatingLabel
                  label="Select Sales Team Leader"
                  collection={STLList}
                />
              </GridItem>
            </Grid>
          </InfoCardAccordion>
        </Page.Row>

        {/* ACCOUNT LIST */}
        <Page.Row>
          <FloatingAccountList />
        </Page.Row>

        {/* ASSIGN TO AGENT */}
        <Page.Row>
          <InfoCardAccordion
            icon={<LuUserCheck size={18} />}
            title="Assign to Agent"
            subtitle="Select a Sales Agent 2 and load the selected accounts"
            defaultOpen
          >
            <Grid
              templateColumns={{ base: "1fr", md: "1fr auto" }}
              gap={2}
              alignItems="end"
            >
              <GridItem>
                <Box mt={2}>
                  <LookupField<SalesForceLookUpData>
                    placeholder="Search Sales Agent 2"
                    modalTitle="Sales Force List"
                    dataSource={salesForceLookUp}
                    columns={[
                      { key: "SalesForceCode", header: "Sales Force Code" },
                      { key: "AgentName", header: "Agent Name" },
                      { key: "PosCode", header: "Position Code" },
                    ]}
                    searchKeys={["AgentName", "SalesForceCode"]}
                    onSelect={setSelectedAgent}
                    renderDisplay={(item) =>
                      `${item.AgentName} (${item.SalesForceCode})`
                    }
                    value={selectedAgent}
                  />
                </Box>
              </GridItem>
              <GridItem justifySelf={{ base: "stretch", md: "end" }}>
                <PrimaryMdFlexButton onClick={confirmLoad}>
                  Load Account/s
                </PrimaryMdFlexButton>
              </GridItem>
            </Grid>
          </InfoCardAccordion>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
