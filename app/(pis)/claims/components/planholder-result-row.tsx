"use client";

// One plan holder, as a row you can pick.
//
// Lifted out of the plan holder search page so the dashboard's own search can
// use it too. Two surfaces drawing the same hit from the same data would drift
// on the first change to either — a different avatar size, the plan dropped
// from the second line — and the difference would read as two different kinds
// of result rather than one result in two places.

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { BrandedAvatar } from "osp-ui-kit";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import type { PlanholderSearchResult } from "../claims-data";

export function PlanholderResultRow({
  result,
  onSelect,
  compact = false,
}: {
  result: PlanholderSearchResult;
  onSelect: (lpaNo: string) => void;
  /**
   * Tighter padding and a smaller avatar, for a narrow column.
   *
   * The dashboard's rail is around 340px wide; the search page is the width of
   * the page. Same row, less air.
   */
  compact?: boolean;
}) {
  // `asChild` so the row is a real <button> — keyboard and screen readers get
  // the semantics, Chakra still does the styling.
  return (
    <Flex
      asChild
      align="center"
      gap={compact ? 2.5 : 3}
      w="full"
      textAlign="left"
      px={compact ? 2 : { base: 3, md: 4 }}
      py={compact ? 2 : 3}
      borderRadius="xl"
      transition="background 0.15s ease"
      _hover={{ bg: "gray.50" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "primary" }}
    >
      <button type="button" onClick={() => onSelect(result.lpaNo)}>
        <BrandedAvatar
          name={result.name}
          imageUrl={mockAvatarUrl(result.personId)}
          size={compact ? "xs" : "sm"}
          flexShrink={0}
        />

        <Box minW={0} flex="1">
          <Text
            fontSize={compact ? "xs" : "sm"}
            fontWeight="semibold"
            color="gray.800"
            truncate
          >
            {result.name}
          </Text>
          <Text fontSize={compact ? "10px" : "xs"} color="gray.500" truncate>
            {result.lpaNo} · {result.planDesc}
          </Text>
        </Box>

        <Box color="gray.400" flexShrink={0}>
          <LuChevronRight size={compact ? 14 : 16} />
        </Box>
      </button>
    </Flex>
  );
}

export default PlanholderResultRow;
