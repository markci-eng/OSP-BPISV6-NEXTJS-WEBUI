"use client";

// WHICH QUEUE THE PAGE IS SERVING, over the field that searches it.
//
// THE DEATH CLAIM'S `StageCard`, one module over, and deliberately the same
// object rather than a cousin of it (user, 2026-09-11). The two conveyors are
// worked by the same people at the same desk, and this slot answers the same
// question on both — what am I working, how much of it is left, and how do I
// find one by name. A second look for one answer is a second thing to learn.
//
// SO IT IS ONE CARD AND NOT TWO CONTROLS. The tabs and the field were a
// stacked pair with a `FieldLabel` over the field, which made them read as two
// separate blocks of furniture; they are one block — a stage row over the
// search that runs against it — and every other block in this rail has an edge
// around it. Same `CARD_SHAPE`, same track, same `SearchBar` as the claim side.
//
// IT REPLACED `StageQuickLinks`, and the difference is the point of the
// collapse: those were four LINKS, because the four queues were four pages. A
// processor who finished a territory had to leave the screen to reach the next
// stage. These are four TABS — the page keeps its shape and changes what it is
// serving, which is what the four queues always were: one process seen at four
// points, not four destinations.
//
// THE COUNT IS WHAT IS LEFT, not what the queue holds — `served` is this
// session's memory of how far down each one it has worked. A server-backed
// queue simply stops returning the answered ones and the two become the same.
//
// EVERY CELL, FIXED, INCLUDING THE EMPTY ONES. Nothing here goes quiet: the
// strip is a map of the process, and somebody who has learned where a queue sits
// should not have to find it again because it happens to be clear this morning.
// That rule came from `StageQuickLinks` and is the one thing about it worth
// keeping.
//
// THREE CELLS AND NOT FOUR (user, 2026-09-15). Approval left this screen — a
// verified billing is decided on `/claims/approvals`, beside the death claims
// waiting on the same supervisor — so the strip runs Process, Verify, Endorse.
// It draws `CONVEYOR_STAGES` rather than `BILLING_STAGES`, which is the gating
// point the note below anticipated; the stage is still in the pipeline and
// billings still pass through it, they are just not worked here. See
// `CONVEYOR_STAGES`.
//
// WHERE THIS DIFFERS FROM THE CLAIM SIDE, and it is only the one thing: the
// claim's card degrades to a heading when a user owns a single stage, because a
// one-segment switch is a pressable-looking control that does nothing. This
// module has no role split at all yet — `UserRole` in `lib/access-control` has
// one `claims` value covering the whole area — so every conveyor stage is drawn.

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { SecondarySmIconButton } from "osp-ui-kit";
import { LuPlus } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SearchBar } from "../../components/search-bar";
import {
  CARD_SHAPE,
  INSET_RADIUS,
  SURFACE_RADIUS,
} from "../../components/section-card";
import {
  CONVEYOR_STAGES,
  type BillingStage,
} from "../service-payables-data";

/**
 * What each queue is called ON THE TAB — the verb, without the "For".
 *
 * SHORTER THAN `BILLING_QUEUE_LABELS`, which is the module's proper name for
 * each queue and is what the rest of the screen says. Four tabs share about
 * 290px here, so "For Endorsement" and its count cannot both fit and the label
 * is what would be cut — and a truncated tab is the one control on the page
 * that cannot say what it does.
 *
 * NOTHING IS LOST BY SHORTENING because the full name is already on screen and
 * always: `BillingHead`'s eyebrow reads the proper label off
 * `BILLING_QUEUE_LABELS` directly over the work. The tab says which way to go,
 * the heading says where you are.
 *
 * The claim side shortens for the same reason — its second stage is "Verify",
 * not "For Verification".
 */
const TAB_LABEL: Record<BillingStage, string> = {
  "for-process": "Process",
  processed: "Verify",
  verified: "Approve",
  approved: "Endorse",
};

function StageTab({
  label,
  count,
  active,
  onSelect,
}: {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onSelect}
      aria-pressed={active}
      align="center"
      justify="center"
      gap={1.5}
      flex="1"
      minW={0}
      py="5px"
      // Inset 3px inside the track — see `INSET_RADIUS`.
      borderRadius={INSET_RADIUS}
      bg={active ? "white" : "transparent"}
      boxShadow={active ? "xs" : undefined}
      cursor="pointer"
      transition="background-color 120ms ease"
      _hover={active ? undefined : { bg: "blackAlpha.50" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Text
        fontSize="xs"
        fontWeight={active ? "700" : "600"}
        color={active ? BRAND_COLORS.darkGreen : "gray.600"}
        truncate
      >
        {label}
      </Text>
      {/* THE COUNT NEVER TRUNCATES — it is one or two digits and it is the
          basis of the choice between tabs, so the label yields first. */}
      <Text
        fontSize="xs"
        fontWeight="600"
        flexShrink={0}
        color={active ? BRAND_COLORS.darkGreen : "gray.400"}
      >
        {count}
      </Text>
    </Flex>
  );
}

export interface StageSwitchProps {
  active: BillingStage;
  /** How many billings are LEFT in each queue. */
  counts: Record<BillingStage, number>;
  onChange: (stage: BillingStage) => void;
  query: string;
  onQueryChange: (value: string) => void;
  /** Running the search — the magnifier, and Enter. */
  onSearch: () => void;
  /**
   * Raise a billing for a franchise that submits on paper — the intake, opened
   * from the end of the tab row.
   *
   * IN THE ROW WITH THE QUEUES, BUT NOT AMONG THEM (user, 2026-09-15: "can we
   * place it in the tabs same row with the process and verify"). It sits OUTSIDE
   * the grey track, which is the distinction the whole arrangement rests on: the
   * track is a choice between queues, and this is an act. A fourth cell inside
   * it would say the intake is a fifth place work can be — and would cost the
   * width the strip was unwrapped to get, ~59px a tab against the ~68 "Process
   * 23" needs. Beside the track it costs about twelve.
   *
   * THE ROW HOLDS THREE CELLS AND A BUTTON, OR FOUR CELLS. Not both — so if a
   * stage ever comes back to this strip, this button is the first thing that has
   * to move.
   *
   * Optional, and the archived screens pass nothing: they are picked through by
   * territory, where a page-level act has nowhere to stand.
   */
  onFranchiseEntry?: () => void;
}

export function StageSwitch({
  active,
  counts,
  onChange,
  query,
  onQueryChange,
  onSearch,
  onFranchiseEntry,
}: StageSwitchProps) {
  return (
    <Box {...CARD_SHAPE} bg="white" px={4} py={3}>
      {/* IN A TRACK, so the three read as one choice rather than as three
          buttons that happen to be adjacent.

          ONE ROW, which the fourth tab is what used to cost. The rail is fluid
          now that the conveyor splits on the viewport — at a 1030px shell it is
          286px — and four tabs left each about 59px against the 68 "Process 23"
          needs, so the labels truncated and the strip read "Proc… Verify Appro…
          Endor…". It wrapped to 2x2 to avoid that. Three tabs have about 95px
          each, which is room enough for the longest of them, so the wrap is
          gone and the block is 22px shorter for it. */}
      <Flex gap={1.5} mb={2.5} align="stretch">
        <SimpleGrid
          columns={3}
          gap={1}
          p="3px"
          flex="1"
          minW={0}
          bg="gray.100"
          borderRadius={SURFACE_RADIUS}
          role="tablist"
          aria-label="Queue"
        >
          {CONVEYOR_STAGES.map((stage) => (
            <StageTab
              key={stage}
              label={TAB_LABEL[stage]}
              count={counts[stage]}
              active={stage === active}
              onSelect={() => onChange(stage)}
            />
          ))}
        </SimpleGrid>

        {/* THE INTAKE, AT THE END OF THE ROW AND OUTSIDE THE TRACK — see
            {@link StageSwitchProps.onFranchiseEntry}, where the placement is
            argued and measured.

            ICON ONLY, AND THAT IS WHAT MAKES IT FIT. A labelled button here
            would take a third of the row; a 28px square takes about twelve
            pixels off each tab, which leaves them clear of the width that
            truncated the four-cell strip. The word is on the `title`, where the
            module's other icon-only controls keep theirs.

            THE KIT'S OWN BUTTON (user, 2026-09-15: "how about used the osp-ui
            for buttons. we should do that"). It was hand-rolled in the module's
            franchise amber and dashed, on the reasoning that an ENTRY is not a
            commit — which said something true in a vocabulary this design system
            does not have. `SecondarySmIconButton` is what the kit means by a
            secondary action, and a secondary action is exactly what this is: an
            act, not the primary one on the screen.

            ONLY THE GEOMETRY IS OVERRIDDEN, and only because the row it sits in
            is 28px: the kit's own height would set the height of the stage card.
            The COLOURS are the kit's untouched, which is the whole point of
            using it — this button is now the same green, the same weight and the
            same border as every other secondary action in the application. */}
        {onFranchiseEntry && (
          <SecondarySmIconButton
            onClick={onFranchiseEntry}
            aria-label="Franchise entry — raise a billing for a franchise that submits on paper"
            title="Franchise entry — raise a billing for a franchise that submits on paper"
            flexShrink={0}
            w="28px"
            minW="28px"
            h="auto"
            alignSelf="stretch"
            // It stands beside the track, so it takes the track's corner.
            borderRadius={SURFACE_RADIUS}
          >
            <LuPlus size={14} />
          </SecondarySmIconButton>
        )}
      </Flex>

      {/* THE AREA'S OWN FIELD, and the magnifier is a button because this
          search GOES somewhere: it opens the queue on what was typed. */}
      <SearchBar
        value={query}
        onChange={onQueryChange}
        label="Search the queue"
        placeholder="Search by billing code, no., or chapel"
        onSearch={onSearch}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearch();
          }
        }}
      />
    </Box>
  );
}

export default StageSwitch;
