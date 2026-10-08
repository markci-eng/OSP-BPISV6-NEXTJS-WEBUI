"use client";

// The COFP request rail — the left column's card, and what picks the plan
// holder shown beside it.
//
// It reads like the memo rail on the COFP list screen, and on purpose: a title,
// a search field, then a run of rows that scroll INSIDE the card. Capped height
// is the whole point of a rail — a branch with two hundred certificates must not
// make this column taller than the card it sits next to.
//
// The rows are the sibling module's own `CofpRequest` records, so the two
// screens are never listing two different ideas of what a request is.
//
// A ROW IS A NAME AND AN LPA NUMBER, nothing else (user, 2026-09-21). The status,
// the branch and the amount were on it and are not any more: they are all on the
// card the row opens, and a rail that repeats them is four things to read where
// the rail is only ever scanned for one — whose plan this is.
//
// THE HEADER IS A VIEW CAROUSEL (user, 2026-10-02), the same one the ROP, CSV,
// Transfer and Reinstatement rails draw. Stepping it does not run anything: it
// picks which requests the rail lists, and the rows under it change to match.
// For Printing is the one picked on arrival.

import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Combobox,
  Flex,
  Input,
  Menu,
  Portal,
  Text,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  FileCheck,
  Printer,
  Repeat,
  Search,
  Star,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { H3 } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import type { CofpRequest } from "../../cofp/data/types";
import {
  COFP_PINNED_BRANCH_CODE,
  branchCountOf,
  branchesPendingTransmit,
  hasPendingConfirmation,
  isBranchView,
  type CofpBranchView,
} from "../data/branches";
import { forPrintingCountOf, regionLabelOf } from "../data/regions";
import type {
  CofpBranch,
  CofpMemo,
  CofpRegion,
  CofpReplacementRequest,
  CofpReplacementSource,
  CofpReplacementStatus,
  CofpView,
} from "../data/types";
import { LIST_HEIGHT, ROW_GAP, ROW_HEIGHT, RequestRow } from "./request-row";

interface CofpAction {
  view: CofpView;
  label: string;
  description: string;
  icon: LucideIcon;
}

// What a certificate can be put through, in the order it moves: printed —
// then the two ways one comes back. One button per selectable
// {@link CofpView}, and the list each one opens is decided by `requestsFor` in
// the data module, not here.
const COFP_ACTIONS: CofpAction[] = [
  {
    view: "FOR_PRINTING",
    label: "For Printing",
    description: "Certificates queued to be printed",
    icon: Printer,
  },
  {
    view: "DEFICIENT",
    label: "Deficient",
    description: "Certificates held back for a missing requirement",
    icon: AlertTriangle,
  },
  {
    view: "PRINTED",
    label: "Printed",
    description: "Certificates already printed",
    icon: FileCheck,
  },
  // Confiscated takes Released's place (user, 2026-10-05).
  {
    view: "CONFISCATED",
    label: "Confiscated",
    description: "Certificates taken back from a planholder",
    icon: Ban,
  },
  {
    view: "REPLACEMENT",
    label: "Replacement",
    description: "Reissue a lost or damaged certificate",
    icon: Repeat,
  },
];

const actionFor = (view: CofpView): CofpAction =>
  COFP_ACTIONS.find((action) => action.view === view) ?? COFP_ACTIONS[0];

/** One of the header's chevrons — the same one the other rails draw. */
export function StatusStepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      aria-label={label}
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

/** A region's row — the code read down the list, its branches under it. */
export function RegionRow({
  region,
  active,
  onClick,
}: {
  region: CofpRegion;
  active: boolean;
  onClick: () => void;
}) {
  const printCount = forPrintingCountOf(region);

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2}
      w="full"
      h={`${ROW_HEIGHT}px`}
      px={2.5}
      textAlign="start"
      // The same row `RequestRow` draws, so the two lists read alike.
      borderWidth="1px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: active ? undefined : "gray.300" }}
      flexShrink={0}
    >
      <Box minW={0} flex="1">
        <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
          {region.code}
        </Text>
        <Text fontSize="10px" color="gray.400" truncate title={region.description}>
          {region.description}
        </Text>
      </Box>
      {/* The certificates waiting to print — green while there are any, grey
          at zero so an idle region reads as one at a glance. */}
      <Box
        flexShrink={0}
        minW="24px"
        px={1.5}
        py={0.5}
        borderRadius="full"
        bg={printCount ? BRAND_COLORS.primaryGreen : "gray.100"}
        color={printCount ? "white" : "gray.500"}
        fontSize="10.5px"
        fontWeight="700"
        textAlign="center"
        title={`${printCount} for printing`}
      >
        {printCount}
      </Box>
    </Flex>
  );
}

/**
 * The Special Request row (user, 2026-10-05) — the first row of the For
 * Printing list, above the regions and never filtered out by the search, drawn in the brand's dark green and gold
 * (user, 2026-10-05) with a star and a "Priority" tag so it is the first thing
 * the eye lands on.
 */
function SpecialRequestRow({
  region,
  active,
  onClick,
}: {
  region: CofpRegion;
  active: boolean;
  onClick: () => void;
}) {
  const printCount = forPrintingCountOf(region);

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2.5}
      w="full"
      minH={`${ROW_HEIGHT + 8}px`}
      px={3}
      py={2}
      textAlign="start"
      // The brand's own dark green, filled — every other row is white with a
      // green edge, so a filled one reads as different without leaving the
      // palette. The brand gold marks it as priority; picked, it takes a gold
      // ring.
      borderWidth="2px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.brightGold : BRAND_COLORS.darkGreen}
      bg={BRAND_COLORS.darkGreen}
      shadow={active ? "md" : "xs"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ bg: BRAND_COLORS.primaryGreen }}
      flexShrink={0}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="28px"
        flexShrink={0}
        borderRadius="full"
        bg="whiteAlpha.200"
        color={BRAND_COLORS.brightGold}
      >
        <Star size={14} fill="currentColor" />
      </Flex>
      <Box minW={0} flex="1">
        <Flex align="center" gap={1.5}>
          <Text
            fontSize="sm"
            fontWeight="700"
            color="white"
            truncate
            title={regionLabelOf(region)}
          >
            {regionLabelOf(region)}
          </Text>
          <Box
            flexShrink={0}
            px={1.5}
            borderRadius="sm"
            bg={BRAND_COLORS.brightGold}
            color={BRAND_COLORS.darkGreen}
            fontSize="9px"
            fontWeight="700"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            Priority
          </Box>
        </Flex>
        <Text fontSize="10px" color={BRAND_COLORS.softGreen} truncate>
          Replacement certificates to reprint
        </Text>
      </Box>
      <Box
        flexShrink={0}
        minW="24px"
        px={1.5}
        py={0.5}
        borderRadius="full"
        bg={BRAND_COLORS.brightGold}
        color={BRAND_COLORS.darkGreen}
        fontSize="10.5px"
        fontWeight="700"
        textAlign="center"
        title={`${printCount} for printing`}
      >
        {printCount}
      </Box>
    </Flex>
  );
}

/**
 * "With pending confirmation" — beside the code of a branch whose confiscated
 * certificates are still to be confirmed (user, 2026-10-07).
 */
function PendingConfirmationTag() {
  return (
    <Box
      flexShrink={0}
      px={1.5}
      borderRadius="full"
      bg="orange.100"
      color="orange.700"
      fontSize="9px"
      fontWeight="700"
      lineHeight="16px"
      whiteSpace="nowrap"
      title="Confiscated COFP still waiting to be confirmed"
    >
      With pending confirmation
    </Box>
  );
}

/** A branch's row — the code, its description under it, its count beside. */
function BranchRow({
  branch,
  view,
  active,
  onClick,
}: {
  branch: CofpBranch;
  /** Which view's figure the badge shows. */
  view: CofpBranchView;
  active: boolean;
  onClick: () => void;
}) {
  const count = branchCountOf(view, branch);
  const pending = view === "CONFISCATED" && hasPendingConfirmation(branch);

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2}
      w="full"
      h={`${ROW_HEIGHT}px`}
      px={2.5}
      textAlign="start"
      // The same row `RegionRow` draws, so the lists read alike.
      borderWidth="1px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: active ? undefined : "gray.300" }}
      flexShrink={0}
    >
      <Box minW={0} flex="1">
        <Flex align="center" gap={1.5} minW={0}>
          <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
            {branch.code}
          </Text>
          {pending && <PendingConfirmationTag />}
        </Flex>
        <Text fontSize="10px" color="gray.400" truncate title={branch.description}>
          {branch.description}
        </Text>
      </Box>
      {/* The branch's certificates under this view — deficient, or printed.
          The same badge the region row draws, green while there are any,
          grey at zero. */}
      <Box
        flexShrink={0}
        minW="24px"
        px={1.5}
        py={0.5}
        borderRadius="full"
        bg={count ? BRAND_COLORS.primaryGreen : "gray.100"}
        color={count ? "white" : "gray.500"}
        fontSize="10.5px"
        fontWeight="700"
        textAlign="center"
        title={`${count} ${view.toLowerCase()}`}
      >
        {count}
      </Box>
    </Flex>
  );
}

/**
 * The pinned branch's row (user, 2026-10-05) — SPFC, first in the branch list
 * and never filtered out by the search, drawn like the From COFP Replacement
 * row so the two pinned rows read as one idea.
 */
function PinnedBranchRow({
  branch,
  view,
  active,
  onClick,
}: {
  branch: CofpBranch;
  view: CofpBranchView;
  active: boolean;
  onClick: () => void;
}) {
  const count = branchCountOf(view, branch);

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2.5}
      w="full"
      minH={`${ROW_HEIGHT + 8}px`}
      px={3}
      py={2}
      textAlign="start"
      borderWidth="2px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.brightGold : BRAND_COLORS.darkGreen}
      bg={BRAND_COLORS.darkGreen}
      shadow={active ? "md" : "xs"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ bg: BRAND_COLORS.primaryGreen }}
      flexShrink={0}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="28px"
        flexShrink={0}
        borderRadius="full"
        bg="whiteAlpha.200"
        color={BRAND_COLORS.brightGold}
      >
        <Star size={14} fill="currentColor" />
      </Flex>
      <Box minW={0} flex="1">
        <Flex align="center" gap={1.5} minW={0}>
          <Text fontSize="sm" fontWeight="700" color="white" truncate>
            {branch.code}
          </Text>
          {view === "CONFISCATED" && hasPendingConfirmation(branch) && (
            <PendingConfirmationTag />
          )}
        </Flex>
        <Text
          fontSize="10px"
          color={BRAND_COLORS.softGreen}
          truncate
          title={branch.description}
        >
          {branch.description}
        </Text>
      </Box>
      <Box
        flexShrink={0}
        minW="24px"
        px={1.5}
        py={0.5}
        borderRadius="full"
        bg={BRAND_COLORS.brightGold}
        color={BRAND_COLORS.darkGreen}
        fontSize="10.5px"
        fontWeight="700"
        textAlign="center"
        title={`${count} ${view.toLowerCase()}`}
      >
        {count}
      </Box>
    </Flex>
  );
}

/**
 * A memo's row — the memo number, its branch under it, the date and the
 * number of printed certificates beside.
 */
export function MemoRow({
  memo,
  active,
  onClick,
}: {
  memo: CofpMemo;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2}
      w="full"
      h={`${ROW_HEIGHT}px`}
      px={2.5}
      textAlign="start"
      // The same row `BranchRow` draws, so the lists read alike.
      borderWidth="1px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: active ? undefined : "gray.300" }}
      flexShrink={0}
    >
      <Box minW={0} flex="1">
        <Text fontSize="xs" fontWeight="700" color="gray.800" fontFamily="mono" truncate>
          {memo.memoNo}
        </Text>
        <Text fontSize="10px" color="gray.400" truncate>
          {memo.branch}
        </Text>
      </Box>
      {/* A memo still to go out says so, with no date — it has not been
          transmitted (user, 2026-10-07) — in the colour the branch combo box
          highlights it in. */}
      <Box flexShrink={0} textAlign="end">
        <Text
          fontSize="9px"
          color={memo.pendingTransmit ? "orange.600" : "gray.400"}
          fontWeight={memo.pendingTransmit ? "700" : undefined}
          textTransform="uppercase"
        >
          {memo.pendingTransmit ? "Pending Transmit" : "Transmitted"}
        </Text>
        {!memo.pendingTransmit && (
          <Text fontSize="10.5px" color="gray.600" whiteSpace="nowrap">
            {formatDate(memo.dateTransmitted)}
          </Text>
        )}
      </Box>
      {/* The number of printed certificates the memo carried — the same badge
          the branch and region rows draw. */}
      <Box
        flexShrink={0}
        minW="24px"
        px={1.5}
        py={0.5}
        borderRadius="full"
        bg={memo.rows.length ? BRAND_COLORS.primaryGreen : "gray.100"}
        color={memo.rows.length ? "white" : "gray.500"}
        fontSize="10.5px"
        fontWeight="700"
        textAlign="center"
        title={`${memo.rows.length} printed`}
      >
        {memo.rows.length}
      </Box>
    </Flex>
  );
}

/**
 * A Branch replacement request's row (user, 2026-10-05) — the LPA number and
 * the plan holder's name, the date requested beside.
 */
function ReplacementRequestRow({
  request,
  active,
  onClick,
}: {
  request: CofpReplacementRequest;
  active: boolean;
  onClick: () => void;
}) {
  const name = `${request.lastName}, ${request.firstName} ${request.middleName}`;

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2}
      w="full"
      h={`${ROW_HEIGHT}px`}
      px={2.5}
      textAlign="start"
      // The same row `MemoRow` draws, so the lists read alike.
      borderWidth="1px"
      borderRadius="sm"
      borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={active ? "#f4faf6" : "white"}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: active ? undefined : "gray.300" }}
      flexShrink={0}
    >
      <Box minW={0} flex="1">
        <Text fontSize="xs" fontWeight="700" color="gray.800" fontFamily="mono" truncate>
          {request.lpaNo}
        </Text>
        <Text fontSize="10px" color="gray.500" truncate title={name}>
          {name}
        </Text>
      </Box>
      <Box flexShrink={0} textAlign="end">
        <Text fontSize="9px" color="gray.400" textTransform="uppercase">
          Requested
        </Text>
        <Text fontSize="10.5px" color="gray.600" whiteSpace="nowrap">
          {formatDate(request.dateRequested)}
        </Text>
      </Box>
    </Flex>
  );
}

/** "Oct 1, 2026" — read as a calendar date, never shifted by the time zone. */
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const branchLabel = (branch: CofpBranch) =>
  branch.code === branch.description
    ? branch.code
    : `${branch.code} — ${branch.description}`;

/**
 * The Printed view's branch picker (user, 2026-10-05) — a combo box, so a
 * branch out of two hundred is found by typing rather than scrolling. Also the
 * Add Special COFP dialog's Preferred Branch.
 */
export function BranchCombobox({
  branches,
  value,
  onChange,
  label = "Branch",
  errorText,
  portalled = true,
  highlightCodes,
}: {
  branches: CofpBranch[];
  value?: string;
  onChange: (branch: CofpBranch) => void;
  label?: string;
  errorText?: string;
  portalled?: boolean;
  /**
   * Branches drawn highlighted, with a Pending tag — Printed's branches with
   * a memo still to transmit (user, 2026-10-07).
   */
  highlightCodes?: Set<string>;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: branches,
    itemToString: branchLabel,
    itemToValue: (branch) => branch.code,
    filter: contains,
  });
  const selected = branches.find((branch) => branch.code === value);

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      defaultInputValue={selected ? branchLabel(selected) : ""}
      onValueChange={(e) => {
        const next = branches.find((branch) => branch.code === e.value[0]);
        if (next) onChange(next);
      }}
      // Only typing filters. Picking a branch writes its label into the input
      // too, and filtering on that left the list holding just that branch.
      onInputValueChange={(e) =>
        filter(e.reason === "input-change" ? e.inputValue : "")
      }
      openOnClick
      size="sm"
      mb={3}
      flexShrink={0}
      invalid={!!errorText}
    >
      <Combobox.Label fontSize="xs" color="gray.500">
        {label}
      </Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Type a branch code or name..." />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal disabled={!portalled}>
        <Combobox.Positioner>
          <Combobox.Content maxH="300px" overflowY="auto">
            <Combobox.Empty>No branch matches.</Combobox.Empty>
            {collection.items.map((branch) => {
              const highlighted = highlightCodes?.has(branch.code);
              return (
                <Combobox.Item
                  key={branch.code}
                  item={branch}
                  bg={highlighted ? "orange.50" : undefined}
                  _highlighted={highlighted ? { bg: "orange.100" } : undefined}
                >
                  <Text
                    fontSize="xs"
                    truncate
                    flex="1"
                    fontWeight={highlighted ? "semibold" : undefined}
                    color={highlighted ? "orange.800" : undefined}
                  >
                    {branchLabel(branch)}
                  </Text>
                  {highlighted && (
                    <Box
                      flexShrink={0}
                      px={1.5}
                      borderRadius="full"
                      bg="orange.500"
                      color="white"
                      fontSize="9px"
                      fontWeight="700"
                      textTransform="uppercase"
                    >
                      Pending
                    </Box>
                  )}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              );
            })}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
      {errorText && (
        <Text fontSize="xs" color="red.500" mt={1}>
          {errorText}
        </Text>
      )}
    </Combobox.Root>
  );
}

export interface CofpRequestListCardProps {
  requests: CofpRequest[];
  /** Which action's list the rows are — the button drawn as pressed. */
  view: CofpView;
  onViewChange: (view: CofpView) => void;
  /** The row drawn as picked. */
  selectedId?: string;
  onSelect: (request: CofpRequest) => void;
  /** What For Printing lists in place of requests. */
  regions: CofpRegion[];
  /** Pinned above the regions under For Printing, whatever the search. */
  specialRequest?: CofpRegion;
  /** The region row drawn as picked. */
  selectedRegionCode?: string;
  onSelectRegion: (region: CofpRegion) => void;
  /** What Deficient and Confiscated list in place of requests. */
  branches: CofpBranch[];
  /** The branch row drawn as picked. */
  selectedBranchCode?: string;
  onSelectBranch: (branch: CofpBranch) => void;
  /** What Printed lists under the picked branch. */
  memos: CofpMemo[];
  /** The memo row drawn as picked. */
  selectedMemoId?: string;
  onSelectMemo: (memo: CofpMemo) => void;
  /** Which of Replacement's three sources is pressed. */
  replacementSource: CofpReplacementSource;
  onReplacementSourceChange: (source: CofpReplacementSource) => void;
  /** Which status's requests Branch lists (user, 2026-10-07). */
  replacementStatus: CofpReplacementStatus;
  onReplacementStatusChange: (status: CofpReplacementStatus) => void;
  /** What Replacement's Branch combo box offers. */
  replacementBranches: CofpBranch[];
  replacementBranchCode?: string;
  onSelectReplacementBranch: (branch: CofpBranch) => void;
  /** How many requests the right-hand list holds under Replacement. */
  replacementCount: number;
  /** The picked branch's requests — listed under the Branch combo box. */
  replacementRequests: CofpReplacementRequest[];
  /** The Branch request row drawn as picked. */
  selectedReplacementId?: string;
  onSelectReplacementRequest: (request: CofpReplacementRequest) => void;
}

const REPLACEMENT_SOURCES: { value: CofpReplacementSource; label: string }[] = [
  { value: "SPFC", label: "SPFC" },
  { value: "CONFISCATED", label: "Confiscated" },
  { value: "BRANCH", label: "Branch" },
];

/** Branch's status buttons (user, 2026-10-07), For Process first. */
const REPLACEMENT_STATUSES: { value: CofpReplacementStatus; label: string }[] = [
  { value: "FOR_PROCESS", label: "For Process" },
  { value: "PENDING", label: "Pending" },
  { value: "DENIED", label: "Denied" },
];

const statusLabelOf = (status: CofpReplacementStatus) =>
  REPLACEMENT_STATUSES.find((option) => option.value === status)?.label ?? status;

/**
 * A rail search field — icon, bare input, clear — drawn as the rail's own
 * search is. Branch Replacement's search over its requests (user, 2026-10-07).
 */
function RailSearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
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
      {value && (
        <Box
          as="button"
          onClick={() => onChange("")}
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
  );
}

/**
 * A titled row of buttons, one pressed at a time — Replacement's three
 * sources (user, 2026-10-05) and, under Branch, its three statuses (user,
 * 2026-10-07).
 */
function ChoiceButtons<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const titleId = `replacement-${title.toLowerCase()}-title`;
  return (
    // In a card of its own under a "From" title (user, 2026-10-06), so the
    // three read as one choice apart from the combo box and list below.
    <Box
      mb={3}
      flexShrink={0}
      p={3}
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="md"
      bg="gray.50"
    >
    <Text
      id={titleId}
      fontSize="xs"
      fontWeight="700"
      color="gray.600"
      letterSpacing="0.06em"
      textTransform="uppercase"
      mb={2}
    >
      {title}
    </Text>
    <Flex
      role="radiogroup"
      aria-labelledby={titleId}
      gap={1.5}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Box
            as="button"
            key={option.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            flex="1"
            h="34px"
            px={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor={active ? BRAND_COLORS.primaryGreen : "gray.200"}
            bg={active ? BRAND_COLORS.primaryGreen : "white"}
            color={active ? "white" : "gray.700"}
            fontSize="xs"
            fontWeight="600"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{
              borderColor: BRAND_COLORS.primaryGreen,
              color: active ? "white" : BRAND_COLORS.primaryGreen,
            }}
          >
            {option.label}
          </Box>
        );
      })}
    </Flex>
    </Box>
  );
}

export function CofpRequestListCard({
  requests,
  view,
  onViewChange,
  selectedId,
  onSelect,
  regions,
  specialRequest,
  selectedRegionCode,
  onSelectRegion,
  branches,
  selectedBranchCode,
  onSelectBranch,
  memos,
  selectedMemoId,
  onSelectMemo,
  replacementSource,
  onReplacementSourceChange,
  replacementStatus,
  onReplacementStatusChange,
  replacementBranches,
  replacementBranchCode,
  onSelectReplacementBranch,
  replacementCount,
  replacementRequests,
  selectedReplacementId,
  onSelectReplacementRequest,
}: CofpRequestListCardProps) {
  const [query, setQuery] = useState("");
  // FOR PRINTING LISTS REGIONS, not requests (user, 2026-10-02), DEFICIENT
  // lists branches, and PRINTED lists memos under a branch picked from a combo
  // box (user, 2026-10-05). CONFISCATED lists branches like Deficient (user,
  // 2026-10-05): every other view is still a run of plan holders.
  const showsRegions = view === "FOR_PRINTING";
  const showsMemos = view === "PRINTED";
  const showsBranches = view === "DEFICIENT" || view === "CONFISCATED";
  // REPLACEMENT lists nothing in the rail (user, 2026-10-05): three source
  // buttons, and under Branch a combo box — the requests are on the right.
  const showsReplacement = view === "REPLACEMENT";

  const step = (direction: 1 | -1) => {
    const count = COFP_ACTIONS.length;
    const index = COFP_ACTIONS.findIndex((action) => action.view === view);
    onViewChange(COFP_ACTIONS[(index + direction + count) % count].view);
  };

  // LPA number, name and CFP number — the three things a request is looked up
  // by. Matched on the raw string so a partial LPA finds its row.
  const matches = (request: CofpRequest, needle: string) =>
    [
      request.lpaNo,
      request.planholderName,
      request.cfpNumber,
      request.branchCode,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter((request) => matches(request, needle));
  }, [requests, query]);

  // A region is looked up by its code or any branch under it.
  const visibleRegions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return regions;
    return regions.filter((region) =>
      `${region.code} ${region.description}`.toLowerCase().includes(needle),
    );
  }, [regions, query]);

  // SPFC is pinned above the branches whatever the search (user, 2026-10-05),
  // the way From COFP Replacement is above the regions — so it is drawn on its
  // own and left out of the list the search filters. Deficient leaves SPFC out
  // altogether (user, 2026-10-07).
  const pinnedBranch =
    view === "DEFICIENT"
      ? undefined
      : branches.find((branch) => branch.code === COFP_PINNED_BRANCH_CODE);

  // A branch is looked up by its code or description.
  const visibleBranches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rest = branches.filter(
      (branch) => branch.code !== COFP_PINNED_BRANCH_CODE,
    );
    if (!needle) return rest;
    return rest.filter((branch) =>
      `${branch.code} ${branch.description}`.toLowerCase().includes(needle),
    );
  }, [branches, query]);

  // A Branch replacement request is looked up by its LPA number or the plan
  // holder's name (user, 2026-10-07) — its own field, under the combo box.
  const [lpaQuery, setLpaQuery] = useState("");
  const visibleReplacementRequests = useMemo(() => {
    const needle = lpaQuery.trim().toLowerCase();
    if (!needle) return replacementRequests;
    return replacementRequests.filter((request) =>
      `${request.lpaNo} ${request.lastName}, ${request.firstName} ${request.middleName}`
        .toLowerCase()
        .includes(needle),
    );
  }, [replacementRequests, lpaQuery]);

  // A memo is looked up by its number (user, 2026-10-07).
  const visibleMemos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return memos;
    return memos.filter((memo) => memo.memoNo.toLowerCase().includes(needle));
  }, [memos, query]);

  // The branches the Printed combo box highlights — worked out once.
  const pendingTransmitCodes = useMemo(() => branchesPendingTransmit(), []);

  const count = showsReplacement
    ? replacementCount
    : showsRegions
    ? visibleRegions.length + (specialRequest ? 1 : 0)
    : showsMemos
      ? visibleMemos.length
      : showsBranches
        ? visibleBranches.length + (pinnedBranch ? 1 : 0)
        : visible.length;
  const noun = showsRegions
    ? "region"
    : showsMemos
      ? "memo"
      : showsBranches
        ? "branch"
        : "request";

  return (
    <Box
      // `white`, the ground the plan holder card is drawn on, rather than the
      // `bg` token this card used to take (user, 2026-09-22). The two sit side
      // by side and `bg` is the PAGE's surface — a card standing on the same
      // colour as the page has no face of its own, which showed as the rail
      // reading flat next to the card beside it. The rows inside were already
      // white, so this is also what stops the card being darker than its own
      // contents.
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      // THE SAME CORNER THE PLAN HOLDER CARD TAKES (user, 2026-09-22). It was
      // `2xl`, which put a 16px curve next to that card's 5px one across a
      // 20px gap — two cards in one view that disagreed about what a card is.
      // Spelled as the shared token rather than as 5px, so it keeps agreeing
      // after the next change to it.
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      display="flex"
      flexDirection="column"
      // THE SCREEN'S HEIGHT ON DESKTOP (user, 2026-10-02) — the same figure the
      // ROP, CSV, Transfer and Reinstatement rails cap at, so the list runs to
      // the bottom of the viewport and scrolls inside. Stacked below lg, the
      // list keeps its five rows.
      h={{ lg: "calc(100vh - 220px)" }}
      overflow="hidden"
    >
      {/* THE SAME STATUS CAROUSEL THE ROP, CSV, TRANSFER AND REINSTATEMENT
          RAILS DRAW (user, 2026-10-02) — it replaced a strip of two tab
          buttons and a "More" menu. One view shows at a time, the chevrons
          step through all seven and wrap at either end, and the menu on the
          right jumps straight to one. */}
      <Flex align="center" justify="space-between" gap={2} mb={3} flexShrink={0}>
        <StatusStepButton label="Previous view" onClick={() => step(-1)}>
          <ChevronLeft size={16} />
        </StatusStepButton>

        <Flex direction="column" align="center" gap={1} minW={0} aria-live="polite">
          <H3 textAlign="center" fontSize="lg" truncate>
            {actionFor(view).label}
          </H3>
          <Flex gap={1} aria-hidden="true">
            {COFP_ACTIONS.map((action) => (
              <Box
                as="button"
                key={action.view}
                onClick={() => onViewChange(action.view)}
                tabIndex={-1}
                w={action.view === view ? "14px" : "5px"}
                h="5px"
                borderRadius="full"
                bg={action.view === view ? BRAND_COLORS.primaryGreen : "gray.200"}
                transition="all 0.2s ease"
                cursor="pointer"
              />
            ))}
          </Flex>
          <Text fontSize="xs" color="gray.400">
            {`${count} record${count === 1 ? "" : "s"}`}
          </Text>
        </Flex>

        {/* The next chevron and the view menu share the right edge, so the
            title stays centred between the two sides. */}
        <Flex align="center" gap={1} flexShrink={0}>
          <StatusStepButton label="Next view" onClick={() => step(1)}>
            <ChevronRight size={16} />
          </StatusStepButton>

          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <Box
                as="button"
                aria-label="Choose COFP view"
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
                    onValueChange={(e) => onViewChange(e.value as CofpView)}
                  >
                    {COFP_ACTIONS.map((action) => (
                      <Menu.RadioItem
                        key={action.view}
                        value={action.view}
                        fontWeight={action.view === view ? "600" : undefined}
                        color={
                          action.view === view
                            ? BRAND_COLORS.primaryGreen
                            : undefined
                        }
                      >
                        {action.label}
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

      {/* Replacement's source buttons, and under Branch its status buttons
          (user, 2026-10-07), the combo box of branches with a request, and
          the searchable list of requests. Nothing else is drawn in the rail. */}
      {showsReplacement ? (
        <>
          <ChoiceButtons
            title="From"
            options={REPLACEMENT_SOURCES}
            value={replacementSource}
            onChange={onReplacementSourceChange}
          />
          {replacementSource === "BRANCH" && (
            <>
              <ChoiceButtons
                title="Status"
                options={REPLACEMENT_STATUSES}
                value={replacementStatus}
                onChange={onReplacementStatusChange}
              />
              <BranchCombobox
                key="replacement-branch"
                branches={replacementBranches}
                value={replacementBranchCode}
                onChange={onSelectReplacementBranch}
              />
              {replacementBranchCode && (
                <RailSearchField
                  value={lpaQuery}
                  onChange={setLpaQuery}
                  placeholder="Search LPA no. or name..."
                />
              )}
              {/* The picked branch's requests, under the combo box (user,
                  2026-10-05) — scrolling inside the card like every other
                  rail list. */}
              {replacementBranchCode && (
                <Flex
                  direction="column"
                  gap={`${ROW_GAP}px`}
                  h={{ base: `${LIST_HEIGHT}px`, lg: "auto" }}
                  flex={{ lg: "1" }}
                  minH={{ lg: 0 }}
                  flexShrink={{ base: 0, lg: 1 }}
                  overflowY="auto"
                >
                  {visibleReplacementRequests.length === 0 ? (
                    <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
                      {replacementRequests.length === 0
                        ? `No ${statusLabelOf(replacementStatus).toLowerCase()} requests from this branch.`
                        : `No request matches “${lpaQuery}”.`}
                    </Text>
                  ) : (
                    visibleReplacementRequests.map((request) => (
                      <ReplacementRequestRow
                        key={request.id}
                        request={request}
                        active={request.id === selectedReplacementId}
                        onClick={() => onSelectReplacementRequest(request)}
                      />
                    ))
                  )}
                </Flex>
              )}
            </>
          )}
        </>
      ) : (
      <>
      {/* Printed picks its branch from a combo box — the branches with a
          memo still to transmit highlighted (user, 2026-10-07) — and
          searches the memos under it with the field below (user,
          2026-10-07). */}
      {showsMemos && (
        <BranchCombobox
          branches={branches}
          value={selectedBranchCode}
          onChange={onSelectBranch}
          highlightCodes={pendingTransmitCodes}
        />
      )}
      {/* Same search field the memo rail uses — icon, bare input, clear. */}
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
            showsRegions
              ? "Search region or branch..."
              : showsMemos
                ? "Search memo no..."
                : showsBranches
                  ? "Search branch code or description..."
                  : "Search LPA, name, or CFP no..."
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
            aria-label="Clear request search"
            _hover={{ color: "gray.600" }}
          >
            <X size={14} />
          </Box>
        )}
      </Flex>
      </>
      )}

      {/* THE LIST THE ACTION OPENS — whatever height the card has left on
          desktop, five rows tall when stacked. Replacement's is on the
          right instead. */}
      {!showsReplacement && (
      <Flex
        direction="column"
        gap={`${ROW_GAP}px`}
        h={{ base: `${LIST_HEIGHT}px`, lg: "auto" }}
        flex={{ lg: "1" }}
        minH={{ lg: 0 }}
        flexShrink={{ base: 0, lg: 1 }}
        overflowY="auto"
      >
        {/* Special Request is the list's first row (user, 2026-10-05), and
            stays there whatever the search — the regions follow it. */}
        {showsRegions && specialRequest && (
          <SpecialRequestRow
            region={specialRequest}
            active={specialRequest.code === selectedRegionCode}
            onClick={() => onSelectRegion(specialRequest)}
          />
        )}

        {showsBranches && isBranchView(view) && pinnedBranch && (
          <PinnedBranchRow
            branch={pinnedBranch}
            view={view}
            active={pinnedBranch.code === selectedBranchCode}
            onClick={() => onSelectBranch(pinnedBranch)}
          />
        )}

        {(showsRegions
          ? visibleRegions.length === 0
          : showsBranches
            ? visibleBranches.length === 0
            : count === 0) && (
          <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
            {showsMemos && memos.length === 0
              ? "No memos transmitted to this branch."
              : query
                ? `No ${noun} matches “${query}”.`
                : "Nothing to list under this action."}
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
          : showsMemos
            ? visibleMemos.map((memo) => (
                <MemoRow
                  key={memo.id}
                  memo={memo}
                  active={memo.id === selectedMemoId}
                  onClick={() => onSelectMemo(memo)}
                />
              ))
          : isBranchView(view)
            ? visibleBranches.map((branch) => (
                <BranchRow
                  key={branch.code}
                  branch={branch}
                  view={view}
                  active={branch.code === selectedBranchCode}
                  onClick={() => onSelectBranch(branch)}
                />
              ))
            : visible.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                active={request.id === selectedId}
                onClick={() => onSelect(request)}
              />
            ))}
      </Flex>
      )}
    </Box>
  );
}

export default CofpRequestListCard;
