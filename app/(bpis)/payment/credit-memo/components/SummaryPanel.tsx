"use client";

import { Badge, Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { PrimaryMdFlexButton } from "st-peter-ui";
import Card from "@/components/cards/Card";

interface SummaryPanelProps {
  totalDeposits: number;
  totalPayments: number;
  onSubmit: () => void;
  onSave: () => void;
  onReset: () => void;
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
      <Text fontSize="sm" color="gray.500">
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
    <Box position="sticky" top="6">
      <VStack gap={4} align="stretch">
        <Card.Root title="Batch Summary">
          <Card.MainContent>
            <VStack gap={3} align="stretch">
              <SummaryRow
                label="Total Deposits"
                value={formatCurrency(totalDeposits)}
              />
              <SummaryRow
                label="Total Payments"
                value={formatCurrency(totalPayments)}
              />
              <Box pt={3} borderTopWidth="1px" borderColor="gray.100">
                <HStack justify="space-between" align="end">
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
          </Card.MainContent>
        </Card.Root>

        <Card.Root>
          <Card.MainContent>
            <VStack gap={2} align="stretch">
              <Box>
                <PrimaryMdFlexButton onClick={onSubmit}>
                  Submit Credit Memo
                </PrimaryMdFlexButton>
              </Box>
              <HStack gap={2}>
                <Button flex={1} variant="outline" size="sm" onClick={onSave}>
                  Save Draft
                </Button>
                <Button flex={1} variant="outline" size="sm" onClick={onReset}>
                  Reset
                </Button>
              </HStack>
            </VStack>
          </Card.MainContent>
        </Card.Root>
      </VStack>
    </Box>
  );
}
