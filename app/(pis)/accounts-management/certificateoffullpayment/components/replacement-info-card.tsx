"use client";

// COFP Replacement Information — under the Planholder Information card and the
// document viewer on the Replacement view's Branch panel (user, 2026-10-06).
//
// VIEW ONLY: the reason, what the replacement certificate is to print against
// what the old one did, and the request's notes and remarks. A collapsible fold
// like the CSV screen's lower sections; the text blocks are drawn like the
// Remarks box on the Planholder Remarks and Notes card, and the comparison is
// the kit's table.

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, InfoCardAccordion, OSPBadge } from "osp-ui-kit";
import { RefreshCw } from "lucide-react";

import type {
  CofpReplacementChange,
  CofpReplacementInfo,
} from "../data/replacement-details";

/** Tighter rows than the kit's smallest size, as on the Notes list. */
const COMPACT_ROWS = {
  "& thead th": { paddingBlock: "4px" },
  "& tbody td": { paddingBlock: "4px", lineHeight: "1.3" },
} as const;

const columns: ColumnDef<CofpReplacementChange>[] = [
  {
    accessorKey: "field",
    header: "Field",
    cell: (info) => (
      <Text fontSize="xs" fontWeight="700" color="gray.700" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "oldValue",
    header: "Old Value",
    // Struck through once a new value replaces it, so the eye goes to what
    // changed.
    cell: ({ row }) => (
      <Text
        fontSize="xs"
        color={row.original.newValue ? "gray.500" : "gray.700"}
        textDecoration={row.original.newValue ? "line-through" : undefined}
        wordBreak="break-word"
      >
        {row.original.oldValue}
      </Text>
    ),
  },
  {
    accessorKey: "newValue",
    header: "New Value",
    cell: ({ row }) =>
      row.original.newValue ? (
        <Text
          fontSize="xs"
          fontWeight="700"
          color="green.700"
          wordBreak="break-word"
        >
          {row.original.newValue}
        </Text>
      ) : (
        <Text fontSize="xs" color="gray.400">
          No change
        </Text>
      ),
  },
];

/** A section label, as the Remarks card draws its own. */
function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="700"
      color="gray.700"
      textTransform="uppercase"
      letterSpacing="wide"
    >
      {children}
    </Text>
  );
}

/** A read-only block of text that grows with what it holds. */
function ReadOnlyBox({ text, empty }: { text: string; empty: string }) {
  return (
    <Box
      bg="gray.50"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      px={3}
      py={2.5}
      fontFamily="mono"
      fontSize="xs"
      lineHeight="1.7"
      color={text ? "gray.700" : "gray.400"}
      whiteSpace="pre-wrap"
      wordBreak="break-word"
    >
      {text || empty}
    </Box>
  );
}

export interface CofpReplacementInfoCardProps {
  info: CofpReplacementInfo;
}

export function CofpReplacementInfoCard({ info }: CofpReplacementInfoCardProps) {
  const changed = info.changes.filter((change) => change.newValue).length;

  return (
    <InfoCardAccordion
      icon={<RefreshCw />}
      title="COFP Replacement Information"
      defaultOpen
    >
      <Flex direction="column" gap={4}>
        <Box>
          <Box mb={1.5}>
            <FieldLabel>Reason:</FieldLabel>
          </Box>
          <ReadOnlyBox text={info.reason} empty="No reason given." />
        </Box>

        <Box>
          <Flex justify="space-between" align="center" mb={1.5}>
            <FieldLabel>Replacement Value Comparison:</FieldLabel>
            <OSPBadge type={changed > 0 ? "warning" : "info"}>
              {changed > 0
                ? `${changed} ${changed === 1 ? "change" : "changes"}`
                : "No changes"}
            </OSPBadge>
          </Flex>
          <Box css={COMPACT_ROWS}>
            <DataTable<CofpReplacementChange>
              columns={columns}
              data={info.changes}
              size="sm"
              getRowId={(row) => row.field}
              features={{
                sorting: false,
                pagination: false,
                search: false,
                filtering: false,
                columnToggle: false,
                selection: false,
                detailSidebar: false,
              }}
              mobileConfig={{
                viewMode: "card",
                primaryField: "field",
                titleTransform: "none",
                visibleFields: ["oldValue", "newValue"],
                labelMap: { oldValue: "Old Value", newValue: "New Value" },
                valueFormatter: {
                  newValue: (value) => (value ? String(value) : "No change"),
                },
              }}
            />
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          <Box>
            <Box mb={1.5}>
              <FieldLabel>Notes:</FieldLabel>
            </Box>
            <ReadOnlyBox text={info.notes} empty="No notes on file." />
          </Box>
          <Box>
            <Box mb={1.5}>
              <FieldLabel>Remarks:</FieldLabel>
            </Box>
            <ReadOnlyBox text={info.remarks} empty="No remarks on file." />
          </Box>
        </SimpleGrid>
      </Flex>
    </InfoCardAccordion>
  );
}

export default CofpReplacementInfoCard;
