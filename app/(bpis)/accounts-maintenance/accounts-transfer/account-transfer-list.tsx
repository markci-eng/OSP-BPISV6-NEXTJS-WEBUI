import { ColumnDef } from "@tanstack/react-table";
import { Box, Skeleton, Text } from "@chakra-ui/react";
import { useAccountList } from "./hooks/useAccountList";
import type { AccountList } from "./account-transfer.data";
import { DataTable, ErrorStateCard } from "osp-ui-kit";

export type { AccountList } from "./account-transfer.data";
export { accountListData } from "./account-transfer.data";

const columns: ColumnDef<AccountList>[] = [
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
    accessorKey: "InstallmentNumber",
    header: "Installment Number",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>()}</Text>,
  },
  {
    accessorKey: "Effectivity",
    header: "Effectivity",
    enableColumnFilter: true,
    cell: (info) => (
      <Text>{new Date(info.getValue<Date>()).toLocaleDateString()}</Text>
    ),
  },
  {
    accessorKey: "AccountStatus",
    header: "Account Status",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
];

export default function TransferAccountList() {
  const { data, isLoading, error, refetch } = useAccountList();

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
          title="Account List"
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
