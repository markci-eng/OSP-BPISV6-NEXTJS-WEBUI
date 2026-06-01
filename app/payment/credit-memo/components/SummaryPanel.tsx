"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Box, Button, HStack, Text, VStack, Badge } from "@chakra-ui/react";

interface SummaryPanelProps {
  totalDeposits: number;
  totalPayments: number;
  onSubmit: () => void;
  onSave: () => void;
  onReset: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <HStack justify="space-between" align="baseline">
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text
        fontVariantNumeric="tabular-nums"
        fontSize={bold ? "xl" : "sm"}
        fontWeight={bold ? "bold" : "medium"}
      >
        {value}
      </Text>
    </HStack>
  );
}

const MotionBox = motion.create(Box);

export function SummaryPanel({
  totalDeposits,
  totalPayments,
  onSubmit,
  onSave,
  onReset,
}: SummaryPanelProps) {
  const net = totalDeposits - totalPayments;
  const isBalanced = net === 0;

  const label = net > 0 ? "Excess" : net < 0 ? "Shortage" : "Balanced";

  return (
    <MotionBox position="sticky" top="6" layout>
      <VStack gap={6} align="stretch">
        {/* Summary Card */}
        <Box
          bg="bg"
          borderWidth="1px"
          borderColor="border.muted"
          rounded="xl"
          p={5}
          boxShadow="sm"
        >
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
            opacity={0.6}
          >
            Batch Summary
          </Text>

          <VStack mt={5} gap={3} align="stretch">
            <SummaryRow
              label="Total Deposits"
              value={formatCurrency(totalDeposits)}
            />
            <SummaryRow
              label="Total Payments"
              value={formatCurrency(totalPayments)}
            />

            <Box pt={3} borderTopWidth="1px" borderColor="border.muted">
              <HStack justify="space-between" align="end">
                <Box>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      Net Collection
                    </Text>

                    {!isBalanced && (
                      <Badge
                        size="sm"
                        colorPalette={net > 0 ? "green" : "red"}
                        variant="subtle"
                      >
                        {label}
                      </Badge>
                    )}
                  </HStack>
                </Box>

                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  fontVariantNumeric="tabular-nums"
                  color={isBalanced ? "green.600" : "red.500"}
                >
                  {formatCurrency(Math.abs(net))}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Actions */}
        <Box
          bg="bg"
          borderWidth="1px"
          borderColor="border.muted"
          rounded="xl"
          p={4}
          boxShadow="sm"
        >
          <VStack gap={2}>
            <Button w="full" colorPalette="blue" onClick={onSubmit}>
              Submit Credit Memo
            </Button>

            <Button w="full" variant="outline" onClick={onSave}>
              Save Batch
            </Button>

            <Button w="full" variant="ghost" color="fg.muted" onClick={onReset}>
              Reset
            </Button>
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}
