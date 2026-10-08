"use client";

// The COIC lists — For Printing under the region card, and the List of
// Printed. Cloned from COFP's list card (user, 2026-10-06): the kit's
// `DataTable`, Edit PH Info as the row action, and Print under the table —
// which here builds the Confirmations of Cover.

import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Printer } from "lucide-react";
import {
  DataTable,
  H3,
  PrimaryMdFlexButton,
  type BulkAction,
  type RowAction,
} from "osp-ui-kit";
import { toast } from "sonner";

import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import {
  CofpPhInfoDialog,
  type CofpPhInfoForm,
} from "../../certificateoffullpayment/components/ph-info-dialog";
import { formatAddress } from "../../certificateoffullpayment/data/regions";
import { buildCoicPdf } from "../data/coic-pdf";
import type { CoicForPrinting } from "../data/types";

/** A row as the dialog edits it — the name fields and the address's parts. */
const formFor = (row: CoicForPrinting): CofpPhInfoForm => ({
  lastName: row.lastName,
  firstName: row.firstName,
  middleName: row.middleName,
  ...row.address,
});

const mono = (value: string) => (
  <Text as="span" fontFamily="mono" whiteSpace="nowrap">
    {value}
  </Text>
);

/**
 * The List of For Printing's columns (user, 2026-10-07): Branch, LPA No.,
 * Last Name, First Name, Middle Name, Address, Transaction Month — then the
 * Edit button, the kit's row action.
 *
 * Branch is the one in the filter menu. The kit's search only runs with its
 * `filtering` feature on (see the table below), and the menu that comes with
 * it lists every column not left out.
 */
const FOR_PRINTING_COLUMNS: ColumnDef<CoicForPrinting>[] = [
  { accessorKey: "branch", header: "Branch" },
  {
    accessorKey: "lpaNo",
    header: "LPA No.",
    enableColumnFilter: false,
    cell: ({ getValue }) => mono(getValue<string>()),
  },
  { accessorKey: "lastName", header: "Last Name", enableColumnFilter: false },
  { accessorKey: "firstName", header: "First Name", enableColumnFilter: false },
  { accessorKey: "middleName", header: "Middle Name", enableColumnFilter: false },
  {
    id: "address",
    accessorFn: (row) => formatAddress(row.address),
    header: "Address",
    enableColumnFilter: false,
    meta: { minWidth: "220px" },
    cell: ({ getValue }) => (
      <Text as="span" whiteSpace="normal">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    // "YYYY-MM", so it sorts as a month; drawn as "Sep 2026".
    accessorKey: "transactionMonth",
    header: "Transaction Month",
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text as="span" whiteSpace="nowrap">
        {new Date(`${getValue<string>()}-01T00:00:00Z`).toLocaleDateString(
          "en-US",
          { month: "short", year: "numeric", timeZone: "UTC" },
        )}
      </Text>
    ),
  },
];

/**
 * The List of Printed's columns (user, 2026-10-07): COIC No., LPA No., PH
 * Name, Released To — after the kit's checkbox, with no address and no action
 * column. Released To is the one in the filter menu.
 */
const PRINTED_COLUMNS: ColumnDef<CoicForPrinting>[] = [
  {
    accessorKey: "coicNo",
    header: "COIC No.",
    enableColumnFilter: false,
    cell: ({ getValue }) => mono(getValue<string>()),
  },
  {
    accessorKey: "lpaNo",
    header: "LPA No.",
    enableColumnFilter: false,
    cell: ({ getValue }) => mono(getValue<string>()),
  },
  {
    id: "phName",
    accessorFn: (row) => `${row.lastName}, ${row.firstName} ${row.middleName}`,
    header: "PH Name",
    enableColumnFilter: false,
  },
  {
    id: "releasedTo",
    // Blank while the memo is still for transmit; a string either way so the
    // search reads the column.
    accessorFn: (row) => row.releasedTo ?? "",
    header: "Released To",
    cell: ({ getValue }) =>
      getValue<string>() || (
        <Text as="span" color="gray.400">
          —
        </Text>
      ),
  },
];

export interface CoicListCardProps {
  rows: CoicForPrinting[];
  /** The region or branch the rows are under — titles the PDF's tab. */
  regionCode: string;
  /** Defaults to "List of For Printing". */
  title?: string;
  emptyMessage?: string;
  /** Whether Print is drawn under the table — off for the List of Printed. */
  printable?: boolean;
  /** Run on the checked rows — the List of Printed's Cancel COIC. */
  bulkActions?: BulkAction<CoicForPrinting>[];
}

export function CoicListCard({
  rows,
  regionCode,
  title = "List of For Printing",
  emptyMessage = "Nothing queued for printing in this region.",
  printable = true,
  bulkActions,
}: CoicListCardProps) {
  const [edits, setEdits] = useState<Record<string, CoicForPrinting>>({});
  const [editingId, setEditingId] = useState<string>();

  const data = useMemo(
    () => rows.map((row) => edits[row.id] ?? row),
    [rows, edits],
  );

  // The tab is opened before the PDF is built, while the click still counts
  // as the user's — see the same note on COFP's list card.
  const [building, setBuilding] = useState(false);

  const print = async () => {
    const tab = window.open("", "_blank");
    if (!tab) {
      toast.error("The new tab was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    tab.document.title = `COIC ${regionCode}`;
    tab.document.body.textContent = "Preparing certificates…";

    setBuilding(true);
    try {
      tab.location.href = await buildCoicPdf(data);
    } catch {
      tab.close();
      toast.error("The certificates could not be prepared. Try again.");
    } finally {
      setBuilding(false);
    }
  };

  const editing = data.find((row) => row.id === editingId);
  const editingDefaults = useMemo(
    () => (editing ? formFor(editing) : undefined),
    [editing],
  );

  const save = (row: CoicForPrinting, info: CofpPhInfoForm) => {
    const { lastName, firstName, middleName, ...address } = info;
    setEdits((prev) => ({
      ...prev,
      [row.id]: { ...row, lastName, firstName, middleName, address },
    }));
    toast.success(`PH info updated for ${row.lpaNo}.`);
  };

  const rowActions = useMemo<RowAction<CoicForPrinting>[]>(
    () => [
      {
        id: "edit",
        label: "Edit PH Info",
        icon: Pencil,
        onClick: (row) => setEditingId(row.id),
      },
    ],
    [],
  );

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      minW={0}
    >
      <DataTable<CoicForPrinting>
        // For Printing is the list with Print under it; the other is Printed.
        columns={printable ? FOR_PRINTING_COLUMNS : PRINTED_COLUMNS}
        data={data}
        title={<H3 fontSize="lg">{title}</H3>}
        getRowId={(row) => row.id}
        features={{
          search: true,
          sorting: true,
          pagination: true,
          showToolbarPagination: true,
          selection: !!bulkActions?.length,
          // On so the search works — the kit hands TanStack `enableFilters:
          // features.filtering`, and with that off no column is searchable.
          filtering: true,
          columnToggle: false,
          detailSidebar: false,
        }}
        // No action column on the List of Printed (user, 2026-10-07).
        rowActions={printable ? rowActions : undefined}
        bulkActions={bulkActions}
        emptyState={
          <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
            {emptyMessage}
          </Text>
        }
        labels={{
          searchPlaceholder: printable
            ? "Search LPA, name, or address..."
            : "Search COIC no, LPA, name, or released to...",
        }}
      />

      {printable && (
        <Flex justify="flex-end" mt={4}>
          <Box w={{ base: "full", md: "200px" }}>
            <PrimaryMdFlexButton
              disabled={data.length === 0 || building}
              onClick={print}
            >
              <Printer size={16} />
              {building ? "Preparing…" : "Print"}
            </PrimaryMdFlexButton>
          </Box>
        </Flex>
      )}

      {editing && editingDefaults && (
        <CofpPhInfoDialog
          open
          onOpenChange={(open) => !open && setEditingId(undefined)}
          lpaNo={editing.lpaNo}
          defaults={editingDefaults}
          onSave={(info) => save(editing, info)}
        />
      )}
    </Box>
  );
}

export default CoicListCard;
