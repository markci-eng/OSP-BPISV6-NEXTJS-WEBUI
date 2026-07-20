import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { Grid, Separator, Strong, Textarea } from "@chakra-ui/react";
import React from "react";
import { RowItem } from "@/components/info-card/row-item";
import InfoItem from "@/components/new-planholder-profile/components/info-item/info-item";

export function PlanDetailsPage({
  planDetails,
}: {
  planDetails: PlanDetailType;
}) {
  const fields = [
    { label: "LPA Number", value: planDetails.lpaNumber },
    { label: "Account Status", value: planDetails?.accountStatus ?? "N/A" },
    {
      label: "Termination Status",
      value: planDetails?.terminationStatus ?? "N/A",
    },
    { label: "Plan", value: planDetails?.planDescription ?? "N/A" },
    { label: "Mode", value: planDetails?.mode ?? "N/A" },
    { label: "Term", value: (planDetails?.term ?? "0") + " YEARS" },
    { label: "Plan Class", value: planDetails?.planClass ?? "N/A" },
    { label: "Account Class", value: planDetails?.accountClass ?? "N/A" },
    { label: "Plan Code", value: planDetails?.planCode ?? "N/A" },
    {
      label: "Contract Price",
      value: "₱ " + planDetails?.contractPrice.toLocaleString(),
    },
    {
      label: "Installment Amount",
      value: "₱ " + planDetails?.installmentAmount.toLocaleString(),
    },
    {
      label: "Total Amount Payable",
      value: "₱ " + planDetails?.totalAmountPayable.toLocaleString(),
    },
    {
      label: "Effectivity Date",
      value: planDetails?.effectivityDate.toLocaleDateString() ?? "N/A",
    },
    {
      label: "New Effectivity Date",
      value: planDetails?.newEffectivityDate.toLocaleDateString() ?? "N/A",
    },
    { label: "Branch", value: planDetails?.branch ?? "N/A" },
    { label: "COFP Number", value: planDetails?.cfpNumber ?? "N/A" },
    {
      label: "COFP Date",
      value: planDetails?.cfpDate?.toLocaleDateString() ?? "N/A",
    },
    {
      label: "Service Only",
      value: planDetails?.isServiceOnly ? "YES" : "NO",
    },
    { label: "Sales Agent", value: planDetails?.salesAgent1 ?? "N/A" },
    { label: "Sales Agent 2", value: planDetails?.salesAgent2 ?? "N/A" },
  ];

  return (
    <React.Fragment>
      {/* Desktop: grid of InfoItems */}
      <Grid
        display={{ base: "none", lg: "grid" }}
        py={3}
        templateColumns="repeat(4, 1fr)"
        gap={2}
      >
        {fields.map((field) => (
          <InfoItem key={field.label} label={field.label} value={field.value} />
        ))}
      </Grid>

      {/* Mobile: RowItems */}
      <Grid
        display={{ base: "grid", lg: "none" }}
        py={3}
        templateColumns="1fr"
        gap={2}
      >
        {fields.map((field) => (
          <RowItem key={field.label} label={field.label} value={field.value} />
        ))}
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
