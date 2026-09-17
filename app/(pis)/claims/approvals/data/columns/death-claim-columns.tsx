"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Box, Text } from "@chakra-ui/react";
import { multiSelectFilter } from "osp-ui-kit";

import type { DeathClaimApproval } from "../types";

export const deathClaimColumns: ColumnDef<DeathClaimApproval>[] = [
  {
    accessorKey: "claimNo",
    header: "Claim No.",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
        {getValue<string>() || "—"}
      </Text>
    ),
  },
  {
    // THE PLAN HOLDER AND THEIR LPA ARE ONE COLUMN (user, 2026-09-15): the name
    // over the number that identifies them. They were two, and the pair reads as
    // one fact — nobody reads an LPA number without reading whose it is — so a
    // column boundary between them only bought width on a table that scrolls.
    //
    // THE ACCESSOR IS NAME THEN NUMBER, so the search field finds a claim by
    // either — typing an LPA is how a processor holding the paperwork looks one
    // up, and folding the number into the cell must not cost that.
    //
    // SORTING still comes out by name, because the name leads the string.
    // COLUMN FILTERING IS OFF: a multi-select over "name + number" would offer
    // one entry per plan holder, which is a list of every row rather than a
    // filter. It was of no more use on the two columns it replaces.
    id: "planholder",
    accessorFn: (row) => `${row.planholder} ${row.lpaNo}`,
    header: "Planholder",
    enableSorting: true,
    enableColumnFilter: false,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
    cell: ({ row }) => (
      <Box>
        <Text lineClamp={1}>{row.original.planholder}</Text>
        <Text fontFamily="mono" fontSize="11px" color="fg.muted" mt="1px">
          {row.original.lpaNo}
        </Text>
      </Box>
    ),
  },
  {
    accessorKey: "benefit",
    header: "Benefit",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    // SPECIAL / REGULAR SITS UNDER THE BENEFIT (user, 2026-09-15) rather than in
    // a column of its own. It is why the row is where it is — the queue puts
    // every Special above every Regular before it falls back to the filing date,
    // so without it the list reads as mis-sorted — but it is two words about one
    // claim, and a whole column spent on two words pushed the table wider on a
    // row that was already scrolling sideways.
    //
    // BOTH ARE DRAWN, not just the exception, so every death claim row is the
    // same two lines tall and the column cannot be read as "blank means
    // unknown". Special carries the conveyor card's red; Regular is muted, which
    // is the difference in weight the two deserve. Nothing is drawn at all for a
    // nature the seven-day rule does not apply to — see `priority` on the row.
    cell: ({ row, getValue }) => (
      <Box>
        <Text>{getValue<string>()}</Text>
        {row.original.priority && (
          <Text
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color={
              row.original.priority === "Special" ? "red.500" : "fg.subtle"
            }
            mt="1px"
          >
            {row.original.priority}
          </Text>
        )}
      </Box>
    ),
  },
  {
    accessorKey: "dateOfDeath",
    header: "Date of Death",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "requestingBranch",
    header: "Branch",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "filedDate",
    header: "Filed Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  // WHAT THIS TABLE DELIBERATELY DOES NOT CARRY (all user, 2026-09-15). Each was
  // dropped for its own reason, and together they are why a queue that scrolled
  // sideways now fits:
  //
  //   Status      every row is a verified claim awaiting a decision, so it read
  //               "Pending" all the way down — a column whose every cell is the
  //               same word is a caption on the table, not data about a row.
  //   Endorsed As what the processor recommended. Removed the same day it was
  //               explained; `claimRecommendation` went with it.
  //   LPA No.     folded under the plan holder's name, where it belongs.
  //   Type        folded under the benefit as a Special / Regular line.
  //   Requester   the processor who worked the claim. It is the same name on
  //               nearly every row of a queue one person endorsed, and it is not
  //               what an approver decides on — it is on the detail drawer,
  //               marked mandatory, which is where somebody asking "who sent me
  //               this?" is already looking.
  //   Decision    Approve / Deny in the row. See `ApprovalConfig.decisionColumn`,
  //               now off for this queue: the answer is given in the drawer, or
  //               from the row's "…" menu, or in bulk from the selection.
];
