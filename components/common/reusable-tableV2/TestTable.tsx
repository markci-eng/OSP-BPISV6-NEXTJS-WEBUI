"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Box, Text, Badge, HStack } from "@chakra-ui/react";
import { Archive, Copy, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  documents,
  type Documents,
  EMPLOYEES,
} from "@/data/doc-management/documenttype";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  type BulkAction,
  multiSelectFilter,
  type RowAction,
} from "@/components/common/reusable-tableV2/types";
import { Employee } from "@/data/doc-management/employeeSelector";

/* -------------------------------------------------------------------------------------------------
 * Row type used by the table
 *
 * Notes:
 * - We extend the original Documents type and add UI-friendly/computed fields.
 * - documentCode is treated as the unique row identifier.
 * - No separate `id` field is needed as long as the table can use documentCode as row id.
 * ------------------------------------------------------------------------------------------------- */
export type AssignedDocRow = Documents & {
  controlNo: string;
  employeeName: string;
  department: string;
  remainingQtyNum: number;
  assignedStatus: "Assigned" | "Unassigned" | "Unknown Employee";
  expiryDateNum: string;
};

/* -------------------------------------------------------------------------------------------------
 * Helper: Build a fast lookup map for employees
 *
 * Why:
 * - Instead of looping employees every time for every document,
 *   we create a Map once for quick access by employee id.
 * ------------------------------------------------------------------------------------------------- */
function createEmployeeMap(employees: Employee[]) {
  return new Map(employees.map((employee) => [employee.id, employee]));
}

/* -------------------------------------------------------------------------------------------------
 * Helper: Determine assignment status for a document
 *
 * Rules:
 * - No salesForceId or assignedTo => Unassigned
 * - salesForceId exists and employee exists in master data => Assigned
 * - salesForceId exists but employee not found => Unknown Employee
 * ------------------------------------------------------------------------------------------------- */
function getAssignedStatus(
  doc: Documents,
  employee?: Employee,
): AssignedDocRow["assignedStatus"] {
  if (!doc.salesForceId || !doc.assignedTo) return "Unassigned";
  if (employee) return "Assigned";
  return "Unknown Employee";
}

/* -------------------------------------------------------------------------------------------------
 * Transform raw document data into table-ready rows
 *
 * Why:
 * - Keeps UI logic out of the component body
 * - Easier to test and reuse
 * ------------------------------------------------------------------------------------------------- */
function buildAssignedDocumentRows(
  employees: Employee[],
  docs: Documents[],
): AssignedDocRow[] {
  const employeeMap = createEmployeeMap(employees);

  return docs.map((doc) => {
    const employee = doc.salesForceId
      ? employeeMap.get(doc.salesForceId)
      : undefined;

    return {
      ...doc,
      controlNo: doc.controlNo,
      employeeName: employee?.name ?? doc.assignedTo ?? "(no assignee)",
      department: employee?.branch ?? "(unknown department)",
      remainingQtyNum: Number(doc.remainingQty || 0),
      assignedStatus: getAssignedStatus(doc, employee),
      expiryDateNum: doc.expiryDate || "",
    };
  });
}

/* -------------------------------------------------------------------------------------------------
 * Column definitions
 *
 * Notes:
 * - Keep columns outside the component when they do not depend on state/props
 * - Computed / styled cells should stay here to keep rendering logic centralized
 * ------------------------------------------------------------------------------------------------- */
const assignedDocumentColumns: ColumnDef<AssignedDocRow>[] = [
  {
    accessorKey: "documentType",
    header: "Type",
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
  },
  {
    accessorKey: "department",
    header: "Department",
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
  },
  {
    accessorKey: "assignedStatus",
    header: "Status",
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
  },

  { accessorKey: "documentCode", header: "Doc Code" },
  { accessorKey: "controlNo", header: "Control No" },
  { accessorKey: "employeeName", header: "Assigned To" },

  {
    accessorKey: "remainingQtyNum",
    header: "Remaining",
    enableColumnFilter: false,
    cell: ({ getValue }) => {
      const value = getValue<number>();

      const color = value <= 0 ? "red" : value <= 5 ? "orange" : "green";

      const variant = value <= 0 ? "outline" : "surface";
      const bgColor = variant === "outline" ? "transparent" : `${color}.100`;

      return (
        <Badge color={color} variant={variant} bgColor={bgColor} size="sm">
          {value}
        </Badge>
      );
    },
  },

  {
    accessorKey: "expiryDate",
    header: "Expiry",
    enableColumnFilter: false,
  },
];

/* -------------------------------------------------------------------------------------------------
 * Reusable detail sidebar content
 *
 * Why:
 * - Keeps the page component shorter
 * - Easier to maintain if sidebar content grows
 * ------------------------------------------------------------------------------------------------- */
function AssignedDocumentDetail({ row }: { row: AssignedDocRow }) {
  const detailItems = [
    ["Type", row.documentType],
    ["Doc Code", row.documentCode],
    ["Control No", row.controlNo],
    [
      "Range",
      `${row.documentStart}-${row.documentEnd}${
        row.documentExt ? ` (${row.documentExt})` : ""
      }`,
    ],
    ["Qty In Unit", row.qtyInUnit],
    ["Remaining", String(row.remainingQtyNum)],
    ["Expiry", row.expiryDate],
    ["Status", row.assignedStatus],
  ] as const;

  return (
    <Box color="black">
      <HStack gap={3} align="center">
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          bg="bg.subtle"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
          fontSize="lg"
        >
          {(row.employeeName || "?").charAt(0)}
        </Box>

        <Box>
          <Text fontWeight="semibold">{row.employeeName}</Text>
          <Text fontSize="sm" color="fg.muted">
            {row.salesForceId || "(no salesForceId)"}
          </Text>
        </Box>
      </HStack>

      <Box
        mt={6}
        display="grid"
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gap={4}
      >
        {detailItems.map(([label, value]) => (
          <Box key={label}>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {label}
            </Text>
            <Text fontSize="sm" mt="0.5">
              {value}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Page Component
 * ------------------------------------------------------------------------------------------------- */
export default function AssignedDocumentsPage() {
  const [data, setData] = React.useState<AssignedDocRow[]>(() =>
    buildAssignedDocumentRows(EMPLOYEES, documents),
  );

  /* -----------------------------------------------------------------------------------------------
   * Row actions
   *
   * Notes:
   * - useMemo prevents unnecessary recreation on every render
   * - Include setData in dependencies because actions use state updates
   * ----------------------------------------------------------------------------------------------- */
  const rowActions = React.useMemo<RowAction<AssignedDocRow>[]>(
    () => [
      {
        id: "view",
        label: "View Details",
        icon: Eye,
        onClick: (row) => toast.info(`Viewing ${row.documentCode}`),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: (row) => toast.info(`Editing ${row.documentCode}`),
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: Copy,
        onClick: (row) => {
          const duplicatedRow: AssignedDocRow = {
            ...row,
            documentCode: `${row.documentCode}-COPY-${Date.now()}`,
          };

          setData((prev) => [duplicatedRow, ...prev]);
          toast.success(`Duplicated ${row.documentCode}`);
        },
      },
      {
        id: "archive",
        label: "Archive",
        icon: Archive,
        separator: true,
        onClick: (row) => toast.success(`Archived ${row.documentCode}`),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        separator: true,
        onClick: (row) => {
          setData((prev) =>
            prev.filter((item) => item.documentCode !== row.documentCode),
          );
          toast.success(`Deleted ${row.documentCode}`);
        },
      },
    ],
    [],
  );

  /* -----------------------------------------------------------------------------------------------
   * Bulk actions
   * ----------------------------------------------------------------------------------------------- */
  const bulkActions = React.useMemo<BulkAction<AssignedDocRow>[]>(
    () => [
      {
        id: "bulk-delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: (rows) => {
          const selectedCodes = new Set(rows.map((row) => row.documentCode));

          setData((prev) =>
            prev.filter((item) => !selectedCodes.has(item.documentCode)),
          );

          toast.success(`Deleted ${rows.length} row(s)`);
        },
      },
    ],
    [],
  );

  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      <Box maxW="full">
        <DataTable<AssignedDocRow>
          columns={assignedDocumentColumns} // Columns
          data={data} // Data for Rows
          getRowId={(row) => row.documentCode} // Row ID accessor (eg. using documentCode as unique identifier)
          // onRowClick={(row) => console.log("Clicked row:", row.documentCode)} // Row click handler (optional)
          title="Assigned Documents"
          description="Manage assigned document ranges."
          size="sm" // table size default: md
          rowActions={rowActions} // Actions for each row (edit, delete, etc.)
          bulkActions={bulkActions} // Actions for selected rows (delete multiple, etc.)
          onReorder={setData} // Handle row reordering (if draggable is true)
          features={{
            search: true, // Enable global search
            filtering: true, // Enable column filters
            sorting: true, // Enable sorting
            pagination: true, // Enable pagination
            columnToggle: true, // Allow showing/hiding columns
            selection: true, // Enable row selection
            draggable: false, // Disable drag-and-drop for now (can be enabled if needed)
            detailSidebar: true, // Enable detail sidebar on row click
          }}
          /* IMPORTANT:
           * Prefer documentCode as row id instead of forcing a separate `id` field.
           * This only works if your DataTable supports getRowId or rowIdKey.
           */
          // getRowId={(row) => row.documentCode}
          // rowIdKey="documentCode"

          // This is optional, but demonstrates how to add a header button that can trigger actions like opening a modal or redirecting.
          headerButton={{
            label: "Add New",
            icon: Plus,
            onClick: () => {
              toast.info("Handle add new action here");
            },
          }}
          renderDetail={(row) => <AssignedDocumentDetail row={row} />}
        />
      </Box>
    </Box>
  );
}
