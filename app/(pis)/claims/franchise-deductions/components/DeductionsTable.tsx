"use client";

// THE FRANCHISE BILLINGS AND THEIR DEDUCTIONS — one list, typed into in place,
// posted together.
//
// THE KIT'S `DataTable`, the one Approvals uses (user, 2026-10-01: "so that the
// design is the same"): its search, its column filters, its pager, its summary
// row and its phone cards. What this file adds is the royalty input and the
// tabs above it.
//
// WHAT IS TYPED LIVES IN A CONTEXT, NOT IN THE COLUMNS. The kit renders each
// cell function as a component, so columns rebuilt on every keystroke would
// remount the input and drop its focus. The columns are module constants and
// the cells read the drafts from {@link DraftsContext}. Drafts are held by
// billing code, so they survive the tabs, the search, the filters and paging;
// only rows whose figure differs from the posted one are sent — see
// `usePostDeductions`.
//
// Discard and Post sit UNDER the table, never inside it, primary on the right,
// and both are always there (user, 2026-10-01).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Box, Flex, IconButton, Input, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { LuLock, LuUndo2 } from "react-icons/lu";
import {
  DataTable,
  PrimarySmButton,
  SecondarySmButton,
  multiSelectFilter,
  useMessageDialog,
} from "osp-ui-kit";

import { CheckCircle, Clock, Files } from "lucide-react";
import {
  FilterCards,
  type FilterCardSpec,
} from "../../components/filter-cards";
import { alignHeadersRight } from "../../components/table-align";
import { toaster } from "../../components/toaster";
import { useServicePayablesStore } from "../../service-payables/service-payables-store";
import {
  CAN_POST_DEDUCTIONS,
  DEDUCTION_STATUS,
  DEDUCTION_TABS,
  formatAmount,
  getDeductionRows,
  inTab,
  parseAmount,
  type DeductionRow,
  type DeductionTab,
} from "../deductions-data";
import {
  isChanged,
  isInvalid,
  royaltyOf,
  usePostDeductions,
  type RoyaltyDrafts,
} from "../use-post-deductions";

/**
 * Each tab's card, in Approvals' colours: orange is waiting, green is done,
 * blue is everything.
 */
const CARD_LOOK: Record<
  DeductionTab,
  Pick<FilterCardSpec, "sub" | "icon" | "accent">
> = {
  pending: { sub: "Awaiting royalty", icon: Clock, accent: "orange" },
  posted: { sub: "Sent to verification", icon: CheckCircle, accent: "green" },
  all: { sub: "All franchise billings", icon: Files, accent: "blue" },
};

/** The amber edge on a changed row — work not yet posted. */
const CHANGED_EDGE = "inset 3px 0 0 #b45309";

/** "113,000.00", or a dash for nothing. */
const money = (n: number | null) => (n === null ? "—" : formatAmount(n));

/** The net the row stands at, or `null` while no royalty is typed. */
function netOf(row: DeductionRow, drafts: RoyaltyDrafts): number | null {
  const royalty = royaltyOf(row, drafts);
  return royalty === null || Number.isNaN(royalty)
    ? null
    : row.gross - row.loan - royalty;
}

/* ------------------------------ the drafts ------------------------------ */

interface Drafts {
  drafts: RoyaltyDrafts;
  canPost: boolean;
  onType: (billingCode: string, text: string) => void;
  onLeave: (row: DeductionRow) => void;
  onUndo: (billingCode: string) => void;
}

const DraftsContext = createContext<Drafts>({
  drafts: {},
  canPost: false,
  onType: () => {},
  onLeave: () => {},
  onUndo: () => {},
});

const useDrafts = () => useContext(DraftsContext);

/* ------------------------------ the cells ------------------------------- */

function RoyaltyField({
  row,
  view,
}: {
  row: DeductionRow;
  /** Which copy of the list this sits in — the table, or the phone's cards. */
  view: "table" | "cards";
}) {
  const { drafts, onType, onLeave } = useDrafts();
  const changed = isChanged(row, drafts);
  const value =
    drafts[row.billingCode] ?? (row.royalty !== null ? money(row.royalty) : "");
  return (
    <Flex direction="column" align="flex-end" gap="1px">
      {/* The posted figure, struck through, while it is being typed over. */}
      {changed && row.royalty !== null && (
        <Text
          fontSize="10.5px"
          color="gray.400"
          textDecoration="line-through"
          fontVariantNumeric="tabular-nums"
        >
          {money(row.royalty)}
        </Text>
      )}
      <Box position="relative" w={view === "cards" ? "150px" : "130px"}>
        <Text
          position="absolute"
          left="9px"
          top="50%"
          transform="translateY(-50%)"
          fontSize="sm"
          color="gray.400"
          pointerEvents="none"
          zIndex={1}
        >
          ₱
        </Text>
        <Input
          data-royalty={view}
          data-code={row.billingCode}
          // What the row's amber edge keys on — see `CHANGED_ROW_CSS`.
          data-changed={changed ? "true" : undefined}
          aria-label={`Royalty for ${row.billingNo}`}
          aria-invalid={changed && isInvalid(row, drafts) ? true : undefined}
          inputMode="decimal"
          autoComplete="off"
          size="sm"
          h="32px"
          pl="22px"
          textAlign="right"
          fontVariantNumeric="tabular-nums"
          bg="white"
          borderColor="gray.200"
          _invalid={{ borderColor: "red.500" }}
          _focusVisible={{
            borderColor: "var(--chakra-colors-primary)",
            boxShadow: "none",
            outline: "none",
          }}
          value={value}
          // The row opens nothing, but keep a click here to the field.
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onType(row.billingCode, e.currentTarget.value)}
          onBlur={() => onLeave(row)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            // Down the list, the way an amount is typed off a sheet.
            const all = [
              ...document.querySelectorAll<HTMLInputElement>(
                `input[data-royalty="${view}"]`,
              ),
            ];
            const next = all[all.indexOf(e.currentTarget) + 1];
            if (next) next.focus();
            else e.currentTarget.blur();
          }}
        />
      </Box>
    </Flex>
  );
}

function RoyaltyCell({ row }: { row: DeductionRow }) {
  const { canPost } = useDrafts();
  return canPost && row.editable ? (
    <RoyaltyField row={row} view="table" />
  ) : (
    <Text textAlign="right">{money(row.royalty)}</Text>
  );
}

function NetCell({ row }: { row: DeductionRow }) {
  const { drafts } = useDrafts();
  const net = netOf(row, drafts);
  return (
    <Text
      textAlign="right"
      fontWeight="600"
      color={net !== null && net < 0 ? "red.600" : "gray.800"}
    >
      {money(net)}
    </Text>
  );
}

function UndoCell({ row }: { row: DeductionRow }) {
  const { drafts, onUndo } = useDrafts();
  if (!isChanged(row, drafts)) return null;
  return (
    <IconButton
      aria-label={`Undo change to ${row.billingNo}`}
      title="Undo change"
      size="xs"
      variant="ghost"
      color="gray.500"
      onClick={(e) => {
        e.stopPropagation();
        onUndo(row.billingCode);
      }}
    >
      <LuUndo2 />
    </IconButton>
  );
}

function StatusChip({ row }: { row: DeductionRow }) {
  const status = DEDUCTION_STATUS[row.stage];
  if (!status) return null;
  return (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py="1px"
      borderRadius="full"
      bg={status.bg}
      color={status.color}
      fontSize="11px"
      fontWeight="600"
      whiteSpace="nowrap"
    >
      {status.label}
    </Box>
  );
}

function Loan({ amount }: { amount: number }) {
  return (
    <Flex
      as="span"
      display="inline-flex"
      align="center"
      justify="flex-end"
      gap={1}
      color="gray.600"
      title="From the loan system"
    >
      <LuLock size={11} />
      {money(amount)}
    </Flex>
  );
}

/* ------------------------------ the columns ----------------------------- */

const BASE_COLUMNS: ColumnDef<DeductionRow, any>[] = [
  {
    accessorKey: "billingNo",
    header: "Billing No.",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { responsivePriority: 1, alwaysVisible: true },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    // The accessor is both, so the search finds a billing by either.
    id: "mortuary",
    accessorFn: (row) => `${row.mortuary} ${row.mortCode}`,
    header: "Mortuary",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { responsivePriority: 2, alwaysVisible: true },
    cell: ({ row }) => (
      <Box minW={0}>
        <Text lineClamp={1}>{row.original.mortuary}</Text>
        <Text fontFamily="mono" fontSize="11px" color="fg.muted" mt="1px">
          {row.original.mortCode}
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
    accessorKey: "gross",
    header: "Gross",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text textAlign="right">{money(getValue<number>())}</Text>
    ),
  },
  {
    accessorKey: "loan",
    header: "Loan",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => <Loan amount={getValue<number>()} />,
  },
  {
    accessorKey: "royalty",
    header: "Royalty",
    enableSorting: false,
    enableColumnFilter: false,
    meta: { alwaysVisible: true },
    cell: ({ row }) => <RoyaltyCell row={row.original} />,
  },
  {
    accessorKey: "net",
    header: "Net",
    enableSorting: false,
    enableColumnFilter: false,
    meta: { alwaysVisible: true },
    cell: ({ row }) => <NetCell row={row.original} />,
  },
];

const STATUS_COLUMN: ColumnDef<DeductionRow, any> = {
  id: "status",
  accessorFn: (row) => DEDUCTION_STATUS[row.stage]?.label ?? "",
  header: "Status",
  enableSorting: true,
  enableColumnFilter: true,
  filterFn: multiSelectFilter,
  cell: ({ row }) => <StatusChip row={row.original} />,
};

const UNDO_COLUMN: ColumnDef<DeductionRow, any> = {
  id: "undo",
  header: "",
  enableSorting: false,
  enableColumnFilter: false,
  enableHiding: false,
  cell: ({ row }) => <UndoCell row={row.original} />,
};

/**
 * Two fixed sets, because every row on the For Deduction tab has the same
 * status and the column only says something on Posted and All.
 */
const COLUMNS = [...BASE_COLUMNS, UNDO_COLUMN];
const COLUMNS_WITH_STATUS = [...BASE_COLUMNS, STATUS_COLUMN, UNDO_COLUMN];

/** Gross, Loan, Royalty and Net are columns 4–7 — their headings go right. */
const FIGURE_HEADERS = alignHeadersRight(":nth-of-type(n+4):nth-of-type(-n+7)");

/** The amber edge on a row whose royalty has been typed over. */
const CHANGED_ROW_CSS = {
  '& tbody tr:has(input[data-changed="true"]) > td:first-of-type': {
    boxShadow: CHANGED_EDGE,
  },
};

/* ------------------------------ phone card ------------------------------ */

function MobileCard({ row }: { row: DeductionRow }) {
  const { drafts, canPost } = useDrafts();
  const editing = canPost && row.editable;
  const net = netOf(row, drafts);
  return (
    <Flex
      direction="column"
      gap={2}
      px={3}
      py={3}
      borderBottomWidth="1px"
      borderColor="gray.100"
      boxShadow={isChanged(row, drafts) ? CHANGED_EDGE : undefined}
      fontSize="13px"
    >
      <Flex justify="space-between" gap={2} align="flex-start">
        <Box minW={0}>
          <Text fontFamily="mono" fontSize="12.5px">
            {row.billingNo}
          </Text>
          <Text fontWeight="500" color="gray.800">
            {row.mortuary}
          </Text>
          <Text fontSize="12px" color="gray.500">
            {row.mortCode} · {row.periodLabel}
          </Text>
        </Box>
        {row.stage !== "for-deduction" && <StatusChip row={row} />}
      </Flex>
      <Box
        display="grid"
        gridTemplateColumns="1fr auto"
        gap="2px 12px"
        fontVariantNumeric="tabular-nums"
      >
        <Text color="gray.500">Gross</Text>
        <Text textAlign="right">{money(row.gross)}</Text>
        <Text color="gray.500">Loan</Text>
        <Box textAlign="right">
          <Loan amount={row.loan} />
        </Box>
        {!editing && (
          <>
            <Text color="gray.500">Royalty</Text>
            <Text textAlign="right">{money(row.royalty)}</Text>
          </>
        )}
        <Text color="gray.500">Net</Text>
        <Text
          textAlign="right"
          fontWeight="600"
          color={net !== null && net < 0 ? "red.600" : undefined}
        >
          {money(net)}
        </Text>
      </Box>
      {editing && (
        <Flex justify="space-between" align="flex-end" gap={2}>
          <RoyaltyField row={row} view="cards" />
          <UndoCell row={row} />
        </Flex>
      )}
    </Flex>
  );
}

/* ------------------------------ the table ------------------------------- */

export function DeductionsTable() {
  const storeVersion = useServicePayablesStore();
  const postDeductions = usePostDeductions();
  const { messageBox } = useMessageDialog();
  const canPost = CAN_POST_DEDUCTIONS;

  const rows = useMemo(
    () => getDeductionRows(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  const [tab, setTab] = useState<DeductionTab>("pending");
  const [drafts, setDrafts] = useState<RoyaltyDrafts>({});

  const visible = useMemo(() => rows.filter((row) => inTab(row, tab)), [rows, tab]);

  const changed = rows.filter((row) => isChanged(row, drafts));
  const hiddenChanged = changed.filter((row) => !inTab(row, tab)).length;
  const dirty = changed.length > 0;

  // Unposted amounts live only on this page — warn before the tab is closed.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        DEDUCTION_TABS.map((t) => [
          t.key,
          rows.filter((row) => inTab(row, t.key)).length,
        ]),
      ) as Record<DeductionTab, number>,
    [rows],
  );

  const context = useMemo<Drafts>(
    () => ({
      drafts,
      canPost,
      onType: (billingCode, text) =>
        setDrafts((all) => ({ ...all, [billingCode]: text })),
      // Tidy the figure on the way out; forget a draft back at the posted one.
      onLeave: (row) =>
        setDrafts((all) => {
          if (!(row.billingCode in all)) return all;
          const typed = parseAmount(all[row.billingCode]);
          if (typed === row.royalty) {
            const { [row.billingCode]: _, ...rest } = all;
            return rest;
          }
          if (typed === null || Number.isNaN(typed)) return all;
          return { ...all, [row.billingCode]: formatAmount(typed) };
        }),
      onUndo: (billingCode) =>
        setDrafts((all) => {
          const { [billingCode]: _, ...rest } = all;
          return rest;
        }),
    }),
    [drafts, canPost],
  );

  /**
   * Put the cursor on a row that can't be posted. If the tab hides it, switch
   * to All; a kit search or filter the user set is theirs, so the toast names
   * the billing for that case.
   */
  const focusRow = (billingCode: string) => {
    const row = rows.find((r) => r.billingCode === billingCode);
    if (row && !inTab(row, tab)) setTab("all");
    // After the re-render the tab change causes. A timeout, not a frame:
    // frames do not run in a tab that is not being painted.
    setTimeout(() => {
      const shown = [
        ...document.querySelectorAll<HTMLInputElement>(
          `input[data-code="${billingCode}"]`,
        ),
      ].find((el) => el.offsetParent !== null);
      shown?.focus();
      shown?.select();
    });
  };

  const post = async () => {
    const result = await postDeductions(drafts);
    if (result.outcome === "invalid") focusRow(result.goTo);
    if (result.outcome === "posted") {
      setDrafts((all) => {
        const rest = { ...all };
        for (const code of result.codes) delete rest[code];
        return rest;
      });
    }
  };

  const discard = async () => {
    // A dialog, like Post's — a toast can go unnoticed.
    if (!dirty) {
      await messageBox({
        title: "NO CHANGES MADE",
        message: "There is nothing to discard.",
        confirmText: "Close",
        showCancel: false,
        variant: "information",
      });
      return;
    }
    setDrafts({});
    toaster.create({ type: "info", title: "Changes discarded" });
  };

  return (
    <DraftsContext.Provider value={context}>
      <Flex direction="column" gap={3}>
        {/* Approvals' card strip — see `FilterCards`. */}
        <FilterCards
          cards={DEDUCTION_TABS.map((t) => ({
            ...CARD_LOOK[t.key],
            label: t.label,
            value: counts[t.key],
            filter: t.key,
          }))}
          active={tab}
          onSelect={(key) => setTab(key as DeductionTab)}
        />
        <Box css={{ ...FIGURE_HEADERS, ...CHANGED_ROW_CSS }}>
          <DataTable<DeductionRow>
            columns={tab === "pending" ? COLUMNS : COLUMNS_WITH_STATUS}
            data={visible}
            getRowId={(row) => row.billingCode}
            summaryRows={[
              {
                label: "Total",
                labelColumnId: "billingNo",
                // Our own sums rather than the kit's `aggregations`, whose
                // number format drops the centavos.
                values: {
                  gross: ({ rows: shown }) => (
                    <Text textAlign="right" fontWeight="600">
                      {money(shown.reduce((s, r) => s + r.gross, 0))}
                    </Text>
                  ),
                  loan: ({ rows: shown }) => (
                    <Text textAlign="right" fontWeight="600">
                      {money(shown.reduce((s, r) => s + r.loan, 0))}
                    </Text>
                  ),
                  // No net until every row has a royalty — counting a missing
                  // one as nothing would overstate what is paid.
                  net: ({ rows: shown }) => {
                    const nets = shown.map((r) => netOf(r, drafts));
                    return (
                      <Text textAlign="right" fontWeight="600">
                        {nets.some((n) => n === null)
                          ? "—"
                          : money(nets.reduce<number>((s, n) => s + (n ?? 0), 0))}
                      </Text>
                    );
                  },
                },
              },
            ]}
            emptyState={
              <Text py={6} textAlign="center" fontSize="sm" color="gray.500">
                No billings here.
              </Text>
            }
            labels={{ searchPlaceholder: "Search billing no. or mortuary" }}
            features={{
              search: true,
              filtering: true,
              sorting: true,
              pagination: true,
              columnToggle: true,
              selection: false,
              detailSidebar: false,
            }}
            mobileConfig={{
              viewMode: "card",
              primaryField: "billingNo",
              renderMobileCard: (row) => <MobileCard row={row} />,
            }}
          />
        </Box>

        {/* ── actions: under the table, primary on the right ──
            ON A PHONE THE TWO SPLIT THE ROW (user, 2026-10-05: "occupy the
            full row with equal width"), and the change count takes its own
            line above them. From `lg` it is the PC layout: Discard left, the
            count and Post right. */}
        {canPost && (
          <Flex
            align="center"
            columnGap={2.5}
            rowGap={2}
            wrap={{ base: "wrap", lg: "nowrap" }}
          >
            {dirty && (
              <Text
                order={{ base: 0, lg: 1 }}
                flexBasis={{ base: "100%", lg: "auto" }}
                ml={{ lg: "auto" }}
                fontSize="12.5px"
                color="gray.500"
              >
                {changed.length} {changed.length === 1 ? "change" : "changes"}
                {hiddenChanged > 0 && ` · ${hiddenChanged} not in this view`}
              </Text>
            )}
            <SecondarySmButton
              type="button"
              onClick={discard}
              order={{ base: 1, lg: 0 }}
              flex={{ base: "1", lg: "none" }}
              // A THUMB-SIZED BUTTON ON A PHONE (user, 2026-10-05: "add some
              // height for the button") — 44px, the claims sheets' touch size.
              h={{ base: "44px", lg: "auto" }}
            >
              Discard
            </SecondarySmButton>
            <PrimarySmButton
              type="button"
              onClick={post}
              order={2}
              flex={{ base: "1", lg: "none" }}
              h={{ base: "44px", lg: "auto" }}
              ml={{ lg: dirty ? 0 : "auto" }}
            >
              {dirty
                ? `Post for Verification (${changed.length})`
                : "Post for Verification"}
            </PrimarySmButton>
          </Flex>
        )}
      </Flex>
    </DraftsContext.Provider>
  );
}

export default DeductionsTable;
