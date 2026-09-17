"use client";

// THE WAY IN TO A PROFILE when you have a claim form in hand rather than a link.
//
// IT IS THE BPIS PLAN HOLDER LIST (user, 2026-09-16: "remove the title and
// display the search bar and the items for the planholder same as the one with
// the bpis"). `/plan-management/planholder` answers exactly this question one
// area over, and the two are worked by the same people at the same desk — so
// this is that screen's table, its columns and its search, over claims data.
//
// WHAT IT REPLACED was a hand-rolled search: our own `SearchBar` over a list of
// `PlanholderResultRow`s, with an illustrated hint before anything was typed.
// Nothing was wrong with it except that it was a second answer to a question
// already answered, and a processor moving between the two areas met two
// different lists of the same people.
//
// THE SEARCH BAR IS THE TABLE'S OWN, which is the part that carries most of the
// change. `DataTable` draws it, and with it the column filters, the sorting and
// the paging — none of which the hand-rolled version had.
//
// SO THE LIST NO LONGER STARTS EMPTY. Ours matched nothing until you typed, on
// the reasoning that a search is a way in and not a directory. The BPIS list is
// a directory, and asking for parity is asking for that: every plan holder is
// there from the first frame, and typing narrows them. It also means the empty
// state is now about the QUERY rather than about not having asked yet.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BrandedAvatar, DataTable, OSPBadge, type OSPBadgeProps } from "osp-ui-kit";
import type { ColumnDef } from "@tanstack/react-table";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { db } from "../../../data";
import { listPlanholders, type PlanholderSearchResult } from "../../claims-data";

/**
 * Which badge an account status gets — the BPIS list's own mapping, on the
 * labels this area uses.
 *
 * THE LABELS DIFFER FROM BPIS'S BY CASE AND WORDING, which is why the compare is
 * upper-cased and covers both spellings where they part: `Planholder`'s
 * `accountStatusLabel` says "Fully Paid" where the BPIS data says "FULLY PAID",
 * and this area has statuses that one does not. Anything unrecognised gets no
 * badge type rather than a wrong one.
 */
function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "REINSTATED":
      return "success";
    case "LAPSED":
      return "warning";
    case "TERMINATED":
    case "CANCELLED":
      return "danger";
    case "FULLY PAID":
    case "NEW SALES":
      return "info";
    default:
      return undefined;
  }
}

function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Sep 16, 2026" — the BPIS list's date, which is shorter than ours. */
function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The columns, in the BPIS list's order: who, then what they hold, then where it
 * stands.
 *
 * DEFINED OUTSIDE THE COMPONENT so the array is one object for the life of the
 * module. `DataTable` keeps its own state keyed on the column defs, and a fresh
 * array on every render is how a table loses the sort somebody just set.
 */
const planholderColumns: ColumnDef<PlanholderSearchResult>[] = [
  {
    id: "planholder",
    header: "Planholder",
    // Sorted and searched surname-first, which is how a claims processor reads a
    // list of people and how every other table in this area orders one — even
    // though the cell prints the given name first under the avatar.
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const planholder = row.original;
      return (
        <Flex align="center" gap={3}>
          <BrandedAvatar
            name={`${planholder.firstName} ${planholder.lastName}`}
            imageUrl={mockAvatarUrl(planholder.personId)}
            ringed
          />
          <Box minW={0}>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3">
              {toTitleCase(planholder.firstName)}{" "}
              {toTitleCase(planholder.lastName)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {planholder.personId}
            </Text>
          </Box>
        </Flex>
      );
    },
  },
  {
    accessorKey: "lpaNo",
    header: "LPA Number",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700" fontFamily="mono">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "planDesc",
    header: "Plan",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    // THE BRANCH'S NAME, FALLING BACK TO ITS CODE — and to a dash where the plan
    // has no payment on file to read one off. See `PlanholderSearchResult.branch`.
    cell: (info) => {
      const code = String(info.getValue() ?? "");
      return (
        <Text fontSize="sm" color="gray.700">
          {code ? db.getBranch(code)?.description || code : "—"}
        </Text>
      );
    },
  },
  {
    accessorKey: "accountStatus",
    header: "Status",
    cell: (info) => {
      const status = String(info.getValue() ?? "");
      return (
        <OSPBadge type={statusBadgeType(status)}>
          {toTitleCase(status)}
        </OSPBadge>
      );
    },
  },
  {
    accessorKey: "effectivityDate",
    header: "Effectivity",
    cell: (info) => (
      <Text fontSize="sm" color="gray.600">
        {formatDate(info.getValue() as Date)}
      </Text>
    ),
  },
];

/**
 * Plan holder search — the BPIS list, over claims data.
 *
 * WHY IT LISTS RATHER THAN SEARCHES. `listPlanholders()` hands over every plan
 * holder and the table narrows them; `searchPlanholders()` is the other shape
 * and is still what the quick-search in the claims toolbar uses, where the
 * answer has to arrive before a dropdown opens. Here the whole set is the point.
 */
export function PlanholderSearch() {
  const router = useRouter();

  // Once. The plan holder table is seed data and does not change under this
  // screen, and re-deriving it would hand `DataTable` a new array on every
  // render — which is a re-sort and a re-page for nothing.
  const planholders = useMemo(() => listPlanholders(), []);

  return (
    <DataTable<PlanholderSearchResult>
      columns={planholderColumns}
      data={planholders}
      getRowId={(row) => row.lpaNo}
      // THE ROW IS THE LINK, as it is on the BPIS list. The old version had a
      // magnifier that navigated when exactly one result matched; a table where
      // every row is clickable does not need the shortcut, and a control that
      // only sometimes goes somewhere was the harder half of it to explain.
      onRowClick={(row) =>
        router.push(`/claims/planholder/${encodeURIComponent(row.lpaNo)}`)
      }
      size="md"
      emptyState="No plan holder on file matches that search."
      features={{
        search: true,
        filtering: true,
        sorting: true,
        infiniteScroll: true,
        showToolbarPagination: false,
        columnToggle: true,
        selection: false,
        detailSidebar: false,
      }}
    />
  );
}

export default PlanholderSearch;
