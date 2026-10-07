"use client";

// The claims area's label-and-value pair — one fact.
//
// A local answer to the kit's `InfoItem`, which is the same shape at a size this
// area cannot use. Measured, not guessed: `InfoItem` draws its value at 16px/600
// over a 12px label. That is right for a handful of headline figures — which is
// what it was built for — and wrong for a card of eighteen, where every value
// asks for the same attention as a section heading and the label under it is set
// smaller than any other supporting text on the page.
//
// So this keeps the structure and changes the register. The value comes DOWN to
// `sm` — the size the rest of the page's body text is set at, rather than the
// size of a heading — and the label sits a step under it at `xs`.
//
// ON A PHONE IT IS THE DOTTED-LEADER ROW (user, 2026-10-02: "it should be the
// same as the planholder details … space between with the dash separated with
// them. All label should be like this in mobile"). Label left, a dashed rule,
// the value right — `RowItem`'s row, which the Planholder card draws. Below
// `lg`, the width where every claims screen turns into its phone layout.
//
// AND IT TAKES THE WHOLE ROW of whatever grid it sits in there (`gridColumn:
// 1 / -1`). A leader row is read across the screen; two of them side by side in
// a 375px card would each be a label, a stub of dashes and a clipped value. So
// the pairs' 2-, 3- and 4-column grids stack on a phone without each one
// having to be told — the grid's own row gap spaces them, as `RowItem`'s
// padding does in the card.
//
// CSS, NOT `useBreakpointValue`: that hook answers `undefined` on the first
// render and can go stale after a viewport change, and a fact drawn in the
// wrong shape for a frame is worse than either shape.

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export interface InfoLabelProps {
  /**
   * What the fact is called. A node so the label itself can carry a mark — the
   * death claim colours the name of a corrected field and hangs what changed on
   * it (see `CorrectionLabel`); everywhere else it is a plain string.
   */
  label: ReactNode;
  /** The fact. A dash stands in for one not on file. */
  value?: ReactNode;
  /** Colour for the value, when it carries one (a status, say). */
  color?: string;
}

/**
 * A label and its value — stacked from `lg`, a dotted-leader row below it.
 *
 * Owns no margin — the grid it is laid out in sets the gaps.
 */
export function InfoLabel({ label, value, color }: InfoLabelProps) {
  // `null` and `""` are as absent as `undefined` here: all three mean the field
  // has nothing on file, and only `undefined` would fall through a default.
  const shown =
    value === undefined || value === null || value === "" ? "—" : value;

  return (
    <Flex
      direction={{ base: "row", lg: "column" }}
      align={{ base: "center", lg: "start" }}
      gridColumn={{ base: "1 / -1", lg: "auto" }}
      minW={0}
      // What `flashEditedField` rings, so a picked edit lights the whole pair.
      data-info-label=""
    >
      {/* A step under the value on the desktop, not level with it: set the
          same size, the two lines carry equal weight and the eye has to read
          both to find which is the fact. In the row they are level, as the
          Planholder card's are — the leader is what tells them apart there. */}
      <Text
        fontSize={{ base: "sm", lg: "xs" }}
        color="gray.500"
        lineHeight="1.5"
        whiteSpace={{ base: "nowrap", lg: "normal" }}
        flexShrink={0}
      >
        {label}
      </Text>

      {/* The leader — `RowItem`'s own rule. */}
      <Box
        display={{ base: "block", lg: "none" }}
        flex="1"
        minW={3}
        mx={3}
        borderBottom="1px dashed"
        borderColor="gray.300"
        transform="translateY(2px)"
      />

      <Text
        fontSize="sm"
        fontWeight={{ base: "medium", lg: "semibold" }}
        lineHeight="1.45"
        color={color ?? "gray.800"}
        textAlign={{ base: "right", lg: "left" }}
        minW={0}
        // Long values wrap rather than widening their track — a grid column on
        // the desktop, the space past the leader on a phone.
        wordBreak="break-word"
      >
        {shown}
      </Text>
    </Flex>
  );
}

export default InfoLabel;
