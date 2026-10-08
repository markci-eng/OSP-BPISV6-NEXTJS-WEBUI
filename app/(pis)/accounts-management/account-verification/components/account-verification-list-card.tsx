"use client";

// The Account Verification card: a header that steps between the two queues,
// and under it either a searchable list (For Verification) or the For Process
// / Pending buttons whose pick brings up its list (Chapel Correction).
//
// A ROW IS FOUR FACTS — planholder name, LPA No, chapel and status.

import { useMemo, type ReactNode } from "react";
import { Badge, Box, Flex, Input, Menu, Portal, Text } from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Search,
  X,
} from "lucide-react";
import { H3 } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import {
  ACCOUNT_VERIFICATION_VIEWS,
  CHAPEL_CORRECTION_STATUSES,
} from "../data/data";
import type {
  AccountVerificationRecord,
  AccountVerificationStatus,
  AccountVerificationView,
  ChapelCorrectionStatus,
} from "../data/types";

const STATUS_PALETTE: Record<AccountVerificationStatus, string> = {
  "For Verification": "blue",
  "For Process": "green",
  Pending: "orange",
};

/** One of the header's chevrons. */
function ViewStepButton({
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

function RecordList({
  records,
  loading,
  emptyText,
  selectedId,
  onSelect,
}: {
  records: AccountVerificationRecord[];
  loading: boolean;
  emptyText: string;
  selectedId?: string;
  onSelect: (record: AccountVerificationRecord) => void;
}) {
  return (
    <Flex direction="column" gap={1.5} flex="1" minH={0} overflowY="auto">
      {loading &&
        Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            h="52px"
            flexShrink={0}
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="sm"
            bg="gray.50"
            opacity={1 - i * 0.12}
          />
        ))}

      {!loading && records.length === 0 && (
        <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
          {emptyText}
        </Text>
      )}

      {!loading &&
        records.map((record) => {
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
              {/* Line one: who it is, and where it stands. */}
              <Flex align="center" justify="space-between" gap={2}>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="gray.800"
                  truncate
                  minW={0}
                >
                  {record.planholderName}
                </Text>
                <Badge
                  colorPalette={STATUS_PALETTE[record.status]}
                  variant="subtle"
                  size="xs"
                  flexShrink={0}
                >
                  {record.status}
                </Badge>
              </Flex>

              {/* Line two: the plan, and the chapel it is tied to. */}
              <Flex align="center" justify="space-between" gap={2}>
                <Text
                  fontSize="10px"
                  fontFamily="mono"
                  color="gray.400"
                  flexShrink={0}
                  whiteSpace="nowrap"
                >
                  {record.lpaNo}
                </Text>
                <Text fontSize="10px" color="gray.500" truncate minW={0}>
                  {record.chapel}
                </Text>
              </Flex>
            </Flex>
          );
        })}
    </Flex>
  );
}

export interface AccountVerificationListCardProps {
  /** The records under the view picked in the header — filtered by the page. */
  records: AccountVerificationRecord[];
  view: AccountVerificationView;
  onViewChange: (view: AccountVerificationView) => void;
  /** The Chapel Correction pile picked; the page starts it on For Process. */
  chapelStatus?: ChapelCorrectionStatus;
  onChapelStatusChange: (status: ChapelCorrectionStatus) => void;
  /** The row drawn as picked. */
  selectedId?: string;
  onSelect: (record: AccountVerificationRecord) => void;
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
}

export function AccountVerificationListCard({
  records,
  view,
  onViewChange,
  chapelStatus,
  onChapelStatusChange,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  loading = false,
}: AccountVerificationListCardProps) {
  const isChapelCorrection = view === "Chapel Correction";

  // For Verification is searched by name, LPA number or chapel; Chapel
  // Correction is narrowed by the pile picked instead.
  const visible = useMemo(() => {
    if (isChapelCorrection) {
      return chapelStatus
        ? records.filter((record) => record.status === chapelStatus)
        : [];
    }
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) =>
      [record.planholderName, record.lpaNo, record.chapel]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [records, query, isChapelCorrection, chapelStatus]);

  const step = (direction: 1 | -1) => {
    const count = ACCOUNT_VERIFICATION_VIEWS.length;
    const index = ACCOUNT_VERIFICATION_VIEWS.indexOf(view);
    onViewChange(ACCOUNT_VERIFICATION_VIEWS[(index + direction + count) % count]);
  };

  const showList = !isChapelCorrection || chapelStatus !== undefined;

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
      {/* A carousel, as on the CSV list: one view shows at a time and the
          chevrons step between them. */}
      <Flex align="center" justify="space-between" gap={2} mb={3} flexShrink={0}>
        <ViewStepButton
          label="Previous view"
          onClick={() => step(-1)}
          disabled={loading}
        >
          <ChevronLeft size={16} />
        </ViewStepButton>

        <Flex direction="column" align="center" gap={1} minW={0} aria-live="polite">
          <H3 textAlign="center" fontSize="lg" truncate>
            {view}
          </H3>
          <Flex gap={1} aria-hidden="true">
            {ACCOUNT_VERIFICATION_VIEWS.map((option) => (
              <Box
                as="button"
                key={option}
                onClick={() => onViewChange(option)}
                tabIndex={-1}
                w={option === view ? "14px" : "5px"}
                h="5px"
                borderRadius="full"
                bg={option === view ? BRAND_COLORS.primaryGreen : "gray.200"}
                transition="all 0.2s ease"
                cursor="pointer"
              />
            ))}
          </Flex>
          {showList && (
            <Text fontSize="xs" color="gray.400">
              {loading
                ? "Loading…"
                : `${visible.length} record${visible.length === 1 ? "" : "s"}`}
            </Text>
          )}
        </Flex>

        <Flex align="center" gap={1} flexShrink={0}>
          <ViewStepButton
            label="Next view"
            onClick={() => step(1)}
            disabled={loading}
          >
            <ChevronRight size={16} />
          </ViewStepButton>

          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <Box
                as="button"
                aria-label="Choose view"
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
                    value={view}
                    onValueChange={(e) =>
                      onViewChange(e.value as AccountVerificationView)
                    }
                  >
                    {ACCOUNT_VERIFICATION_VIEWS.map((option) => (
                      <Menu.RadioItem
                        key={option}
                        value={option}
                        fontWeight={option === view ? "600" : undefined}
                        color={
                          option === view ? BRAND_COLORS.primaryGreen : undefined
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

      {isChapelCorrection ? (
        <Flex gap={2} mb={3} flexShrink={0} role="group" aria-label="Chapel correction status">
          {CHAPEL_CORRECTION_STATUSES.map((option) => {
            const active = option === chapelStatus;
            const count = records.filter((r) => r.status === option).length;
            return (
              <Box
                as="button"
                key={option}
                onClick={() => onChapelStatusChange(option)}
                aria-pressed={active}
                flex="1"
                h="36px"
                borderWidth="1px"
                borderRadius="lg"
                borderColor={active ? BRAND_COLORS.primaryGreen : "border.muted"}
                bg={active ? BRAND_COLORS.primaryGreen : "white"}
                color={active ? "white" : "gray.700"}
                fontSize="sm"
                fontWeight="600"
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ borderColor: BRAND_COLORS.primaryGreen }}
              >
                {option}
                {!loading && ` (${count})`}
              </Box>
            );
          })}
        </Flex>
      ) : (
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
            placeholder="Search name, LPA No, or chapel..."
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
            aria-label="Search accounts for verification"
          />
          {query && (
            <Box
              as="button"
              onClick={() => onQueryChange("")}
              color="gray.400"
              flexShrink={0}
              display="flex"
              aria-label="Clear search"
              _hover={{ color: "gray.600" }}
            >
              <X size={14} />
            </Box>
          )}
        </Flex>
      )}

      {showList ? (
        <RecordList
          records={visible}
          loading={loading}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyText={
            isChapelCorrection
              ? `No ${chapelStatus} records to show.`
              : query
                ? `No record matches “${query}”.`
                : "No records for verification."
          }
        />
      ) : (
        <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
          Pick For Process or Pending to see its records.
        </Text>
      )}
    </Box>
  );
}

export default AccountVerificationListCard;
