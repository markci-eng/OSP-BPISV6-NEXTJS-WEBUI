"use client";

import * as React from "react";
import { Box, Text, createListCollection } from "@chakra-ui/react";
import { toast } from "sonner";
import { SelectFloatingLabel } from "st-peter-ui";
import { FiInbox } from "react-icons/fi";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import type {
  BulkAction,
  RowAction,
} from "@/components/common/reusable-tableV2/types";

import { approvalConfig } from "../config/approval-config";
import { ApprovalDetailContent } from "./ApprovalDetailContent";
import type { ApprovalView } from "../data/types";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import {
  APPROVAL_BRAND_COLORS,
  approvalStatusBadgeStyleMap,
} from "../utils/colors";

const approvalTypeCollection = createListCollection({
  items: [
    {
      label: "Reassignment of Documents",
      value: "reassignment-doc",
    },
    {
      label: "Digital Remittance Slip (DRS)",
      value: "drs",
    },
    {
      label: "Movement of Employees",
      value: "movement-employees",
    },
    {
      label: "Reassignment of SA2",
      value: "reassignment-sa2",
    },
  ],
});

const statusCollection = createListCollection({
  items: [
    { label: "All Status", value: "All" },
    { label: "Pending", value: "Pending" },
    { label: "Approved", value: "Approved" },
    { label: "Denied", value: "Denied" },
  ],
});

function getApprovalStatus(row: any) {
  return row.drs?.status ?? row.status;
}

function ApprovalsEmptyState() {
  return (
    <Box display="grid" justifyItems="center" gap={2} py={4} color="gray.600">
      <Box
        display="grid"
        placeItems="center"
        boxSize="40px"
        borderRadius="full"
        bg={APPROVAL_BRAND_COLORS.successBg}
        color={APPROVAL_BRAND_COLORS.primaryGreen}
      >
        <FiInbox size={20} />
      </Box>
      <Text fontWeight="700" color="gray.800">
        No Records Available
      </Text>
      <Text fontSize="sm" color="gray.500">
        Adjust the approval type or status filter to view more records.
      </Text>
    </Box>
  );
}

export function ApprovalsTable() {
  const { messageBox } = useMessageDialog();

  const [view, setView] = React.useState<ApprovalView>("reassignment-doc");

  const config = approvalConfig[view];

  const [dataByView, setDataByView] = React.useState<
    Record<ApprovalView, any[]>
  >(() => ({
    "reassignment-doc": approvalConfig["reassignment-doc"].data,
    drs: approvalConfig.drs.data,
    "movement-employees": approvalConfig["movement-employees"].data,
    "reassignment-sa2": approvalConfig["reassignment-sa2"].data,
  }));

  const data = dataByView[view];

  const [statusFilter, setStatusFilter] = React.useState<string>("Pending");
  React.useEffect(() => {
    setStatusFilter("Pending");
  }, [view]);

  const filteredData = React.useMemo(() => {
    if (statusFilter === "All") return data;

    return data.filter((row) => {
      return getApprovalStatus(row) === statusFilter;
    });
  }, [data, statusFilter]);

  function updateApprovalStatus(row: any, status: "Approved" | "Denied") {
    if (row.drs) {
      return {
        ...row,
        status,
        drs: {
          ...row.drs,
          status,
        },
      };
    }

    return {
      ...row,
      status,
    };
  }

  const handleApprove = React.useCallback(
    async (row: any) => {
      const confirmed = await messageBox({
        title: "CONFIRMATION",
        message: "Are you sure you want to approve this request?",
        confirmText: "Approve",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const rowId = config.getRowId(row, 0);

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          config.getRowId(item, index) === rowId
            ? updateApprovalStatus(item, "Approved")
            : item,
        ),
      }));

      toast.success("Request approved");
    },
    [config, messageBox, view],
  );

  const handleReject = React.useCallback(
    async (row: any) => {
      const confirmed = await messageBox({
        title: "CONFIRMATION",
        message: "Are you sure you want to deny this request?",
        confirmText: "Deny",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const rowId = config.getRowId(row, 0);

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          config.getRowId(item, index) === rowId
            ? updateApprovalStatus(item, "Denied")
            : item,
        ),
      }));

      toast.success("Request denied");
    },
    [config, messageBox, view],
  );

  const handleBulkApprove = React.useCallback(
    async (rows: any[]) => {
      const confirmed = await messageBox({
        title: "CONFIRMATION",
        message: `Are you sure you want to approve ${rows.length} selected request(s)?`,
        confirmText: "Approve",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const selectedIds = new Set(
        rows.map((row, index) => config.getRowId(row, index)),
      );

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          selectedIds.has(config.getRowId(item, index))
            ? updateApprovalStatus(item, "Approved")
            : item,
        ),
      }));

      toast.success(`Approved ${rows.length} request(s)`);
    },
    [config, messageBox, view],
  );

  const handleBulkDeny = React.useCallback(
    async (rows: any[]) => {
      const confirmed = await messageBox({
        title: "CONFIRMATION",
        message: `Are you sure you want to deny ${rows.length} selected request(s)?`,
        confirmText: "Deny",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const selectedIds = new Set(
        rows.map((row, index) => config.getRowId(row, index)),
      );

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          selectedIds.has(config.getRowId(item, index))
            ? updateApprovalStatus(item, "Denied")
            : item,
        ),
      }));

      toast.success(`Denied ${rows.length} request(s)`);
    },
    [config, messageBox, view],
  );

  const rowActions = React.useMemo<RowAction<any>[]>(
    () => [
      {
        id: "deny",
        label: "Deny",
        variant: "destructive",
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleReject,
      },
      {
        id: "approve",
        label: "Approve",
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleApprove,
      },
    ],
    [handleApprove, handleReject],
  );

  const bulkActions = React.useMemo<BulkAction<any>[]>(
    () => [
      {
        id: "bulk-reject",
        label: "Deny",
        variant: "destructive",
        onClick: handleBulkDeny,
      },
      {
        id: "bulk-approve",
        label: "Approve",
        onClick: handleBulkApprove,
      },
    ],
    [handleBulkApprove, handleBulkDeny],
  );

  return (
    <DataTable<any>
      key={view}
      headerContent={
        <SelectFloatingLabel
          label="Approval Type"
          collection={approvalTypeCollection}
          value={[view]}
          onValueChanged={(values) => {
            const selected = values[0] as ApprovalView;
            setView(selected);
          }}
          w="full"
        />
      }
      headerActions={
        <SelectFloatingLabel
          label="Status"
          collection={statusCollection}
          value={[statusFilter]}
          onValueChanged={(values) => {
            setStatusFilter(values[0] ?? "Pending");
          }}
          w={{ base: "full", md: "150px" }}
        />
      }
      data={filteredData}
      columns={config.columns}
      getRowId={config.getRowId}
      rowActions={rowActions}
      bulkActions={bulkActions}
      renderDetail={(row) => (
        <ApprovalDetailContent
          row={row}
          config={config}
          onApprove={(selectedRow, remarks) => {
            handleApprove(selectedRow);
            void remarks;
          }}
          onDeny={(selectedRow, remarks) => {
            handleReject(selectedRow);
            void remarks;
          }}
        />
      )}
      features={{
        search: true,
        filtering: true,
        sorting: true,
        pagination: true,
        columnToggle: true,
        selection: true,
        draggable: false,
        detailSidebar: true,
      }}
      mobileConfig={{
        viewMode: "accordion",
        primaryField: config.mobile.primaryField as any,
        secondaryField: config.mobile.secondaryField as any,
        badgeField: config.mobile.badgeField as any,
        visibleFields: config.mobile.visibleFields as any,
        labelMap: config.mobile.labelMap as any,
        valueFormatter: config.mobile.valueFormatter as any,
        badgeStyleMap: approvalStatusBadgeStyleMap,
      }}
      emptyState={<ApprovalsEmptyState />}
    />
  );
}
