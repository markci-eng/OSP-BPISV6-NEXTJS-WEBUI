"use client";

// THE PLANHOLDER LIST ON A PHONE — option "B · Compact row, search at the
// bottom" of the mock-up (user, 2026-10-02).
//
// WHY NOT THE TABLE. At phone width the BPIS table showed the avatar and the
// LPA Number and scrolled every other column — Plan, Branch, Status,
// Effectivity — off the right edge. These rows carry exactly those columns and
// nothing more (see `redesign-keeps-same-fields`), as three unlabelled lines:
// name and status, LPA · Plan, Branch · Effectivity.
//
// THE SEARCH IS A FLOATING BAR AT THE FOOT, where the thumb is, riding the
// shell's navigation like the Death Claim's pinned bar — see `QuickAccess`.
// The funnel beside it opens a sheet with the table's sorting and its column
// filters as chips. The table's column toggle has no phone counterpart: a row
// has no columns to hide.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, chakra, Flex, Portal, Text } from "@chakra-ui/react";
import { LuChevronRight, LuFilter, LuSearch } from "react-icons/lu";
import {
  BrandedAvatar,
  OSPBadge,
  PrimarySmButton,
  SecondarySmButton,
} from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import type { PlanholderSearchResult } from "../../claims-data";
import { BottomSheet } from "../../components/bottom-sheet";
import { SheetChoiceGroup } from "../../components/queue-search-sheet";
import {
  CARD_SHAPE,
  FLOATING_BAR,
  SURFACE_RADIUS,
} from "../../components/section-card";
import {
  SHELL_NAV_HEIGHT,
  SHELL_NAV_HIDE_EASE,
  SHELL_NAV_SHOW_EASE,
  useShellNavHidden,
} from "../../components/use-shell-nav-hidden";
import {
  branchName,
  formatDate,
  statusBadgeType,
  toTitleCase,
} from "./planholder-list-format";

/** How many rows arrive at a time as the list is scrolled. */
const BATCH = 20;

/**
 * The room the search bar needs under the last row, not counting the shell's
 * navigation: the bar's 56px, the 8px it floats at, 24px of air, and the
 * phone's safe area. The navigation's height is added while that is up.
 */
const SEARCH_BAR_ROOM =
  "calc(56px + 8px + 24px + env(safe-area-inset-bottom, 0px))";

type SortKey = "name" | "lpa" | "effectivity";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "lpa", label: "LPA Number" },
  { value: "effectivity", label: "Effectivity" },
];

/** Name sorts surname-first like the table; Effectivity newest first. */
function compare(sort: SortKey) {
  return (a: PlanholderSearchResult, b: PlanholderSearchResult) => {
    if (sort === "lpa") return a.lpaNo.localeCompare(b.lpaNo);
    if (sort === "effectivity")
      return (
        new Date(b.effectivityDate).getTime() -
        new Date(a.effectivityDate).getTime()
      );
    return a.name.localeCompare(b.name);
  };
}

function optionsOf(values: string[], label: (v: string) => string = (v) => v) {
  // Sorted by what the chip READS — a branch's name, not its code.
  return [...new Set(values.filter(Boolean))]
    .map((value) => ({ value, label: label(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function PlanholderPhoneList({
  planholders,
}: {
  planholders: PlanholderSearchResult[];
}) {
  const router = useRouter();
  const navHidden = useShellNavHidden();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [plans, setPlans] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shown, setShown] = useState(BATCH);
  // A STATE, NOT A REF, so the observer re-arms once the sentinel exists.
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const statusOptions = useMemo(
    () => optionsOf(planholders.map((p) => p.accountStatus), toTitleCase),
    [planholders],
  );
  const planOptions = useMemo(
    () => optionsOf(planholders.map((p) => p.planDesc)),
    [planholders],
  );
  const branchOptions = useMemo(
    () => optionsOf(planholders.map((p) => p.branch), branchName),
    [planholders],
  );

  // A changed sort counts as a filter: the funnel's number says the list is
  // not in its usual order.
  const filterCount =
    statuses.length + plans.length + branches.length + (sort !== "name" ? 1 : 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return planholders
      .filter(
        (p) =>
          (!q ||
            `${p.firstName} ${p.lastName} ${p.name} ${p.personId} ${p.lpaNo}`
              .toLowerCase()
              .includes(q)) &&
          (!statuses.length || statuses.includes(p.accountStatus)) &&
          (!plans.length || plans.includes(p.planDesc)) &&
          (!branches.length || branches.includes(p.branch)),
      )
      .sort(compare(sort));
  }, [planholders, query, statuses, plans, branches, sort]);

  // A NEW LIST STARTS WITH ONE BATCH, keyed on what changes the rows.
  const resetKey = `${query}|${sort}|${statuses}|${plans}|${branches}`;
  useEffect(() => setShown(BATCH), [resetKey]);

  // THE NEXT BATCH WHEN THE FOOT OF THE LIST COMES INTO VIEW, a little early.
  // The page scrolls, not a box of its own, so the root is the viewport.
  useEffect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown((n) => n + BATCH);
      },
      { rootMargin: "0px 0px 240px 0px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [sentinel, shown]);

  const clearFilters = () => {
    setSort("name");
    setStatuses([]);
    setPlans([]);
    setBranches([]);
  };

  const visible = rows.slice(0, shown);

  return (
    <Box
      // The bar's room, and the navigation's ONLY WHILE IT IS UP — the same
      // arithmetic as the Death Claim's column under its pinned bar.
      pb={
        navHidden
          ? SEARCH_BAR_ROOM
          : `calc(${SHELL_NAV_HEIGHT} + ${SEARCH_BAR_ROOM})`
      }
      transition={`padding-bottom ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
    >
      <Flex
        justify="space-between"
        fontSize="11.5px"
        color="gray.500"
        px="2px"
        mb={2}
      >
        <Text>All planholders</Text>
        <Text fontVariantNumeric="tabular-nums">
          {rows.length} of {planholders.length}
        </Text>
      </Flex>

      {rows.length === 0 ? (
        <Text textAlign="center" fontSize="sm" color="gray.500" py={10}>
          No planholder on file matches that search.
        </Text>
      ) : (
        <Flex direction="column" gap={2}>
          {visible.map((planholder) => (
            <PlanholderRow
              key={planholder.lpaNo}
              planholder={planholder}
              onOpen={() =>
                router.push(
                  `/claims/planholder/${encodeURIComponent(planholder.lpaNo)}`,
                )
              }
            />
          ))}
        </Flex>
      )}

      {shown < rows.length && <Box ref={setSentinel} h="44px" aria-hidden />}

      {/* THE SEARCH BAR. Portalled, because `position: fixed` measures from
          the nearest transformed ancestor and the shell is free to add one. It
          sits 8px off the screen's foot while the navigation is tucked away
          and lifts above it while it is up, on the navigation's own easing. */}
      <Portal>
        <Flex
          position="fixed"
          bottom="calc(8px + env(safe-area-inset-bottom, 0px))"
          insetX={3}
          align="center"
          gap={2}
          {...FLOATING_BAR}
          transform={navHidden ? "translateY(0)" : `translateY(-${SHELL_NAV_HEIGHT})`}
          transition={`transform ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
        >
          <Flex
            as="label"
            flex="1"
            minW={0}
            align="center"
            gap={2}
            h="44px"
            px={3}
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius={SURFACE_RADIUS}
            _focusWithin={{ borderColor: BRAND_COLORS.primaryGreen }}
          >
            <Box color="gray.400" flexShrink={0}>
              <LuSearch size={16} />
            </Box>
            <chakra.input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Name, Person ID or LPA"
              aria-label="Search planholders"
              flex="1"
              minW={0}
              border="none"
              outline="none"
              bg="transparent"
              // 16px, NOT SMALLER: a phone zooms the page into any field typed
              // in at under 16px.
              fontSize="16px"
              color="gray.800"
            />
          </Flex>

          <chakra.button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label={filterCount ? `Filters, ${filterCount} set` : "Filters"}
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="44px"
            flexShrink={0}
            bg={filterCount ? "#f4faf6" : "white"}
            borderWidth="1px"
            borderColor={filterCount ? BRAND_COLORS.darkGreen : "gray.200"}
            borderRadius={SURFACE_RADIUS}
            color={BRAND_COLORS.darkGreen}
            cursor="pointer"
          >
            <LuFilter size={17} />
            {filterCount > 0 && (
              <Box
                as="span"
                position="absolute"
                top="-6px"
                right="-6px"
                minW="18px"
                h="18px"
                px="5px"
                borderRadius="full"
                bg={BRAND_COLORS.primaryGreen}
                color="white"
                fontSize="10px"
                fontWeight="700"
                lineHeight="18px"
                textAlign="center"
              >
                {filterCount}
              </Box>
            )}
          </chakra.button>
        </Flex>
      </Portal>

      {/* FITTED — the chips do not change with what is picked. */}
      <BottomSheet
        title="Filters"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        footer={
          <Flex gap={2.5}>
            <SecondarySmButton
              flex="1"
              h="44px"
              minH="44px"
              onClick={clearFilters}
            >
              Clear
            </SecondarySmButton>
            <PrimarySmButton
              flex="1"
              h="44px"
              minH="44px"
              onClick={() => setFiltersOpen(false)}
            >
              Done
            </PrimarySmButton>
          </Flex>
        }
      >
        <SheetChoiceGroup
          label="Sort by"
          options={SORT_OPTIONS}
          selected={[sort]}
          onChange={(next) => setSort((next[0] as SortKey) ?? "name")}
        />
        <SheetChoiceGroup
          label="Status"
          options={statusOptions}
          selected={statuses}
          onChange={setStatuses}
          multi
        />
        <SheetChoiceGroup
          label="Plan"
          options={planOptions}
          selected={plans}
          onChange={setPlans}
          multi
        />
        <SheetChoiceGroup
          label="Branch"
          options={branchOptions}
          selected={branches}
          onChange={setBranches}
          multi
        />
      </BottomSheet>
    </Box>
  );
}

/** One planholder: avatar, then name · status, LPA · Plan, Branch · Effectivity. */
function PlanholderRow({
  planholder,
  onOpen,
}: {
  planholder: PlanholderSearchResult;
  onOpen: () => void;
}) {
  const fullName = `${toTitleCase(planholder.firstName)} ${toTitleCase(planholder.lastName)}`;
  const status = planholder.accountStatus;
  const separator = (
    <Box as="span" color="gray.300" mx="5px" aria-hidden>
      ·
    </Box>
  );

  return (
    <chakra.button
      type="button"
      onClick={onOpen}
      display="flex"
      alignItems="center"
      gap={3}
      w="full"
      textAlign="left"
      bg="white"
      {...CARD_SHAPE}
      pl={3}
      pr={2.5}
      py={3}
      cursor="pointer"
      transition="background 0.12s ease"
      _active={{ bg: "#f4faf6" }}
    >
      <BrandedAvatar
        name={fullName}
        imageUrl={mockAvatarUrl(planholder.personId)}
        ringed
      />

      <Flex direction="column" gap="3px" flex="1" minW={0}>
        <Flex align="center" gap={2}>
          <Text
            flex="1"
            minW={0}
            fontSize="sm"
            fontWeight="semibold"
            color="gray.800"
            truncate
          >
            {fullName}
          </Text>
          {status && (
            <Box flexShrink={0}>
              <OSPBadge type={statusBadgeType(status)}>
                {toTitleCase(status)}
              </OSPBadge>
            </Box>
          )}
        </Flex>
        <Text fontSize="xs" color="gray.600" truncate>
          <Box as="span" fontFamily="mono">
            {planholder.lpaNo}
          </Box>
          {separator}
          {planholder.planDesc}
        </Text>
        <Text fontSize="xs" color="gray.500" truncate>
          {branchName(planholder.branch)}
          {separator}
          {formatDate(planholder.effectivityDate)}
        </Text>
      </Flex>

      <Box color="gray.300" flexShrink={0}>
        <LuChevronRight size={16} />
      </Box>
    </chakra.button>
  );
}

export default PlanholderPhoneList;
