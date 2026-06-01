import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import {
  Grid,
  Separator,
  Strong,
  Textarea,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";
import LabelText from "@/components/texts/LabelText";

export function PlanDetailsPage({
  planDetails,
}: {
  planDetails: PlanDetailType;
}) {
  return (
    <React.Fragment>
      <Grid
        py={3}
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={2}
      >
        <LabelText label="LPA Number" value={planDetails.lpaNumber} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Account Status"
          value={planDetails?.accountStatus ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Termination Status"
          value={planDetails?.terminationStatus ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Plan" value={planDetails?.planDescription ?? "N/A"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Mode" value={planDetails?.mode ?? "N/A"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Term" value={(planDetails?.term ?? "0") + " YEARS"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Plan Class" value={planDetails?.planClass ?? "N/A"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Account Class"
          value={planDetails?.accountClass ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Plan Code" value={planDetails?.planCode ?? "N/A"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Contract Price"
          value={"₱ " + planDetails?.contractPrice.toLocaleString()}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Installment Amount"
          value={"₱ " + planDetails?.installmentAmount.toLocaleString()}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Total Amount Payable"
          value={"₱ " + planDetails?.totalAmountPayable.toLocaleString()}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Effectivity Date"
          value={planDetails?.effectivityDate.toLocaleDateString() ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="New Effectivity Date"
          value={planDetails?.newEffectivityDate.toLocaleDateString() ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText label="Branch" value={planDetails?.branch ?? "N/A"} />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="COFP Number"
          value={planDetails?.cfpNumber ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="COFP Date"
          value={planDetails?.cfpDate?.toLocaleDateString() ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Service Only"
          value={planDetails?.isServiceOnly ? "YES" : "NO"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Sales Agent"
          value={planDetails?.salesAgent1 ?? "N/A"}
        />
        {useBreakpointValue({ base: true, lg: false }) && <Separator />}
        <LabelText
          label="Sales Agent 2"
          value={planDetails?.salesAgent2 ?? "N/A"}
        />
      </Grid>
      <Strong>Remarks</Strong>
      <Textarea
        minH={{ base: "200px", md: "auto" }}
        placeholder="Planholder Remarks"
        readOnly
        value={
          "NIP/MEMORIAL SERVICE ONLY;REINSTATED||LOPEZ BR. SOA BY:E.T SILVALA**flr FP-10/3/05CfpNo S05-005352 CfpDate 2005-12-22"
        }
      />
    </React.Fragment>
  );
}
