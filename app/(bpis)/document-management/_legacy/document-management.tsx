"use client";

import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { Employee } from "@/data/doc-management/employeeSelector";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { User } from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { AnimatePresence, motion } from "framer-motion";
import DocumentTable from "./_components/DocumentTable";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import Page from "@/claude components/layout/page/Page";
import LabelText from "@/components/texts/LabelText";
import { MetaCard } from "../../payment/viewvalidated-deposit/viewDeposit";

const employeeColumns: LookupColumn<Employee>[] = [
  { key: "id", header: "Employee ID" },
  { key: "name", header: "Name" },
  { key: "branch", header: "Branch" },
];

const employeeTableColumns: ColumnDef<Employee>[] = [
  {
    id: "employee",
    header: "Employee",
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const emp = row.original;
      return (
        <Flex align="center" gap={3}>
          <Box
            p={2}
            borderRadius="full"
            bg="gray.100"
            color="gray.600"
            flexShrink={0}
            _dark={{ bg: "gray.800", color: "gray.300" }}
          >
            <User size={16} />
          </Box>
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
            <DataTable<Employee>
              columns={employeeTableColumns}
              data={EMPLOYEES}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedEmployee(row)}
              size="md"
              emptyState="No employees found."
              features={{
                search: false,
                filtering: false,
                sorting: true,
                pagination: true,
                columnToggle: true,
                selection: false,
                draggable: false,
                detailSidebar: false,
              }}
              mobileConfig={{
                viewMode: "card",
                primaryField: "name",
                titleTransform: "none",
                secondaryField: "id",
                labelMap: { id: "Employee ID" },
                visibleFields: ["branch"],
              }}
            />
          </Box>
        )}
      </Page.MainContent>
    </Page.Root>
  );
};

export default DocumentManagement;
