"use client";
import {
  Badge,
  Box,
  Flex,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { LuCreditCard, LuFileText, LuPhone } from "react-icons/lu";
import React from "react";
import { useMcprList } from "./hooks/useMcprList";
import type { MCPR } from "./mcpr.data";
import { DataTable, ErrorStateCard } from "osp-ui-kit";

export type { MCPR } from "./mcpr.data";
export { mcprData } from "./mcpr.data";

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
      <SectionCard title="Plan Information" icon={<LuFileText size={13} />}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr" }}
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
      <SectionCard title="Financial Details" icon={<LuCreditCard size={13} />}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr" }}
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
      <SectionCard title="Contact" icon={<LuPhone size={13} />}>
        <DetailItem label="Mobile Number" value={row.MobileNo} />
      </SectionCard>
    </VStack>
  );
}

export default function MCPRList() {
  const { data, isLoading, error, refetch } = useMcprList();

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
        <DataTable<MCPR>
          columns={columns}
          data={data}
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
            detailSidebar: true,
          }}
        />
      )}
    </Box>
  );
}
