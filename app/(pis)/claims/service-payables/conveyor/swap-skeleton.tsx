"use client";

// The beat between one billing and the next — over the two blocks the beat
// actually replaces, and nothing else (user, 2026-09-14: "only do the skeleton
// loading with the component that are changing").
//
// WHAT THE SWAP REPLACED BEFORE THIS. `ServicePayablesSwapSkeleton` stood in for
// the whole workspace: the page rendered it INSTEAD of the grid, so for 380ms
// the queue tabs, the search field and the commit went off screen with
// everything else and came back. Three things were wrong with that.
//
//   THE NAVIGATION DOES NOT CHANGE. Process / Verify / Approve / Endorse and the
//   field under them are the same control before and after — on a stage change
//   they are the control that was just USED. Blanking the thing somebody has
//   their pointer on, to announce that something else has moved, is the one
//   place a placeholder can actually mislead: it reads as the click having
//   reloaded the page.
//
//   IT WAS THE WRONG SHAPE. That skeleton is the ARCHIVED workspace's — rail on
//   the right, a territory picker, a chapel table, a record column ending in two
//   side-by-side document lists. The conveyor is rail left, one account list,
//   and a record column of stacked cards. So the placeholder was not standing in
//   for the layout arriving; it was standing in for a different screen, and the
//   real content did not land on it so much as replace it.
//
//   IT COST THE SCROLL AND THE PIN. The grid unmounted, so the sticky rail was
//   rebuilt from scratch on the far side of the beat.
//
// WHAT IS LEFT IS TWO SHAPES: the accounts card in the rail, and the record
// column. Those are what a new billing changes. Everything around them — the
// stage card, the lookups, the commit — stays mounted and real, so the rail
// keeps its height and its pinning through the swap and only the panel that is
// becoming a different panel flickers.
//
// THE SHAPES ARE MEASURED OFF THE REAL BLOCKS, which is the whole point of a
// placeholder: the compact row is 32px with a 6px gap because that is what
// `PlanholderServiceList` draws, and the cards are `CARD_SHAPE` at
// `SectionCard`'s own padding. A placeholder that is not the size of the thing
// it stands in for is just a second layout shift.

import { Box, Flex, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { CARD_SHAPE } from "../../components/section-card";
import {
  COMPACT_VISIBLE_ROWS,
  LIST_MAX_HEIGHT_COMPACT,
} from "../components/PlanholderServiceList";

/** A line of text. Widths are percentages so they scale with the column. */
function Bar({
  w,
  h = "12px",
  mt,
  ml,
}: {
  w: string;
  h?: string;
  mt?: string | number;
  ml?: string;
}) {
  return <Skeleton w={w} h={h} mt={mt} ml={ml} borderRadius="sm" />;
}

/** `SectionCard`'s shape, which is what every card in the record column is. */
function CardBlock({ children }: { children: React.ReactNode }) {
  return (
    <Box {...CARD_SHAPE} bg="white" p={{ base: "16px", md: "20px" }}>
      {children}
    </Box>
  );
}

/** A section heading — title, sometimes a control at the right. */
function HeadingBlock({ action = false }: { action?: boolean }) {
  return (
    <Flex align="center" justify="space-between" gap={3} mb={3}>
      <Bar w="34%" h="14px" />
      {action && <Skeleton w="88px" h="28px" borderRadius="lg" />}
    </Flex>
  );
}

/**
 * The rail's accounts card — the billing's identity, the progress, the list.
 *
 * `CARD_SHAPE` with the card's own `px={4} py={3}`, and the list box capped at
 * the same five rows the real one is, so the block under it — the lookups and
 * the commit — does not move by a pixel while the beat runs.
 */
export function AccountsCardSkeleton({
  /**
   * Whether the card arriving has a progress bar — true on the two queues that
   * work the accounts one at a time, false on the two that read the billing
   * whole. Told rather than assumed, because a placeholder that drew a bar the
   * real card does not have would hand the list a 10px jump at the end of every
   * swap on For Approval. See `worksAccountByAccount`.
   */
  withProgress = true,
}: {
  withProgress?: boolean;
}) {
  return (
    <Box {...CARD_SHAPE} bg="white" px={4} py={3} aria-hidden>
      {/* The number over the code, the money over the territory and period. */}
      <Flex align="flex-start" justify="space-between" gap={3}>
        <Box flex="1" minW={0}>
          <Bar w="58%" h="15px" />
          <Bar w="72%" h="11px" mt="4px" />
        </Box>
        <Box w="42%" maxW="120px">
          <Skeleton h="14px" borderRadius="sm" ml="auto" w="80%" />
          <Skeleton h="10px" borderRadius="sm" mt="5px" ml="auto" w="96%" />
        </Box>
      </Flex>

      <Box my={3} borderTopWidth="1px" borderColor="gray.200" />

      {/* The progress bar where there is one, then the count and the processor
          under it. */}
      <Box mb={2.5}>
        {withProgress && <Skeleton h="4px" borderRadius="full" />}
        <Flex
          align="center"
          justify="space-between"
          gap={2}
          mt={withProgress ? 1.5 : 0}
        >
          <Bar w="38%" h="11px" />
          <Bar w="46%" h="11px" />
        </Flex>
      </Box>

      {/* The accounts. Five rows at the compact height, which is the cap the
          real list carries on a phone and the most a short rail will show. */}
      <Box maxH={LIST_MAX_HEIGHT_COMPACT} overflow="hidden">
        <Flex direction="column" gap="6px">
          {Array.from({ length: COMPACT_VISIBLE_ROWS }, (_, i) => (
            <Skeleton key={i} h="32px" borderRadius="sm" />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

/**
 * The record column — the same stack of cards the real one is, in the same
 * order: who it is for, the plan's trail, the record itself, the notes, the
 * folder.
 *
 * FIVE CARDS AND NOT ONE LONG BLOCK, because the column is read as a stack now
 * (2026-09-11) and a placeholder that ignored the gaps would let every card
 * below the first jump as the content landed.
 */
export function RecordColumnSkeleton() {
  return (
    <Flex direction="column" gap={5} aria-hidden>
      {/* The plan holder: avatar, name, the contact block, then the facts. */}
      <CardBlock>
        <Flex align="center" gap={4}>
          <Skeleton w="56px" h="56px" borderRadius="full" flexShrink={0} />
          <Box flex="1" minW={0}>
            <Bar w="46%" h="16px" />
            <Bar w="26%" h="11px" mt="6px" />
            <Bar w="62%" h="11px" mt="8px" />
          </Box>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 4 }} gapX={4} gapY={3} mt={5}>
          {Array.from({ length: 16 }, (_, i) => (
            <Box key={i}>
              <Bar w={`${52 + ((i * 9) % 30)}%`} h="10px" />
              <Bar w={`${64 + ((i * 7) % 26)}%`} h="13px" mt="5px" />
            </Box>
          ))}
        </SimpleGrid>
      </CardBlock>

      {/* Remarks — a heading over the read-only panel, which is a fixed height
          whatever the plan's history happens to be. */}
      <CardBlock>
        <HeadingBlock />
        <Skeleton h="114px" borderRadius="md" />
      </CardBlock>

      {/* The record: heading, its line of explanation, then paired fields. */}
      <CardBlock>
        <Bar w="38%" h="14px" />
        <Bar w="66%" h="11px" mt="6px" />
        <Flex direction="column" gap={5} mt={4}>
          {Array.from({ length: 5 }, (_, i) => (
            <SimpleGrid key={i} columns={{ base: 1, sm: 2 }} gap={5}>
              <Skeleton h="40px" borderRadius="md" />
              <Skeleton h="40px" borderRadius="md" />
            </SimpleGrid>
          ))}
        </Flex>
      </CardBlock>

      {/* Notes — the heading carries Add Note. */}
      <CardBlock>
        <HeadingBlock action />
        <Skeleton h="114px" borderRadius="md" />
      </CardBlock>

      {/* The folder: two tab pills and an Add, then rows. */}
      <CardBlock>
        <Flex align="center" justify="space-between" gap={3} mb={3}>
          <Flex gap="6px">
            <Skeleton w="96px" h="26px" borderRadius="lg" />
            <Skeleton w="104px" h="26px" borderRadius="lg" />
          </Flex>
          <Skeleton w="64px" h="28px" borderRadius="lg" />
        </Flex>
        <Flex direction="column" gap={2}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} h="52px" borderRadius="xl" />
          ))}
        </Flex>
      </CardBlock>
    </Flex>
  );
}
