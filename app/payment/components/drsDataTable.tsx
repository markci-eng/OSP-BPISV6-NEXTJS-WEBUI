import { Box, Flex, Heading, Text, Badge } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

import { DrsRowData, PaymentRecord } from "../data/payment.types";
import { DrsFunction } from "../utils/drsFunction";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

type DrsDataTableProps = {
  payments: PaymentRecord[];
  onRowClick?: (row: DrsRowData) => void;
  showFooter?: boolean;
  isLoading?: boolean;
  emptyText?: string;
  headerContent?: ReactNode;
};

export const columns: ColumnDef<DrsRowData>[] = [
  { accessorKey: "LPANo", header: "LPA" },
  { accessorKey: "name", header: "PLANHOLDER" },
  { accessorKey: "InstNo", header: "INST NO." },
  { accessorKey: "SIDate", header: "SI DATE" },
  { accessorKey: "SI", header: "SI NO." },
  { accessorKey: "PayClass", header: "PC" },
  { accessorKey: "remarks", header: "REMARKS" },
  { accessorKey: "aging", header: "AGING" },

  {
    accessorKey: "GrossCom",
    header: "COM",
    meta: { numeric: true },
  },
  {
    accessorKey: "ncom",
    header: "NCOM",
    meta: { numeric: true },
  },
  {
    accessorKey: "others",
    header: "OTHERS",
    meta: { numeric: true },
  },
  {
    accessorKey: "ComDue",
    header: "CBI",
    meta: { numeric: true },
  },
  {
    accessorKey: "TEPCV",
    header: "TE",
    meta: { numeric: true },
  },
  {
    accessorKey: "COMPCV",
    header: "BC",
    meta: { numeric: true },
  },
  {
    accessorKey: "net",
    header: "NET",
    meta: { numeric: true },
  },
];

export default function DrsDataTable({
  payments,
  onRowClick,
  headerContent,
}: DrsDataTableProps) {
  const { rows } = DrsFunction(payments);

  return (
    <Box>
      <DataTable
        columns={columns}
        data={rows}
        onRowClick={onRowClick}
        headerContent={headerContent}
        features={{
          search: false,
          sorting: false,
          draggable: false,
          selection: false,
          filtering: false,
          columnToggle: false,
        }}
        // headerContent={
        //   // <Flex justify="space-between" wrap="wrap" gap="6">
        //   //   <Box>
        //   //     <Heading size="md">REMITTANCE (HEAD OFFICE)</Heading>

        //   //     <Text mt={1} fontWeight="bold">
        //   //       KIRK PATRICK OLIVAR
        //   //     </Text>
        //   //   </Box>
        //   // </Flex>
        // }
        // headerActions={
        //   <Box w="full">
        //     <Heading fontSize="sm">
        //       Payment Type <Badge colorPalette="green">CASH</Badge>
        //     </Heading>

        //     <Text mt={1} fontWeight="bold">
        //       {`DRS${Math.floor(100000000000 + Math.random() * 900000000000)}`}
        //     </Text>
        //   </Box>
        // }
        summaryRows={[
          {
            id: "assigned-documents-summary",
            label: "Total",
            labelColumnId: "SI",
            aggregations: {
              GrossCom: "sum",
              ncom: "sum",
              ComDue: "sum",
              others: "sum",
              TEPCV: "sum",
              COMPCV: "sum",
              net: "sum",
            },
          },
        ]}
      />
    </Box>
  );
}
