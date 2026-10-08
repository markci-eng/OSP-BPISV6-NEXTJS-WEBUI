"use client";

// The contents of Reinstatement's Plan Details card, stacked in one column:
// the plan being reinstated, then the account's standing. Untitled — the Plan
// Details strip names them both. Rows are the same `InfoRow` as Return of
// Premium and Edit RITF.

import { Box, Flex, Text } from "@chakra-ui/react";
import { OSPBadge } from "osp-ui-kit";

import { formatFiledDate } from "@/app/(pis)/data";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { InfoRow } from "../../components/section-card";
import { formatTerminationStatus } from "../../data/termination-status";
import type {
  ReinstatementAccountDetails,
  ReinstatementPlanInfo,
} from "../data/types";

function peso(value: number): string {
  return value.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
}

function date(iso?: string): string | undefined {
  return iso ? formatFiledDate(iso) : undefined;
}

function YesNo({ value }: { value: boolean }) {
  return (
    <OSPBadge type={value ? "success" : "danger"}>
      {value ? "Yes" : "No"}
    </OSPBadge>
  );
}

export function ReinstatementInfoSection({
  plan,
}: {
  plan: ReinstatementPlanInfo;
}) {
  return (
    <Flex direction="column" minW={0}>
      <InfoRow label="Plan Type" value={plan.planDescription} />
      <InfoRow label="Plan Code" value={plan.planCode} />
      <InfoRow
        label="New Effectivity Date"
        value={date(plan.newEffectivityDate)}
      />
      <InfoRow label="Due Date" value={date(plan.dueDate)} />
      <InfoRow label="Lapsation Date" value={date(plan.lapsationDate)} />
      <InfoRow label="Forfeiture Date" value={date(plan.forfeitureDate)} />
      <InfoRow label="Amount" value={peso(plan.amount)} />
      <InfoRow label="Balance" value={peso(plan.balance)} />
      <InfoRow label="Contract Price" value={peso(plan.contractPrice)} />
    </Flex>
  );
}

// TOTAL AMOUNT PAYABLE — the figure the card adds up to, so it is set apart:
// a tinted block across the full width of the card's foot, under both
// columns, in the brand green, at a size nothing above it uses.
export function ReinstatementTotalPayable({ amount }: { amount: number }) {
  return (
    <Box pt={2}>
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        px={3}
        py={1.5}
        borderWidth="1px"
        borderColor="green.200"
        borderRadius="md"
        bg="green.50"
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.04em"
          textTransform="uppercase"
          color={BRAND_COLORS.darkGreen}
        >
          Total Amount Payable
        </Text>
        <Text
          fontSize="lg"
          fontWeight="800"
          color={BRAND_COLORS.darkGreen}
          whiteSpace="nowrap"
        >
          {peso(amount)}
        </Text>
      </Flex>
    </Box>
  );
}

export function ReinstatementDetailsSection({
  account,
}: {
  account: ReinstatementAccountDetails;
}) {
  return (
    <Flex direction="column" minW={0}>
      <InfoRow label="Account Status" value={account.accountStatus} />
      <InfoRow label="Termination Status" value={formatTerminationStatus(account.terminationStatus)}
      />
      <InfoRow label="Date of Death" value={date(account.dateOfDeath)} />
      <InfoRow
        label="Account Verified"
        value={<YesNo value={account.accountVerified} />}
      />
      <InfoRow label="With COFP" value={<YesNo value={account.withCofp} />} />
      {account.withCofp && (
        <InfoRow label="COFP No." value={account.cofpNo} />
      )}
      <InfoRow label="Last TF Payment" value={date(account.lastTfPayment)} />
    </Flex>
  );
}
