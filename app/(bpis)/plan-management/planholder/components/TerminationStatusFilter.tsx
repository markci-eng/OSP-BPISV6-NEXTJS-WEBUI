"use client";
import { useMemo, useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  Portal,
  Select,
  Text,
  createListCollection,
  useFilter,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { toTitleCase } from "./planholder-list-utils";

/** Stands in for "" in the select, which cannot hold an empty value. */
const ALL = "__all__";
const ALL_LABEL = "All termination statuses";

/** Keys the search box hands on to the select, so the list stays keyboard-driven. */
const NAVIGATION_KEYS = new Set(["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"]);

type Option = { value: string; label: string };

/**
 * Narrows the planholder list to one termination status. "" means every
 * status. The search box at the top of the dropdown filters the options.
 */
export function TerminationStatusFilter({
  value,
  onChange,
  statuses,
}: {
  value: string;
  onChange: (terminationStatus: string) => void;
  /** The termination statuses to offer. */
  statuses: string[];
}) {
  const [query, setQuery] = useState("");
  const { contains } = useFilter({ sensitivity: "base" });

  const options: Option[] = useMemo(
    () => statuses.map((s) => ({ value: s, label: toTitleCase(s) })),
    [statuses],
  );

  // "All" always stays, so there is a way back out of any search.
  const collection = useMemo(
    () =>
      createListCollection<Option>({
        items: [
          { value: ALL, label: ALL_LABEL },
          ...options.filter((o) => contains(o.label, query.trim())),
        ],
      }),
    [options, query, contains],
  );

  // Rendered explicitly: the select looks its label up in the collection,
  // which a search can have filtered the current choice out of.
  const selectedLabel =
    options.find((o) => o.value === value)?.label ??
    (value ? toTitleCase(value) : ALL_LABEL);

  return (
    <Select.Root
      collection={collection}
      size="sm"
      w={{ base: "full", md: "260px" }}
      value={[value || ALL]}
      onValueChange={(details) => {
        const next = details.value[0];
        onChange(!next || next === ALL ? "" : next);
      }}
      onOpenChange={(details) => {
        if (!details.open) setQuery("");
      }}
      positioning={{ sameWidth: false, placement: "bottom-start" }}
    >
      <Select.HiddenSelect aria-label="Termination status" />
      <Select.Control>
        <Select.Trigger
          h="38px"
          borderWidth="1.5px"
          borderColor="hairline"
          borderRadius="10px"
          bg="surfaceRaised"
          boxShadow="xs"
        >
          <Select.ValueText fontSize="sm">{selectedLabel}</Select.ValueText>
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content
            bg="surfaceRaised"
            minW="320px"
            maxH="360px"
            p={0}
            zIndex="popover"
          >
            <Box
              position="sticky"
              top={0}
              zIndex={1}
              bg="surfaceRaised"
              p={2}
              borderBottomWidth="1px"
              borderColor="hairline"
            >
              <InputGroup startElement={<Search size={14} />}>
                <Input
                  size="sm"
                  autoFocus
                  placeholder="Search termination status"
                  aria-label="Search termination statuses"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  // The select reads every key pressed inside it as typeahead
                  // and would jump the highlight on each letter. Keep typing
                  // in the box; let navigation keys through to the list.
                  onKeyDown={(event) => {
                    if (!NAVIGATION_KEYS.has(event.key)) event.stopPropagation();
                  }}
                />
              </InputGroup>
            </Box>

            <Box p={1}>
              {collection.items.map((item) => (
                <Select.Item key={item.value} item={item} fontSize="sm">
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}

              {collection.items.length === 1 && query.trim() !== "" && (
                <Text px={2} py={1.5} fontSize="xs" color="mutedStrong">
                  No termination status matches “{query.trim()}”.
                </Text>
              )}
            </Box>
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
