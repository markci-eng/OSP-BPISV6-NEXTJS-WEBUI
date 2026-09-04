"use client";

// The billings that have been created, newest period first — the rail's second
// panel.
//
// This is the counterpart to the death dashboard's Recent Updates: not a feed of
// status changes (there is no activity history for a billing yet), but the
// nearest true thing — the billings that HAVE a number, which is the one event
// in this module's life that is recorded. A billing appearing here is a billing
// somebody created.
//
// It leads with the Billing No rather than the code, and the two are not
// interchangeable: the code is derivable by anyone from a chapel and a date, the
// number is what the billing is quoted by once it exists. A row is here BECAUSE
// it has one.

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuReceipt } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionTitle } from "../../components/section-title";
import {
  BILLING_STAGE_LABELS,
  discrepancyLabel,
  formatCSP,
  type ServiceBilling,
} from "../service-payables-data";

/** How many rows the panel shows; the heading carries the true total. */
const VISIBLE = 4;

/** The same red the overview tile and the territory cards use. */
const DEFICIENCY_ACCENT = "#e11d48";

/** Stage colours — the two ends of the run, and the middle left neutral. */
const STAGE_COLOR: Record<string, string> = {
  processed: BRAND_COLORS.gold,
  verified: BRAND_COLORS.primaryGreen,
  approved: BRAND_COLORS.darkGreen,
};

function BillingRow({ billing }: { billing: ServiceBilling }) {
  const color = STAGE_COLOR[billing.stage] ?? "gray.500";

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      bg="white"
      p={2.5}
    >
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Box minW={0} flex="1">
          <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
            {billing.billingNo}
          </Text>
          <Text fontSize="11px" fontWeight="600" color="gray.600" truncate>
            {billing.chapelDesc}
            <Text as="span" fontWeight="400" color="gray.500">
              {" · "}
              {billing.billingCode}
            </Text>
          </Text>
          <Text fontSize="10px" color="gray.400" mt="1px" truncate>
            {billing.periodLabel}
          </Text>
          {/* Who created it. The panel's whole premise is that a row here is a
              billing somebody created, and the work column beside it now groups
              the created ones by exactly this name — so leaving it off would
              make the rail the one place that says the event without saying
              whose it was. */}
          {billing.processedBy && (
            <Text fontSize="10px" fontWeight="600" color="gray.500" mt="2px" truncate>
              {billing.processedBy}
            </Text>
          )}
        </Box>

        <Box textAlign="right" flexShrink={0}>
          {/* A billing whose every service has a discrepancy totals zero, and a
              bare "Php 0.00" reads as a bug rather than as a blocked billing.
              Where there is nothing billable, the discrepancy count takes the
              slot and says why the figure would have been zero. */}
          {billing.services.length === 0 && billing.discrepant.length > 0 ? (
            // ONLY A DISCREPANCY TAKES THE SLOT. A billing emptied by paperwork
            // fills in by itself as the documents arrive and is nobody's
            // exception; it shows its total like every other row, and that total
            // being zero is the truth about it today.
            <Text
              fontSize="11px"
              fontWeight="700"
              color={DEFICIENCY_ACCENT}
              whiteSpace="nowrap"
            >
              {discrepancyLabel(billing.discrepant.length)}
            </Text>
          ) : (
            <Text fontSize="11px" fontWeight="700" color="gray.700" whiteSpace="nowrap">
              {formatCSP(billing.totalCSP)}
            </Text>
          )}
          <Text fontSize="10px" fontWeight="600" style={{ color }} mt="1px">
            {BILLING_STAGE_LABELS[billing.stage]}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export interface RecentBillingsProps {
  billings: ServiceBilling[];
}

export function RecentBillings({ billings }: RecentBillingsProps) {
  const shown = billings.slice(0, VISIBLE);

  return (
    <Box>
      <SectionTitle
        title="Recent Billings"
        subtitle={
          billings.length === 0
            ? "No billing has been created yet"
            : `${shown.length} of ${billings.length} created`
        }
        icon={<LuReceipt size={18} />}
      />

      {billings.length === 0 ? (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderStyle="dashed"
          borderRadius="lg"
          py={5}
          px={3}
          textAlign="center"
        >
          <Text fontSize="xs" color="gray.400">
            Create a billing on a chapel to issue its number.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap={2}>
          {shown.map((billing) => (
            <BillingRow key={billing.billingCode} billing={billing} />
          ))}
        </Flex>
      )}
    </Box>
  );
}

export default RecentBillings;
