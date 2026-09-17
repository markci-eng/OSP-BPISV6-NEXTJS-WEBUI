"use client";

// The searchable list in the left card — staff on one tab, territories on the
// other.
//
// ONE COMPONENT FOR BOTH, because both are the same list: a name, a line of
// context under it, and a number on the right. What differs is only what those
// three are, so they arrive as data rather than as two copies of the same
// search box, scroll box and empty state. The pair of tabs above it is
// `TabPill`, which is built for exactly this — a section with two lists rather
// than one.
//
// THE SEARCH FILTERS, IT DOES NOT GO ANYWHERE, so `SearchBar` is given no
// `onSearch` and draws its magnifier inert — its own note explains why a button
// over an already-narrowed list is worse than no button. Five names do not need
// a search; this is built for the branch that has forty, and for the thirteen
// territories that are always there.
//
// SELECTION SURVIVES THE QUERY. Filtering does not clear what is being edited:
// the pane beside it stays put, so typing a name to check another row cannot
// silently move the work out from under you. A selected row filtered out of
// view is named under the field rather than lost.

import { useMemo, useState } from "react";
import { Box, Flex, Text, VStack, chakra } from "@chakra-ui/react";

import { SearchBar } from "../../components/search-bar";
import { ScrollFade } from "../../components/scroll-fade";

export interface AssignmentListItem {
  key: string;
  title: string;
  /** The line under the title — a primary territory, or who holds this one. */
  subtitle: string;
  /** Draws the subtitle as a gap rather than a fact. */
  subtitleAlert?: boolean;
  value: number;
  /** What the number counts, e.g. "TERRITORIES". Already upper-case. */
  valueLabel: string;
  /** Draws the number as a gap — nobody assigned, nothing held. */
  valueAlert?: boolean;
}

export interface AssignmentListProps {
  items: AssignmentListItem[];
  selected: string;
  onSelect: (key: string) => void;
  placeholder: string;
  /** Announced on the field, and used in the no-matches line. */
  label: string;
}

export function AssignmentList({
  items,
  selected,
  onSelect,
  placeholder,
  label,
}: AssignmentListProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

  const selectedItem = items.find((i) => i.key === selected);
  const selectedHidden =
    !!selectedItem && !matches.some((i) => i.key === selected);

  return (
    // Takes what is left of the card's height and gives it to the list below —
    // the search and the note keep their natural size, so a long roster scrolls
    // under a field that stays put.
    <VStack align="stretch" gap={2.5} flex="0 1 auto" minH={0}>
      <SearchBar
        size="sm"
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
        label={label}
      />

      {selectedHidden && (
        <Text fontSize="11px" color="gray.500">
          Still editing{" "}
          <Text as="span" fontWeight="600">
            {selectedItem.title}
          </Text>
          , which is filtered out.
        </Text>
      )}

      {matches.length === 0 ? (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="lg"
          px={3}
          py={6}
          textAlign="center"
        >
          <Text fontSize="xs" color="gray.500">
            Nothing matching “{query}”.
          </Text>
        </Box>
      ) : (
        // The only list in this card with no ceiling on its length, so it is the
        // part that scrolls. `ScrollFade` hides the bar and fades the edge it
        // continues past — the same affordance the claims queues use, and the
        // reason a card of five rows shows no fade at all.
        <ScrollFade flex="0 1 auto" minH={0}>
          <VStack align="stretch" gap={1.5}>
            {matches.map((item) => {
              const isSelected = item.key === selected;

              return (
                // `chakra.button` rather than `<Box as="button">`: `as` does
                // not widen the props to the element's own, so `type` — which
                // keeps a row from submitting any form this list is dropped
                // into — is a type error there.
                <chakra.button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.key)}
                  textAlign="left"
                  borderWidth="1px"
                  borderColor={
                    isSelected ? "var(--chakra-colors-primary)" : "gray.200"
                  }
                  bg={isSelected ? "green.50" : "white"}
                  borderRadius="lg"
                  px={3}
                  py={2.5}
                  cursor="pointer"
                  transition="border-color 0.15s, background 0.15s"
                  _hover={{ borderColor: isSelected ? undefined : "gray.300" }}
                >
                  <Flex align="center" gap={3}>
                    <Box minW={0} flex="1">
                      <Text
                        fontSize="sm"
                        fontWeight={isSelected ? "600" : "500"}
                        color="gray.800"
                        lineClamp={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        fontSize="11px"
                        color={item.subtitleAlert ? "orange.600" : "gray.500"}
                        lineClamp={1}
                        mt="2px"
                      >
                        {item.subtitle}
                      </Text>
                    </Box>

                    <Box textAlign="right" flexShrink={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={item.valueAlert ? "orange.600" : "gray.800"}
                        fontVariantNumeric="tabular-nums"
                      >
                        {item.value}
                      </Text>
                      <Text
                        fontSize="9px"
                        color="gray.400"
                        letterSpacing="0.08em"
                      >
                        {item.valueLabel}
                      </Text>
                    </Box>
                  </Flex>
                </chakra.button>
              );
            })}
          </VStack>
        </ScrollFade>
      )}
    </VStack>
  );
}

export default AssignmentList;
