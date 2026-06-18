"use client";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard, FileText, Phone, User } from "lucide-react";
import React from "react";

export type MCPR = {
  LPANo: string;
  PlanholderName: string;
  PlanCode: string;
  InstAmt: number;
  DueDate: Date;
  InstallmentNo: number;
  Aging: number;
  CommQ30: number;
  QNCom: number;
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
    Aging: 30,
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
    Aging: 60,
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
    Aging: 90,
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
    Aging: 30,
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
    Aging: 60,
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
    Aging: 90,
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
    Aging: 0,
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
    Aging: 30,
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
    Aging: 60,
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
    Aging: 90,
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
    Aging: 0,
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
    Aging: 30,
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
    Aging: 60,
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
    Aging: 90,
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
    Aging: 0,
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
    Aging: 30,
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
    Aging: 60,
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
    Aging: 90,
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
    Aging: 0,
    CommQ30: 102.5678,
    QNCom: 48.6789,
    SIAmount: 26000.5,
    MobileNo: "09361234567",
  },
];

const columns: ColumnDef<MCPR>[] = [
  {
    accessorKey: "LPANo",
    header: "LPA No.",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "PlanholderName",
    header: "Planholder",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "PlanCode",
    header: "Plan",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "InstAmt",
    header: "Inst. Amt.",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(2)}</Text>,
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
    header: "Inst. No.",
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
    cell: (info) => <Text>{info.getValue<number>().toFixed(4)}</Text>,
  },
  {
    accessorKey: "QNCom",
    header: "QN Com",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(4)}</Text>,
  },
  {
    accessorKey: "SIAmount",
    header: "SI Amt.",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<number>().toFixed(2)}</Text>,
  },
  {
    accessorKey: "MobileNo",
    header: "Mobile No.",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
];

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="lg"
      borderWidth="1px"
      borderColor="border.muted"
      overflow="hidden"
    >
      <HStack
        gap={2}
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg.subtle"
      >
        {icon && <Box color="fg.muted">{icon}</Box>}
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
      </HStack>

      <Box bg="bg" p={{ base: 3, md: 4 }}>
        {children}
      </Box>
    </Box>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box width="full">
      <Flex align="center" py={1.5} fontSize="sm">
        <Text color="gray.500" whiteSpace="nowrap">
          {label}
        </Text>
        <Box
          flex="1"
          mx={3}
          borderBottom="1px dashed"
          borderColor="gray.300"
          transform="translateY(2px)"
        />
        <Text fontWeight="medium" textAlign="right" whiteSpace="nowrap">
          {value ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
}

const AGING_META: Record<number, { colorPalette: string; label: string }> = {
  0: { colorPalette: "green", label: "Current" },
  30: { colorPalette: "orange", label: "30 Days" },
  60: { colorPalette: "yellow", label: "60 Days" },
  90: { colorPalette: "red", label: "90 Days" },
};

function AgingBadge({ aging }: { aging: number }) {
  const meta = AGING_META[aging] ?? {
    colorPalette: "gray",
    label: `${aging} Days`,
  };
  return (
    <Badge colorPalette={meta.colorPalette} variant="subtle">
      {meta.label}
    </Badge>
  );
}

function MCPRDetailContent({ row }: { row: MCPR }) {
  return (
    <VStack align="stretch" gap={{ base: 3, md: 4 }}>
      {/* Header */}
      <Box
        rounded="lg"
        borderWidth="1px"
        borderColor="blue.200"
        bg="blue.50"
        p={4}
      >
        <HStack justify="space-between" align="start" gap={3}>
          <Box minW={0}>
            <Text
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="fg.muted"
              mb={1}
            >
              MCPR Record
            </Text>
            <Text fontSize="md" fontWeight="semibold" color="fg">
              {row.LPANo}
            </Text>
            <Text fontSize="sm" color="fg.muted" mt={0.5}>
              {row.PlanholderName}
            </Text>
          </Box>
          <AgingBadge aging={row.Aging} />
        </HStack>
      </Box>

      {/* Plan Information */}
      <SectionCard title="Plan Information" icon={<FileText size={13} />}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
          gap={{ base: 3, md: 4 }}
        >
          <DetailItem label="LPA Number" value={row.LPANo} />
          <DetailItem label="Planholder Name" value={row.PlanholderName} />
          <DetailItem label="Plan Code" value={row.PlanCode} />
          <DetailItem
            label="Due Date"
            value={new Date(row.DueDate).toLocaleDateString()}
          />
          <DetailItem label="Installment No." value={row.InstallmentNo} />
          <DetailItem label="Aging" value={<AgingBadge aging={row.Aging} />} />
        </Box>
      </SectionCard>

      {/* Financial Details */}
      <SectionCard title="Financial Details" icon={<CreditCard size={13} />}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
          gap={{ base: 3, md: 4 }}
        >
          <DetailItem
            label="Installment Amount"
            value={`₱ ${row.InstAmt.toFixed(2)}`}
          />
          <DetailItem
            label="SI Amount"
            value={`₱ ${row.SIAmount.toFixed(2)}`}
          />
          <DetailItem label="Comm Q30" value={row.CommQ30.toFixed(4)} />
          <DetailItem label="QN Com" value={row.QNCom.toFixed(4)} />
        </Box>
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact" icon={<Phone size={13} />}>
        <DetailItem label="Mobile Number" value={row.MobileNo} />
      </SectionCard>
    </VStack>
  );
}

export default function MCPRList() {
  return (
    <Box py={{ base: 2, sm: 4 }} color="black">
      <DataTable<MCPR>
        columns={columns}
        data={mcprData}
        title="Account List"
        description=""
        size="sm"
        renderDetail={(row) => <MCPRDetailContent row={row} />}
        features={{
          search: true,
          filtering: true,
          sorting: true,
          pagination: true,
          columnToggle: true,
          selection: false,
          draggable: false,
          detailSidebar: true,
        }}
      />
    </Box>
  );
}
