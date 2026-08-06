"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { PlanholderPayment } from "../../claims-data";

/**
 * A single payment (official receipt) — the same compact row as a document,
 * minus the leading file icon (a payment has no file to represent). The OR
 * number and its pay class sit on the left; the amount and OR date on the right.
 */
export function PaymentRow({ payment }: { payment: PlanholderPayment }) {
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
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            {payment.orNo}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {payment.payClass}
          </Text>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" whiteSpace="nowrap">
            {payment.amountDisplay}
          </Text>
          <Text fontSize="11px" color="gray.500" whiteSpace="nowrap">
            {payment.orDate}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default PaymentRow;
