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
  /** Small line under the count — what this tab is. */
  label: string;
  /** The bold headline. */
  count: number;
  Icon: IconType;
}

interface TileTabsProps<T extends string> {
  options: TileTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Describes the set to assistive tech, e.g. "Claim queues". */
  label?: string;
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
}: TileTabsProps<T>) {
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
            px={{ base: 2, lg: 3.5 }}
            py={{ base: 2.5, lg: 3 }}
            textAlign={{ base: "center", lg: "left" }}
            cursor="pointer"
            transition="all 0.15s ease"
            display="flex"
            // Down the tile on a phone, across it on a desktop.
            flexDirection={{ base: "column", lg: "row" }}
            // `stretch` is what gives the icon the height of the two lines
            // beside it; centred, it would only ever be as tall as its glyph.
            alignItems={{ base: "center", lg: "stretch" }}
            justifyContent={{ base: "center", lg: "flex-start" }}
            gap={{ base: 1, lg: 3 }}
            bg={active ? "#f4faf6" : "white"}
            borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
            boxShadow={
              active ? `0 0 0 1px ${BRAND_COLORS.primaryGreen}` : "xs"
            }
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
              // phone was already getting.
              fontSize="16px"
              // On a desktop the size is not chosen at all: the box is stretched
              // to the row, so the glyph taking its full height makes the icon
              // exactly as tall as the count and the label stacked beside it,
              // whatever those two happen to measure. `width: auto` keeps it
              // square off the viewBox rather than pinning a second number that
              // would have to be kept in step.
              //
              // Keyed on `lg` rather than a hand-written media query, so it
              // turns over on the same pixel as every other `lg` on this tile
              // instead of on whatever that query happened to say.
              css={{ lg: { "& > svg": { height: "100%", width: "auto" } } }}
            >
              <Icon />
            </Box>

            {/* The count over the label — the same stack on both, which is the
                point: turning the tile on its side moves this block, it does not
                rearrange it. */}
            <Box minW={0}>
              <Text
                fontSize={{ base: "lg", lg: "xl" }}
                fontWeight="800"
                lineHeight="1"
                color={active ? BRAND_COLORS.primaryGreen : "gray.800"}
              >
                {option.count}
              </Text>
              <Text
                fontSize={{ base: "10px", lg: "11px" }}
                fontWeight="600"
                color="gray.500"
                lineHeight="short"
                mt={{ base: 1, lg: "3px" }}
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
