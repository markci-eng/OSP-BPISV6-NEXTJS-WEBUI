"use client";

// Payment Details — the selected plan's payments, under Planholder Remarks and
// Notes on the PIS planholder profile (user, 2026-10-07).
//
// BUILT AS THE REMARKS AND NOTES CARD ABOVE IT IS: the kit's
// `InfoCardAccordion` holding its `DataTable`, with the same compact rows, so
// the two folds read as a pair.
//
// The rows are the plan's statement receipts — the same ones the Statement of
// Accounts and the Planholder Details card are built from, so Inst No and the
// last SI Date agree with that card's Installment No. and Last Payment Date.
// The statement has no audit user, so one is stood in per receipt.
//
// Delete asks first and then removes the row from this card only; there is
// nowhere to persist it to yet. Edit and Add Payment have no screen to open
// yet and say so.

import { useState } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, InfoCardAccordion, useMessageDialog } from "osp-ui-kit";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import { getPlanStatement } from "@/components/plan-management/planholder-profile/data/plan-statement";
import { ledgerDate } from "./planholder-details-card";

type Plan = NonNullable<PlanholderPageProps["plans"]>[number];

interface PaymentRow {
  id: string;
  payClass: string;
  siNo: string;
  siDate: Date;
  siAmount: number;
  planCode: string;
  instNo: number;
  nextDue: Date;
  auditUser: string;
  auditDate: Date;
}

/** How many payments the list shows before it pages. */
const PAGE_SIZE = 5;

/** Stand-in audit users; the statement does not record who posted a receipt. */
const AUDIT_USERS = ["JENNILYN", "ROSEMARIE ANN", "MARK ANTHONY", "KRIS"];

/**
 * The Filters button's label, made distinct so the button can be found. The
 * kit draws it whenever `features.filtering` is on, which the search needs —
 * but with no column filterable it would only ever be a greyed-out button.
 */
const FILTER_BUTTON_LABEL = "Payment column filters";

/** The Remarks and Notes card's compact rows, so the two tables match. */
const COMPACT_ROWS = {
  "& thead th": { paddingBlock: "4px" },
  "& tbody td": { paddingBlock: "2px", lineHeight: "1.2" },
  "& tbody td p": {
    fontSize: "var(--chakra-font-sizes-xs)",
    lineHeight: "1.2",
  },
  [`& button[aria-label="${FILTER_BUTTON_LABEL}"]`]: { display: "none" },
} as const;

function peso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function rowsFor(plan: Plan): PaymentRow[] {
  return getPlanStatement(plan).paymentRecords.map((record, i) => ({
    id: record.siNumber,
    payClass: record.payClass,
    siNo: record.siNumber,
    siDate: record.siDate,
    siAmount: record.siAmount,
    planCode: record.planCode,
    instNo: record.installmentNumber,
    nextDue: record.nextDueDate,
    auditUser: AUDIT_USERS[(record.installmentNumber + i) % AUDIT_USERS.length],
    auditDate: record.auditDate,
  }));
}

/** A plain cell that stays on one line. */
function Cell({
  children,
  mono = false,
}: {
  children: string;
  mono?: boolean;
}) {
  return (
    <Text whiteSpace="nowrap" fontFamily={mono ? "mono" : undefined}>
      {children}
    </Text>
  );
}

export function PaymentDetailsCard({ plan }: { plan: Plan }) {
  // The body keys this card by plan, so each plan starts from its own rows.
  const [rows, setRows] = useState(() => rowsFor(plan));
  const { messageBox } = useMessageDialog();

  const editRow = (row: PaymentRow) =>
    toast.info(`Editing ${row.siNo} is not available yet.`);

  const deleteRow = async (row: PaymentRow) => {
    const confirmed = await messageBox({
      title: "Delete Payment",
      message: `Are you sure you want to delete this payment? (${row.siNo})`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!confirmed) return;
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.success("Payment deleted");
  };

  /**
   * A date column whose VALUE is the date as shown, MM/DD/YYYY. TanStack's
   * search skips any column whose values are not text or numbers, so a `Date`
   * value could never be searched; sorting still goes by the real date.
   */
  const dateColumn = (
    key: "siDate" | "nextDue" | "auditDate",
    header: string,
  ): ColumnDef<PaymentRow> => ({
    id: key,
    header,
    accessorFn: (row) => ledgerDate(row[key]) ?? "—",
    sortingFn: (a, b) => a.original[key].getTime() - b.original[key].getTime(),
    cell: (info) => <Cell>{info.getValue<string>()}</Cell>,
  });

  const columns: ColumnDef<PaymentRow>[] = [
    {
      accessorKey: "payClass",
      header: "Payclass",
      cell: (info) => <Cell>{info.getValue<string>()}</Cell>,
    },
    {
      accessorKey: "siNo",
      header: "SI No",
      cell: (info) => <Cell mono>{info.getValue<string>()}</Cell>,
    },
    dateColumn("siDate", "SI Date"),
    {
      // The amount as shown, "₱1,100.00", for the same reason as the dates —
      // a search for "1,100" matches it — and sorted by the number.
      id: "siAmount",
      header: "SI Amount",
      accessorFn: (row) => peso(row.siAmount),
      sortingFn: (a, b) => a.original.siAmount - b.original.siAmount,
      cell: (info) => <Cell>{info.getValue<string>()}</Cell>,
    },
    {
      accessorKey: "planCode",
      header: "Plan Code",
      cell: (info) => <Cell>{info.getValue<string>()}</Cell>,
    },
    {
      accessorKey: "instNo",
      header: "Inst No",
      cell: (info) => <Cell>{String(info.getValue<number>())}</Cell>,
    },
    dateColumn("nextDue", "Next Due"),
    {
      accessorKey: "auditUser",
      header: "Audit User",
      cell: (info) => <Cell>{info.getValue<string>()}</Cell>,
    },
    dateColumn("auditDate", "Audit Date"),
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      // Edit and delete, a hairline between them (user, 2026-10-07).
      cell: ({ row }) => (
        <Flex align="center" gap={1}>
          <IconButton
            aria-label={`Edit ${row.original.siNo}`}
            title="Edit"
            size="2xs"
            variant="ghost"
            color="gray.600"
            onClick={() => editRow(row.original)}
          >
            <Pencil size={14} />
          </IconButton>
          <Box
            alignSelf="stretch"
            borderLeftWidth="1px"
            borderColor="gray.200"
          />
          <IconButton
            aria-label={`Delete ${row.original.siNo}`}
            title="Delete"
            size="2xs"
            variant="ghost"
            color="red.500"
            onClick={() => deleteRow(row.original)}
          >
            <Trash2 size={14} />
          </IconButton>
        </Flex>
      ),
    },
  ];

  return (
    <InfoCardAccordion
      icon={<CreditCard />}
      title="Payment Details"
      defaultOpen
    >
      <Box css={COMPACT_ROWS}>
        <DataTable<PaymentRow>
          // No per-column filter menus: search is the only filter here.
          columns={columns.map((column) => ({
            ...column,
            enableColumnFilter: false,
          }))}
          data={rows}
          size="sm"
          defaultPageSize={PAGE_SIZE}
          getRowId={(row) => row.id}
          // Search, pagination and an Add button with its icon, all the
          // kit table's own (user, 2026-10-07).
          //
          // `filtering` ON FOR THE SEARCH TO WORK (user, 2026-10-07). The kit
          // hands `filtering` to TanStack as `enableFilters`, which is the
          // master switch for the global filter too: with it off, the search
          // box is drawn and its text ignored. No column filter menus come
          // with it, since every column is `enableColumnFilter: false`.
          features={{
            sorting: true,
            pagination: true,
            showToolbarPagination: true,
            search: true,
            filtering: true,
            columnToggle: false,
            selection: false,
            detailSidebar: false,
          }}
          labels={{
            searchPlaceholder: "Search payments...",
            filterButtonLabel: FILTER_BUTTON_LABEL,
          }}
          headerButton={{
            label: "Add Payment",
            icon: Plus,
            onClick: () => toast.info("Adding a payment is not available yet."),
          }}
          emptyState={
            <Text fontSize="xs" color="gray.400" py={3} textAlign="center">
              No payments on this plan yet.
            </Text>
          }
          mobileConfig={{
            viewMode: "card",
            primaryField: "siNo",
            titleTransform: "none",
            secondaryField: "siDate",
            visibleFields: ["payClass", "siAmount", "instNo", "nextDue"],
            labelMap: {
              payClass: "Payclass",
              siAmount: "SI Amount",
              instNo: "Inst No",
              nextDue: "Next Due",
            },
            // Takes the raw value or the column's formatted one, whichever
            // the card view hands over.
            valueFormatter: {
              siDate: (value) =>
                value instanceof Date
                  ? (ledgerDate(value) ?? "—")
                  : String(value ?? "—"),
              siAmount: (value) =>
                typeof value === "number" ? peso(value) : String(value ?? "—"),
              nextDue: (value) =>
                value instanceof Date
                  ? (ledgerDate(value) ?? "—")
                  : String(value ?? "—"),
            },
          }}
        />
      </Box>
    </InfoCardAccordion>
  );
}

export default PaymentDetailsCard;
