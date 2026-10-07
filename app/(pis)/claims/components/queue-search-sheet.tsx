"use client";

// THE PHONE'S QUEUE SEARCH — option "controls at the bottom" of the mock-up
// (user, 2026-10-02), for Death Claim's queue and lists and Service's billings.
//
// A BOTTOM SHEET LIKE EVERY OTHER ON THESE SCREENS, at one fixed height while it
// is open: the rows change with every tab, keystroke and filter, and a sheet
// that resized with them jumped under the thumb — see `sheet-height`.
//
// THE CONTROLS ARE AT THE FOOT, where the thumb already is. The list fills the
// sheet above them and is read top-down; the tabs, the search and the funnel
// are acted on at the bottom, and typing raises them with the keyboard.
// UNLESS THE SHEET HAS AN ACTION — then the action takes the foot and the
// controls sit at the top; see `action`.
//
// THE TABS FILL THE ROW WHEN THEY FIT, AND SCROLL WHEN THEY DO NOT (user, same
// day: "make the width of the tabs dynamic to occupy the whole row", then "keep
// the scrolling row" for Service's six). Each grows to share the row and never
// shrinks below its label.
//
// SWIPE THE LIST TO CHANGE TAB — added to the tabs, never instead of them; see
// `useSwipeStep`. The list scrolls vertically, which is what frees the
// sideways gesture: Death Claim's phone list used to PAGE sideways, and the two
// would have fought.
//
// IT LOADS AS YOU SCROLL, a batch at a time, so a queue of hundreds opens on its
// first rows instead of laying all of them out at once.
//
// THE OTHER FILTERS ARE BEHIND THE FUNNEL, in a view of their own inside the
// sheet: big chips, not dropdown menus stacked on a sheet. The funnel carries
// how many are set, so a narrowed list is never a mystery.

import { useEffect, useState, type ReactNode } from "react";
import {
  Box,
  chakra,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuChevronLeft, LuFilter, LuSearch } from "react-icons/lu";
import { PrimarySmButton, SecondarySmButton } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SHEET_HEIGHT } from "./sheet-height";
import { SheetTabs } from "./sheet-tabs";
import { useSwipeStep } from "./use-swipe-step";

/** How many rows arrive at a time as the list is scrolled. */
const BATCH = 15;

export interface QueueSheetTab {
  key: string;
  label: string;
  /** Follows the search, not the funnel — see the callers. */
  count: number;
}

export interface QueueSearchSheetProps<T> {
  /** The sheet's heading — "For Process queue", "All billings". */
  title: string;
  open: boolean;
  onClose: () => void;
  /** Absent or one tab: no strip and no swipe — a fixed list. */
  tabs?: QueueSheetTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  /** Every row the tab, search and filters leave, in reading order. */
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** What stands in an empty list — the caller knows why it is empty. */
  empty: ReactNode;
  /** How many funnel filters are set — the number on the funnel. */
  filterCount: number;
  /** The funnel's view. Omit for no funnel. */
  renderFilters?: () => ReactNode;
  onClearFilters?: () => void;
  /**
   * One action on the whole list — Payments' Print SOA.
   *
   * IT TAKES THE FOOT, AND THE CONTROLS MOVE TO THE TOP (user, 2026-10-02:
   * "the label and filter should be at the top … since there is a print soa
   * at the bottom"). The foot holds one thing; a sheet with nothing to do but
   * search keeps its controls there, a sheet with an action gives it the foot.
   */
  action?: ReactNode;
  /**
   * One filter kept in reach instead of behind the funnel — the billing list's
   * Own / Franchisee switch (user, 2026-10-05). Drawn above the tabs. Not
   * counted in `filterCount`; it shows its own state.
   */
  quickFilter?: ReactNode;
}

export function QueueSearchSheet<T>({
  title,
  open,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  placeholder,
  items,
  getKey,
  renderItem,
  empty,
  filterCount,
  renderFilters,
  onClearFilters,
  action,
  quickFilter,
}: QueueSearchSheetProps<T>) {
  const [view, setView] = useState<"list" | "filters">("list");
  const [shown, setShown] = useState(BATCH);

  // A STATE, NOT A REF, for both: the drawer mounts its content a beat after
  // `open`, so the effects that need them have to run again once they exist.
  const [body, setBody] = useState<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const strip = tabs && tabs.length > 1 ? tabs : undefined;
  const index = strip ? strip.findIndex((t) => t.key === activeTab) : -1;

  // Back to the list, every time it opens.
  useEffect(() => {
    if (open) setView("list");
  }, [open]);

  // A NEW LIST STARTS AT ITS TOP, WITH ONE BATCH. Keyed on what changes the
  // rows — the tab, the search, the filters — not on the rows themselves, which
  // a caller may rebuild on every render.
  const resetKey = `${activeTab}|${query}|${filterCount}|${items.length}`;
  useEffect(() => {
    setShown(BATCH);
    if (body) body.scrollTop = 0;
  }, [resetKey, body]);

  // THE NEXT BATCH WHEN THE FOOT OF THE LIST COMES INTO VIEW, a little early so
  // the reader rarely sees it arrive. Re-observed after every batch: a short
  // batch that leaves the foot still on screen then asks again at once.
  useEffect(() => {
    if (!open || !body || !sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown((n) => n + BATCH);
      },
      { root: body, rootMargin: "0px 0px 240px 0px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [open, body, sentinel, shown]);

  const swipe = useSwipeStep({
    canGo: (dir) =>
      !!strip && (dir === "next" ? index < strip.length - 1 : index > 0),
    onStep: (dir) => {
      if (!strip) return;
      const next = strip[index + (dir === "next" ? 1 : -1)];
      if (next) onTabChange?.(next.key);
    },
  });

  const visible = items.slice(0, shown);
  const more = shown < items.length;
  const heading = strip?.[index]?.label ?? title;

  // THE TABS AND THE SEARCH (and the funnel) — drawn in one place, placed
  // by whether the foot is taken; see `action`.
  const controls = (
    <>
      {quickFilter}

      {strip && (
        <SheetTabs
          label={title}
          tabs={strip}
          active={activeTab}
          onChange={onTabChange}
        />
      )}

      <Flex gap={2}>
        <Flex
          as="label"
          flex="1"
          minW={0}
          align="center"
          gap={2}
          h="44px"
          px={3}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          _focusWithin={{ borderColor: BRAND_COLORS.primaryGreen }}
        >
          <Box color="gray.400" flexShrink={0}>
            <LuSearch size={16} />
          </Box>
          <chakra.input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            placeholder={placeholder}
            aria-label={`Search — ${title}`}
            flex="1"
            minW={0}
            border="none"
            outline="none"
            bg="transparent"
            // 16px, NOT SMALLER: a phone zooms the page into any
            // field typed in at under 16px.
            fontSize="16px"
            color="gray.800"
          />
        </Flex>

        {renderFilters && (
          <chakra.button
            type="button"
            onClick={() => setView("filters")}
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
            borderRadius="xl"
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
        )}
      </Flex>
    </>
  );

  return (
    // Mounted always, `open` driving it — see `SectionPopup`.
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="2xl"
            bg={BRAND_COLORS.subtleBg}
            // ONE HEIGHT WHILE OPEN — see the note at the top.
            h={SHEET_HEIGHT}
            maxH={SHEET_HEIGHT}
            pb="env(safe-area-inset-bottom, 0px)"
          >
            <Drawer.Header
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              pt={3}
              pb={2}
            >
              <Drawer.Title fontSize="md" fontWeight="700" color="gray.800">
                {view === "filters" ? (
                  <Flex as="span" align="center" gap={1}>
                    <chakra.button
                      type="button"
                      onClick={() => setView("list")}
                      aria-label="Back to the list"
                      display="flex"
                      color={BRAND_COLORS.darkGreen}
                      cursor="pointer"
                    >
                      <LuChevronLeft size={18} />
                    </chakra.button>
                    Filters
                  </Flex>
                ) : (
                  title
                )}
              </Drawer.Title>
              <Drawer.CloseTrigger asChild position="static">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            {view === "filters" && renderFilters ? (
              <>
                <Drawer.Body px={4} pt={1} pb={4} overflowY="auto">
                  {renderFilters()}
                </Drawer.Body>
                <Flex
                  flexShrink={0}
                  gap={2.5}
                  px={4}
                  pt={3}
                  pb={4}
                  borderTopWidth="1px"
                  borderColor="gray.100"
                >
                  <SecondarySmButton
                    flex="1"
                    h="44px"
                    minH="44px"
                    onClick={() => onClearFilters?.()}
                  >
                    Clear
                  </SecondarySmButton>
                  <PrimarySmButton
                    flex="1"
                    h="44px"
                    minH="44px"
                    onClick={() => setView("list")}
                  >
                    Done
                  </PrimarySmButton>
                </Flex>
              </>
            ) : (
              <>
                {/* THE CONTROLS AT THE TOP, when the foot holds the action. */}
                {action && (
                  <Flex
                    direction="column"
                    gap={2.5}
                    flexShrink={0}
                    px={4}
                    pt={1}
                    pb={3}
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                  >
                    {controls}
                  </Flex>
                )}

                <Drawer.Body
                  ref={setBody}
                  px={4}
                  pt={action ? 3 : 1}
                  pb={3}
                  overflowY="auto"
                >
                  {/* THE SWIPE SURFACE is the whole list — see `useSwipeStep`. */}
                  <Box {...swipe.cardProps} minH="full">
                    <Box style={swipe.contentStyle}>
                      <Flex
                        justify="space-between"
                        fontSize="11.5px"
                        color="gray.500"
                        px="2px"
                        mb={2}
                      >
                        <Text>{heading}</Text>
                        {items.length > 0 && (
                          <Text fontVariantNumeric="tabular-nums">
                            {Math.min(shown, items.length)} of {items.length}
                          </Text>
                        )}
                      </Flex>

                      {items.length === 0 ? (
                        empty
                      ) : (
                        <Flex direction="column" gap={2}>
                          {/* A FLEX COLUMN PER ROW, so a row drawn as a
                              `<button>` stretches to the sheet's width instead
                              of shrinking to its content, as a button does in
                              a plain block. */}
                          {visible.map((item) => (
                            <Flex key={getKey(item)} direction="column">
                              {renderItem(item)}
                            </Flex>
                          ))}
                        </Flex>
                      )}

                      {more && <Box ref={setSentinel} h="44px" aria-hidden />}
                    </Box>
                  </Box>
                </Drawer.Body>

                {/* THE FOOT — the action when there is one, else the
                    controls; see `action`. */}
                {action ? (
                  <Box
                    flexShrink={0}
                    px={4}
                    pt={2.5}
                    pb={3.5}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    {action}
                  </Box>
                ) : (
                  <Flex
                    direction="column"
                    gap={2.5}
                    flexShrink={0}
                    px={4}
                    pt={2.5}
                    pb={3.5}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    {controls}
                  </Flex>
                )}
              </>
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

/**
 * One question in the funnel's view — a heading over chips, each a 40px
 * target. `multi` ticks any number; otherwise picking one replaces the last.
 */
export function SheetChoiceGroup({
  label,
  options,
  selected,
  onChange,
  multi = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}) {
  if (options.length === 0) return null;
  return (
    <Box mb={4}>
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={2}
      >
        {label}
      </Text>
      <Flex wrap="wrap" gap={2}>
        {options.map((option) => {
          const on = selected.includes(option.value);
          return (
            <chakra.button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() =>
                onChange(
                  multi
                    ? on
                      ? selected.filter((v) => v !== option.value)
                      : [...selected, option.value]
                    : [option.value],
                )
              }
              minH="40px"
              px={3.5}
              borderWidth="1px"
              borderRadius="full"
              borderColor={on ? BRAND_COLORS.darkGreen : "gray.200"}
              bg={on ? "#f4faf6" : "white"}
              color={on ? BRAND_COLORS.darkGreen : "gray.700"}
              fontSize="13px"
              fontWeight="600"
              cursor="pointer"
            >
              {option.label}
            </chakra.button>
          );
        })}
      </Flex>
    </Box>
  );
}

/**
 * A from–to pair of the phone's own date pickers, for the filed-date bound.
 * Each end may be left empty, which means "not bounded on that side".
 */
export function SheetDateRange({
  label,
  from,
  to,
  min,
  max,
  onChange,
}: {
  label: string;
  from: string;
  to: string;
  min?: string;
  max?: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  const field = (
    which: "from" | "to",
    value: string,
    bounds: { min?: string; max?: string },
  ) => (
    <Box
      as="label"
      flex="1"
      minW={0}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      px={3}
      pt={1.5}
      pb={1}
      _focusWithin={{ borderColor: BRAND_COLORS.primaryGreen }}
    >
      <Text fontSize="10.5px" color="gray.500">
        {which === "from" ? "From" : "To"}
      </Text>
      <chakra.input
        type="date"
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={(e) =>
          onChange(
            which === "from"
              ? { from: e.currentTarget.value, to }
              : { from, to: e.currentTarget.value },
          )
        }
        w="full"
        border="none"
        outline="none"
        bg="transparent"
        fontSize="16px"
        color="gray.800"
      />
    </Box>
  );
  return (
    <Box mb={4}>
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={2}
      >
        {label}
      </Text>
      <Flex gap={2}>
        {field("from", from, { min, max: to || max })}
        {field("to", to, { min: from || min, max })}
      </Flex>
    </Box>
  );
}

export default QueueSearchSheet;
