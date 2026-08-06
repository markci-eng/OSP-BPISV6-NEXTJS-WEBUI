"use client";

// A swipeable deck of slides for the claims area.
//
// Each slide takes the FULL width of the display area and is centred in it, so
// nothing is clipped at the frame and no content has to be hidden behind a
// card's padding to keep it from reading as noise. What tells you there is more
// is a row of dots underneath — no chevrons, since the gesture is the swipe and
// an arrow only invites a tap that a dot already handles.
//
// Slides keep a gap between them, which is invisible at rest — a centred slide
// pushes its neighbours entirely off-screen — and appears only mid-swipe, as
// separation between the outgoing and incoming card.
//
// Depth comes from `transform: scale()` plus a fade, applied ONLY to the slide
// on its way out — never to the one arriving, which holds full size and full
// opacity the whole way in. A card that grows and un-fades as it lands looks like
// it is being built in front of you; one that simply arrives, while the card
// behind it shrinks away, reads as a stack being dealt. The effect trails the
// gesture rather than sitting on one edge, so swiping back reverses which side
// recedes.
//
// Both properties are transforms of paint, not of layout: the track's scroll
// geometry stays exactly that of the untransformed slides, so scaling cannot
// reflow the row mid-swipe or fight the scroll snapping, and the compositor can
// run the whole animation without laying the page out again.
//
// None of this is visible at rest, and that is by design — a centred slide fills
// the track, so its neighbours are off-screen entirely. The scale and the fade
// exist for the duration of the gesture only.
//
// Paging is native CSS scroll snapping, so the gesture is the platform's own —
// correct momentum, correct rubber-banding, works with a trackpad and a
// touchscreen alike. The only thing tracked in React is WHICH slide is centred,
// and that only to drive the scale, the fade, and the active dot.

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuChevronsRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface SwipeDeckProps {
  /** One slide per child. */
  children: ReactNode;
  /** Scale applied to the slide on its way out. */
  restScale?: number;
  /**
   * Opacity applied to the slide on its way out. Low enough that it visibly
   * fades as it leaves, rather than just sliding out of frame.
   */
  restOpacity?: number;
  /**
   * Space between slides, as a Chakra spacing token. Only ever seen mid-swipe:
   * at rest the centred slide fills the track and its neighbours sit outside it.
   */
  gap?: number;
  /** Describes the deck to assistive tech, e.g. "Pending claim totals". */
  label?: string;
  /**
   * Optional action past the end of the deck.
   *
   * Given this, the deck grows a narrow trailing strip after the last slide. The
   * strip is NOT a snap target and NOT a page: the deck cannot come to rest on
   * it, it has no dot, and it is never reported as the slide in focus.
   *
   * It is revealed by pulling past the last slide, and the action runs only when
   * BOTH are true: the scroll has reached its full extent — the strip's whole
   * width, so brushing the end of the list is not enough — and the user has let
   * go. Dragging through the strip to see what is there, or holding at the end
   * and pulling back, does nothing. Let go and mandatory snapping carries the
   * deck back to the last slide by itself.
   *
   * Also tappable, since a swipe is not the only way people drive a carousel.
   */
  onMore?: () => void;
  /** Text on the trailing strip. Only used with `onMore`. */
  moreLabel?: string;
}

/**
 * How close to the end of the scroll range counts as "all the way", in pixels.
 * Sub-pixel scroll offsets and rounding mean the end is rarely hit exactly.
 */
const END_EPSILON = 2;

/**
 * Which slide is nearest the middle of the track.
 *
 * Compares each slide's centre against the track's, rather than dividing
 * `scrollLeft` by an assumed slide width. That way it stays correct whatever
 * `gap` is set to, and during the momentum of a swipe that lands between two
 * slides.
 *
 * `count` bounds it to the real slides: the trailing action strip is a child of
 * the track too, but it is not a page and must never be reported as the one in
 * focus.
 */
function nearestSlide(track: HTMLDivElement, count: number): number {
  const middle = track.scrollLeft + track.clientWidth / 2;
  let nearest = 0;
  let shortest = Infinity;

  Array.from(track.children)
    .slice(0, count)
    .forEach((node, index) => {
      const slide = node as HTMLElement;
      const distance = Math.abs(
        slide.offsetLeft + slide.offsetWidth / 2 - middle,
      );
      if (distance < shortest) {
        shortest = distance;
        nearest = index;
      }
    });

  return nearest;
}

/**
 * Dots marking position in the deck — the whole affordance, centred underneath.
 *
 * Tappable, so it doubles as paging for a mouse without needing arrows. The
 * active dot stretches into a pill rather than only changing colour, so position
 * survives being read at a glance or without colour.
 */
function SwipeDots({
  count,
  active,
  onGoTo,
}: {
  count: number;
  active: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <Flex justify="center" align="center" gap={1.5} pt={3}>
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          role="button"
          tabIndex={0}
          onClick={() => onGoTo(index)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onGoTo(index);
          }}
          h="6px"
          w={index === active ? "16px" : "6px"}
          borderRadius="full"
          bg={index === active ? BRAND_COLORS.primaryGreen : "gray.300"}
          transition="all 0.2s ease"
          cursor="pointer"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === active}
        />
      ))}
    </Flex>
  );
}

/** Width of the trailing action strip — how far past the end it must be pulled. */
const MORE_STRIP_WIDTH = 76;

/**
 * The trailing action strip, revealed by pulling past the last slide.
 *
 * A narrow outline rather than a card, with its label set vertically: it has to
 * read as the edge of the deck — the thing after the content — not as one more
 * item to take in. Stretches to the row's height so pulling it into view does
 * not change the deck's height.
 */
function MorePanel({
  label,
  onActivate,
}: {
  label: string;
  onActivate: () => void;
}) {
  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onActivate();
      }}
      aria-label={label}
      direction="column"
      align="center"
      justify="center"
      gap={2}
      h="100%"
      minH="88px"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="gray.300"
      borderRadius="xl"
      bg="gray.50"
      cursor="pointer"
      transition="all 0.18s ease"
      _hover={{ borderColor: BRAND_COLORS.primaryGreen, bg: "white" }}
    >
      <Box color={BRAND_COLORS.primaryGreen}>
        <LuChevronsRight size={18} />
      </Box>
      <Text
        fontSize="10px"
        fontWeight="600"
        color="gray.500"
        textAlign="center"
        lineHeight="1.3"
        // Reads bottom-to-top, so a long label fits a narrow strip without
        // wrapping into an unreadable column of single characters.
        css={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {label}
      </Text>
    </Flex>
  );
}

/**
 * Horizontally swipeable slides, each full-width and centred, with dots below.
 *
 * Renders each child as a slide. The slide arriving and the slide in focus are
 * both drawn at full size and opacity; only the one being left behind scales and
 * fades, so a swipe reads as tucking the last card away rather than as building
 * the next one.
 */
export function SwipeDeck({
  children,
  restScale = 0.92,
  restOpacity = 0.4,
  gap = 3,
  label,
  onMore,
  moreLabel = "Swipe for more",
}: SwipeDeckProps) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [pulledToEnd, setPulledToEnd] = useState(false);
  const lastScrollLeft = useRef(0);
  // These are read inside callbacks created once, so they reach them through refs
  // rather than through the closure.
  const slideCount = useRef(slides.length);
  slideCount.current = slides.length;
  const onMoreRef = useRef(onMore);
  onMoreRef.current = onMore;
  /** Whether the deck is currently held at the far end of its scroll range. */
  const atEnd = useRef(false);
  /** Whether a finger or pointer is still down on the track. */
  const isHeld = useRef(false);
  /** Latch, so one pull cannot run the action twice. */
  const hasFired = useRef(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Which way the deck is travelling, so only the DEPARTING slide gets the
    // effect. Guarded on an actual change: a scroll event that settles at the
    // same offset must not flip the direction and restyle both neighbours.
    const { scrollLeft } = track;
    if (scrollLeft !== lastScrollLeft.current) {
      setDirection(scrollLeft > lastScrollLeft.current ? "forward" : "back");
      lastScrollLeft.current = scrollLeft;
    }

    setActive(nearestSlide(track, slideCount.current));

    const pulled =
      scrollLeft >= track.scrollWidth - track.clientWidth - END_EPSILON;
    atEnd.current = pulled;
    setPulledToEnd(pulled);
    // Coming back off the end re-arms the latch, so the next pull works.
    if (!pulled) hasFired.current = false;
  }, []);

  /**
   * Run the action, but only if the gesture is genuinely over.
   *
   * A pull to the end is not a decision until the user lets go: someone dragging
   * through the strip to see what is there, or overshooting the last card, would
   * otherwise have a drawer thrown at them mid-swipe. So this checks that nothing
   * is still held before firing, and it is called from the events that mean
   * "released" — never from the scroll handler.
   */
  const fireIfReleased = useCallback(() => {
    if (!onMoreRef.current) return;
    if (isHeld.current) return;
    if (!atEnd.current) return;
    if (hasFired.current) return;

    hasFired.current = true;
    onMoreRef.current();
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    // Each slide is exactly the track's width, so aligning its left edge with
    // the scroll offset centres it.
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();
    // Subscribed natively rather than through React's `onScroll`, which is a
    // special-cased non-bubbling event. `passive` also tells the browser this
    // listener will not preventDefault, so it never delays the scroll itself.
    track.addEventListener("scroll", sync, { passive: true });
    // Slide widths are relative to the track, so the centred slide changes when
    // the track is resized even though nothing was scrolled.
    const observer = new ResizeObserver(sync);
    observer.observe(track);

    const hold = () => {
      isHeld.current = true;
    };
    const release = () => {
      isHeld.current = false;
      fireIfReleased();
    };

    // Pointer events cover mouse, touch and pen. `touchend` is kept as well for
    // Safari versions that do not deliver pointerup reliably after a fling; the
    // latch makes the overlap harmless.
    track.addEventListener("pointerdown", hold, { passive: true });
    track.addEventListener("pointerup", release, { passive: true });
    track.addEventListener("pointercancel", release, { passive: true });
    track.addEventListener("touchstart", hold, { passive: true });
    track.addEventListener("touchend", release, { passive: true });
    track.addEventListener("touchcancel", release, { passive: true });
    // Momentum can carry the deck to the end after the finger is already gone,
    // and a wheel or trackpad gesture has no release event at all. `scrollend`
    // covers both: it means the scroll has come to rest.
    track.addEventListener("scrollend", fireIfReleased);

    return () => {
      track.removeEventListener("scroll", sync);
      track.removeEventListener("pointerdown", hold);
      track.removeEventListener("pointerup", release);
      track.removeEventListener("pointercancel", release);
      track.removeEventListener("touchstart", hold);
      track.removeEventListener("touchend", release);
      track.removeEventListener("touchcancel", release);
      track.removeEventListener("scrollend", fireIfReleased);
      observer.disconnect();
    };
  }, [sync, fireIfReleased, slides.length]);

  // A single slide has nothing to swipe to, so it gets no dots and no shrinking.
  // The trailing strip counts: with an action there is always somewhere to pull.
  const isDeck = slides.length > 1 || !!onMore;

  /**
   * Whether a slide is on its way OUT — behind the deck's direction of travel.
   *
   * Only departing slides shrink and fade. The slide arriving stays full size and
   * fully opaque the whole way in, so it reads as already being what it will be
   * rather than assembling itself as it lands; the one being left behind is what
   * recedes. Swiping back reverses which side that is, so the effect always
   * trails the gesture instead of being pinned to one edge.
   */
  const isDeparting = (index: number) =>
    isDeck && (direction === "forward" ? index < active : index > active);

  return (
    <Box>
      <Flex
        ref={trackRef}
        // `relative` makes the track the offset parent the measurement assumes.
        position="relative"
        overflowX={isDeck ? "auto" : "visible"}
        scrollSnapType="x mandatory"
        gap={gap}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        scrollbarWidth="none"
        role={isDeck ? "group" : undefined}
        aria-label={isDeck ? label : undefined}
        aria-roledescription={isDeck ? "carousel" : undefined}
      >
        {slides.map((slide, index) => (
          <Box
            key={index}
            // Full width of the display area, and centred in it.
            flex="0 0 100%"
            minW={0}
            scrollSnapAlign="center"
            // Only transform and opacity animate — both compositor-only, so a
            // swipe never triggers layout.
            transform={isDeparting(index) ? `scale(${restScale})` : "scale(1)"}
            opacity={isDeparting(index) ? restOpacity : 1}
            transformOrigin="center"
            transition="transform 0.3s ease, opacity 0.3s ease"
          >
            {slide}
          </Box>
        ))}

        {onMore && (
          <Box
            // A narrow strip, NOT a full-width page, and deliberately not a snap
            // target: `scroll-snap-align: none` means the deck can never come to
            // rest here. It is revealed by pulling past the last slide and, once
            // released, mandatory snapping carries the deck back to that slide on
            // its own — no programmatic scroll fighting the gesture.
            flex={`0 0 ${MORE_STRIP_WIDTH}px`}
            minW={0}
            scrollSnapAlign="none"
            // Fades up as it is pulled into view, so the reveal itself is the
            // feedback that something is there.
            opacity={pulledToEnd ? 1 : restOpacity}
            transition="opacity 0.2s ease"
          >
            <MorePanel label={moreLabel} onActivate={onMore} />
          </Box>
        )}
      </Flex>

      {/* Dots count the real slides only — the strip is a threshold, not a page,
          and cannot be snapped to, so there is never a dot without a slide. */}
      {isDeck && (
        <SwipeDots count={slides.length} active={active} onGoTo={goTo} />
      )}
    </Box>
  );
}

export default SwipeDeck;
