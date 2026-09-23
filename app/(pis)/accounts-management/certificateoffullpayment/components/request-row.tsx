"use client";

// One row of a COFP rail list.
//
// Its own file because the screen has TWO rail cards — the action's requests
// and the accounts with a deficiency under them — and a plan holder must read
// the same in both. The deficiency card differs only in what it puts on the
// right of the row, which it passes as `trailing`.

import { Box, Flex, Text } from "@chakra-ui/react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { CofpRequest } from "../../cofp/data/types";

/**
 * A row's exact height, and the gap between two of them.
 *
 * FIXED rather than left to the content (user, 2026-09-22): both lists on the
 * screen show five rows and no more, and a height in rows is only a height in
 * pixels if a row is always the same number of them. 48px is what the two
 * lines inside one come to with room to breathe.
 */
export const ROW_HEIGHT = 48;
export const ROW_GAP = 6;

/** How many rows a list shows before it scrolls. */
export const VISIBLE_ROWS = 5;

/**
 * The height of a list showing exactly {@link VISIBLE_ROWS} rows.
 *
 * Both cards set their list to this, which is what keeps the two the same
 * height however many records each has — and what makes the sixth row a scroll
 * rather than a taller card.
 */
export const LIST_HEIGHT =
  ROW_HEIGHT * VISIBLE_ROWS + ROW_GAP * (VISIBLE_ROWS - 1);

export interface RequestRowProps {
  request: CofpRequest;
  active: boolean;
  onClick: () => void;
  /** Replaces the LPA number on the right. */
  trailing?: React.ReactNode;
}

export function RequestRow({
  request,
  active,
  onClick,
  trailing,
}: RequestRowProps) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      justify="space-between"
      align="center"
      gap={2}
      w="full"
      h={`${ROW_HEIGHT}px`}
      px={2.5}
      textAlign="start"
      // One even 1px edge whether or not the row is picked, and the brand
      // green rather than a ring around it — the same row the service
      // payables rail draws, so a plan reads the same on both.
      borderWidth="1px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: active ? undefined : "gray.300" }}
      flexShrink={0}
    >
      {/* THE NAME is what the row is read by, so it takes every pixel the row
          has spare and truncates; the LPA number is confirmed at a glance
          rather than read down the list, so it yields nothing and still sits
          second.

          THE BRANCH sits UNDER the name rather than beside it: it is the
          shortest value on the row and the one a list is grouped by, so a
          second line costs nothing the name was using and keeps a run of
          branches readable straight down the left edge. */}
      <Box minW={0} flex="1">
        <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
          {request.planholderName}
        </Text>
        <Text fontSize="10px" color="gray.400" truncate>
          {request.branchCode}
        </Text>
      </Box>
      {trailing ?? (
        <Text
          flexShrink={0}
          fontSize="10.5px"
          fontFamily="mono"
          color="gray.500"
          whiteSpace="nowrap"
        >
          {request.lpaNo}
        </Text>
      )}
    </Flex>
  );
}

export default RequestRow;
