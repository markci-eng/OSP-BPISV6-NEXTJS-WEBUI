import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { Box, HStack, Text } from "@chakra-ui/react";
import { ColumnDef, StringOrTemplateHeader } from "@tanstack/react-table";
import React from "react";

export type FloatingAccounts = {
  LPANo: string;
  PlanholderName: string;
  PlanCode: string;
  DueDate: Date;
  MonthlyInstallment: number;
  InstallmentNumber: number;
  SalesAgent: string;
  Address: string;
};

export const floatingAccountsData: FloatingAccounts[] = [
  {
    LPANo: "LPA10001",
    PlanholderName: "Juan Dela Cruz",
    PlanCode: "PC01",
    DueDate: new Date("2026-01-15"),
    MonthlyInstallment: 1500,
    InstallmentNumber: 12,
    SalesAgent: "Maria Santos",
    Address: "Manila",
  },
  {
    LPANo: "LPA10002",
    PlanholderName: "Pedro Reyes",
    PlanCode: "PC02",
    DueDate: new Date("2026-02-10"),
    MonthlyInstallment: 1800,
    InstallmentNumber: 10,
    SalesAgent: "Ana Lopez",
    Address: "Quezon City",
  },
  {
    LPANo: "LPA10003",
    PlanholderName: "Carlos Mendoza",
    PlanCode: "PC01",
    DueDate: new Date("2026-01-25"),
    MonthlyInstallment: 1600,
    InstallmentNumber: 8,
    SalesAgent: "Maria Santos",
    Address: "Pasig",
  },
  {
    LPANo: "LPA10004",
    PlanholderName: "Jose Ramirez",
    PlanCode: "PC03",
    DueDate: new Date("2026-03-05"),
    MonthlyInstallment: 2000,
    InstallmentNumber: 6,
    SalesAgent: "Leo Garcia",
    Address: "Makati",
  },
  {
    LPANo: "LPA10005",
    PlanholderName: "Ramon Bautista",
    PlanCode: "PC02",
    DueDate: new Date("2026-02-18"),
    MonthlyInstallment: 1750,
    InstallmentNumber: 9,
    SalesAgent: "Ana Lopez",
    Address: "Taguig",
  },
  {
    LPANo: "LPA10006",
    PlanholderName: "Luis Torres",
    PlanCode: "PC04",
    DueDate: new Date("2026-04-01"),
    MonthlyInstallment: 2200,
    InstallmentNumber: 5,
    SalesAgent: "Mark Cruz",
    Address: "Caloocan",
  },
  {
    LPANo: "LPA10007",
    PlanholderName: "Daniel Flores",
    PlanCode: "PC03",
    DueDate: new Date("2026-03-11"),
    MonthlyInstallment: 2100,
    InstallmentNumber: 7,
    SalesAgent: "Leo Garcia",
    Address: "Parañaque",
  },
  {
    LPANo: "LPA10008",
    PlanholderName: "Miguel Navarro",
    PlanCode: "PC01",
    DueDate: new Date("2026-01-20"),
    MonthlyInstallment: 1500,
    InstallmentNumber: 11,
    SalesAgent: "Maria Santos",
    Address: "Las Piñas",
  },
  {
    LPANo: "LPA10009",
    PlanholderName: "Antonio Diaz",
    PlanCode: "PC05",
    DueDate: new Date("2026-05-08"),
    MonthlyInstallment: 2500,
    InstallmentNumber: 4,
    SalesAgent: "Paul Lim",
    Address: "Marikina",
  },
  {
    LPANo: "LPA10010",
    PlanholderName: "Ricardo Ramos",
    PlanCode: "PC02",
    DueDate: new Date("2026-02-28"),
    MonthlyInstallment: 1800,
    InstallmentNumber: 10,
    SalesAgent: "Ana Lopez",
    Address: "Valenzuela",
  },
  {
    LPANo: "LPA10011",
    PlanholderName: "Roberto Castillo",
    PlanCode: "PC04",
    DueDate: new Date("2026-04-15"),
    MonthlyInstallment: 2300,
    InstallmentNumber: 6,
    SalesAgent: "Mark Cruz",
    Address: "Manila",
  },
  {
    LPANo: "LPA10012",
    PlanholderName: "Eduardo Villanueva",
    PlanCode: "PC03",
    DueDate: new Date("2026-03-22"),
    MonthlyInstallment: 2050,
    InstallmentNumber: 7,
    SalesAgent: "Leo Garcia",
    Address: "Pasay",
  },
  {
    LPANo: "LPA10013",
    PlanholderName: "Fernando Soriano",
    PlanCode: "PC01",
    DueDate: new Date("2026-01-30"),
    MonthlyInstallment: 1500,
    InstallmentNumber: 12,
    SalesAgent: "Maria Santos",
    Address: "Muntinlupa",
  },
  {
    LPANo: "LPA10014",
    PlanholderName: "Oscar Gutierrez",
    PlanCode: "PC05",
    DueDate: new Date("2026-05-14"),
    MonthlyInstallment: 2550,
    InstallmentNumber: 4,
    SalesAgent: "Paul Lim",
    Address: "Quezon City",
  },
  {
    LPANo: "LPA10015",
    PlanholderName: "Victor Aquino",
    PlanCode: "PC02",
    DueDate: new Date("2026-02-12"),
    MonthlyInstallment: 1850,
    InstallmentNumber: 9,
    SalesAgent: "Ana Lopez",
    Address: "Taguig",
  },
  {
    LPANo: "LPA10016",
    PlanholderName: "Hector Salazar",
    PlanCode: "PC03",
    DueDate: new Date("2026-03-18"),
    MonthlyInstallment: 2100,
    InstallmentNumber: 8,
    SalesAgent: "Leo Garcia",
    Address: "Pasig",
  },
  {
    LPANo: "LPA10017",
    PlanholderName: "Francisco Dominguez",
    PlanCode: "PC04",
    DueDate: new Date("2026-04-25"),
    MonthlyInstallment: 2250,
    InstallmentNumber: 6,
    SalesAgent: "Mark Cruz",
    Address: "Caloocan",
  },
  {
    LPANo: "LPA10018",
    PlanholderName: "Julio Herrera",
    PlanCode: "PC01",
    DueDate: new Date("2026-01-17"),
    MonthlyInstallment: 1500,
    InstallmentNumber: 12,
    SalesAgent: "Maria Santos",
    Address: "Manila",
  },
  {
    LPANo: "LPA10019",
    PlanholderName: "Alfredo Pineda",
    PlanCode: "PC05",
    DueDate: new Date("2026-05-20"),
    MonthlyInstallment: 2600,
    InstallmentNumber: 3,
    SalesAgent: "Paul Lim",
    Address: "San Juan",
  },
  {
    LPANo: "LPA10020",
    PlanholderName: "Rogelio Castro",
    PlanCode: "PC02",
    DueDate: new Date("2026-02-05"),
    MonthlyInstallment: 1800,
    InstallmentNumber: 10,
    SalesAgent: "Ana Lopez",
    Address: "Quezon City",
  },
];

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
  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      <DataTable
        columns={columns}
        data={floatingAccountsData}
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
          draggable: false,
          detailSidebar: true,
        }}
      />
    </Box>
  );
}
