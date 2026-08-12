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
import { deathBenefitLabel } from "@/app/(pis)/data";
import {
  claimIdentity,
  planholderName,
  toFullName,
  NO_IDENTITY,
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
import { DeathClaimsMoreFilters } from "./DeathClaimsMoreFilters";

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
 * Width of the skeleton's trailing block — a branch name's worth.
 *
 * One constant rather than a per-queue prop, which is what it used to be: the
 * queues trailed with different things, a filed date on one and a chevron on the
 * other two. They all trail with the branch now, so a knob for it would be three
 * copies of one number waiting to drift apart.
 */
const SKELETON_TRAILING_WIDTH = "80px";

/**
 * Most of a card the requesting branch may take, opposite the reference.
 *
 * It has to be capped, and the cap has to be this tight, because of what it
 * replaced. A filed date is always about the same width; a branch name is not,
 * and "Cagayan de Oro Branch" is half again as wide as "Davao City Branch" —
 * enough to push the longest references off the end of their own line on a
 * phone. The reference is the one thing on the card that must survive whole: it
 * is what the claim is quoted by, and a truncated one has lost the sequence
 * number that tells two claims from the same branch apart. A truncated branch
 * name has lost the word "Branch".
 *
 * A percentage rather than pixels because what varies is the CARD's width — the
 * grid fits two or three per row on a desktop column — and a fixed cap would be
 * tuned for a phone and mean nothing at 490px. At 30% no branch name truncates
 * on a desktop card, and only the longest do on a phone.
 *
 * A percentage of the row rather than `flexShrink`, which cannot do this job:
 * the reading column beside this has a flex basis of zero, so it contributes
 * nothing to the shrink and this would absorb none of it.
 */
export const BRANCH_MAX_WIDTH = "30%";

/**
 * The requesting branch as a card shows it: "Cagayan de Oro", not "Cagayan de
 * Oro Branch".
 *
 * Every value in this position is a branch, so the word is doing no work — and
 * it is not free. It is the widest part of the longest names, and this sits on
 * the same line as the reference, which must not truncate (see
 * {@link BRANCH_MAX_WIDTH}); with the word in, the two longest references were
 * losing their last characters on a phone.
 *
 * Only a trailing " Branch" is stripped, so anything named some other way — a
 * head office, a satellite — comes through as it is written.
 *
 * Cards only. The table's Branch column keeps the full name: it has a heading
 * to sit under, and room for it.
 */
export function branchShortLabel(branch: string): string {
  return branch.replace(/\s+Branch$/i, "");
}

/**
 * A single claim rendered as a clickable card.
 *
 * Ordered the way a processor picks work up: the claim REQUEST NUMBER first —
 * that is what identifies the claim and what they quote — then the PLAN and the
 * person who held it on one line, then the BENEFIT being claimed. The branch
 * that filed it sits opposite the reference, out of the reading column. The LPA
 * number carries no "plan" label: a processor reads an "L…" number for what it
 * is.
 *
 * The plan and its holder are one line because they are one fact — the name is
 * looked up FROM the number, and a card that split them across two lines made
 * the eye pair them itself on every claim. That frees the last line for the
 * benefit alone, which is what decides how a claim is worked.
 *
 * Nothing here says when it was filed. That reads as a queue of dates rather
 * than a queue of claims, and the date is a column of the table view and a field
 * of the claim itself. This is the same shape, in the same weights, as
 * {@link ProcessedClaimCard} in `ClaimQueuesSection`: the two cards show
 * different identity numbers because their queues do, and nothing else.
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
            {/* 2 — the plan it was filed against, and who held it. */}
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
                {name ? toFullName(name) : NO_IDENTITY}
              </Text>
            </Text>
            {/* 3 — the benefit claimed, on its own.
                Weighted rather than left the faintest thing on the card: it is
                last because it is the detail the other two lines lead TO, not
                because it matters least. */}
            <Text
              fontSize="11px"
              fontWeight="600"
              color="gray.600"
              mt="2px"
              truncate
            >
              {deathBenefitLabel(claim.benefits)}
            </Text>
          </Box>
        </Flex>

        {/* The branch that filed it, opposite the reference. */}
        <Text
          fontSize="10px"
          color="gray.400"
          flexShrink={0}
          maxW={BRANCH_MAX_WIDTH}
          textAlign="right"
          truncate
        >
          {branchShortLabel(claim.requestingBranch)}
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
function ClaimCardSkeleton({ showTypeDot }: { showTypeDot: boolean }) {
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
            <Skeleton
              mt="6px"
              w="8px"
              h="8px"
              borderRadius="full"
              flexShrink={0}
            />
          )}
          <Box minW={0} flex="1">
            {/* Identity number. */}
            <Skeleton h="14px" w="72%" borderRadius="sm" />
            {/* LPA number · plan holder. */}
            <Skeleton h="12px" w="66%" mt="3px" borderRadius="sm" />
            {/* Benefit. */}
            <Skeleton h="11px" w="58%" mt="4px" borderRadius="sm" />
          </Box>
        </Flex>
        {/* Requesting branch. One width for every queue now that both cards
            trail with the same thing — see `SKELETON_TRAILING_WIDTH`. */}
        <Skeleton
          h="10px"
          w={SKELETON_TRAILING_WIDTH}
          borderRadius="sm"
          flexShrink={0}
        />
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
   * Distinct territories in the queue, for the filter dropdown's first section.
   * Codes as they are stored ("MW1"), which is what a supervisor names them by.
   */
  territoryOptions?: string[];
  /**
   * Distinct benefit codes in the queue, for the filter dropdown's second
   * section. Rendered through `deathBenefitLabel`, so the list reads as the
   * benefits do everywhere else rather than as four acronyms.
   */
  benefitOptions?: DeathClaim["benefits"][];
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
  identifier = "request",
  filter,
  onFilterChange,
  counts,
  branchOptions,
  territoryOptions = [],
  benefitOptions = [],
  loadKey,
  originRef,
  ...boxProps
}: DeathClaimsTableProps) {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState<string>(ALL_BRANCHES);

  // The dropdown's two groups. Multi-select, so each is an ARRAY and empty
  // means "not narrowing" — a filter nobody has opened must not exclude
  // anything, and an empty array is the only value that says that without a
  // second flag beside it.
  const [territories, setTerritories] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  // Every queue is a different set of claims, so a territory ticked in one is
  // not necessarily on offer in the next. Cleared when the tab changes, which
  // is the same event the skeleton beat below runs on.
  useEffect(() => {
    setTerritories([]);
    setBenefits([]);
  }, [loadKey]);

  /**
   * The view the user PICKED, or `null` for "hasn't picked one" — which is not
   * the same as "cards", and holding the difference is the whole reason this is
   * nullable. The default depends on the device, and the device is not known
   * until after mount (see `isDesktop`), so a plain `useState("cards")` would
   * have to be corrected by an effect the moment it was measured — and that
   * effect could not tell a default it had set itself from a choice the user
   * had made, so it would keep overwriting the toggle.
   */
  const [chosenView, setChosenView] = useState<ClaimsView | null>(null);

  /**
   * Whether the table view is even on offer.
   *
   * A phone gets cards and no toggle: a nine-column table on a 375px screen is
   * not a smaller table, it is a worse list. Read from the theme's own
   * breakpoints rather than a hand-written query, so it turns over on the same
   * pixel as the toolbar it sits in.
   *
   * `false` until it has measured, which is one render: cards go up, then the
   * desktop default below swaps in the table. Erring towards cards for that
   * beat is the right way round — cards are what a phone keeps, so the wrong
   * guess is corrected only on desktop, where there is room for it to happen
   * without the page moving under a thumb.
   */
  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false;

  /**
   * Cards on a phone, the table on a desktop.
   *
   * The desktop default is the table because of what the two views are FOR. The
   * deck exists to put one claim under a thumb at a time; the table puts thirty
   * side by side under one set of column headings, which is how the queue is
   * actually worked at a desk — scanned, sorted, compared. The toggle is still
   * there, and picking from it wins from then on.
   */
  const view = chosenView ?? (isDesktop ? "table" : "cards");
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
      // Empty means the group is not narrowing — see the state above. Within a
      // group the ticks are OR (Davao OR Cebu); between groups they are AND, so
      // territory and benefit each cut what the other left.
      if (territories.length && !territories.includes(c.territoryCode))
        return false;
      if (benefits.length && !benefits.includes(c.benefits)) return false;
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
        // No cause of incident. Neither view shows it any more, and a claim
        // that matched on it would appear with nothing on it to say why —
        // which reads as the search being wrong rather than as a hidden field
        // having matched.
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [data, search, branch, territories, benefits]);

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
  const deckKey = `${loadKey ?? ""}|${filter}|${search}|${branch}|${territories.join(",")}|${benefits.join(",")}|${pageSize}`;

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
          {isDesktop && (
            <ClaimsViewToggle value={view} onChange={setChosenView} />
          )}

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

          {/* Right of the branch, and last of the filters: type and branch are
              the two the queue is worked by and they name themselves; these
              narrow what those two left, so they sit at the end of the group
              behind one icon. See {@link DeathClaimsMoreFilters}. */}
          <DeathClaimsMoreFilters
            groups={[
              {
                key: "territory",
                label: "Territory",
                options: territoryOptions.map((t) => ({ value: t, label: t })),
                selected: territories,
                onChange: setTerritories,
              },
              {
                key: "benefit",
                label: "Benefits",
                options: benefitOptions.map((b) => ({
                  value: b,
                  label: deathBenefitLabel(b),
                })),
                selected: benefits,
                onChange: setBenefits,
              },
            ]}
          />
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
                <ClaimCardSkeleton key={i} showTypeDot={showTypeDot} />
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
