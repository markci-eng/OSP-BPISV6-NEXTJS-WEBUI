"use client";

// Tile tabs — the claims area's large, tappable segmented control.
//
// Deliberately the SAME construction as the benefit picker on the death-claim
// form (`DeathClaimForm` → the BENEFITS grid): a bordered card per option, an
// icon above a bold headline above a small label, the selected one ringed and
// washed in the brand green. Someone who has filled the claim form recognises
// this control on sight, which is the whole reason it is built this way rather
// than as another pill row.
//
// One difference, and it is the point of the control here: the bold headline is
// the option's COUNT, not an abbreviation. A benefit tile has a code worth
// showing; a queue tile has a number the processor is actually deciding on —
// which queue to work next — so the number takes the headline slot and the queue
// name drops to the label underneath.
//
// The narrower pill row (`DeathClaimsFilter`) is still the right control for
// filtering WITHIN a queue. This is for choosing the queue itself, which is a
// bigger decision and gets a bigger target.
//
// On a desktop the tile turns on its side: the icon moves to the left and grows
// to the full height of the count and the label, which stay stacked exactly as
// they are on a phone. Nothing is added or taken away — the same three things in
// the same order, read across instead of down. That is the shape a tile of this
// size wants once it is wider than it is tall, and a centred column in a tab
// three times its own height would leave the tile mostly empty.

import type { IconType } from "react-icons";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface TileTabOption<T extends string> {
  value: T;
  /** What this tab is. The small line under the count, or the headline itself
   *  when there is no count — see {@link TileTabOption.count}. */
  label: string;
  /**
   * The bold headline, when the number is part of the choice.
   *
   * OPTIONAL, and leaving it out is a real option rather than a degraded one. A
   * count belongs on a tile the user is deciding FROM — "which queue has work in
   * it" — and the dashboard's own tabs are exactly that. A tile that only names
   * a destination is better off saying the name loudly than whispering it under
   * a number, so when this is absent the label is promoted into the headline
   * slot and the tile has one line instead of two.
   */
  count?: number;
  Icon: IconType;
}

interface TileTabsProps<T extends string> {
  options: TileTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Describes the set to assistive tech, e.g. "Claim queues". */
  label?: string;
  /**
   * Keep the stacked, centred tile at every width instead of turning it on its
   * side from `lg`.
   *
   * The sideways tile is chosen on the VIEWPORT's width, which is the right
   * question when this row has the wide half of a dashboard. It is the wrong
   * one in a 360px rail: the viewport still says "desktop", so three tiles that
   * each have about 105px are laid out as icon-beside-text — and the count
   * breaks across lines while the label truncates to a letter.
   *
   * Compact says the column is narrow regardless of what the window is doing.
   * The stacked tile is the same one a phone already gets, so nothing new is
   * introduced here — it is just no longer keyed to the wrong measurement.
   *
   * Off by default, so the dashboards that already call this are unchanged.
   */
  compact?: boolean;
}

/**
 * A row of card-shaped tabs, one column per option.
 *
 * Typed on the option's `value`, so a caller's own union — `"process" |
 * "verification" | …` — survives into `onChange` and cannot be handed a value
 * outside it.
 */
export function TileTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  compact = false,
}: TileTabsProps<T>) {
  // Each responsive prop below reads "the base value everywhere" in compact, and
  // its usual `{ base, lg }` pair otherwise. Written as a helper so the two
  // layouts cannot drift: there is still exactly one place each value is set.
  const at = <A, B>(base: A, lg: B) => (compact ? base : { base, lg });

  return (
    <SimpleGrid
      role="tablist"
      aria-label={label}
      columns={options.length}
      gap={2}
      w="full"
    >
      {options.map((option) => {
        const active = option.value === value;
        const { Icon } = option;
        // `!= null` and not a truthiness test: a queue with nothing in it has a
        // count of 0, and that zero is exactly the thing the tile is reporting.
        const hasCount = option.count != null;

        return (
          <Box
            key={option.value}
            role="tab"
            tabIndex={0}
            aria-selected={active}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onChange(option.value);
            }}
            borderWidth="1px"
            borderRadius="xl"
            // Compact is TIGHTER than the phone's tile, not merely the same
            // tile at a narrower width — which is what it was until now, since
            // `at()` hands compact whatever the `base` value is.
            //
            // The two want different things. On a phone the tile row is the
            // whole screen's width and has a screen's height under it, so it can
            // afford to be comfortable. In the rail every pixel these three take
            // is a pixel the queue underneath does not get, and the queue is the
            // reason the column exists. Written as its own value rather than by
            // shrinking `base`, so the phone's tile — and the dashboard that
            // still uses it — is left exactly as it was.
            px={compact ? 1.5 : { base: 2, lg: 3.5 }}
            py={compact ? 2 : { base: 2.5, lg: 3 }}
            textAlign={at("center", "left")}
            cursor="pointer"
            transition="all 0.15s ease"
            display="flex"
            // Down the tile on a phone or in a narrow column, across it when
            // there is room.
            flexDirection={at("column", "row")}
            // `stretch` is what gives the icon the height of the two lines
            // beside it; centred, it would only ever be as tall as its glyph.
            alignItems={at("center", "stretch")}
            justifyContent={at("center", "flex-start")}
            gap={compact ? 0.5 : { base: 1, lg: 3 }}
            bg={active ? "#f4faf6" : "white"}
            borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
            // ONE BORDER, THE SAME WIDTH IN BOTH STATES.
            //
            // The selected tile used to carry a `0 0 0 1px` ring in the brand
            // green ON TOP OF its 1px green border. Two greens flush against
            // each other read as one 2px edge, so selecting a tile appeared to
            // thicken its border while its neighbours stayed hairlines — and the
            // row lost the even rhythm a segmented control depends on.
            //
            // Nothing is lost by dropping it. Selection is already carried three
            // ways over: the border turns green, the tile takes a green wash,
            // and the label goes green and bolder. The ring was a fourth signal
            // whose only distinct contribution was the weight problem.
            boxShadow="xs"
            _hover={{
              borderColor: active ? BRAND_COLORS.primaryGreen : "gray.300",
            }}
          >
            <Box
              color={active ? BRAND_COLORS.primaryGreen : "gray.500"}
              flexShrink={0}
              display="flex"
              alignItems="center"
              // Sized in `em` rather than through the icon's own `size` prop,
              // which takes a number and so cannot be given one value per
              // breakpoint. `react-icons` draws at `1em` when no size is passed,
              // so the font size IS the icon size — and 16px is exactly what the
              // phone was already getting. A compact tile takes it down two
              // pixels: the glyph is the tallest thing in the stack, so it is
              // where height is actually bought.
              fontSize={compact ? "14px" : "16px"}
              // On a desktop the size is not chosen at all: the box is stretched
              // to the row, so the glyph taking its full height makes the icon
              // exactly as tall as the count and the label stacked beside it,
              // whatever those two happen to measure. `width: auto` keeps it
              // square off the viewBox rather than pinning a second number that
              // would have to be kept in step.
              //
              // Keyed on `lg` rather than a hand-written media query, so it
              // turns over on the same pixel as every other `lg` on this tile
              // instead of on whatever that query happened to say. Dropped in
              // compact, where the tile never turns on its side and a glyph
              // stretched to the block's height would tower over it.
              css={
                compact
                  ? undefined
                  : { lg: { "& > svg": { height: "100%", width: "auto" } } }
              }
            >
              <Icon />
            </Box>

            {/* The count over the label — the same stack on both, which is the
                point: turning the tile on its side moves this block, it does not
                rearrange it.

                With no count the label MOVES INTO the headline rather than
                staying a small grey line with a gap above it: one line, at the
                weight the tile's only line should carry. See `count`. */}
            <Box minW={0}>
              {hasCount && (
                <Text
                  fontSize={compact ? "md" : { base: "lg", lg: "xl" }}
                  fontWeight="800"
                  lineHeight="1"
                  color={active ? BRAND_COLORS.primaryGreen : "gray.800"}
                >
                  {option.count}
                </Text>
              )}
              <Text
                // Sized and weighted as the headline when it IS the headline.
                // A compact tile holds the label a pixel back from the phone's,
                // which is as far as it goes: this is the only thing on the tile
                // that has to be READ rather than recognised, so it gives up the
                // least.
                fontSize={
                  hasCount
                    ? compact
                      ? "10px"
                      : { base: "10px", lg: "11px" }
                    : compact
                      ? "11px"
                      : { base: "xs", lg: "sm" }
                }
                fontWeight={hasCount ? "600" : "700"}
                color={
                  hasCount
                    ? "gray.500"
                    : active
                      ? BRAND_COLORS.primaryGreen
                      : "gray.800"
                }
                lineHeight="short"
                // No gap when there is nothing above it to be separated from.
                mt={hasCount ? at(1, "3px") : 0}
              >
                {option.label}
              </Text>
            </Box>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

export default TileTabs;
