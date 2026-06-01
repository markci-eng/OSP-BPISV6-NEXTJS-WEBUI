"use client";

import * as React from "react";
import { Box, Button, Icon, Table, Text } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Payment } from "./types";

interface PaymentTableProps {
  payments: Payment[];
  onRemove: (id: string) => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

const MotionTr = motion.create("tr");

export function PaymentTable({ payments, onRemove }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted" py={4}>
        No payments added yet.
      </Text>
    );
  }

  return (
    <Box
      rounded="lg"
      borderWidth="1px"
      borderColor="border.muted"
      overflow="hidden"
    >
      <Table.Root size="sm" variant="line">
        <Table.Header bg="bg.muted">
          <Table.Row>
            <Table.ColumnHeader fontWeight="medium">
              Planholder
            </Table.ColumnHeader>

            <Table.ColumnHeader textAlign="center" fontWeight="medium">
              SI No
            </Table.ColumnHeader>

            <Table.ColumnHeader textAlign="center" fontWeight="medium">
              Installments
            </Table.ColumnHeader>

            <Table.ColumnHeader textAlign="center" fontWeight="medium">
              Pay Class
            </Table.ColumnHeader>

            <Table.ColumnHeader textAlign="right" fontWeight="medium">
              Amount
            </Table.ColumnHeader>

            <Table.ColumnHeader w="40px" />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <AnimatePresence mode="popLayout">
            {payments.map((p) => (
              <MotionTr
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{ cursor: "default" }}
              >
                <Table.Cell fontWeight="medium" fontSize="sm">
                  {p.planholderName}
                </Table.Cell>

                <Table.Cell
                  textAlign="center"
                  fontSize="sm"
                  fontVariantNumeric="tabular-nums"
                >
                  {p.siNumber}
                </Table.Cell>

                <Table.Cell
                  textAlign="center"
                  fontSize="sm"
                  fontVariantNumeric="tabular-nums"
                >
                  {p.installments}
                </Table.Cell>

                <Table.Cell textAlign="center" fontSize="sm">
                  {p.payClass}
                </Table.Cell>

                <Table.Cell
                  textAlign="right"
                  fontSize="sm"
                  fontWeight="medium"
                  fontVariantNumeric="tabular-nums"
                >
                  {formatCurrency(p.amount)}
                </Table.Cell>

                <Table.Cell textAlign="right">
                  <Button
                    variant="ghost"
                    size="xs"
                    color="fg.muted"
                    _hover={{ color: "red.500", bg: "red.50" }}
                    onClick={() => onRemove(p.id)}
                  >
                    <Icon as={Trash2} boxSize={3.5} />
                  </Button>
                </Table.Cell>
              </MotionTr>
            ))}
          </AnimatePresence>
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
