"use client";

// The payment ledger as a table — the desktop form of the Payments section.
//
// Built on the shared `DataTable` (`osp-ui-kit`), the same one the claim queue's
// table view uses, so a row here behaves the way a row anywhere else in the app
// does: same column model, same sorting, same chrome.
//
// PAGED, which that table is not. The queue's table sits beside a card deck that
// scrolls, and paging one and scrolling the other would be two ways through the
// same claims; this section has no such twin. A ledger is also the one list here
// that grows without limit — a plan pays for its whole term — so "the first five
// and a button" stops being a preview and starts being a wall.
//
// Everything else the table can do is off: a search box and column filters for
// four columns of one plan's receipts would be more chrome than ledger.

import { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import type { PlanholderPayment } from "../../claims-data";

/**
 * Receipts to a page. Fixed, not measured.
 *
 * A tall monitor CAN hold twenty-odd rows, and sizing the page to fill it was
 * the wrong thing to do with that room: twenty receipts is more ledger than
 * anyone reads at once, and the section stops being one part of a page and
 * becomes the page. Ten is a year of a monthly plan, which is the unit this is
 * actually read in — and it leaves the sections under it where a reader can
 * find them.
 */
const PAGE_SIZE = 10;

/**
 * Four columns, each one field: an OR number, what it was collected for, when,
 * and how much.
 *
 * The two that are formatted for reading are sorted on their RAW value — the
 * date on its ISO form and the amount on its number — so ordering the ledger by
 * date puts 2026 after 2025 rather than after "Apr", and by amount puts 1,000
 * after 900 rather than before it. That is what the raw fields on
 * {@link PlanholderPayment} are for.
 */
const columns: ColumnDef<PlanholderPayment>[] = [
  {
    accessorKey: "orNo",
    header: "OR No",
    cell: (info) => (
      <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "payClass",
    header: "Pay Class",
    cell: (info) => (
      <Text fontSize="xs" color="gray.600" truncate>
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    id: "orDate",
    accessorFn: (payment) => payment.orDateISO,
    header: "OR Date",
    cell: (info) => (
      <Text fontSize="xs" color="gray.600" whiteSpace="nowrap">
        {info.row.original.orDate}
      </Text>
    ),
  },
  {
    id: "amount",
    accessorFn: (payment) => payment.amount,
    header: "Amount",
    cell: (info) => (
      <Text
        fontSize="xs"
        fontWeight="700"
        color="gray.800"
        whiteSpace="nowrap"
      >
        {info.row.original.amountDisplay}
      </Text>
    ),
  },
];

export interface PlanholderPaymentsTableProps {
  /** Every receipt on record for the plan — the table pages through them. */
  payments: PlanholderPayment[];
}

export function PlanholderPaymentsTable({
  payments,
}: PlanholderPaymentsTableProps) {
  // Stable across renders, so a sort the user set is not thrown away whenever
  // the section re-renders around it.
  const cols = useMemo(() => columns, []);

  return (
    // The pager to the bottom right, where a table's pager belongs — you page
    // when you have finished reading the rows, not before you start.
    //
    // The kit puts it in the toolbar above the table, and there is no prop for
    // that, so the card is flipped instead: two children, the toolbar and the
    // table, and `order` sends the toolbar last. Everything that made it a
    // header comes off with it — the bottom rule becomes a top rule, and the
    // sticky that pinned it under the page header is released, since a pinned
    // footer inside a box that does not scroll would only sit where it already
    // is. The range and arrows are the toolbar's own right-hand group, so they
    // land on the right of it with nothing to say here.
    <Box
      css={{
        "& > div": { display: "flex", flexDirection: "column" },
        "& > div > div:first-of-type": {
          order: 1,
          position: "relative",
          top: "auto",
          borderBottomWidth: 0,
          borderTopWidth: "1px",
        },
      }}
    >
      <DataTable<PlanholderPayment>
        columns={cols}
        data={payments}
        getRowId={(row) => row.orNo}
        size="sm"
        defaultPageSize={PAGE_SIZE}
        // The kit has ONE pager and it lives in the toolbar, which renders its
        // row only when `search`, `filtering`, `columnToggle`, `headerButton` or
        // `headerActions` is set — and the first three each bring a search box
        // this section has no use for. `headerActions` is the one that opens the
        // row without adding a control to it, so an empty node is what pays for
        // the pager. It is a workaround for that gate, not a decoration: if the
        // kit ever renders the range and arrows on their own, this comes out.
        headerActions={<Box />}
        features={{
          pagination: true,
          // The range and the arrows — "1–5 of 52" — which is the pager itself.
          showToolbarPagination: true,
          sorting: true,
          // A ledger of one plan's receipts is not searched or filtered, and
          // each of these would put a search box above four columns that never
          // needed one — see the note on `headerActions`.
          search: false,
          filtering: false,
          columnToggle: false,
          selection: false,
          detailSidebar: false,
        }}
      />
    </Box>
  );
}

export default PlanholderPaymentsTable;
