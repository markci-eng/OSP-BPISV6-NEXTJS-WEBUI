"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Text } from "@chakra-ui/react";

import { multiSelectFilter } from "@/components/common/reusable-tableV2/types";
import { DRSWithDepositAndPayments } from "../types";

function StatusBadge({ status }: { status: string }) {
  const colorPalette =
    status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}

export const drsColumns: ColumnDef<DRSWithDepositAndPayments>[] = [
  {
    id: "referenceNo",
    accessorFn: (row) => row.drs?.referenceNo ?? "-",
    header: "Reference No.",
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
    id: "depositedBy",
    accessorFn: (row) => row.deposit?.deposit.DepositedBy ?? "-",
    header: "Deposited By",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    id: "depositDateTime",
    accessorFn: (row) => row.deposit?.deposit.DepositDateTime ?? "-",
    header: "Deposit Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    id: "bankCode",
    accessorFn: (row) => row.deposit?.deposit.BankCode ?? "-",
    header: "Bank Code",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    id: "bankBranch",
    accessorFn: (row) => row.deposit?.deposit.BankBranch ?? "-",
    header: "Bank Branch",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    id: "accountNo",
    accessorFn: (row) => row.deposit?.deposit.AccountNo ?? "-",
    header: "Account No.",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    id: "amount",
    accessorFn: (row) => Number(row.deposit?.deposit.Amount ?? 0),
    header: "Amount",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => {
      const amount = getValue<number>();

      return (
        <Text fontWeight="medium">
          {amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      );
    },
  },
  {
    id: "siCount",
    accessorFn: (row) => row.deposit?.details?.length ?? 0,
    header: "SI Count",
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "status",
    accessorFn: (row) => row.drs?.status ?? "-",
    header: "Status",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
];
