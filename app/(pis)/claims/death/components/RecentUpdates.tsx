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
import { LuChevronRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ScrollFade } from "../../components/scroll-fade";
import { SectionTitle } from "../../components/section-title";
import { paginate } from "../../components/swipe-carousel";
import { SwipeDeck } from "../../components/swipe-deck";
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
 * Shortest the rail's scrolling list may be squeezed to.
 *
 * In the rail the feed takes whatever height the tiles above it leave, and a flex
 * child with `min-height: 0` will go to nothing rather than overflow — so on a
 * window short enough, the section would be a heading with a sliver of list under
 * it. This is the point at which it stops giving way and the CARD scrolls
 * instead: about two cards, the same floor the phone's deck keeps for the same
 * reason.
 */
const RAIL_MIN_HEIGHT = "180px";

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

  const openPlanholder = (update: ClaimUpdate) =>
    router.push(`/claims/planholder/${encodeURIComponent(update.lpaNo)}`);

  return (
    // In the rail this section is the part of the card that FLEXES: the tiles
    // above it keep their own height, this takes whatever is left, and the list
    // inside scrolls within that. Every box between the card and the list needs
    // a height and a `min-height: 0` for that to hold — break the chain anywhere
    // and the list grows to fit its twelve cards and the card scrolls instead.
    // Stacked, none of this applies and the section is as tall as its content.
    <Box
      display={{ xl: "flex" }}
      flexDirection="column"
      flex={{ xl: 1 }}
      minH={{ xl: 0 }}
    >
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
        /* A desktop SCROLLS the feed; it does not swipe it — the same call the
           claim queue makes one column over, for the same reasons. A deck is
           built for a thumb: a wheel does nothing to it, the gesture it wants is
           a horizontal drag, and the only way through with a pointer is to hunt
           for the dots. So in the rail there is no deck and no paging at all.
           Every recent update is in one list, bounded by the card, and the wheel
           works exactly where the pointer already is.

           No scrollbar either: what says there is more is the cards fading out
           at the edge they continue past — see `ScrollFade`. */
        <ScrollFade
          flex={1}
          minH={RAIL_MIN_HEIGHT}
          // A card lifts on hover, and a scroll box clips what leaves it, so the
          // shadow needs room either side. Pulled straight back out again with
          // the negative margin, which keeps the cards in line with the tiles
          // above rather than inset by four pixels from them.
          px={1}
          mx={-1}
        >
          <VStack align="stretch" gap={2}>
            {recentClaimUpdates.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                onClick={() => openPlanholder(update)}
              />
            ))}
          </VStack>
        </ScrollFade>
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
