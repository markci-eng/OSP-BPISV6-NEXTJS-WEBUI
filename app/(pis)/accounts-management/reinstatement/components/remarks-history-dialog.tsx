"use client";

// Remarks History — opened from the page header's Remarks History button.
//
// The header names the plan (LPA No. and planholder); the list under the rule
// is the plan's remarks trail, one entry per row, newest first, read only.

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
import { MessageSquare } from "lucide-react";

import { KIT_BORDER } from "../../components/section-card";
import type { RemarkHistoryEntry } from "../data/types";

/** MM/DD/YYYY hh:mm AM, matching the module's remark lines. */
function dateAdded(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLUMNS = ["LPA No.", "Remarks", "Date Added"];

export interface RemarksHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpaNo: string;
  planholderName: string;
  /** Newest first. */
  remarks: RemarkHistoryEntry[];
}

export function RemarksHistoryDialog({
  open,
  onOpenChange,
  lpaNo,
  planholderName,
  remarks,
}: RemarksHistoryDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="xl"
      motionPreset="scale"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={3} flexDirection="column" alignItems="stretch">
              <Flex align="center" gap={3}>
                <Box color="blue.600" flexShrink={0}>
                  <MessageSquare size={18} />
                </Box>
                <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                  Remarks History
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
              {remarks.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
                  No remarks on file.
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
                          >
                            {column}
                          </Table.ColumnHeader>
                        ))}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {remarks.map((row) => (
                        <Table.Row key={row.id} fontSize="sm">
                          <Table.Cell
                            fontFamily="mono"
                            fontWeight="semibold"
                            whiteSpace="nowrap"
                            verticalAlign="top"
                          >
                            {row.lpaNo}
                          </Table.Cell>
                          {/* Remarks wrap; the other two stay on one line. */}
                          <Table.Cell minW="280px" verticalAlign="top">
                            {row.remarks}
                          </Table.Cell>
                          <Table.Cell
                            fontFamily="mono"
                            whiteSpace="nowrap"
                            verticalAlign="top"
                          >
                            {dateAdded(row.dateAdded)}
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

export default RemarksHistoryDialog;
