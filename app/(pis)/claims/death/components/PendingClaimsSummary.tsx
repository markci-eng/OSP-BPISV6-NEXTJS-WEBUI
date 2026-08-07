"use client";

// Pending-claims summary — the first thing a processor sees on the mobile
// dashboard: where their own queue currently stands.
//
// The combined total leads as a full-width tile, then Special and Regular sit
// side by side beneath it, breaking it down. All three are the SAME
// construction — the recipe of the shared dashboard KPI tile
// (`components/dashboard/AccountOverviewSection` → `TileItem`): a 2px accent
// border over a 18%-alpha wash of the same accent, an icon chip at 15% alpha,
// the value, then a footer split by a hairline rule. Only the scale is tuned
// down, because two tiles share a phone's width instead of filling it.
//
// The type accents are the SAME two colours the queue already uses to tell the
// types apart (`TYPE_DOT` in `DeathClaimsTable`), so a red tile and a red dot
// in the list below mean the same thing. The total carries the brand's dark
// green — one step away from the regular tile's green, so it reads as the
// summing card rather than a fourth category.

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { LuFileText, LuLayers, LuTriangleAlert } from "react-icons/lu";
import type { IconType } from "react-icons";
import { BaseText, Body, Small } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionTitle } from "../../components/section-title";
import { SwipeDeck } from "../../components/swipe-deck";
import { useIsShortViewport } from "../../components/use-short-viewport";
import { TYPE_DOT, type DeathClaimFilter } from "./DeathClaimsFilter";

interface PendingClaimsSummaryProps {
  /** Pending counts per type, plus the combined `all` total. */
  counts: Record<DeathClaimFilter, number>;
  /**
   * Heading, when the default does not fit where it is being used.
   *
   * The default names the subject in full because in the rail it sits under a
   * page heading it could be confused with. Across the top of a column of its
   * own there is nothing to disambiguate it from, and the short form reads
   * better at that width.
   */
  title?: string;
  /**
   * Line under the heading. Pass `null` for none — `undefined` would be
   * indistinguishable from "not specified" and would give back the default.
   */
  subtitle?: string | null;
  /**
   * Lay all three tiles across ONE row instead of the headline-over-two-types
   * arrangement.
   *
   * For a full-width band, where three equal tiles read as three figures side
   * by side. The stacked arrangement exists because the rail is one narrow
   * column, where the same three would be slivers — so this also turns OFF the
   * short-viewport carousel: that carousel is what a narrow column does when it
   * runs out of height, and a band across a desktop is neither.
   */
  singleRow?: boolean;
}

/* ─── Pending stat tile ─── */

interface PendingTileProps {
  Icon: IconType;
  title: string;
  count: number;
  /** Small uppercase label on the left of the footer rule. */
  footerLabel: string;
  /** Accent-coloured figure on the right of the footer rule. */
  footerValue: string;
  color: string;
}

const PendingTile = ({
  Icon,
  title,
  count,
  footerLabel,
  footerValue,
  color,
}: PendingTileProps) => (
  <Box
    borderRadius="3xl"
    position="relative"
    bg={`${color}18`}
    border="2px solid"
    borderColor={color}
    boxShadow="0 1px 4px rgba(0,0,0,0.06)"
    overflow="hidden"
  >
    <Box p={3.5}>
      {/* Header: icon chip + title */}
      <Flex align="center" gap={2} mb={2}>
        <Box
          p={1.5}
          bg={`${color}15`}
          style={{ color }}
          borderRadius="lg"
          flexShrink={0}
        >
          <Icon size={15} />
        </Box>
        <Body fontWeight="600" color="gray.500" truncate>
          {title}
        </Body>
      </Flex>

      {/* Main value */}
      <BaseText
        as="div"
        fontSize="4xl"
        fontWeight="700"
        color="gray.800"
        lineHeight="1"
      >
        {count.toLocaleString()}
      </BaseText>

      {/* Footer: what the number is, and a figure that qualifies it.
          Dropped on short screens — it is the least important line on the tile,
          and losing it from both tile rows frees ~60px, which is what keeps this
          section AND Recent Updates above the fold on a small phone. */}
      <Flex
        align="baseline"
        justify="space-between"
        gap={2}
        mt={2.5}
        pt={2}
        borderTop="1px solid"
        borderColor="gray.100"
        css={{ "@media (max-height: 700px)": { display: "none" } }}
      >
        <Small
          color="gray.400"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
          }}
        >
          {footerLabel}
        </Small>
        <Text
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color,
            letterSpacing: "0.02em",
          }}
        >
          {footerValue}
        </Text>
      </Flex>
    </Box>
  </Box>
);

/* ─── Section ─── */

/** Share of the pending queue a type accounts for, as a whole percentage. */
const share = (count: number, total: number) =>
  total > 0 ? `${Math.round((count / total) * 100)}%` : "0%";

/**
 * Viewport height below which the three tiles become a carousel instead of
 * stacking.
 *
 * What this protects is the FLOOR under the Recent Updates feed. That feed sizes
 * its pages to the room it is left (`useFittedPageSize`), so it absorbs whatever
 * this section costs — but not below three cards, which it will never go under.
 * Stacked tiles plus that three-card minimum reach the bottom navigation, which
 * overlays the last 62px of the viewport, at about 828px. Below that the feed
 * would be pushed under the navigation rather than shrink, so the tiles give way
 * instead; this is that crossover with a little headroom.
 *
 * The cost above the threshold is a card, not a broken layout: stacked, the tiles
 * leave room for three updates a page, where the carousel leaves room for four.
 * That is the trade — and it is why this constant is no longer load-bearing the
 * way it was when the feed's page size was fixed and any change above it silently
 * pushed content off-screen.
 */
const STACKED_MIN_HEIGHT = 840;

/**
 * The dashboard's opening summary: the combined pending total, then the Special
 * and Regular counts breaking it down.
 *
 * On a tall screen all three are visible at once — total across the top, the two
 * types side by side under it. On a short screen they become a carousel of one
 * tile at a time, with its own swipe dots, independent of the Recent Updates
 * carousel below. That trade is deliberate: a processor scrolling to reach their
 * queue is worse than a processor swiping a summary they read once.
 *
 * Headed "Pending Claims Overview". The earlier "Claims Overview" clashed with
 * the page's own title sitting directly above it — naming the subject rather than
 * the area is what separates the two.
 */
export function PendingClaimsSummary({
  counts,
  title = "Pending Claims Overview",
  subtitle = "Pending claims by nature",
  singleRow = false,
}: PendingClaimsSummaryProps) {
  const isShort = useIsShortViewport(STACKED_MIN_HEIGHT) && !singleRow;

  const tiles: (PendingTileProps & { key: string })[] = [
    {
      key: "total",
      Icon: LuLayers,
      title: "Total Pending Claims",
      count: counts.all,
      footerLabel: "Special + Regular",
      footerValue: `${counts.special.toLocaleString()} + ${counts.regular.toLocaleString()}`,
      color: BRAND_COLORS.darkGreen,
    },
    {
      key: "special",
      Icon: LuTriangleAlert,
      title: "Special",
      count: counts.special,
      footerLabel: "Pending",
      footerValue: share(counts.special, counts.all),
      color: TYPE_DOT.special,
    },
    {
      key: "regular",
      Icon: LuFileText,
      title: "Regular",
      count: counts.regular,
      footerLabel: "Pending",
      footerValue: share(counts.regular, counts.all),
      color: TYPE_DOT.regular,
    },
  ];

  return (
    <Box>
      <SectionTitle title={title} subtitle={subtitle ?? undefined} />

      {isShort ? (
        // One tile at a time, swiped.
        <SwipeDeck label="Pending claim totals">
          {tiles.map(({ key, ...tile }) => (
            <PendingTile key={key} {...tile} />
          ))}
        </SwipeDeck>
      ) : (
        <SimpleGrid columns={singleRow ? 3 : 2} gap={3} w="100%">
          {tiles.map(({ key, ...tile }) => (
            // Two columns: the total leads as the headline figure, spanning
            // both, and the two types break it down underneath. Three: every
            // tile is one column and the row is the whole section, so nothing
            // spans anything.
            <Box
              key={key}
              gridColumn={
                !singleRow && key === "total" ? "span 2" : undefined
              }
            >
              <PendingTile {...tile} />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default PendingClaimsSummary;
