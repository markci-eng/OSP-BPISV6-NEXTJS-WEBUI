"use client";

import { documents, EMPLOYEES } from "@/data/doc-management/documenttype";
import { Employee } from "@/data/doc-management/employeeSelector";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import React from "react";
import {
  LookupColumn,
  LookupField,
} from "../../components/common/reusable-lookup/LookUpField";
import { AnimatePresence, motion } from "framer-motion";
import DocumentTable from "./_components/DocumentTable";
import { Page } from "@/components/page/page";
import LabelText from "@/components/texts/LabelText";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_LAYOUT } from "@/lib/theme/layout-tokens";
import { DISPLAY_STATUS_STYLES } from "@/lib/theme/status-display-tokens";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

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
  const breadItem = [{ label: "Home" }, { label: "Document Management" }];
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const assignedCount = documents.filter(
    (document) => document.salesForceId && document.assignedTo,
  ).length;
  const unassignedCount = documents.length - assignedCount;
  const lowRemainingCount = documents.filter(
    (document) => Number(document.remainingQty || 0) <= 5,
  ).length;

  return (
    <Page
      breadcrumbItems={breadItem}
      title="Document Management"
      description="Assign, review, block, and reassign document series by employee."
      actionComponent={
        <Box
          w={{ base: "full", md: "320px", lg: "360px" }}
          ml={{ base: 0, md: "auto" }}
          flexShrink={0}
          mb={{ base: 4, md: 0 }}
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
      }
    >
      <Flex
        direction="column"
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
      >
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={{ base: 3, md: 4 }}
        >
          <OverviewStat label="Total Documents" value={documents.length} />
          <OverviewStat label="Assigned" value={assignedCount} tone="success" />
          <OverviewStat
            label="Unassigned"
            value={unassignedCount}
            tone="neutral"
          />
          <OverviewStat
            label="Low / Empty Remaining"
            value={lowRemainingCount}
            tone="warning"
          />
        </Grid>

        <ProfileSectionCard
          title="Employee Search"
          description="Select an employee to assign new document series or review their assigned documents."
        >
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={4}
          >
            {selectedEmployee ? (
              [
                { label: "Employee ID", value: selectedEmployee.id },
                { label: "Name", value: selectedEmployee.name },
                { label: "Branch", value: selectedEmployee.branch },
              ].map((detail) => (
                <LabelText
                  key={detail.label}
                  label={detail.label}
                  value={detail.value}
                />
              ))
            ) : (
              <Text color="gray.500" fontSize="sm">
                No employee selected. Use the search field above to filter and
                assign documents for a specific employee.
              </Text>
            )}
          </Grid>
        </ProfileSectionCard>

        <AnimatePresence>
          {selectedEmployee && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTransition}
              overflow="hidden"
            >
              <DocumentTable employee={selectedEmployee} />
            </MotionBox>
          )}
        </AnimatePresence>

        {!selectedEmployee && <DocumentTable employee={selectedEmployee} />}
      </Flex>
    </Page>
  );
};

function OverviewStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning";
}) {
  const style =
    tone === "success"
      ? DISPLAY_STATUS_STYLES.approved
      : tone === "warning"
        ? DISPLAY_STATUS_STYLES.pending
        : DISPLAY_STATUS_STYLES.fallback;

  return (
    <Box
      bg={style.bg}
      borderWidth="1px"
      borderColor={style.borderColor}
      borderRadius={STANDARD_RADIUS.md}
      p={{ base: 3, md: 4 }}
    >
      <Text fontSize="sm" color={style.color} fontWeight={style.fontWeight}>
        {label}
      </Text>
      <Text
        mt={1}
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight="700"
        color={BRAND_COLORS.neutralText}
      >
        {value}
      </Text>
    </Box>
  );
}

export default DocumentManagement;
