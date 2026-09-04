"use client";

// The placeholder shown while For Process swaps between its two layouts.
//
// Swapping replaces BOTH columns at once — the record takes the main one and the
// plan holder takes the rail the chapel list was in, or the other way back. Done
// bare, the two layouts cut between frames: everything on screen is replaced in
// a single paint and the eye has nothing to follow from one to the other. What
// it reads as is a page that flickered, not a page that moved.
//
// So the swap goes through this instead. It is shaped like the layout being
// swapped TO — same columns, same cards in the same places, same heights — so
// what the eye follows is the target arriving, and the real content lands on top
// of a shape that is already correct rather than pushing one aside.
//
// `PlanholderSwapSkeleton`'s construction, down to the `Bar` and `CardBlock`
// helpers: this is the same mechanism one screen down, and two placeholders
// drawn two different ways would be two different kinds of transition.

import {
  Box,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import {
  MAIN_COLUMN_TAIL,
  STACKED_ITEM,
  WORKSPACE_GRID,
} from "../workspace-layout";

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

/** A bordered white card — the surface nearly everything here sits on. */
function CardBlock({
  children,
  p = 4,
}: {
  children: React.ReactNode;
  p?: number;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      bg="white"
      boxShadow="sm"
      p={p}
    >
      {children}
    </Box>
  );
}

/** A section heading — title over subtitle, with an action at the right. */
function HeadingBlock({ withAction = false }: { withAction?: boolean }) {
  return (
    <Flex align="center" justify="space-between" gap={3} mb={3}>
      <Box flex="1" minW={0}>
        <Bar w="42%" h="14px" />
        <Bar w="62%" h="11px" mt="5px" />
      </Box>
      {withAction && <Skeleton w="104px" h="32px" borderRadius="lg" />}
    </Flex>
  );
}

/** The stacked label-over-value pairs a details card holds. */
function PairGrid({ count, columns = 2 }: { count: number; columns?: number }) {
  return (
    <SimpleGrid columns={columns} gapX={4} gapY={3}>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i}>
          <Bar w={`${52 + ((i * 9) % 30)}%`} h="10px" />
          <Bar w={`${64 + ((i * 7) % 26)}%`} h="13px" mt="5px" />
        </Box>
      ))}
    </SimpleGrid>
  );
}

/* --------------------------- the record layout --------------------------- */

/**
 * Shaped like the record's own column: the back link, the billing line, the
 * plan holder (profile card then the rest of the record), the form, the
 * documents.
 */
function RecordSkeleton() {
  return (
    <Box>
      <Box>
        {/* No billing line here — it heads the rail. The column opens with the
            plan holder. */}

        {/* The profile card — an avatar and three lines beside it. */}
        <CardBlock>
          <Flex align="center" gap={4}>
            <Skeleton w="64px" h="64px" borderRadius="full" flexShrink={0} />
            <Box flex="1" minW={0}>
              <Bar w="38%" h="16px" />
              <Bar w="22%" h="11px" mt="6px" />
              <Bar w="54%" h="11px" mt="8px" />
            </Box>
          </Flex>
        </CardBlock>

        {/* The next row: the details the card does not carry, then the ledger
            ruled off under them. */}
        <Box mt={4}>
          <CardBlock>
            <PairGrid count={12} columns={4} />
            <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.100">
              <Bar w="14%" h="11px" />
              <Box mt={3}>
                <PairGrid count={4} columns={4} />
              </Box>
            </Box>
          </CardBlock>
        </Box>
      </Box>

      {/* The form. */}
      <Box mt={7}>
        <HeadingBlock />
        <Flex direction="column" gap={5}>
          {Array.from({ length: 6 }, (_, i) => (
            <SimpleGrid key={i} columns={2} gap={5}>
              <Skeleton h="40px" borderRadius="md" />
              <Skeleton h="40px" borderRadius="md" />
            </SimpleGrid>
          ))}
        </Flex>
        {/* No footer — Terminate is in the rail. */}
      </Box>

      {/* The two document columns. */}
      <SimpleGrid columns={2} gap={5} mt={7}>
        {Array.from({ length: 2 }, (_, col) => (
          <Box key={col}>
            <HeadingBlock />
            <Flex direction="column" gap={2}>
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} h="48px" borderRadius="lg" />
              ))}
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

/* --------------------------- the billing layout --------------------------- */

/**
 * The chapel card at the head of the billing column — `ChapelBillingCard`'s
 * shape: code over name over period on the left, the number over the total on
 * the right, then the ruled foot of counts with the action at its end.
 *
 * Its own block rather than the `HeadingBlock` that used to stand here: the
 * real thing is a bordered card now, and a placeholder one row tall would let
 * the table jump upward as the content landed.
 */
function ChapelCardBlock() {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      p={3.5}
      mb={5}
    >
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box flex="1" minW={0}>
          <Bar w="18%" h="10px" />
          <Bar w="46%" h="14px" mt="4px" />
          <Bar w="62%" h="11px" mt="5px" />
        </Box>
        <Box>
          <Skeleton w="72px" h="10px" borderRadius="sm" ml="auto" />
          <Skeleton w="94px" h="14px" borderRadius="sm" mt="4px" ml="auto" />
          <Skeleton w="54px" h="10px" borderRadius="sm" mt="4px" ml="auto" />
        </Box>
      </Flex>

      {/* Counts only — the billing's button is in the rail, not in this card. */}
      <Flex
        align="center"
        gap={3}
        mt={2.5}
        pt={2}
        borderTop="1px solid"
        borderColor="gray.100"
      >
        <Bar w="66px" h="11px" />
        <Bar w="82px" h="11px" />
      </Flex>
    </Box>
  );
}

/** Shaped like {@link BillingDetail}: the chapel card, then the table. */
function BillingSkeleton() {
  return (
    <Box>
      <ChapelCardBlock />
      <CardBlock p={0}>
        {/* The table's header row, then its rows. */}
        <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.100">
          <Bar w="38%" h="11px" />
        </Box>
        {Array.from({ length: 4 }, (_, i) => (
          <Flex
            key={i}
            align="center"
            justify="space-between"
            gap={4}
            px={4}
            py={3}
            borderBottomWidth={i === 3 ? 0 : "1px"}
            borderColor="gray.100"
          >
            <Box flex="1" minW={0}>
              <Bar w={`${44 + ((i * 9) % 22)}%`} h="12px" />
              <Bar w={`${28 + ((i * 5) % 14)}%`} h="10px" mt="5px" />
            </Box>
            <Bar w="88px" h="12px" />
          </Flex>
        ))}
      </CardBlock>
    </Box>
  );
}

/**
 * The rail — a picker over a list, and the SAME shape whichever layout is
 * arriving. That is not a shortcut: the billing view puts a territory picker
 * over its chapels and the record view puts a chapel picker over its plan
 * holders, so the column keeps its job across the swap and only its contents
 * change. One skeleton says exactly that.
 */
function RailSkeleton({ withBack = false }: { withBack?: boolean }) {
  return (
    <Box>
      {/* The record view's way back, right-aligned at the top of the rail. The
          billing view has none — it is the top of this task. */}
      {/* The billing number heading the rail, with the back link at its right —
          one row, which is why this is a heading block and not a lone bar. */}
      {withBack && <HeadingBlock withAction />}

      <Bar w="64px" h="10px" />
      <Skeleton h="36px" borderRadius="lg" mt="6px" />

      {/* The billing view's own action — Create/Edit and the line under it,
          sitting between the territory picker and the chapel list. The record
          view has its own block below instead. */}
      {!withBack && (
        <Box mt={4}>
          <Skeleton h="40px" borderRadius="lg" />
          <Bar w="88%" h="10px" mt="10px" />
          <Bar w="46%" h="10px" mt="4px" />
        </Box>
      )}

      {/* Loan Details · SOA, then Terminate and its caption. Only in
          the record view — the billing view's rail goes picker to action to
          list. */}
      {withBack && (
        <Box mt={4}>
          <SimpleGrid columns={2} gap={2}>
            <Skeleton h="46px" borderRadius="md" />
            <Skeleton h="46px" borderRadius="md" />
          </SimpleGrid>
          <Skeleton h="40px" borderRadius="lg" mt={2} />
          <Bar w="86%" h="10px" mt="10px" />
          <Bar w="52%" h="10px" mt="4px" />
        </Box>
      )}

      <Box mt={4}>
        <HeadingBlock />
        <Flex direction="column" gap={2}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} h="52px" borderRadius="lg" />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

/* --------------------------- the worklist layout --------------------------- */

/** A closed accordion card's head — caret, code over chapel, figure opposite. */
function WorklistHead() {
  return (
    <Flex align="center" gap={3} px={4} py={3}>
      <Skeleton w="10px" h="12px" borderRadius="sm" flexShrink={0} />
      <Box flex="1" minW={0}>
        <Bar w="26%" h="13px" />
        <Bar w="40%" h="10px" mt="5px" />
      </Box>
      <Box>
        <Skeleton w="92px" h="13px" borderRadius="sm" ml="auto" />
        <Skeleton w="56px" h="9px" borderRadius="sm" mt="4px" ml="auto" />
      </Box>
    </Flex>
  );
}

/**
 * Shaped like the For Process worklist: the controls row, then the accordion
 * stack with its index rail on the right, first card open — which is how the
 * real page arrives, so the content lands on a shape that is already correct.
 */
function WorklistSkeleton() {
  return (
    <Box>
      {/* The controls row: the territory picker and the roll-up. */}
      <Flex align="flex-end" gap={4} wrap="wrap" mb={5}>
        <Box w="300px" maxW="full">
          <Bar w="64px" h="10px" />
          <Skeleton h="36px" borderRadius="lg" mt="6px" />
        </Box>
        <Skeleton h="12px" w="220px" borderRadius="sm" mb="10px" />
      </Flex>

      <Flex gap="24px" align="flex-start">
        <Box flex="1" minW={0}>
          <Flex direction="column" gap={2.5}>
        {/* The open card: head, rows, action bar. */}
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          bg="white"
          overflow="hidden"
        >
          <WorklistHead />
          <Box borderTopWidth="1px" borderColor="gray.100">
            {Array.from({ length: 3 }, (_, i) => (
              <Flex
                key={i}
                align="center"
                justify="space-between"
                gap={4}
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor="gray.100"
              >
                <Box flex="1" minW={0}>
                  <Bar w={`${44 + ((i * 9) % 22)}%`} h="12px" />
                  <Bar w={`${28 + ((i * 5) % 14)}%`} h="10px" mt="5px" />
                </Box>
                <Bar w="88px" h="12px" />
              </Flex>
            ))}
            <Flex
              align="center"
              justify="space-between"
              gap={3}
              px={4}
              py={3}
              bg="gray.50"
            >
              <Bar w="140px" h="11px" />
              <Skeleton w="180px" h="40px" borderRadius="lg" />
            </Flex>
          </Box>
        </Box>

            {/* The closed cards under it. */}
            {Array.from({ length: 3 }, (_, i) => (
              <Box
                key={i}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                bg="white"
                overflow="hidden"
              >
                <WorklistHead />
              </Box>
            ))}
          </Flex>
        </Box>

        {/* The index rail — flat rows, so bare bars and nothing boxed. Hidden
            where the real rail is: on a workspace too narrow for two columns,
            approximated here by the shell's own desktop floor. */}
        <Box
          w="240px"
          flexShrink={0}
          display={{ base: "none", lg: "block" }}
        >
          <Bar w="80px" h="10px" />
          <Flex direction="column" gap="10px" mt="12px">
            {Array.from({ length: 8 }, (_, i) => (
              <Bar key={i} w={`${58 + ((i * 11) % 30)}%`} h="11px" />
            ))}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

/* ------------------------------ the swap ------------------------------ */

export type SwapTarget = "record" | "billing" | "worklist";

/**
 * The two-column placeholder for whichever layout is arriving.
 *
 * The tracks are both layouts' — they are the same tracks — so the COLUMNS do
 * not move during the swap even though the main one's contents are replaced.
 * The gutter stays where it is and only what is beside it changes.
 */
export function ServicePayablesSwapSkeleton({
  target,
}: {
  target: SwapTarget;
}) {
  // The worklist is one full-width stack, not two columns — swapping back to
  // it from a record paints the stack's own shape rather than the rail's.
  if (target === "worklist") {
    return (
      <Box aria-hidden>
        <WorklistSkeleton />
      </Box>
    );
  }

  return (
    // The workspace's own tracks, so the skeleton and the layout it stands in
    // for split on the same measurement — see `workspace-layout`. Written main
    // first, and the `order` in those styles is what puts the rail above it
    // when there is only one column.
    <Grid css={WORKSPACE_GRID} aria-hidden>
      {/* The main column's tail as well as its track: both layouts this stands
          in for carry it, and without it the page loses 40px of height for the
          length of the swap and takes the scroll position with it. */}
      <GridItem css={MAIN_COLUMN_TAIL}>
        {target === "record" ? <RecordSkeleton /> : <BillingSkeleton />}
      </GridItem>
      <GridItem css={STACKED_ITEM}>
        <RailSkeleton withBack={target === "record"} />
      </GridItem>
    </Grid>
  );
}

export default ServicePayablesSwapSkeleton;
