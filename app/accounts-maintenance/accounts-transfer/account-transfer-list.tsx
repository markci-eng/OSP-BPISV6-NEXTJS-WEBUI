import { ColumnDef } from "@tanstack/react-table";
import { Box, Text } from "@chakra-ui/react";
import React from "react";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { DISPLAY_STATUS_STYLES } from "@/lib/theme/status-display-tokens";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

export type AccountList = {
  LPANo: string;
  PlanholderName: string;
  PlanCode: string;
  InstallmentNumber: number;
  Effectivity: Date;
  AccountStatus: string;
};

export const accountListData: AccountList[] = [
  {
    LPANo: "LPA10001",
    PlanholderName: "Juan Dela Cruz",
    PlanCode: "PLN-A1",
    InstallmentNumber: 1,
    Effectivity: new Date("2024-01-15"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10002",
    PlanholderName: "Maria Santos",
    PlanCode: "PLN-A2",
    InstallmentNumber: 2,
    Effectivity: new Date("2024-02-10"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10003",
    PlanholderName: "Pedro Reyes",
    PlanCode: "PLN-B1",
    InstallmentNumber: 3,
    Effectivity: new Date("2024-03-05"),
    AccountStatus: "Pending",
  },
  {
    LPANo: "LPA10004",
    PlanholderName: "Ana Lopez",
    PlanCode: "PLN-A1",
    InstallmentNumber: 4,
    Effectivity: new Date("2024-01-20"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10005",
    PlanholderName: "Carlos Mendoza",
    PlanCode: "PLN-C1",
    InstallmentNumber: 5,
    Effectivity: new Date("2023-12-12"),
    AccountStatus: "Closed",
  },
  {
    LPANo: "LPA10006",
    PlanholderName: "Jose Garcia",
    PlanCode: "PLN-B2",
    InstallmentNumber: 6,
    Effectivity: new Date("2024-04-01"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10007",
    PlanholderName: "Rosa Bautista",
    PlanCode: "PLN-A3",
    InstallmentNumber: 7,
    Effectivity: new Date("2024-02-28"),
    AccountStatus: "Pending",
  },
  {
    LPANo: "LPA10008",
    PlanholderName: "Mark Villanueva",
    PlanCode: "PLN-C2",
    InstallmentNumber: 8,
    Effectivity: new Date("2024-03-18"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10009",
    PlanholderName: "Liza Fernandez",
    PlanCode: "PLN-B1",
    InstallmentNumber: 9,
    Effectivity: new Date("2024-01-30"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10010",
    PlanholderName: "Paolo Navarro",
    PlanCode: "PLN-A2",
    InstallmentNumber: 10,
    Effectivity: new Date("2024-02-14"),
    AccountStatus: "Closed",
  },
  {
    LPANo: "LPA10011",
    PlanholderName: "Angela Torres",
    PlanCode: "PLN-A1",
    InstallmentNumber: 11,
    Effectivity: new Date("2024-03-22"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10012",
    PlanholderName: "Ryan Castillo",
    PlanCode: "PLN-B3",
    InstallmentNumber: 12,
    Effectivity: new Date("2024-01-05"),
    AccountStatus: "Pending",
  },
  {
    LPANo: "LPA10013",
    PlanholderName: "Catherine Cruz",
    PlanCode: "PLN-C1",
    InstallmentNumber: 13,
    Effectivity: new Date("2024-02-11"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10014",
    PlanholderName: "Daniel Flores",
    PlanCode: "PLN-B2",
    InstallmentNumber: 14,
    Effectivity: new Date("2024-04-10"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10015",
    PlanholderName: "Joyce Ramos",
    PlanCode: "PLN-A3",
    InstallmentNumber: 15,
    Effectivity: new Date("2023-11-25"),
    AccountStatus: "Closed",
  },
  {
    LPANo: "LPA10016",
    PlanholderName: "Kevin Morales",
    PlanCode: "PLN-C2",
    InstallmentNumber: 16,
    Effectivity: new Date("2024-03-02"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10017",
    PlanholderName: "Michelle Herrera",
    PlanCode: "PLN-B1",
    InstallmentNumber: 17,
    Effectivity: new Date("2024-02-19"),
    AccountStatus: "Pending",
  },
  {
    LPANo: "LPA10018",
    PlanholderName: "Patrick Diaz",
    PlanCode: "PLN-A2",
    InstallmentNumber: 18,
    Effectivity: new Date("2024-03-12"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10019",
    PlanholderName: "Samantha Ong",
    PlanCode: "PLN-C3",
    InstallmentNumber: 19,
    Effectivity: new Date("2024-01-08"),
    AccountStatus: "Active",
  },
  {
    LPANo: "LPA10020",
    PlanholderName: "Brian Tan",
    PlanCode: "PLN-B2",
    InstallmentNumber: 20,
    Effectivity: new Date("2024-02-27"),
    AccountStatus: "Closed",
  },
];

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
    cell: (info) => {
      const status = info.getValue<string>();
      const style =
        status === "Active"
          ? DISPLAY_STATUS_STYLES.approved
          : status === "Pending"
            ? DISPLAY_STATUS_STYLES.pending
            : status === "Closed"
              ? DISPLAY_STATUS_STYLES.denied
              : DISPLAY_STATUS_STYLES.fallback;

      return (
        <Box
          as="span"
          display="inline-flex"
          alignItems="center"
          px={2}
          py={1}
          borderRadius={STANDARD_RADIUS.sm}
          bg={style.bg}
          color={style.color}
          border={`${style.borderWidth} solid ${style.borderColor}`}
          fontSize="xs"
          fontWeight={style.fontWeight}
          lineHeight="1"
        >
          {status}
        </Box>
      );
    },
  },
];

export default function TransferAccountList() {
  return (
    <Box py={{ base: 2, md: 3 }} color="black" minW={0}>
      <DataTable
        columns={columns}
        data={accountListData}
        title="Account List"
        description="Select the accounts to include in the transfer request."
        size="sm"
        features={{
          search: true,
          filtering: true,
          sorting: true,
          pagination: true,
          columnToggle: true,
          selection: true,
          draggable: false,
          detailSidebar: true,
        }}
      />
    </Box>
  );
}
