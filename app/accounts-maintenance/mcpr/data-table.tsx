"use client";

import { Text } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { TanstackDataTable } from "@/components/reusable-table/TanstackDataTable";

type MCPR = {
  LPANo: string;
  PlanholderName: string;
  PlanCode: string;
  InstAmt : number;
  DueDate:  Date;
  InstallmentNo: number;
  Aging: number;
  CommQ30: number;
  QNCom:number;
  SIAmount: number;
  MobileNo: string;
};

const mcprData: MCPR[] = [
  {
    LPANo: "LPA001",
    PlanholderName: "Juan Dela Cruz",
    PlanCode: "PLN-A1",
    InstAmt: 1500.25,
    DueDate: new Date("2026-01-15"),
    InstallmentNo: 1,
    Aging: 5,
    CommQ30: 100.1234,
    QNCom: 50.5678,
    SIAmount: 20000.5,
    MobileNo: "09171234567",
  },
  {
    LPANo: "LPA002",
    PlanholderName: "Maria Santos",
    PlanCode: "PLN-A2",
    InstAmt: 1750.5,
    DueDate: new Date("2026-01-20"),
    InstallmentNo: 2,
    Aging: 3,
    CommQ30: 110.2234,
    QNCom: 45.9876,
    SIAmount: 25000.75,
    MobileNo: "09181234567",
  },
  {
    LPANo: "LPA003",
    PlanholderName: "Pedro Reyes",
    PlanCode: "PLN-B1",
    InstAmt: 2000.75,
    DueDate: new Date("2026-02-01"),
    InstallmentNo: 3,
    Aging: 10,
    CommQ30: 120.4567,
    QNCom: 60.1234,
    SIAmount: 30000.25,
    MobileNo: "09191234567",
  },
  {
    LPANo: "LPA004",
    PlanholderName: "Ana Garcia",
    PlanCode: "PLN-B2",
    InstAmt: 1800.0,
    DueDate: new Date("2026-02-05"),
    InstallmentNo: 4,
    Aging: 0,
    CommQ30: 95.1111,
    QNCom: 40.2222,
    SIAmount: 22000.0,
    MobileNo: "09201234567",
  },
  {
    LPANo: "LPA005",
    PlanholderName: "Luis Mendoza",
    PlanCode: "PLN-C1",
    InstAmt: 2100.33,
    DueDate: new Date("2026-02-10"),
    InstallmentNo: 5,
    Aging: 7,
    CommQ30: 130.3333,
    QNCom: 70.4444,
    SIAmount: 35000.8,
    MobileNo: "09211234567",
  },
  {
    LPANo: "LPA006",
    PlanholderName: "Carla Bautista",
    PlanCode: "PLN-C2",
    InstAmt: 1900.99,
    DueDate: new Date("2026-02-15"),
    InstallmentNo: 6,
    Aging: 12,
    CommQ30: 105.5555,
    QNCom: 55.6666,
    SIAmount: 27000.9,
    MobileNo: "09221234567",
  },
  {
    LPANo: "LPA007",
    PlanholderName: "Miguel Ramos",
    PlanCode: "PLN-D1",
    InstAmt: 2200.45,
    DueDate: new Date("2026-02-20"),
    InstallmentNo: 7,
    Aging: 2,
    CommQ30: 140.7777,
    QNCom: 75.8888,
    SIAmount: 40000.6,
    MobileNo: "09231234567",
  },
  {
    LPANo: "LPA008",
    PlanholderName: "Sofia Lopez",
    PlanCode: "PLN-D2",
    InstAmt: 1600.88,
    DueDate: new Date("2026-02-25"),
    InstallmentNo: 8,
    Aging: 4,
    CommQ30: 90.9999,
    QNCom: 35.1111,
    SIAmount: 21000.4,
    MobileNo: "09241234567",
  },
  {
    LPANo: "LPA009",
    PlanholderName: "Jose Villanueva",
    PlanCode: "PLN-E1",
    InstAmt: 2300.15,
    DueDate: new Date("2026-03-01"),
    InstallmentNo: 9,
    Aging: 9,
    CommQ30: 150.2222,
    QNCom: 80.3333,
    SIAmount: 45000.75,
    MobileNo: "09251234567",
  },
  {
    LPANo: "LPA010",
    PlanholderName: "Angela Cruz",
    PlanCode: "PLN-E2",
    InstAmt: 1700.6,
    DueDate: new Date("2026-03-05"),
    InstallmentNo: 10,
    Aging: 1,
    CommQ30: 100.4444,
    QNCom: 42.5555,
    SIAmount: 24000.0,
    MobileNo: "09261234567",
  },
  {
    LPANo: "LPA011",
    PlanholderName: "Ramon Torres",
    PlanCode: "PLN-F1",
    InstAmt: 2400.9,
    DueDate: new Date("2026-03-10"),
    InstallmentNo: 11,
    Aging: 6,
    CommQ30: 155.6666,
    QNCom: 82.7777,
    SIAmount: 48000.3,
    MobileNo: "09271234567",
  },
  {
    LPANo: "LPA012",
    PlanholderName: "Isabel Flores",
    PlanCode: "PLN-F2",
    InstAmt: 1550.4,
    DueDate: new Date("2026-03-15"),
    InstallmentNo: 12,
    Aging: 8,
    CommQ30: 88.8888,
    QNCom: 30.9999,
    SIAmount: 20500.5,
    MobileNo: "09281234567",
  },
  {
    LPANo: "LPA013",
    PlanholderName: "Daniel Aquino",
    PlanCode: "PLN-G1",
    InstAmt: 2600.2,
    DueDate: new Date("2026-03-20"),
    InstallmentNo: 13,
    Aging: 11,
    CommQ30: 165.1234,
    QNCom: 90.2345,
    SIAmount: 52000.7,
    MobileNo: "09291234567",
  },
  {
    LPANo: "LPA014",
    PlanholderName: "Patricia Lim",
    PlanCode: "PLN-G2",
    InstAmt: 1800.75,
    DueDate: new Date("2026-03-25"),
    InstallmentNo: 14,
    Aging: 0,
    CommQ30: 98.3456,
    QNCom: 44.4567,
    SIAmount: 23000.2,
    MobileNo: "09301234567",
  },
  {
    LPANo: "LPA015",
    PlanholderName: "Kevin Tan",
    PlanCode: "PLN-H1",
    InstAmt: 2750.85,
    DueDate: new Date("2026-04-01"),
    InstallmentNo: 15,
    Aging: 13,
    CommQ30: 175.5678,
    QNCom: 95.6789,
    SIAmount: 60000.9,
    MobileNo: "09311234567",
  },
  {
    LPANo: "LPA016",
    PlanholderName: "Grace Navarro",
    PlanCode: "PLN-H2",
    InstAmt: 1650.95,
    DueDate: new Date("2026-04-05"),
    InstallmentNo: 16,
    Aging: 2,
    CommQ30: 92.789,
    QNCom: 37.8901,
    SIAmount: 21500.8,
    MobileNo: "09321234567",
  },
  {
    LPANo: "LPA017",
    PlanholderName: "Mark Herrera",
    PlanCode: "PLN-I1",
    InstAmt: 2900.1,
    DueDate: new Date("2026-04-10"),
    InstallmentNo: 17,
    Aging: 14,
    CommQ30: 185.9012,
    QNCom: 100.0123,
    SIAmount: 65000.4,
    MobileNo: "09331234567",
  },
  {
    LPANo: "LPA018",
    PlanholderName: "Theresa Ong",
    PlanCode: "PLN-I2",
    InstAmt: 1500.55,
    DueDate: new Date("2026-04-15"),
    InstallmentNo: 18,
    Aging: 3,
    CommQ30: 85.1234,
    QNCom: 28.2345,
    SIAmount: 19500.6,
    MobileNo: "09341234567",
  },
  {
    LPANo: "LPA019",
    PlanholderName: "Paul Castillo",
    PlanCode: "PLN-J1",
    InstAmt: 3100.45,
    DueDate: new Date("2026-04-20"),
    InstallmentNo: 19,
    Aging: 15,
    CommQ30: 195.3456,
    QNCom: 110.4567,
    SIAmount: 70000.2,
    MobileNo: "09351234567",
  },
  {
    LPANo: "LPA020",
    PlanholderName: "Catherine Sy",
    PlanCode: "PLN-J2",
    InstAmt: 1750.25,
    DueDate: new Date("2026-04-25"),
    InstallmentNo: 20,
    Aging: 1,
    CommQ30: 102.5678,
    QNCom: 48.6789,
    SIAmount: 26000.5,
    MobileNo: "09361234567",
  },
];

const columns: ColumnDef<MCPR>[] = [
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
    accessorKey: "InstAmt",
    header: "Installment Amount",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(2)}</Text>, // 2 decimals
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
    accessorKey: "InstallmentNo",
    header: "Installment No",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>()}</Text>,
  },
  {
    accessorKey: "Aging",
    header: "Aging",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>()}</Text>,
  },
  {
    accessorKey: "CommQ30",
    header: "Comm Q30",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(4)}</Text>, // 4 decimals
  },
  {
    accessorKey: "QNCom",
    header: "QN Com",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(4)}</Text>, // 4 decimals
  },
  {
    accessorKey: "SIAmount",
    header: "SI Amount",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(2)}</Text>,
  },
  {
    accessorKey: "MobileNo",
    header: "Mobile Number",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
];  

// export default function MCPRDataTable() {
//   return (
//     <TanstackDataTable
//         // enableRowSelection={true} // CheckBox
//         data={mcprData} // Data and Rows
//         columns={columns} // Column and Headers and Cell Style
//         enableSearch // Filtering if True
//         initialPageSize={10} // Pagination
//         // getRowId={(row) => row.LPANo} // Primary Key at table
//         onRowClick={(row) => console.log("clicked", row)} // Function if Row clicked
//         searchPlaceholder="Search by " // placeholder on search input
//         />
//   )
// }
