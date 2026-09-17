"use client";

import {
  Box,
  Flex,
  Input,
  NativeSelect,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CONTROL_HEIGHT } from "../../components/control-height";
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
 * dropdown, the search box, the branch picker.
 *
 * It lived here while the death queue was the only toolbar in the claims area.
 * It has moved to `components/control-height`, because the view toggle beside
 * these controls is now shared with the service-payables dashboard and cannot
 * take its height from this feature's filter. Re-exported so the files here that
 * already read it from this module keep working.
 *
 * Imported above as well as re-exported here, deliberately: `export … from`
 * forwards the name without binding it locally, and this file uses the height
 * itself.
 */
export { CONTROL_HEIGHT };

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
            // One even 1px edge, active or not — only the colour changes. Two
            // 1px greens stacked draw as a 2px edge, which made the picked pill
            // a different shape from the two beside it. Same correction as the
            // tile tabs above these pills and the queue's own claim cards.
            boxShadow="xs"
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

/**
 * THE FILED-DATE BOUND, on the toolbar beside the dropdowns.
 *
 * ON THE ROW AND NOT BEHIND THE FUNNEL, which is the opposite of where the other
 * narrowing filters live — and the difference is what the control is FOR. Branch,
 * territory and benefit are questions you occasionally think to ask of a list;
 * "filed between" is the question somebody is holding when they open it, because
 * it is what the caller on the phone actually said. A filter you arrive already
 * meaning to use should not cost a click to find.
 *
 * It is also the one filter that cannot be reached any other way: a branch can be
 * typed into the search box beside it, a date cannot be typed into anything.
 *
 * ONE CONTROL, NOT TWO FIELDS. The two inputs share a single bordered box with
 * the label in front of them, so the row reads as [type] [nature] [filed] [funnel]
 * — four controls — rather than as two dropdowns and a pair of loose date boxes
 * nothing says belong together.
 *
 * NATIVE `type="date"`, and deliberately not the shared `DateRangePicker`: that
 * one stands 40px tall with a caption over each field and opens a Popover per
 * field, which is a form control. This is a toolbar control, and the native input
 * brings the platform's own calendar, keyboard entry and locale for the height of
 * one line.
 *
 * DATES ARE "YYYY-MM-DD" STRINGS, never `Date` objects — the form the claims
 * carry, the form the input reads and writes, and one that compares correctly as
 * a plain string. Nothing here parses a date only to format it back, and no
 * timezone can move a claim a day either way.
 */
export function DeathClaimsFiledRange({
  from,
  to,
  min,
  max,
  onChange,
}: {
  /** "YYYY-MM-DD", or "" for an open bound. */
  from: string;
  to: string;
  /** The span the list actually covers, so no day is offered that must empty it. */
  min?: string;
  max?: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  // EITHER END COUNTS. "From the 1st" narrows the list every bit as much as a
  // pair does, so the control takes its "on" colour from either.
  const active = Boolean(from || to);

  return (
    <Flex
      align="center"
      gap={1}
      h={CONTROL_HEIGHT}
      px={2}
      flexShrink={0}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={active ? BRAND_COLORS.darkGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      transition="border-color 0.15s ease, background 0.15s ease"
    >
      <Text
        fontSize="xs"
        fontWeight="500"
        color={active ? BRAND_COLORS.darkGreen : "gray.500"}
        flexShrink={0}
        pr={0.5}
      >
        Filed
      </Text>

      <FiledInput
        label="Filed from"
        value={from}
        // NEVER PAST THE OTHER END. Bounding each field by its opposite makes an
        // impossible range — a From after the To — something the control will
        // not let you express, rather than something the list has to report as
        // an empty result.
        min={min}
        max={to || max}
        onChange={(next) => onChange({ from: next, to })}
      />

      <Text fontSize="xs" color="gray.400" flexShrink={0}>
        –
      </Text>

      <FiledInput
        label="Filed to"
        value={to}
        min={from || min}
        max={max}
        onChange={(next) => onChange({ from, to: next })}
      />

      {/* Only once there is something to clear — the two fields have no empty
          state of their own a reader can act on, since a native date input
          cannot be emptied from the keyboard on every platform. */}
      {active && (
        <Box
          as="button"
          aria-label="Clear filed dates"
          onClick={() => onChange({ from: "", to: "" })}
          fontSize="sm"
          lineHeight={1}
          px={1}
          color={BRAND_COLORS.darkGreen}
          cursor="pointer"
          flexShrink={0}
          _hover={{ opacity: 0.7 }}
        >
          ×
        </Box>
      )}
    </Flex>
  );
}

/** One end of the bound — a bare date input, since the box around it is drawn. */
function FiledInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (next: string) => void;
}) {
  return (
    <Input
      type="date"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.currentTarget.value)}
      // THE GROUP DRAWS THE EDGE; these sit inside it. Everything the variant
      // would have contributed — a border, a ring on focus, its own height and
      // padding — is exactly what would make the box look like two boxes.
      border="none"
      bg="transparent"
      px={0}
      h="auto"
      minW={0}
      // A native date input reserves room for "mm/dd/yyyy" plus the picker glyph
      // and will not shrink below it; anything narrower clips the year.
      w="104px"
      fontSize="xs"
      color="gray.700"
      _focusVisible={{ outline: "none", boxShadow: "none" }}
      css={{
        "&::-webkit-calendar-picker-indicator": {
          cursor: "pointer",
          opacity: 0.55,
        },
      }}
    />
  );
}

export default DeathClaimsFilter;
