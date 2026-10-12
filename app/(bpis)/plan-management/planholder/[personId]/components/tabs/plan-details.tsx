import { Grid, Strong, Textarea } from "@chakra-ui/react";
import React from "react";
import { InfoItem, RowItem } from "osp-ui-kit";
import { PlanDetails } from "@/types/plan-management.types";

export function PlanDetailsPage({
  planDetails,
}: {
  planDetails: PlanDetails | null | undefined;
}) {
  const fields = [
    { label: "LPA Number", value: planDetails?.lpaNo },
    { label: "Account Status", value: planDetails?.accountStatus ?? "—" },
    {
      label: "Termination Status",
      value: planDetails?.terminationStatus ?? "—",
    },
    { label: "Plan", value: planDetails?.planDescription ?? "—" },
    { label: "Mode", value: planDetails?.mode ?? "—" },
    { label: "Term", value: (planDetails?.term ?? "0") + " YEARS" },
    { label: "Plan Class", value: planDetails?.planClass ?? "—" },
    { label: "Account Class", value: planDetails?.accountClass ?? "—" },
    { label: "Plan Code", value: planDetails?.planCode ?? "—" },
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
      value: "₱ " + planDetails?.planTAP.toLocaleString(),
    },
    {
      label: "Effectivity Date",
      value: planDetails?.effectivityDate
        ? new Date(planDetails.effectivityDate).toLocaleDateString()
        : "—",
    },
    {
      label: "New Effectivity Date",
      value: planDetails?.newEffectivityDate
        ? new Date(planDetails.newEffectivityDate).toLocaleDateString()
        : "—",
    },
    { label: "Branch", value: planDetails?.branch ?? "—" },
    { label: "COFP Number", value: planDetails?.cofpNo ?? "—" },
    {
      label: "COFP Date",
      value: planDetails?.cofpDate
        ? new Date(planDetails.cofpDate).toLocaleDateString()
        : "—",
    },
    {
      label: "Service Only",
      value: planDetails?.isServiceOnly ? "YES" : "NO",
    },
    { label: "Sales Agent", value: planDetails?.sfName1 ?? "—" },
    { label: "Sales Agent 2", value: planDetails?.sfName2 ?? "—" },
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
        value={planDetails?.phRemarks ?? ""}
      />
    </React.Fragment>
  );
}
