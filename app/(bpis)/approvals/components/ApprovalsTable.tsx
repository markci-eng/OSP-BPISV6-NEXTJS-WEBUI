"use client";

import * as React from "react";
import {
  Box,
  Carousel,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Files,
  X,
  XCircle,
} from "lucide-react";
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
  const [carouselIdx, setCarouselIdx] = React.useState(1);

  React.useEffect(() => {
    setStatusFilter("Pending");
    setCarouselIdx(1);
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
        id: "deny",
        label: "Deny",
        icon: X,
        variant: "destructive",
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleReject,
      },
      {
        id: "approve",
        label: "Approve",
        icon: Check,
        hidden: (row) => getApprovalStatus(row) !== "Pending",
        onClick: handleApprove,
      },
    ],
    [handleApprove, handleReject],
  );

  const bulkActions = React.useMemo<BulkAction<any>[]>(
    () => [
      {
        id: "bulk-approve",
        label: "Approve All",
        icon: Check,
        onClick: handleBulkApprove,
      },
      {
        id: "bulk-reject",
        label: "Deny All",
        icon: X,
        variant: "destructive",
        onClick: handleBulkDeny,
      },
    ],
    [handleBulkApprove, handleBulkDeny],
  );

  const summary = React.useMemo(() => {
    const total = data.length;
    const pending = data.filter(
      (r) => getApprovalStatus(r) === "Pending",
    ).length;
    const approved = data.filter(
      (r) => getApprovalStatus(r) === "Approved",
    ).length;
    const denied = data.filter((r) => getApprovalStatus(r) === "Denied").length;
    return { total, pending, approved, denied };
  }, [data]);

  const cards = React.useMemo(
    () => [
      {
        label: "Total Requests",
        value: summary.total,
        filter: "All",
        sub: "All requests",
        icon: Files,
        accent: "blue",
      },
      {
        label: "Pending",
        value: summary.pending,
        filter: "Pending",
        sub: "Awaiting review",
        icon: Clock,
        accent: "orange",
      },
      {
        label: "Approved",
        value: summary.approved,
        filter: "Approved",
        sub: "Completed",
        icon: CheckCircle,
        accent: "green",
      },
      {
        label: "Rejected",
        value: summary.denied,
        filter: "Denied",
        sub: "Denied",
        icon: XCircle,
        accent: "red",
      },
    ],
    [summary],
  );

  const renderCardContent = (card: (typeof cards)[number], i: number) => {
    const isActive = statusFilter === card.filter;
    return (
      <Box
        bg={isActive ? `${card.accent}.100` : `${card.accent}.50`}
        border="1px solid"
        borderColor={isActive ? `${card.accent}.400` : `${card.accent}.200`}
        borderRadius="xl"
        p={4}
        boxShadow="xs"
        cursor="pointer"
        h="full"
        onClick={() => {
          setStatusFilter(card.filter);
          setCarouselIdx(i);
        }}
        transition="all 0.15s ease"
        _hover={{
          bg: `${card.accent}.100`,
          borderColor: `${card.accent}.400`,
        }}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={`${card.accent}.500`}
              mb={1}
            >
              {card.label}
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isActive ? `${card.accent}.700` : `${card.accent}.600`}
              lineHeight="1"
              mb={1}
            >
              {card.value}
            </Text>
            <Text fontSize="xs" color={`gray.600`} fontWeight="medium">
              {card.sub}
            </Text>
          </Box>
          <Box
            p={2}
            borderRadius="lg"
            bg={isActive ? `${card.accent}.200` : `${card.accent}.100`}
            color={`${card.accent}.500`}
          >
            <card.icon size={18} />
          </Box>
        </Flex>
      </Box>
    );
  };

  return (
    <Flex direction="column" gap={4}>
      {/* Desktop: 4-column grid */}
      <SimpleGrid columns={4} gap={3} display={{ base: "none", md: "grid" }}>
        {cards.map((card, i) => (
          <Box key={card.label}>{renderCardContent(card, i)}</Box>
        ))}
      </SimpleGrid>

      {/* Mobile: carousel */}
      <Box display={{ base: "block", md: "none" }}>
        <Carousel.Root
          slideCount={cards.length}
          page={carouselIdx}
          onPageChange={(details: { page: number }) => {
            setCarouselIdx(details.page);
            setStatusFilter(cards[details.page].filter);
          }}
        >
          <Carousel.ItemGroup>
            {cards.map((card, i) => (
              <Carousel.Item key={card.label} index={i}>
                {renderCardContent(card, i)}
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>

          <Carousel.Control justifyContent="center" gap="4">
            <Carousel.PrevTrigger asChild>
              <IconButton size="xs" variant="ghost" aria-label="Previous">
                <ChevronLeft size={16} />
              </IconButton>
            </Carousel.PrevTrigger>

            <Carousel.Indicators />

            <Carousel.NextTrigger asChild>
              <IconButton size="xs" variant="ghost" aria-label="Next">
                <ChevronRight size={16} />
              </IconButton>
            </Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>
      </Box>

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
            onApprove={(selectedRow) => {
              handleApprove(selectedRow);
            }}
            onDeny={(selectedRow) => {
              handleReject(selectedRow);
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
            Pending: "orange",
            Approved: "green",
            Denied: "red",
          },
        }}
      />
    </Flex>
  );
}
