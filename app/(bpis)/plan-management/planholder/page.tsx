"use client";

import Page from "@/claude components/layout/page/Page";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import type { OSPBadgeProps } from "@/components/common/badge/badge.types";
import {
  LuSearch,
  LuUser,
  LuCalendar,
  LuMapPin,
  LuHash,
  LuX,
  LuChevronRight,
} from "react-icons/lu";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PlanholderContactData } from "@/app/(bpis)/plan-management/data/planholder-contact.data";
import { ContactNumber } from "@/claude components/contact-number/contact-number";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

const PAGE_SIZE = 20;

function filterPlanholders(query: string) {
  const q = query.trim().toUpperCase();
  if (!q) return planholderLookup;
  return planholderLookup.filter(
    (ph) =>
      ph.lpaNumber.includes(q) ||
      ph.firstName.includes(q) ||
      ph.lastName.includes(q) ||
      ph.middleName.includes(q) ||
      ph.personId.includes(q),
  );
}

async function fetchPlanholderPage({
  pageParam,
  query,
}: {
  pageParam: number;
  query: string;
}) {
  await new Promise((r) => setTimeout(r, 300));
  const all = filterPlanholders(query);
  const start = (pageParam - 1) * PAGE_SIZE;
  return {
    items: all.slice(start, start + PAGE_SIZE),
    nextPage: start + PAGE_SIZE < all.length ? pageParam + 1 : undefined,
  };
}

function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "LAPSED":
      return "warning";
    case "TERMINATED":
      return "danger";
    case "FULLY PAID":
      return "info";
    default:
      return undefined;
  }
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: Date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "lapsed":
      return "orange";
    case "active":
      return "green";
    default:
      return "blue";
  }
};

const planholderColumns: ColumnDef<PlanholderLookup>[] = [
  {
    id: "planholder",
    header: "Planholder",
    accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
    cell: ({ row }) => {
      const ph = row.original;
      return (
        <Flex align="center" gap={3}>
          <Box
            p={2}
            borderRadius="full"
            bg="gray.100"
            flexShrink={0}
            color="gray.600"
          >
            <LuUser size={16} />
          </Box>
          <Box>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3">
              {toTitleCase(ph.firstName)} {toTitleCase(ph.lastName)}
            </Text>
            <Text fontSize="xs" color="gray.500">
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
      <Text fontSize="sm" color="gray.700" fontFamily="mono">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "planDescription",
    header: "Plan",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "accountStatus",
    header: "Status",
    cell: (info) => (
      <OSPBadge type={statusBadgeType(String(info.getValue()))}>
        {toTitleCase(String(info.getValue()))}
      </OSPBadge>
    ),
  },
  {
    accessorKey: "effectivityDate",
    header: "Effectivity",
    cell: (info) => (
      <Text fontSize="sm" color="gray.600">
        {formatDate(info.getValue() as Date)}
      </Text>
    ),
  },
];

export default function PlanholderSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["planholders", debouncedQuery],
      queryFn: ({ pageParam }) =>
        fetchPlanholderPage({
          pageParam: pageParam as number,
          query: debouncedQuery,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const planholders = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // Desktop table works over the full filtered dataset so its own
  // pagination/sorting can page through all matches (mobile keeps infinite scroll).
  const desktopPlanholders = useMemo(
    () => filterPlanholders(debouncedQuery),
    [debouncedQuery],
  );

  return (
    <Page.Root
      headerButton="menu"
      title="Planholder Profile"
      description="Find a planholder to view their profile."
      paddingBottom={{ base: "96px", md: 0 }}
    >
      <Page.MainContent>
        {/* Search bar — right-aligned on desktop */}
        <Page.Row>
          <Flex w="full" justify={{ base: "flex-start", md: "flex-end" }}>
            <HStack gap={0} maxW="460px" w="full">
              <Box
                flex={1}
                border="1.5px solid"
                borderColor={
                  query ? "var(--chakra-colors-primary-disabled)" : "gray.200"
                }
                borderRightWidth="0"
                borderLeftRadius="lg"
                bg="white"
                boxShadow="xs"
                overflow="hidden"
                transition="border-color 0.15s, box-shadow 0.15s"
                _hover={{
                  borderColor: query
                    ? "var(--chakra-colors-primary)"
                    : "gray.300",
                }}
                _focusWithin={{
                  borderColor: "var(--chakra-colors-primary)",
                  boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
                }}
                minH="10"
                display="flex"
                alignItems="center"
              >
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  placeholder="Search by LPA Number, Name, or Person ID..."
                  border="none"
                  bg="transparent"
                  boxShadow="none"
                  borderRadius="0"
                  px={3}
                  fontSize="sm"
                  color={query ? "gray.800" : "gray.700"}
                  fontWeight={query ? "medium" : "normal"}
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ boxShadow: "none", outline: "none" }}
                />

                {query && (
                  <Flex align="center" pr={2} flexShrink={0}>
                    <IconButton
                      aria-label="Clear search"
                      variant="ghost"
                      size="xs"
                      borderRadius="full"
                      color="gray.400"
                      _hover={{ bg: "gray.100", color: "gray.600" }}
                      onClick={() => setQuery("")}
                    >
                      <LuX size={12} />
                    </IconButton>
                  </Flex>
                )}
              </Box>

              <IconButton
                aria-label="Search"
                bg="var(--chakra-colors-primary)"
                color="white"
                borderLeftRadius="0"
                borderRightRadius="lg"
                h="10"
                minW="10"
                flexShrink={0}
                _hover={{ opacity: 0.88 }}
                _active={{ opacity: 0.75 }}
              >
                <LuSearch size={15} />
              </IconButton>
            </HStack>
          </Flex>
        </Page.Row>

        <Page.Row>
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <>
              {/* ── Mobile card list ── */}
              <Box display={{ base: "block", md: "none" }}>
                <VStack gap={3}>
                  {planholders.map((ph) => {
                    const mobile = PlanholderContactData.find(
                      (c) =>
                        c.lpaNumber === ph.lpaNumber && c.type === "MobileNo",
                    );

                    return (
                      <Box
                        key={ph.lpaNumber}
                        w="100%"
                        position="relative"
                        p={4}
                        borderRadius="2xl"
                        bg="white"
                        shadow="sm"
                        transition="all 0.25s ease"
                        _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() =>
                          router.push(
                            `/plan-management/planholder/${ph.personId}`,
                          )
                        }
                      >
                        {/* HEADER */}
                        <Flex justify="space-between" align="start" mb={3}>
                          <Flex align="center" gap={2}>
                            <Box p={2} borderRadius="full" bg="gray.100">
                              <LuUser size={18} />
                            </Box>
                            <Box>
                              <Text
                                fontWeight="bold"
                                fontSize="md"
                                lineHeight="1.2"
                              >
                                {toTitleCase(ph.firstName)}{" "}
                                {toTitleCase(ph.lastName)}
                              </Text>
                              <Flex
                                align="center"
                                gap={1}
                                fontSize="xs"
                                color="gray.500"
                              >
                                <LuHash size={12} />
                                <Text>{ph.personId}</Text>
                              </Flex>
                            </Box>
                          </Flex>

                          <Flex align="center" gap={2}>
                            <Box
                              w="2"
                              h="2"
                              borderRadius="full"
                              bg={getStatusColor(ph.accountStatus) + ".400"}
                              shadow="sm"
                            />
                            <Badge
                              colorPalette={getStatusColor(ph.accountStatus)}
                              variant="subtle"
                              px={2}
                              py={1}
                              fontSize="0.75rem"
                            >
                              {toTitleCase(ph.accountStatus)}
                            </Badge>
                          </Flex>
                        </Flex>

                        {/* QUICK INFO CHIPS */}
                        <Flex gap={2} wrap="wrap" mb={3}>
                          <Box
                            px={2}
                            py={1}
                            fontSize="xs"
                            borderRadius="full"
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <LuCalendar size={12} />
                            {ph.effectivityDate.toISOString().slice(0, 10)}
                          </Box>
                          <Box
                            px={2}
                            py={1}
                            fontSize="xs"
                            borderRadius="full"
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <LuMapPin size={12} />
                            {ph.branch}
                          </Box>
                        </Flex>

                        {/* PLAN DETAIL */}
                        <VStack
                          align="start"
                          gap={2}
                          fontSize="sm"
                          color="gray.600"
                          px={2}
                        >
                          <Flex align="center" gap={2}>
                            <LuHash size={14} />
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                LPA:
                              </Text>{" "}
                              {ph.lpaNumber}
                            </Text>
                          </Flex>
                          <Flex align="center" gap={2}>
                            <LuUser size={14} />
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Plan:
                              </Text>{" "}
                              {ph.planDescription}
                            </Text>
                          </Flex>
                        </VStack>

                        {/* CONTACT NUMBER */}
                        <ContactNumber contactNo={mobile?.value ?? ""} />

                        {/* FOOTER */}
                        <Flex justify="space-between" align="center" mt={2}>
                          <Text fontSize="xs" color="gray.400">
                            Tap to view profile
                          </Text>
                          <LuChevronRight color="#a1a1aa" />
                        </Flex>
                      </Box>
                    );
                  })}

                  {planholders.length === 0 && (
                    <Text
                      color="gray.500"
                      fontSize="sm"
                      textAlign="center"
                      py={6}
                    >
                      No planholders found.
                    </Text>
                  )}
                </VStack>

                {/* Infinite scroll sentinel (mobile only) */}
                <div ref={sentinelRef} />

                {isFetchingNextPage && (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" />
                  </Flex>
                )}
              </Box>

              {/* ── Desktop data table ── */}
              <Box display={{ base: "none", md: "block" }}>
                <DataTable<PlanholderLookup>
                  columns={planholderColumns}
                  data={desktopPlanholders}
                  getRowId={(row) => row.lpaNumber}
                  onRowClick={(row) =>
                    router.push(`/plan-management/planholder/${row.personId}`)
                  }
                  size="md"
                  emptyState="No planholders found."
                  features={{
                    search: false,
                    filtering: false,
                    sorting: true,
                    pagination: true,
                    columnToggle: true,
                    selection: false,
                    draggable: false,
                    detailSidebar: false,
                  }}
                />
              </Box>
            </>
          )}
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
