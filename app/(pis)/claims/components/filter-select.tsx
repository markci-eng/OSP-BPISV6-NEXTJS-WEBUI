"use client";

// ONE FILTER AS ITS OWN CONTROL — a labelled dropdown of checkboxes, for a
// toolbar with the width to carry it.
//
// THE OTHER HALF OF `MoreFilters`, and the two are a pair rather than rivals.
// That component's own note says why it collapses its groups behind a funnel:
// the claims table's toolbar already holds a type dropdown, a branch dropdown, a
// view toggle and a search box, and three more labelled controls in that row is
// a toolbar that wraps on any screen a processor actually uses. The reason is
// the ROW, not the filter — so where the row is wide and nearly empty, the same
// groups are better off stated (user, 2026-09-14: "since it is wide we can
// remove it in the filter button and have dedicated [controls] in here").
//
// WHAT IS GAINED IS THE NAME. Behind the funnel, "Territory" is a word a reader
// finds only after opening a panel they had no particular reason to open —
// which is why that button has to carry a colour to admit it is narrowing
// anything at all. Out here the control says what it filters and what it is
// filtering by, before it is touched and while it is on.
//
// STILL MULTI-SELECT, AND STILL NOT A `<select>`. "Bicol and Calabarzon" is an
// ordinary question to ask of a queue, and a native select cannot express it
// without a modifier key nobody discovers. Same `FilterGroup` shape as the
// funnel's, so a caller can move a group from one to the other without
// rewriting it.

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CONTROL_HEIGHT } from "./control-height";
import type { FilterGroup } from "./more-filters";

export type FilterSelectProps = Omit<FilterGroup, "key"> & {
  /**
   * What the panel says when the list on show has nothing to filter by.
   *
   * A SENTENCE ABOUT THE LIST, not about the control. An empty Processor
   * dropdown over a For Process queue is correct and ordinary — nobody has put
   * those billings through yet — and "no options" would read as a fault.
   */
  emptyNote?: string;
};

/** Toggle one value, so every caller holds nothing but the array. */
function toggle(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
}

export function FilterSelect({
  label,
  options,
  selected,
  onChange,
  emptyNote = "Nothing to filter by in this list.",
}: FilterSelectProps) {
  const active = selected.length > 0;

  return (
    // Uncontrolled, like the funnel and like the kit's own date picker: nothing
    // outside needs to know whether the panel is up, and holding that in state
    // was enough to stop the positioner ever measuring its anchor.
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          h={CONTROL_HEIGHT}
          px={3}
          gap={1.5}
          flexShrink={0}
          borderRadius="lg"
          fontSize="xs"
          fontWeight="600"
          bg={active ? "#f4faf6" : "white"}
          color={active ? BRAND_COLORS.darkGreen : "gray.600"}
          borderColor={active ? BRAND_COLORS.darkGreen : "gray.200"}
          _hover={{
            bg: active ? "#eaf5ee" : "gray.50",
            borderColor: active ? BRAND_COLORS.darkGreen : "gray.300",
          }}
        >
          {label}
          {/* HOW MANY, IN THE CONTROL ITSELF. The funnel could not do this —
              it is a 36px square sized to its glyph, so the digit came out as a
              smudge beside the icon and the count had to move inside the panel.
              A labelled button has the room, and a filter that is narrowing a
              list should say how much on its face. */}
          {active && (
            <Box
              px={1.5}
              borderRadius="full"
              bg="#eaf5ee"
              color={BRAND_COLORS.darkGreen}
              fontSize="10px"
              fontWeight="bold"
            >
              {selected.length}
            </Box>
          )}
          <LuChevronDown size={13} />
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
                {label}
              </Text>
              {/* Only when there is something to clear — a permanently visible
                  "Clear" over an empty selection is a control that does nothing
                  most of the time it is looked at. */}
              {active && (
                <Text
                  as="button"
                  fontSize="xs"
                  fontWeight="600"
                  color={BRAND_COLORS.darkGreen}
                  onClick={() => onChange([])}
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                >
                  Clear
                </Text>
              )}
            </Flex>

            {/* As long as the data is; past a screenful it scrolls inside the
                panel rather than running off the window. */}
            <Box maxH="300px" overflowY="auto" px={3} py={2.5}>
              {options.length === 0 ? (
                <Text fontSize="xs" color="gray.500">
                  {emptyNote}
                </Text>
              ) : (
                <Flex direction="column" gap={2}>
                  {options.map((opt) => (
                    <Checkbox.Root
                      key={opt.value}
                      size="sm"
                      checked={selected.includes(opt.value)}
                      onCheckedChange={() =>
                        onChange(toggle(selected, opt.value))
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
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

export default FilterSelect;
