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
import type { ApprovalView } from "@/data/approvals/types";
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

  const [statusFilter, setStatusFilterState] =
    React.useState<string>("Pending");
  // TEMP DIAGNOSTIC — remove once the "switches to All" bug is found.
  const setStatusFilter = React.useCallback((value: string) => {
    if (value === "All") {
      // Prints the exact call stack of whatever forces the active card to "All".
      // eslint-disable-next-line no-console
      console.trace("[ApprovalsTable] setStatusFilter('All')");
    }
    setStatusFilterState(value);
  }, []);
  const [carouselIdx, setCarouselIdx] = React.useState(1);
  const carouselReady = React.useRef(false);

  // TEMP DIAGNOSTIC — confirms this build is actually running in the browser.
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[ApprovalsTable] diagnostic build v3 mounted");
  }, []);

  // Only mount the mobile carousel on mobile viewports. When hidden with
  // `display: none` on desktop it can't measure its slides and re-emits
  // onPageChange(0), which would clobber the Pending default with "All".
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
        label: "Approve Selected",
        icon: Check,
        onClick: handleBulkApprove,
      },
      {
        id: "bulk-reject",
        label: "Deny Selected",
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
        position="relative"
        bg={isActive ? `${card.accent}.100` : `${card.accent}.50`}
        border="2px solid"
        borderColor={isActive ? `${card.accent}.500` : `${card.accent}.200`}
        borderRadius="xl"
        p={4}
        mt={2}
        boxShadow={isActive ? "lg" : "xs"}
        cursor="pointer"
        // h="full"
        transform={isActive ? "translateY(-2px)" : "none"}
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
        {/* CHECKMARK — corner badge, only renders when the card is the active
            filter. Offset onto the corner so it doesn't clash with the icon. */}
        {isActive && (
          <Box
            position="absolute"
            top={-2}
            right={-2}
            zIndex={2}
            w="22px"
            h="22px"
            borderRadius="full"
            bg={`${card.accent}.500`}
            color="white"
            border="2px solid"
            borderColor="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="800"
            boxShadow="sm"
          >
            ✓
          </Box>
        )}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text
              fontSize="10px"
              fontWeight={isActive ? "800" : "700"}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={isActive ? `${card.accent}.600` : `${card.accent}.500`}
              mb={1}
            >
              {card.label}
            </Text>
            <Text
              fontSize={isActive ? "4xl" : "2xl"}
              fontWeight="bold"
              color={isActive ? `${card.accent}.700` : `${card.accent}.600`}
              lineHeight="1"
              mb={1}
              transition="font-size 0.15s ease"
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

      {/* Mobile: carousel (only mounted on mobile so its page events can't
          leak into statusFilter on desktop) */}
      {isMobile && (
        <Box>
          <Carousel.Root
            slideCount={cards.length}
            page={carouselIdx}
            onPageChange={(details: { page: number }) => {
              // The carousel emits an initial onPageChange(0) on mount (even while
              // hidden on desktop), which would clobber the Pending default. Skip
              // that first firing and only react to real page changes afterward.
              if (!carouselReady.current) {
                carouselReady.current = true;
                return;
              }
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
      )}

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
