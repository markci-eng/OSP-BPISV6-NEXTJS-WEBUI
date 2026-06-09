"use client";

import Page from "@/components/layout/page/Page";
import { planholderLookup } from "@/app/plan-management/data/planholder-lookup";
import {
  Badge,
  Box,
  Flex,
  Input,
  InputGroup,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import type { OSPBadgeProps } from "@/components/common/badge/badge.types";
import {
  LuSearch,
  LuUser,
  LuCalendar,
  LuMapPin,
  LuHash,
  LuPhone,
  LuX,
} from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PlanholderContactData } from "@/app/plan-management/data/planholder-contact.data";
import { ContactNumber } from "@/claude components/contact-number/contact-number";

const PAGE_SIZE = 20;

async function fetchPlanholderPage({
  pageParam,
  query,
}: {
  pageParam: number;
  query: string;
}) {
  await new Promise((r) => setTimeout(r, 300));
  const q = query.trim().toUpperCase();
  const all = q
    ? planholderLookup.filter(
        (ph) =>
          ph.lpaNumber.includes(q) ||
          ph.firstName.includes(q) ||
          ph.lastName.includes(q) ||
          ph.middleName.includes(q) ||
          ph.personId.includes(q),
      )
    : planholderLookup;
  const start = (pageParam - 1) * PAGE_SIZE;
  return {
    items: all.slice(start, start + PAGE_SIZE),
    nextPage: start + PAGE_SIZE < all.length ? pageParam + 1 : undefined,
  };
}

function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "LAPSED":
      return "warning";
    case "TERMINATED":
      return "danger";
    case "FULLY PAID":
      return "info";
    default:
      return undefined;
  }
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PlanholderSearchPage() {
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
      queryKey: ["planholders", debouncedQuery],
      queryFn: ({ pageParam }) =>
        fetchPlanholderPage({
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

  const planholders = data?.pages.flatMap((p) => p.items) ?? [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "lapsed":
        return "orange";
      case "active":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <Page.Root
      title="Account Summary"
      description="Search and select a planholder to view their profile."
    >
      <Page.MainContent>
        <Page.Row>
          <InputGroup
            maxW="460px"
            startElement={<LuSearch />}
            endElement={
              query ? (
                <Box
                  as="button"
                  onClick={() => setQuery("")}
                  cursor="pointer"
                  color="gray.400"
                  _hover={{ color: "gray.600" }}
                  display="flex"
                  alignItems="center"
                >
                  <LuX size={14} />
                </Box>
              ) : undefined
            }
          >
            <Input
              placeholder="Search by LPA Number, Name, or Person ID..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              size="sm"
            />
          </InputGroup>
        </Page.Row>

        <Page.Row>
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <VStack gap={3}>
              {planholders.map((ph) => {
                const badgeType = statusBadgeType(ph.accountStatus);
                const mobile = PlanholderContactData.find(
                  (c) => c.lpaNumber === ph.lpaNumber && c.type === "MobileNo",
                );

                return (
                  <Box
                    key={ph.lpaNumber}
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
                      router.push(`/plan-management/planholder/${ph.personId}`)
                    }
                  >
                    {/* HEADER */}
                    <Flex justify="space-between" align="start" mb={3}>
                      <Flex align="center" gap={2}>
                        <Box p={2} borderRadius="full" bg="gray.100">
                          <LuUser size={18} />
                        </Box>
                        <Box>
                          <Text
                            fontWeight="bold"
                            fontSize="md"
                            lineHeight="1.2"
                          >
                            {toTitleCase(ph.firstName)}{" "}
                            {toTitleCase(ph.lastName)}
                          </Text>
                          <Flex
                            align="center"
                            gap={1}
                            fontSize="xs"
                            color="gray.500"
                          >
                            <LuHash size={12} />
                            <Text>{ph.personId}</Text>
                          </Flex>
                        </Box>
                      </Flex>

                      <Flex align="center" gap={2}>
                        <Box
                          w="2"
                          h="2"
                          borderRadius="full"
                          bg={getStatusColor(ph.accountStatus) + ".400"}
                          shadow="sm"
                        />
                        <Badge
                          colorPalette={getStatusColor(ph.accountStatus)}
                          variant="subtle"
                          px={2}
                          py={1}
                          fontSize="0.75rem"
                        >
                          {toTitleCase(ph.accountStatus)}
                        </Badge>
                      </Flex>
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
                        <LuCalendar size={12} />
                        {ph.effectivityDate.toISOString().slice(0, 10)}
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
                        {ph.branch}
                      </Box>
                    </Flex>

                    {/* PLAN DETAIL */}
                    <VStack
                      align="start"
                      gap={2}
                      fontSize="sm"
                      color="gray.600"
                      px={2}
                    >
                      <Flex align="center" gap={2}>
                        <LuHash size={14} />
                        <Text>
                          <Text as="span" fontWeight="semibold">
                            LPA:
                          </Text>{" "}
                          {ph.lpaNumber}
                        </Text>
                      </Flex>
                      <Flex align="center" gap={2}>
                        <LuUser size={14} />
                        <Text>
                          <Text as="span" fontWeight="semibold">
                            Plan:
                          </Text>{" "}
                          {ph.planDescription}
                        </Text>
                      </Flex>
                    </VStack>

                    {/* CONTACT NUMBER */}
                    <ContactNumber contactNo={mobile?.value ?? ""} />

                    {/* FOOTER */}
                    <Flex justify="flex-end" align="center" mt={4}>
                      <Text fontSize="xs" color="gray.400">
                        Tap to view profile
                      </Text>
                    </Flex>
                  </Box>
                );
              })}

              {planholders.length === 0 && (
                <Text color="gray.500" fontSize="sm" textAlign="center" py={6}>
                  No planholders found.
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
