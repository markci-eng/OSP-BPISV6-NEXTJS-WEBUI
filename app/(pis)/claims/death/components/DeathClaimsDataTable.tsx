"use client";

// The queue as a table — the desktop alternative to the card deck.
//
// Built on the shared `DataTable` (`osp-ui-kit`), the same one the plan-holder
// lists use, so a row here behaves the way a row anywhere else in the app does:
// same sorting, same column model.
//
// What is deliberately turned OFF is its search, its column filters and its
// PAGER. The first two because the queue already has a search box and two
// dropdowns above it, and a second search inside the table would mean two boxes
// filtering the same list to different answers — this is handed rows that are
// ALREADY filtered.
//
// The pager because the card view next to it does not have one either. A
// processor switching between the two views is looking at the same claims and
// should reach them the same way: scroll. Paged, the table could never scroll at
// all — it sizes itself to whatever fits and the rest goes behind a next button,
// so the box around it is never overflowed and the wheel does nothing.

import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import { deathBenefitLabel } from "@/app/(pis)/data";
import {
  claimIdentity,
  planholderName,
  toFullName,
  NO_IDENTITY,
  type ClaimIdentifier,
  type DeathClaim,
} from "../death-claims-data";
import { TYPE_DOT } from "./DeathClaimsFilter";

/**
 * The identity column each queue drops.
 *
 * Not hidden to save room — hidden because it says nothing. A queue of unopened
 * requests has no claim numbers to show, so that column is a run of em dashes;
 * once opened, the request number is back-office trivia nobody works from. The
 * cards have always shown one or the other for this reason, and a table that
 * showed both would be the one view where the rule did not hold.
 */
const DROPPED_COLUMN: Record<ClaimIdentifier, string> = {
  request: "claimNo",
  claim: "reference",
};

/**
 * Two related values in one cell — the one the column is named for on top, the
 * one that qualifies it underneath.
 *
 * This is the card list's own construction, brought across: a bold line, then a
 * smaller grey one, at the same sizes the cards use. Pairing the values that
 * belong together is what lets the table drop from nine columns to five without
 * losing a field — and five columns of two lines read far quicker across a wide
 * screen than nine of one, where the eye has to travel the full width to collect
 * one claim.
 *
 * Both lines truncate rather than wrap, so every row is exactly two lines tall
 * and the rows stay a scannable grid.
 */
const StackedCell = ({
  primary,
  secondary,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
}) => (
  <Box minW={0}>
    <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
      {primary}
    </Text>
    <Text fontSize="11px" color="gray.500" mt="1px" truncate>
      {secondary}
    </Text>
  </Box>
);


/**
 * Five columns, four of which carry two fields — see {@link StackedCell}.
 *
 * The one thing merging costs is sorting. A column sorts on one value, and here
 * that is always the bold one, so Filed and Incident can no longer be sorted on
 * directly: Filed rides along under Branch. Ordering a queue by age is a real
 * thing to want, so if it is missed, the answer is to split Filed back out as
 * its own column rather than to sort Branch by date behind the user's back.
 */
const columns: ColumnDef<DeathClaim>[] = [
  {
    // Both identity columns carry an explicit `id`, so the one a queue drops is
    // named rather than inferred from whichever key the definition happens to
    // use — see `DROPPED_COLUMN`.
    id: "reference",
    accessorKey: "reference",
    header: "Request No",
    // Through the same helper the cards use, so the one column a queue keeps
    // holds exactly what that queue's card leads with.
    cell: (info) => (
      <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
        {claimIdentity(info.row.original, "request")}
      </Text>
    ),
  },
  {
    id: "claimNo",
    accessorKey: "claimNo",
    header: "Claim No",
    cell: (info) => (
      <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
        {claimIdentity(info.row.original, "claim")}
      </Text>
    ),
  },
  {
    // The plan holder over the plan they hold. Derived rather than stored — the
    // claim carries the plan, and the plan carries the name.
    //
    // Sorted, like every merged column here, on the BOLD line: that is the value
    // the column is named for and the one the eye reads down. The line beneath
    // it is not separately sortable — see the note on `columns`.
    id: "planholder",
    accessorFn: (claim) => {
      const name = planholderName(claim.lpaNo);
      return name ? toFullName(name) : "";
    },
    header: "Plan Holder",
    cell: (info) => (
      <StackedCell
        primary={(info.getValue() as string) || NO_IDENTITY}
        secondary={info.row.original.lpaNo}
      />
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => {
      const type = info.getValue() as DeathClaim["type"];
      return (
        <Flex align="center" gap={1.5}>
          {/* The same dot, in the same colour, as the card list uses. */}
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={TYPE_DOT[type]}
            flexShrink={0}
          />
          <Text fontSize="xs" color="gray.700" textTransform="capitalize">
            {type}
          </Text>
        </Flex>
      );
    },
  },
  {
    // What is being claimed, over what caused it.
    accessorKey: "benefits",
    header: "Benefit",
    cell: (info) => (
      <StackedCell
        primary={deathBenefitLabel(info.getValue() as DeathClaim["benefits"])}
        secondary={info.row.original.typeOfIncident}
      />
    ),
  },
  {
    // Who filed it, over when.
    accessorKey: "requestingBranch",
    header: "Branch",
    cell: (info) => (
      <StackedCell
        primary={String(info.getValue())}
        secondary={info.row.original.filedDisplay}
      />
    ),
  },
];

export interface DeathClaimsDataTableProps {
  /** Rows to show. Already searched and filtered by the toolbar above. */
  data: DeathClaim[];
  /**
   * Which number identifies a claim in this queue. The other identity column is
   * dropped — see {@link DROPPED_COLUMN}.
   */
  identifier: ClaimIdentifier;
  /** Where a row goes when it is clicked — the same place its card would. */
  onOpen?: (claim: DeathClaim) => void;
}

export function DeathClaimsDataTable({
  data,
  identifier,
  onOpen,
}: DeathClaimsDataTableProps) {
  // `data` is a fresh array on every keystroke in the search box, so the table
  // re-renders constantly; the columns must not be rebuilt with it, or every one
  // of those renders throws away the whole column model — and the sort the user
  // set on it.
  const cols = useMemo(
    () => columns.filter((column) => column.id !== DROPPED_COLUMN[identifier]),
    [identifier],
  );

  return (
    // NOTE: the header row scrolls away with the rows, and `position: sticky` on
    // it does not fix that. Sticky binds to the nearest SCROLLPORT, and the kit
    // wraps its table in overflow containers of its own — so the header sticks
    // to one of those, which is the same height as the table and therefore never
    // scrolls. Reaching the box that does scroll would mean either giving the
    // kit's inner container the height instead (its `infiniteScroll` +
    // `tableContainerMaxHeight` do exactly that) or styling a generated class
    // from out here. Left as it is rather than guessed at.
    <Box>
      <DataTable<DeathClaim>
        columns={cols}
        data={data}
        getRowId={(row) => row.id}
        onRowClick={(row) => onOpen?.(row)}
        size="sm"
        features={{
          // Searching and filtering live in the toolbar above this — see the
          // note at the top of the file.
          search: false,
          filtering: false,
          sorting: true,
          // Off, so every filtered claim is in the table and the box around it
          // scrolls — the same way the card view next to it behaves.
          pagination: false,
          // Off, and NOT because a column menu would be unwelcome.
          //
          // The kit draws its toolbar search box whenever ANY of `search`,
          // `filtering` or `columnToggle` is on — the menus beside it are each
          // gated on their own flag, but the search box is gated on all three
          // together. So asking for the column menu also asks for a second
          // search box, sitting directly under the one this queue already has
          // and filtering the same list by different rules. Until that gate is
          // split in the kit, the menu is what has to give.
          columnToggle: false,
          selection: false,
          detailSidebar: false,
        }}
      />
    </Box>
  );
}

export default DeathClaimsDataTable;
