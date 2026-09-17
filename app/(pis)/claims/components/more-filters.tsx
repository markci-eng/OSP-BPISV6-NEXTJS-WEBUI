"use client";

// A LIST'S SECOND-TIER FILTERS, behind one button — the claims area's own.
//
// IN THE COMPONENTS FOLDER SINCE 2026-09-14, and it was `DeathClaimsMoreFilters`
// in the death claim's folder before that. The service payables queue asked for
// the same control (user: "add a filter here same as the one in the v1 we
// design, make the design the same as the death claim table"), and a funnel
// drawn twice is a funnel that drifts. Nothing about it was ever claim-shaped:
// it takes groups of options and hands back what is ticked.
//
// The two that decide how the queue is WORKED stay on the toolbar as their own
// dropdowns: the type (Special / Regular) and the branch. These two narrow a
// queue that is already being worked, they are multi-select rather than
// one-of-n, and there are two of them today with more to come. Three more
// dropdowns in a row that also holds a view toggle and a search box is a
// toolbar that wraps on any screen a processor actually uses.
//
// So they collapse into a single icon button that opens both at once, one
// accordion section each, checkboxes inside. Multi-select is the reason for the
// checkbox and the reason these could never have been `<select>`s: "Davao and
// Cebu" is an ordinary question to ask of a queue and a native select cannot
// express it without a modifier key nobody discovers.

import {
  Accordion,
  Box,
  Button,
  Checkbox,
  Flex,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuListFilter } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CONTROL_HEIGHT } from "./control-height";

/** One accordion section: what it filters, and everything it can be. */
export interface FilterGroup {
  /** Stable key, used as the accordion item's value. */
  key: string;
  /** Heading on the section, e.g. "Territory". */
  label: string;
  /** Every value in the data, already sorted. */
  options: { value: string; label: string }[];
  /** The values currently ticked. Empty means the group is not narrowing. */
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Toggle one value in a group's selection.
 *
 * Written here rather than in the caller so every group behaves the same way,
 * and so a caller holds nothing but the array.
 */
function toggle(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
}

/**
 * The filter button and its dropdown.
 *
 * The button is the icon alone — it sits in a row of controls that all name
 * themselves, and a fourth labelled control is what pushed these behind a
 * button in the first place.
 *
 * IT USED TO CARRY A COUNT, and the count had a good reason: a collapsed filter
 * quietly narrowing the queue is the one way this pattern misleads. But the
 * button is a 36px square with no horizontal padding — sized to the glyph, since
 * the row it stands in is measured in dropdowns — so the badge had to live in
 * whatever the 16px icon left over. At 11px, squeezed against the icon inside a
 * square that cannot grow, the digit was not legible enough to be read as a
 * number; it read as a smudge beside the icon.
 *
 * So the warning is carried by COLOUR instead, which the button was already
 * doing: with anything ticked it takes the green tint and border the rest of the
 * area uses for "on". That says the queue is being narrowed, which is the part
 * that must not be missed. HOW MUCH is one click away and legible when it gets
 * there — each group in the panel shows its own count beside its heading, which
 * is also the more useful figure, since it says WHERE the filtering is.
 *
 * The number is still in the `aria-label`, where it costs no pixels: a screen
 * reader announces "Filters (3 applied)".
 */
export function MoreFilters({
  groups,
  ...rest
}: {
  groups: FilterGroup[];
} & Omit<Popover.RootProps, "children">) {
  const active = groups.reduce((n, g) => n + g.selected.length, 0);
  const anyActive = active > 0;

  const clearAll = () => groups.forEach((g) => g.onChange([]));

  return (
    // Uncontrolled, like the kit's own date picker: nothing outside needs to
    // know whether the sheet is up, and holding that in state here was enough
    // to stop the positioner ever measuring its anchor.
    <Popover.Root positioning={{ placement: "bottom-end" }} {...rest}>
      <Popover.Trigger asChild>
        <Button
          aria-label={
            anyActive ? `Filters (${active} applied)` : "More filters"
          }
          variant="outline"
          size="sm"
          h={CONTROL_HEIGHT}
          // Square: an icon with no label needs no more width than the glyph,
          // and the row it stands in is measured in dropdowns.
          minW={CONTROL_HEIGHT}
          px={0}
          flexShrink={0}
          borderRadius="lg"
          bg={anyActive ? "#f4faf6" : "white"}
          color={anyActive ? BRAND_COLORS.darkGreen : "gray.600"}
          borderColor={anyActive ? BRAND_COLORS.darkGreen : "gray.200"}
          _hover={{
            bg: anyActive ? "#eaf5ee" : "gray.50",
            borderColor: anyActive ? BRAND_COLORS.darkGreen : "gray.300",
          }}
        >
          <LuListFilter size={16} />
        </Button>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content w="260px" borderRadius="xl" overflow="hidden">
            <Flex
              align="center"
              justify="space-between"
              gap={2}
              px={3}
              py={2.5}
              borderBottomWidth="1px"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="600" color="gray.800">
                Filters
              </Text>
              {/* Only when there is something to clear — a permanently visible
                  "Clear" over an empty selection is a control that does
                  nothing most of the time it is looked at. */}
              {anyActive && (
                <Text
                  as="button"
                  fontSize="xs"
                  fontWeight="600"
                  color={BRAND_COLORS.darkGreen}
                  onClick={clearAll}
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  Clear all
                </Text>
              )}
            </Flex>

            {/* Both sections open on arrival, and either can be shut.
                `multiple` because they are independent questions — shutting
                Territory to see all of Benefits, and then having Territory's
                own ticks hidden behind a section that closed itself, is the
                one thing an accordion here must not do. */}
            <Accordion.Root
              multiple
              defaultValue={groups.map((g) => g.key)}
              // The list is as long as the data is; past a screenful it scrolls
              // inside the dropdown rather than running off the window.
              maxH="320px"
              overflowY="auto"
            >
              {groups.map((group) => (
                <Accordion.Item
                  key={group.key}
                  value={group.key}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                >
                  <Accordion.ItemTrigger px={3} py={2}>
                    <Flex align="center" gap={2} flex="1" minW={0}>
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color="gray.700"
                        truncate
                      >
                        {group.label}
                      </Text>
                      {group.selected.length > 0 && (
                        <Box
                          px={1.5}
                          borderRadius="full"
                          bg="#eaf5ee"
                          color={BRAND_COLORS.darkGreen}
                          fontSize="10px"
                          fontWeight="bold"
                        >
                          {group.selected.length}
                        </Box>
                      )}
                    </Flex>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>

                  <Accordion.ItemContent>
                    <Accordion.ItemBody px={3} pb={2.5} pt={0}>
                      {group.options.length === 0 ? (
                        <Text fontSize="xs" color="gray.500">
                          Nothing to filter by in this queue.
                        </Text>
                      ) : (
                        <Flex direction="column" gap={2}>
                          {group.options.map((opt) => (
                            <Checkbox.Root
                              key={opt.value}
                              size="sm"
                              checked={group.selected.includes(opt.value)}
                              onCheckedChange={() =>
                                group.onChange(toggle(group.selected, opt.value))
                              }
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label
                                fontSize="xs"
                                fontWeight="500"
                                color="gray.700"
                              >
                                {opt.label}
                              </Checkbox.Label>
                            </Checkbox.Root>
                          ))}
                        </Flex>
                      )}
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

export default MoreFilters;
