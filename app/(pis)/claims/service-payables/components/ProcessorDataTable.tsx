"use client";

// The processors as a table — the alternative to the card grid, and the
// counterpart to {@link TerritoryDataTable}.
//
// Same settings as that one (search, filters and pager all off) so a user who
// switched to the table view on one tab finds the same table on the next. The
// difference is the first column and the unit of the second: a processor is
// named rather than coded, and what they are measured in is BILLINGS PUT
// THROUGH, not chapels held.
//
// `onOpen` is optional, and it is the same flag the card view reads: a row leads
// into the Processed workspace on the stage that has one, and is a reading on
// the stages that do not — see the note on `ProcessorCard`.

import { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ALIGN_FIGURES_RIGHT } from "../../components/table-align";
import {
  discrepancyLabel,
  formatCSP,
  type ProcessorSummary,
} from "../service-payables-data";
import { initialsOf, territoryLabel } from "./ProcessorCard";

/** The same red the cards and the overview tile use for a discrepancy. */
const DEFICIENCY_ACCENT = "#e11d48";

/** Two related values in one cell — the territory table's construction. */
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

/** A bare count, in the weight the table's other figures use. */
const CountCell = ({ value }: { value: number }) => (
  <Text fontSize="xs" fontWeight="600" color="gray.700">
    {value}
  </Text>
);

const columns: ColumnDef<ProcessorSummary>[] = [
  {
    // The name, with the same initials chip the card carries so a row and a card
    // are recognisably the same processor across a view switch.
    id: "processor",
    accessorKey: "processor",
    // "Processor", not "Processed by", which is what the section above this is
    // already called — the two sit four lines apart and saying it twice reads
    // as a stutter. The territory table's first column is "Territory" under a
    // "Territories" heading for the same reason.
    header: "Processor",
    cell: (info) => (
      <Flex align="center" gap={2} minW={0}>
        <Flex
          flexShrink={0}
          align="center"
          justify="center"
          boxSize="26px"
          borderRadius="full"
          bg={`${BRAND_COLORS.primaryGreen}18`}
          color={BRAND_COLORS.darkGreen}
          fontSize="10px"
          fontWeight="800"
        >
          {initialsOf(info.row.original.processor)}
        </Flex>
        <StackedCell
          primary={info.row.original.processor}
          secondary={territoryLabel(info.row.original.territoryCount)}
        />
      </Flex>
    ),
  },
  {
    // Billings, not chapels. What a processor did is a count of billings put
    // through; the chapels are what those billings happened to be for, and they
    // ride along underneath rather than take a column.
    accessorKey: "billingCount",
    header: "Billings",
    cell: (info) => (
      <StackedCell
        primary={info.getValue() as number}
        secondary={
          info.row.original.chapelCount === 1
            ? "1 chapel"
            : `${info.row.original.chapelCount} chapels`
        }
        align="right"
      />
    ),
  },
  {
    // Same construction as the territory table's, including what it leaves out:
    // the billable count leads, and the second line is the discrepancies alone.
    // Deficiencies are not reported at this altitude — see the note there.
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

export interface ProcessorDataTableProps {
  /** Rows to show — already scoped to a stage by the section above. */
  data: ProcessorSummary[];
  /**
   * Where a row goes when clicked — the same place its card would. Omit it and
   * the rows stop being clickable, for the reason given on {@link ProcessorCard}:
   * only Processed has a workspace cut this way so far.
   */
  onOpen?: (summary: ProcessorSummary) => void;
}

export function ProcessorDataTable({ data, onOpen }: ProcessorDataTableProps) {
  // Never rebuilt with `data`, or the sort the user just set is thrown away.
  const cols = useMemo(() => columns, []);

  // The kit gives every row a pointer cursor whether or not it was handed an
  // `onRowClick`, so rows that go nowhere still LOOK clickable. Put back to
  // `default` from out here on the stages where they do not.
  return (
    <Box
      css={{
        // Same as the territory table's — the headings over the figure columns
        // end where the figures do. See `alignHeadersRight`.
        ...ALIGN_FIGURES_RIGHT,
        ...(onOpen ? {} : { "& tbody tr": { cursor: "default" } }),
      }}
    >
      <DataTable<ProcessorSummary>
        columns={cols}
        data={data}
        getRowId={(row) => row.processor}
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

export default ProcessorDataTable;
