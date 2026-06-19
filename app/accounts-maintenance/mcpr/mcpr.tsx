"use client";

import { useEffect, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import {
  PrimaryMdButton,
  PrimaryMdFlexButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { LuUsers } from "react-icons/lu";

import Page from "@/claude components/layout/page/Page";
import {
  LookupField,
  LookupColumn,
} from "@/components/common/reusable-lookup/LookUpField";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

import { TrxMonth } from "../data/transaction-month";
import {
  salesForceLookUp,
  SalesForceLookUpData,
} from "../accounts-transfer/sales-force-lookup_data";

const salesForceColumns: LookupColumn<SalesForceLookUpData>[] = [
  { key: "SalesForceCode", header: "Sales Force Code" },
  { key: "AgentName", header: "Agent Name" },
  { key: "PosCode", header: "Position" },
];
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
      headerButton="menu"
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
                  <LookupField<SalesForceLookUpData>
                    placeholder="Select Sales Force"
                    modalTitle="Sales Force List"
                    dataSource={salesForceLookUp}
                    columns={salesForceColumns}
                    searchKeys={["AgentName", "SalesForceCode"]}
                    onSelect={setSelectedAgent}
                    renderDisplay={(item) =>
                      `${item.AgentName} (${item.SalesForceCode})`
                    }
                    value={selectedAgent}
                  />
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
            <PrimaryMdFlexButton /*onClick={handlePrint}*/>
              View Incentives
            </PrimaryMdFlexButton>
          </GridItem>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
