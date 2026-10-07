"use client";

// Payment History — opened from the ROP Details card's title strip.
//
// WHO, THEN WHAT. The header names the plan (LPA No. and planholder) so the
// list under the rule is read against the right account; the list itself is
// the sales invoices on the ledger, read only.

import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Separator,
  Table,
  Text,
} from "@chakra-ui/react";
import { CreditCard } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { KIT_BORDER } from "../../components/section-card";
import type { RopPayment } from "../data/types";

/** MM/DD/YYYY, matching the ROP Details card. */
function ledgerDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const COLUMNS = ["SI No.", "Payclass", "SI Date", "SI Amount"];

export interface RopPaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpaNo: string;
  planholderName: string;
  /** Oldest first. */
  payments: RopPayment[];
}

export function RopPaymentHistoryDialog({
  open,
  onOpenChange,
  lpaNo,
  planholderName,
  payments,
}: RopPaymentHistoryDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="lg"
      motionPreset="scale"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={3} flexDirection="column" alignItems="stretch">
              <Flex align="center" gap={3}>
                <Box color={BRAND_COLORS.primaryGreen} flexShrink={0}>
                  <CreditCard size={18} />
                </Box>
                <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                  Payment History
                </Dialog.Title>
              </Flex>
              <Flex mt={3} gap={8} wrap="wrap">
                <Box minW={0}>
                  <Text fontSize="xs" color="gray.500">
                    LPA No.
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" fontFamily="mono">
                    {lpaNo}
                  </Text>
                </Box>
                <Box minW={0}>
                  <Text fontSize="xs" color="gray.500">
                    Planholder Name
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {planholderName}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Separator borderColor={KIT_BORDER} />

            <Dialog.Body pt={4}>
              {payments.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
                  No payments on file.
                </Text>
              ) : (
                <Box
                  borderWidth="1px"
                  borderColor={KIT_BORDER}
                  borderRadius="md"
                  overflowX="auto"
                >
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row bg="gray.50">
                        {COLUMNS.map((column) => (
                          <Table.ColumnHeader
                            key={column}
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.600"
                            textTransform="uppercase"
                            whiteSpace="nowrap"
                            textAlign={column === "SI Amount" ? "end" : "start"}
                          >
                            {column}
                          </Table.ColumnHeader>
                        ))}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {payments.map((row) => (
                        <Table.Row
                          key={row.siNo}
                          fontSize="sm"
                          whiteSpace="nowrap"
                        >
                          <Table.Cell fontFamily="mono" fontWeight="semibold">
                            {row.siNo}
                          </Table.Cell>
                          <Table.Cell>{row.payclass}</Table.Cell>
                          <Table.Cell fontFamily="mono">
                            {ledgerDate(row.siDate)}
                          </Table.Cell>
                          <Table.Cell fontFamily="mono" textAlign="end">
                            {peso.format(row.siAmount)}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopPaymentHistoryDialog;
