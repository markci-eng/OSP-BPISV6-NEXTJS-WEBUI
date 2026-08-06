"use client";

import {
  BrandedAvatar,
  ContactNumber,
  DataTable,
  ErrorStateCard,
  OSPBadge,
  OSPBadgeProps,
  Page,
} from "osp-ui-kit";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import {
  Badge,
  Box,
  Carousel,
  Flex,
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuSearch,
  LuUser,
  LuCalendar,
  LuMapPin,
  LuHash,
  LuX,
  LuChevronRight,
} from "react-icons/lu";
import {
  Users,
  CheckCircle2,
  BadgeCheck,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanholderContactData } from "@/app/(bpis)/plan-management/data/planholder-contact.data";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef } from "@tanstack/react-table";
import { usePlanholderSearch } from "./hooks/usePlanholderSearch";
import { useInfinitePlanholders } from "./hooks/useInfinitePlanholders";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { PlanholderListSkeleton } from "./components/PlanholderListSkeleton";

const ACCOUNT_STATUSES = [
  "ACTIVE",
  "FULLY PAID",
  "LAPSED",
  "NEW SALES",
  "REINSTATED",
] as const;

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
    case "NEW SALES":
      return "info";
    case "REINSTATED":
      return "success";
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
          <BrandedAvatar
            name={ph.firstName + " " + ph.lastName}
            imageUrl={mockAvatarUrl(ph.personId)}
            ringed
          />
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
  const debouncedQuery = useDebounce(query, 300);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselReady = useRef(false);

  // Only mount the mobile carousel on mobile viewports. When hidden with
  // `display: none` on desktop it can't measure its slides and re-emits
  // onPageChange(0), which would clobber the current filter with "All".
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePlanholders(debouncedQuery, statusFilter);

  const {
    data: searchFiltered,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = usePlanholderSearch(debouncedQuery);

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
  const desktopPlanholders = useMemo(() => {
    if (statusFilter === "All") return searchFiltered;
    return searchFiltered.filter((ph) => ph.accountStatus === statusFilter);
  }, [searchFiltered, statusFilter]);

  // Summary counts reflect the current search text but not the status
  // filter itself, so every card shows how many records that status
  // would match against the active search.
  const summary = useMemo(() => {
    const counts = Object.fromEntries(
      ACCOUNT_STATUSES.map((status) => [
        status,
        searchFiltered.filter((ph) => ph.accountStatus === status).length,
      ]),
    ) as Record<(typeof ACCOUNT_STATUSES)[number], number>;
    return { total: searchFiltered.length, ...counts };
  }, [searchFiltered]);

  const cards = useMemo(
    () => [
      {
        label: "All Planholders",
        value: summary.total,
        filter: "All",
        sub: "All planholders",
        icon: Users,
        accent: "blue",
      },
      {
        label: "Active",
        value: summary["ACTIVE"],
        filter: "ACTIVE",
        sub: "Active plans",
        icon: CheckCircle2,
        accent: "green",
      },
      {
        label: "Fully Paid",
        value: summary["FULLY PAID"],
        filter: "FULLY PAID",
        sub: "Fully paid plans",
        icon: BadgeCheck,
        accent: "cyan",
      },
      {
        label: "Lapsed",
        value: summary["LAPSED"],
        filter: "LAPSED",
        sub: "Lapsed plans",
        icon: AlertTriangle,
        accent: "orange",
      },
      {
        label: "New Sales",
        value: summary["NEW SALES"],
        filter: "NEW SALES",
        sub: "New sales",
        icon: Sparkles,
        accent: "purple",
      },
      {
        label: "Reinstated",
        value: summary["REINSTATED"],
        filter: "REINSTATED",
        sub: "Reinstated plans",
        icon: RotateCcw,
        accent: "teal",
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
            display={{ base: "none", md: "flex" }}
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
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
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
    <Page.Root
      headerButton="menu"
      title="Planholder Profile"
      description="Find a planholder to view their profile."
      paddingBottom={{ base: "96px", md: 0 }}
    >
      <Page.MainContent>
        {/* Account status summary cards */}
        <Page.Row>
          <Flex direction="column" gap={4} w="full">
            {/* Desktop: grid */}
            <SimpleGrid
              columns={{ md: 3, xl: 6 }}
              gap={3}
              display={{ base: "none", md: "grid" }}
            >
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
                    // hidden on desktop), which would clobber the default filter. Skip
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
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Previous"
                      >
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
          </Flex>
        </Page.Row>

        <Page.Row>
          {isLoading || isSearchLoading ? (
            <PlanholderListSkeleton />
          ) : searchError ? (
            <ErrorStateCard onRetry={refetchSearch} />
          ) : (
            <>
              {/* ── Mobile card list ── */}
              <Box display={{ base: "block", md: "none" }}>
                {/* Mobile search — the desktop DataTable has its own search bar,
                    so this only shows on mobile where the hand-rolled card list
                    is used instead of the table. */}
                <Flex
                  w="full"
                  mb={3}
                  align="center"
                  gap={2}
                  h="11"
                  pl={3}
                  pr={1.5}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="15px"
                  boxShadow="xs"
                  transition="border-color 0.15s, box-shadow 0.15s"
                  _focusWithin={{
                    borderColor: "var(--chakra-colors-primary)",
                    boxShadow:
                      "0 0 0 3px var(--chakra-colors-primary-disabled)",
                  }}
                >
                  <Box
                    as={LuSearch}
                    color="gray.400"
                    flexShrink={0}
                    boxSize={4}
                  />

                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    placeholder="Search by LPA Number, Name, or Person ID..."
                    flex={1}
                    border="none"
                    bg="transparent"
                    boxShadow="none"
                    borderRadius="0"
                    px={0}
                    h="full"
                    fontSize="sm"
                    color="gray.800"
                    fontWeight={query ? "medium" : "normal"}
                    _placeholder={{ color: "gray.400", fontWeight: "normal" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                  />

                  {query && (
                    <IconButton
                      aria-label="Clear search"
                      variant="ghost"
                      size="xs"
                      borderRadius="full"
                      color="gray.400"
                      flexShrink={0}
                      _hover={{ bg: "gray.100", color: "gray.600" }}
                      onClick={() => setQuery("")}
                    >
                      <LuX size={14} />
                    </IconButton>
                  )}
                </Flex>

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
                            `/plan-management/planholder/${ph.personId}?lpaNumber=${encodeURIComponent(ph.lpaNumber)}`,
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
                    router.push(
                      `/plan-management/planholder/${row.personId}?lpaNumber=${encodeURIComponent(row.lpaNumber)}`,
                    )
                  }
                  size="md"
                  emptyState="No planholders found."
                  features={{
                    search: true,
                    filtering: true,
                    sorting: true,
                    infiniteScroll: true,
                    showToolbarPagination: false,
                    columnToggle: true,
                    selection: false,
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
