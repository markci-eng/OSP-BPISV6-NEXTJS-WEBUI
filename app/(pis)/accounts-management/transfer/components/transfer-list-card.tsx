"use client";

// The Transfer rail — the left panel, the same card the ROP screen uses.
//
// A card with a status carousel, a search box, and a run of rows that scroll
// INSIDE it. A row is five facts: planholder name and LPA No lead on the first
// line; requesting branch, date requested and status take the second.

import { useMemo, type ReactNode } from "react";
import { Box, Flex, Input, Menu, Portal, Text } from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Search,
  X,
} from "lucide-react";
import { H3, OSPBadge } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { formatFiledDate } from "@/app/(pis)/data";
import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import { TRANSFER_STATUS_BADGE, TRANSFER_STATUS_OPTIONS } from "../data/data";
import type { TransferRecord, TransferStatus } from "../data/types";

/** One of the header's chevrons. */
function StatusStepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      aria-label={label}
      aria-disabled={disabled || undefined}
      pointerEvents={disabled ? "none" : undefined}
      opacity={disabled ? 0.4 : 1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="28px"
      flexShrink={0}
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="full"
      color="gray.500"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ color: BRAND_COLORS.primaryGreen, borderColor: BRAND_COLORS.primaryGreen }}
    >
      {children}
    </Box>
  );
}

export interface TransferListCardProps {
  /** The records under the status picked in the header — filtered by the page. */
  records: TransferRecord[];
  /** The status view the header is on. */
  status: TransferStatus;
  onStatusChange: (status: TransferStatus) => void;
  /** The row drawn as picked. */
  selectedId?: string;
  onSelect: (record: TransferRecord) => void;
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
}

export function TransferListCard({
  records,
  status,
  onStatusChange,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  loading = false,
}: TransferListCardProps) {
  // Name, LPA number and branch — the three a request is looked up by.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) =>
      [record.planholderName, record.lpaNo, record.requestingBranch]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [records, query]);

  const step = (direction: 1 | -1) => {
    const count = TRANSFER_STATUS_OPTIONS.length;
    const index = TRANSFER_STATUS_OPTIONS.indexOf(status);
    onStatusChange(TRANSFER_STATUS_OPTIONS[(index + direction + count) % count]);
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      display="flex"
      flexDirection="column"
      maxH={{ base: "420px", lg: "calc(100vh - 220px)" }}
      overflow="hidden"
    >
      {/* A carousel, as on the ROP rail: one status shows at a time and the
          chevrons step through them, wrapping at either end. */}
      <Flex align="center" justify="space-between" gap={2} mb={3} flexShrink={0}>
        <StatusStepButton
          label="Previous status"
          onClick={() => step(-1)}
          disabled={loading}
        >
          <ChevronLeft size={16} />
        </StatusStepButton>

        <Flex direction="column" align="center" gap={1} minW={0} aria-live="polite">
          <H3 textAlign="center" fontSize="lg" truncate>
            {status}
          </H3>
          <Flex gap={1} aria-hidden="true">
            {TRANSFER_STATUS_OPTIONS.map((option) => (
              <Box
                as="button"
                key={option}
                onClick={() => onStatusChange(option)}
                tabIndex={-1}
                w={option === status ? "14px" : "5px"}
                h="5px"
                borderRadius="full"
                bg={option === status ? BRAND_COLORS.primaryGreen : "gray.200"}
                transition="all 0.2s ease"
                cursor="pointer"
              />
            ))}
          </Flex>
          <Text fontSize="xs" color="gray.400">
            {loading
              ? "Loading…"
              : `${visible.length} record${visible.length === 1 ? "" : "s"}`}
          </Text>
        </Flex>

        <Flex align="center" gap={1} flexShrink={0}>
          <StatusStepButton
            label="Next status"
            onClick={() => step(1)}
            disabled={loading}
          >
            <ChevronRight size={16} />
          </StatusStepButton>

          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <Box
                as="button"
                aria-label="Choose transfer status"
                aria-disabled={loading || undefined}
                pointerEvents={loading ? "none" : undefined}
                opacity={loading ? 0.4 : 1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxSize="28px"
                flexShrink={0}
                borderWidth="1px"
                borderColor={BRAND_COLORS.primaryGreen}
                borderRadius="full"
                bg="#eaf5ee"
                color={BRAND_COLORS.primaryGreen}
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ bg: BRAND_COLORS.primaryGreen, color: "white" }}
                _expanded={{ bg: BRAND_COLORS.primaryGreen, color: "white" }}
              >
                <EllipsisVertical size={16} strokeWidth={2.5} />
              </Box>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="180px">
                  <Menu.RadioItemGroup
                    value={status}
                    onValueChange={(e) =>
                      onStatusChange(e.value as TransferStatus)
                    }
                  >
                    {TRANSFER_STATUS_OPTIONS.map((option) => (
                      <Menu.RadioItem
                        key={option}
                        value={option}
                        fontWeight={option === status ? "600" : undefined}
                        color={
                          option === status ? BRAND_COLORS.primaryGreen : undefined
                        }
                      >
                        {option}
                        <Menu.ItemIndicator ms="auto" />
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>

      <Flex
        align="center"
        gap={2}
        mb={3}
        px={3}
        h="36px"
        flexShrink={0}
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius="lg"
        _focusWithin={{
          borderColor: "var(--chakra-colors-primary)",
          boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
        }}
      >
        <Box color="gray.400" flexShrink={0} display="flex">
          <Search size={14} />
        </Box>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.currentTarget.value)}
          placeholder="Search name, LPA No, or branch..."
          flex="1"
          h="full"
          px={0}
          border="none"
          bg="transparent"
          borderRadius="0"
          fontSize="sm"
          color="gray.800"
          _placeholder={{ color: "gray.400" }}
          _focusVisible={{ boxShadow: "none", outline: "none" }}
          aria-label="Search transfer records"
        />
        {query && (
          <Box
            as="button"
            onClick={() => onQueryChange("")}
            color="gray.400"
            flexShrink={0}
            display="flex"
            aria-label="Clear transfer search"
            _hover={{ color: "gray.600" }}
          >
            <X size={14} />
          </Box>
        )}
      </Flex>

      <Flex direction="column" gap={1.5} flex="1" minH={0} overflowY="auto">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={i}
              h="62px"
              flexShrink={0}
              borderWidth="1px"
              borderColor="gray.100"
              borderRadius="sm"
              bg="gray.50"
              opacity={1 - i * 0.12}
            />
          ))}

        {!loading && visible.length === 0 && (
          <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
            {query
              ? `No ${status} record matches “${query}”.`
              : `No ${status} records to show.`}
          </Text>
        )}

        {!loading &&
          visible.map((record) => {
            const active = record.id === selectedId;

            return (
              <Flex
                as="button"
                key={record.id}
                onClick={() => onSelect(record)}
                aria-current={active ? "true" : undefined}
                direction="column"
                align="stretch"
                gap={1}
                w="full"
                px={2.5}
                py={2}
                flexShrink={0}
                textAlign="start"
                borderWidth="1px"
                borderRadius="sm"
                borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
                bg={active ? "#f4faf6" : "white"}
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ borderColor: active ? undefined : "gray.300" }}
              >
                {/* Line one: who it is, and the plan it is filed under. */}
                <Flex align="baseline" justify="space-between" gap={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.800"
                    truncate
                    minW={0}
                  >
                    {record.planholderName}
                  </Text>
                  <Text
                    fontSize="10.5px"
                    fontFamily="mono"
                    color="gray.500"
                    flexShrink={0}
                    whiteSpace="nowrap"
                  >
                    {record.lpaNo}
                  </Text>
                </Flex>

                {/* Line two: the requesting branch, the date requested, and
                    where it stands. */}
                <Flex align="center" justify="space-between" gap={2}>
                  <Flex align="center" gap={2} minW={0}>
                    <Text fontSize="10px" color="gray.400" truncate>
                      {record.requestingBranch}
                    </Text>
                    <Text fontSize="10px" color="gray.400" whiteSpace="nowrap">
                      {formatFiledDate(record.dateRequested)}
                    </Text>
                  </Flex>
                  <OSPBadge
                    type={TRANSFER_STATUS_BADGE[record.status]}
                    flexShrink={0}
                    fontSize="9px"
                  >
                    {record.status}
                  </OSPBadge>
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    </Box>
  );
}

export default TransferListCard;
