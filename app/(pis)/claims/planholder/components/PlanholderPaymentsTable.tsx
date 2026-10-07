"use client";

// The payment ledger as a table — the desktop form of the Payments section.
//
// Built on the shared `DataTable` (`osp-ui-kit`), the same one the claim queue's
// table view uses, so a row here behaves the way a row anywhere else in the app
// does: same column model, same sorting, same chrome.
//
// INFINITE SCROLL BY DEFAULT, PAGES ON REQUEST (user, 2026-10-02: "the user
// does not want pagination, but I think we should add an option"). One Rows
// control does both: "All, scroll" is the kit's infinite scroll, a number is
// that many per page with the pager beside it. One control and not a switch
// plus a page size, because a page size means nothing while scrolling.
//
// THE CHOICE IS REMEMBERED in this browser (user, same day) — someone who
// reads in pages keeps getting pages. The filters are not; see `usePaymentsLedger`.
//
// The search and the pay class live OUTSIDE the table, in `PaymentsToolbar`,
// so they can sit pinned above it in a pop-up. The kit's own search is off.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, FloatingLabelSelect } from "osp-ui-kit";
import type { PlanholderPayment } from "../../claims-data";

/** "scroll", or a page size. */
type RowsMode = "scroll" | "10" | "25" | "50";

const ROWS_OPTIONS: { value: RowsMode; label: string }[] = [
  { value: "scroll", label: "All, scroll" },
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
];

const ROWS_KEY = "claims.payments.rows";

/** Receipts revealed per step while scrolling. */
const SCROLL_BATCH = 20;

/**
 * How tall the scrolling table may be — the kit's default is a whole-page
 * figure, and this sits in a section or a pop-up.
 *
 * The pop-up is capped at 82vh and spends ~230px on its toolbar, the table's
 * own foot and its padding; past that, a second scrollbar appears around the
 * first. So: what the pop-up leaves, never under 240px nor over 560px.
 */
const SCROLL_MAX_HEIGHT = "clamp(240px, calc(82vh - 230px), 560px)";

/**
 * The remembered Rows choice. "scroll" until it has been read, so the server
 * and the first client render agree.
 */
function useRowsMode(): [RowsMode, (next: RowsMode) => void] {
  const [mode, setMode] = useState<RowsMode>("scroll");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ROWS_KEY);
      if (ROWS_OPTIONS.some((o) => o.value === saved)) {
        setMode(saved as RowsMode);
      }
    } catch {
      // Storage refused (private window) — the default stands.
    }
  }, []);
  const choose = (next: RowsMode) => {
    setMode(next);
    try {
      localStorage.setItem(ROWS_KEY, next);
    } catch {
      // Not remembered, but still applied.
    }
  };
  return [mode, choose];
}

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
  /** The receipts on show — already narrowed by the toolbar's filters. */
  payments: PlanholderPayment[];
  /** What stands in the table when the filters leave nothing. */
  emptyState?: ReactNode;
}

export function PlanholderPaymentsTable({
  payments,
  emptyState,
}: PlanholderPaymentsTableProps) {
  // Stable across renders, so a sort the user set is not thrown away whenever
  // the section re-renders around it.
  const cols = useMemo(() => columns, []);
  const [mode, setMode] = useRowsMode();
  const scrolling = mode === "scroll";

  return (
    // The toolbar to the bottom, where a table's pager and its count belong —
    // you page when you have finished reading the rows, not before you start.
    //
    // The kit puts it above the table, and there is no prop for that, so the
    // card is flipped instead: two children, the toolbar and the table, and
    // `order` sends the toolbar last. Everything that made it a header comes
    // off with it — the bottom rule becomes a top rule, and the sticky that
    // pinned it under the page header is released.
    <Box
      css={{
        // ROOM UNDER THE TABLE FOR THE KIT'S LOAD-MORE SENTINEL. It is a
        // zero-height last row watched with no margin, and with the table flush
        // to the scroller's floor it rests a fraction of a pixel below the
        // visible edge (measured: 562.125 against 561.875) — so scrolling to the
        // end never loaded the next batch. Two pixels lets it scroll inside.
        "& table": { marginBottom: "2px" },
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
        // A NEW TABLE PER MODE: the page size is the kit's initial state, read
        // once, so switching it needs a fresh mount.
        key={mode}
        columns={cols}
        data={payments}
        getRowId={(row) => row.orNo}
        size="sm"
        defaultPageSize={scrolling ? SCROLL_BATCH : Number(mode)}
        tableContainerMaxHeight={SCROLL_MAX_HEIGHT}
        emptyState={emptyState}
        // The Rows control, in the toolbar's own action slot — which is also
        // what opens that row at all; see the kit's toolbar gate.
        headerActions={
          <Box w="150px">
            <FloatingLabelSelect
              label="Rows"
              value={mode}
              onValueChange={(value: string) => setMode(value as RowsMode)}
            >
              {ROWS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FloatingLabelSelect>
          </Box>
        }
        features={{
          infiniteScroll: scrolling,
          pagination: !scrolling,
          // The range and the arrows — "1–10 of 52" — when paging; the plain
          // count when scrolling.
          showToolbarPagination: !scrolling,
          sorting: true,
          // Searched and filtered from `PaymentsToolbar`, outside the table.
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
