"use client";

// The plan's PAYMENTS — the account's own ledger, under the block of plan
// facts (user, 2026-09-22).
//
// AN ACCORDION because it is the longest thing in the column and the least
// often read: a COFP is raised off the balance and the account status, both of
// which are on the card above. The ledger is what gets opened when one of those
// is in question, so it costs a row of card until then. `InfoCardAccordion` is
// the kit's own, so it is the same fold the sales force screens use.
//
// TEN ROWS A PAGE (user, 2026-09-22). The kit's `DataTable` is the app's table
// — tanstack underneath, so sorting and paging come with it rather than being
// rebuilt here — and `defaultPageSize` is what "max display" means in its
// terms: ten lines, then the pager.

import { Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, InfoCardAccordion } from "osp-ui-kit";
import { Receipt } from "lucide-react";

import { formatFiledDate } from "@/app/(pis)/data";
import type { CofpPayment } from "../data/types";

/** How many lines the ledger shows before it pages. */
const PAGE_SIZE = 10;

/** Pesos as the ledger prints them, to the centavo. */
function peso(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// The six columns the ledger is read in, in the order a line is read: which
// plan, how it was collected, what it was receipted on and when, how much, and
// which installment it settled.
//
// The figures are MONOSPACED so the digits line up down the column, which is
// what makes a run of amounts comparable at a glance. Not right-aligned,
// though it would read better still: the kit's table draws its own headers and
// takes no alignment for them, and a right-aligned column under a left-aligned
// heading looks worse than a straight left edge.
const columns: ColumnDef<CofpPayment>[] = [
  {
    accessorKey: "LPANo",
    header: "LPA No",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "Payclass",
    header: "Pay Class",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "SINo",
    header: "SI No",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "SIDate",
    header: "SI Date",
    cell: (info) => (
      <Text whiteSpace="nowrap">{formatFiledDate(info.getValue<string>())}</Text>
    ),
  },
  {
    accessorKey: "SIAmount",
    header: "SI Amount",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {peso(info.getValue<number>())}
      </Text>
    ),
  },
  {
    accessorKey: "InstallmentNo",
    header: "Installment No",
    cell: (info) => (
      <Text fontFamily="mono">{info.getValue<number>()}</Text>
    ),
  },
];

export interface CofpPaymentsCardProps {
  payments: CofpPayment[];
}

export function CofpPaymentsCard({ payments }: CofpPaymentsCardProps) {
  return (
    <InfoCardAccordion
      icon={<Receipt />}
      title="Payments"
      // What the fold is worth opening for, on the fold itself: how many lines
      // are in there, so nobody opens it to find out.
      subtitle={`${payments.length} payment${payments.length === 1 ? "" : "s"} posted`}
    >
      <DataTable
        columns={columns}
        data={payments}
        size="sm"
        defaultPageSize={PAGE_SIZE}
        // SORTING AND PAGING ONLY. The table stands in a card inside a fold in
        // a page column: search, column filters, the column toggle, selection
        // and the detail sidebar are all chrome wider than the space it has,
        // and a ledger of one plan's payments is read down rather than
        // searched.
        features={{
          sorting: true,
          pagination: true,
          search: false,
          filtering: false,
          columnToggle: false,
          selection: false,
          detailSidebar: false,
        }}
        emptyState={
          <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
            No payment is posted against this plan.
          </Text>
        }
        // On a phone the six columns do not fit side by side, so each line
        // becomes a card: the SI number identifies it, the date sits under
        // that, the amount stands to the right, and the rest are label/value
        // rows inside.
        mobileConfig={{
          viewMode: "card",
          primaryField: "SINo",
          titleTransform: "none",
          secondaryField: "SIDate",
          badgeField: "SIAmount",
          visibleFields: ["LPANo", "Payclass", "InstallmentNo"],
          labelMap: {
            LPANo: "LPA No",
            Payclass: "Pay Class",
            InstallmentNo: "Installment No",
          },
          valueFormatter: {
            SIDate: (value) => formatFiledDate(String(value)),
            SIAmount: (value) => peso(Number(value)),
          },
        }}
      />
    </InfoCardAccordion>
  );
}

export default CofpPaymentsCard;
