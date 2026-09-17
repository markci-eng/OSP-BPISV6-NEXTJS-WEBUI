"use client";

// A section moved OFF the column and behind a button.
//
// Not everything a plan holder has is what a claim is decided on. The folder,
// the remarks and the plan's own details are read on the way to a decision; the
// payment ledger and the declared beneficiaries are looked UP — occasionally,
// deliberately, and never by scrolling past them. Sixty receipts inline is a
// screenful of column spent on the section least often wanted.
//
// So each becomes a button that says how much is behind it, and the section
// itself opens in a pop-up over the page. A DIALOG and not one of the dock's
// floating windows: a window is for holding two claims side by side, which is
// what the dock is for; this is a look-up you finish and close, and it should
// take the screen while it is open rather than compete with it.

import type { ReactNode } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_SHAPE } from "./section-card";

/**
 * Hides a node from the screen and keeps it for a screen reader.
 *
 * The pop-up's title is the section's OWN heading, inside the body — it is
 * already there and already right, and a dialog header repeating "Payments"
 * eighteen pixels above it would name the same thing twice. But a dialog still
 * has to be labelled, and `Dialog.Title` is what labels it, so the title is
 * rendered and taken off the screen rather than left out.
 */
const SR_ONLY = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;

export interface SectionLauncherProps {
  Icon: IconType;
  /** What is behind the button — "Payments". */
  title: string;
  /** The line under it: what the section holds, in a few words. */
  subtitle: string;
  /**
   * How many rows are behind it.
   *
   * ON THE BUTTON, because a button that only says "Payments" asks to be opened
   * before it can be dismissed — and the number is the whole answer most of the
   * time. A count of nothing is worth stating too, and reads as an answer rather
   * than as an empty section.
   */
  count: number;
  onClick: () => void;
}

/** The clickable card that stands where the section used to be. */
export function SectionLauncher({
  Icon,
  title,
  subtitle,
  count,
  onClick,
}: SectionLauncherProps) {
  return (
    <Flex
      // A REAL button, not a `role="button"` div with a keydown handler of its
      // own — which is the older idiom elsewhere in this area. The element
      // brings Enter and Space, the focus ring and the semantics for free, and
      // hand-rolling those is how one of them ends up missing. `Flex` types its
      // props for a div, so `type="button"` will not go through it; there is no
      // form on this page for it to matter to.
      as="button"
      onClick={onClick}
      align="center"
      gap={3}
      w="full"
      textAlign="left"
      // The shared shape, not a restatement of it — this IS a card, it just
      // happens to be one you can press. See `CARD_SHAPE`.
      {...CARD_SHAPE}
      bg="white"
      px={4}
      py={3}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: BRAND_COLORS.primaryGreen, bg: "#f4faf6" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Box
        p={2}
        borderRadius="lg"
        bg="#eaf5ee"
        color={BRAND_COLORS.darkGreen}
        flexShrink={0}
      >
        <Icon size={16} />
      </Box>

      <Box minW={0} flex="1">
        <Flex align="baseline" gap={2}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" truncate>
            {title}
          </Text>
          <Text fontSize="xs" fontWeight="700" color="gray.400" flexShrink={0}>
            {count}
          </Text>
        </Flex>
        <Text fontSize="xs" color="gray.500" truncate>
          {subtitle}
        </Text>
      </Box>

      <Box color="gray.400" flexShrink={0}>
        <LuChevronRight size={16} />
      </Box>
    </Flex>
  );
}

export interface SectionPopupProps {
  /** Names the dialog for a screen reader — see {@link SR_ONLY}. */
  title: string;
  open: boolean;
  onClose: () => void;
  /**
   * Widest the sheet may be on a desktop.
   *
   * 840 suits the look-ups this was built for: a ledger of four columns, a list
   * of beneficiaries, a folder. A DATA TABLE is a different shape — it has a
   * minimum below which its own columns start cutting their contents, and there
   * is no horizontal scrollbar inside a dialog worth offering instead. So the
   * caller with a table says how much room it needs.
   *
   * The phone value is not negotiable and stays: `calc(100dvw - 24px)` is the
   * screen, and a wider maximum cannot make a phone wider.
   */
  maxW?: string;
  /**
   * Furniture that must NOT scroll with the content — tabs over a list, the
   * field that searches it, the line that says what is on show.
   *
   * IT IS OUTSIDE `Dialog.Body`, which is the whole reason it exists. The body
   * is the scroll container (`scrollBehavior="inside"`), so a toolbar rendered
   * as the first of `children` travels up and off the sheet with the rows it
   * controls — fine for a look-up you read top to bottom, wrong for a list you
   * scroll while re-aiming the search that produced it.
   *
   * It also takes the space beside the close button, which was empty in every
   * pop-up this component has ever drawn.
   *
   * Optional, and the look-ups that opened with a heading and a list pass
   * nothing: with no header there is no band and no rule, and the sheet is
   * exactly what it was.
   */
  header?: ReactNode;
  children: ReactNode;
}

/**
 * The pop-up itself.
 *
 * ALWAYS IN THE TREE, with `open` driving it — never `{open && <Dialog/>}`.
 * A dialog mounted at the moment it opens has been left this app with the page
 * behind it unclickable, because the overlay is torn down on a frame the dialog
 * no longer exists to clean up after.
 *
 * Wide enough for the ledger's four columns to lay out as a table rather than
 * fall back to rows — which is one of the reasons these two are better off in a
 * pop-up than in a 460px column.
 */
export function SectionPopup({
  title,
  open,
  onClose,
  maxW = "840px",
  header,
  children,
}: SectionPopupProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
      /*
       * ONE SIZE, AND NOT `full` ANYWHERE.
       *
       * The obvious thing — `{ base: "full", md: "xl" }`, which is what this
       * area's other content dialog uses — draws a sheet 900px tall on a
       * desktop with most of it empty. `full` is the one size that sets an
       * explicit HEIGHT on the content, that height reaches the wider
       * breakpoints, and an explicit height beats any maximum: a `maxH` of
       * 82vh sat there computing 738px against a content that stayed 900.
       *
       * So the dimensions are given below as plain properties instead, where a
       * maximum is a maximum and the sheet is as tall as what is in it. A phone
       * gets a sheet with a little air around it rather than a full screen —
       * which for a look-up you open and close is no loss.
       */
      size="lg"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.500" backdropFilter="blur(2px)" />
        <Dialog.Positioner>
          <Dialog.Content
            w="full"
            /* THE SCREEN ALWAYS WINS. `min()` rather than the bare value,
               because the desktop maximum is a fixed number and the window is
               not: a 1100px sheet asked for at `md` is wider than a 900px
               window, and the sheet would run off both edges. This was latent at
               840 — it bites between 768 and 864 — and widening the sheet for
               the queue table is what made it worth fixing rather than
               inheriting. */
            maxW={{
              base: "calc(100dvw - 24px)",
              md: `min(${maxW}, calc(100dvw - 48px))`,
            }}
            maxH={{ base: "88dvh", md: "82vh" }}
            borderRadius="xl"
          >
            {/* The close button alone. The heading a reader sees is the
                section's own, immediately below. */}
            <Flex justify="flex-end" px={3} pt={3} pb={0}>
              <Dialog.Title css={SR_ONLY}>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Flex>

            {/* THE BAND THAT STAYS PUT — see {@link SectionPopupProps.header}.
                `flexShrink={0}` because the sheet is a flex column with a
                maximum height: without it a long list would win the argument
                and squeeze the tabs and the search out of shape.

                THE RULE IS PART OF THE PROMISE. A header with nothing under it
                reads as content; a hairline says the rows scroll beneath it,
                which is the one thing a reader has to know about this sheet
                before they start scrolling. */}
            {header && (
              <Box
                flexShrink={0}
                pl={{ base: 4, md: 6 }}
                // THE CLOSE BUTTON FLOATS OVER THIS BAND, so the band gets out
                // of its way. `Dialog.CloseTrigger` is `position: absolute` in
                // the kit's recipe — the row above has a height of 12px and the
                // X hangs below it, which never mattered while that row held
                // nothing but the X itself.
                //
                // IT BIT ON A PHONE FIRST. The measured footprint is 36px wide
                // with an 8px gutter, so anything full-width in this band runs
                // under it: on a 351px sheet a tab strip did exactly that, with
                // the pills sliding beneath the X as it scrolled. On a 1100px
                // sheet the same strip stops hundreds of pixels short and the
                // clash never shows.
                //
                // HORIZONTAL AND NOT VERTICAL. The alternative is to give the
                // close row a real height and start the band under the X, which
                // costs every sheet ~30px of a column already capped at 82vh —
                // where this spends space that is empty on a desktop and only
                // just needed on a phone.
                pr={{ base: "52px", md: "56px" }}
                pt={1}
                pb={3}
                borderBottomWidth="1px"
                borderColor="gray.100"
              >
                {header}
              </Box>
            )}

            <Dialog.Body
              px={{ base: 4, md: 6 }}
              pt={header ? 3 : 2}
              pb={6}
            >
              {children}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
