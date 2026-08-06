"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Carousel,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Files,
  Pencil,
  XCircle,
} from "lucide-react";
import { RITF_REQUESTS } from "./data/data";
import type { RitfRequest, RitfStatus } from "./data/types";
import { ritfColumns } from "./components/ritf-columns";
import { BranchFilterMenu } from "../components/branch-filter-menu";
import { DataTable, Page, RowAction } from "osp-ui-kit";

// Both filters start unset: a branch must be picked before the cards report
// numbers, and a status card before the table lists anything.
type StatusFilter = RitfStatus | "All" | null;

/** Rows per page once the table pages. */
const PAGE_SIZE = 10;

/** Where the picked branch is parked while the user is away. */
const FILTERS_STORAGE_KEY = "pis:ritf:list-filters";

/** The card a returning user lands on, once their branch is restored. */
const DEFAULT_STATUS: StatusFilter = "PENDING";

/** Summary card order, so a restored status lines the mobile carousel up. */
const CARD_FILTER_ORDER: StatusFilter[] = [
  "All",
  "PENDING",
  "APPROVED",
  "DENIED",
];

const STATUS_OPTIONS: { label: string; value: RitfStatus }[] = [
  { label: "Approved", value: "APPROVED" },
  { label: "Denied", value: "DENIED" },
  { label: "Pending", value: "PENDING" },
];

export default function RitfPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>(null);
  const [branch, setBranch] = useState<string>("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselReady = useRef(false);

  // Editing a request unmounts this page, so the picked branch is kept for
  // the session — coming back from Edit RITF lands on that branch's Pending
  // card rather than the empty "select a branch" state.
  const filtersRestored = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
      if (saved) {
        const { branch: savedBranch } = JSON.parse(saved);
        if (savedBranch) {
          setBranch(savedBranch);
          setStatus(DEFAULT_STATUS);
          const cardIdx = CARD_FILTER_ORDER.indexOf(DEFAULT_STATUS);
          if (cardIdx >= 0) setCarouselIdx(cardIdx);
        }
      }
    } catch {
      // A blocked or malformed store just means the filters start empty.
    }
    filtersRestored.current = true;
  }, []);

  useEffect(() => {
    // Skip the first pass so the empty defaults don't overwrite what was saved
    // before the restore above has run.
    if (!filtersRestored.current) return;
    try {
      sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({ branch }));
    } catch {
      // Nothing to do — the list simply won't be remembered.
    }
  }, [branch]);

  /**
   * Picking a branch lands on the default card, so records show straight away
   * instead of asking for a second click. An explicit status choice is left
   * alone when switching between branches.
   */
  const handleBranchChange = (next: string) => {
    setBranch(next);
    if (!next || status !== null) return;
    setStatus(DEFAULT_STATUS);
    const cardIdx = CARD_FILTER_ORDER.indexOf(DEFAULT_STATUS);
    if (cardIdx >= 0) setCarouselIdx(cardIdx);
  };

  // Only mount the mobile carousel on mobile viewports. When hidden with
  // `display: none` on desktop it can't measure its slides and re-emits
  // onPageChange(0), which would clobber the Pending default with "All".
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const branchSelected = branch !== "";
  const recordsReady = branchSelected && status !== null;

  const statusLabel =
    status === "All"
      ? "All"
      : (STATUS_OPTIONS.find((s) => s.value === status)?.label ?? "");

  const branchOptions = useMemo(
    () => Array.from(new Set(RITF_REQUESTS.map((r) => r.reqBranch))).sort(),
    [],
  );

  // Cards report counts for the selected branch only, and stay blank until
  // one is picked.
  const summary = useMemo(() => {
    const scoped = branchSelected
      ? RITF_REQUESTS.filter((r) => r.reqBranch === branch)
      : [];
    const total = scoped.length;
    const pending = scoped.filter((r) => r.status === "PENDING").length;
    const approved = scoped.filter((r) => r.status === "APPROVED").length;
    const denied = scoped.filter((r) => r.status === "DENIED").length;
    return { total, pending, approved, denied };
  }, [branch, branchSelected]);

  // Records need both filters — no branch or no status card means no rows.
  const filteredData = useMemo(() => {
    if (!branchSelected || status === null) return [];
    return RITF_REQUESTS.filter(
      (r) =>
        r.reqBranch === branch && (status === "All" || r.status === status),
    );
  }, [status, branch, branchSelected]);

  const rowActions = useMemo<RowAction<RitfRequest>[]>(
    () => [
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: (row) => router.push(`/accounts-management/ritf/${row.id}`),
      },
    ],
    [router],
  );

  const cards = useMemo(
    () => [
      {
        label: "Total Requests",
        value: summary.total,
        filter: "All" as StatusFilter,
        sub: "All requests",
        icon: Files,
        accent: "blue",
      },
      {
        label: "Pending",
        value: summary.pending,
        filter: "PENDING" as StatusFilter,
        sub: "Awaiting review",
        icon: Clock,
        accent: "orange",
      },
      {
        label: "Approved",
        value: summary.approved,
        filter: "APPROVED" as StatusFilter,
        sub: "Completed",
        icon: CheckCircle,
        accent: "green",
      },
      {
        label: "Denied",
        value: summary.denied,
        filter: "DENIED" as StatusFilter,
        sub: "Denied",
        icon: XCircle,
        accent: "red",
      },
    ],
    [summary],
  );

  const renderCardContent = (card: (typeof cards)[number], i: number) => {
    const isActive = status === card.filter;
    // Until a branch is picked there is nothing to count, so the cards are
    // shown muted and inert.
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
        cursor={branchSelected ? "pointer" : "not-allowed"}
        opacity={branchSelected ? 1 : 0.55}
        transform={isActive ? "translateY(-2px)" : "none"}
        onClick={() => {
          if (!branchSelected) return;
          setStatus(card.filter);
          setCarouselIdx(i);
        }}
        transition="all 0.15s ease"
        _hover={
          branchSelected
            ? {
                bg: `${card.accent}.100`,
                borderColor: `${card.accent}.400`,
              }
            : undefined
        }
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
              {branchSelected ? card.value : "—"}
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
      title="RITF"
      description="Reinstatement / Transfer requests."
      headerButton="menu"
    >
      <Page.ToolContent>
        <Box display={{ base: "none", md: "block" }}>
          <BranchFilterMenu
            value={branch}
            onChange={handleBranchChange}
            options={branchOptions}
            w="260px"
            includeAllOption={false}
            placeholder="Select Branch"
          />
        </Box>
      </Page.ToolContent>

      <Page.MainContent>
        {/* ── Branch filter (mobile) ── */}
        <Box display={{ base: "block", md: "none" }}>
          <BranchFilterMenu
            value={branch}
            onChange={handleBranchChange}
            options={branchOptions}
            w="full"
            includeAllOption={false}
            placeholder="Select Branch"
          />
        </Box>

        {/* ── Summary cards ── */}
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
                // Swiping is only a status choice once a branch is set.
                if (branchSelected) setStatus(cards[details.page].filter);
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

        {/* ── List ── */}
        <DataTable
          title="RITF Requests"
          description={
            recordsReady
              ? `Showing ${statusLabel.toLowerCase()} requests for ${branch}.`
              : "Select a branch and a status card to list records."
          }
          emptyState={
            recordsReady
              ? `No ${statusLabel.toLowerCase()} requests for ${branch}.`
              : "Please select a branch and status first to show the records."
          }
          data={filteredData}
          columns={ritfColumns}
          getRowId={(row) => row.id}
          onRowClick={(row) => router.push(`/accounts-management/ritf/${row.id}`)}
          rowActions={rowActions}
          features={{
            search: true,
            filtering: true,
            sorting: true,
            // Page the table once a selection returns more than one page's
            // worth; below that the toolbar keeps its plain results count.
            // The kit's page controls are desktop-only, so on mobile the
            // accordion lists the whole selection instead of hiding rows
            // behind arrows the user can't reach.
            pagination: !isMobile,
            showToolbarPagination: !isMobile && filteredData.length > PAGE_SIZE,
            columnToggle: true,
            selection: false,
            detailSidebar: false,
          }}
          defaultPageSize={PAGE_SIZE}
          mobileConfig={{
            viewMode: "accordion",
            primaryField: "lpaNo",
            secondaryField: "planholderName",
            badgeField: "status",
            visibleFields: [
              "planType",
              "transactionType",
              "balance",
              "dueDate",
              "requestDate",
              "requester",
            ],
            badgeColorMap: {
              PENDING: "orange",
              APPROVED: "green",
              DENIED: "red",
            },
          }}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
