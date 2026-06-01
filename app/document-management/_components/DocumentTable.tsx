"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Box, Text, Badge, HStack, Separator } from "@chakra-ui/react";
import { Plus, Trash2, Ban, ArrowRightLeft } from "lucide-react";
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
import { H4 } from "st-peter-ui";

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
      rounded="xl"
      borderWidth="1px"
      borderColor="border.muted"
      bg="bg"
      p={4}
      boxShadow="md"
    >
      <HStack gap={3} align="center">
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          borderColor={"black"}
          bg="darkgrey"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
          fontSize="lg"
        >
          {(row.employeeName || "?").charAt(0)}
        </Box>

        <Box>
          <Text fontWeight="semibold">{row.employeeName}</Text>
          <Text fontSize="12px" color="fg.muted">
            {row.salesForceId || "(no salesForceId)"}
          </Text>
        </Box>
      </HStack>

      <Box
        mt={6}
        display="grid"
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gap={4}
      >
        {detailItems.map(([label, value]) => (
          <Box key={label}>
            <Text fontSize="11px" color="fg.muted" mb="0.5">
              {label}
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="fg">
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
    <>
      {employee && (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          bg="white"
          p={{ base: 4, md: 5 }}
          mb={4}
        >
          <Box mb={2}>
            <H4>Assign Documents</H4>
            <Separator mt={2} mb={5} />
          </Box>

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
