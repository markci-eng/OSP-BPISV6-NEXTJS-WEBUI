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
import { Box, Button, Checkbox, Flex, IconButton, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Printer, TagIcon } from "lucide-react";
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
//
// ONLY BRANCH AND REASON ARE IN THE FILTER MENU: the kit's search needs its
// `filtering` feature on (see the table below), and the menu that comes with
// it lists every column it is not told to leave out. A name or an address,
// one value a row, is what the search is for.
const COLUMNS: ColumnDef<CofpForPrinting>[] = [
  { accessorKey: "branch", header: "Branch" },
  {
    accessorKey: "lpaNo",
    header: "LPA No",
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text as="span" fontFamily="mono" whiteSpace="nowrap">
        {getValue<string>()}
      </Text>
    ),
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
];

/**
 * The List of Printed's own columns (user, 2026-10-07): COFP No., LPA No.,
 * PH Name, Released To, Address — after the kit's checkbox, with no action
 * column. Released To is the one in the filter menu.
 */
const PRINTED_COLUMNS: ColumnDef<CofpForPrinting>[] = [
  {
    accessorKey: "cofpNo",
    header: "COFP No.",
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text as="span" fontFamily="mono" whiteSpace="nowrap">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "lpaNo",
    header: "LPA No.",
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text as="span" fontFamily="mono" whiteSpace="nowrap">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    id: "phName",
    accessorFn: (row) => `${row.lastName}, ${row.firstName} ${row.middleName}`,
    header: "PH Name",
    enableColumnFilter: false,
  },
  {
    id: "releasedTo",
    // Blank while the memo is still to be transmitted; a string either way so
    // the search reads the column.
    accessorFn: (row) => row.releasedTo ?? "",
    header: "Released To",
    cell: ({ getValue }) =>
      getValue<string>() || (
        <Text as="span" color="gray.400">
          —
        </Text>
      ),
  },
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
];

/**
 * The List of Confiscated's columns (user, 2026-10-07): Branch, COFP No.,
 * LPA No., PH Name and Date Confiscated — after the checkbox, before Edit |
 * Untag. Under SPFC the Batch Number takes the date's place. Branch is the
 * one in the filter menu.
 */
const CONFISCATED_LEAD: ColumnDef<CofpForPrinting>[] = [
  { accessorKey: "branch", header: "Branch" },
  // COFP No., LPA No. and PH Name, as Printed draws them.
  ...PRINTED_COLUMNS.slice(0, 3),
];

const CONFISCATED_COLUMNS: ColumnDef<CofpForPrinting>[] = [
  ...CONFISCATED_LEAD,
  {
    id: "dateConfiscated",
    // ISO, so it sorts as a date; drawn as one.
    accessorFn: (row) => row.dateConfiscated ?? "",
    header: "Date Confiscated",
    enableColumnFilter: false,
    cell: ({ getValue }) => {
      const iso = getValue<string>();
      return (
        <Text as="span" whiteSpace="nowrap">
          {iso
            ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
            : "—"}
        </Text>
      );
    },
  },
];

const CONFISCATED_SPFC_COLUMNS: ColumnDef<CofpForPrinting>[] = [
  ...CONFISCATED_LEAD,
  {
    id: "batchNo",
    accessorFn: (row) => row.batchNo ?? "",
    header: "Batch Number",
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text as="span" fontFamily="mono" whiteSpace="nowrap">
        {getValue<string>() || "—"}
      </Text>
    ),
  },
];

/** Deficient's extra column (user, 2026-10-07) — why the certificate is held. */
const REASON_COLUMN: ColumnDef<CofpForPrinting> = {
  accessorKey: "reason",
  header: "Reason",
  meta: { minWidth: "180px" },
  cell: ({ getValue }) => (
    <Text as="span" whiteSpace="normal" color="red.600" fontWeight="medium">
      {getValue<string | undefined>() ?? "—"}
    </Text>
  ),
};

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
  /** Whether the Reason column is drawn — Deficient's (user, 2026-10-07). */
  showReason?: boolean;
  /**
   * A list's own columns in place of the default ones (user, 2026-10-07):
   * Printed's, which also drops the Edit PH Info action, and Confiscated's —
   * with Date Confiscated, or Batch Number under SPFC.
   */
  columnSet?: "default" | "printed" | "confiscated" | "confiscatedSpfc";
  /**
   * Buttons under the table, bottom right where Print sits, run on the
   * checked rows — Deficient's Approve, Confiscated's Return and Remove (user,
   * 2026-10-07). A destructive one is drawn red. The rows get this card's own
   * checkboxes with them, not the kit's: the kit's selection bar clears its
   * checks without saying so, which would leave the buttons acting on rows no
   * longer checked.
   */
  footerActions?: BulkAction<CofpForPrinting>[];
  /**
   * Untag, drawn beside Edit with a line between (user, 2026-10-07) — in an
   * actions column of this card's own, as the kit folds two actions into a
   * menu.
   */
  onUntag?: (row: CofpForPrinting) => void;
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
  showReason = false,
  columnSet = "default",
  footerActions,
  onUntag,
}: CofpForPrintingListCardProps) {
  const printedColumns = columnSet === "printed";
  const hasFooter = !!footerActions?.length;
  const [edits, setEdits] = useState<Record<string, CofpForPrinting>>({});
  const [editingId, setEditingId] = useState<string>();

  // Held steady between renders: the kit's table copies `data` into its own
  // state whenever the array changes.
  const data = useMemo(
    () => rows.map((row) => edits[row.id] ?? row),
    [rows, edits],
  );

  // The footer action's checks, by row id. Read against `data`, so a row that
  // has left the list (approved, say) is no longer counted as checked.
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());
  const checkedRows = useMemo(
    () => data.filter((row) => checkedIds.has(row.id)),
    [data, checkedIds],
  );

  const columns = useMemo<ColumnDef<CofpForPrinting>[]>(() => {
    const listed =
      columnSet === "printed"
        ? PRINTED_COLUMNS
        : columnSet === "confiscated"
          ? CONFISCATED_COLUMNS
          : columnSet === "confiscatedSpfc"
            ? CONFISCATED_SPFC_COLUMNS
            : showReason
              ? [...COLUMNS, REASON_COLUMN]
              : COLUMNS;

    // Edit | Untag, at the end where the kit draws its own actions.
    const actionsColumn: ColumnDef<CofpForPrinting> = {
      id: "actions",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      meta: { width: "88px" },
      cell: ({ row }) => (
        <Flex align="center" justify="flex-end" gap={1}>
          <IconButton
            aria-label="Edit PH Info"
            title="Edit PH Info"
            variant="ghost"
            size="sm"
            onClick={() => setEditingId(row.original.id)}
          >
            <Pencil size={16} />
          </IconButton>
          <Box w="1px" h="18px" bg="gray.300" flexShrink={0} />
          <IconButton
            aria-label="Untag"
            title="Untag"
            variant="ghost"
            size="sm"
            colorPalette="red"
            onClick={() => onUntag?.(row.original)}
          >
            <TagIcon size={16} />
          </IconButton>
        </Flex>
      ),
    };
    const base = onUntag ? [...listed, actionsColumn] : listed;
    if (!hasFooter) return base;

    const setChecked = (ids: string[], checked: boolean) =>
      setCheckedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
        return next;
      });

    const checkColumn: ColumnDef<CofpForPrinting> = {
      id: "check",
      enableSorting: false,
      enableColumnFilter: false,
      meta: { width: "44px" },
      // Checks the page shown, as the kit's own header checkbox does.
      header: ({ table }) => {
        const ids = table.getRowModel().rows.map((row) => row.original.id);
        const count = ids.filter((id) => checkedIds.has(id)).length;
        return (
          <Checkbox.Root
            size="sm"
            aria-label="Check all rows on this page"
            checked={
              count === 0 ? false : count === ids.length ? true : "indeterminate"
            }
            onCheckedChange={(e) => setChecked(ids, e.checked === true)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        );
      },
      cell: ({ row }) => (
        <Checkbox.Root
          size="sm"
          aria-label={`Check ${row.original.lpaNo}`}
          checked={checkedIds.has(row.original.id)}
          onCheckedChange={(e) =>
            setChecked([row.original.id], e.checked === true)
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
    };
    return [checkColumn, ...base];
  }, [columnSet, showReason, hasFooter, onUntag, checkedIds]);

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
        columns={columns}
        data={data}
        title={<H3 fontSize="lg">{title}</H3>}
        getRowId={(row) => row.id}
        features={{
          search: true,
          sorting: true,
          pagination: true,
          showToolbarPagination: true,
          selection: selectable,
          // ON SO THE SEARCH WORKS (user, 2026-10-07). The kit hands TanStack
          // `enableFilters: features.filtering`, and with that off TanStack
          // treats no column as searchable — the search box filtered nothing.
          filtering: true,
          columnToggle: false,
          detailSidebar: false,
        }}
        rowActions={printedColumns || onUntag ? undefined : rowActions}
        bulkActions={bulkActions}
        headerActions={headerActions}
        emptyState={
          <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
            {emptyMessage}
          </Text>
        }
        labels={{ searchPlaceholder: "Search LPA, name, or address..." }}
      />

      {hasFooter && (
        <Flex
          justify="flex-end"
          mt={4}
          gap={2}
          direction={{ base: "column", md: "row" }}
        >
          {footerActions?.map((action) => {
            const Icon = action.icon;
            const label =
              checkedRows.length > 0
                ? `${action.label} (${checkedRows.length})`
                : action.label;
            const content = (
              <>
                {Icon && <Icon size={16} />}
                {label}
              </>
            );
            return (
              <Box key={action.id} w={{ base: "full", md: "200px" }}>
                {action.variant === "destructive" ? (
                  // The kit's delete buttons are fixed to their own label.
                  <Button
                    w="full"
                    variant="outline"
                    colorPalette="red"
                    disabled={checkedRows.length === 0}
                    onClick={() => action.onClick(checkedRows)}
                  >
                    {content}
                  </Button>
                ) : (
                  <PrimaryMdFlexButton
                    disabled={checkedRows.length === 0}
                    onClick={() => action.onClick(checkedRows)}
                  >
                    {content}
                  </PrimaryMdFlexButton>
                )}
              </Box>
            );
          })}
        </Flex>
      )}

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
