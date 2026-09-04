"use client";

// The supplementary module's queue — plan holders whose discrepancy was put
// right AFTER their billing had gone to accounting.
//
// WHY IT IS ONLY ON THE ENDORSED STAGES. A corrected discrepancy on a billing
// that is still For Process or Processed needs nothing special at all: the
// service simply becomes billable on the billing it was always on, and the
// processor terminates it as they would have. Only once accounting has the
// billing does the correction have nowhere to go — the total has been booked
// outside this department and a plan added to it now would move a figure
// somebody else is working to. That plan is billed supplementarily instead.
//
// So an EMPTY panel is the healthy state, and it says so rather than
// disappearing. A queue that is only visible when it has something in it is a
// queue nobody learns the shape of.
//
// WHAT IT DOES NOT DO is bill anything. The rules describe two options for a
// corrected discrepancy and leave the choice for later, so this identifies the
// work and stops — no supplementary number, no amount committed. The panel says
// that in as many words, for the same reason the CSP figures say "Provisional".

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFilePlus2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { formatFiledDate } from "../../../data";
import { SectionTitle } from "../../components/section-title";
import {
  SUPPLEMENTARY_RULE_PENDING,
  deceasedName,
  formatServiceCSP,
  type SupplementaryItem,
} from "../service-payables-data";

export interface SupplementaryPanelProps {
  items: SupplementaryItem[];
}

export function SupplementaryPanel({ items }: SupplementaryPanelProps) {
  return (
    <Box>
      <SectionTitle
        title="Supplementary"
        subtitle={
          items.length === 0
            ? "Nothing waiting — corrections here are billed on the original billing"
            : `${items.length} ${items.length === 1 ? "plan" : "plans"} corrected after endorsement`
        }
        icon={<LuFilePlus2 size={18} />}
        iconColor={BRAND_COLORS.darkGreen}
      />

      {items.length === 0 ? (
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
            A discrepancy put right before its billing is endorsed goes back onto
            that billing. Only the ones corrected afterwards land here.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap={2}>
          {items.map(({ service, billing, resolved }) => (
            <Box
              key={service.id}
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              bg="white"
              px={3}
              py={2.5}
            >
              <Flex justify="space-between" align="flex-start" gap={3}>
                <Box minW={0}>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.800"
                    truncate
                  >
                    {service.lpaNo}
                    <Text as="span" fontWeight="400" color="gray.500">
                      {" · "}
                      {deceasedName(service)}
                    </Text>
                  </Text>
                  {/* The correction in the processor's own words — the only
                      record of why this plan stopped being held. */}
                  <Text fontSize="11px" color="gray.600" mt="2px">
                    {resolved.note}
                  </Text>
                  <Text fontSize="10px" color="gray.400" mt="2px" truncate>
                    {billing.billingNo ?? billing.billingCode} ·{" "}
                    {billing.chapelDesc} · resolved by {resolved.resolvedBy} on{" "}
                    {formatFiledDate(resolved.resolvedAtISO)}
                  </Text>
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="gray.400"
                  whiteSpace="nowrap"
                >
                  {formatServiceCSP(service.csp)}
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}

      {SUPPLEMENTARY_RULE_PENDING && (
        <Text fontSize="10px" color="gray.400" mt={2} lineHeight="1.5">
          What a supplementary billing pays, and on whose number, is not settled
          yet. Nothing here has been billed.
        </Text>
      )}
    </Box>
  );
}

export default SupplementaryPanel;
