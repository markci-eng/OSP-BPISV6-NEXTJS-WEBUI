"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Text } from "@chakra-ui/react";

import { multiSelectFilter } from "@/components/common/reusable-tableV2/types";
import { SA2Reassignment } from "../types";
import { formatApprovalDate } from "../../utils/formatters";
import { getApprovalStatusBadgeStyle } from "../../utils/colors";

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge {...getApprovalStatusBadgeStyle(status)}>
      {status}
    </Badge>
  );
}

export const sa2Columns: ColumnDef<SA2Reassignment>[] = [
  {
    accessorKey: "id",
    header: "Request ID",
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
    accessorKey: "employee",
    header: "Employee",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
  },
  {
    accessorKey: "fromManager",
    header: "From Manager",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "toManager",
    header: "To Manager",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "date",
    header: "Effective Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Text fontSize="sm">{formatApprovalDate(getValue())}</Text>
    ),
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Text fontSize="sm">{formatApprovalDate(getValue())}</Text>
    ),
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
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
];
