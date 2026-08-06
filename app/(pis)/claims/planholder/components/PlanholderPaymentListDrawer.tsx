"use client";

import { Box, Drawer, Flex, Portal, Text, VStack } from "@chakra-ui/react";
import { LuChevronLeft, LuReceipt } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderPayment } from "../../claims-data";
import { PaymentRow } from "./PaymentRow";

interface PlanholderPaymentListDrawerProps {
  payments: PlanholderPayment[];
  open: boolean;
  onClose: () => void;
}

/**
 * The full payment list — a dedicated bottom sheet opened from the section's
 * "View all". Every receipt is rendered at once rather than paged in as the
 * user scrolls: a plan's ledger is bounded and the rows are cheap, so batching
 * only bought a list that grew under the scrollbar. Payments are read-only, so
 * there is no add/remove chrome.
 */
export function PlanholderPaymentListDrawer({
  payments,
  open,
  onClose,
}: PlanholderPaymentListDrawerProps) {
  const count = payments.length;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            display="flex"
            flexDirection="column"
            h="100dvh"
            maxH="100dvh"
            borderRadius={0}
            overflow="hidden"
          >
            <Drawer.Header
              borderBottomWidth="1px"
              borderColor="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Flex align="center" gap={2} minW={0}>
                {/* Back — green chevron, soft green hover (matches the payee
                    and document drawer chrome). */}
                <Flex
                  as="button"
                  align="center"
                  onClick={onClose}
                  cursor="pointer"
                  color="green.600"
                  _dark={{ color: "green.400" }}
                  aria-label="Go back"
                  flexShrink={0}
                  px={1}
                  py={1}
                  mr={1}
                  borderRadius="md"
                  _hover={{ bg: "green.50" }}
                  _active={{ transform: "scale(0.93)" }}
                  transition="all 0.14s ease"
                  userSelect="none"
                >
                  <LuChevronLeft size={20} strokeWidth={2.5} />
                </Flex>
                <Box minW={0}>
                  <Drawer.Title>
                    <Text fontWeight="bold" color={BRAND_COLORS.darkGreen} truncate>
                      Payments
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {count} {count === 1 ? "receipt" : "receipts"} on record
                  </Text>
                </Box>
              </Flex>
            </Drawer.Header>

            <Drawer.Body py={5} overflowY="auto">
              {count === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  textAlign="center"
                  py={16}
                  gap={3}
                >
                  <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
                    <LuReceipt size={24} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      No payments yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1} maxW="280px">
                      Official receipts posted for this plan will appear here.
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <VStack align="stretch" gap={2}>
                  {payments.map((payment) => (
                    <PaymentRow key={payment.orNo} payment={payment} />
                  ))}
                </VStack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderPaymentListDrawer;
