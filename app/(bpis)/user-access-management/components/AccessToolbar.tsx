"use client";

import { Box, Button, Flex, HStack, Input, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

import type { AccessFilter } from "../types";
import { ACCESS_COLORS } from "../lib/access-theme";

const FILTERS: AccessFilter[] = ["All", "Assigned", "Not assigned"];

type AccessToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filter: AccessFilter;
  onFilterChange: (filter: AccessFilter) => void;
  /** Row count behind each filter, so the chips can carry a badge. */
  counts: Record<AccessFilter, number>;
  allExpanded: boolean;
  onToggleExpandAll: () => void;
};

export function AccessToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
  allExpanded,
  onToggleExpandAll,
}: AccessToolbarProps) {
  return (
    <Flex gap={3} wrap="wrap" align="center">
      <Box position="relative" flex="1" minW={{ base: "100%", md: "260px" }}>
        <Box
          position="absolute"
          left="11px"
          top="50%"
          transform="translateY(-50%)"
          color="gray.400"
          pointerEvents="none"
          zIndex={1}
        >
          <LuSearch size={15} />
        </Box>
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search permissions or modules…"
          pl="33px"
          fontSize="sm"
          bg="white"
          borderColor="gray.300"
          maxW={{ md: "400px" }}
          _focusVisible={{
            borderColor: ACCESS_COLORS.accent,
            boxShadow:
              "0 0 0 3px color-mix(in srgb, var(--chakra-colors-primary) 14%, transparent)",
          }}
        />
      </Box>

      {/* Segmented filter — a scrolling chip row once it stops fitting. */}
      <HStack
        gap={1}
        bg="gray.100"
        borderRadius="lg"
        p="3px"
        flexShrink={0}
        overflowX="auto"
        maxW="100%"
      >
        {FILTERS.map((option) => {
          const active = option === filter;
          return (
            <Button
              key={option}
              onClick={() => onFilterChange(option)}
              size="sm"
              h="30px"
              px={3}
              variant="plain"
              flexShrink={0}
              borderRadius="md"
              fontSize="xs"
              fontWeight="500"
              bg={active ? "white" : "transparent"}
              color={active ? "gray.800" : "gray.500"}
              shadow={active ? "xs" : "none"}
              _hover={{ bg: active ? "white" : "blackAlpha.50" }}
            >
              {option}
              <Text
                as="span"
                fontSize="11px"
                fontWeight="500"
                color={active ? ACCESS_COLORS.accent : "gray.400"}
              >
                {counts[option]}
              </Text>
            </Button>
          );
        })}
      </HStack>

      <Button
        onClick={onToggleExpandAll}
        size="sm"
        variant="outline"
        borderColor="gray.300"
        color="gray.700"
        fontSize="xs"
        fontWeight="500"
        flexShrink={0}
        ml={{ md: "auto" }}
        display={{ base: "none", md: "inline-flex" }}
      >
        {allExpanded ? "Collapse all" : "Expand all"}
      </Button>
    </Flex>
  );
}
