"use client";

// Shared pieces for the claims area's swipe carousels.
//
// Several lists page horizontally — the processor's queue, the supervisor's
// queue, a plan holder's claim history — and they must read as the same
// control: chevrons flanking a row of dots, the current one drawn as a green
// pill. Keeping the paging and the indicator here is what stops them drifting
// apart as each list evolves.

import { useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

/** Split items into fixed-size pages for a swipe carousel. */
export function paginate<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  const step = Math.max(1, size);
  for (let i = 0; i < items.length; i += step) {
    pages.push(items.slice(i, i + step));
  }
  return pages;
}

/**
 * Tracks which page a horizontally-snapping list is scrolled to.
 *
 * Wire `trackRef` and `handleScroll` to the scrolling element, then feed
 * `active` and `goToPage` into {@link SwipeIndicator}. Call `reset` when the
 * contents change so the carousel returns to the first page.
 */
export function useSwipePages() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    if (page !== active) setActive(page);
  };

  const goToPage = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const reset = () => {
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  };

  return { trackRef, active, handleScroll, goToPage, reset };
}

interface SwipeIndicatorProps {
  pageCount: number;
  /** Index of the page currently in view. */
  active: number;
  onGoTo: (index: number) => void;
}

/**
 * Chevrons + page dots — the standard "this list swipes" affordance. The dots
 * are tappable, so it doubles as pagination on a desktop pointer. Renders
 * nothing when there is only one page.
 */
export function SwipeIndicator({
  pageCount,
  active,
  onGoTo,
}: SwipeIndicatorProps) {
  if (pageCount <= 1) return null;

  return (
    <Flex justify="center" align="center" gap={2} pt={3} color="gray.400">
      <LuChevronLeft size={14} />
      <HStack gap={1.5}>
        {Array.from({ length: pageCount }, (_, i) => (
          <Box
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onGoTo(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onGoTo(i);
            }}
            h="6px"
            w={i === active ? "16px" : "6px"}
            borderRadius="full"
            bg={i === active ? BRAND_COLORS.primaryGreen : "gray.300"}
            transition="all 0.2s ease"
            cursor="pointer"
            aria-label={`Go to page ${i + 1}`}
            aria-current={i === active}
          />
        ))}
      </HStack>
      <LuChevronRight size={14} />
    </Flex>
  );
}
