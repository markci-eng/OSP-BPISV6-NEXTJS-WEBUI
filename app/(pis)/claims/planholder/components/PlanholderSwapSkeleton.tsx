"use client";

// The placeholder shown while the profile page swaps between its two layouts.
//
// Swapping replaces BOTH columns at once — the claim takes the main one and the
// plan holder shrinks into the rail, or the other way back. Done bare, the two
// layouts cut between frames: everything on screen is replaced in a single
// paint, and the eye has nothing to follow from one to the other. What it reads
// as is a page that flickered, not a page that moved.
//
// So the swap goes through this instead. It is shaped like the layout being
// swapped TO — same columns, same cards in the same places, same heights — so
// what the eye follows is the target arriving, and the real content lands on
// top of a shape that is already correct rather than pushing one aside.

import { Box, Flex, Grid, GridItem, SimpleGrid, Skeleton } from "@chakra-ui/react";

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

/** A bordered white card — the surface nearly everything on this page sits on. */
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

/** A section heading — title over subtitle, with the count pill on the right. */
function HeadingBlock({ withPill = true }: { withPill?: boolean }) {
  return (
    <Flex align="center" justify="space-between" gap={3} mb={3}>
      <Box flex="1" minW={0}>
        <Bar w="42%" h="14px" />
        <Bar w="62%" h="11px" mt="5px" />
      </Box>
      {withPill && <Skeleton w="26px" h="18px" borderRadius="full" />}
    </Flex>
  );
}

/** The label · dotted leader · value rows inside a details card. */
function RowLines({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Flex key={i} align="center" justify="space-between" gap={4} py="7px">
          <Bar w={`${34 + ((i * 7) % 18)}%`} h="11px" />
          <Bar w={`${22 + ((i * 5) % 14)}%`} h="11px" />
        </Flex>
      ))}
    </>
  );
}

/* --------------------------- the claim column --------------------------- */

/** Shaped like {@link PlanholderClaimDetail}: bar, tiles, card, sections. */
function ClaimDetailSkeleton() {
  return (
    <Box>
      {/* The claim's own header bar — "<", claim no over claim type, "More". */}
      <Flex
        align="center"
        gap={3}
        pb={3}
        borderBottomWidth="1px"
        borderColor="blackAlpha.200"
      >
        <Skeleton w="20px" h="20px" borderRadius="md" flexShrink={0} />
        <Box flex="1" minW={0}>
          <Bar w="46%" h="15px" />
          <Bar w="30%" h="11px" mt="4px" />
        </Box>
        <Skeleton w="76px" h="30px" borderRadius="full" flexShrink={0} />
      </Flex>

      <Box pt={5}>
        {/* Claim Details. The actions are NOT here — on a desktop they sit at
            the top of the rail, over the plan holder card. */}
        <CardBlock>
          <RowLines count={12} />
        </CardBlock>

        {/* Remarks · Notes. */}
        <Box mt={6}>
          <HeadingBlock withPill={false} />
          <CardBlock p={3}>
            <Bar w="92%" h="11px" />
            <Bar w="78%" h="11px" mt="6px" />
            <Bar w="85%" h="11px" mt="6px" />
          </CardBlock>
        </Box>

        {/* Computation/Explanation. */}
        <Box mt={6}>
          <HeadingBlock withPill={false} />
          <RowLines count={6} />
        </Box>

        {/* Payee's Information. */}
        <Box mt={6}>
          <HeadingBlock withPill={false} />
          <Flex direction="column" gap={2}>
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} h="56px" borderRadius="xl" />
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

/* -------------------------- the summary column -------------------------- */

/** The plan holder as it appears in the rail beside an open claim. */
function PlanholderSummarySkeleton() {
  return (
    <Box>
      {/* Print · Edit · Delete · Verify · Endorse · More, over the card. */}
      <SimpleGrid columns={3} gap={2} mb={4}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} h="62px" borderRadius="md" />
        ))}
      </SimpleGrid>

      <CardBlock>
        <Flex align="center" gap={3}>
          <Skeleton w="56px" h="56px" borderRadius="full" flexShrink={0} />
          <Box flex="1" minW={0}>
            <Bar w="72%" h="14px" />
            <Bar w="46%" h="11px" mt="5px" />
          </Box>
        </Flex>
        <Box mt={4}>
          <Bar w="88%" h="11px" />
          <Bar w="64%" h="11px" mt="6px" />
          <Bar w="70%" h="11px" mt="6px" />
        </Box>
      </CardBlock>

      <Box mt={4}>
        <CardBlock>
          <Bar w="52%" h="13px" />
          <Bar w="72%" h="11px" mt="5px" />
          <Box mt={3}>
            <RowLines count={4} />
          </Box>
        </CardBlock>
      </Box>
    </Box>
  );
}

/* --------------------------- the profile page --------------------------- */

/** The record column: who they are, then the sections down the page. */
function ProfileRecordSkeleton() {
  return (
    <Box>
      <CardBlock>
        <Flex align="center" gap={4}>
          <Skeleton w="64px" h="64px" borderRadius="full" flexShrink={0} />
          <Box flex="1" minW={0}>
            <Bar w="58%" h="16px" />
            <Bar w="34%" h="11px" mt="6px" />
            <Bar w="80%" h="11px" mt="8px" />
          </Box>
        </Flex>
      </CardBlock>

      <Box mt={4}>
        <CardBlock>
          <Bar w="46%" h="13px" />
          <Bar w="66%" h="11px" mt="5px" />
          <Box mt={3}>
            <RowLines count={5} />
          </Box>
        </CardBlock>
      </Box>

      {/* Remarks, then Payments — the two that follow it down the column. */}
      <Box mt={4}>
        <HeadingBlock withPill={false} />
        <CardBlock p={3}>
          <Bar w="90%" h="11px" />
          <Bar w="74%" h="11px" mt="6px" />
        </CardBlock>
      </Box>

      <Box mt={4}>
        <HeadingBlock />
        <CardBlock p={3}>
          <RowLines count={5} />
        </CardBlock>
      </Box>
    </Box>
  );
}

/** The work column: the plan's actions, the claims, the folder. */
function ProfileRailSkeleton() {
  return (
    <Box>
      {/* Print SOA · Cancel Plan Termination · Consider Plan. */}
      <SimpleGrid columns={3} gap={2} maxW="420px">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} h="62px" borderRadius="md" />
        ))}
      </SimpleGrid>

      <Box mt={4}>
        <HeadingBlock />
        <Flex direction="column" gap={3}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} h="82px" borderRadius="2xl" />
          ))}
        </Flex>
      </Box>

      <Box mt={4}>
        <HeadingBlock withPill={false} />
        <Flex direction="column" gap={2}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} h="56px" borderRadius="xl" />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

/* ------------------------------ the swap ------------------------------ */

export type SwapTarget = "claim" | "profile";

/**
 * The two-column placeholder for whichever layout is arriving.
 *
 * The tracks are the ones both layouts share, so the COLUMNS do not move during
 * the swap even though everything in them does — the gutter stays where it is
 * and only the contents cross it.
 */
export function PlanholderSwapSkeleton({ target }: { target: SwapTarget }) {
  return (
    <Grid
      templateColumns={{
        base: "minmax(0, 1fr)",
        xl: "minmax(0, 1fr) 380px",
        "2xl": "minmax(0, 1fr) 420px",
      }}
      gap={6}
      alignItems="start"
      aria-hidden
    >
      <GridItem minW={0}>
        {target === "claim" ? (
          <ClaimDetailSkeleton />
        ) : (
          <ProfileRecordSkeleton />
        )}
      </GridItem>
      <GridItem minW={0}>
        {target === "claim" ? (
          <PlanholderSummarySkeleton />
        ) : (
          <ProfileRailSkeleton />
        )}
      </GridItem>
    </Grid>
  );
}

export default PlanholderSwapSkeleton;
