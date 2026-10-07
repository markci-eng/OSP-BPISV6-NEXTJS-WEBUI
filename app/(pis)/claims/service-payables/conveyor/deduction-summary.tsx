"use client";

// A FRANCHISE BILLING'S DEDUCTIONS, under the billing on the rail's accounts
// card — read-only. They are posted on the Franchise Deductions page by someone
// outside this team, and the verifier checks them here along with the accounts.
//
// Nothing for a company-owned chapel, and nothing for a franchise billing still
// For Process: it has no deduction to have yet.

import { Box, Flex, Text } from "@chakra-ui/react";
import { formatCSP, type ServiceBilling } from "../service-payables-data";

/** The amber this module marks a franchise and outstanding work in. */
const FRANCHISE_ACCENT = "#b45309";

function Line({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <Flex
      justify="space-between"
      gap={3}
      fontSize="11.5px"
      fontVariantNumeric="tabular-nums"
      color={strong ? "gray.800" : "gray.600"}
      fontWeight={strong ? "700" : "400"}
    >
      <Text>{label}</Text>
      <Text whiteSpace="nowrap">{value}</Text>
    </Flex>
  );
}

export function DeductionSummary({ billing }: { billing: ServiceBilling }) {
  if (!billing.isFranchise) return null;

  if (billing.stage === "for-deduction") {
    return (
      <Flex mt={3} align="center" justify="space-between" gap={2}>
        <Box
          px={2}
          py="1px"
          borderRadius="full"
          bg="#fdf2e3"
          color={FRANCHISE_ACCENT}
          fontSize="11px"
          fontWeight="600"
        >
          For Deduction
        </Box>
        <Text fontSize="11px" color="gray.500">
          Royalty not posted
        </Text>
      </Flex>
    );
  }

  const deduction = billing.deduction;
  if (!deduction) return null;

  return (
    <Box
      mt={3}
      title={
        deduction.postedBy
          ? `Posted by ${deduction.postedBy} on ${deduction.datePosted}`
          : undefined
      }
    >
      <Line label="Gross" value={formatCSP(billing.totalCSP)} />
      <Line label="Royalty" value={`− ${formatCSP(deduction.royalty)}`} />
      <Line label="Loan" value={`− ${formatCSP(deduction.loan)}`} />
      <Box mt="3px" pt="3px" borderTopWidth="1px" borderColor="gray.100">
        <Line label="Net" value={formatCSP(deduction.net)} strong />
      </Box>
    </Box>
  );
}

export default DeductionSummary;
