"use client";

// The claims area's card for a block of DETAILS — the surface a run of fields
// sits on.
//
// IT IS `CARD_SHAPE` PLUS A LIFT (user, 2026-09-16: "make the card a component…
// we only change one component"). It used to carry its own measurements, copied
// off the kit's profile header card — gray.100, a `2xl` radius, an `sm` shadow —
// which made it a SECOND card shape in an area that already had one, and a
// radius change to the shared shape left these four call sites behind.
//
// What is still its own is the BEHAVIOUR, which is what makes it a detail card
// rather than a section card: it clips its contents to the corners, brings the
// padding its raw fields need, and lifts 3px onto an `lg` shadow under the
// pointer.
//
// One thing deliberately not taken from the card it was copied off: `cursor:
// pointer`. The profile card is clickable and says so; a card of read-only
// fields that changed the cursor would be promising a click that never comes.
// The lift is shared, the promise is not.

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { CARD_SHAPE } from "./section-card";

/** A card holding a run of detail fields. */
export function DetailCard({ children }: { children: ReactNode }) {
  return (
    <Box
      {...CARD_SHAPE}
      bg="white"
      transition="0.25s"
      // Content is clipped to the corners rather than squaring them off.
      overflow="hidden"
      _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
      // A section card's contents bring their own padding; this one is handed
      // raw fields, so the padding is here.
      p={{ base: 4, md: 5 }}
    >
      {children}
    </Box>
  );
}

export default DetailCard;
