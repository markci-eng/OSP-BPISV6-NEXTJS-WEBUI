"use client";

// The ROP rail — the left panel, and what picks the profile shown beside it.
//
// A card with a search box and a run of rows that scroll INSIDE it. The capped
// height is the whole point: the right panel is the long one, and a branch with
// two hundred requests must not push it off the screen to reach it.
//
// A ROW IS FOUR FACTS — ROP No, LPA No, planholder name and ROP date — laid out
// so the two a list is scanned by lead: the name, and the ROP number it is
// filed under. The LPA number and the date are confirmation, so they take the
// second line and the right edge.

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
import {
  ROP_SCHEDULE_STATUS_BADGE,
  ROP_SCHEDULE_STATUS_OPTIONS,
} from "../data/data";
import type { RopRecord, RopScheduleStatus } from "../data/types";

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

export interface RopListCardProps {
  /** The records under the status picked in the header — filtered by the page. */
  records: RopRecord[];
  /** The status view the header is on. */
  status: RopScheduleStatus;
  onStatusChange: (status: RopScheduleStatus) => void;
  /** The row drawn as picked. */
  selectedId?: string;
  onSelect: (record: RopRecord) => void;
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
}

export function RopListCard({
  records,
  status,
  onStatusChange,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  loading = false,
}: RopListCardProps) {
  // ROP number, LPA number and name — the three a request is looked up by.
  // Matched on the raw string so a partial number finds its row.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) =>
      [record.ropNo, record.lpaNo, record.planholderName]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [records, query]);

  const step = (direction: 1 | -1) => {
    const count = ROP_SCHEDULE_STATUS_OPTIONS.length;
    const index = ROP_SCHEDULE_STATUS_OPTIONS.indexOf(status);
    onStatusChange(ROP_SCHEDULE_STATUS_OPTIONS[(index + direction + count) % count]);
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
      // Tall enough to be worth scrolling, short enough that the profile
      // beside it stays the thing on screen. On a phone the panels stack, so
      // the rail gives up most of its height to the profile under it.
      maxH={{ base: "420px", lg: "calc(100vh - 220px)" }}
      overflow="hidden"
    >
      {/* A CAROUSEL, not a tab strip (user, 2026-09-24): four tabs do not fit
          a rail a quarter of the page wide, so one status shows at a time and
          the chevrons step through them, wrapping at either end. */}
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
            {ROP_SCHEDULE_STATUS_OPTIONS.map((option) => (
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

        {/* The next chevron and the list's menu share the right edge, so the
            status title stays centred between the two sides. */}
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
                aria-label="Choose ROP status"
                aria-disabled={loading || undefined}
                pointerEvents={loading ? "none" : undefined}
                opacity={loading ? 0.4 : 1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                // Brand-tinted and bordered so it reads as a control on its own,
                // not as a faint glyph beside the chevrons.
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
                {/* THE SAME STATUSES THE CAROUSEL STEPS THROUGH, as a list to
                    jump straight to one — picking an item puts it in the
                    header, the same as the chevrons do. */}
                <Menu.Content minW="180px">
                  <Menu.RadioItemGroup
                    value={status}
                    onValueChange={(e) =>
                      onStatusChange(e.value as RopScheduleStatus)
                    }
                  >
                    {ROP_SCHEDULE_STATUS_OPTIONS.map((option) => (
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

      {/* The same search field the module's other rails use — icon, bare
          input, clear. */}
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
          placeholder="Search ROP No, LPA No, or name..."
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
          aria-label="Search ROP records"
        />
        {query && (
          <Box
            as="button"
            onClick={() => onQueryChange("")}
            color="gray.400"
            flexShrink={0}
            display="flex"
            aria-label="Clear ROP search"
            _hover={{ color: "gray.600" }}
          >
            <X size={14} />
          </Box>
        )}
      </Flex>

      <Flex direction="column" gap={1.5} flex="1" minH={0} overflowY="auto">
        {/* SKELETON ROWS, not a spinner: the rail's shape is known before its
            contents are, so the panel holds still when the records land. */}
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
                // One even 1px edge whether or not the row is picked, and the
                // brand green rather than a ring around it — the same row the
                // module's other rails draw.
                borderWidth="1px"
                borderRadius="sm"
                borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
                bg={active ? "#f4faf6" : "white"}
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ borderColor: active ? undefined : "gray.300" }}
              >
                {/* Line one: who it is, and what it is filed under. */}
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
                    {record.ropNo}
                  </Text>
                </Flex>

                {/* Line two: the plan, the date it was raised, and where it
                    stands. */}
                <Flex align="center" justify="space-between" gap={2}>
                  <Flex align="center" gap={2} minW={0}>
                    <Text
                      fontSize="10px"
                      fontFamily="mono"
                      color="gray.400"
                      truncate
                    >
                      {record.lpaNo}
                    </Text>
                    <Text fontSize="10px" color="gray.400" whiteSpace="nowrap">
                      {formatFiledDate(record.ropDate)}
                    </Text>
                  </Flex>
                  <OSPBadge
                    type={ROP_SCHEDULE_STATUS_BADGE[record.schedule.status]}
                    flexShrink={0}
                    fontSize="9px"
                  >
                    {record.schedule.status}
                  </OSPBadge>
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    </Box>
  );
}

export default RopListCard;
