"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Box, Text, Badge, HStack, Flex, Grid } from "@chakra-ui/react";
import { Trash2, Ban, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

import {
  documents,
  type Documents,
  EMPLOYEES,
} from "@/data/doc-management/documenttype";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  type BulkAction,
  multiSelectFilter,
  type RowAction,
} from "@/components/common/reusable-tableV2/types";
import { Employee } from "@/data/doc-management/employeeSelector";
import BlockDocumentModal from "./BlockDocumentsModal";
import ReassignDocumentModal from "./ReassignDocumentsModal";
import {
  AssignedDocRow,
  BlockDocumentPayload,
  ReassignDocumentPayload,
} from "./types";
import AssignDocumentsForm, {
  AssignDocumentPayload,
} from "./AssignDocumentsForm";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import {
  DISPLAY_STATUS_STYLES,
  type DisplayStatusStyle,
} from "@/lib/theme/status-display-tokens";

function createEmployeeMap(employees: Employee[]) {
  return new Map(employees.map((employee) => [employee.id, employee]));
}

function getAssignedStatus(
  doc: Documents,
  employee?: Employee,
): AssignedDocRow["assignedStatus"] {
  if (!doc.salesForceId || !doc.assignedTo) return "Unassigned";
  if (employee) return "Assigned";
  return "Unknown Employee";
}

function buildAssignedDocumentRows(
  employees: Employee[],
  docs: Documents[],
): AssignedDocRow[] {
  const employeeMap = createEmployeeMap(employees);

  return docs.map((doc) => {
    const employee = doc.salesForceId
      ? employeeMap.get(doc.salesForceId)
      : undefined;

    return {
      ...doc,
      controlNo: doc.controlNo,
      employeeName: employee?.name ?? doc.assignedTo ?? "(no assignee)",
      department: employee?.branch ?? "(unknown department)",
      remainingQtyNum: Number(doc.remainingQty || 0),
      assignedStatus: getAssignedStatus(doc, employee),
      expiryDateNum: doc.expiryDate || "",
    };
  });
}

function getAssignedStatusStyle(status: AssignedDocRow["assignedStatus"]) {
  if (status === "Assigned") return DISPLAY_STATUS_STYLES.approved;
  if (status === "Unknown Employee") return DISPLAY_STATUS_STYLES.pending;
  return DISPLAY_STATUS_STYLES.fallback;
}

function getRemainingStyle(value: number) {
  if (value <= 0) return DISPLAY_STATUS_STYLES.denied;
  if (value <= 5) return DISPLAY_STATUS_STYLES.pending;
  return DISPLAY_STATUS_STYLES.approved;
}

function StandardBadge({
  children,
  style,
}: {
  children: React.ReactNode;
  style: DisplayStatusStyle;
}) {
  return (
    <Badge
      bg={style.bg}
      color={style.color}
      borderColor={style.borderColor}
      borderWidth={style.borderWidth}
      borderRadius={STANDARD_RADIUS.full}
      fontWeight={style.fontWeight}
      px={2}
      py={0.5}
    >
      {children}
    </Badge>
  );
}

const assignedDocumentColumns: ColumnDef<AssignedDocRow>[] = [
  {
    accessorKey: "documentType",
    header: "Document Type",
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <StandardBadge style={DISPLAY_STATUS_STYLES.fallback}>
        {getValue<string>()}
      </StandardBadge>
    ),
    meta: {
      filterVariant: "multiSelect",
      responsivePriority: 1,
      alwaysVisible: true,
      width: "220px",
      minWidth: "220px",
    },
  },
  {
    accessorKey: "assignedStatus",
    header: "Status",
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => {
      const value = getValue<AssignedDocRow["assignedStatus"]>();
      return (
        <StandardBadge style={getAssignedStatusStyle(value)}>
          {value}
        </StandardBadge>
      );
    },
    meta: {
      filterVariant: "multiSelect",
      width: "90px",
      minWidth: "90px",
    },
  },
  {
    accessorKey: "employeeName",
    header: "Assigned To",
    meta: {
      width: "90px",
      minWidth: "90px",
    },
  },
  {
    accessorKey: "remainingQtyNum",
    header: "Remaining",
    enableColumnFilter: false,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
      numeric: true,
      width: "96px",
      minWidth: "88px",
    },
    cell: ({ getValue }) => {
      const value = getValue<number>();
      const style = getRemainingStyle(value);

      return <StandardBadge style={style}>{value}</StandardBadge>;
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry",
    enableColumnFilter: false,
    meta: {
      width: "90px",
      minWidth: "90px",
    },
  },
];

function AssignedDocumentDetail({ row }: { row: AssignedDocRow }) {
  const detailItems = [
    ["Document Type", row.documentType],
    ["Doc Code", row.documentCode],
    ["Control No", row.controlNo],
    [
      "Range",
      `${row.documentStart}-${row.documentEnd}${
        row.documentExt ? ` (${row.documentExt})` : ""
      }`,
    ],
    ["Qty In Unit", row.qtyInUnit],
    ["Remaining", String(row.remainingQtyNum)],
    ["Expiry", row.expiryDate],
    ["Status", row.assignedStatus],
  ] as const;

  return (
    <Box
      borderRadius={STANDARD_RADIUS.md}
      borderWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      bg={BRAND_COLORS.white}
      p={4}
    >
      <HStack gap={3} align="center">
        <Box
          w="48px"
          h="48px"
          borderRadius={STANDARD_RADIUS.full}
          borderWidth="1px"
          borderColor={BRAND_COLORS.softGreen}
          bg={BRAND_COLORS.successBg}
          color={BRAND_COLORS.primaryGreen}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
          fontSize="lg"
        >
          {(row.employeeName || "?").charAt(0)}
        </Box>

        <Box>
          <Text fontWeight="semibold" color={BRAND_COLORS.neutralText}>
            {row.employeeName}
          </Text>
          <Text fontSize="12px" color="fg.muted">
            {row.salesForceId || "(no salesForceId)"}
          </Text>
        </Box>
      </HStack>

      <Box
        mt={6}
        display="grid"
        gridTemplateColumns={{
          base: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        }}
        gap={4}
      >
        {detailItems.map(([label, value]) => (
          <Box key={label}>
            <Text fontSize="11px" color="fg.muted" mb="0.5">
              {label}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={BRAND_COLORS.neutralText}
            >
              {value}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

type ModalType = "block" | "reassign" | "assign" | null;

type DocumentTableProps = {
  employee: Employee | null;
  topContent?: React.ReactNode;
};

export default function DocumentTable({
  employee,
  topContent,
}: DocumentTableProps) {
  const [data, setData] = React.useState<AssignedDocRow[]>(() =>
    buildAssignedDocumentRows(EMPLOYEES, documents),
  );

  const tableData = React.useMemo(() => {
    if (!employee) return data;
    return data.filter((row) => row.salesForceId === employee.id);
  }, [data, employee]);

  const [selectedRow, setSelectedRow] = React.useState<AssignedDocRow | null>(
    null,
  );
  const [modalType, setModalType] = React.useState<ModalType>(null);

  const selectedEmployeeId = selectedRow?.salesForceId ?? employee?.id ?? "";

  const closeModal = React.useCallback(() => {
    setModalType(null);
    setSelectedRow(null);
  }, []);

  const openBlockModal = React.useCallback((row: AssignedDocRow) => {
    setSelectedRow(row);
    setModalType("block");
  }, []);

  const openReassignModal = React.useCallback((row: AssignedDocRow) => {
    setSelectedRow(row);
    setModalType("reassign");
  }, []);

  const handleAssignSubmit = React.useCallback(
    (payload: AssignDocumentPayload) => {
      const assignedEmployee =
        EMPLOYEES.find((emp) => emp.id === payload.selectedEmployee.id) ??
        employee;

      if (!assignedEmployee) {
        toast.error("No employee selected");
        return;
      }

      const [start = "", end = ""] = payload.documentSeries.split("-");

      const newRow: AssignedDocRow = {
        ...documents[0],
        documentCode: `DOC-${Date.now()}`,
        controlNo: `CTRL-${Date.now()}`,
        assignedTo: assignedEmployee.name,
        salesForceId: assignedEmployee.id,
        employeeName: assignedEmployee.name,
        branch: assignedEmployee.branch,
        assignedStatus: "Assigned",
        remainingQtyNum: Number(payload.quantity || 0),
        qtyInUnit: payload.quantity || "0",
        documentType: payload.docType,
        documentStart: start,
        documentEnd: end,
        expiryDate: "",
        expiryDateNum: "",
      };

      setData((prev) => [newRow, ...prev]);
      toast.success(`Assigned ${payload.docType} to ${assignedEmployee.name}`);
      closeModal();
    },
    [closeModal, employee],
  );

  const handleBlockSubmit = React.useCallback(
    (payload: BlockDocumentPayload) => {
      toast.success(
        `Blocked ${payload.documentCode} (${payload.documentStart}-${payload.documentEnd})`,
      );
      closeModal();
    },
    [closeModal],
  );

  const handleReassignSubmit = React.useCallback(
    (payload: ReassignDocumentPayload) => {
      const employee = EMPLOYEES.find(
        (emp) => emp.id === payload.newEmployeeId,
      );

      setData((prev) =>
        prev.map((item) =>
          item.documentCode === payload.documentCode
            ? {
                ...item,
                salesForceId: employee?.id ?? item.salesForceId,
                assignedTo: employee?.name ?? item.assignedTo,
                employeeName: employee?.name ?? item.employeeName,
                branch: employee?.branch ?? item.branch,
                assignedStatus: "Assigned",
              }
            : item,
        ),
      );

      toast.success(
        `Reassigned ${payload.documentCode} to ${employee?.name ?? payload.newEmployeeId}`,
      );

      closeModal();
    },
    [closeModal],
  );

  const rowActions = React.useMemo<RowAction<AssignedDocRow>[]>(
    () => [
      {
        id: "block-document",
        label: "Block Document",
        icon: Ban,
        onClick: (row) => openBlockModal(row),
      },
      {
        id: "reassign-document",
        label: "Reassign Document",
        icon: ArrowRightLeft,
        separator: true,
        onClick: (row) => openReassignModal(row),
      },
    ],
    [openBlockModal, openReassignModal],
  );

  const bulkActions = React.useMemo<BulkAction<AssignedDocRow>[]>(
    () => [
      {
        id: "bulk-delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: (rows) => {
          const selectedCodes = new Set(rows.map((row) => row.documentCode));

          setData((prev) =>
            prev.filter((item) => !selectedCodes.has(item.documentCode)),
          );

          toast.success(`Deleted ${rows.length} row(s)`);
        },
      },
    ],
    [],
  );

  return (
    <Flex direction="column" gap={4}>
      {employee && (
        <ProfileSectionCard
          title="Assign Documents"
          description="Assign a document type, quantity, and series to the selected employee."
        >
          <Flex direction="column" gap={4}>
            {topContent ? (
              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={4}
              >
                {topContent}
              </Grid>
            ) : null}
            <AssignDocumentsForm
              employee={employee}
              onAssigned={handleAssignSubmit}
            />
          </Flex>
        </ProfileSectionCard>
      )}
      <ProfileSectionCard
        title="Assigned Documents"
        description={
          employee
            ? "Documents assigned to the selected employee."
            : "All assigned and unassigned document series."
        }
      >
        <DataTable<AssignedDocRow>
          columns={assignedDocumentColumns}
          data={tableData}
          getRowId={(row) => row.documentCode}
          size="sm"
          rowActions={rowActions}
          bulkActions={bulkActions}
          onReorder={setData}
          features={{
            search: true,
            filtering: true,
            sorting: true,
            pagination: true,
            columnToggle: false,
            selection: false,
            draggable: false,
            detailSidebar: true,
          }}
          renderDetail={(row) => <AssignedDocumentDetail row={row} />}
          // summaryRows={[
          //   {
          //     id: "assigned-documents-summary",
          //     label: "Total",
          //     labelColumnId: "employeeName",
          //     aggregations: {
          //       remainingQtyNum: "sum",
          //     },
          //   },
          // ]}
          mobileConfig={{
            viewMode: "accordion",
            titleTransform: "uppercase",
            primaryField: "documentType",
            secondaryField: "documentCode",
            badgeField: "remainingQtyNum",
            visibleFields: [
              "controlNo",
              "employeeName",
              "branch",
              "assignedStatus",
              "expiryDate",
            ],
            labelMap: {
              documentCode: "Document Code",
              remainingQtyNum: "Remaining",
              controlNo: "Control No.",
              employeeName: "Assigned To",
              branch: "Branch",
              assignedStatus: "Status",
              expiryDate: "Expiry",
            },
            valueFormatter: {
              remainingQtyNum: (value) => {
                const num = Number(value);
                return isNaN(num) ? String(value) : String(num);
              },
            },
            badgeColorMap: {
              Assigned: "green",
              Unassigned: "gray",
              "Unknown Employee": "orange",
            },
          }}
        />
      </ProfileSectionCard>

      <BlockDocumentModal
        open={modalType === "block"}
        onClose={closeModal}
        row={selectedRow}
        employeeID={selectedEmployeeId}
        onSubmit={handleBlockSubmit}
      />

      <ReassignDocumentModal
        open={modalType === "reassign"}
        onClose={closeModal}
        row={selectedRow}
        employeeID={selectedEmployeeId}
        onSubmit={handleReassignSubmit}
      />
    </Flex>
  );
}
