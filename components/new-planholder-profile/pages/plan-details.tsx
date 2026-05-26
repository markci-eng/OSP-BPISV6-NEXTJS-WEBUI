import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import {
  Grid,
  Separator,
  Show,
  Strong,
  Textarea,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";
import InfoItem from "../components/info-item/info-item";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

export function PlanDetailsPage({
  planDetails,
}: {
  planDetails: PlanDetailType;
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <React.Fragment>
      <Grid
        py={3}
        templateColumns={{
          base: "1fr",
          md: "repeat(3, 1fr)",
        }}
        gap={{ base: 2, md: 4 }}
      >
        <InfoItem
          label="LPA Number"
          value={planDetails.lpaNumber}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Account Status"
          value={planDetails?.accountStatus ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
          color={
            planDetails.accountStatus === "LAPSED"
              ? BRAND_COLORS.warningText
              : BRAND_COLORS.primaryGreen
          }
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Termination Status"
          value={planDetails?.terminationStatus ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
          color={
            planDetails.terminationStatus === "NOT YET TERMINATED"
              ? BRAND_COLORS.primaryGreen
              : BRAND_COLORS.destructiveRed
          }
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Plan"
          value={planDetails?.planDescription ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Mode"
          value={planDetails?.mode ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Term"
          value={(planDetails?.term ?? "0") + " YEARS"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Plan Class"
          value={planDetails?.planClass ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Account Class"
          value={planDetails?.accountClass ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Plan Code"
          value={planDetails?.planCode ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Contract Price"
          value={"₱ " + planDetails?.contractPrice.toLocaleString()}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Installment Amount"
          value={"₱ " + planDetails?.installmentAmount.toLocaleString()}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Total Amount Payable"
          value={"₱ " + planDetails?.totalAmountPayable.toLocaleString()}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Effectivity Date"
          value={planDetails?.effectivityDate.toLocaleDateString() ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="New Effectivity Date"
          value={planDetails?.newEffectivityDate.toLocaleDateString() ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Branch"
          value={planDetails?.branch ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="COFP Number"
          value={planDetails?.cfpNumber ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="COFP Date"
          value={planDetails?.cfpDate?.toLocaleDateString() ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Service Only"
          value={planDetails?.isServiceOnly ? "YES" : "NO"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Sales Agent"
          value={planDetails?.salesAgent1 ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
        <InfoItem
          label="Sales Agent 2"
          value={planDetails?.salesAgent2 ?? "N/A"}
          orientation={isMobile ? "horizontal" : "vertical"}
        />
        <Show when={isMobile}>
          <Separator />
        </Show>
      </Grid>
      <Strong>Remarks</Strong>
      <Textarea
        minH={isMobile ? "200px" : "auto"}
        mt={2}
        borderRadius={STANDARD_RADIUS.md}
        borderColor="gray.200"
        placeholder="Planholder Remarks"
        readOnly
        value={
          "NIP/MEMORIAL SERVICE ONLY;REINSTATED||LOPEZ BR. SOA BY:E.T SILVALA**flr FP-10/3/05CfpNo S05-005352 CfpDate 2005-12-22"
        }
      />
    </React.Fragment>
  );
}
