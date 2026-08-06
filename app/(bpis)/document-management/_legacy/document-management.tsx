"use client";

import {
  documents,
  EMPLOYEES,
} from "@/app/(bpis)/data/doc-management/documenttype";
import { Employee } from "@/app/(bpis)/data/doc-management/employeeSelector";
import { Badge, Box, Flex, Grid, Text } from "@chakra-ui/react";
import { AlertTriangle, Ban, User } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import DocumentTable from "./_components/DocumentTable";
import {
  BrandedAvatar,
  DataTable,
  LookupColumn,
  LookupField,
  Page,
} from "osp-ui-kit";
import { MetaCard } from "../../payment/viewvalidated-deposit/viewDeposit";
import { expState, fmt } from "./data";
import { mockAvatarUrl } from "@/lib/mock-avatar";

const employeeColumns: LookupColumn<Employee>[] = [
  { key: "id", header: "Employee ID" },
  { key: "name", header: "Name" },
  { key: "branch", header: "Branch" },
];

type EmployeeWithStats = Employee & {
  assignedDocs: number;
  remainingQty: number;
  nearExpiry: number;
  blocked: number;
};

function buildEmployeeDocStats() {
  const map = new Map<
    string,
    Pick<
      EmployeeWithStats,
      "assignedDocs" | "remainingQty" | "nearExpiry" | "blocked"
    >
  >();

  for (const doc of documents) {
    if (!doc.salesForceId) continue;

    const stats = map.get(doc.salesForceId) ?? {
      assignedDocs: 0,
      remainingQty: 0,
      nearExpiry: 0,
      blocked: 0,
    };

    stats.assignedDocs += 1;
    stats.remainingQty += Number(doc.remainingQty || 0);
    if (expState(doc.expiryDate) === "near") stats.nearExpiry += 1;

    map.set(doc.salesForceId, stats);
  }

  return map;
}

const employeeDocStats = buildEmployeeDocStats();

const EMPLOYEES_WITH_STATS: EmployeeWithStats[] = EMPLOYEES.map((emp) => ({
  ...emp,
  ...(employeeDocStats.get(emp.id) ?? {
    assignedDocs: 0,
    remainingQty: 0,
    nearExpiry: 0,
    blocked: 0,
  }),
}));

const employeeTableColumns: ColumnDef<EmployeeWithStats>[] = [
  {
    id: "employee",
    header: "Employee",
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const emp = row.original;
      return (
        <Flex align="center" gap={3}>
          <BrandedAvatar
            name={emp.name}
            imageUrl={mockAvatarUrl(emp.id)}
            ringed
          />
          <Box>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3">
              {emp.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {emp.id}
            </Text>
          </Box>
        </Flex>
      );
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700" _dark={{ color: "gray.300" }}>
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "assignedDocs",
    header: "Assigned Docs",
    meta: { numeric: true },
    cell: (info) => (
      <Text
        fontSize="sm"
        fontWeight="700"
        fontFamily="mono"
        color="fg"
        textAlign="right"
      >
        {fmt(info.getValue<number>())}
      </Text>
    ),
  },
  {
    accessorKey: "remainingQty",
    header: "Remaining Qty",
    meta: { numeric: true },
    cell: (info) => (
      <Text
        fontSize="sm"
        fontWeight="700"
        fontFamily="mono"
        color="fg"
        textAlign="right"
      >
        {fmt(info.getValue<number>())}
      </Text>
    ),
  },
  {
    accessorKey: "nearExpiry",
    header: "Near Expiry",
    meta: { numeric: true },
    cell: (info) => {
      const value = info.getValue<number>();
      if (value === 0) {
        return (
          <Text fontSize="sm" color="gray.300" textAlign="right">
            —
          </Text>
        );
      }
      return (
        <Flex justify="flex-end">
          <Badge
            variant="subtle"
            colorPalette="orange"
            borderRadius="full"
            px={2.5}
            gap={1}
          >
            <AlertTriangle size={11} />
            {fmt(value)}
          </Badge>
        </Flex>
      );
    },
  },
  {
    accessorKey: "blocked",
    header: "Blocked",
    meta: { numeric: true },
    cell: (info) => {
      const value = info.getValue<number>();
      if (value === 0) {
        return (
          <Text fontSize="sm" color="gray.300" textAlign="right">
            —
          </Text>
        );
      }
      return (
        <Flex justify="flex-end">
          <Badge
            variant="subtle"
            colorPalette="red"
            borderRadius="full"
            px={2.5}
            gap={1}
          >
            <Ban size={11} />
            {fmt(value)}
          </Badge>
        </Flex>
      );
    },
  },
];

const springTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

const MotionBox = motion.create(Box);

const DocumentManagement = () => {
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);

  return (
    <Page.Root
      title="Document Management"
      description="Manage employee policy documents."
      headerButton="menu"
    >
      <Page.MainContent>
        <Box
          w={{ base: "full", md: "320px", lg: "360px" }}
          ml={{ base: 0, md: "auto" }}
          flexShrink={0}
          display={selectedEmployee ? "block" : "none"}
        >
          <LookupField<Employee>
            label=""
            placeholder="Search by Name or Employee ID..."
            modalTitle="Search Employee"
            columns={employeeColumns}
            dataSource={EMPLOYEES}
            searchKeys={["id", "name", "branch"]}
            onSelect={setSelectedEmployee}
            renderDisplay={(emp) => `${emp.name} (${emp.id})`}
            value={selectedEmployee}
          />
        </Box>

        <AnimatePresence>
          {selectedEmployee && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTransition}
              overflow="hidden"
              my="3"
            >
              <DocumentTable
                employee={selectedEmployee}
                topContent={
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gapX={5}
                    gapY={2}
                  >
                    {[
                      { label: "Employee ID", value: selectedEmployee.id },
                      { label: "Name", value: selectedEmployee.name },
                      { label: "Branch", value: selectedEmployee.branch },
                    ].map((detail) => (
                      <MetaCard
                        key={detail.label}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                  </Grid>
                }
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {!selectedEmployee && (
          <Box w="full">
            <DataTable<EmployeeWithStats>
              title="Select an Employee"
              columns={employeeTableColumns}
              data={EMPLOYEES_WITH_STATS}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedEmployee(row)}
              size="md"
              emptyState="No employees found."
              features={{
                search: true,
                filtering: true,
                sorting: true,
                pagination: true,
                columnToggle: true,
                selection: false,
                detailSidebar: false,
              }}
              mobileConfig={{
                viewMode: "card",
                primaryField: "name",
                titleTransform: "none",
                secondaryField: "id",
                labelMap: {
                  id: "Employee ID",
                  assignedDocs: "Assigned Docs",
                  remainingQty: "Remaining Qty",
                  nearExpiry: "Near Expiry",
                  blocked: "Blocked",
                },
                visibleFields: ["branch", "assignedDocs"],
                valueFormatter: {
                  remainingQty: (value) => fmt(Number(value) || 0),
                },
              }}
            />
          </Box>
        )}
      </Page.MainContent>
    </Page.Root>
  );
};

export default DocumentManagement;
