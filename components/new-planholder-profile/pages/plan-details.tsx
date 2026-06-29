import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { Grid, Separator, Strong, Textarea } from "@chakra-ui/react";
import React from "react";
import { RowItem } from "@/components/info-card/row-item";

export function PlanDetailsPage({
  planDetails,
}: {
  planDetails: PlanDetailType;
}) {
  return (
    <React.Fragment>
      <Grid py={3} templateColumns={"1fr"} gap={2}>
        <RowItem label="LPA Number" value={planDetails.lpaNumber} />
        <RowItem
          label="Account Status"
          value={planDetails?.accountStatus ?? "N/A"}
        />
        <RowItem
          label="Termination Status"
          value={planDetails?.terminationStatus ?? "N/A"}
        />
        <RowItem label="Plan" value={planDetails?.planDescription ?? "N/A"} />
        <RowItem label="Mode" value={planDetails?.mode ?? "N/A"} />
        <RowItem label="Term" value={(planDetails?.term ?? "0") + " YEARS"} />
        <RowItem label="Plan Class" value={planDetails?.planClass ?? "N/A"} />
        <RowItem
          label="Account Class"
          value={planDetails?.accountClass ?? "N/A"}
        />
        <RowItem label="Plan Code" value={planDetails?.planCode ?? "N/A"} />
        <RowItem
          label="Contract Price"
          value={"₱ " + planDetails?.contractPrice.toLocaleString()}
        />
        <RowItem
          label="Installment Amount"
          value={"₱ " + planDetails?.installmentAmount.toLocaleString()}
        />
        <RowItem
          label="Total Amount Payable"
          value={"₱ " + planDetails?.totalAmountPayable.toLocaleString()}
        />
        <RowItem
          label="Effectivity Date"
          value={planDetails?.effectivityDate.toLocaleDateString() ?? "N/A"}
        />
        <RowItem
          label="New Effectivity Date"
          value={planDetails?.newEffectivityDate.toLocaleDateString() ?? "N/A"}
        />
        <RowItem label="Branch" value={planDetails?.branch ?? "N/A"} />
        <RowItem label="COFP Number" value={planDetails?.cfpNumber ?? "N/A"} />
        <RowItem
          label="COFP Date"
          value={planDetails?.cfpDate?.toLocaleDateString() ?? "N/A"}
        />
        <RowItem
          label="Service Only"
          value={planDetails?.isServiceOnly ? "YES" : "NO"}
        />
        <RowItem
          label="Sales Agent"
          value={planDetails?.salesAgent1 ?? "N/A"}
        />
        <RowItem
          label="Sales Agent 2"
          value={planDetails?.salesAgent2 ?? "N/A"}
        />
      </Grid>
      <Strong my={2}>Remarks</Strong>
      <Textarea
        minH={"200px"}
        placeholder="Planholder Remarks"
        readOnly
        value={
          "NIP/MEMORIAL SERVICE ONLY;REINSTATED||LOPEZ BR. SOA BY:E.T SILVALA**flr FP-10/3/05CfpNo S05-005352 CfpDate 2005-12-22"
        }
      />
    </React.Fragment>
  );
}
