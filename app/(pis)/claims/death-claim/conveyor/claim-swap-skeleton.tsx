"use client";

// WHAT STANDS IN WHILE ONE CLAIM IS REPLACED BY THE NEXT.
//
// SHAPED LIKE WHAT IS COMING, not like a generic loader. The claim column is a
// header card and a run of sections beneath it, so that is what this is: the
// real content lands on top of a shape that is already correct, rather than
// pushing a spinner aside and shifting everything by whatever it happened to
// measure. The same approach as `PlanholderSwapSkeleton` on the profile page —
// see the note at the top of it.
//
// IT IS NOT A LOAD, AND THAT IS WHY IT IS BRIEF. Nothing is being fetched: the
// next claim is already in memory. This exists so the swap is something a reader
// WATCHES happen — see `useClaimSwap` for the beat and the scroll that goes
// with it.

import { Box, Flex, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { CARD_SHAPE } from "../../components/section-card";

/** A line of text. Widths are percentages so they scale with the column. */
function Bar({
  w,
  h = "12px",
  mt,
}: {
  w: string;
  h?: string;
  mt?: string | number;
}) {
  return <Skeleton w={w} h={h} mt={mt} borderRadius="sm" />;
}

function Card({
  children,
  p = { base: 4, md: 5 },
}: {
  children: React.ReactNode;
  p?: number | Record<string, number>;
}) {
  return (
    <Box {...CARD_SHAPE} bg="white" p={p}>
      {children}
    </Box>
  );
}

/**
 * The claim column, mid-swap.
 *
 * Four blocks and not the full seven the real column has: the header, the plan
 * details, and two sections. What is below the fold on arrival does not need a
 * placeholder — the scroll has just gone home, so nobody is looking at it, and
 * drawing it would only make the skeleton taller than the thing it stands for on
 * a short claim.
 */
export function ClaimSwapSkeleton() {
  return (
    <Flex direction="column" gap={4}>
      {/* THE CLAIM'S HEADER — kicker, number, filed line, then the three facts
          and the pipeline strip under a rule. */}
      <Card>
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Box flex="1" minW={0}>
            <Bar w="24%" h="9px" />
            <Bar w="58%" h="17px" mt="6px" />
            <Bar w="44%" h="11px" mt="6px" />
          </Box>
          <Flex gap={2} flexShrink={0}>
            <Skeleton w="54px" h="16px" borderRadius="full" />
            <Skeleton w="54px" h="16px" borderRadius="full" />
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 3 }} gapX={4} gapY={3} mt={4} pt={4}>
          {[0, 1, 2].map((i) => (
            <Box key={i}>
              <Bar w="46%" h="9px" />
              <Bar w="76%" mt="5px" />
            </Box>
          ))}
        </SimpleGrid>

        <Flex align="center" gap={2} mt={4}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} flex="1" h="7px" borderRadius="full" />
          ))}
        </Flex>
      </Card>

      {/* THE PLAN DETAILS — a heading over a grid of label / value pairs. */}
      <Card>
        <Flex align="center" gap={2.5}>
          <Skeleton w="26px" h="26px" borderRadius="md" />
          <Box flex="1" minW={0}>
            <Bar w="34%" h="13px" />
            <Bar w="52%" h="10px" mt="4px" />
          </Box>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} gapX={4} gapY={3} mt={4}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Box key={i}>
              <Bar w="62%" h="9px" />
              <Bar w="86%" mt="5px" />
            </Box>
          ))}
        </SimpleGrid>
      </Card>

      {/* Two sections, enough to fill the first screen. */}
      {[0, 1].map((i) => (
        <Card key={i}>
          <Flex align="center" justify="space-between" gap={3}>
            <Bar w="30%" h="13px" />
            <Skeleton w="62px" h="20px" borderRadius="md" />
          </Flex>
          <Bar w="100%" h="46px" mt={3} />
        </Card>
      ))}
    </Flex>
  );
}

/** The plan holder card in the rail, which changes with the claim. */
export function RailSwapSkeleton() {
  return (
    <Box {...CARD_SHAPE} bg="white" px={4} py={4}>
      <Bar w="34%" h="9px" />
      <Bar w="76%" h="14px" mt="8px" />
      <Bar w="46%" h="11px" mt="5px" />
    </Box>
  );
}

export default ClaimSwapSkeleton;
