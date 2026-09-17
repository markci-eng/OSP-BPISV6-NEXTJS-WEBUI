"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import { multiSelectFilter } from "osp-ui-kit";

import type { ServiceApproval } from "../types";

export const serviceColumns: ColumnDef<ServiceApproval>[] = [
  {
    accessorKey: "billingNo",
    header: "Billing No.",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    // THE CHAPEL AND ITS TERRITORY ARE ONE COLUMN (user, 2026-09-15): the chapel
    // over the territory it sits in. A chapel belongs to exactly one territory,
    // so the second column repeated a fact about the first on every row — and
    // the territory is how the work is FOUND on the conveyor, so it is worth
    // keeping in sight rather than dropping.
    //
    // THE ACCESSOR IS BOTH, so the search field finds a billing by either, and
    // the filter still groups by chapel: the pair is constant per chapel, so a
    // multi-select over "chapel + territory" has exactly the entries the chapel
    // column had, just spelled with the territory on the end. That is the
    // difference from the death claim table's merged column, where the pair was
    // unique per row and the filter had to go.
    id: "chapelDesc",
    accessorFn: (row) => `${row.chapelDesc} ${row.territoryCode}`,
    header: "Chapel",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
    // The franchise flag rides on the chapel rather than taking a column of its
    // own: it is a fact ABOUT this chapel, and it decides which process the
    // billing follows, so it has to be readable without opening the row.
    cell: ({ row }) => (
      <Box minW={0}>
        <HStack gap={2} minW={0}>
          <Text lineClamp={1}>{row.original.chapelDesc}</Text>
          {row.original.isFranchise && (
            <Badge colorPalette="purple" variant="subtle" flexShrink={0}>
              Franchise
            </Badge>
          )}
        </HStack>
        <Text fontFamily="mono" fontSize="11px" color="fg.muted" mt="1px">
          {row.original.territoryCode}
        </Text>
      </Box>
    ),
  },
  {
    accessorKey: "periodLabel",
    header: "Billing Period",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "serviceCount",
    header: "Services",
    enableSorting: true,
    enableColumnFilter: false,
    // JUST THE COUNT (user, 2026-09-15). It carried an amber "N deficient" tag
    // beside it; that is a fact for the processor who has to chase the paperwork,
    // and an approver is not the one chasing it — a deficiency never holds a
    // payable off a billing, so it does not bear on the decision being made here.
    // The count is still on the detail drawer as "Deficient".
    cell: ({ getValue }) => (
      <Text fontWeight="medium">{getValue<number>()}</Text>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text fontWeight="medium">
        {getValue<number>().toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    ),
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  // WHAT THIS TABLE DELIBERATELY DOES NOT CARRY (all user, 2026-09-15):
  //
  //   Territory   folded under the chapel, which is the only thing it varies
  //               with.
  //   Deficient   the amber tag beside the service count — see that column.
  //   Requester   who processed the billing. On the detail drawer, marked
  //               mandatory, which is where "who sent me this?" is answered.
  //   Status      every row is a verified billing awaiting a decision, so it
  //               read "Pending" all the way down. The same removal the death
  //               claim table made, for the same reason.
];
