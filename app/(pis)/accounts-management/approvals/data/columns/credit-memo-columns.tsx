"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Text } from "@chakra-ui/react";
import type { CreditMemoApproval } from "../types";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { multiSelectFilter } from "osp-ui-kit";

export const creditMemoColumns: ColumnDef<CreditMemoApproval>[] = [
  {
    accessorKey: "memoNo",
    header: "Memo No.",
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
    accessorKey: "planholderName",
    header: "Planholder",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
  },
  {
    accessorKey: "creditMemoType",
    header: "Type",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Badge colorPalette="blue" variant="subtle">
        {getValue<string>().replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <Text fontWeight="medium">
        {getValue<number>().toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    enableSorting: false,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "requester",
    header: "Requester",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => <ApprovalStatusBadge status={getValue<string>()} />,
  },
];
