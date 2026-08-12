"use client";

// A declared beneficiary as a card — the compact row every other list on this
// page uses: a green person chip, the name over what they are to the plan
// holder, and the one number that belongs on the right.
//
// This is the shape Payee's Information keeps, and the two sections list the
// same kind of thing — a named person with one figure against them. An earlier
// pass gave beneficiaries a taller card of their own (birth date, age and
// address, no chip), which made two lists of people on one page read as two
// different kinds of record. The layout is back to the shared one.
//
// It is drawn here rather than through {@link SwipeToRemoveRow} because the
// section is read-only for claims: the shell below is that row's, minus the
// gesture, the cursor and the tap. See the note on `PlanholderBeneficiaries`.
//
// Payout channels stay out of it. A channel matters when someone is being PAID,
// which is a question the claim asks about its payee, not a question this
// section answers about a person the plan holder named years ago.

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderBeneficiary } from "../../claims-data";

/**
 * One declared beneficiary: who they are, what they are to the plan holder, and
 * how old they are.
 *
 * The age sits where the payee row puts the amount — it is the figure this list
 * is read for, the same way the amount is the figure that one is read for.
 */
export function BeneficiaryCard({
  beneficiary,
}: {
  beneficiary: PlanholderBeneficiary;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={2}
            borderRadius="lg"
            bg="#eaf5ee"
            color={BRAND_COLORS.darkGreen}
            flexShrink={0}
          >
            <LuUser size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {beneficiary.name}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {beneficiary.relation}
            </Text>
          </Box>
        </Flex>

        {/* Dropped rather than dashed when the age is not on file: "— / years
            old" reads as a beneficiary aged nothing, and the row is legible
            without it. */}
        {beneficiary.age ? (
          <Box textAlign="right" flexShrink={0}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="gray.800"
              whiteSpace="nowrap"
            >
              {beneficiary.age}
            </Text>
            <Text fontSize="11px" color="gray.500" whiteSpace="nowrap">
              years old
            </Text>
          </Box>
        ) : null}
      </Flex>
    </Box>
  );
}

export default BeneficiaryCard;
