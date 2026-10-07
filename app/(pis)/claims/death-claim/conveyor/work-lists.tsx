"use client";

// THE LISTS THAT ARE NOT THE QUEUE — where a claim went after it left the
// conveyor, and every claim there has ever been.
//
// THE CONVEYOR ONLY EVER MOVES FORWARD, which is its strength and its one gap:
// answer a claim and it is gone, and a processor who needs it again — a branch
// rings about a claim sent back last week, a supervisor queries one approved
// this morning — has nowhere to look. These three are that somewhere, and
// keeping them OFF the main column is deliberate: they are consulted, not read
// on the way past.
//
// THREE ROWS AND NOT THREE MORE BUTTONS. The block above this is already nine
// controls; a list is a different kind of thing from an action — it answers
// rather than does — and each of these carries a COUNT, which a button of the
// tile shape has nowhere to put. A row with its number on the right states its
// own answer before it is opened, and most of the time the number is the whole
// answer.
//
// THE COUNTS ARE THE REASON THIS IS NOT DUPLICATION. Everything else that was
// ever pinned in this rail — documents on file, payees named, deficiencies —
// restated a section sitting a few hundred pixels away, and came out again for
// exactly that. These numbers are stated nowhere else on the screen.

import type { ReactNode } from "react";
import { Box, chakra, Flex, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_SHAPE } from "../../components/section-card";
import { SegmentedTabs } from "../../components/segmented-tabs";
import { useSwipeStep } from "../../components/use-swipe-step";
import {
  HISTORY_RANGE_OPTIONS,
  rangeHint,
  rangeLabel,
  type HistoryRange,
  type HistoryRangeKind,
} from "./history-range";

/** Which list is open over the page, or `null` for none. */
export type WorkListKey =
  | "all"
  | "approval"
  | "denial"
  | "approved"
  | "denied"
  | "compliance";

/**
 * One row of the card. Generic over its key so Service Payables can hand the
 * same card its own rows — billings have no denial and no return (user,
 * 2026-09-30) — while both pages keep one History card between them.
 */
export interface WorkListRow<K extends string = WorkListKey> {
  key: K;
  label: string;
  /** Names the dialog, and says what the list is when the label is terse. */
  title: string;
}

/**
 * THE USER'S OWN HISTORY — what they answered, not what the file holds (user,
 * 2026-09-29). Every claim waiting to be worked is found through the search at
 * the top of the rail instead; an "All claims" row here restated that queue.
 *
 * TWO SOURCES, ONE CLAIM EACH. The claims on file this user processed (the
 * header's processor), and what they did this session — see
 * `getClaimActionBy`. A session act wins, being the later fact. Each claim sits
 * under exactly one row, so the five narrow rows always add up to "All".
 *
 * NO SEPARATE "PROCESSED" ROW. Every claim connected to this user is one they
 * processed, so it would repeat "All" to the claim.
 *
 * "FOR" IS NOT FINAL; APPROVED / DENIED ARE. A processor's answer is a
 * recommendation, and a supervisor's approval only verifies it on to the
 * approver — both land under "For". Approved and Denied are where the claim
 * ended: off the record, or a supervisor's denial, which ends it at
 * verification. See `ClaimActionKind`.
 */
export const WORK_LISTS: WorkListRow<WorkListKey>[] = [
  { key: "all", label: "All", title: "All your claims" },
  { key: "approval", label: "For approval", title: "Sent for approval" },
  { key: "denial", label: "For denial", title: "Sent for denial" },
  { key: "approved", label: "Approved", title: "Approved claims" },
  { key: "denied", label: "Denied", title: "Denied claims" },
  {
    key: "compliance",
    label: "Returned for compliance",
    title: "Returned for compliance",
  },
];

function Row({
  label,
  count,
  onClick,
  first,
}: {
  label: string;
  count: number;
  onClick: () => void;
  /** The first row draws no rule above it — the card's own edge is there. */
  first: boolean;
}) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      justify="space-between"
      gap={3}
      w="full"
      textAlign="left"
      // A THUMB-SIZED ROW ON A PHONE (user, 2026-10-01: "it is hard to click
      // each selection"). 48px is the touch minimum; the rail keeps its 8px.
      minH={{ base: "48px", lg: "auto" }}
      py={2}
      // The first row's rule is the one under the period heading, which is
      // already there — a second on top of it would draw a double line.
      borderTopWidth={first ? 0 : "1px"}
      borderColor="gray.100"
      cursor="pointer"
      _hover={{ "& .work-list-label": { color: BRAND_COLORS.darkGreen } }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Text
        className="work-list-label"
        fontSize={{ base: "sm", lg: "xs" }}
        color="gray.700"
        truncate
        transition="color 120ms ease"
      >
        {label}
      </Text>

      <Flex align="center" gap={1} flexShrink={0} color="gray.500">
        {/* The count in the value position, where every other pair in this rail
            puts one. Zero is stated rather than hidden: "none returned" is an
            answer, and a row that disappeared when empty would make the card a
            different shape on every claim. */}
        <Text fontSize={{ base: "sm", lg: "xs" }} fontWeight="600">
          {count}
        </Text>
        <LuChevronRight size={16} />
      </Flex>
    </Flex>
  );
}

/** One arrow of the period stepper — off, not hidden, where it may not go. */
function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  /** `undefined` where there is nothing that way — see `rangeSteps`. */
  onClick?: () => void;
  children: ReactNode;
}) {
  const enabled = onClick !== undefined;
  return (
    // `chakra.button` rather than `Flex as="button"`: the latter's props do not
    // carry `disabled`, and a disabled arrow has to be one, not look like one.
    <chakra.button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      // 40px on a phone for the same reason as the rows.
      boxSize={{ base: "40px", lg: "28px" }}
      flexShrink={0}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      color={enabled ? BRAND_COLORS.darkGreen : "gray.300"}
      cursor={enabled ? "pointer" : "not-allowed"}
      _hover={enabled ? { bg: "#f4faf6" } : undefined}
      // A PRESS YOU CAN SEE (user, 2026-10-01: "do something in arrow add some
      // animation"). The arrow dips as it is pressed; the card then slides —
      // see `useSwipeStep`.
      transition="transform 120ms ease, background-color 120ms ease"
      _active={enabled ? { transform: "scale(0.88)" } : undefined}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      {children}
    </chakra.button>
  );
}

export function WorkLists<K extends string = WorkListKey>({
  rows,
  counts,
  range,
  steps,
  onRangeChange,
  onKindChange,
  onOpen,
}: {
  /** The rows, in order — `WORK_LISTS` on the death claim. */
  rows: WorkListRow<K>[];
  counts: Record<K, number>;
  /** The period every number on the card is a total of. */
  range: HistoryRange;
  /** Where the arrows go — see `rangeSteps`. */
  steps: { prev: HistoryRange | null; next: HistoryRange | null };
  onRangeChange: (range: HistoryRange) => void;
  /** Weekly / Monthly / Yearly — the page decides which period it opens on. */
  onKindChange: (kind: HistoryRangeKind) => void;
  onOpen: (key: K) => void;
}) {
  const hint = rangeHint(range);
  // SWIPE THE PERIOD (user, 2026-10-01) — the date and its rows move as one
  // card under the finger, and the arrows run the same slide. See
  // `useSwipeStep`.
  const { slide, cardProps, contentStyle } = useSwipeStep({
    canGo: (dir) => steps[dir] !== null,
    onStep: (dir) => {
      const target = steps[dir];
      if (target) onRangeChange(target);
    },
  });

  return (
    // A CARD IN THE RAIL, BARE IN THE PHONE'S SHEET (user, 2026-10-01: "when
    // mobile remove it in the card"). Below `lg` the History lives in a bottom
    // sheet, which is already the surface — a card inside it was a box in a box.
    // `lg` is the same line the pages use to swap the rail for the sheet.
    <Box
      borderRadius={{ lg: CARD_SHAPE.borderRadius }}
      borderWidth={{ base: 0, lg: CARD_SHAPE.borderWidth }}
      borderColor={CARD_SHAPE.borderColor}
      boxShadow={{ base: "none", lg: CARD_SHAPE.boxShadow }}
      bg={{ base: "transparent", lg: "white" }}
      px={{ base: 0, lg: 4 }}
      py={{ base: 0, lg: 3 }}
    >
      {/* "HISTORY", AND NOTHING AFTER IT (user, 2026-09-29). The period is
          stated by the stepper right under it, so a period in the heading
          would say it twice. On a phone the sheet's own title says it, beside
          the close button — see `MobileQuickAccess`. */}
      <Text
        hideBelow="lg"
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={2}
      >
        History
      </Text>

      {/* THE RANGE ON THE CARD, ABOVE the numbers it changes — option A of
          the placement study. Tried at the foot and put back (user,
          2026-09-29): the period has to be read before the counts it scopes. */}
      <SegmentedTabs
        label="History range"
        options={HISTORY_RANGE_OPTIONS}
        value={range.kind}
        onChange={onKindChange}
      />

      {/* THE SWIPE CARD — the date and its rows, which move together. The
          arrows sit over it and stay put; see `useSwipeStep`. `clip` keeps
          the card's travel from widening the sheet into a sideways scroll. */}
      <Box position="relative" mt={2.5} overflowX="clip" {...cardProps}>
        <Flex
          position="absolute"
          top={0}
          insetX={0}
          justify="space-between"
          pointerEvents="none"
          zIndex={1}
          css={{ "& > *": { pointerEvents: "auto" } }}
        >
          <StepButton
            label="Previous period"
            onClick={steps.prev ? () => slide("prev") : undefined}
          >
            <LuChevronLeft size={16} />
          </StepButton>
          <StepButton
            label="Next period"
            onClick={steps.next ? () => slide("next") : undefined}
          >
            <LuChevronRight size={16} />
          </StepButton>
        </Flex>

        <Box style={contentStyle}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH={{ base: "40px", lg: "28px" }}
            // Clear of the arrows on both sides, whichever size they are.
            px={{ base: "48px", lg: "36px" }}
            mb={1}
          >
            <Text fontSize="13px" fontWeight="600" color="gray.800" truncate>
              {rangeLabel(range)}
            </Text>
            {hint && (
              <Text fontSize="11px" color="gray.500">
                {hint}
              </Text>
            )}
          </Flex>

          {rows.map((list, index) => (
            <Row
              key={list.key}
              label={list.label}
              count={counts[list.key]}
              first={index === 0}
              onClick={() => onOpen(list.key)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default WorkLists;
