"use client";

import {
  getAgentNameById,
  getPositionDesc,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { ColumnDef } from "@tanstack/react-table";
import { Small } from "st-peter-ui";
import { AgentIdentityCell, StatusBadge } from "../components/shared";

/* ─── Agent table columns / mobile config ────────────────────────────────── */

export const agentColumns: ColumnDef<SalesAgent>[] = [
  {
    accessorKey: "name",
    header: "Agent",
    enableColumnFilter: false,
    cell: ({ row }) => <AgentIdentityCell agent={row.original} />,
    meta: { minWidth: "200px", responsivePriority: 1, alwaysVisible: true },
  },
  {
    id: "superior",
    accessorFn: (r) => getAgentNameById(r.superiorId ?? "") ?? "—",
    header: "Current Superior",
    enableColumnFilter: false,
    cell: (info) => <Small color="gray.600">{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    enableColumnFilter: true,
    cell: (info) => <Small color="gray.600">{String(info.getValue())}</Small>,
  },
  {
    id: "rank",
    accessorFn: (r) => getPositionDesc(r.position),
    header: "Rank",
    enableColumnFilter: true,
    cell: (info) => <Small color="gray.600">{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "employeeStatus",
    header: "Status",
    enableColumnFilter: true,
    cell: (info) => <StatusBadge status={String(info.getValue())} />,
  },
];

export const agentMobileConfig = {
  viewMode: "card" as const,
  primaryField: "name" as const,
  secondaryField: "id" as const,
  badgeField: "employeeStatus" as const,
  visibleFields: ["superiorId", "branch", "position"] as (keyof SalesAgent)[],
  labelMap: {
    id: "Agent Code",
    superiorId: "Current Superior",
    branch: "Branch",
    position: "Rank",
  },
  valueFormatter: {
    superiorId: (v: unknown) => getAgentNameById(String(v ?? "")) ?? "—",
    position: (v: unknown) => getPositionDesc(String(v)),
  },
  badgeColorMap: { Active: "green", Inactive: "orange", Resigned: "red" },
};
