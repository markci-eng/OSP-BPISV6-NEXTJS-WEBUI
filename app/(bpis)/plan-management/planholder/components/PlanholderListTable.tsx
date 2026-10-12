"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { DataTable, ErrorStateCard, OSPBadge } from "osp-ui-kit";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePlanholderSearch } from "../hooks/usePlanholderSearch";
import { PLANHOLDER_PAGE_SIZE } from "../api/planholder-search.api";
import { PlanholderAvatar } from "./PlanholderAvatar";
import { PlanholderCardList } from "./PlanholderCardList";
import { PlanholderListSkeleton } from "./PlanholderListSkeleton";
import { TerminationStatusFilter } from "./TerminationStatusFilter";
import {
  formatDate,
  installmentProgress,
  LIST_PARAMS,
  NOT_TERMINATED,
  planholderProfileHref,
  replaceListParam,
  statusBadgeType,
  toTitleCase,
} from "./planholder-list-utils";

const planholderColumns: ColumnDef<PlanholderLookup>[] = [
  {
    id: "planholder",
    header: "Planholder",
    accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
    cell: ({ row }) => {
      const ph = row.original;
      return (
        <Flex align="center" gap={3}>
          <PlanholderAvatar
            name={`${ph.firstName} ${ph.lastName}`}
            src={mockAvatarUrl(ph.personId)}
            size="sm"
          />
          <Box>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3">
              {toTitleCase(ph.firstName)} {toTitleCase(ph.middleName)}{" "}
              {toTitleCase(ph.lastName)}
            </Text>
            <Text fontSize="xs" color="mutedStrong">
              {ph.personId}
            </Text>
          </Box>
        </Flex>
      );
    },
  },
  {
    accessorKey: "lpaNumber",
    header: "LPA Number",
    cell: (info) => (
      <Text fontSize="sm" color="heading" fontWeight="semibold">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "planDescription",
    header: "Plan",
    cell: (info) => (
      <Text fontSize="sm" color="heading">
        {toTitleCase(String(info.getValue()))}
      </Text>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: (info) => (
      <Text fontSize="sm" color="heading">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "accountStatus",
    header: "Account Status",
    cell: (info) => (
      <OSPBadge type={statusBadgeType(String(info.getValue()))}>
        {toTitleCase(String(info.getValue()))}
      </OSPBadge>
    ),
  },
  {
    accessorKey: "terminationStatus",
    header: "Termination Status",
    // Filtered by TerminationStatusFilter instead.
    enableColumnFilter: false,
    cell: (info) => (
      <OSPBadge type={info.getValue() === NOT_TERMINATED ? "success" : "danger"}>
        {toTitleCase(String(info.getValue()))}
      </OSPBadge>
    ),
  },
  {
    accessorKey: "effectivityDate",
    header: "Effectivity",
    cell: (info) => (
      <Text fontSize="sm" color="mutedStrong">
        {formatDate(info.getValue() as Date)}
      </Text>
    ),
  },
  {
    accessorKey: "installmentNo",
    header: "Installment No.",
    cell: ({ row }) => {
      const ph = row.original;
      const { total, progress } = installmentProgress(ph);
      return (
        <Box width="full" px={2}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="xs" color="mutedStrong">
              {ph.installmentNo} / {total}
            </Text>
            <Text fontSize="xs" color="mutedStrong" fontWeight="semibold">
              {progress}%
            </Text>
          </Flex>
          <Box h="5px" borderRadius="full" bg="hairline">
            <Box
              h="full"
              borderRadius="full"
              bg="var(--chakra-colors-primary)"
              w={`${progress}%`}
              transition="width 0.4s ease"
            />
          </Box>
        </Box>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: (info) => (
      <Text fontSize="sm" color="mutedStrong">
        {formatDate(info.getValue() as Date)}
      </Text>
    ),
  },
];

export function PlanholderListTable({ status }: { status: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Search and termination status live in the URL and nowhere else, so
  // coming back from a profile restores them.
  const searchParams = useSearchParams();
  const search = searchParams.get(LIST_PARAMS.search) ?? "";
  const terminationStatus =
    searchParams.get(LIST_PARAMS.terminationStatus) ?? "";

  const { data, isLoading, error, refetch } = usePlanholderSearch(search);

  const terminationStatuses = React.useMemo(
    () => [...new Set(data.map((ph) => ph.terminationStatus))].sort(),
    [data],
  );

  const rows = React.useMemo(
    () =>
      data.filter(
        (ph) =>
          (status === "All" || ph.accountStatus === status) &&
          (!terminationStatus || ph.terminationStatus === terminationStatus),
      ),
    [data, status, terminationStatus],
  );

  // Mobile reveals the cards a batch at a time; a new filter starts over.
  const [visibleCount, setVisibleCount] = React.useState(PLANHOLDER_PAGE_SIZE);
  React.useEffect(() => {
    setVisibleCount(PLANHOLDER_PAGE_SIZE);
  }, [status, search, terminationStatus]);
  const handleLoadMore = React.useCallback(() => {
    setVisibleCount((n) => n + PLANHOLDER_PAGE_SIZE);
  }, []);

  const openProfile = React.useCallback(
    (row: PlanholderLookup) => router.push(planholderProfileHref(row)),
    [router],
  );

  const terminationFilter = (
    <TerminationStatusFilter
      value={terminationStatus}
      onChange={(value) =>
        replaceListParam(LIST_PARAMS.terminationStatus, value)
      }
      statuses={terminationStatuses}
    />
  );

  const heading = (
    <>
      <Text
        fontWeight="semibold"
        fontSize="lg"
        color="primaryHover"
        lineHeight={1.2}
      >
        {toTitleCase(status)} Accounts
      </Text>
      <Text fontSize="sm" color="mutedStrong">
        Search and filter planholders based on your criteria.
      </Text>
    </>
  );

  if (isLoading) return <PlanholderListSkeleton />;
  if (error) return <ErrorStateCard onRetry={refetch} />;

  if (isMobile) {
    return (
      <PlanholderCardList
        rows={rows.slice(0, visibleCount)}
        totalCount={rows.length}
        search={search}
        onSearchChange={(value) => replaceListParam(LIST_PARAMS.search, value)}
        onLoadMore={handleLoadMore}
        hasMore={visibleCount < rows.length}
        isLoadingMore={false}
        onOpen={openProfile}
        header={
          <>
            {heading}
            <Box mt={3}>{terminationFilter}</Box>
          </>
        }
      />
    );
  }

  return (
    <Box
      w="full"
      pb={{ base: 2, sm: 4 }}
      color="heading"
      p={3}
      borderRadius="sm"
      boxShadow="sm"
      bg="surface"
    >
      <DataTable<PlanholderLookup>
        columns={planholderColumns}
        data={rows}
        getRowId={(row) => row.lpaNumber}
        defaultPageSize={PLANHOLDER_PAGE_SIZE}
        onRowClick={openProfile}
        size="sm"
        emptyState="No planholders found."
        headerContent={heading}
        headerActions={terminationFilter}
        features={{
          search: true,
          filtering: true,
          sorting: true,
          infiniteScroll: true,
          pagination: false,
          showToolbarPagination: false,
          columnToggle: true,
          selection: false,
          detailSidebar: false,
        }}
      />
    </Box>
  );
}
