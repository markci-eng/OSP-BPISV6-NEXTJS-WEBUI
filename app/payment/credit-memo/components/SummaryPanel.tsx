"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Box, Button, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

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
      <VStack gap={4} align="stretch">
        {/* Summary Card */}
        <Box
          bg={BRAND_COLORS.white}
          borderWidth="1px"
          borderColor={BRAND_COLORS.neutralBorder}
          borderRadius={STANDARD_RADIUS.md}
          p={{ base: 4, md: 5 }}
          boxShadow={STANDARD_SHADOWS.level1}
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

            <Box
              pt={3}
              borderTopWidth="1px"
              borderColor={BRAND_COLORS.neutralBorder}
            >
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
                  color={
                    isBalanced
                      ? BRAND_COLORS.primaryGreen
                      : BRAND_COLORS.destructiveRed
                  }
                >
                  {formatCurrency(Math.abs(net))}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Actions */}
        <Box
          bg={BRAND_COLORS.white}
          borderWidth="1px"
          borderColor={BRAND_COLORS.neutralBorder}
          borderRadius={STANDARD_RADIUS.md}
          p={4}
          boxShadow={STANDARD_SHADOWS.level1}
        >
          <VStack gap={2}>
            <Button w="full" variant="ghost" color="fg.muted" onClick={onReset}>
              Reset
            </Button>

            <Button
              w="full"
              variant="outline"
              borderColor={BRAND_COLORS.primaryGreen}
              color={BRAND_COLORS.primaryGreen}
              _hover={{ bg: BRAND_COLORS.successBg }}
              onClick={onSave}
            >
              Save Batch
            </Button>

            <Button
              w="full"
              bg={BRAND_COLORS.primaryGreen}
              color={BRAND_COLORS.white}
              _hover={{ bg: BRAND_COLORS.darkGreen }}
              onClick={onSubmit}
            >
              Submit Credit Memo
            </Button>
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}
