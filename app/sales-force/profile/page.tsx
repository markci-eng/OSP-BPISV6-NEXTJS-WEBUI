"use client";

import Page from "@/claude components/layout/page/Page";
import { salesAgents } from "@/data/saleforce/sales-agent-data";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import type { OSPBadgeProps } from "@/components/common/badge/badge.types";
import {
  LuSearch,
  LuUser,
  LuMapPin,
  LuHash,
  LuX,
  LuBriefcase,
  LuChevronRight,
} from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

async function fetchAgentPage({
  pageParam,
  query,
}: {
  pageParam: number;
  query: string;
}) {
  await new Promise((r) => setTimeout(r, 300));
  const q = query.trim().toLowerCase();
  const all = q
    ? salesAgents.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q) ||
          a.branch.toLowerCase().includes(q),
      )
    : salesAgents;
  const start = (pageParam - 1) * PAGE_SIZE;
  return {
    items: all.slice(start, start + PAGE_SIZE),
    nextPage: start + PAGE_SIZE < all.length ? pageParam + 1 : undefined,
  };
}

function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "resigned":
      return "danger";
    default:
      return undefined;
  }
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SalesAgentListPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["sales-agents", debouncedQuery],
      queryFn: ({ pageParam }) =>
        fetchAgentPage({
          pageParam: pageParam as number,
          query: debouncedQuery,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const agents = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Page.Root
      headerButton="menu"
      title="Sales Agent Profile"
      description="Find an agent to view their profile."
    >
      <Page.MainContent>
        <Page.Row>
          <HStack gap={0} maxW="460px" w="full">
            <Box
              flex={1}
              border="1.5px solid"
              borderColor={
                query ? "var(--chakra-colors-primary-disabled)" : "gray.200"
              }
              borderRightWidth="0"
              borderLeftRadius="lg"
              bg="white"
              boxShadow="xs"
              overflow="hidden"
              transition="border-color 0.15s, box-shadow 0.15s"
              _hover={{
                borderColor: query
                  ? "var(--chakra-colors-primary)"
                  : "gray.300",
              }}
              _focusWithin={{
                borderColor: "var(--chakra-colors-primary)",
                boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
              }}
              minH="10"
              display="flex"
              alignItems="center"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder="Search by Agent ID, Name, Position, or Branch..."
                border="none"
                bg="transparent"
                boxShadow="none"
                borderRadius="0"
                px={3}
                fontSize="sm"
                color={query ? "gray.800" : "gray.700"}
                fontWeight={query ? "medium" : "normal"}
                _placeholder={{ color: "gray.400" }}
                _focus={{ boxShadow: "none", outline: "none" }}
              />

              {query && (
                <Flex align="center" pr={2} flexShrink={0}>
                  <IconButton
                    aria-label="Clear search"
                    variant="ghost"
                    size="xs"
                    borderRadius="full"
                    color="gray.400"
                    _hover={{ bg: "gray.100", color: "gray.600" }}
                    onClick={() => setQuery("")}
                  >
                    <LuX size={12} />
                  </IconButton>
                </Flex>
              )}
            </Box>

            <IconButton
              aria-label="Search"
              bg="var(--chakra-colors-primary)"
              color="white"
              borderLeftRadius="0"
              borderRightRadius="lg"
              h="10"
              minW="10"
              flexShrink={0}
              _hover={{ opacity: 0.88 }}
              _active={{ opacity: 0.75 }}
            >
              <LuSearch size={15} />
            </IconButton>
          </HStack>
        </Page.Row>

        <Page.Row>
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <VStack gap={3}>
              {agents.map((agent) => (
                <Box
                  key={agent.id}
                  w="100%"
                  position="relative"
                  p={4}
                  borderRadius="2xl"
                  bg="white"
                  shadow="sm"
                  transition="all 0.25s ease"
                  _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() =>
                    router.push(`/sales-force/profile/${agent.id}`)
                  }
                >
                  {/* HEADER */}
                  <Flex justify="space-between" align="start" mb={3}>
                    <Flex align="center" gap={2}>
                      <Box p={2} borderRadius="full" bg="gray.100">
                        <LuUser size={18} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                          {toTitleCase(agent.firstName)}{" "}
                          {toTitleCase(agent.lastName)}
                        </Text>
                        <Flex
                          align="center"
                          gap={1}
                          fontSize="xs"
                          color="gray.500"
                        >
                          <LuHash size={12} />
                          <Text>{agent.id}</Text>
                        </Flex>
                      </Box>
                    </Flex>

                    <OSPBadge type={statusBadgeType(agent.employeeStatus)}>
                      {toTitleCase(agent.employeeStatus)}
                    </OSPBadge>
                  </Flex>

                  {/* QUICK INFO CHIPS */}
                  <Flex gap={2} wrap="wrap" mb={3}>
                    <Box
                      px={2}
                      py={1}
                      fontSize="xs"
                      borderRadius="full"
                      bg="gray.50"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <LuBriefcase size={12} />
                      {agent.position}
                    </Box>
                    <Box
                      px={2}
                      py={1}
                      fontSize="xs"
                      borderRadius="full"
                      bg="gray.50"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <LuMapPin size={12} />
                      {agent.branch}
                    </Box>
                  </Flex>

                  {/* FOOTER */}
                  <Flex justify="space-between" align="center" mt={2}>
                    <Text fontSize="xs" color="gray.400">
                      Tap to view profile
                    </Text>
                    <LuChevronRight color="#a1a1aa" />
                  </Flex>
                </Box>
              ))}

              {agents.length === 0 && (
                <Text color="gray.500" fontSize="sm" textAlign="center" py={6}>
                  No agents found.
                </Text>
              )}

              <div ref={sentinelRef} />

              {isFetchingNextPage && (
                <Flex justify="center" py={4}>
                  <Spinner size="sm" />
                </Flex>
              )}
            </VStack>
          )}
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
