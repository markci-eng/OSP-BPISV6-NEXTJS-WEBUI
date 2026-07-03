"use client";

import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Card } from "@/claude components/card-accordion/card";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import {
  LuCheck,
  LuSearch,
  LuUserRound,
  LuUserRoundCheck,
  LuX,
} from "react-icons/lu";
import { SCOPES } from "../constants";
import type { SearchScope } from "../types";
import { matchesSuperior } from "../utils";
import { EmptyState } from "./shared";
import { SelectedSuperiorSummary } from "./SelectedSuperiorSummary";
import { SuperiorResultCard } from "./SuperiorResultCard";

/* ─── Superior selection panel ───────────────────────────────────────────── */

export const SuperiorPanel = ({
  pool,
  superior,
  onSelect,
  onChange,
}: {
  pool: SalesAgent[];
  superior: SalesAgent | null;
  onSelect: (a: SalesAgent) => void;
  onChange: () => void;
}) => {
  const [query, setQuery] = React.useState("");
  const [scope, setScope] = React.useState<SearchScope>("all");

  const results = React.useMemo(
    () => pool.filter((a) => matchesSuperior(a, query, scope)),
    [pool, query, scope],
  );

  return (
    <Card
      activeIcon={<LuUserRoundCheck size={16} />}
      title="Select Receiving Superior"
      subtitle="The person who will receive the transferred agents"
      headerAction={
        superior ? (
          <Badge
            colorPalette="gray"
            variant="subtle"
            borderRadius="full"
            px={2}
          >
            <LuCheck size={12} />
            <Text ml={1} fontSize="11px" fontWeight="700">
              Done
            </Text>
          </Badge>
        ) : undefined
      }
    >
      {superior ? (
        <SelectedSuperiorSummary superior={superior} onChange={onChange} />
      ) : (
        <Flex direction="column" gap={3}>
          {/* Search input */}
          <Flex
            align="center"
            borderWidth="1.5px"
            borderColor="gray.200"
            borderRadius="10px"
            bg="white"
            overflow="hidden"
            transition="all 0.15s ease"
            _focusWithin={{
              borderColor: "gray.400",
              boxShadow: "0 0 0 3px var(--chakra-colors-gray-100)",
            }}
          >
            <Box pl={3} color="gray.400" display="flex">
              <LuSearch size={16} />
            </Box>
            <Input
              border="none"
              boxShadow="none"
              px={2}
              fontSize="sm"
              placeholder="Search superior…"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              _focus={{ boxShadow: "none", outline: "none" }}
            />
            {query && (
              <IconButton
                aria-label="Clear search"
                variant="ghost"
                size="xs"
                mr={1}
                borderRadius="full"
                color="gray.400"
                _hover={{ bg: "gray.100", color: "gray.600" }}
                onClick={() => setQuery("")}
              >
                <LuX size={13} />
              </IconButton>
            )}
          </Flex>

          {/* Search-by scope chips */}
          <HStack gap={1.5} wrap="wrap">
            <Text fontSize="11px" color="gray.400" fontWeight="600" mr={0.5}>
              Search by:
            </Text>
            {SCOPES.map((s) => {
              const active = scope === s.id;
              return (
                <Box
                  as="button"
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  fontSize="12px"
                  fontWeight="600"
                  cursor="pointer"
                  transition="all 0.15s ease"
                  bg={active ? "primary" : "gray.100"}
                  color={active ? "white" : "gray.600"}
                  _hover={{ bg: active ? "gray.800" : "gray.200" }}
                >
                  {s.label}
                </Box>
              );
            })}
          </HStack>

          {/* Results */}
          <Flex justify="space-between" align="center" pt={1}>
            <Text fontSize="12px" color="gray.500" fontWeight="600">
              {results.length} superior{results.length === 1 ? "" : "s"} found
            </Text>
          </Flex>

          <VStack
            align="stretch"
            gap={2}
            maxH={{ base: "none", lg: "460px" }}
            overflowY={{ base: "visible", lg: "auto" }}
            pr={{ lg: 1 }}
          >
            {results.length > 0 ? (
              results.map((a) => (
                <SuperiorResultCard
                  key={a.id}
                  agent={a}
                  selected={false}
                  onSelect={() => onSelect(a)}
                />
              ))
            ) : (
              <EmptyState icon={<LuUserRound size={30} />}>
                No superiors match your search. Try a different name, code,
                branch, or area.
              </EmptyState>
            )}
          </VStack>
        </Flex>
      )}
    </Card>
  );
};
