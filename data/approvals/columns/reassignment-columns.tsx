"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Text } from "@chakra-ui/react";

import type { ReassignmentRequest } from "../types";
import { multiSelectFilter } from "@/components/common/reusable-tableV2/types";

function ApprovalStatusBadge({ status }: { status: string }) {
  const colorPalette =
    status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}

export const reassignmentColumns: ColumnDef<ReassignmentRequest>[] = [
  {
    accessorKey: "salesForceId",
    header: "SalesForce ID",
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
    accessorKey: "document",
    header: "Document",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
  },
  {
    accessorKey: "series",
    header: "Series",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 3,
    },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "from",
    header: "From",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "to",
    header: "To",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
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
