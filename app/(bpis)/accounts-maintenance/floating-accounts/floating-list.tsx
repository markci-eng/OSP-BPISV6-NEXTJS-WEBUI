import { Box, Skeleton, Text } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useFloatingAccounts } from "./hooks/useFloatingAccounts";
import type { FloatingAccounts } from "./floating-accounts.data";
import { DataTable, ErrorStateCard } from "osp-ui-kit";

export type { FloatingAccounts } from "./floating-accounts.data";
export { floatingAccountsData } from "./floating-accounts.data";

const columns: ColumnDef<FloatingAccounts>[] = [
  {
    accessorKey: "LPANo",
    header: "LPA Number",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "PlanholderName",
    header: "Planholder Name",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "PlanCode",
    header: "Plan Code",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "DueDate",
    header: "Due Date",
    enableColumnFilter: true,
    cell: (info) => (
      <Text>{new Date(info.getValue<Date>()).toLocaleDateString()}</Text>
    ),
  },
  {
    accessorKey: "MonthlyInstallment",
    header: "Monthly Installment",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(2)}</Text>, // 2 decimals
  },
  {
    accessorKey: "InstallmentNumber",
    header: "Installment Number",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>()}</Text>,
  },
  {
    accessorKey: "SalesAgent",
    header: "Sales Agent",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "Address",
    header: "Address",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
];

export default function FloatingAccountList() {
  const { data, isLoading, error, refetch } = useFloatingAccounts();

  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      {isLoading ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} h="40px" borderRadius="md" />
          ))}
        </Box>
      ) : error ? (
        <ErrorStateCard onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          title="Floating Account List"
          description=""
          size="sm"
          features={{
            search: true,
            filtering: true,
            sorting: true,
            pagination: true,
            columnToggle: true,
            selection: true,
            detailSidebar: true,
          }}
        />
      )}
    </Box>
  );
}
