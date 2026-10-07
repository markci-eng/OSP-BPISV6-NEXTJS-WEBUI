"use client";

// THE JUMP LIST — every account on the billing, one press from any of them.
//
// WHAT THE RAIL'S PLANHOLDER LIST USED TO BE, folded behind a button (user,
// 2026-09-25). The list ate most of a bounded rail and still only showed five
// rows; the stepper's strip now carries the overview and Prev / Next the
// ordinary walk, so the full list is only wanted for the out-of-turn pick — and
// an out-of-turn pick can afford one press to open it.
//
// FILTERED BY WHERE THE DESK HAS GOT, and searchable by name or LPA, because
// the two questions it is opened with are "which ones have I not looked at" and
// "where is the one on this sheet of paper".
//
// ON FOR VERIFICATION IT CARRIES THE TICK BOXES the list rows had. Ticking does
// not open the row, for the reason it never did: gathering five to sign must
// not drag the record column through five records.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Checkbox, Flex, Text } from "@chakra-ui/react";
import { LuCircle, LuCircleCheck, LuEye, LuTriangleAlert } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SearchBar } from "../../components/search-bar";
import { TabPill } from "../../components/tab-pill";
import { INSET_RADIUS } from "../../components/section-card";
import { useSwipeStep } from "../../components/use-swipe-step";
import {
  deceasedName,
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import { getVerifiedAccount } from "../service-payables-store";
import {
  accountMark,
  accountMarkLabel,
  isUnviewed,
  type AccountMark,
} from "./account-mark";

/** A row on a phone — the touch minimum — and the gap between rows. */
const JUMP_ROW_HEIGHT = 48;
const JUMP_ROW_GAP = 2;
const JUMP_ROW_PITCH = JUMP_ROW_HEIGHT + JUMP_ROW_GAP;

export type JumpFilter = "all" | AccountMark;
type Filter = JumpFilter;

/** The glyph for each state — the strip's colours, as icons a row can carry. */
export function AccountMarkIcon({
  mark,
  size = 13,
}: {
  mark: AccountMark;
  size?: number;
}) {
  switch (mark) {
    case "done":
      return <LuCircleCheck size={size} color={BRAND_COLORS.primaryGreen} />;
    case "opened":
      return <LuEye size={size} color={BRAND_COLORS.primaryGreen} />;
    case "held":
      return <LuTriangleAlert size={size} color="#b45309" />;
    default:
      return <LuCircle size={size} color="var(--chakra-colors-gray-300)" />;
  }
}

export interface AccountJumpListProps {
  billing: ServiceBilling;
  services: ServiceRecord[];
  stage: BillingStage;
  currentId?: string;
  onPick: (serviceId: string) => void;
  /** Tick boxes — For Verification only. */
  selectable?: boolean;
  checkedIds?: string[];
  onToggle?: (serviceId: string) => void;
  /** Which filter the list opens on — set by the stepper's state chips. */
  initialFilter?: JumpFilter;
}

export function AccountJumpList({
  billing,
  services,
  stage,
  currentId,
  onPick,
  selectable = false,
  checkedIds = [],
  onToggle,
  initialFilter = "all",
}: AccountJumpListProps) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");

  // THE SEARCH FIRST, then the tab — so each tab's count says how many of what
  // was typed it holds, the billing list's rule (see `billing-list-popup`).
  const searched = useMemo(() => {
    const q = query.trim().toUpperCase();
    return services
      .map((service, index) => ({
        service,
        index,
        mark: accountMark(billing, service, stage),
      }))
      .filter(
        ({ service }) =>
          !q ||
          deceasedName(service).toUpperCase().includes(q) ||
          service.lpaNo.toUpperCase().includes(q),
      );
  }, [billing, services, stage, query]);

  const inFilter = (
    row: (typeof searched)[number],
    key: Filter,
  ): boolean =>
    key === "all"
      ? true
      : key === "untouched"
        ? isUnviewed(billing, row.service, stage)
        : row.mark === key;

  const rows = searched.filter((row) => inFilter(row, filter));

  // "Done" only where the stage has a per-account act — For Process has none
  // now that the billing is processed in one press. Discrepancy is offered
  // because on a 100-account billing it is the handful worth finding.
  const hasDone = services.some(
    (s) => accountMark(billing, s, stage) === "done",
  );
  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "untouched", label: accountMarkLabel("untouched", stage) },
    { key: "opened", label: accountMarkLabel("opened", stage) },
    ...(hasDone
      ? [{ key: "done" as const, label: accountMarkLabel("done", stage) }]
      : []),
    { key: "held", label: accountMarkLabel("held", stage) },
  ];

  // SWIPE BETWEEN THE FILTERS (user, 2026-10-01: "All, not opened, opened and
  // discrepancy can also be accessed through swiping"). The list is the card:
  // swipe left for the filter to the right of this one, as the tabs read. The
  // pills stay, and still take a tap. See `useSwipeStep`.
  const at = Math.max(
    0,
    filters.findIndex((f) => f.key === filter),
  );
  const { cardProps, contentStyle } = useSwipeStep({
    canGo: (dir) => (dir === "next" ? at < filters.length - 1 : at > 0),
    onStep: (dir) => {
      const target = filters[dir === "next" ? at + 1 : at - 1];
      if (target) setFilter(target.key);
    },
  });

  // The pill for the filter on show is kept in view — a swipe can land on one
  // the strip has scrolled out of sight.
  const pillRefs = useRef(new Map<Filter, HTMLElement>());
  useEffect(() => {
    pillRefs.current
      .get(filter)
      ?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [filter]);

  return (
    // BARE IN THE PHONE'S SHEET, like the History card (user, 2026-10-01:
    // "remove it in the card same as the history") — the sheet is the surface.
    // The rail's popover keeps its padding.
    <Flex direction="column" gap={2} p={{ base: 0, lg: 2.5 }} flex="1">
      <SearchBar
        value={query}
        onChange={setQuery}
        size="sm"
        label="Find an account"
        placeholder="Name or LPA"
      />

      {/* THE SWIPING TAB STRIP (user, 2026-09-30: "make used on our old
          design where swiping in the tab") — the billing list's `TabPill`,
          counts and all, in a row that scrolls sideways rather than wrapping.
          ON PC EVERY FILTER SHOWS (user, 2026-10-05: "since it is PC I think it
          would be better if its shown all no need to swipe or scroll") — the
          row wraps instead of hiding pills off the edge. */}
      <Flex
        gap={1.5}
        flexWrap={{ base: "nowrap", lg: "wrap" }}
        overflowX={{ base: "auto", lg: "visible" }}
        pb="2px"
        role="tablist"
        aria-label="Account filters"
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {filters.map((f) => (
          <Box
            key={f.key}
            flexShrink={0}
            ref={(el: HTMLDivElement | null) => {
              if (el) pillRefs.current.set(f.key, el);
              else pillRefs.current.delete(f.key);
            }}
          >
          <TabPill
            label={f.label}
            count={searched.filter((row) => inFilter(row, f.key)).length}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
          />
          </Box>
        ))}
      </Flex>

      {/* THE SWIPE CARD — the rows, and the room reserved under them. `clip`
          keeps its travel from widening the sheet into a sideways scroll.

          ROOM FOR THE LARGEST FILTER, ON A PHONE (user, 2026-10-01: "the
          maximum height is base on how many is the maximum item that will be
          shown at the display at once"). Every filter is a subset of All, so
          reserving All's rows here keeps the sheet one height whichever filter
          or search is on — and the empty band under a short filter is part of
          this card, so it swipes too ("user can swipe through those empty
          space"). The sheet caps it at `SHEET_HEIGHT` and floors it at
          `SHEET_MIN_HEIGHT`; past the cap the sheet scrolls. */}
      <Box
        overflowX="clip"
        // Stretches into the rest of the sheet, so the space under a short
        // list swipes as well.
        flex="1"
        minH={{
          base: `${services.length * JUMP_ROW_PITCH - JUMP_ROW_GAP}px`,
          lg: "auto",
        }}
        {...cardProps}
      >
      <Flex
        role="listbox"
        aria-label="Accounts on this billing"
        direction="column"
        gap={`${JUMP_ROW_GAP}px`}
        // In the phone's sheet the list runs its full length and the sheet
        // scrolls; the rail's popover keeps its own bounded scroll.
        maxH={{ base: "none", lg: "300px" }}
        overflowY={{ base: "visible", lg: "auto" }}
        style={contentStyle}
      >
        {rows.length === 0 ? (
          <Text fontSize="xs" color="gray.500" px={1.5} py={3}>
            No accounts match.
          </Text>
        ) : (
          rows.map(({ service, index, mark }) => {
            const current = service.id === currentId;
            const tickable =
              selectable && !service.discrepancy && !getVerifiedAccount(service.id);
            return (
              <Flex
                key={service.id}
                role="option"
                aria-selected={current}
                tabIndex={0}
                onClick={() => onPick(service.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPick(service.id);
                  }
                }}
                align="center"
                gap={{ base: 3, lg: 2.5 }}
                // A THUMB-SIZED ROW ON A PHONE (user, 2026-10-01: "the names
                // are to small to tap make it bigger"). 48px, the touch
                // minimum. The rail's popover rows grew too (user, 2026-10-05:
                // "make the selection item a little bit bigger").
                minH={{ base: `${JUMP_ROW_HEIGHT}px`, lg: "36px" }}
                px={{ base: 2.5, lg: 2 }}
                py={1}
                borderRadius={INSET_RADIUS}
                bg={current ? "#f4faf6" : undefined}
                cursor="pointer"
                _hover={{ bg: current ? "#eaf5ee" : "gray.50" }}
                title={accountMarkLabel(mark, stage)}
              >
                <Text
                  w="20px"
                  flexShrink={0}
                  textAlign="right"
                  fontSize={{ base: "xs", lg: "11px" }}
                  fontFamily="mono"
                  color="gray.400"
                >
                  {index + 1}
                </Text>

                {selectable && (
                  <Box
                    w="16px"
                    flexShrink={0}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {tickable && (
                      <Checkbox.Root
                        size="sm"
                        checked={checkedIds.includes(service.id)}
                        onCheckedChange={() => onToggle?.(service.id)}
                        aria-label={`Select ${deceasedName(service)}`}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                    )}
                  </Box>
                )}

                <Box flexShrink={0} display="flex">
                  <AccountMarkIcon mark={mark} size={14} />
                </Box>

                <Text
                  minW={0}
                  flex="1"
                  fontSize={{ base: "sm", lg: "13px" }}
                  fontWeight={current ? "700" : "600"}
                  color="gray.800"
                  truncate
                >
                  {deceasedName(service)}
                </Text>
                <Text
                  flexShrink={0}
                  fontSize={{ base: "xs", lg: "11.5px" }}
                  fontFamily="mono"
                  color="gray.500"
                  whiteSpace="nowrap"
                >
                  {service.lpaNo}
                </Text>
              </Flex>
            );
          })
        )}
      </Flex>
      </Box>
    </Flex>
  );
}
