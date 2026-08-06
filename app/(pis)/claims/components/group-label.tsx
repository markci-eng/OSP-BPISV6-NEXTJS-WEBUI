"use client";

// The claims area's label for a GROUP INSIDE a card — one level below a section.
//
// Not a rival to `SectionTitle`, which is the heading for a section OF A PAGE and
// owns that typography. This is for the tier under it: the runs a card divides
// its own contents into — Summary, Personal Info and Plan Detail inside the plan
// holder's details card; Payee Name and Address inside the death claim form's
// payee panel.
//
// It exists because a heading and a value cannot be set the same. The shared
// section heading is 16px/600 in gray.700, and so is the value of a shared
// `InfoItem` — put one above a grid of the other and the heading reads as one
// more fact in the list rather than as the name of the list. Going BIGGER is not
// the way out either: the card's own title is 16px/700 directly above, and a
// group inside it cannot outrank it.
//
// So it changes register instead of size. Small, upper case, letter-spaced and
// muted reads as a label for what follows at any size — it cannot be mistaken
// for content, because no value on the page is set that way. The measurements
// are the ones the death claim form already uses for exactly this job.

import type { ReactNode } from "react";
import { Text } from "@chakra-ui/react";

/**
 * A small upper-case label naming a group of fields inside a card.
 *
 * Owns its bottom margin, so the group's content follows directly.
 */
export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      textTransform="uppercase"
      letterSpacing="wider"
      color="gray.500"
      mb={2}
    >
      {children}
    </Text>
  );
}

export default GroupLabel;
