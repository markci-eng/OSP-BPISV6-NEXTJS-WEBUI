"use client";

import * as React from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import type {
  BulkAction,
  RowAction,
} from "@/components/common/reusable-tableV2/types";

import { approvalConfig } from "../config/approval-config";
import { ApprovalDetailContent } from "./ApprovalDetailContent";
import type { ApprovalView } from "../data/types";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

function getApprovalStatus(row: any) {
  return row.drs?.status ?? row.status;
}

export function ApprovalsTable({
  view,
  setView,
}: {
  view: ApprovalView;
  setView: (v: ApprovalView) => void;
}) {
  const { messageBox } = useMessageDialog();

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
        title: "CONFIRM",
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
        title: "CONFIRM",
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

      toast.error("Request denied");
    },
    [config, messageBox, view],
  );

  const handleBulkApprove = React.useCallback(
    async (rows: any[]) => {
      const confirmed = await messageBox({
        title: "CONFIRM BULK APPROVAL",
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
        title: "CONFIRM BULK DENIAL",
        message: `Are you sure you want to deny ${rows.length} selected request(s)?`,
        confirmText: "Deny All",
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

      toast.error(`Denied ${rows.length} request(s)`);
    },
    [config, messageBox, view],
  );

  const rowActions = React.useMemo<RowAction<any>[]>(
    () => [
      {
        id: "approve",
        label: "Approve",
        icon: Check,
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleApprove,
      },
      {
        id: "deny",
        label: "Deny",
        icon: X,
        variant: "destructive",
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleReject,
      },
    ],
    [handleApprove, handleReject],
  );

  const bulkActions = React.useMemo<BulkAction<any>[]>(
    () => [
      {
        id: "bulk-reject",
        label: "Deny All",
        icon: X,
        variant: "destructive",
        onClick: handleBulkDeny,
      },
      {
        id: "bulk-approve",
        label: "Approve All",
        icon: Check,
        onClick: handleBulkApprove,
      },
    ],
    [handleBulkApprove, handleBulkDeny],
  );

  const summary = React.useMemo(() => {
    const total = data.length;
    const pending = data.filter((r) => getApprovalStatus(r) === "Pending").length;
    const approved = data.filter((r) => getApprovalStatus(r) === "Approved").length;
    const denied = data.filter((r) => getApprovalStatus(r) === "Denied").length;
    return { total, pending, approved, denied };
  }, [data]);

  return (
    <Flex direction="column" gap={4}>
      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
        {[
          { label: "Total Requests", value: summary.total, filter: "All", sub: null },
          { label: "Pending", value: summary.pending, filter: "Pending", sub: "awaiting review" },
          { label: "Approved", value: summary.approved, filter: "Approved", sub: null },
          { label: "Rejected", value: summary.denied, filter: "Denied", sub: null },
        ].map((card) => {
          const isActive = statusFilter === card.filter;
          return (
            <Box
              key={card.label}
              bg={isActive ? "var(--chakra-colors-primary-disabled)/15" : "white"}
              border="1px solid"
              borderColor={isActive ? "var(--chakra-colors-primary-disabled)" : "gray.200"}
              borderRadius="xl"
              p={4}
              boxShadow="xs"
              cursor="pointer"
              onClick={() => setStatusFilter(card.filter)}
              transition="all 0.15s ease"
              _hover={{ borderColor: "var(--chakra-colors-primary-disabled)", bg: "var(--chakra-colors-primary-disabled)/10" }}
            >
              <Text fontSize="10px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" color={isActive ? "var(--chakra-colors-primary)" : "gray.400"} mb={1}>
                {card.label}
              </Text>
              <Flex align="baseline" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color={isActive ? "var(--chakra-colors-primary)" : "gray.800"} lineHeight="1">
                  {card.value}
                </Text>
                {card.sub && (
                  <Text fontSize="xs" color="orange.400" fontWeight="medium">
                    {card.sub}
                  </Text>
                )}
              </Flex>
            </Box>
          );
        })}
      </Grid>

      <DataTable<any>
      key={view}
      title={config.title}
      description={config.description}
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
            console.log("Approve remarks:", remarks);
          }}
          onDeny={(selectedRow, remarks) => {
            handleReject(selectedRow);
            console.log("Deny remarks:", remarks);
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
        badgeColorMap: {
          Pending: "yellow",
          Approved: "green",
          Denied: "red",
        },
      }}
    />
    </Flex>
  );
}
