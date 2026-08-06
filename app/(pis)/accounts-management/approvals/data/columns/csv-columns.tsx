"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Text } from "@chakra-ui/react";


import type { CSVApproval } from "../types";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { multiSelectFilter } from "osp-ui-kit";

export const csvColumns: ColumnDef<CSVApproval>[] = [
  {
    accessorKey: "lpaNo",
    header: "LPA No.",
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
    accessorKey: "planType",
    header: "Plan Type",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "surrenderValue",
    header: "Surrender Value",
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
    accessorKey: "surrenderDate",
    header: "Surrender Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    enableSorting: true,
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
