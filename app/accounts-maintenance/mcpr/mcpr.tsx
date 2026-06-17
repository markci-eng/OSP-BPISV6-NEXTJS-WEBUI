"use client";

import { useEffect, useState } from "react";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import { PrimaryMdButton, SelectFloatingLabel } from "st-peter-ui";
import { LuUsers } from "react-icons/lu";

import Page from "@/components/layout/page/Page";
import LookUp from "@/components/common/reusable-lookup/dynamic-lookup";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

import { TrxMonth } from "../data/transaction-month";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "../accounts-transfer/sales-force-lookup_data";
import MCPRDataPage from "./mcpr-data";

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

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; osp_user=`);
    const role =
      parts.length === 2
        ? decodeURIComponent(parts.pop()!.split(";").shift() ?? "")
        : null;
    setIsBranch(role === "branch");
  }, []);

  return (
    <Page.Root
      title="MCPR"
      description="Monthly Collection and Performance Report"
    >
      <Page.MainContent>
        {isBranch && (
          <Page.Row>
            <InfoCardAccordion
              icon={<LuUsers size={18} />}
              title="Sales Force"
              subtitle="Filter by agent and transaction month"
              defaultOpen
            >
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "1fr 1fr",
                }}
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
          </Page.Row>
        )}

        <Page.Row>
          <MCPRDataPage />
        </Page.Row>

        <Page.Row>
          <GridItem justifySelf={{ base: "stretch", lg: "end" }}>
            <PrimaryMdButton onClick={handlePrint}>
              View Incentives
            </PrimaryMdButton>
          </GridItem>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
