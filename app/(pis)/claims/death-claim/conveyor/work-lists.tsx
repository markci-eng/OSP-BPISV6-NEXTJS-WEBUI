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

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_SHAPE } from "../../components/section-card";

/** Which list is open over the page, or `null` for none. */
export type WorkListKey =
  | "history"
  | "approved"
  | "denied"
  | "compliance"
  | "processed";

interface WorkListRow {
  key: WorkListKey;
  label: string;
  /** Names the dialog, and says what the list is when the label is terse. */
  title: string;
}

/**
 * Widest first, and then in two groups that are not the same kind of fact.
 *
 * HISTORY LEADS because it is the one that always has an answer: every claim is
 * in it, including the ones still waiting.
 *
 * APPROVED AND DENIED ARE READ OFF THE RECORD — `phase`, which is the status
 * stored on the claim request. They are a SUPERVISOR'S verdicts, not a
 * processor's: see the note on `ClaimOutcome`, which is explicit that what a
 * processor decides is which of the two a claim is sent FOR. So these two lists
 * are full from the moment the page loads, and nothing this screen does adds to
 * them — approving here moves a claim into "Processed", not into "Approved".
 *
 * THE LAST TWO ARE THIS SESSION'S. They come from the store rather than the
 * record, so they start empty on every reload and fill as claims are worked.
 *
 * PROCESSED IS NOT "DECIDED". It was, briefly, and that was too narrow: a claim
 * sent back to a branch for compliance has been worked just as hard as one
 * approved, and a processor looking for what they did this morning would not
 * have found it. It is every claim a processor has touched — decided, returned,
 * verified or endorsed — which makes "Returned for compliance" above it a subset
 * rather than a sibling. That overlap is deliberate: the narrow list is the one
 * with something still owed on it, and it earns its own row for that reason.
 * See `hasProcessorActivity`.
 */
export const WORK_LISTS: WorkListRow[] = [
  { key: "history", label: "All claims", title: "All claims" },
  { key: "approved", label: "Approved", title: "Approved claims" },
  { key: "denied", label: "Denied", title: "Denied claims" },
  {
    key: "compliance",
    label: "Returned for compliance",
    title: "Claims returned for compliance",
  },
  { key: "processed", label: "Processed", title: "Processed claims" },
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
        fontSize="xs"
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
        <Text fontSize="xs" fontWeight="600">
          {count}
        </Text>
        <LuChevronRight size={14} />
      </Flex>
    </Flex>
  );
}

export function WorkLists({
  counts,
  period,
  onOpen,
}: {
  counts: Record<WorkListKey, number>;
  /** What the numbers are totals OF — "Filed in 2026". See {@link claimYearLabel}. */
  period: string;
  onOpen: (key: WorkListKey) => void;
}) {
  return (
    // The shared shape, not a restatement of it — see `CARD_SHAPE`.
    <Box {...CARD_SHAPE} bg="white" px={4} py={3}>
      {/* THE PERIOD, STATED ONCE, ABOVE EVERY NUMBER IT APPLIES TO.
          A count with no period invites exactly one question — since when? —
          and a total nobody can reconcile is worse than no total, because it
          looks authoritative.
          ONE HEADING AGAIN. There were briefly two, because two of these rows
          counted only what the session had done and could not honestly sit
          under a filed year. They are all-time now — see `processed` in the
          page — so one period covers the card and the second heading is gone
          with the split it described.
          The year is read-only here: it is CHANGED inside any of the lists,
          beside the nature filter, and lands back here. A control in a card of
          five rows would be its largest element. */}
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={2}
      >
        {period}
      </Text>

      {WORK_LISTS.map((list, index) => (
        <Row
          key={list.key}
          label={list.label}
          count={counts[list.key]}
          first={index === 0}
          onClick={() => onOpen(list.key)}
        />
      ))}
    </Box>
  );
}

export default WorkLists;
