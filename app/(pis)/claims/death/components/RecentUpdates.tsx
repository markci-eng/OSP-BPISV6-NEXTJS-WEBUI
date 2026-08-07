"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionTitle } from "../../components/section-title";
import { paginate } from "../../components/swipe-carousel";
import { SwipeDeck, SwipeDots } from "../../components/swipe-deck";
import { useFittedPageSize } from "../../components/use-fitted-page-size";
import { RecentUpdatesDrawer } from "./RecentUpdatesDrawer";
import {
  allClaimUpdates,
  recentClaimUpdates,
  toFullName,
  type ClaimPhase,
  type ClaimUpdate,
} from "../death-claims-data";

/**
 * Fewest cards a page may hold. A tall screen shows more — the page size is
 * measured, not fixed — but never fewer than this, so the feed is always worth
 * looking at even on the shortest phone the dashboard has to run on.
 */
const MIN_PAGE_SIZE = 3;

/**
 * Fewest pages the deck must keep, which is what caps the page size.
 *
 * Without it a very tall viewport could fit most of the feed on one page, and
 * since every page carries the same number of cards, the remainder would be
 * pushed into the drawer — a deck of one page with a third of its items hidden.
 * Two pages is the point at which it is still a carousel.
 */
const MIN_PAGES = 2;

/**
 * Space that must stay clear below the last card: the bottom navigation, which
 * overlays the final 62px of the viewport, the deck's own dots underneath the
 * track (18px), and a little air so the last card is not flush against the nav.
 */
const BOTTOM_RESERVE = 88;

/**
 * How many updates the rail shows at once.
 *
 * A COUNT, not a height, and that is the whole difference: the rail is sticky,
 * so its height is what it costs the processor for as long as they are on the
 * page. Sized to the viewport it would take a third of a tall screen and hold
 * it there. Four cards is a glance — enough to be worth looking at, few enough
 * that the column beside the work stays quiet.
 *
 * Divides {@link RECENT_UPDATES_COUNT} exactly, so no update is stranded in a
 * part-page: twelve updates, three pages, and the rest of the history is behind
 * "Show all".
 */
const RAIL_PAGE_SIZE = 4;

/**
 * Status colour for each phase the feed can show, drawn as a card's left border.
 *
 * No legend accompanies it: a processor reads these colours all day and does not
 * need them spelled out, and a key above the list costs a row of chrome on the
 * screen where vertical space is scarcest.
 *
 * No "Pending" either — those never reach this feed (see `activityFeed`).
 */
const PHASE_COLOR: Partial<Record<ClaimPhase, string>> = {
  "For Approval": "yellow.400",
  Denied: "red.500",
  Approved: "green.500",
};

const phaseColor = (phase: ClaimPhase) => PHASE_COLOR[phase] ?? "gray.400";

/**
 * One update as a card. Status is carried by the thick left border rather than
 * a dot, so the colour reads down the edge of the stack without competing with
 * the text for space.
 *
 * Ordered the way the rest of the claims area orders a claim: the CLAIM NO
 * first — this claim's reference across every system — then the plan and the
 * deceased, with the remark recorded against the status change underneath. The
 * remark is the one free-text field here, so it is clamped to a single line;
 * the full text is on the plan holder, one tap away.
 */
export function UpdateCard({
  update,
  onClick,
}: {
  update: ClaimUpdate;
  onClick?: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderLeftWidth="4px"
      borderLeftColor={phaseColor(update.phase)}
      borderRadius="xl"
      bg="white"
      p={3}
      boxShadow="xs"
      cursor="pointer"
      transition="all 0.18s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: BRAND_COLORS.primaryGreen,
        borderLeftColor: phaseColor(update.phase),
      }}
    >
      {/* 1 — the claim no, with when it moved. */}
      <Flex justify="space-between" align="baseline" gap={2}>
        <Text fontSize="sm" fontWeight="700" color="gray.800" truncate>
          {update.claimNo ?? update.reference}
        </Text>
        <Text fontSize="10px" color="gray.400" flexShrink={0}>
          {update.timeAgo}
        </Text>
      </Flex>

      {/* 2 — the plan, then 3 — who died. */}
      <Text fontSize="xs" fontWeight="600" color="gray.600" mt="1px" truncate>
        {update.lpaNo}
        <Text as="span" fontWeight="400" color="gray.500">
          {" · "}
          {toFullName(update.deceased)}
        </Text>
      </Text>

      {/* 4 — the remark, clipped to one line. */}
      <Text fontSize="11px" color="gray.500" mt="3px" truncate>
        {update.remarks}
      </Text>
    </Box>
  );
}

/**
 * Mobile-first feed of the latest activity on the processor's current claims.
 *
 * Two controls, one list. In the dashboard's side rail — a desktop, a pointer —
 * it is a plain scrolling list bounded by the card it sits in: no pages, no
 * dots, nothing to swipe, and every recent update reachable with the wheel. On a
 * phone it is the paged deck described below. The difference is the input, not
 * the content: both show {@link recentClaimUpdates}, and both send the whole
 * history to the drawer.
 *
 * The page size is measured, not fixed: as many cards as the screen can show
 * without pushing the feed under the bottom navigation, and never fewer than
 * {@link MIN_PAGE_SIZE}. A tall phone gets four or five cards a page where a
 * short one gets three — the swipe is for reading history, and a taller screen
 * should not be made to swipe more for the same content.
 *
 * Every page carries the SAME number of cards. That is what keeps the deck
 * readable — a last page holding one card, in a control where each page is a
 * screenful, reads as the feed having broken rather than having ended. So the
 * count is rounded down to whole pages and the leftovers — one or two items —
 * live in the drawer, which holds the full history anyway.
 *
 * Tapping a card opens the plan holder the claim was filed against — the same
 * destination the supervisor's queue uses, since that page is where a claim is
 * actually read and acted on.
 */
export function RecentUpdates() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  // Which page of the rail's carousel is showing. The phone's deck keeps its
  // own position internally; this is the pointer-driven one.
  const [railPage, setRailPage] = useState(0);


  /**
   * Whether the feed is in the dashboard's side rail rather than stacked down a
   * page — which is the same question as "is this being driven by a pointer".
   *
   * `xl` and not `lg`, because that is the width the rail becomes a column and a
   * card; under it the feed is still the full-width stacked section the phone
   * gets, and it keeps the phone's controls with it. Read from the theme's own
   * breakpoints, the same way the queue's table view decides it is on a desktop.
   *
   * `false` until it has measured, so the server and the first client render
   * agree; the rail's list settles on the pass after, which is before anything
   * is painted at a size the user can act on.
   */
  const isRail =
    useBreakpointValue({ base: false, xl: true }, { ssr: false }) ?? false;

  // The frame sits outside the deck, so its position is never touched by the
  // scale() the deck puts on a departing slide. The list is the first page's
  // stack, which is where a card's height and the gap between cards are read.
  //
  // Both are the DECK's, so both go unread in the rail, where there is no deck
  // to measure and the list is bounded by the card instead of counted into it.
  const frameRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pageSize = useFittedPageSize({
    frameRef,
    listRef,
    reserve: BOTTOM_RESERVE,
    min: MIN_PAGE_SIZE,
    // The feed is a single column of cards wherever it sits — a phone, or the
    // dashboard's side rail — so a row is a card and this cap reads as items.
    maxRows: Math.floor(recentClaimUpdates.length / MIN_PAGES),
  });

  // Whole pages only. Anything that does not fill a page is left to the drawer.
  const pageCount = Math.max(
    1,
    Math.floor(recentClaimUpdates.length / pageSize),
  );
  const pages = paginate(
    recentClaimUpdates.slice(0, pageCount * pageSize),
    pageSize,
  );

  // The rail's own pages — a fixed count, not a measured one. Clamped on read
  // rather than in an effect: `railPages` is derived from a constant so it will
  // not change under the state, and a clamp here cannot render an empty page.
  const railPages = paginate(recentClaimUpdates, RAIL_PAGE_SIZE);
  const railIndex = Math.min(railPage, railPages.length - 1);
  const railItems = railPages[railIndex] ?? [];

  const openPlanholder = (update: ClaimUpdate) =>
    router.push(`/claims/planholder/${encodeURIComponent(update.lpaNo)}`);

  return (
    // A plain box at every width now. There is nothing left here to divide a
    // height between: the rail is no longer a fixed-height card the feed had to
    // fill, and the feed shows a fixed number of cards rather than as many as
    // fit. So it is as tall as four cards and its heading, and says so.
    <Box>
      <SectionTitle
        title="Recent Updates"
        subtitle="Latest activity on your claims"
        // Same destination as pulling past the last slide — a tap for anyone who
        // does not think to swipe, and the only route on a pointer device.
        //
        // In the rail it SAYS "Show all". A bare chevron works on a phone, where
        // it is a thumb-sized target at the edge of a section and the swipe past
        // the end says the same thing again — but at the top of a card, with a
        // mouse, it is a 20px glyph that could as easily mean "next". The words
        // cost a few pixels of a heading row that has room for them.
        action={
          isRail ? (
            <Button
              variant="ghost"
              size="xs"
              borderRadius="full"
              color={BRAND_COLORS.primaryGreen}
              _hover={{ bg: "green.50" }}
              onClick={() => setShowAll(true)}
            >
              Show all
              <LuChevronRight size={14} />
            </Button>
          ) : (
            <IconButton
              aria-label="View all recent updates"
              size="sm"
              variant="ghost"
              color={BRAND_COLORS.primaryGreen}
              _hover={{ bg: "green.50" }}
              onClick={() => setShowAll(true)}
            >
              <LuChevronRight size={20} />
            </IconButton>
          )
        }
      />

      {isRail ? (
        /* Paged, not scrolled. The rail is sticky — it stays on screen for as
           long as the processor is on the page — so the feed cannot be sized to
           the viewport and cannot grow with its contents: either way it would
           hold a third of the screen for context nobody is reading right now.
           A fixed four, paged, costs the same room whatever the history holds.

           Arrows rather than the phone's dots and swipe. A wheel does nothing to
           a deck, the gesture it wants is a horizontal drag, and with a pointer
           the only way through is to hunt for the dots — which is why the
           previous version scrolled instead. Arrows are the pointer's version of
           the same control, and they say which way and how far in one glance. */
        <Box>
          <VStack align="stretch" gap={2}>
            {railItems.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                onClick={() => openPlanholder(update)}
              />
            ))}
          </VStack>

          {/* Only when there is somewhere to go. One page of updates needs no
              pager, and an always-disabled pair of arrows reads as broken. */}
          {railPages.length > 1 && (
            <Flex align="center" justify="center" gap={2} mt={3}>
              <IconButton
                aria-label="Previous updates"
                size="xs"
                variant="ghost"
                borderRadius="full"
                color={BRAND_COLORS.primaryGreen}
                _hover={{ bg: "green.50" }}
                disabled={railIndex === 0}
                onClick={() => setRailPage((p) => Math.max(0, p - 1))}
              >
                <LuChevronLeft size={16} />
              </IconButton>

              {/* The deck's own dots, not a second set drawn here: the phone
                  and the rail are paging the same feed, and two indicators that
                  could drift apart would be two answers to one question. The
                  active one stretches into a pill as well as changing colour, so
                  position survives being read at a glance. Tapping one jumps
                  straight to that page — the arrows are for stepping. */}
              <SwipeDots
                count={railPages.length}
                active={railIndex}
                onGoTo={setRailPage}
                pt={0}
              />

              <IconButton
                aria-label="More recent updates"
                size="xs"
                variant="ghost"
                borderRadius="full"
                color={BRAND_COLORS.primaryGreen}
                _hover={{ bg: "green.50" }}
                disabled={railIndex === railPages.length - 1}
                onClick={() =>
                  setRailPage((p) => Math.min(railPages.length - 1, p + 1))
                }
              >
                <LuChevronRight size={16} />
              </IconButton>
            </Flex>
          )}
        </Box>
      ) : (
        /* One slide per page. Swiping past the last page opens the full feed —
           the deck shows a sample, the sheet holds everything. */
        <Box ref={frameRef}>
          <SwipeDeck
            label="Recent claim updates"
            moreLabel="Swipe for all updates"
            onMore={() => setShowAll(true)}
          >
            {pages.map((page, pi) => (
              <VStack
                key={pi}
                // One page is enough to measure a card and the gap between them.
                ref={pi === 0 ? listRef : undefined}
                align="stretch"
                gap={2}
              >
                {page.map((update) => (
                  <UpdateCard
                    key={update.id}
                    update={update}
                    onClick={() => openPlanholder(update)}
                  />
                ))}
              </VStack>
            ))}
          </SwipeDeck>
        </Box>
      )}

      {/* Either control shows the latest 12; the drawer holds the whole
          history. */}
      <RecentUpdatesDrawer
        updates={allClaimUpdates}
        open={showAll}
        onOpenChange={setShowAll}
        onSelect={(update) => {
          setShowAll(false);
          openPlanholder(update);
        }}
      />
    </Box>
  );
}

export default RecentUpdates;
