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
import { db, deathBenefitLabel } from "@/app/(pis)/data";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  claimIdentity,
  filedFullDisplay,
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
  DeathClaimsFiledRange,
  DeathClaimsFilterSelect,
  TYPE_DOT,
  type DeathClaimFilter,
} from "./DeathClaimsFilter";
import { DeathClaimsDataTable } from "./DeathClaimsDataTable";
import { ClaimsViewToggle, type ClaimsView } from "../../components/view-toggle";
import { MoreFilters } from "../../components/more-filters";

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
 * The full card says nothing about when it was filed. That reads as a queue of
 * dates rather than a queue of claims, and the date is a column of the table
 * view and a field of the claim itself. This is the same shape, in the same
 * weights, as {@link ProcessedClaimCard} in `ClaimQueuesSection`: the two cards
 * show different identity numbers because their queues do, and nothing else.
 *
 * THE COMPACT CARD DOES SHOW IT, and the exception is the point rather than a
 * relaxation of the rule above. A compact queue is worked FIFO — oldest request
 * first, special claims ahead of regular — so the filed date is not decoration
 * there, it is the SORT KEY. A list ordered by something it does not show is a
 * list a user has to take on trust, and the first time two cards look out of
 * order they have no way to tell a bug from a rule they had not been told.
 *
 * It takes the slot the branch had, at the end of the identity line, and the
 * branch drops to sit opposite the benefit. Both trailing values stay out of the
 * reading column; they simply swap rows, because the date now qualifies the
 * reference and the branch never did.
 */
function ClaimCard({
  claim,
  showTypeDot,
  selected = false,
  compact = false,
  identifier = "request",
  onClick,
}: {
  claim: DeathClaim;
  showTypeDot: boolean;
  /** Ringed as the claim currently open beside this queue — see `selectedReference`. */
  selected?: boolean;
  /** Tighter, and carrying the filed date — see the note above. */
  compact?: boolean;
  /**
   * Which of a claim's two numbers names it — the queue's own choice, the same
   * one the table view's identity column takes.
   *
   * IT USED TO BE HARD-CODED to "request", on the reasoning that nothing in this
   * queue has been opened yet and so there is no claim number to show. That is
   * true of For Process and false of the two queues after it, which work opened
   * claims — and once the same card started rendering all three, a card in For
   * Verification was naming a claim by its request number while the panel beside
   * it named the same claim by its claim number. Two numbers for one record, on
   * screen together.
   */
  identifier?: ClaimIdentifier;
  onClick?: () => void;
}) {
  const name = planholderName(claim.lpaNo);

  /**
   * The filed date without the time — "May 2" out of "May 2 · 8:00 am".
   *
   * Split off the display string rather than formatted afresh from `filedAt`,
   * so the card cannot drift into a second date format: this is the app's own
   * filed-date wording with its tail removed, not a new rendering of the value.
   *
   * The time goes because it is the FIFO tiebreaker, not the FIFO key. It
   * decides which of two same-day claims sorts first, and the sort has already
   * used it by the time a reader gets here; printed on the card it is four more
   * characters in the tightest row for a distinction nobody reads across.
   */
  const filedDate = claim.filedDisplay.split("·")[0].trim();

  // The filed moment in full, year included — see `filedFullDisplay` for why
  // the year is load-bearing in a FIFO queue rather than decoration.
  const filedFull = filedFullDisplay(claim);

  /* ─── The compact row — the rail's queue ───
     A ROW IN A LIST, not a card, and that is the difference from everything
     below. A queue is a dense list of one repeating thing; drawn as thirty-seven
     rounded boxes it becomes thirty-seven objects to look at, each with its own
     edge, shadow and gap, and the eye spends more on the containers than on what
     is in them. One hairline between rows says "next" for a pixel.

     IT ALSO SHOWS DIFFERENT FIELDS from the full card, which is why this returns
     before it rather than being that card with smaller type: this is the number,
     when it was filed and what is claimed, and the plan holder's name is not on
     it at all. A 360px rail cannot hold the number and the name on one line —
     measured, they want 419px of a 332px row — and between the two, the number
     is what the queue is worked by. The name is one click away, at the head of
     the panel this row fills. */
  if (compact) {
    return (
      <Flex
        role="button"
        tabIndex={0}
        aria-current={selected ? "true" : undefined}
        onClick={onClick}
        position="relative"
        direction="column"
        py={2}
        pr={2}
        // Room for the type stripe, which sits against the row's leading edge.
        pl="14px"
        // NO BORDER, NO RADIUS, NO SHADOW. The only edge is the rule to the next
        // row, and the last one does not get even that — a trailing hairline
        // under the final row draws a line under nothing.
        borderBottomWidth="1px"
        borderColor="gray.100"
        _last={{ borderBottomWidth: 0 }}
        // Selection is a wash, since there is no border left to colour. It is
        // the same green the picked card used to carry.
        bg={selected ? "#f4faf6" : "transparent"}
        cursor="pointer"
        transition="background 0.15s ease"
        _hover={{ bg: selected ? "#f4faf6" : "gray.50" }}
      >
        {/* THE TYPE, AS A STRIPE RATHER THAN A DOT. It says the same thing in
            3px where the dot and its gap took 15, and a stripe down the leading
            edge reads as the row's category where a dot reads as an ornament. */}
        {showTypeDot && (
          <Box
            position="absolute"
            left="4px"
            top="7px"
            bottom="7px"
            w="3px"
            borderRadius="full"
            bg={TYPE_DOT[claim.type]}
          />
        )}

        {/* 1 — what it is called, and when it came in. */}
        <Flex align="baseline" gap={2}>
          <Text
            fontSize="12px"
            lineHeight={1.3}
            fontWeight="700"
            color="gray.800"
            truncate
            flex="1"
            minW={0}
          >
            {claimIdentity(claim, identifier)}
          </Text>
          <Text
            fontSize="10px"
            lineHeight={1.3}
            fontWeight="600"
            color="gray.400"
            flexShrink={0}
          >
            {filedFull}
          </Text>
        </Flex>

        {/* 2 — the benefit claimed. */}
        <Text
          fontSize="11px"
          lineHeight={1.3}
          fontWeight="600"
          color="gray.600"
          mt="2px"
          truncate
        >
          {deathBenefitLabel(claim.benefits)}
        </Text>
      </Flex>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      onClick={onClick}
      borderWidth="1px"
      borderColor={selected ? BRAND_COLORS.primaryGreen : "gray.200"}
      borderRadius="xl"
      bg={selected ? "#f4faf6" : "white"}
      p={3}
      // One border, the same width selected or not — same reasoning as the tile
      // tabs. A green ring over a green border reads as a 2px edge, so the
      // picked card appeared to thicken while the rest of the queue stayed
      // hairlines. The green border and the green wash already say it is picked.
      boxShadow="xs"
      cursor="pointer"
      transition="all 0.18s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: selected ? BRAND_COLORS.primaryGreen : "gray.300",
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
            {/* 1 — the number this queue names a claim by. */}
            <Flex align="baseline" gap={2}>
              <Text
                fontSize="sm"
                fontWeight="700"
                color="gray.800"
                truncate
                flex="1"
                minW={0}
              >
                {claimIdentity(claim, identifier)}
              </Text>
            </Flex>
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
            {/* 3 — the benefit claimed.
                Weighted rather than left the faintest thing on the card: it is
                last because it is the detail the other two lines lead TO, not
                because it matters least. */}
            <Flex align="baseline" gap={2} mt="2px">
              <Text
                fontSize="11px"
                fontWeight="600"
                color="gray.600"
                truncate
                flex="1"
                minW={0}
              >
                {deathBenefitLabel(claim.benefits)}
              </Text>
            </Flex>
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
  /**
   * Whether to draw the Special / Regular / All filter at all.
   *
   * SPECIAL AND REGULAR ARE A DEATH CLAIM'S CATEGORIES AND NOBODY ELSE'S — the
   * split comes from filing within seven days of the incident, which is a death
   * claim rule. A caller whose list is scoped to waivers or dismemberments is
   * showing a filter over a distinction those claims do not have, and its two
   * options would silently empty the table. `filter` is still required when this
   * is false: the caller holds the value either way, and "all" is what an
   * undrawn filter means.
   */
  showTypeFilter?: boolean;
  /**
   * Whether to draw the funnel — branch, territory and benefit.
   *
   * Off for a caller whose list is short enough to read, or one that has already
   * scoped it. Three filters behind an icon earn their row on a dashboard of
   * every claim in the country; over one queue, opened from a pop-up, they are
   * three questions nobody came to ask.
   *
   * A GROUP WITH NOTHING IN IT IS NOT DRAWN, so this is not all-or-nothing: a
   * caller offering branch and territory and no benefit gets two sections rather
   * than a third reading "nothing to filter by". See `groups` below.
   */
  showMoreFilters?: boolean;
  /**
   * Whether the funnel also offers a FILED DATE bound.
   *
   * OPT-IN, where the three option lists are simply drawn from whatever the
   * caller passes. A date range is the one filter here that cannot be derived
   * from the data being empty or not — every claim has a filed date, so the
   * section would always be on offer — and it is not wanted everywhere: the
   * dashboard's queues are cut by stage and worked FIFO, where "filed between"
   * is a report's question rather than a processor's.
   *
   * The list it is asked of decides. See the claim pop-up, which is opened
   * precisely to FIND a claim, and where "filed in the first week of May" is the
   * thing somebody rings up about.
   */
  showFiledDateFilter?: boolean;
  /**
   * Whether to offer the cards / table switch.
   *
   * OFF FOR A CALLER WHOSE ANSWER IS ALWAYS THE TABLE. The deck exists to put
   * one claim under a thumb; a desktop pop-up opened to find a claim among
   * thirty wants the columns, and a toggle whose other position nobody would
   * choose is a control that only costs a slot on the row.
   *
   * It hides the control and nothing else — `view` still falls to cards on a
   * phone, where a nine-column table is not a smaller table but a worse list.
   * See `view` below.
   */
  showViewToggle?: boolean;
  /** Distinct requesting branches, for the branch dropdown. */
  branchOptions: string[];
  /**
   * A control of the caller's own, on the filter row where the branch dropdown
   * used to be.
   *
   * A SLOT AND NOT A PROP PAIR, because what belongs there is not this table's
   * business: the queue on `/claims/death-claim` puts the claim NATURE there,
   * a question that scopes the whole rail rather than filtering the list, and
   * this component should not have to know that such a thing exists. It only
   * knows there is room on the row.
   */
  toolbarSlot?: React.ReactNode;
  /**
   * How much of the row the slot takes on a desktop.
   *
   * One dropdown fits the 150px the branch picker had; a caller putting TWO
   * there — the conveyor's nature and year — needs the room for both, and
   * squeezing them into one dropdown's width turns both labels into ellipses.
   * Ignored in compact, where the slot flexes with the rest of the rail's row.
   */
  toolbarSlotWidth?: string;
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
  /**
   * Lay the queue out for a NARROW COLUMN rather than for the viewport.
   *
   * Every responsive decision in here is keyed to the window's width, which is
   * the right question when this table has the wide half of a dashboard to
   * itself. It is the wrong one when the queue has been put in a 360px rail
   * beside the work: the viewport still says "desktop", so the columned table
   * view and the four-control toolbar would be chosen for a column that has
   * room for neither.
   *
   * Compact says so explicitly: cards only and no view toggle, with the toolbar
   * stacked into two rows — the search, then the DESKTOP filter controls under
   * it (type dropdown, branch dropdown, more-filters button).
   *
   * The dropdowns and not the phone's pill row, deliberately. A pill row spends
   * a whole row showing three options so that one can be chosen; a dropdown
   * states the current filter in words — "Special (11)" — in a third of the
   * width, which leaves the rail's remaining height to the claims. The rail is
   * short on height, not on the user's willingness to open a menu.
   *
   * It does NOT touch the scrolling behaviour: a rail on a desktop still gets
   * the scrolling card list rather than the swipe deck, which is correct for a
   * mouse.
   *
   * Off by default, so the dashboard that already calls this is unchanged.
   */
  compact?: boolean;
  /**
   * Reference of the claim open beside this queue, which its card is ringed to
   * show.
   *
   * Master-detail needs it: when the queue is a rail and the claim it picked is
   * in the column next to it, nothing otherwise says WHICH of thirty rows is
   * the one being read. Handled here rather than by the caller passing a
   * `renderCard`, so there stays exactly one claim card in this module.
   *
   * Matched on the request reference, which every claim has, rather than on the
   * identity number the queue happens to display — that is a claim no in two of
   * the three queues and absent in the first.
   */
  selectedReference?: string;
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
  showTypeFilter = true,
  showMoreFilters = true,
  showFiledDateFilter = false,
  showViewToggle = true,
  branchOptions,
  toolbarSlot,
  toolbarSlotWidth = "150px",
  territoryOptions = [],
  benefitOptions = [],
  loadKey,
  originRef,
  compact = false,
  selectedReference,
  ...boxProps
}: DeathClaimsTableProps) {
  const [search, setSearch] = useState("");

  // The dropdown's three groups. Multi-select, so each is an ARRAY and empty
  // means "not narrowing" — a filter nobody has opened must not exclude
  // anything, and an empty array is the only value that says that without a
  // second flag beside it.
  //
  // BRANCH JOINED THEM (2026-09-08). It was a `<select>` of its own on the
  // toolbar, which made it the one second-tier filter that could not express
  // "Davao and Cebu" — an ordinary question to ask of a queue, and the very
  // reason the others are checkboxes. It also cost the row a control the rail
  // did not have width for.
  const [branches, setBranches] = useState<string[]>([]);
  const [territories, setTerritories] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  /**
   * The filed-date bound, as two "YYYY-MM-DD" strings — see `FilterDateRange`.
   *
   * ONE PIECE OF STATE FOR BOTH ENDS, because they are one answer: the panel
   * hands back a whole range on every change, and a pair of `useState`s would be
   * two renders for what the user experienced as one edit.
   */
  const [filed, setFiled] = useState({ from: "", to: "" });

  // Every queue is a different set of claims, so a territory ticked in one is
  // not necessarily on offer in the next. Cleared when the tab changes, which
  // is the same event the skeleton beat below runs on.
  useEffect(() => {
    setBranches([]);
    setTerritories([]);
    setBenefits([]);
    // THE DATES GO WITH THEM, and for a sharper version of the same reason: a
    // range left over from the last list cannot even be SEEN from the toolbar —
    // the button's tint says the queue is narrowed, but a queue filed entirely
    // outside that range simply comes up empty, which reads as no work rather
    // than as a filter.
    setFiled({ from: "", to: "" });
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
    useBreakpointValue({ base: false, lg: true }) ?? false;

  /**
   * Cards on a phone, the table on a desktop.
   *
   * The desktop default is the table because of what the two views are FOR. The
   * deck exists to put one claim under a thumb at a time; the table puts thirty
   * side by side under one set of column headings, which is how the queue is
   * actually worked at a desk — scanned, sorted, compared. The toggle is still
   * there, and picking from it wins from then on.
   */
  const view = chosenView ?? (isDesktop && !compact ? "table" : "cards");
  // `compact` refuses the table view outright rather than merely defaulting away
  // from it — the toggle that could pick it is not rendered either, so a stale
  // `chosenView` from before the prop was set must not be able to bring it back.
  const showTable = view === "table" && isDesktop && !compact;

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
      if (branches.length && !branches.includes(c.requestingBranch))
        return false;
      // Empty means the group is not narrowing — see the state above. Within a
      // group the ticks are OR (Davao OR Cebu); between groups they are AND, so
      // territory and benefit each cut what the other left.
      if (territories.length && !territories.includes(c.territoryCode))
        return false;
      if (benefits.length && !benefits.includes(c.benefits)) return false;
      // THE DAY, NOT THE INSTANT. `filedAt` is a full ISO timestamp and the
      // bound is a date, so a claim filed at 08:00 on the To date must still be
      // inside a range that ends that day — comparing the whole string would put
      // "2026-05-06T08:00" after "2026-05-06" and drop it. Sliced to the day,
      // both ends are inclusive and ISO's own ordering does the comparison.
      const day = c.filedAt.slice(0, 10);
      if (filed.from && day < filed.from) return false;
      if (filed.to && day > filed.to) return false;
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
  }, [data, search, branches, territories, benefits, filed]);

  /**
   * THE BRANCHES ON OFFER, narrowed to the ticked territories.
   *
   * A BRANCH BELONGS TO A TERRITORY, which is what makes these two different
   * from every other pair of groups in the panel: territory and benefit are
   * independent questions, but picking a territory has already answered most of
   * the branch question. Leaving all forty branches listed underneath it would
   * offer thirty-odd that the territory above has just excluded — every one of
   * them a tick that empties the list.
   *
   * DERIVED FROM THE CLAIMS, not from a branch/territory reference table. The
   * caller passes a flat list of branch names, and the pairing is already in the
   * rows: every claim carries both. Reading it here means the narrowing is true
   * of THIS list rather than of the org chart — a territory whose branches filed
   * nothing this week narrows to nothing, which is the honest answer.
   *
   * `null` for "not narrowing" rather than the full list, so the difference
   * between "no territory picked" and "a territory with no branches" stays
   * visible below instead of collapsing into the same array.
   */
  const branchesInTerritories = useMemo(() => {
    if (territories.length === 0) return null;
    return new Set(
      data
        .filter((c) => territories.includes(c.territoryCode))
        .map((c) => c.requestingBranch),
    );
  }, [data, territories]);

  const offeredBranches = useMemo(
    () =>
      branchesInTerritories
        ? branchOptions.filter((b) => branchesInTerritories.has(b))
        : branchOptions,
    [branchOptions, branchesInTerritories],
  );

  /**
   * Drop branch ticks the territory has just taken off the list.
   *
   * THE ONE THING THIS PAIRING MUST NOT DO. A branch ticked before a territory
   * was chosen can fall outside it, and it would then go on narrowing the list
   * from a checkbox that is no longer drawn — an invisible filter, which is the
   * exact failure the funnel's green tint exists to prevent. Worse, branch and
   * territory are ANDed, so a stale tick does not merely narrow: it empties the
   * table and gives no way to see why.
   *
   * The identity check matters: returning a new array every run would make this
   * effect its own dependency's cause.
   */
  useEffect(() => {
    if (!branchesInTerritories) return;
    setBranches((current) => {
      const next = current.filter((b) => branchesInTerritories.has(b));
      return next.length === current.length ? current : next;
    });
  }, [branchesInTerritories]);

  /**
   * The span of filed dates the list actually covers, so neither picker offers a
   * day that could only ever empty it.
   *
   * OFF `data` AND NOT OFF `filtered`, which would be circular: narrowing the
   * range would narrow the bounds, which would narrow the range again, and the
   * two ends would walk towards each other every time they were touched.
   */
  const filedSpan = useMemo(() => {
    if (data.length === 0) return { min: undefined, max: undefined };
    const days = data.map((c) => c.filedAt.slice(0, 10)).sort();
    return { min: days[0], max: days[days.length - 1] };
  }, [data]);

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
  const deckKey = `${loadKey ?? ""}|${filter}|${search}|${branches.join(",")}|${territories.join(",")}|${benefits.join(",")}|${pageSize}`;

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
      <Flex
        // A COLUMN WHEN COMPACT. The dropdowns and the search cannot share one
        // 360px row, so the rail stacks them: search, then the filters under it.
        direction={compact ? "column" : "row"}
        align={compact ? "stretch" : "center"}
        gap={2}
        mb={3}
        flexShrink={0}
      >
        {/* Leftmost, and first of everything: the view toggle decides what the
            whole section IS — a deck of cards or a table — where the two
            dropdowns only decide which claims it holds. Desktop only, since a
            phone gets cards and no toggle; see `isDesktop`. */}
        {/* THE FILTER GROUP. In a compact column it keeps the two dropdowns and
            the more-filters button — the same controls a desktop toolbar has,
            which is what the rail wants: a dropdown states the current filter in
            words and costs one row, where the pill row it replaces spent a full
            row on three options that are mostly not chosen.

            `order` puts it UNDER the search when stacked, so the field stays at
            the top of the toolbar where it is on every other width. */}
        <Flex
          align="center"
          gap={2}
          flexShrink={0}
          order={compact ? 1 : 0}
          w={compact ? "full" : undefined}
        >
          {/* No toggle in compact: there is no table view to toggle TO. */}
          {showViewToggle && isDesktop && !compact && (
            <ClaimsViewToggle value={view} onChange={setChosenView} />
          )}

          {/* The pill row collapses into this, and its own row goes with it.
              Ahead of the branch picker because it is the filter the queue is
              worked by; the branch narrows on top of it.

              Fixed 150px in a toolbar with room; in the rail the two dropdowns
              share what is left of the row after the icon button, so they flex
              instead — a hard 150 + 130 + 36 overflows a 360px column. */}
          {showTypeFilter && (
          <DeathClaimsFilterSelect
            value={filter}
            onChange={onFilterChange}
            counts={counts}
            display={compact ? "block" : { base: "none", lg: "block" }}
            w={compact ? "auto" : "150px"}
            flex={compact ? "1 1 0" : undefined}
            minW={compact ? 0 : undefined}
          />
          )}

          {/* THE SLOT THE BRANCH DROPDOWN USED TO FILL. A caller with a
              question of its own to put on this row puts it here — on
              `/claims/death-claim` that is which NATURE of claim the queue
              is of, which is the one choice above the queue rather than inside
              it. Nothing renders when no caller passes one, and the row is then
              the type filter, the funnel and the search. */}
          {toolbarSlot && (
            <Box
              w={compact ? "auto" : toolbarSlotWidth}
              flex={compact ? "1 1 0" : undefined}
              minW={compact ? 0 : undefined}
              flexShrink={compact ? undefined : 0}
            >
              {toolbarSlot}
            </Box>
          )}

          {/* THE FILED-DATE BOUND, ON THE ROW — ahead of the funnel and behind
              nothing, because it is the filter a reader arrives already meaning
              to use. See {@link DeathClaimsFiledRange} for why this one is not
              behind the icon with the other three. */}
          {showFiledDateFilter && (
            <DeathClaimsFiledRange
              from={filed.from}
              to={filed.to}
              min={filedSpan.min}
              max={filedSpan.max}
              onChange={setFiled}
            />
          )}

          {/* Last of the filters: the type names itself and the queue is worked
              by it; these narrow what it leaves, so they sit at the end of the
              group behind one icon. See {@link MoreFilters}. */}
          {showMoreFilters && (
          <MoreFilters
            // A GROUP WITH NO OPTIONS IS NOT A SECTION. A caller that offers
            // branch and territory but not benefit passes an empty list for the
            // third, and drawing it would put a heading over "nothing to filter
            // by in this queue" — which reads as a queue with no benefits on it
            // rather than as a question this list does not ask.
            groups={[
              {
                key: "territory",
                label: "Territory",
                // Filtered by code, listed by name — the claims carry the code
                // and the reference table is the only place the name it is
                // called by is written down. Same shape as the benefits below.
                options: territoryOptions.map((t) => ({
                  value: t,
                  label: db.getTerritoryName(t),
                })),
                selected: territories,
                onChange: setTerritories,
              },
              {
                key: "branch",
                label: "Branches",
                // UNDER THE TERRITORY, AND NARROWED BY IT. A branch belongs to
                // exactly one territory, so the two are not siblings the way
                // territory and benefit are — they are a whole and its parts,
                // and the panel reads down from the larger to the smaller.
                //
                // Filtered and listed by the same name — the claim carries the
                // branch's full name, and there is no code to translate.
                options: offeredBranches.map((b) => ({ value: b, label: b })),
                selected: branches,
                onChange: setBranches,
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
            ].filter((group) => group.options.length > 0)}
          />
          )}
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
          // Full width at the top of a stacked toolbar; capped and pushed right
          // when it shares a row with the filters.
          maxW={compact ? "full" : "420px"}
          ml={compact ? 0 : "auto"}
          order={compact ? 0 : 1}
        />
      </Flex>

      {/* Row 2 — item filter (Special / Regular / All), full width. Mobile only:
          on a desktop this is the dropdown in the row above, and this row is not
          hidden so much as absent — the margin goes too, which is the point.

          Compact does NOT keep it. It briefly did, back when the rail hid the
          whole filter group; the rail carries the dropdown now, and rendering
          both would state the same filter twice and spend a row doing it. */}
      <Box
        mb={3}
        display={
          compact || !showTypeFilter
            ? "none"
            : { base: "block", lg: "none" }
        }
      >
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
              {/* Tighter between cards in a rail too: the gap is read as part of
                  the same density the card itself was tightened for. */}
              {/* No gap in compact: the rows carry their own dividing rule and
                  a gap between them would leave the rule floating in the middle
                  of a gutter rather than separating two rows. */}
              <CardGrid ref={listRef} gap={compact ? 0 : 2}>
                {filtered.map((claim) => (
                  <React.Fragment key={claim.id}>
                    {renderCard ? (
                      renderCard(claim, showTypeDot)
                    ) : (
                      <ClaimCard
                        claim={claim}
                        showTypeDot={showTypeDot}
                        selected={claim.reference === selectedReference}
                        compact={compact}
                        identifier={identifier}
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
                          selected={claim.reference === selectedReference}
                          compact={compact}
                          identifier={identifier}
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
