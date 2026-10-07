"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Input,
  InputGroup,
  Popover,
  Portal,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown, Search } from "lucide-react";
import { Checkbox } from "osp-ui-kit";

import { ACCESS_COLORS } from "../lib/access-theme";

export type ChecklistOption = {
  value: string;
  label: string;
  /** Secondary line, also matched by the search box. */
  description?: string;
};

type SearchableChecklistProps = {
  label: string;
  options: ChecklistOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Draws the trigger in the error colour, e.g. while nothing is picked. */
  invalid?: boolean;
};

/** How many picked labels the closed trigger spells out before "+N". */
const SHOWN_LABELS = 2;

/**
 * Multi-select dropdown: a compact trigger that opens a searchable list of
 * checkboxes. Stays open while ticking so several values can be picked in one
 * pass. A Popover rather than a modal, so it never takes the body lock.
 */
export function SearchableChecklist({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  invalid = false,
}: SearchableChecklistProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Clear the search box whenever the dropdown closes.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(q) ||
          option.value.toLowerCase().includes(q) ||
          (option.description?.toLowerCase().includes(q) ?? false),
      )
    : options;

  const picked = options.filter((option) => selected.includes(option.value));
  const summary =
    picked.length === 0
      ? placeholder
      : picked.length === options.length
        ? `All ${options.length} selected`
        : picked
            .slice(0, SHOWN_LABELS)
            .map((option) => option.label)
            .join(", ") +
          (picked.length > SHOWN_LABELS
            ? ` +${picked.length - SHOWN_LABELS}`
            : "");

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value],
    );

  // "Select all" acts on what the search shows, so a filtered list can be
  // picked in one go without touching values hidden by the search.
  const filteredValues = filtered.map((option) => option.value);
  const allFilteredPicked =
    filtered.length > 0 &&
    filteredValues.every((value) => selected.includes(value));
  const toggleAllFiltered = () =>
    onChange(
      allFilteredPicked
        ? selected.filter((value) => !filteredValues.includes(value))
        : [...new Set([...selected, ...filteredValues])],
    );

  const borderColor = open
    ? ACCESS_COLORS.accent
    : invalid
      ? ACCESS_COLORS.revokeText
      : "gray.200";

  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ sameWidth: true, offset: { mainAxis: 6, crossAxis: 0 } }}
    >
      <Box pos="relative" w="full">
        <Popover.Trigger asChild>
          <Flex
            as="button"
            w="full"
            h="10"
            align="center"
            justify="space-between"
            gap={2}
            px={3}
            textAlign="left"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            bg="white"
            cursor="pointer"
            transition="border-color .15s"
            _hover={{ borderColor: open ? ACCESS_COLORS.accent : "gray.300" }}
          >
            <Text
              fontSize="sm"
              color={picked.length ? "gray.800" : "gray.400"}
              truncate
            >
              {summary}
            </Text>
            <Box
              as="span"
              color="gray.400"
              flexShrink={0}
              transition="transform .15s"
              transform={open ? "rotate(180deg)" : undefined}
            >
              <ChevronDown size={16} />
            </Box>
          </Flex>
        </Popover.Trigger>

        <Text
          as="span"
          pos="absolute"
          top="-2"
          insetStart="2"
          px="1"
          bg="white"
          fontSize="xs"
          lineHeight="1"
          color={invalid && !open ? ACCESS_COLORS.revokeText : "gray.500"}
          pointerEvents="none"
        >
          {label}
        </Text>
      </Box>

      <Portal>
        <Popover.Positioner>
          <Popover.Content borderRadius="lg" overflow="hidden" boxShadow="lg">
            <Popover.Body p={2}>
              <InputGroup startElement={<Search size={15} />}>
                <Input
                  autoFocus
                  size="sm"
                  borderRadius="md"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                />
              </InputGroup>

              <HStack justify="space-between" px={1} pt={2}>
                <Text fontSize="11px" color="gray.500">
                  {selected.length} of {options.length} selected
                </Text>
                {filtered.length > 0 && (
                  <Text
                    as="button"
                    fontSize="11px"
                    fontWeight="600"
                    color={ACCESS_COLORS.accent}
                    cursor="pointer"
                    onClick={toggleAllFiltered}
                  >
                    {allFilteredPicked
                      ? q
                        ? "Clear matches"
                        : "Clear all"
                      : q
                        ? "Select matches"
                        : "Select all"}
                  </Text>
                )}
              </HStack>

              <Separator my={2} />

              <Box maxH="264px" overflowY="auto">
                <VStack gap={0.5} align="stretch">
                  {filtered.length === 0 ? (
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                      py={5}
                    >
                      No matches
                    </Text>
                  ) : (
                    filtered.map((option) => {
                      const on = selected.includes(option.value);
                      return (
                        <HStack
                          key={option.value}
                          gap={2.5}
                          px={2.5}
                          py={2}
                          borderRadius="md"
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                          onClick={() => toggle(option.value)}
                        >
                          <Checkbox
                            checked={on}
                            onCheckedChange={() => toggle(option.value)}
                            aria-label={option.label}
                            onClick={(event) => event.stopPropagation()}
                          />
                          <Box flex="1" minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight={on ? "600" : "500"}
                              color="gray.800"
                              truncate
                            >
                              {option.label}
                            </Text>
                            {option.description && (
                              <Text fontSize="xs" color="gray.500" truncate>
                                {option.description}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      );
                    })
                  )}
                </VStack>
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
