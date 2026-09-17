"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Text } from "@chakra-ui/react";
import { ApprovalStatusBadge as StatusBadge } from "@/components/feedback/ApprovalStatusBadge";
import { UserAssignmentRequest } from "../types";
import { multiSelectFilter } from "osp-ui-kit";

export const userAssignmentColumns: ColumnDef<UserAssignmentRequest>[] = [
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
    accessorKey: "user",
    header: "User",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
  },
  {
    accessorKey: "memberCode",
    header: "Member Code",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "currentGroups",
    header: "Current Groups",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" color="gray.500">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    // What the request is actually asking for, so it reads beside the current
    // groups rather than being looked up in the detail pane.
    accessorKey: "requestedGroups",
    header: "Requested Groups",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
    },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "permissionEffect",
    header: "Effect",
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
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
];
