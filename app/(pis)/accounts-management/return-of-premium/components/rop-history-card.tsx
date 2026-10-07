"use client";

// ROP History — the top of the ROP Schedule card, above the schedule and its
// validation lists (user, 2026-09-24).
//
// ONE ROW PER RELEASE ON FILE, oldest first, read only. It is a table rather than
// `InfoRow`s because it is an audit record: the columns are what a processor
// compares against the release they are about to set. It scrolls sideways
// inside its own card rather than widening the panel.

import { Box, Flex, Table, Text } from "@chakra-ui/react";
import { OSPBadge } from "osp-ui-kit";
import { History } from "lucide-react";

import { KIT_BORDER } from "../../components/section-card";
import type { RopHistory } from "../data/types";

/** MM/DD/YYYY, matching the ROP Details card. */
function ledgerDate(iso: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const COLUMNS = [
  "ROP Schedule",
  "ROP Date",
  "Is Claimed",
  "Date Claimed",
  "ROP No.",
  "Batch No.",
  "Payee Name",
  "Amount",
  "Payout Channel",
];

export interface RopHistoryCardProps {
  /** Oldest first, one row per release. */
  history: RopHistory[];
  /**
   * The "ROP History" strip over the table. On by default; off where the
   * table sits under a heading that already says so — Transfer's ROP History
   * dialog.
   */
  showHeader?: boolean;
}

export function RopHistoryCard({
  history,
  showHeader = true,
}: RopHistoryCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderColor={KIT_BORDER}
      borderRadius="md"
      overflow="hidden"
    >
      {showHeader && (
        <Flex align="center" gap={2} px={3} py={2}>
          <Box color="purple.600">
            <History size={14} />
          </Box>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.700"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            ROP History
          </Text>
          <Text fontSize="xs" fontFamily="mono" color="gray.400">
            {history.length === 1
              ? "(Single-row audit record)"
              : `(${history.length} releases on file)`}
          </Text>
        </Flex>
      )}

      <Box overflowX="auto">
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
                >
                  {column}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {history.map((row) => (
              <Table.Row
                key={row.scheduleNo}
                fontSize="sm"
                whiteSpace="nowrap"
              >
                <Table.Cell fontWeight="semibold" color="blue.700">
                  {row.scheduleNo}
                </Table.Cell>
                <Table.Cell fontFamily="mono">
                  {ledgerDate(row.ropDate)}
                </Table.Cell>
                <Table.Cell>
                  <OSPBadge type={row.isClaimed ? "success" : "danger"}>
                    {row.isClaimed ? "Yes" : "No"}
                  </OSPBadge>
                </Table.Cell>
                <Table.Cell fontFamily="mono">
                  {ledgerDate(row.dateClaimed)}
                </Table.Cell>
                <Table.Cell fontFamily="mono" fontWeight="semibold">
                  {row.ropNo}
                </Table.Cell>
                <Table.Cell fontFamily="mono" color="gray.500">
                  {row.batchNo}
                </Table.Cell>
                <Table.Cell>{row.payeeName}</Table.Cell>
                <Table.Cell fontFamily="mono">
                  {peso.format(row.amount)}
                </Table.Cell>
                <Table.Cell>{row.channel}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}

export default RopHistoryCard;
