import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { multiSelectFilter } from "@/components/common/reusable-tableV2/types";
import { Box, Strong } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { Small } from "st-peter-ui";

export interface PhPaymentRecordProps {
  payclass: string;
  siNumber: string;
  siDate: Date;
  siAmount: number;
  planCode: string;
  installmentNo: number;
  nextDueDate: Date;
  cvNumber: string;
  pcvNumber: string;
  auditDate: Date;
}

export function PhPaymentRecordTable() {
  const columns: ColumnDef<PhPaymentRecordProps>[] = [
    {
      accessorKey: "payClass",
      header: "Pay Class",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "siNumber",
      header: "SI Number",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "siDate",
      header: "SI Date",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => (
        <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
      ),
    },
    {
      accessorKey: "siAmount",
      header: "SI Amount",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "planCode",
      header: "Plan Code",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "installmentNo",
      header: "Installment No.",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "nextDueDate",
      header: "Next Due Date",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => (
        <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
      ),
    },
    {
      accessorKey: "cvNumber",
      header: "CV Number",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "pcvNumber",
      header: "PCV Number",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "auditDate",
      header: "Audit Date",
      enableColumnFilter: true,
      filterFn: multiSelectFilter,
      meta: { filterVariant: "multiSelect" },
      cell: (info) => (
        <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
      ),
    },
  ];

  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      <Box maxW="full">
        {/* Table content and features */}
        <DataTable<PhPaymentRecordProps>
          columns={columns} // Columns
          data={[]} // Data for Rows
          getRowId={(row) => row.payclass} // Row ID accessor (eg. using documentCode as unique identifier)
          onRowClick={(row) => {}} // Row click handler (optional)
          headerContent={<Strong>Payment Records</Strong>}
          size="sm" // table size default: md
          defaultPageSize={100}
          features={{
            search: false, // Enable global search
            filtering: false, // Enable column filters
            sorting: false, // Enable sorting
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
