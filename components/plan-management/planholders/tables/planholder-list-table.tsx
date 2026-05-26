import { Pencil, Trash2, Eye } from "lucide-react";
import { Box, Strong } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { toast } from "sonner";
import { Small } from "st-peter-ui";
import { useRouter } from "next/navigation";
import {
  BulkAction,
  multiSelectFilter,
  RowAction,
} from "@/components/common/reusable-tableV2/types";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

export interface PlanholderLookup {
  id: number;
  personId: string;
  lpaNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dueDate: Date;
  installmentNo: number;
  totalInstallment: number;
  balance: number;
  planDescription: string;
  mode: string;
  effectivityDate: Date;
  branch: string;
  accountStatus: string;
  terminationStatus: string;
}

const columns: ColumnDef<PlanholderLookup>[] = [
  {
    accessorKey: "lpaNumber",
    header: "LPA Number",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "middleName",
    header: "Middle Name",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => (
      <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
    ),
  },
  {
    accessorKey: "planDescription",
    header: "Plan Description",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "mode",
    header: "Mode",
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: { filterVariant: "multiSelect" },
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "branch",
    header: "InstallmentNo",
    enableColumnFilter: true,
    cell: (info) => <Small>34</Small>,
  },
  {
    accessorKey: "effectivityDate",
    header: "Effectivity Date",
    enableColumnFilter: true,
    cell: (info) => (
      <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
    ),
  },
  {
    accessorKey: "accountStatus",
    header: "Account Status",
    enableColumnFilter: true,
    cell: (info) => (
      <Small color={String(info.getValue()) == "LAPSED" ? "red" : "gray.700"}>
        {String(info.getValue())}
      </Small>
    ),
  },
  {
    accessorKey: "terminationStatus",
    header: "Termination Status",
    enableColumnFilter: true,
    cell: (info) => (
      <Small
        color={
          String(info.getValue()) == "NOT YET TERMINATED" ? "gray.700" : "red"
        }
      >
        {String(info.getValue())}
      </Small>
    ),
  },
];
export function PlanholderListTable({
  planholders,
}: {
  planholders: PlanholderLookup[];
}) {
  const router = useRouter();

  const rowActions = React.useMemo<RowAction<PlanholderLookup>[]>(
    () => [
      {
        id: "view",
        label: "View Details",
        icon: Eye,
        onClick: (row) => {
          router.push("/plan-management/planholder/" + row.lpaNumber);
          toast.info(`Viewing ${row.lpaNumber}`);
        },
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: (row) => toast.info(`Editing ${row.lpaNumber}`),
      },

      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        separator: true,
        onClick: (row) => {
          toast.success(`Deleted ${row.lpaNumber}`);
        },
      },
    ],
    [],
  );

  const bulkActions = React.useMemo<BulkAction<PlanholderLookup>[]>(
    () => [
      {
        id: "bulk-delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: (rows) => {
          const ids = new Set(rows.map((r) => r.lpaNumber));
          toast.success(`Deleted ${rows.length} rows`);
        },
      },
    ],
    [],
  );

  {
    /* ------------------------------------- Return Table ------------------------------------- */
  }

  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      <Box maxW="full">
        {/* Table content and features */}
        <DataTable<PlanholderLookup>
          columns={columns} // Columns
          data={planholders} // Data for Rows
          getRowId={(row) => row.lpaNumber} // Row ID accessor (eg. using documentCode as unique identifier)
          onRowClick={(row) =>
            router.push("/plan-management/planholder/" + row.lpaNumber)
          } // Row click handler (optional)
          headerContent={<Strong>Planholder List</Strong>}
          size="sm" // table size default: md
          rowActions={rowActions} // Actions for each row (edit, delete, etc.)
          bulkActions={bulkActions} // Actions for selected rows (delete multiple, etc.)
          features={{
            search: true, // Enable global search
            filtering: true, // Enable column filters
            sorting: true, // Enable sorting
            pagination: true, // Enable pagination
            columnToggle: true, // Allow showing/hiding columns
            selection: false, // Enable row selection
            draggable: false, // Disable drag-and-drop for now (can be enabled if needed)
            detailSidebar: false, // Enable detail sidebar on row click
          }}
          /* IMPORTANT:
           * Prefer documentCode as row id instead of forcing a separate `id` field.
           * This only works if your DataTable supports getRowId or rowIdKey.
           */
          // getRowId={(row) => row.documentCode}
          // rowIdKey="documentCode"
        />
      </Box>
    </Box>
  );
}
