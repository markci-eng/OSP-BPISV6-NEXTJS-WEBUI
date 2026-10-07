"use client";

// WHAT A PAYEE SECTION SHOWS WHEN THE CLAIM HAS NONE — an error, not an empty
// state (user, 2026-09-29).
//
// A payee is filed with the claim request, so there is no claim that
// legitimately has none: the database refuses to load a request without one.
// Reaching this means the data is wrong, and a grey "No payees yet" would read
// as a claim waiting for something — which is exactly the claim nobody chases.
//
// Shared by every payee section so the two can never disagree about it.

import { Flex, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export function MissingPayee() {
  return (
    <Flex
      align="center"
      gap={2}
      px={3}
      py={2.5}
      borderRadius="md"
      bg={BRAND_COLORS.errorBg}
      color={BRAND_COLORS.errorRed}
      role="alert"
    >
      <LuTriangleAlert size={16} />
      <Text fontSize="sm" fontWeight="600">
        No payee on this claim request
      </Text>
    </Flex>
  );
}

/**
 * THE LAST PAYEE CANNOT BE REMOVED — the rule above, from the other side.
 * Removing it would make the error by hand. Checked before the confirmation,
 * so nobody is asked to confirm something that will not happen.
 */
export const LAST_PAYEE_MESSAGE =
  "A claim request must keep at least one payee. Add another before removing this one.";

export default MissingPayee;
