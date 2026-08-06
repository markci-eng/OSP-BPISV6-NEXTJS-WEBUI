"use client";

import { Box, Flex, NativeSelect, SimpleGrid, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { DeathClaimType } from "../death-claims-data";

export type DeathClaimFilter = "special" | "regular" | "all";

/**
 * Dot colour that tells Special from Regular wherever the two appear together —
 * the card list, the table, the summary tiles on the dashboard.
 *
 * Lives with the type filter because this file is already the one place that
 * knows what the types are and what they are called; a colour kept somewhere
 * else is a colour that ends up meaning something different in one view.
 */
export const TYPE_DOT: Record<DeathClaimType, string> = {
  special: "#e11d48",
  regular: BRAND_COLORS.primaryGreen,
};

/**
 * Height shared by every control in the queue's toolbar — this filter's
 * dropdown, the search box, the branch picker. Kept here because this is the
 * file the table already depends on, so the number lives in one place without
 * the two importing each other.
 */
export const CONTROL_HEIGHT = "36px";

interface FilterOption {
  value: DeathClaimFilter;
  /** Label on the pill, where the row of three is its own context. */
  label: string;
  /**
   * Label in the dropdown, which stands on its own. "All" alone, sitting beside
   * a branch filter, reads as "all branches"; the pill never has that problem
   * because Special and Regular are right next to it.
   */
  selectLabel: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: "special", label: "Special", selectLabel: "Special" },
  { value: "regular", label: "Regular", selectLabel: "Regular" },
  { value: "all", label: "All", selectLabel: "All Types" },
];

interface DeathClaimsFilterProps {
  value: DeathClaimFilter;
  onChange: (value: DeathClaimFilter) => void;
  counts: Record<DeathClaimFilter, number>;
}

/**
 * Compact segmented control — three small tabs (Special / Regular / All),
 * each showing its count and label side by side. The active tab is ringed green.
 */
export function DeathClaimsFilter({
  value,
  onChange,
  counts,
}: DeathClaimsFilterProps) {
  return (
    <SimpleGrid columns={3} gap={2} w="full">
      {FILTER_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Box
            key={opt.value}
            role="button"
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onChange(opt.value);
            }}
            px={2}
            py="7px"
            borderRadius="full"
            borderWidth="1px"
            bg={active ? "#f4faf6" : "white"}
            borderColor={active ? BRAND_COLORS.darkGreen : "gray.200"}
            boxShadow={active ? `0 0 0 1px ${BRAND_COLORS.darkGreen}` : "xs"}
            transition="all 0.15s ease"
            _hover={{ borderColor: active ? BRAND_COLORS.darkGreen : "gray.300" }}
            cursor="pointer"
          >
            <Flex align="center" justify="center" gap={1.5}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                lineHeight="1"
                color={active ? BRAND_COLORS.darkGreen : "gray.800"}
              >
                {counts[opt.value]}
              </Text>
              <Text
                fontSize="sm"
                fontWeight="600"
                lineHeight="1"
                color={active ? BRAND_COLORS.darkGreen : "gray.700"}
              >
                {opt.label}
              </Text>
            </Flex>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

/**
 * The same filter as a dropdown — what the desktop toolbar uses in place of the
 * pill row.
 *
 * A phone has a row to spare and nothing better to put in it, so three pills
 * there are worth their space: every option and every count is readable without
 * a tap. A desktop toolbar already has a search box and a branch dropdown side
 * by side with room left over, so this goes in beside them and the pill row is
 * dropped entirely — which hands the cards a whole extra row, on the section the
 * dashboard is built around.
 *
 * The counts come along into the options, so nothing is lost by collapsing it:
 * closed, it still reads "Special (4)".
 */
export function DeathClaimsFilterSelect({
  value,
  onChange,
  counts,
  ...rest
}: DeathClaimsFilterProps &
  // The root takes its own `value`/`onChange`, typed for a raw DOM event. Ours
  // win — they are the ones that speak in `DeathClaimFilter` — so they are cut
  // out rather than merged, which is what the two would otherwise do.
  Omit<
    NativeSelect.RootProps,
    keyof DeathClaimsFilterProps | "children"
  >) {
  return (
    <NativeSelect.Root size="sm" flexShrink={0} {...rest}>
      <NativeSelect.Field
        aria-label="Claim type"
        h={CONTROL_HEIGHT}
        borderRadius="lg"
        bg="white"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value as DeathClaimFilter)}
      >
        {FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.selectLabel} ({counts[opt.value]})
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export default DeathClaimsFilter;
