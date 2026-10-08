"use client";

// The COIC rail — the left column's card. Cloned from COFP's rail with only
// its For Printing and Printed views (user, 2026-10-06): the same view
// carousel, regions under For Printing, and under Printed a branch combo box
// with the branch's memos below it. The rows are COFP's own.

import { useMemo, useState } from "react";
import { Box, Flex, Input, Menu, Portal, Text } from "@chakra-ui/react";
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
  BranchCombobox,
  MemoRow,
  RegionRow,
  StatusStepButton,
} from "../../certificateoffullpayment/components/request-list-card";
import {
  LIST_HEIGHT,
  ROW_GAP,
} from "../../certificateoffullpayment/components/request-row";
import type {
  CofpBranch,
  CofpRegion,
} from "../../certificateoffullpayment/data/types";
import { coicBranchesPendingTransmit } from "../data/data";
import type { CoicMemo, CoicView } from "../data/types";

const COIC_VIEWS: { view: CoicView; label: string }[] = [
  { view: "FOR_PRINTING", label: "For Printing" },
  { view: "PRINTED", label: "Printed" },
];

const labelOf = (view: CoicView) =>
  COIC_VIEWS.find((entry) => entry.view === view)?.label ?? COIC_VIEWS[0].label;

export interface CoicRailCardProps {
  view: CoicView;
  onViewChange: (view: CoicView) => void;
  /** What For Printing lists. */
  regions: CofpRegion[];
  selectedRegionCode?: string;
  onSelectRegion: (region: CofpRegion) => void;
  /** What Printed's combo box offers. */
  branches: CofpBranch[];
  selectedBranchCode?: string;
  onSelectBranch: (branch: CofpBranch) => void;
  /** What Printed lists under the picked branch. */
  memos: CoicMemo[];
  selectedMemoId?: string;
  onSelectMemo: (memo: CoicMemo) => void;
}

export function CoicRailCard({
  view,
  onViewChange,
  regions,
  selectedRegionCode,
  onSelectRegion,
  branches,
  selectedBranchCode,
  onSelectBranch,
  memos,
  selectedMemoId,
  onSelectMemo,
}: CoicRailCardProps) {
  const [query, setQuery] = useState("");
  const showsRegions = view === "FOR_PRINTING";

  // Two views, so either chevron lands on the other one.
  const step = () => onViewChange(showsRegions ? "PRINTED" : "FOR_PRINTING");

  // A region is looked up by its code or any branch under it.
  const visibleRegions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return regions;
    return regions.filter((region) =>
      `${region.code} ${region.description}`.toLowerCase().includes(needle),
    );
  }, [regions, query]);

  // A memo is looked up by its number (user, 2026-10-07).
  const visibleMemos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return memos;
    return memos.filter((memo) => memo.memoNo.toLowerCase().includes(needle));
  }, [memos, query]);

  // The branches the Printed combo box highlights — worked out once.
  const pendingTransmitCodes = useMemo(() => coicBranchesPendingTransmit(), []);

  const count = showsRegions ? visibleRegions.length : visibleMemos.length;

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
      h={{ lg: "calc(100vh - 220px)" }}
      overflow="hidden"
    >
      <Flex align="center" justify="space-between" gap={2} mb={3} flexShrink={0}>
        <StatusStepButton label="Previous view" onClick={step}>
          <ChevronLeft size={16} />
        </StatusStepButton>

        <Flex direction="column" align="center" gap={1} minW={0} aria-live="polite">
          <H3 textAlign="center" fontSize="lg" truncate>
            {labelOf(view)}
          </H3>
          <Flex gap={1} aria-hidden="true">
            {COIC_VIEWS.map((entry) => (
              <Box
                as="button"
                key={entry.view}
                onClick={() => onViewChange(entry.view)}
                tabIndex={-1}
                w={entry.view === view ? "14px" : "5px"}
                h="5px"
                borderRadius="full"
                bg={entry.view === view ? BRAND_COLORS.primaryGreen : "gray.200"}
                transition="all 0.2s ease"
                cursor="pointer"
              />
            ))}
          </Flex>
          <Text fontSize="xs" color="gray.400">
            {`${count} record${count === 1 ? "" : "s"}`}
          </Text>
        </Flex>

        <Flex align="center" gap={1} flexShrink={0}>
          <StatusStepButton label="Next view" onClick={step}>
            <ChevronRight size={16} />
          </StatusStepButton>

          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <Box
                as="button"
                aria-label="Choose COIC view"
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
                    onValueChange={(e) => onViewChange(e.value as CoicView)}
                  >
                    {COIC_VIEWS.map((entry) => (
                      <Menu.RadioItem
                        key={entry.view}
                        value={entry.view}
                        fontWeight={entry.view === view ? "600" : undefined}
                        color={
                          entry.view === view ? BRAND_COLORS.primaryGreen : undefined
                        }
                      >
                        {entry.label}
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

      {/* Printed picks its branch from a combo box — the branches with
          certificates still for transmit highlighted (user, 2026-10-07) —
          and searches the memos under it with the field below. */}
      {!showsRegions && (
        <BranchCombobox
          branches={branches}
          value={selectedBranchCode}
          onChange={onSelectBranch}
          highlightCodes={pendingTransmitCodes}
        />
      )}
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
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder={
              showsRegions ? "Search region or branch..." : "Search memo no..."
            }
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
          />
          {query && (
            <Box
              as="button"
              onClick={() => setQuery("")}
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

      <Flex
        direction="column"
        gap={`${ROW_GAP}px`}
        h={{ base: `${LIST_HEIGHT}px`, lg: "auto" }}
        flex={{ lg: "1" }}
        minH={{ lg: 0 }}
        flexShrink={{ base: 0, lg: 1 }}
        overflowY="auto"
      >
        {count === 0 && (
          <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
            {showsRegions
              ? query
                ? `No region matches “${query}”.`
                : "Nothing to list under this action."
              : memos.length === 0
                ? "No memos transmitted to this branch."
                : `No memo matches “${query}”.`}
          </Text>
        )}

        {showsRegions
          ? visibleRegions.map((region) => (
              <RegionRow
                key={region.code}
                region={region}
                active={region.code === selectedRegionCode}
                onClick={() => onSelectRegion(region)}
              />
            ))
          : visibleMemos.map((memo) => (
              <MemoRow
                key={memo.id}
                memo={memo}
                active={memo.id === selectedMemoId}
                onClick={() => onSelectMemo(memo)}
              />
            ))}
      </Flex>
    </Box>
  );
}

export default CoicRailCard;
