"use client";

// THE RAIL ON A PHONE — two buttons under the stage card, each opening a sheet.
//
// Below `lg` the rail is not a column, it is the top of the page, and stacked
// there the six tiles and the History card came to about 640px before the claim
// started. The conveyor serves ONE claim; the first screen should be it.
//
// So the stage card stays inline — it says which queue this is and is the way
// out of it — and the actions and History collapse to one strip. Each button
// carries the number that would have made a processor open it: Edit's pending
// changes on Actions, the period's total on History. Tapped, the SAME
// `ClaimActions` and `WorkLists` the desktop rail shows slide up from the bottom
// edge, where a thumb already is.
//
// AND A PINNED BAR ONCE THE STRIP IS SCROLLED PAST. On a phone the page header
// scrolls away with everything else, so deep in the documents the queue, the
// search and both sheets are a long way up. The bar brings the top of the rail
// back in one row: the stage tabs first, since they say which queue this is,
// then History, Actions and Search as icons, with Search at the far right. It
// shows only while the strip is ABOVE the screen, so the two never appear
// together. It floats at the BOTTOM of the screen (user, 2026-10-01), over the
// shell's navigation — see the bar itself.
//
// FROM `lg` THIS RENDERS NOTHING VISIBLE. The page hides the inline pair below
// `lg` and this strip and bar from it; the sheet is only reachable from them.
//
// SHARED WITH SERVICE PAYABLES (user, 2026-09-30: "make the service payables
// mobile like the death claim"). The first button is the page's own — Actions
// here, the billing number there — handed in as `primary`; History, the pinned
// bar and the sheets are one implementation for both.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Box,
  chakra,
  Flex,
  Portal,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { LuHistory, LuSearch } from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_SHAPE, FLOATING_BAR } from "../../components/section-card";
import {
  SHELL_NAV_HEIGHT,
  SHELL_NAV_HIDE_EASE,
  SHELL_NAV_SHOW_EASE,
  useShellNavHidden,
} from "../../components/use-shell-nav-hidden";
import { BottomSheet } from "../../components/bottom-sheet";
import { StageTabs, type Stage } from "./stage-card";

type Sheet = "primary" | "history";

/**
 * The room the pinned bar needs under a page's last card, not counting the
 * shell's navigation: its 46px, the 8px it floats at, 24px of air above it
 * (user, 2026-10-01: "add some spacing"), and the phone's safe area. A page
 * adds `SHELL_NAV_HEIGHT` while that is up.
 */
export const QUICK_BAR_ROOM =
  "calc(46px + 8px + 24px + env(safe-area-inset-bottom, 0px))";

/**
 * The page's own first button, and the sheet it opens.
 *
 * `label` is what the strip reads — a word, or the billing number itself;
 * `title` names the sheet and, with `ariaLabel`, the bar's icon.
 */
export interface QuickAccessPrimary {
  icon: IconType;
  label: ReactNode;
  title: string;
  /** Read out for the strip button and the bar's icon — say the number too. */
  ariaLabel: string;
  /** Something waiting — on the strip's right, and over the bar icon's corner. */
  badge?: ReactNode;
  render: (close: () => void) => ReactNode;
}

/** A red count — the same bubble the Edit tile wears. */
export function CountBubble({ count }: { count: number }) {
  return (
    <Box
      as="span"
      minW="18px"
      h="18px"
      px="5px"
      borderRadius="full"
      bg={BRAND_COLORS.destructiveRed}
      color="white"
      fontSize="10px"
      fontWeight="700"
      lineHeight="18px"
      textAlign="center"
      flexShrink={0}
      aria-hidden
    >
      {count}
    </Box>
  );
}

/**
 * One icon of the pinned bar, with its number over the corner.
 *
 * NO LABEL, because the bar is one row and the tabs need the width; the strip
 * it stands in for names both, and `label` still names it for a screen reader.
 */
function BarIconButton({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: IconType;
  label: string;
  onClick: () => void;
  badge?: ReactNode;
}) {
  return (
    <chakra.button
      type="button"
      aria-label={label}
      onClick={onClick}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="34px"
      flexShrink={0}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      color={BRAND_COLORS.primaryGreen}
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
      _active={{ bg: "gray.100" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Icon size={16} />
      {badge && (
        <Box position="absolute" top="-7px" right="-7px" display="flex">
          {badge}
        </Box>
      )}
    </chakra.button>
  );
}

function StripButton({
  icon: Icon,
  label,
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  icon: IconType;
  label: ReactNode;
  onClick: () => void;
  /** When the number on the right needs saying, not just showing. */
  "aria-label"?: string;
  /** What sits on the right — a count, or the pending-change bubble. */
  children?: ReactNode;
}) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...CARD_SHAPE}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      px={3}
      py={2.5}
      bg="white"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={{ bg: "gray.50" }}
      _active={{ bg: "gray.100" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Flex align="center" gap={2} minW={0}>
        <Box display="flex" color={BRAND_COLORS.primaryGreen} flexShrink={0}>
          <Icon size={15} />
        </Box>
        <Text fontSize="13px" fontWeight="600" color="gray.800" truncate>
          {label}
        </Text>
      </Flex>
      {children}
    </chakra.button>
  );
}

export function MobileQuickAccess({
  stages,
  stage,
  onStageChange,
  onSearch,
  primary,
  historyCount,
  renderHistory,
}: {
  /** The stage card's own tabs, for the pinned bar — see `StageTabs`. */
  stages: Stage[];
  stage: string;
  onStageChange: (key: string) => void;
  /**
   * The bar's search icon — what the stage card's magnifier does, opening the
   * queue list. The bar has no field of its own: typing in a strip this thin
   * would be a worse copy of the list's search box.
   */
  onSearch: () => void;
  /** The page's own first button — see {@link QuickAccessPrimary}. */
  primary: QuickAccessPrimary;
  /** The History card's "All" for the period it is showing. */
  historyCount: number;
  /**
   * The sheets' contents, handed a `close` so anything that opens a dialog of
   * its own — Edit, a history row — takes the sheet down first rather than
   * stacking a pop-up on a sheet.
   */
  renderHistory: (close: () => void) => ReactNode;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  // Kept after closing so the content does not blank out mid-slide.
  const [shown, setShown] = useState<Sheet>("primary");
  const close = () => setSheet(null);
  const open = (key: Sheet) => {
    setShown(key);
    setSheet(key);
  };

  // PINNED ONLY WHEN THE STRIP HAS LEFT THROUGH THE TOP. Out of view below the
  // fold is not the same thing — that is a page that has not been scrolled yet.
  // The root is the viewport; the page's own scroller clips it, so intersection
  // still means "on screen". From `lg` the strip is `display: none`, never
  // intersects, and has a zero box, so the bar never pins there either.
  const stripRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const navHidden = useShellNavHidden();
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const io = new IntersectionObserver(([entry]) =>
      setPinned(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
    );
    io.observe(strip);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SimpleGrid ref={stripRef} columns={2} gap={2} hideFrom="lg">
        <StripButton
          icon={primary.icon}
          label={primary.label}
          aria-label={primary.ariaLabel}
          onClick={() => open("primary")}
        >
          {primary.badge}
        </StripButton>
        <StripButton
          icon={LuHistory}
          label="History"
          onClick={() => open("history")}
        >
          <Text
            fontSize="13px"
            fontWeight="600"
            color="gray.500"
            fontVariantNumeric="tabular-nums"
            flexShrink={0}
          >
            {historyCount}
          </Text>
        </StripButton>
      </SimpleGrid>

      {/* THE PINNED BAR. Portalled, because `position: fixed` measures from
          the nearest transformed ancestor rather than the screen, and the shell
          is free to add one. Slid out rather than unmounted when not pinned, so
          it arrives instead of appearing — and `inert` then, so a hidden bar
          cannot take a tap or a Tab key.

          AT THE BOTTOM, WHERE THE THUMB IS (user, 2026-10-01: "we should place
          the quick action in the bottom"). It rides the shell's navigation the
          way Service's Prev / Next bar did before it went inline: 8px off the
          screen's foot while the navigation is tucked away, lifted above it
          while it is up, on the navigation's own easing — so the two never
          overlap. See `useShellNavHidden`. The page leaves room for it under
          its last card — see `QUICK_BAR_ROOM`. */}
      <Portal>
        <Flex
          hideFrom="lg"
          position="fixed"
          // FLOATING, 12px in from the screen's sides — half the page's 24px
          // gutter, so it stands a little wider than the cards under it
          // without running edge to edge (user, 2026-09-30). See `FLOATING_BAR`.
          bottom="calc(8px + env(safe-area-inset-bottom, 0px))"
          insetX={3}
          align="center"
          gap={2}
          {...FLOATING_BAR}
          // Hidden past its own height AND the gap under it, or its shadow
          // would still show along the bottom edge.
          transform={
            !pinned
              ? "translateY(calc(100% + 24px))"
              : navHidden
                ? "translateY(0)"
                : `translateY(-${SHELL_NAV_HEIGHT})`
          }
          transition={`transform ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
          aria-hidden={!pinned}
          inert={!pinned}
        >
          <Box flex="1" minW={0}>
            <StageTabs
              stages={stages}
              active={stage}
              onStageChange={onStageChange}
            />
          </Box>

          {/* HISTORY, ACTIONS, SEARCH — Search at the far right (user,
              2026-09-30), where the stage card keeps its magnifier. */}
          {/* NO COUNT ON HISTORY HERE (user, 2026-09-30) — only Actions keeps
              a number, so a bubble on the bar always means something waits. */}
          <BarIconButton
            icon={LuHistory}
            label="History"
            onClick={() => open("history")}
          />
          <BarIconButton
            icon={primary.icon}
            label={primary.ariaLabel}
            onClick={() => open("primary")}
            badge={primary.badge}
          />
          <BarIconButton
            icon={LuSearch}
            label="Search the queue"
            onClick={onSearch}
          />
        </Flex>
      </Portal>

      {/* FITTED, with the shared cap — neither sheet's rows change while it is
          open. History's card drops its own "History" eyebrow below `lg` so
          the sheet does not say it twice. See `BottomSheet`. */}
      <BottomSheet
        title={shown === "primary" ? primary.title : "History"}
        open={sheet !== null}
        onClose={close}
      >
        {shown === "primary" ? primary.render(close) : renderHistory(close)}
      </BottomSheet>
    </>
  );
}

export default MobileQuickAccess;
