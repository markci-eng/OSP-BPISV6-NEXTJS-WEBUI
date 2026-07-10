"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Text } from "@chakra-ui/react";

import { multiSelectFilter } from "@/components/common/reusable-tableV2/types";
import { EmployeeMovement } from "../types";

function StatusBadge({ status }: { status: string }) {
  const colorPalette =
    status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}

function MovementTypeBadge({
  movementType,
}: {
  movementType: EmployeeMovement["movementType"];
}) {
  const colorPalette = movementType === "Promotion" ? "green" : "orange";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {movementType}
    </Badge>
  );
}

export const movementColumns: ColumnDef<EmployeeMovement>[] = [
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
    accessorKey: "currentPosition",
    header: "Current Position",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "newPosition",
    header: "New Position",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "movementType",
    header: "Movement Type",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <MovementTypeBadge
        movementType={getValue<EmployeeMovement["movementType"]>()}
      />
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
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
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
];
