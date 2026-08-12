"use client";

// The claims area's stacked label-over-value pair — one fact, read top to bottom.
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
// size of a heading — and the label sits a step under it at `xs`. Colour and
// weight do the rest, the same way `RowItem` distinguishes the two halves of a
// dotted-leader row, which is what this same fact looks like on a phone. One
// claim, two layouts, one voice.
//
// Nothing here is responsive. A caller decides WHICH layout a width gets — the
// claim view renders these on the page and dotted-leader rows in its drawer —
// and a component that changed size on its own would fight that decision.

import type { ReactNode } from "react";
import { Text, VStack } from "@chakra-ui/react";

export interface InfoLabelProps {
  /** What the fact is called. */
  label: string;
  /** The fact. A dash stands in for one not on file. */
  value?: ReactNode;
  /** Colour for the value, when it carries one (a status, say). */
  color?: string;
}

/**
 * A label with its value under it.
 *
 * Sized to sit many-to-a-card: `sm` throughout, the value in semibold against a
 * muted label. Owns no margin — the grid it is laid out in sets the gaps.
 */
export function InfoLabel({ label, value, color }: InfoLabelProps) {
  // `null` and `""` are as absent as `undefined` here: all three mean the field
  // has nothing on file, and only `undefined` would fall through a default.
  const shown =
    value === undefined || value === null || value === "" ? "—" : value;

  return (
    <VStack gap={0} align="start" minW={0}>
      {/* A step under the value, not level with it. Set the same size, the two
          lines of a pair carry equal weight and the eye has to read both to
          find out which is the fact; a smaller label is scanned past on the way
          to what was being looked for. */}
      <Text fontSize="xs" color="gray.500" lineHeight="1.5">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        lineHeight="1.45"
        color={color ?? "gray.800"}
        // Long values wrap inside their column rather than widening it — a grid
        // track is only as wide as the narrowest sibling lets it be.
        wordBreak="break-word"
      >
        {shown}
      </Text>
    </VStack>
  );
}

export default InfoLabel;
