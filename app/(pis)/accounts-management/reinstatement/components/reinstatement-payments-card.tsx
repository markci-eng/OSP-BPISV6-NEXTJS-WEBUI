"use client";

// PAYMENT DETAILS — the plan's payment ledger, under the Plan Details card on
// the Reinstatement panel. A collapsible fold (the kit's `InfoCardAccordion`)
// with the kit's `DataTable` inside (tanstack underneath, so sorting and paging
// come with it), set up the way the COFP payments card is.

import { Box, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, InfoCardAccordion, type RowAction } from "osp-ui-kit";
import { Eye, Printer, Receipt } from "lucide-react";
import { toast } from "sonner";

import { formatFiledDate } from "@/app/(pis)/data";
import type { ReinstatementPayment } from "../data/types";

/**
 * SCROLLS, NOT PAGES (user, 2026-09-29). A ledger runs to 60–65 lines; the
 * card shows 10 and the rest scroll inside it. The heights are the compact
 * rows' below (3px padding either side of a 22px button, plus the rule).
 */
const VISIBLE_ROWS = 10;
const ROW_HEIGHT_PX = 29;
const HEADER_HEIGHT_PX = 30;
const SCROLL_MAX_HEIGHT = `${HEADER_HEIGHT_PX + ROW_HEIGHT_PX * VISIBLE_ROWS}px`;

/**
 * COMPACT ROWS (user, 2026-09-28). The kit's table is already at its smallest
 * size ("sm"), but it pads every cell 10px top and bottom and takes no prop
 * for it, so the padding is tightened here, scoped to this table only. The
 * descendant selectors outrank the kit's single-class cell styles. The row's
 * action button is shrunk to match, or it would hold the row at its height.
 *
 * The header is pinned to the top of the scroll box, on the kit's own surface
 * colour so rows do not show through it, and above the sticky actions cells.
 */
const COMPACT_ROWS = {
  "& thead th": {
    paddingBlock: "6px",
    position: "sticky",
    top: 0,
    zIndex: 4,
    background: "var(--chakra-colors-surface)",
  },
  "& tbody td": { paddingBlock: "3px", lineHeight: "1.25" },
  "& tbody td p": { lineHeight: "1.25" },
  "& tbody td button": { height: "22px", minWidth: "22px" },
} as const;

/** Pesos as the ledger prints them, to the centavo. */
function peso(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Figures are monospaced so the digits line up down the column.
const columns: ColumnDef<ReinstatementPayment>[] = [
  {
    accessorKey: "payClass",
    header: "Pay Class",
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "siNo",
    header: "SI No",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "siDate",
    header: "SI Date",
    cell: (info) => (
      <Text whiteSpace="nowrap">{formatFiledDate(info.getValue<string>())}</Text>
    ),
  },
  {
    accessorKey: "siAmount",
    header: "SI Amount",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {peso(info.getValue<number>())}
      </Text>
    ),
  },
  {
    accessorKey: "planCode",
    header: "Plan Code",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "auditDate",
    header: "Audit Date",
    cell: (info) => (
      <Text whiteSpace="nowrap">{formatFiledDate(info.getValue<string>())}</Text>
    ),
  },
];

// The Actions column. The kit draws it from these, as a menu at the row's end
// on desktop and on each card on a phone. Not wired to a backend yet.
const rowActions: RowAction<ReinstatementPayment>[] = [
  {
    id: "view",
    label: "View",
    icon: Eye,
    onClick: (row) => toast.info(`Viewing ${row.siNo} is not wired up yet.`),
  },
  {
    id: "print",
    label: "Print SI",
    icon: Printer,
    onClick: (row) => toast.info(`Printing ${row.siNo} is not wired up yet.`),
  },
];

export interface ReinstatementPaymentsCardProps {
  payments: ReinstatementPayment[];
}

export function ReinstatementPaymentsCard({
  payments,
}: ReinstatementPaymentsCardProps) {
  return (
    <InfoCardAccordion
      icon={<Receipt />}
      title="Payment Details"
      // How many lines are in there, on the fold itself, so nobody opens it
      // to find out.
      subtitle={`${payments.length} payment${payments.length === 1 ? "" : "s"} posted`}
      defaultOpen
    >
      <Box css={COMPACT_ROWS}>
      <DataTable<ReinstatementPayment>
        columns={columns}
        data={payments}
        size="sm"
        // The kit's scroll mode reveals rows in batches of this size; one
        // batch of the whole ledger, so every line is there to scroll to.
        defaultPageSize={Math.max(payments.length, 1)}
        tableContainerMaxHeight={SCROLL_MAX_HEIGHT}
        getRowId={(row) => row.id}
        rowActions={rowActions}
        // Sorting and a scroll box only — one plan's ledger is read down, not
        // searched, and the other chrome is wider than the card needs.
        features={{
          sorting: true,
          pagination: false,
          infiniteScroll: true,
          search: false,
          filtering: false,
          columnToggle: false,
          selection: false,
          detailSidebar: false,
        }}
        emptyState={
          <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
            No payment is posted against this plan.
          </Text>
        }
        mobileConfig={{
          viewMode: "card",
          primaryField: "siNo",
          titleTransform: "none",
          secondaryField: "siDate",
          badgeField: "siAmount",
          visibleFields: ["payClass", "planCode", "auditDate"],
          labelMap: {
            payClass: "Pay Class",
            planCode: "Plan Code",
            auditDate: "Audit Date",
          },
          valueFormatter: {
            siDate: (value) => formatFiledDate(String(value)),
            siAmount: (value) => peso(Number(value)),
            auditDate: (value) => formatFiledDate(String(value)),
          },
        }}
      />
      </Box>
    </InfoCardAccordion>
  );
}

export default ReinstatementPaymentsCard;
