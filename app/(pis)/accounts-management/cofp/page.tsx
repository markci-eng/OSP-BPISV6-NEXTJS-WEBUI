"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Carousel,
  Flex,
  Grid,
  IconButton,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  Archive,
  Ban,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  FilePlus,
  FileText,
  PackageCheck,
  Printer,
  Repeat,
  Search,
  Send,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import ActionButtons, {
  type ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import { PrimaryMdButton, SecondarySmButton } from "st-peter-ui";

import { COFP_MEMOS, COFP_REQUESTS } from "./data/data";
import type { CofpRequest, CofpStatus } from "./data/types";
import { cofpColumns } from "./components/cofp-columns";
import { CofpPrintModal } from "./components/cofp-print-modal";
import { BranchFilterMenu } from "../components/branch-filter-menu";
import { DataTable, OSPBadge, Page } from "osp-ui-kit";

// Both filters start unset: a branch must be picked before the cards report
// numbers, and a status card before the table lists anything.
type StatusFilter = CofpStatus | null;

/** Rows per page once the table pages. */
const PAGE_SIZE = 10;

/** Where the picked branch is parked while the user is away. */
const FILTERS_STORAGE_KEY = "pis:cofp:list-filters";

/** The card a returning user lands on, once their branch is restored. */
const DEFAULT_STATUS: StatusFilter = "FOR_PRINTING";

/** Summary card order, so a restored status lines the mobile carousel up. */
const CARD_FILTER_ORDER: StatusFilter[] = [
  "FOR_PRINTING",
  "PRINTED",
  "RELEASED",
  "CANCELLED",
  "CONFISCATED",
  "RETURNED",
];

type CofpAction = Extract<ActionButtonItem, { type?: "action" }>;

// COFP request types behind the header's "More" ellipsis. None have a
// destination yet, so each reports back instead of navigating.
const OVERFLOW_ACTIONS: CofpAction[] = [
  {
    label: "Special Request",
    description: "Raise a COFP outside the regular batch",
    icon: FilePlus,
    onClick: () => toast.info("Special Request is not wired up yet."),
  },
  {
    label: "Batch Transmittal",
    description: "Transmit printed certificates to a branch",
    icon: Send,
    onClick: () => toast.info("Batch Transmittal is not wired up yet."),
  },
  {
    label: "Replacement",
    description: "Reissue a lost or damaged certificate",
    icon: Repeat,
    onClick: () => toast.info("Replacement is not wired up yet."),
  },
  {
    label: "Old COFP",
    description: "Look up certificates issued previously",
    icon: Archive,
    onClick: () => toast.info("Old COFP is not wired up yet."),
  },
];

// Desktop surfaces the first three as buttons; every action still lives in the
// overflow drawer, so nothing is reachable only at one breakpoint.
const PRIMARY_ACTIONS = OVERFLOW_ACTIONS.slice(0, 3);

/** "1900-01-01" stands in for "not transmitted yet". */
function formatMemoDate(value?: string) {
  if (!value || value === "1900-01-01") return "—";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

const STATUS_OPTIONS: { label: string; value: CofpStatus }[] = [
  { label: "For Printing", value: "FOR_PRINTING" },
  { label: "Printed", value: "PRINTED" },
  { label: "Released", value: "RELEASED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Confiscated", value: "CONFISCATED" },
  { label: "Returned", value: "RETURNED" },
];

export default function CofpPage() {
  const [status, setStatus] = useState<StatusFilter>(null);
  const [branch, setBranch] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<CofpRequest[]>([]);
  const [printOpen, setPrintOpen] = useState(false);
  // Which transmittal memo is open in the Printed queue, if any.
  const [selectedMemo, setSelectedMemo] = useState<string | null>(null);
  const [memoQuery, setMemoQuery] = useState("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselReady = useRef(false);

  // Printing unmounts this page, so the picked branch is kept for the session
  // — coming back lands on that branch's For Printing card rather than the
  // empty "select a branch" state.
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

  // A different branch or status is a different list, so nothing stays picked.
  // The table is keyed on the same pair below, which clears its own checkboxes.
  useEffect(() => {
    setSelectedRows([]);
    setSelectedMemo(null);
    setMemoQuery("");
  }, [branch, status]);

  const printSelected = () => setPrintOpen(true);

  const confiscateSelected = () =>
    toast.info(
      `Confiscating ${selectedRows.length} certificate${
        selectedRows.length === 1 ? "" : "s"
      } is not wired up yet.`,
    );

  const tagAsReturned = () =>
    toast.info(
      `Tagging ${selectedRows.length} certificate${
        selectedRows.length === 1 ? "" : "s"
      } as returned is not wired up yet.`,
    );

  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? "";

  const branchOptions = useMemo(
    () => Array.from(new Set(COFP_REQUESTS.map((r) => r.branchCode))).sort(),
    [],
  );

  // Cards report counts for the selected branch only, and stay blank until
  // one is picked.
  const summary = useMemo(() => {
    const scoped = branchSelected
      ? COFP_REQUESTS.filter((r) => r.branchCode === branch)
      : [];
    const countOf = (status: CofpStatus) =>
      scoped.filter((r) => r.status === status).length;
    return {
      forPrinting: countOf("FOR_PRINTING"),
      printed: countOf("PRINTED"),
      released: countOf("RELEASED"),
      cancelled: countOf("CANCELLED"),
      confiscated: countOf("CONFISCATED"),
      returned: countOf("RETURNED"),
    };
  }, [branch, branchSelected]);

  // Printed certificates are grouped into transmittal memos. Both lists stay on
  // screen: the memos narrow the certificates below rather than replacing them.
  const isPrintedQueue = status === "PRINTED";

  const memos = useMemo(() => {
    if (!branchSelected) return [];
    return COFP_MEMOS.filter((memo) => memo.branchCode === branch);
  }, [branch, branchSelected]);

  // Records need both filters — no branch or no status card means no rows.
  const filteredData = useMemo(() => {
    if (!branchSelected || status === null) return [];
    return COFP_REQUESTS.filter(
      (r) =>
        r.branchCode === branch &&
        r.status === status &&
        (selectedMemo === null || r.memoNo === selectedMemo),
    );
  }, [status, branch, branchSelected, selectedMemo]);

  const cards = useMemo(
    () => [
      {
        label: "For Printing",
        value: summary.forPrinting,
        filter: "FOR_PRINTING" as StatusFilter,
        sub: "Queued for printing",
        icon: FileOutput,
        accent: "blue",
      },
      {
        label: "Printed",
        value: summary.printed,
        filter: "PRINTED" as StatusFilter,
        sub: "Certificate printed",
        icon: Printer,
        accent: "purple",
      },
      {
        label: "Released",
        value: summary.released,
        filter: "RELEASED" as StatusFilter,
        sub: "Handed to planholder",
        icon: PackageCheck,
        accent: "green",
      },
      {
        label: "Cancelled",
        value: summary.cancelled,
        filter: "CANCELLED" as StatusFilter,
        sub: "Request cancelled",
        icon: XCircle,
        accent: "red",
      },
      {
        label: "Confiscated",
        value: summary.confiscated,
        filter: "CONFISCATED" as StatusFilter,
        sub: "Taken back by branch",
        icon: Ban,
        accent: "orange",
      },
      {
        label: "Returned",
        value: summary.returned,
        filter: "RETURNED" as StatusFilter,
        sub: "Sent back to office",
        icon: Undo2,
        accent: "teal",
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

  const activeMemo = memos.find((memo) => memo.memoNo === selectedMemo);

  // Matches the memo number, its transmit date, and the words shown on the row
  // ("transmitted" / "not yet"), so searching works on whatever is visible.
  const visibleMemos = useMemo(() => {
    const query = memoQuery.trim().toLowerCase();
    if (!query) return memos;
    return memos.filter((memo) =>
      [
        memo.memoNo,
        formatMemoDate(memo.transmitDate),
        memo.isTransmitted ? "transmitted" : "not yet transmitted",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [memos, memoQuery]);

  const isSearchingMemos = memoQuery.trim() !== "";

  const requestsTable = (
    <DataTable
            key={`${branch}-${status}-${selectedMemo ?? "all"}`}
            title={
              isPrintedQueue ? (
                <Flex align="center" justify="space-between" gap={3} w="full">
                  <Text fontWeight="600" fontSize="sm" color="gray.800">
                    COFP Requests
                  </Text>
                  <Flex align="center" gap={2} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.800"
                      fontFamily={selectedMemo ? "mono" : undefined}
                      lineClamp={1}
                    >
                      {selectedMemo ?? "All Printed Certificates"}
                    </Text>
                    <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">
                      {filteredData.length} cert
                      {filteredData.length === 1 ? "" : "s"}
                    </Text>
                    {activeMemo && (
                      <OSPBadge
                        type={activeMemo.isTransmitted ? "success" : "warning"}
                      >
                        {activeMemo.isTransmitted ? "TRANSMITTED" : "NOT YET"}
                      </OSPBadge>
                    )}
                  </Flex>
                </Flex>
              ) : (
                "COFP Requests"
              )
            }
            description={
              recordsReady
                ? `Showing ${statusLabel.toLowerCase()} requests for ${branch}.`
                : "Select a branch and a status card to list records."
            }
            data={filteredData}
            columns={cofpColumns}
            getRowId={(row) => row.id}
            emptyState={
              recordsReady
                ? `No ${statusLabel.toLowerCase()} requests for ${branch}.`
                : "Please select a branch and status first to show the records."
            }
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
              // Only the batch-actionable queues carry row checkboxes — printing,
              // confiscation and returning. The kit renders them as a sticky
              // first cell, ahead of LPA No.
              selection:
                status === "FOR_PRINTING" ||
                status === "RELEASED" ||
                status === "CONFISCATED",
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
                "cfpNumber",
                "cfpDate",
                "totalAmountPaid",
                "requestDate",
                "requester",
              ],
              badgeColorMap: {
                FOR_PRINTING: "blue",
                PRINTED: "purple",
                RELEASED: "green",
                CANCELLED: "red",
                CONFISCATED: "orange",
                RETURNED: "teal",
              },
            }}
            onSelectionChange={setSelectedRows}
          />
  );

  /** One row in the memo rail — the active one carries the primary tint. */
  const memoRow = ({
    key,
    label,
    caption,
    count,
    active,
    onSelect,
  }: {
    key: string;
    label: string;
    caption: string;
    count: number;
    active: boolean;
    onSelect: () => void;
  }) => (
    <Flex
      as="button"
      key={key}
      onClick={onSelect}
      align="center"
      gap={3}
      w="full"
      px={3}
      py={2.5}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={active ? "var(--chakra-colors-primary)" : "transparent"}
      bg={active ? "var(--chakra-colors-primary-disabled)/25" : "transparent"}
      cursor="pointer"
      textAlign="start"
      transition="background 0.15s, border-color 0.15s"
      _hover={{ bg: "var(--chakra-colors-primary-disabled)/20" }}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="34px"
        flexShrink={0}
        borderRadius="lg"
        bg={active ? "var(--chakra-colors-primary)" : "gray.100"}
        color={active ? "white" : "gray.500"}
      >
        <FileText size={16} />
      </Flex>
      <Box minW={0} flex="1">
        <Text
          fontSize="sm"
          fontWeight="600"
          fontFamily="mono"
          color={active ? "var(--chakra-colors-primary)" : "gray.700"}
          lineClamp={1}
        >
          {label}
        </Text>
        <Text fontSize="10px" color="gray.400" lineClamp={1}>
          {caption}
        </Text>
      </Box>
      <Text fontSize="xs" fontWeight="700" color="gray.500" flexShrink={0}>
        {count}
      </Text>
    </Flex>
  );

  /**
   * Printed queue as master/detail: the memo rail on the left picks which
   * certificates the panel on the right lists.
   */
  const memoWorkspace = (
    // No `alignItems="start"`: both columns stretch, so the rail takes its
    // height from the certificate table beside it — a full page of 10 rows.
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", lg: "300px minmax(0, 1fr)" }}
      gap={5}
    >
      {/* ── Memo rail ── */}
      <Box
        bg="bg"
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius="2xl"
        shadow="xs"
        p={4}
        display="flex"
        flexDirection="column"
        // Capped at roughly the certificate table's height with a full page of
        // 10 rows, so 20 memos scroll inside instead of stretching the row.
        maxH={{ base: "420px", lg: "600px" }}
        overflow="hidden"
      >
        <Text fontSize="md" fontWeight="bold" color="gray.800">
          Memo List
        </Text>
        <Text fontSize="xs" color="gray.400" mb={3}>
          Click a memo to view records
        </Text>

        <Flex
          align="center"
          gap={2}
          mb={3}
          px={3}
          h="36px"
          flexShrink={0}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          bg="bg"
          transition="border-color 0.15s, box-shadow 0.15s"
          _focusWithin={{
            borderColor: "var(--chakra-colors-primary)",
            boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
          }}
        >
          <Box color="gray.400" flexShrink={0} display="flex">
            <Search size={14} />
          </Box>
          <Input
            value={memoQuery}
            onChange={(e) => setMemoQuery(e.currentTarget.value)}
            placeholder="Search memo no..."
            flex="1"
            h="full"
            px={0}
            border="none"
            bg="transparent"
            borderRadius="0"
            fontSize="sm"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            _focusVisible={{ boxShadow: "none", outline: "none" }}
          />
          {memoQuery && (
            <Box
              as="button"
              onClick={() => setMemoQuery("")}
              color="gray.400"
              flexShrink={0}
              display="flex"
              aria-label="Clear memo search"
              _hover={{ color: "gray.600" }}
            >
              <X size={14} />
            </Box>
          )}
        </Flex>

        {/* Fills the card and scrolls inside it, so a branch with many memos
            never makes this column taller than the table beside it. */}
        <Flex direction="column" gap={1} flex="1" minH={0} overflowY="auto">
          {/* Hidden while searching so the results stand on their own */}
          {!isSearchingMemos &&
            memoRow({
              key: "all",
              label: "All Memos",
              caption: `${memos.length} memo${memos.length === 1 ? "" : "s"}`,
              count: memos.reduce(
                (sum, memo) => sum + memo.certificateCount,
                0,
              ),
              active: selectedMemo === null,
              onSelect: () => setSelectedMemo(null),
            })}

          {visibleMemos.map((memo) =>
            memoRow({
              key: memo.memoNo,
              label: memo.memoNo,
              caption: memo.isTransmitted
                ? `Transmitted ${formatMemoDate(memo.transmitDate)}`
                : "Not yet transmitted",
              count: memo.certificateCount,
              active: memo.memoNo === selectedMemo,
              onSelect: () => setSelectedMemo(memo.memoNo),
            }),
          )}

          {visibleMemos.length === 0 && (
            <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
              {memoQuery
                ? `No memo matches "${memoQuery}".`
                : `No memos for ${branch}.`}
            </Text>
          )}
        </Flex>
      </Box>

      {/* ── Certificates for whichever memo is active ── */}
      <Box
        bg="bg"
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius="2xl"
        shadow="xs"
        p={{ base: 3, md: 4 }}
      >
        {requestsTable}
      </Box>
    </Grid>
  );


  return (
    <Page.Root
      title="COFP"
      description="Certificate of full payment."
      headerButton="menu"
    >
      <Page.ToolContent>
        {/* Below lg the actions stay in the page header; from lg up they move
            down to sit on the branch filter's row. */}
        <Box display={{ base: "block", lg: "none" }}>
          <ActionButtons buttons={OVERFLOW_ACTIONS} title="COFP Requests" />
        </Box>
      </Page.ToolContent>

      <Page.MainContent>
        {/* ── Filter row — branch on the left, actions pushed to the right ── */}
        <Flex align="center" gap={3} w="full">
          <BranchFilterMenu
            value={branch}
            onChange={handleBranchChange}
            options={branchOptions}
            w={{ base: "full", lg: "260px" }}
            includeAllOption={false}
            placeholder="Select Branch"
          />

          {/* Desktop — the first three requests as buttons, then the "More"
              ellipsis holding all four, matching the Planholder Profile header */}
          <Flex
            display={{ base: "none", lg: "flex" }}
            align="center"
            gap={2}
            ml="auto"
          >
            {PRIMARY_ACTIONS.map((action) => (
              <SecondarySmButton key={action.label} onClick={action.onClick}>
                <action.icon size={16} />
                {action.label}
              </SecondarySmButton>
            ))}
            <ActionButtons buttons={OVERFLOW_ACTIONS} title="COFP Requests" />
          </Flex>
        </Flex>

        {/* ── Summary cards ── */}
        {/* Desktop: 4-column grid */}
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
                // hidden on desktop), which would select a status before the user
                // picked one. Skip that first firing and only react to real page
                // changes afterward.
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
        {isPrintedQueue ? memoWorkspace : requestsTable}

        {/* Batch print — only the printing queue has checkboxes to act on */}
        {status === "FOR_PRINTING" && (
          <Flex justify="flex-end">
            <PrimaryMdButton
              disabled={selectedRows.length === 0}
              onClick={printSelected}
            >
              <Printer size={16} />
              {selectedRows.length > 0
                ? `Print (${selectedRows.length})`
                : "Print"}
            </PrimaryMdButton>
          </Flex>
        )}

        {/* Released certificates are the ones a branch can take back */}
        {status === "RELEASED" && (
          <Flex justify="flex-end">
            <PrimaryMdButton
              disabled={selectedRows.length === 0}
              onClick={confiscateSelected}
            >
              <Ban size={16} />
              {selectedRows.length > 0
                ? `Confiscate (${selectedRows.length})`
                : "Confiscate"}
            </PrimaryMdButton>
          </Flex>
        )}

        {/* Confiscated certificates go back to the office next */}
        {status === "CONFISCATED" && (
          <Flex justify="flex-end">
            <PrimaryMdButton
              disabled={selectedRows.length === 0}
              onClick={tagAsReturned}
            >
              <Undo2 size={16} />
              {selectedRows.length > 0
                ? `Tag as Returned (${selectedRows.length})`
                : "Tag as Returned"}
            </PrimaryMdButton>
          </Flex>
        )}

        <CofpPrintModal
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          requests={selectedRows}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
