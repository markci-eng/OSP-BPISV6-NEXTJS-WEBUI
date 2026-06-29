"use client";

import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { Employee } from "@/data/doc-management/employeeSelector";
import { Box, Grid, Text, VStack } from "@chakra-ui/react";
import { FolderSearch } from "lucide-react";
import React from "react";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { AnimatePresence, motion } from "framer-motion";
import DocumentTable from "./_components/DocumentTable";
import Page from "@/claude components/layout/page/Page";
import LabelText from "@/components/texts/LabelText";

const employeeColumns: LookupColumn<Employee>[] = [
  { key: "id", header: "Employee ID" },
  { key: "name", header: "Name" },
  { key: "branch", header: "Branch" },
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
        {/* <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "flex-start" }}
        justify="space-between"
        gap={{ base: 3, md: 4 }}
      ></Flex> */}
        <Box
          w={{ base: "full", md: "320px", lg: "360px" }}
          ml={{ base: 0, md: "auto" }}
          flexShrink={0}
        >
          <LookupField<Employee>
            label=""
            placeholder="Search by name or ID..."
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
                    gap={4}
                  >
                    {[
                      { label: "Employee ID", value: selectedEmployee.id },
                      { label: "Name", value: selectedEmployee.name },
                      { label: "Branch", value: selectedEmployee.branch },
                    ].map((detail) => (
                      // <Box key={detail.label} minW={0}>
                      //   <Text
                      //     fontSize="xs"
                      //     fontWeight="medium"
                      //     color="gray.500"
                      //     textTransform="uppercase"
                      //     letterSpacing="wide"
                      //   >
                      //     {detail.label}
                      //   </Text>

                      //   <Text
                      //     mt={1}
                      //     fontSize="sm"
                      //     color="gray.800"
                      //     fontWeight="medium"
                      //     wordBreak="break-word"
                      //   >
                      //     {detail.value}
                      //   </Text>
                      // </Box>
                      <LabelText label={detail.label} value={detail.value} />
                    ))}
                  </Grid>
                }
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {!selectedEmployee && (
          <VStack gap={3} py={20} alignItems="center" justifyContent="center">
            <Box
              p={5}
              borderRadius="full"
              bg="gray.100"
              color="gray.400"
              _dark={{ bg: "gray.800", color: "gray.500" }}
            >
              <FolderSearch size={36} strokeWidth={1.5} />
            </Box>
            <VStack gap={1} textAlign="center">
              <Text
                fontWeight="semibold"
                fontSize="md"
                color="gray.600"
                _dark={{ color: "gray.300" }}
              >
                No employee selected
              </Text>
              <Text
                fontSize="sm"
                color="gray.400"
                _dark={{ color: "gray.500" }}
                maxW="xs"
              >
                Search for an employee above to view and manage their policy
                documents.
              </Text>
            </VStack>
          </VStack>
        )}
      </Page.MainContent>
    </Page.Root>
  );
};

export default DocumentManagement;
