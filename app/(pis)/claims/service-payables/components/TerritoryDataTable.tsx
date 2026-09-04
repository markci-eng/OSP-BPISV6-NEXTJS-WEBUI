"use client";

// The territories as a table — the alternative to the card grid.
//
// Built on the shared `DataTable` (`osp-ui-kit`) with the same settings as the
// death queue's table, and for the same reasons given there: search, column
// filters and the PAGER are all off. The rows arrive already scoped to a stage,
// and the card view beside this one has no pager either — a user switching
// views is looking at the same territories and should reach them the same way,
// by scrolling.
//
// What the table is FOR, and it is not just a denser card: a card is read one at
// a time, and the question this list answers is comparative — which territory
// has the most owed, which has the most stuck. Columns put those figures in
// line with each other and let the user sort on any of them, which is the one
// thing the grid cannot do.

import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ALIGN_FIGURES_RIGHT } from "../../components/table-align";
import {
  discrepancyLabel,
  formatCSP,
  type TerritorySummary,
} from "../service-payables-data";

/** The same red the cards and the overview tile use for a discrepancy. */
const DEFICIENCY_ACCENT = "#e11d48";

/**
 * The amber every franchise mark in this module is drawn in — the chip on
 * `ChapelBillingCard` and the count in the card's foot.
 */
const FRANCHISE_ACCENT = "#b45309";

/**
 * Two related values in one cell — the one the column is named for on top, the
 * one that qualifies it underneath. The death queue's table construction,
 * brought across unchanged so a row here reads like a row there.
 */
const StackedCell = ({
  primary,
  secondary,
  secondaryColor = "gray.500",
  align,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  secondaryColor?: string;
  /** "right" for a column of figures — see `alignHeadersRight`. */
  align?: "right";
}) => (
  <Box minW={0} textAlign={align}>
    <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
      {primary}
    </Text>
    <Text fontSize="11px" color={secondaryColor} mt="1px" truncate>
      {secondary}
    </Text>
  </Box>
);

/**
 * A bare count, in the weight the table's other figures use.
 *
 * RIGHT-ALIGNED, like every other figure in this table and like the heading over
 * it — see `alignHeadersRight`. A column of counts is read down its right edge.
 */
const CountCell = ({ value }: { value: number }) => (
  <Text fontSize="xs" fontWeight="600" color="gray.700" textAlign="right">
    {value}
  </Text>
);

/**
 * Six columns. Every one of them is sortable, which is the reason to be in this
 * view at all — the cards are already ordered by the payable, so sorting by
 * anything else is what the table adds.
 */
const columns: ColumnDef<TerritorySummary>[] = [
  {
    // The name over the code. The name is what a territory is known by; the
    // code is what its billing and claim numbers are prefixed with, so both are
    // worth carrying and neither needs a column of its own.
    id: "territory",
    accessorKey: "description",
    header: "Territory",
    cell: (info) => (
      <StackedCell
        primary={info.row.original.description}
        secondary={info.row.original.territoryCode}
      />
    ),
  },
  {
    // A chapel is a billing, so far as this table is concerned. The Billings
    // column that used to sit beside this one is gone: it held the same number
    // in all but one case — a chapel reporting a service late, which opens a
    // second billing for the same month in a later cut — and a column that
    // repeats its neighbour except when it quietly does not is worse than no
    // column. The workspace lists every billing separately, which is where that
    // difference belongs.
    accessorKey: "chapelCount",
    header: "Chapels",
    cell: (info) => <CountCell value={info.getValue() as number} />,
  },
  {
    // WHO RUNS THEM, as two columns rather than one.
    //
    // The pair is here because they are two queues of work and not one figure
    // cut two ways: an owned chapel's billing arrives with its services on it,
    // and a franchise's may have to be raised empty and keyed in from paper.
    // Sorting on the franchise count is the point of them — it is the fastest
    // way to see which territory holds the slow work.
    //
    // They sum to Chapels, so nothing here has to be worked out from the other
    // two. That redundancy is deliberate: a reader scanning one column should
    // not have to subtract to learn the other.
    accessorKey: "ownedCount",
    header: "Owned",
    cell: (info) => <CountCell value={info.getValue() as number} />,
  },
  {
    accessorKey: "franchiseCount",
    header: "Franchise",
    cell: (info) => {
      const count = info.getValue() as number;
      // A ZERO IS GREYED, not hidden. It is a column, so the cell has to hold
      // something — and most territories are all-owned, which is exactly the
      // fact worth reading at a glance. The amber is this module's franchise
      // colour, the chip on the row and the card use it, and it is only spent
      // where there is actually a franchise.
      return (
        <Text
          fontSize="xs"
          fontWeight={count > 0 ? "700" : "600"}
          color={count > 0 ? FRANCHISE_ACCENT : "gray.300"}
          textAlign="right"
        >
          {count}
        </Text>
      );
    },
  },
  {
    // The plans that will be terminated into their billings, over what is not
    // going through. Sorted on the BILLABLE count — the bold line, as everywhere
    // else in these tables.
    //
    // THE SECOND LINE IS THE DISCREPANCIES, AND NOTHING ELSE. It was both kinds
    // in one red string, then the discrepancies in red with the deficiencies
    // quietly behind them, and now only the first: a deficiency is a document in
    // the post, worked in the billing it belongs to, and a territory row that
    // said "6 deficiencies" was reporting the ordinary course of business on the
    // one line this table has for exceptions. A discrepancy is a plan that
    // cannot be serviced until a record is corrected outside this module — the
    // only thing here worth a second line.
    //
    // Which is why most rows now have no second line at all, and that is the
    // point: the ones that do are the ones to look at.
    accessorKey: "serviceCount",
    header: "Services",
    cell: (info) => {
      const { discrepantCount } = info.row.original;
      return (
        <StackedCell
          primary={info.getValue() as number}
          secondary={
            discrepantCount > 0 ? discrepancyLabel(discrepantCount) : ""
          }
          secondaryColor={DEFICIENCY_ACCENT}
          align="right"
        />
      );
    },
  },
  {
    // The figure the whole dashboard is about, so it carries the brand's dark
    // green here exactly as it does on the card.
    accessorKey: "totalCSP",
    header: "Total CSP",
    cell: (info) => (
      <Flex justify="flex-end">
        <Text
          fontSize="xs"
          fontWeight="700"
          color={BRAND_COLORS.darkGreen}
          whiteSpace="nowrap"
        >
          {formatCSP(info.getValue() as number)}
        </Text>
      </Flex>
    ),
  },
];

export interface TerritoryDataTableProps {
  /** Rows to show — already scoped to a stage by the section above. */
  data: TerritorySummary[];
  /**
   * Where a row goes when clicked — the same place its card would. Omit it and
   * the rows stop being clickable, for the reason given on {@link TerritoryCard}:
   * only "For Process" has a workspace so far.
   */
  onOpen?: (summary: TerritorySummary) => void;
}

export function TerritoryDataTable({ data, onOpen }: TerritoryDataTableProps) {
  // The columns must not be rebuilt with `data`, or every re-render throws away
  // the column model — and with it the sort the user just set.
  const cols = useMemo(() => columns, []);

  return (
    // The kit gives every row a pointer cursor whether or not it was handed an
    // `onRowClick`, so a stage with nowhere to go still LOOKS clickable. Put
    // back to `default` from out here, since the flag that decides it is ours.
    <Box
      css={{
        // The headings over the five figure columns, brought to the same edge
        // as the figures — see `alignHeadersRight`.
        ...ALIGN_FIGURES_RIGHT,
        ...(onOpen ? {} : { "& tbody tr": { cursor: "default" } }),
      }}
    >
      <DataTable<TerritorySummary>
        columns={cols}
        data={data}
        getRowId={(row) => row.territoryCode}
        // Passed through only when there IS somewhere to go: handing the table
        // a no-op would still give every row a pointer cursor.
        onRowClick={onOpen}
        size="sm"
        features={{
          search: false,
          filtering: false,
          sorting: true,
          pagination: false,
          columnToggle: false,
          selection: false,
          detailSidebar: false,
        }}
      />
    </Box>
  );
}

export default TerritoryDataTable;
