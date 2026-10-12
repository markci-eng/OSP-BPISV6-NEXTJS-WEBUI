"use client";

import {
  Box,
  Flex,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { LuSearch, LuX } from "react-icons/lu";
import React from "react";
import { OSPBadge } from "osp-ui-kit";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { PlanholderAvatar } from "./PlanholderAvatar";
import {
  formatDate,
  installmentProgress,
  statusBadgeType,
  toTitleCase,
} from "./planholder-list-utils";

function PlanholderCard({
  ph,
  onOpen,
}: {
  ph: PlanholderLookup;
  onOpen: (row: PlanholderLookup) => void;
}) {
  const { total, progress } = installmentProgress(ph);

  return (
    <Box
      as="button"
      w="100%"
      textAlign="left"
      p={4}
      borderRadius="2xl"
      bg="surface"
      shadow="sm"
      overflow="hidden"
      onClick={() => onOpen(ph)}
      _active={{ bg: "rowHover" }}
    >
      {/* HEADER */}
      <Flex justify="space-between" align="start" mb={3} gap={2}>
        <Flex align="center" gap={2} flex={1} minW={0}>
          <PlanholderAvatar
            name={`${ph.firstName} ${ph.lastName}`}
            src={mockAvatarUrl(ph.personId)}
            size="sm"
          />
          <Box flex={1} minW={0}>
            <Text
              fontWeight="semibold"
              fontSize="sm"
              lineHeight="1.3"
              color="heading"
              truncate
            >
              {toTitleCase(ph.firstName)} {toTitleCase(ph.lastName)}
            </Text>
            <Text fontSize="xs" color="mutedStrong">
              {ph.personId || "—"}
            </Text>
          </Box>
        </Flex>
        <Box flexShrink={0}>
          <OSPBadge type={statusBadgeType(ph.accountStatus)}>
            {toTitleCase(ph.accountStatus)}
          </OSPBadge>
        </Box>
      </Flex>

      {/* QUICK INFO CHIPS */}
      <Flex gap={2} mb={3} wrap="wrap">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="heading"
          bg="canvas"
          px={2.5}
          py={0.5}
          borderRadius="full"
        >
          {ph.lpaNumber}
        </Text>
        <Text
          fontSize="xs"
          color="heading"
          bg="canvas"
          px={2.5}
          py={0.5}
          borderRadius="full"
        >
          {ph.planDescription}
        </Text>
      </Flex>

      {/* PLAN DETAIL */}
      <VStack align="start" gap={1} px={2} mb={3}>
        <Text fontSize="xs" color="mutedStrong">
          Branch: {ph.branch || "—"}
        </Text>
        <Text fontSize="xs" color="mutedStrong">
          Effectivity: {formatDate(ph.effectivityDate)} · Due:{" "}
          {formatDate(ph.dueDate)}
        </Text>
      </VStack>

      {/* FOOTER: installment progress */}
      <Flex align="center" gap={3}>
        <Box flex={1}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="xs" color="mutedStrong">
              Installment {ph.installmentNo} / {total}
            </Text>
            <Text fontSize="xs" color="mutedStrong" fontWeight="semibold">
              {progress}%
            </Text>
          </Flex>
          <Box h="5px" borderRadius="full" bg="hairline">
            <Box
              h="full"
              borderRadius="full"
              bg="var(--chakra-colors-primary)"
              w={`${progress}%`}
            />
          </Box>
        </Box>
        <Box color="muted" flexShrink={0}>
          <ChevronRight size={16} />
        </Box>
      </Flex>
    </Box>
  );
}

/**
 * The mobile rendering of the planholder list: a search box over a column of
 * cards, revealing the next batch when the bottom comes into view.
 */
export function PlanholderCardList({
  rows,
  totalCount,
  search,
  onSearchChange,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onOpen,
  header,
}: {
  rows: PlanholderLookup[];
  totalCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onOpen: (row: PlanholderLookup) => void;
  header?: React.ReactNode;
}) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [draft, setDraft] = React.useState(search);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onLoadMore();
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
    // rows.length: an observer only reports changes, so when a new batch is
    // too short to push the sentinel out of view it would never fire again.
  }, [hasMore, isLoadingMore, onLoadMore, rows.length]);

  const submit = (value: string) => {
    const term = value.trim();
    if (term !== search) onSearchChange(term);
  };

  return (
    <Box w="full">
      {header && <Box mb={3}>{header}</Box>}

      <Flex
        align="center"
        h="40px"
        mb={2}
        pl={3}
        pr={1}
        gap={2}
        borderWidth="1.5px"
        borderColor="inputBorder"
        borderRadius="lg"
        bg="surfaceRaised"
        boxShadow="xs"
        overflow="hidden"
      >
        <Box as={LuSearch} color="mutedStrong" flexShrink={0} boxSize={4} />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(draft);
          }}
          onBlur={() => submit(draft)}
          placeholder="Search planholders..."
          flex={1}
          border="none"
          bg="transparent"
          boxShadow="none"
          px={0}
          h="full"
          fontSize="sm"
          _focus={{ boxShadow: "none", outline: "none" }}
        />
        {draft && (
          <IconButton
            aria-label="Clear search"
            variant="ghost"
            size="xs"
            borderRadius="full"
            color="mutedStrong"
            onClick={() => {
              setDraft("");
              submit("");
            }}
          >
            <LuX size={14} />
          </IconButton>
        )}
      </Flex>

      <Text fontSize="xs" color="mutedStrong" mb={3}>
        {totalCount.toLocaleString("en-US")} results
      </Text>

      {rows.length === 0 ? (
        <Text fontSize="sm" color="mutedStrong" textAlign="center" py={10}>
          No planholders found.
        </Text>
      ) : (
        <VStack gap={3}>
          {rows.map((ph) => (
            <PlanholderCard key={ph.lpaNumber} ph={ph} onOpen={onOpen} />
          ))}
        </VStack>
      )}

      <Box ref={sentinelRef} h="1px" />

      {isLoadingMore && (
        <Flex justify="center" py={4}>
          <Spinner size="sm" color="primary" />
        </Flex>
      )}
    </Box>
  );
}
