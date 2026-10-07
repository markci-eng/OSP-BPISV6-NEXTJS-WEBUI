"use client";

// The accounts-management request card: a bordered block with a green-tinted
// icon+title strip, and the dotted label/value row that goes inside it.
//
// EXTRACTED FROM `edit-ritf-page` (2026-09-24), unchanged. The Return of
// Premium panel is asked to look like Edit RITF, and the way to make two
// screens look alike is to have them render the same component — a copy would
// match on the day it was written and drift at the first change to either.
//
// The green rule sits on the HEADER STRIP rather than down the whole card: it
// marks where a block starts, which is what a run of these needs, and a full
// height bar on a tall card reads as a status the card does not have.

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * The kit card's edge and lift, measured off the plan holder card, for a
 * `SectionCard` that stands beside one. The claims `section-card` holds the
 * same values privately; they are repeated here so that file stays untouched.
 */
export const KIT_BORDER = "#e3e8e5";
export const KIT_SHADOW = "0 0 30px 0 rgba(1, 41, 112, 0.1)";

export function SectionCard({
  icon,
  title,
  children,
  action,
  borderColor = "border.muted",
  boxShadow,
  fill = false,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /**
   * A control for the block, placed at the right end of the title strip.
   *
   * Opposite the title rather than among the rows (user, 2026-09-24): a button
   * sitting in a run of dotted leaders breaks the line the eye follows across
   * them, where one in the strip reads as belonging to the whole block. It is
   * pushed right by `ml="auto"`, so a card without one is laid out exactly as
   * before.
   */
  action?: ReactNode;
  /**
   * The card's edge, and the lift under it.
   *
   * BOTH DEFAULT TO WHAT EDIT RITF DRAWS — a `border.muted` hairline and no
   * shadow — so that page is unaffected. They are here for the ROP panel
   * (user, 2026-09-24), where this card stands next to the kit's plan holder
   * card and a fainter edge than its neighbour's read as a card that had not
   * finished loading. Pass `KIT_BORDER`/`KIT_SHADOW` to match that neighbour.
   */
  borderColor?: string;
  boxShadow?: string;
  /**
   * Take the full height of whatever the card is placed in, and let the body
   * grow into it.
   *
   * OFF BY DEFAULT — a card is normally as tall as what is in it. It is on for
   * the ROP panel's Submitted IDs card (user, 2026-09-24), which has to match
   * the stack of cards in the column beside it: the card stretches, and the
   * viewer inside it takes the height that stretching gives.
   *
   * ONLY FROM `lg`. Below it the columns stack, there is no neighbour to match,
   * and a `height: 100%` against an auto-height parent is a card with no
   * height at all.
   */
  fill?: boolean;
}) {
  return (
    <Box
      bg="bg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={boxShadow}
      borderRadius="lg"
      overflow="hidden"
      h={fill ? { base: "auto", lg: "full" } : undefined}
      display={fill ? "flex" : undefined}
      flexDirection={fill ? "column" : undefined}
    >
      <Flex
        align="center"
        gap={2}
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderBottomColor="green.100"
        borderLeftWidth="3px"
        borderLeftColor="green.500"
        bg="green.50"
      >
        <Box color="green.700">{icon}</Box>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="green.700"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
        {action && (
          <Box ml="auto" flexShrink={0}>
            {action}
          </Box>
        )}
      </Flex>
      {/* `minH={0}` alongside `flex="1"`: without it a flex child will not go
          below its content height, which is what turns "fill the space" into
          "overflow the card". */}
      <Box
        px={4}
        py={3}
        flex={fill ? "1" : undefined}
        minH={fill ? 0 : undefined}
        display={fill ? "flex" : undefined}
        flexDirection={fill ? "column" : undefined}
      >
        {children}
      </Box>
    </Box>
  );
}

/**
 * One labelled fact: the label at the left, its value at the right, and a
 * dashed leader spanning whatever is between them.
 *
 * `—` where there is no value, so an empty field stays a visible question
 * rather than dropping out of the list.
 */
export function InfoRow({
  label,
  value,
  valueWrap = false,
  labelWrap = false,
  compact = false,
}: {
  /**
   * Less space above and below the row, for a card that is a long run of them
   * — the Transferor Details card. Off by default, so every other screen keeps
   * the spacing it was laid out with.
   */
  compact?: boolean;
  label: string;
  value?: ReactNode;
  /**
   * Lets the label break onto a second line instead of truncating.
   *
   * OFF BY DEFAULT, for the reason given on the label below. It is on for the
   * Transferor Details card, whose two-column rows are too narrow for labels
   * like "Termination Status" — there a label cut to "Termin…" is worse than
   * one on two lines. Past two lines it still truncates.
   */
  labelWrap?: boolean;
  /**
   * Lets the value use more than one line.
   *
   * OFF BY DEFAULT, because most values here are a date or a code and a date
   * broken across two lines is harder to read than one that pushes the label.
   * It is on for the few that are a LIST — pay classes, say — which in a narrow
   * column have to wrap or they push the label out of the row entirely.
   */
  valueWrap?: boolean;
}) {
  return (
    // `minW={0}` on the row and on the label is what lets the label shrink
    // rather than force the row wider than its card. Without it a flex child
    // refuses to go below its content width, which is how a narrow card ends
    // up with a value hanging past its own border.
    <Flex align="center" py={compact ? 0.5 : 1} fontSize="sm" minW={0}>
      <Text
        color="gray.500"
        fontSize="xs"
        // Truncates rather than wrapping: a label on two lines would put the
        // dotted leader beside the second of them, which reads as a leader
        // pointing at the wrong row.
        minW={0}
        truncate={!labelWrap}
        lineClamp={labelWrap ? 2 : undefined}
        lineHeight={labelWrap ? "short" : undefined}
      >
        {label}
      </Text>
      <Box
        flex="1"
        // Never collapses to nothing, so the leader is still legible as a
        // leader in the narrowest column it is asked to sit in.
        minW="16px"
        mx={2}
        borderBottom="1px dashed"
        borderColor="gray.300"
        transform="translateY(2px)"
      />
      <Text
        fontWeight="semibold"
        textAlign="right"
        whiteSpace={valueWrap ? "normal" : "nowrap"}
        // The value is the answer, so it keeps its space and the label gives
        // way — except where it is allowed to wrap, when it needs to be able
        // to shrink for the wrapping to happen at all.
        flexShrink={valueWrap ? 1 : 0}
        minW={0}
        fontSize="sm"
        color="gray.800"
      >
        {value ?? "—"}
      </Text>
    </Flex>
  );
}

export default SectionCard;
