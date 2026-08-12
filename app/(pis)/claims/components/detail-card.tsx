"use client";

// The claims area's card for a block of DETAILS — the surface a run of fields
// sits on.
//
// The measurements are the plan holder profile card's, read off what that card
// actually renders rather than picked to look close: white, a hairline gray.100
// border, a `2xl` radius, an `sm` shadow, and a quarter-second transition that
// lifts it 3px onto an `lg` shadow when the pointer is over it. The claim's
// details card sits directly under that one on the page, so anything else was
// two cards that had nothing to do with each other.
//
// The kit builds that surface INSIDE `ProfileHeaderCard` and does not export it
// on its own, which is why this is a copy of the values and not a wrapper around
// the thing itself. If the kit ever lifts it out, this should become that.
//
// One thing deliberately not copied: `cursor: pointer`. The profile card is
// clickable and says so; a card of read-only fields that changed the cursor
// would be promising a click that never comes. The lift is shared, the promise
// is not.

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

/** A card holding a run of detail fields. */
export function DetailCard({ children }: { children: ReactNode }) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
      transition="0.25s"
      // Matches the card being copied: content is clipped to the corners rather
      // than squaring them off.
      overflow="hidden"
      _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
      // The card being copied carries no padding — its contents bring their own.
      // This one is handed raw fields, so the padding is here.
      p={{ base: 4, md: 5 }}
    >
      {children}
    </Box>
  );
}

export default DetailCard;
