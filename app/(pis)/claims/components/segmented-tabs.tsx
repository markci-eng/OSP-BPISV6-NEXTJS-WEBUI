"use client";

// The claims area's segmented switch — options in a grey track, the live one
// lifted out of it in white.
//
// IT IS THE CONVEYOR'S STAGE SWITCH, lifted out of `service-payables/conveyor/
// stage-switch.tsx`, which took it from the death claim's `StageCard` before
// that. Every value here is that control's: the `gray.100` track at 3px padding
// with an `lg` corner, the `md` tabs at 5px, white with an `xs` lift when live,
// the label in the brand's dark green at 700 against gray.600 at 600, and the
// count trailing it a shade lighter. Written down once because the two copies
// that already existed are the reason `TabPill` and `FieldLabel` have their own
// files — a control drawn in two places is a control that drifts.
//
// THE LABEL TRUNCATES AND THE COUNT DOES NOT. The number is one or two digits
// and it is usually the basis of the choice between tabs, so when a track is
// too narrow for both, the word yields first.
//
// `stage-switch.tsx` still draws its own. It should use this — the difference
// there is only that it wraps four tabs to 2x2 until `xl`, which `columns`
// covers.

import { SimpleGrid, Text, chakra, type SimpleGridProps } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
  /** Omit for a tab with nothing to count. */
  count?: number;
}

export interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Announced on the track — what the tabs are choosing between. */
  label: string;
  /** Defaults to one column per option, on one row. */
  columns?: SimpleGridProps["columns"];
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  columns,
}: SegmentedTabsProps<T>) {
  return (
    // IN A TRACK, so the options read as one choice rather than as buttons that
    // happen to be adjacent.
    <SimpleGrid
      columns={columns ?? options.length}
      gap={1}
      p="3px"
      bg="gray.100"
      borderRadius="lg"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          // `chakra.button` rather than `<Flex as="button">`: `as` does not
          // widen the props to the element's own, so `type` — which keeps this
          // from submitting any form it is dropped into — is a type error there.
          <chakra.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            // `role="tab"` with `aria-selected`, which is the pairing a
            // `tablist` expects — the stage switch says `aria-pressed`, which
            // describes a toggle button rather than a tab among tabs.
            role="tab"
            aria-selected={active}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            flex="1"
            minW={0}
            py="5px"
            borderRadius="md"
            bg={active ? "white" : "transparent"}
            boxShadow={active ? "xs" : undefined}
            cursor="pointer"
            transition="background-color 120ms ease"
            _hover={active ? undefined : { bg: "blackAlpha.50" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: BRAND_COLORS.primaryGreen,
              outlineOffset: "2px",
            }}
          >
            <Text
              fontSize="xs"
              fontWeight={active ? "700" : "600"}
              color={active ? BRAND_COLORS.darkGreen : "gray.600"}
              truncate
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <Text
                fontSize="xs"
                fontWeight="600"
                flexShrink={0}
                color={active ? BRAND_COLORS.darkGreen : "gray.400"}
              >
                {option.count}
              </Text>
            )}
          </chakra.button>
        );
      })}
    </SimpleGrid>
  );
}

export default SegmentedTabs;
