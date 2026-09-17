"use client";

// Built on the shell of `components/common/drawers/request-history-drawer` — the
// shared area's drawer — rather than the bottom sheets used elsewhere in claims,
// so this follows the same direction as the rest of the company's UI: a side
// drawer that goes full-screen on mobile, a bordered header carrying the title in
// the primary colour, and a `CloseButton` in the corner.
//
// The search box and the batched loading follow the claims area's own list sheet
// (`../../planholder/components/PlanholderDocumentListDrawer`): a sentinel at the
// foot of the list, watched by an IntersectionObserver rooted on the scroll
// container, so the next batch is fetched by scrolling rather than by a button.
//
// Only the rows differ, and deliberately: they are the same {@link UpdateCard} the
// deck uses, so a claim looks identical in both places and the status colour on
// its left border keeps meaning what it means.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Small } from "st-peter-ui";
import { SearchBar } from "../../../components/search-bar";
import { toFullName, type ClaimUpdate } from "../../../death-claim/death-claims-data";
import { UpdateCard } from "./RecentUpdates";

/**
 * Updates added per batch once scrolling starts.
 *
 * Smaller than the 15 the document sheet uses, because these cards are ~86px tall
 * rather than a compact row: 8 already overflows a phone screen, so a larger batch
 * would only be paying to render rows nobody has scrolled to.
 */
const BATCH_SIZE = 8;

/**
 * The first view renders two batches instead of one.
 *
 * This is the feed pattern: open with more than fits, so the list is already
 * scrollable and there is somewhere to go, then fetch the next batch while the
 * reader is still working through what they have. A single batch that exactly
 * fills the screen leaves nothing below the fold — the list looks complete, and
 * the first scroll hits a wall while it loads.
 */
const INITIAL_LIMIT = BATCH_SIZE * 2;

interface RecentUpdatesDrawerProps {
  updates: ClaimUpdate[];
  open: boolean;
  /** Matches the shared drawer's API, so callers wire it up the same way. */
  onOpenChange: (open: boolean) => void;
  /** Open the plan holder a given update belongs to. */
  onSelect: (update: ClaimUpdate) => void;
}

/**
 * The whole activity feed in a drawer, searchable and loaded in batches.
 *
 * Reached two ways from the section: the "›" in its header, or pulling past the
 * last slide of the deck. The deck is deliberately a sample — three cards a page,
 * four pages — so this is where the full history lives.
 */
export function RecentUpdatesDrawer({
  updates,
  open,
  onOpenChange,
  onSelect,
}: RecentUpdatesDrawerProps) {
  const [search, setSearch] = useState("");
  // How many rows are currently rendered; grows as the sentinel scrolls in.
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  // Everything a processor might have to hand when looking for one update: the
  // claim no, the plan, the deceased, and the remark itself.
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return updates;
    return updates.filter((update) =>
      [
        update.claimNo,
        update.reference,
        update.lpaNo,
        toFullName(update.deceased),
        update.remarks,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    );
  }, [updates, search]);

  // Start again whenever the sheet opens, the query changes, or the list changes
  // underneath — otherwise a search would inherit the previous scroll's batches.
  useEffect(() => {
    setLimit(INITIAL_LIMIT);
  }, [open, search, updates.length]);

  // Read inside the observer, which is created once per sentinel node, so the
  // current total has to reach it through a ref rather than through the closure.
  const matchCount = useRef(0);
  matchCount.current = matches.length;
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Watches the sentinel, and loads the next batch when the reader reaches it.
   *
   * A CALLBACK ref, not an effect over `sentinelRef.current`. That was the
   * original bug: the drawer's content is portaled and mounts a tick after `open`
   * flips, so an effect keyed on `open` ran while the sentinel was still null,
   * bailed out, and never tried again — no observer, and the list never grew. A
   * callback ref runs when the node actually attaches, whenever that happens.
   *
   * The root is the viewport rather than the scroll container, which also removes
   * any dependence on Chakra forwarding a ref to `Drawer.Body`. Intersection is
   * still clipped by the scrolling ancestor, so it means what it should.
   */
  const attachSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setLimit((n) => (n < matchCount.current ? n + BATCH_SIZE : n));
    });
    io.observe(node);
    observerRef.current = io;
  }, []);

  // Drop the observer if the drawer unmounts while it is still attached.
  useEffect(() => () => observerRef.current?.disconnect(), []);

  const total = updates.length;
  const count = matches.length;
  const visible = matches.slice(0, limit);
  const searching = search.trim().length > 0;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth={1} borderColor="gray.200">
              <Box minW={0}>
                <Drawer.Title>
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="var(--chakra-colors-primary)"
                  >
                    Recent Updates
                  </Text>
                </Drawer.Title>
                <Small color="gray.500">
                  {searching
                    ? `${count} of ${total} ${total === 1 ? "update" : "updates"}`
                    : `${total} ${total === 1 ? "update" : "updates"} on your claims`}
                </Small>
              </Box>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            {/* Its own band above the scroll area, so the search stays put while
                the list moves under it. */}
            <Box
              px={6}
              py={3}
              borderBottomWidth="1px"
              borderColor="gray.100"
              flexShrink={0}
            >
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Claim no, plan, name, remark…"
                label="Search updates"
                // 36px, the height the claims toolbars share.
                size="sm"
              />
            </Box>

            <Drawer.Body overflowY="auto">
              {count === 0 ? (
                <Text color="gray.500" py={4}>
                  {searching
                    ? `Nothing matches “${search.trim()}”.`
                    : "No updates to show."}
                </Text>
              ) : (
                <>
                  <VStack align="stretch" gap={2} py={2} position="relative">
                    {visible.map((update) => (
                      <UpdateCard
                        key={update.id}
                        update={update}
                        onClick={() => onSelect(update)}
                      />
                    ))}

                    {/* Sentinel — reaching this loads the next batch. Positioned
                        rather than laid out, so sitting mid-list costs no space
                        and adds no gap between two cards.

                        Keyed on the query so a new search remounts it: observing
                        an element always delivers one immediate reading, which
                        re-evaluates the fresh result set. Deliberately NOT keyed
                        on `limit` — that would re-observe after every load and
                        walk straight through the whole list. */}
                    <Box
                      key={search}
                      ref={attachSentinel}
                      position="absolute"
                      top="50%"
                      left={0}
                      w="1px"
                      h="1px"
                      pointerEvents="none"
                      aria-hidden
                    />
                  </VStack>

                  {visible.length < count && (
                    <Flex justify="center" py={3}>
                      <Small color="gray.400">
                        Showing {visible.length} of {count}
                      </Small>
                    </Flex>
                  )}
                </>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default RecentUpdatesDrawer;
