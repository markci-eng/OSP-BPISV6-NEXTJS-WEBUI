"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Box,
  Flex,
  NativeSelect,
  Skeleton,
  Text,
  useBreakpointValue,
  type BoxProps,
} from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  claimIdentity,
  planholderName,
  toFullName,
  type ClaimIdentifier,
  type DeathClaim,
} from "../death-claims-data";
import { paginate } from "../../components/swipe-carousel";
import { ScrollFade } from "../../components/scroll-fade";
import { SearchBar } from "../../components/search-bar";
import { SwipeDeck } from "../../components/swipe-deck";
import { useFittedPageSize } from "../../components/use-fitted-page-size";
import DeathClaimsFilter, {
  CONTROL_HEIGHT,
  DeathClaimsFilterSelect,
  TYPE_DOT,
  type DeathClaimFilter,
} from "./DeathClaimsFilter";
import { DeathClaimsDataTable } from "./DeathClaimsDataTable";
import { ClaimsViewToggle, type ClaimsView } from "./ClaimsViewToggle";

const ALL_BRANCHES = "all";

/**
 * How long the skeletons stay up after switching tabs. Filtering is instant
 * (the claims are already in memory), so this is a deliberate beat that tells
 * the user their tap registered and the list underneath has changed. Keep it
 * short — long enough to read as a load, not long enough to feel slow. When
 * the queue comes from the API this becomes the real request's pending state.
 */
const TAB_SWITCH_MS = 450;

/** Skeletons shown while an empty tab loads, since there is no count to match. */
const FALLBACK_SKELETONS = 3;

/**
 * Fewest cards a page may hold, however short the screen. Below this the swipe
 * costs more than it shows.
 */
const MIN_PAGE_SIZE = 3;

/**
 * Most ROWS of cards a page may hold, however tall the screen. A page is meant
 * to be read at a glance and swiped past; beyond this it is a scrolling list
 * wearing a carousel's clothes.
 *
 * Rows, not cards: on a wide screen a row holds two or three of them, and the
 * limit is about how much of a page the eye has to travel — which is its
 * height.
 */
const MAX_PAGE_ROWS = 8;

/**
 * Narrowest a claim card may be laid out before the list stops adding columns.
 *
 * Every phone is under two of these, so the mobile deck is a single column of
 * full-width cards exactly as it was. A desktop column wide enough for two gets
 * two, and a very wide one gets three — same card, more of them on screen,
 * which is the point of the queue having the larger half of the dashboard.
 */
const CARD_MIN_WIDTH = "320px";

/**
 * One page of cards.
 *
 * `auto-fill` rather than a breakpoint: what decides the column count is the
 * width of the COLUMN this table was placed in, not the width of the window,
 * and those two part company as soon as the dashboard is more than one column
 * wide. `min(…, 100%)` keeps a phone narrower than a card's minimum on one
 * column instead of a track it has to scroll sideways to reach.
 */
function CardGrid({
  ref,
  children,
  ...rest
}: BoxProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Box
      ref={ref}
      display="grid"
      gridTemplateColumns={`repeat(auto-fill, minmax(min(${CARD_MIN_WIDTH}, 100%), 1fr))`}
      gap={2}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * Space that must stay clear below the last card: the bottom navigation, which
 * overlays the final 62px of the viewport, the deck's own dots underneath the
 * track (18px), and a little air so the last card is not flush against the nav.
 */
const BOTTOM_RESERVE = 88;


/**
 * A single claim rendered as a clickable card.
 *
 * Ordered the way a processor picks work up: the claim REQUEST NUMBER first —
 * that is what identifies the claim and what they quote — then the LPA number,
 * then the deceased's name as context. The LPA number carries no "plan" label:
 * a processor reads an "L…" number for what it is.
 */
function ClaimCard({
  claim,
  showTypeDot,
  onClick,
}: {
  claim: DeathClaim;
  showTypeDot: boolean;
  onClick?: () => void;
}) {
  const name = planholderName(claim.lpaNo);
  // Special claims lead with why they are special — the incident.
  const context = [
    name ? toFullName(name) : "—",
    claim.type === "special" ? claim.typeOfIncident : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={3}
      boxShadow="xs"
      cursor="pointer"
      transition="all 0.18s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: "gray.300",
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Flex align="flex-start" gap={2} minW={0} flex="1">
          {showTypeDot && (
            <Box
              mt="6px"
              w="8px"
              h="8px"
              borderRadius="full"
              bg={TYPE_DOT[claim.type]}
              flexShrink={0}
            />
          )}
          <Box minW={0} flex="1">
            {/* 1 — the claim request number, and never a claim no in its place:
                nothing in this queue has been opened yet, so there is none to
                show. Same rule, and same helper, as the table view's identity
                column. */}
            <Text fontSize="sm" fontWeight="700" color="gray.800" truncate>
              {claimIdentity(claim, "request")}
            </Text>
            {/* 2 — the plan it was filed against, and the branch that filed it. */}
            <Text
              fontSize="xs"
              fontWeight="600"
              color="gray.600"
              mt="1px"
              truncate
            >
              {claim.lpaNo}
              <Text as="span" fontWeight="400" color="gray.500">
                {" · "}
                {claim.requestingBranch}
              </Text>
            </Text>
            {/* 3 — who died, and for special claims what happened. */}
            <Text fontSize="11px" color="gray.500" mt="2px" truncate>
              {context}
            </Text>
          </Box>
        </Flex>

        <Text fontSize="10px" color="gray.400" flexShrink={0}>
          {claim.filedDisplay}
        </Text>
      </Flex>
    </Box>
  );
}

/**
 * Placeholder in the shape of a {@link ClaimCard} — same box, same three text
 * rows — so the list does not jump when the real cards replace it.
 *
 * That shape is load-bearing beyond looking tidy: while a queue is switching,
 * this stack is what the page size is measured from (see {@link listRef} in
 * {@link DeathClaimsTable}). A skeleton that were not a card's height would
 * hand back a page size that the real cards then contradict.
 */
function ClaimCardSkeleton({
  showTypeDot,
  trailingWidth,
}: {
  showTypeDot: boolean;
  trailingWidth: string;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={3}
      boxShadow="xs"
    >
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Flex align="flex-start" gap={2} minW={0} flex="1">
          {showTypeDot && (
            <Skeleton mt="6px" w="8px" h="8px" borderRadius="full" flexShrink={0} />
          )}
          <Box minW={0} flex="1">
            {/* Claim request number. */}
            <Skeleton h="14px" w="72%" borderRadius="sm" />
            {/* LPA number · requesting branch. */}
            <Skeleton h="12px" w="66%" mt="3px" borderRadius="sm" />
            {/* Deceased · incident. */}
            <Skeleton h="11px" w="58%" mt="4px" borderRadius="sm" />
          </Box>
        </Flex>
        {/* Filed date, or the card's trailing chevron. */}
        <Skeleton h="10px" w={trailingWidth} borderRadius="sm" flexShrink={0} />
      </Flex>
    </Box>
  );
}

interface DeathClaimsTableProps extends Omit<BoxProps, "data"> {
  data: DeathClaim[];
  /** Show the special/regular colour dot — only meaningful in the combined view. */
  showTypeDot?: boolean;
  /**
   * Where a claim goes when it is opened.
   *
   * Used by the default {@link ClaimCard} and by every row of the table view,
   * which has no `renderCard` to close over a destination of its own. Queues
   * that pass their own card wire it up themselves — but they should send it to
   * the same place, since a row and a card are the same claim.
   */
  onProcess?: (claim: DeathClaim) => void;
  /**
   * Row renderer. Defaults to the processor's {@link ClaimCard}; the queues that
   * work already-processed claims pass their own card, which leads with the
   * claim no. Everything around the rows — search, filters, paging, the tab
   * loader — is shared either way.
   */
  renderCard?: (claim: DeathClaim, showTypeDot: boolean) => React.ReactNode;
  /** Width of the skeleton's trailing block — match the card's right-hand element. */
  skeletonTrailingWidth?: string;
  /**
   * Which number identifies a claim in this queue — the request no it was filed
   * under, or the claim no opening it minted. The table shows that one and drops
   * the other, the same way the cards lead with one and never show the other.
   */
  identifier?: ClaimIdentifier;
  /** Item filter (Special / Regular / All), owned by the page. */
  filter: DeathClaimFilter;
  onFilterChange: (value: DeathClaimFilter) => void;
  counts: Record<DeathClaimFilter, number>;
  /** Distinct requesting branches, for the branch dropdown. */
  branchOptions: string[];
  /**
   * Anything OUTSIDE this table whose change should read as a load — the queue
   * tab above it, in practice. Changing it runs the same skeleton beat that
   * switching the Special / Regular / All filter does, which is what the two
   * have in common: the list underneath is about to be a different list, of a
   * different length.
   */
  loadKey?: string | number;
  /**
   * Root of the section this table lives in, for measuring how many cards fit a
   * page. Required for a section below the fold — see `originRef` on
   * {@link useFittedPageSize}.
   */
  originRef?: RefObject<HTMLElement | null>;
}

/**
 * The claims list and everything around it: search, a branch filter, the
 * Special / Regular / All tabs, and the cards themselves as a swipeable deck.
 *
 * The page size is MEASURED, not chosen — as many cards as the device's height
 * leaves room for, between {@link MIN_PAGE_SIZE} and {@link MAX_PAGE_SIZE}.
 * That is why there is no rows-per-page dropdown: on a phone the right answer
 * is "as many as fit", and asking the user to pick a number they then have to
 * scroll past is worse than measuring it. It also buys back a toolbar row,
 * which is one more card on every screen.
 */
export function DeathClaimsTable({
  data,
  showTypeDot = false,
  onProcess,
  renderCard,
  skeletonTrailingWidth = "64px",
  identifier = "request",
  filter,
  onFilterChange,
  counts,
  branchOptions,
  loadKey,
  originRef,
  ...boxProps
}: DeathClaimsTableProps) {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState<string>(ALL_BRANCHES);
  const [view, setView] = useState<ClaimsView>("cards");

  /**
   * Whether the table view is even on offer.
   *
   * A phone gets cards and no toggle: a nine-column table on a 375px screen is
   * not a smaller table, it is a worse list. Read from the theme's own
   * breakpoints rather than a hand-written query, so it turns over on the same
   * pixel as the toolbar it sits in.
   *
   * `false` before it has measured, which never shows: the view resets to cards
   * on every mount, so the only way to be in `table` is to have already clicked
   * the toggle — by which point this has long since answered.
   */
  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false;
  const showTable = view === "table" && isDesktop;

  // The frame sits outside the deck, so its position is never touched by the
  // scale() the deck puts on a departing slide. The list is whichever stack is
  // currently showing — the first page's cards, or the skeletons standing in for
  // them — which is where a card's height and the gap between cards are read.
  const frameRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pageSize = useFittedPageSize({
    frameRef,
    listRef,
    originRef,
    // A phone scrolls down to this section; a desktop never does — the page
    // fits, and the header above stays where it is. See `anchoredToOrigin`.
    anchoredToOrigin: !isDesktop,
    reserve: BOTTOM_RESERVE,
    min: MIN_PAGE_SIZE,
    maxRows: MAX_PAGE_ROWS,
  });


  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter((c) => {
      if (branch !== ALL_BRANCHES && c.requestingBranch !== branch)
        return false;
      if (!q) return true;
      const nm = planholderName(c.lpaNo);
      return [
        nm ? toFullName(nm) : "",
        c.reference,
        // Only processed claims have one, but it is the number a supervisor
        // searches by — it is the reference the wider system uses.
        c.claimNo ?? "",
        c.lpaNo,
        c.requestingBranch,
        c.typeOfIncident,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [data, search, branch]);

  const pages = paginate(filtered, pageSize);

  // Show skeletons briefly when the queue or the filter changes. The cleanup
  // restarts the timer on a rapid second tap, so the loader never ends early on
  // a tab the user has already moved off.
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  const hasRendered = useRef(false);

  useEffect(() => {
    // Skip the initial render — this is for switching, not first paint.
    if (!hasRendered.current) {
      hasRendered.current = true;
      return;
    }
    setIsSwitchingTab(true);
    const timer = window.setTimeout(
      () => setIsSwitchingTab(false),
      TAB_SWITCH_MS,
    );
    return () => window.clearTimeout(timer);
  }, [filter, loadKey]);

  // Match the number of cards about to appear, so the list keeps its height.
  const skeletonCount = filtered.length
    ? Math.min(pageSize, filtered.length)
    : FALLBACK_SKELETONS;

  /**
   * Changes whenever the deck's contents do, and remounts it — which is how the
   * carousel returns to the first page. Anything that re-paginates belongs here:
   * come back from a search to page four of a list that is now one page long and
   * the deck would otherwise be parked past its own end.
   */
  const deckKey = `${loadKey ?? ""}|${filter}|${search}|${branch}|${pageSize}`;

  return (
    // A column on a desktop: the toolbar keeps its height, the list takes the
    // rest. `boxProps` is how the section hands this box the height to divide up.
    <Box
      display={{ lg: "flex" }}
      flexDirection="column"
      minH={{ lg: 0 }}
      {...boxProps}
    >
      {/* Toolbar. Two rows on a phone, one on a desktop, where the type filter
          fits beside the search instead of under it — every row here is a row
          the cards do not get, and the page size is measured against exactly
          that. Two rather than three even on a phone, for the same reason. */}

      {/* Row 1 — what to filter by, then search.

          Search LAST, because its magnifier is at its own trailing edge: put
          the field first and that icon lands in the middle of the row, between
          the input and the dropdowns, where it reads as belonging to whichever
          control it happens to be nearest. At the end of the row it is at the
          end of the toolbar, which is the only place it means what it is. */}
      <Flex align="center" gap={2} mb={3} flexShrink={0}>
        {/* Leftmost, and first of everything: the view toggle decides what the
            whole section IS — a deck of cards or a table — where the two
            dropdowns only decide which claims it holds. Desktop only, since a
            phone gets cards and no toggle; see `isDesktop`. */}
        <Flex align="center" gap={2} flexShrink={0}>
          {isDesktop && <ClaimsViewToggle value={view} onChange={setView} />}

          {/* Desktop only — the pill row below collapses into this, and its own
              row goes with it. Ahead of the branch picker because it is the
              filter the queue is worked by; the branch narrows on top of it. */}
          <DeathClaimsFilterSelect
            value={filter}
            onChange={onFilterChange}
            counts={counts}
            display={{ base: "none", lg: "block" }}
            w="150px"
          />

          <NativeSelect.Root size="sm" w="130px" flexShrink={0}>
            <NativeSelect.Field
              aria-label="Requesting branch"
              h={CONTROL_HEIGHT}
              borderRadius="lg"
              bg="white"
              value={branch}
              onChange={(e) => setBranch(e.currentTarget.value)}
            >
              <option value={ALL_BRANCHES}>All Branches</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>

        {/* `ml="auto"` rather than `justify="space-between"` on the row, so the
            gap opens between the two groups and never inside either.

            `maxW` never binds on a phone, where the row is barely wider than
            this — it stops the field stretching the whole way across a desktop
            column, which no amount of typing would ever fill.

            `size="sm"` is 36px, which is CONTROL_HEIGHT: this one stands in a
            toolbar and has to line up with the controls beside it.

            No `onSearch`: the list narrows as it is typed, so there is nothing
            behind the magnifier to run. It is drawn, not pressed. */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Reference, name…"
          label="Search claims"
          size="sm"
          flex="1"
          minW={0}
          maxW="420px"
          ml="auto"
        />
      </Flex>

      {/* Row 2 — item filter (Special / Regular / All), full width. Mobile only:
          on a desktop this is the dropdown in the row above, and this row is not
          hidden so much as absent — the margin goes too, which is the point. */}
      <Box mb={3} display={{ base: "block", lg: "none" }}>
        <DeathClaimsFilter
          value={filter}
          onChange={onFilterChange}
          counts={counts}
        />
      </Box>

      {/* The table view is not paged by measurement — it brings its own pager —
          so it is rendered instead of the frame below rather than inside it,
          and the fitted page size simply goes unread while it is up. It also
          skips the tab-switch skeleton: that beat exists because a deck of
          cards changes height as it changes contents, and a table of ten rows
          does not. */}
      {showTable ? (
        <ScrollFade flex={{ lg: "1 1 auto" }} minH={{ lg: 0 }}>
          <DeathClaimsDataTable
            data={filtered}
            identifier={identifier}
            onOpen={onProcess}
          />
        </ScrollFade>
      ) : (
        /* Where the pages begin. Held outside the deck so the scale() on a
           departing slide cannot move it, and so it measures the same whichever
           of the three states below is showing. */
        <Box
          ref={frameRef}
          // Basis `auto`, not the `1` shorthand's zero — see the note on this
          // prop where the section passes it in. Same reason, one level down.
          flex={{ lg: "1 1 auto" }}
          minH={{ lg: 0 }}
          display={{ lg: "flex" }}
          flexDirection="column"
        >
          {isSwitchingTab ? (
            <CardGrid
              // Measured as well as the real cards: the page size then carries
              // straight through a queue switch instead of being unknown for as
              // long as the loader is up. Same grid too, so the column count the
              // measurement reads off it is the one the real cards will land in.
              ref={listRef}
              aria-busy="true"
              aria-live="polite"
            >
              {Array.from({ length: skeletonCount }, (_, i) => (
                <ClaimCardSkeleton
                  key={i}
                  showTypeDot={showTypeDot}
                  trailingWidth={skeletonTrailingWidth}
                />
              ))}
            </CardGrid>
          ) : filtered.length === 0 ? (
            <Box
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="xl"
              py={10}
              textAlign="center"
            >
              <Text fontSize="sm" color="gray.500">
                No claims found.
              </Text>
            </Box>
          ) : isDesktop ? (
            /* A desktop SCROLLS the cards; it does not swipe them.
               A deck is the right control for a thumb and the wrong one for a
               mouse: the gesture it wants is a horizontal drag, a wheel does
               nothing to it, and the only way through the list with a pointer is
               to hunt for the dots. So on a desktop the deck goes, every claim
               is in one list, and the box it sits in is capped at what the
               screen has left — which is what makes the filters above it stay
               put while the claims move under them.
               No scrollbar either: what says there is more is the cards fading
               out at the edge they continue past — see `ScrollFade`. */
            <ScrollFade
              // Bounded by the layout, not by a number this had to work out:
              // it takes what the toolbar above leaves and `min-height: 0` lets
              // it be shorter than the 36 cards inside it. Nothing to measure,
              // so nothing to go stale when the window resizes or the view is
              // switched away and back.
              //
              // Basis `auto` rather than the `1` shorthand's zero: this is the
              // innermost box of the chain the section's maximum height acts
              // through, and a zero basis here would leave the whole chain
              // measuring to nothing. See the note where that prop is passed in.
              flex="1 1 auto"
              minH={0}
              // A card lifts on hover, and setting `overflow-y` makes the other
              // axis scroll too, so a shadow with nowhere to go would hang a
              // horizontal scrollbar under the list. This is the room it needs.
              px={1}
            >
              <CardGrid ref={listRef}>
                {filtered.map((claim) => (
                  <React.Fragment key={claim.id}>
                    {renderCard ? (
                      renderCard(claim, showTypeDot)
                    ) : (
                      <ClaimCard
                        claim={claim}
                        showTypeDot={showTypeDot}
                        onClick={() => onProcess?.(claim)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </CardGrid>
            </ScrollFade>
          ) : (
            <SwipeDeck key={deckKey} label="Claims">
              {pages.map((page, pi) => (
                <CardGrid
                  key={pi}
                  // One page is enough to measure a card, the gap between rows,
                  // and how many columns the list was given room for.
                  ref={pi === 0 ? listRef : undefined}
                >
                  {page.map((claim) => (
                    <React.Fragment key={claim.id}>
                      {renderCard ? (
                        renderCard(claim, showTypeDot)
                      ) : (
                        <ClaimCard
                          claim={claim}
                          showTypeDot={showTypeDot}
                          onClick={() => onProcess?.(claim)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </CardGrid>
              ))}
            </SwipeDeck>
          )}
        </Box>
      )}
    </Box>
  );
}

export default DeathClaimsTable;
