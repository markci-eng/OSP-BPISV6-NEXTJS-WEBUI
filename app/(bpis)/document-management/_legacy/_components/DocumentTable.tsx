"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Box, Text, Badge, HStack, VStack, Flex } from "@chakra-ui/react";
import {
  Plus,
  Trash2,
  Ban,
  ArrowRightLeft,
  FileText,
  User,
} from "lucide-react";
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
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

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

const assignedDocumentColumns: ColumnDef<AssignedDocRow>[] = [
  {
    accessorKey: "documentType",
    header: "Document Type",
    filterFn: multiSelectFilter,
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
      const color = value <= 0 ? "red" : value <= 5 ? "orange" : "green";
      const variant = value <= 0 ? "outline" : "surface";
      const bgColor = variant === "outline" ? "transparent" : `${color}.100`;

      return (
        <Badge color={color} variant={variant} bgColor={bgColor} size="sm">
          {value}
        </Badge>
      );
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

const ASSIGNED_STATUS_META = {
  Assigned: {
    colorPalette: "green",
    color: "green.600",
    bg: "green.50",
    borderColor: "green.200",
  },
  Unassigned: {
    colorPalette: "gray",
    color: "gray.600",
    bg: "gray.50",
    borderColor: "gray.200",
  },
  "Unknown Employee": {
    colorPalette: "orange",
    color: "orange.600",
    bg: "orange.50",
    borderColor: "orange.200",
  },
} as const;

function AssignedDocStatusBadge({ status }: { status: string }) {
  const meta =
    ASSIGNED_STATUS_META[status as keyof typeof ASSIGNED_STATUS_META] ??
    ASSIGNED_STATUS_META.Unassigned;
  return (
    <Badge colorPalette={meta.colorPalette} variant="subtle" flexShrink={0}>
      {status}
    </Badge>
  );
}

function DocSectionCard({
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

function DocDetailItem({
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

function AssignedDocumentDetail({ row }: { row: AssignedDocRow }) {
  const statusMeta =
    ASSIGNED_STATUS_META[
      row.assignedStatus as keyof typeof ASSIGNED_STATUS_META
    ] ?? ASSIGNED_STATUS_META.Unassigned;

  const range = `${row.documentStart}-${row.documentEnd}${
    row.documentExt ? ` (${row.documentExt})` : ""
  }`;

  return (
    <VStack align="stretch" gap={{ base: 3, md: 4 }}>
      <Box
        rounded="lg"
        borderWidth="1px"
        borderColor={statusMeta.borderColor}
        bg={statusMeta.bg}
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
              Assigned Document
            </Text>
            <Text fontSize="md" fontWeight="semibold" lineClamp={2} color="fg">
              {row.documentType}
            </Text>
          </Box>
          <AssignedDocStatusBadge status={row.assignedStatus} />
        </HStack>
      </Box>

      <DocSectionCard title="Assignee" icon={<User size={13} />}>
        <HStack gap={3} align="center">
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.muted"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="semibold"
            fontSize="md"
            color="fg"
            flexShrink={0}
          >
            {(row.employeeName || "?").charAt(0)}
          </Box>
          <Box minW={0}>
            <Text fontWeight="semibold" fontSize="sm">
              {row.employeeName}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {row.salesForceId || "(no salesForceId)"}
            </Text>
          </Box>
        </HStack>
      </DocSectionCard>

      <DocSectionCard title="Document Details" icon={<FileText size={13} />}>
        <DocDetailItem label="Document Type" value={row.documentType} />
        <DocDetailItem label="Doc Code" value={row.documentCode} />
        <DocDetailItem label="Control No" value={row.controlNo} />
        <DocDetailItem label="Range" value={range} />
        <DocDetailItem label="Qty In Unit" value={row.qtyInUnit} />
        <DocDetailItem label="Remaining" value={String(row.remainingQtyNum)} />
        <DocDetailItem label="Expiry" value={row.expiryDate} />
        <DocDetailItem
          label="Status"
          value={<AssignedDocStatusBadge status={row.assignedStatus} />}
        />
      </DocSectionCard>
    </VStack>
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
        label: "Block",
        icon: Ban,
        onClick: (row) => openBlockModal(row),
      },
      {
        id: "reassign-document",
        label: "Reassign",
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
    <>
      {employee && (
        <Box mb={4} px={2} mt={2}>
          <InfoCardAccordion
            icon={<User size={16} />}
            title="Assign Documents"
            subtitle={employee.name}
            defaultOpen
          >
            {topContent}
            <Box
              mt={topContent ? 5 : 0}
              pt={topContent ? 5 : 0}
              borderTopWidth={topContent ? "1px" : "0"}
              borderColor="gray.100"
            >
              <AssignDocumentsForm
                employee={employee}
                onAssigned={handleAssignSubmit}
              />
            </Box>
          </InfoCardAccordion>
        </Box>
      )}
      <Box maxW="full">
        <DataTable<AssignedDocRow>
          columns={assignedDocumentColumns}
          title="Assigned Documents"
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
            columnToggle: true,
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
      </Box>

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
    </>
  );
}
