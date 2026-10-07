"use client";

// The COFP lists — For Printing under the region card, and the Deficient,
// Printed, Confiscated and Replacement lists (user, 2026-10-02 onward).
//
// DRAWN WITH THE KIT'S `DataTable` (user, 2026-10-06), so search, sorting,
// paging, the row checkboxes and the toolbar's add button are the kit's own
// rather than this screen's. What the kit has no slot for — the Print button
// at the bottom right — sits under it, inside the same card.
//
// THE ROW ACTION IS EDIT (user, 2026-10-02): it opens Edit PH Info on the row.
// What is saved is kept here, by row id, and laid over the source rows — so an
// edit survives switching to another region and back, and is gone on reload,
// which is right for a draft with nowhere to be saved to yet.

import { useMemo, useState, type ReactNode } from "react";
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
import { buildCofpPdf } from "../data/cofp-pdf";
import { formatAddress } from "../data/regions";
import type { CofpForPrinting } from "../data/types";
import { CofpPhInfoDialog, type CofpPhInfoForm } from "./ph-info-dialog";

/** A row as the dialog edits it — the name fields and the address's parts. */
const formFor = (row: CofpForPrinting): CofpPhInfoForm => ({
  lastName: row.lastName,
  firstName: row.firstName,
  middleName: row.middleName,
  ...row.address,
});

// THE ADDRESS WRAPS, every other column stays on one line: it is the only
// value long enough to need more than one.
const COLUMNS: ColumnDef<CofpForPrinting>[] = [
  { accessorKey: "branch", header: "Branch" },
  {
    accessorKey: "lpaNo",
    header: "LPA No",
    cell: ({ getValue }) => (
      <Text as="span" fontFamily="mono" whiteSpace="nowrap">
        {getValue<string>()}
      </Text>
    ),
  },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "middleName", header: "Middle Name" },
  {
    id: "address",
    accessorFn: (row) => formatAddress(row.address),
    header: "Address",
    meta: { minWidth: "220px" },
    cell: ({ getValue }) => (
      <Text as="span" whiteSpace="normal">
        {getValue<string>()}
      </Text>
    ),
  },
];

export interface CofpForPrintingListCardProps {
  rows: CofpForPrinting[];
  /** The region the rows are under — titles the PDF's tab while it loads. */
  regionCode: string;
  /** Defaults to "List of For Printing". */
  title?: string;
  /** What the table says with no rows. */
  emptyMessage?: string;
  /**
   * Whether the Print button is drawn under the table. Off for Deficient (user,
   * 2026-10-05): the same list, but a deficient certificate is not printed.
   */
  printable?: boolean;
  /** The Print button's label — "Print COFP Replacement" under Replacement. */
  printLabel?: string;
  /**
   * Run on the checked rows — Printed's Cancel COFP and Confiscated's Return
   * (user, 2026-10-05). The rows get checkboxes only when there are some.
   */
  bulkActions?: BulkAction<CofpForPrinting>[];
  /**
   * Drawn at the end of the table's toolbar — Confiscated Replacement's Add
   * Confiscated COFP, icon only (user, 2026-10-06).
   */
  headerActions?: ReactNode;
}

export function CofpForPrintingListCard({
  rows,
  regionCode,
  title = "List of For Printing",
  emptyMessage = "Nothing queued for printing in this region.",
  printable = true,
  printLabel = "Print",
  bulkActions,
  headerActions,
}: CofpForPrintingListCardProps) {
  const [edits, setEdits] = useState<Record<string, CofpForPrinting>>({});
  const [editingId, setEditingId] = useState<string>();

  // Held steady between renders: the kit's table copies `data` into its own
  // state whenever the array changes.
  const data = useMemo(
    () => rows.map((row) => edits[row.id] ?? row),
    [rows, edits],
  );

  // PRINT BUILDS THE PDF FROM THE LIST — edits included — and opens it in a
  // NEW TAB (user, 2026-10-02), where the browser's own viewer prints and
  // saves it.
  //
  // The tab is opened BEFORE the PDF is built, while the click still counts as
  // the user's: a tab opened after an `await` is one popup blockers stop. It
  // shows a holding line until the PDF is ready, then is pointed at it.
  //
  // The blob URL is not revoked: the tab still needs it to print or save, and
  // the page has no way to know when that tab is closed.
  const [building, setBuilding] = useState(false);

  const print = async () => {
    const tab = window.open("", "_blank");
    if (!tab) {
      toast.error("The new tab was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    tab.document.title = `COFP ${regionCode}`;
    tab.document.body.textContent = "Preparing certificates…";

    setBuilding(true);
    try {
      tab.location.href = await buildCofpPdf(data);
    } catch {
      tab.close();
      toast.error("The certificates could not be prepared. Try again.");
    } finally {
      setBuilding(false);
    }
  };

  const editing = data.find((row) => row.id === editingId);
  // Held steady while the dialog is open, so its reset-on-open effect does not
  // fire on every render.
  const editingDefaults = useMemo(
    () => (editing ? formFor(editing) : undefined),
    [editing],
  );

  const save = (row: CofpForPrinting, info: CofpPhInfoForm) => {
    const { lastName, firstName, middleName, ...address } = info;
    setEdits((prev) => ({
      ...prev,
      [row.id]: { ...row, lastName, firstName, middleName, address },
    }));
    toast.success(`PH info updated for ${row.lpaNo}.`);
  };

  const rowActions = useMemo<RowAction<CofpForPrinting>[]>(
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

  const selectable = !!bulkActions?.length;

  return (
    <Box
      // The region card's own surface, so the two read as one stack.
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      minW={0}
    >
      <DataTable<CofpForPrinting>
        columns={COLUMNS}
        data={data}
        title={<H3 fontSize="lg">{title}</H3>}
        getRowId={(row) => row.id}
        features={{
          search: true,
          sorting: true,
          pagination: true,
          showToolbarPagination: true,
          selection: selectable,
          filtering: false,
          columnToggle: false,
          detailSidebar: false,
        }}
        rowActions={rowActions}
        bulkActions={bulkActions}
        headerActions={headerActions}
        emptyState={
          <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
            {emptyMessage}
          </Text>
        }
        labels={{ searchPlaceholder: "Search LPA, name, or address..." }}
      />

      {printable && (
        <Flex justify="flex-end" mt={4}>
          <Box w={{ base: "full", md: printLabel === "Print" ? "200px" : "240px" }}>
            <PrimaryMdFlexButton
              disabled={data.length === 0 || building}
              onClick={print}
            >
              <Printer size={16} />
              {building ? "Preparing…" : printLabel}
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

export default CofpForPrintingListCard;
