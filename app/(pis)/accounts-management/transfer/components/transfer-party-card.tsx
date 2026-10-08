"use client";

// Pieces shared by the two parties' cards — the transferor's and the
// transferee's — so the two cannot drift apart.
//
// THE PARTY CARD ITSELF IS GONE (user, 2026-10-08). It set a party's details
// beside their IDs in one card; the panel now stands the two parties' details
// cards side by side with each party's Valid ID card under them, and the
// Document Viewer at the right.

import type { ReactNode } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";

/** "LAST, FIRST MIDDLE", leaving the middle name off when there is none. */
export function partyName({
  lastName,
  firstName,
  middleName,
}: {
  lastName: string;
  firstName: string;
  middleName: string;
}): string {
  return `${lastName}, ${[firstName, middleName].filter(Boolean).join(" ")}`;
}

/**
 * The small caption over a group of rows, naming what the group holds.
 * Shared with ROP's payout fold.
 */
export function ColumnHeading({
  children,
  action,
}: {
  children: string;
  action?: ReactNode;
}) {
  return (
    <Flex align="center" justify="space-between" gap={2} mb={2} minH="18px">
      <Text
        fontSize="2xs"
        fontWeight="semibold"
        color="gray.600"
        textTransform="uppercase"
        letterSpacing="wider"
        truncate
      >
        {children}
      </Text>
      {action}
    </Flex>
  );
}

/**
 * A run of `InfoRow`s that goes TWO TO A LINE once its card is wide enough to
 * hold "Termination Status" beside "NOT YET TERMINATED" in half of it, and one
 * to a line below that. Measured on the card, not the window: the same card is
 * a third of the page with the list hidden and narrower with it shown.
 */
export function RowGrid({ children }: { children: ReactNode }) {
  return (
    <Box containerType="inline-size">
      <Grid
        templateColumns="minmax(0, 1fr)"
        columnGap={5}
        css={{
          "@container (min-width: 520px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          },
        }}
      >
        {children}
      </Grid>
    </Box>
  );
}
