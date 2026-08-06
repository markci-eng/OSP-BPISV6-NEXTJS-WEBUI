"use client";

import {
  BrandedAvatar,
  DataTable,
  ErrorStateCard,
  OSPBadge,
  OSPBadgeProps,
  Page,
} from "osp-ui-kit";
import { refPosition } from "@/app/(bpis)/data/saleforce/sales-agent-data";
import type {
  Position,
  SalesAgent,
} from "@/app/(bpis)/data/saleforce/sales-agent-data";
import {
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
  LuMapPin,
  LuHash,
  LuX,
  LuBriefcase,
  LuChevronRight,
} from "react-icons/lu";
import {
  Crown,
  Landmark,
  UsersRound,
  UserCheck,
  User as UserIcon,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useAgentSearch } from "./hooks/useAgentSearch";
import { useInfiniteAgents } from "./hooks/useInfiniteAgents";
import { useDebounce } from "@/hooks/useDebounce";
import { SalesAgentListSkeleton } from "./components/SalesAgentListSkeleton";
import { mockAvatarUrl } from "@/lib/mock-avatar";

const POSITIONS: Position[] = ["RM", "BM", "STL", "SA2", "SA1"];

function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "resigned":
      return "danger";
    default:
      return undefined;
  }
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === "N/A") return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const agentColumns: ColumnDef<SalesAgent>[] = [
  {
    id: "agent",
    header: "Agent",
    accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <Flex align="center" gap={3}>
          <BrandedAvatar
            name={agent.firstName + " " + agent.lastName}
            imageUrl={mockAvatarUrl(agent.id)}
            ringed
            ringPadding="3px"
          />
          <Box>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3">
              {toTitleCase(agent.firstName)} {toTitleCase(agent.lastName)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {agent.id}
            </Text>
          </Box>
        </Flex>
      );
    },
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
    accessorKey: "position",
    header: "Position",
    cell: (info) => {
      const position = String(info.getValue());
      return (
        <Text fontSize="sm" color="gray.700">
          {refPosition[position] ?? position}
        </Text>
      );
    },
  },
  {
    accessorKey: "employeeStatus",
    header: "Status",
    cell: (info) => (
      <OSPBadge type={statusBadgeType(String(info.getValue()))}>
        {toTitleCase(String(info.getValue()))}
      </OSPBadge>
    ),
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
    cell: (info) => (
      <Text fontSize="sm" color="gray.600">
        {formatDate(String(info.getValue()))}
      </Text>
    ),
  },
];

export default function SalesAgentListPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [positionFilter, setPositionFilter] = useState<string>("All");
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
    useInfiniteAgents(debouncedQuery, positionFilter);

  const {
    data: searchFiltered,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useAgentSearch(debouncedQuery);

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

  const agents = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // Desktop table works over the full filtered dataset so its own
  // pagination/sorting can page through all matches (mobile keeps infinite scroll).
  const desktopAgents = useMemo(() => {
    if (positionFilter === "All") return searchFiltered;
    return searchFiltered.filter((a) => a.position === positionFilter);
  }, [searchFiltered, positionFilter]);

  // Summary counts reflect the current search text but not the position
  // filter itself, so every card shows how many records that position
  // would match against the active search.
  const summary = useMemo(() => {
    const counts = Object.fromEntries(
      POSITIONS.map((position) => [
        position,
        searchFiltered.filter((a) => a.position === position).length,
      ]),
    ) as Record<Position, number>;
    return { total: searchFiltered.length, ...counts };
  }, [searchFiltered]);

  const cards = useMemo(
    () => [
      {
        label: "All Agents",
        value: summary.total,
        filter: "All",
        sub: "All positions",
        icon: Users,
        accent: "blue",
      },
      {
        label: "RM",
        value: summary["RM"],
        filter: "RM",
        sub: "Regional Manager",
        icon: Crown,
        accent: "purple",
      },
      {
        label: "BM",
        value: summary["BM"],
        filter: "BM",
        sub: "Branch Manager",
        icon: Landmark,
        accent: "teal",
      },
      {
        label: "STL",
        value: summary["STL"],
        filter: "STL",
        sub: "Sales Team Leader",
        icon: UsersRound,
        accent: "cyan",
      },
      {
        label: "SA2",
        value: summary["SA2"],
        filter: "SA2",
        sub: "Sales Agent 2",
        icon: UserCheck,
        accent: "green",
      },
      {
        label: "SA1",
        value: summary["SA1"],
        filter: "SA1",
        sub: "Sales Agent 1",
        icon: UserIcon,
        accent: "orange",
      },
    ],
    [summary],
  );

  const renderCardContent = (card: (typeof cards)[number], i: number) => {
    const isActive = positionFilter === card.filter;
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
          setPositionFilter(card.filter);
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
      title="Sales Agent Profile"
      description="Find an agent to view their profile."
      paddingBottom={{ base: "96px", md: 0 }}
    >
      <Page.MainContent>
        {/* Position summary cards */}
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
                leak into positionFilter on desktop) */}
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
                    setPositionFilter(cards[details.page].filter);
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
            <SalesAgentListSkeleton />
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
                    placeholder="Search by ID, Name, Position, or Branch..."
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
                  {agents.map((agent) => (
                    <Box
                      key={agent.id}
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
                        router.push(`/sales-force/profile/${agent.id}`)
                      }
                    >
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
                              {toTitleCase(agent.firstName)}{" "}
                              {toTitleCase(agent.lastName)}
                            </Text>
                            <Flex
                              align="center"
                              gap={1}
                              fontSize="xs"
                              color="gray.500"
                            >
                              <LuHash size={12} />
                              <Text>{agent.id}</Text>
                            </Flex>
                          </Box>
                        </Flex>

                        <OSPBadge type={statusBadgeType(agent.employeeStatus)}>
                          {toTitleCase(agent.employeeStatus)}
                        </OSPBadge>
                      </Flex>

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
                          <LuBriefcase size={12} />
                          {agent.position}
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
                          {agent.branch}
                        </Box>
                      </Flex>

                      <Flex justify="space-between" align="center" mt={2}>
                        <Text fontSize="xs" color="gray.400">
                          Tap to view profile
                        </Text>
                        <LuChevronRight color="#a1a1aa" />
                      </Flex>
                    </Box>
                  ))}

                  {agents.length === 0 && (
                    <Text
                      color="gray.500"
                      fontSize="sm"
                      textAlign="center"
                      py={6}
                    >
                      No agents found.
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
                <DataTable<SalesAgent>
                  columns={agentColumns}
                  data={desktopAgents}
                  getRowId={(row) => row.id}
                  onRowClick={(row) =>
                    router.push(`/sales-force/profile/${row.id}`)
                  }
                  size="md"
                  emptyState="No agents found."
                  features={{
                    showToolbarPagination: true,
                    search: true,
                    filtering: true,
                    sorting: true,
                    pagination: true,
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
