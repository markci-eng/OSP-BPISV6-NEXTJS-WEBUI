"use client";

import { Box, Drawer, Flex, Text,
  CloseButton,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/**
 * The green "<" that leaves whatever is open.
 *
 * Lifted out of the bar below because it is no longer only a bar's: the desktop
 * claim view puts the same control on a line of its own above the plan holder
 * card, where there is no title for a bar to hold. One definition, so the way
 * back looks and behaves the same wherever it is reached from.
 *
 * Given `children` it names its destination beside the chevron. That is for the
 * standalone use: a bare arrow in a bar is read off the title next to it, and
 * one sitting alone above a card has nothing to be read off — the type sizing
 * here was always for a label, it just had none to draw until now.
 *
 * `iconPlacement="end"` is for the right-aligned use — the claim view's rail,
 * where the control sits against the column's right edge. The arrow moves after
 * the words AND turns around: an arrow is read as pointing the way out, and a
 * "<" on the right-hand end points back into its own label. Which direction is
 * "out" is a question about where the control sits, not about where it goes.
 */
export function BackButton({
  onBack,
  label = "Go back",
  children,
  iconPlacement = "start",
}: {
  onBack: () => void;
  /** What it is announced as, when "back" is not specific enough. */
  label?: string;
  /** Where it goes, spelled out beside the chevron. */
  children?: React.ReactNode;
  /** Which side of the label the arrow sits on. */
  iconPlacement?: "start" | "end";
}) {
  const atEnd = iconPlacement === "end";

  return (
    <Flex
      as="button"
      align="center"
      gap="2px"
      onClick={onBack}
      aria-label={label}
      cursor="pointer"
      color="green.600"
      _dark={{ color: "green.400" }}
      fontSize="14px"
      fontWeight="600"
      letterSpacing="0.01em"
      flexShrink={0}
      // A little more room on the WORDS' side than the arrow alone needs, so
      // the hover fill reads as a target and not as a highlight that stops
      // mid-word. Mirrored with the arrow, along with the margin that keeps the
      // control clear of whatever it sits next to.
      pl={atEnd ? (children ? 2 : 1) : 1}
      pr={atEnd ? 1 : children ? 2 : 1}
      py={1}
      ml={atEnd ? 1 : undefined}
      mr={atEnd ? undefined : 1}
      borderRadius="md"
      _hover={{ bg: "green.50" }}
      _active={{ transform: "scale(0.93)" }}
      transition="all 0.14s ease"
      userSelect="none"
    >
      {atEnd ? (
        <>
          {children}
          <LuChevronRight size={20} strokeWidth={2.5} />
        </>
      ) : (
        <>
          <LuChevronLeft size={20} strokeWidth={2.5} />
          {children}
        </>
      )}
    </Flex>
  );
}

/**
 * A drawer header styled after the library page header — `PageScrollShell`
 * (osp-ui-kit) as `Page.Root` renders it on mobile: sticky translucent bar, a
 * green "<" on the left, title over description, and a trailing slot that holds
 * what `Page.ToolContent` would. The library's own back button navigates to the
 * parent route, which is wrong inside an overlay, so this one closes the drawer
 * instead — the look of a page, the behaviour of a drawer.
 *
 * Shared by every full-height drawer in the claims planholder area (the claim
 * request detail, the beneficiary form, the payee form) so they cannot drift
 * apart: one bar, defined once.
 *
 * Renders `Drawer.Title`, so it must sit inside a `Drawer.Root` — unless
 * `asPage` is set, which is how the same bar is reused by content shown IN the
 * page rather than in an overlay (the desktop claim view). There is no drawer
 * around it there, and `Drawer.Title` outside a `Drawer.Root` throws.
 */
export function DrawerPageHeader({
  title,
  description,
  onBack,
  toolContent,
  asPage = false,
  dismiss = "back",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  onBack: () => void;
  toolContent?: React.ReactNode;
  /** Render outside a drawer — plain heading text, no `Drawer.Title`. */
  asPage?: boolean;
  /**
   * How the sheet is left: a back chevron on the leading edge, or a close cross
   * on the trailing one.
   *
   * "back" is the drawer's own — a full-height sheet stacked over a page reads
   * as somewhere you went, and you go back from it. "close" is for the same
   * content shown as a CENTRED dialog, which reads as something laid over the
   * page rather than a place; a chevron there points at nothing.
   */
  dismiss?: "back" | "close";
}) {
  const heading = (
    <Text
      as="h1"
      fontWeight="600"
      fontSize="16.5px"
      lineHeight="1.2"
      color="fg"
      letterSpacing="-0.01em"
      truncate
    >
      {title}
    </Text>
  );

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      flexShrink={0}
      px={2}
      pt="max(env(safe-area-inset-top, 0px), 12px)"
      pb={3}
      bg="bg/80"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="blackAlpha.200"
      _dark={{ borderColor: "whiteAlpha.200" }}
    >
      <Flex align="center" gap={2}>
        {dismiss === "back" && <BackButton onBack={onBack} />}

        <Box flex="1" minW={0} pl={dismiss === "close" ? 2 : 0}>
          {asPage ? heading : <Drawer.Title asChild>{heading}</Drawer.Title>}
          {description && (
            <Text fontSize="12.5px" color="fg.muted" mt="2px" truncate>
              {description}
            </Text>
          )}
        </Box>

        {toolContent && <Box mr={3}>{toolContent}</Box>}

        {dismiss === "close" && (
          <CloseButton size="sm" onClick={onBack} aria-label="Close" />
        )}
      </Flex>
    </Box>
  );
}

export default DrawerPageHeader;
