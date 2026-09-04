"use client";

// The module's navigation — the four pages this process is worked on, as one
// strip at the head of the rail.
//
// IT SITS WHERE THE DEATH CLAIM DASHBOARD PUTS PLAN HOLDER SEARCH, and that is
// the whole design. A death claim revolves around one person: find the plan
// holder and the process follows, so a search field is the way in and the rail
// leads with it — bare, no heading over it, no figures beside it. Service
// payables does not revolve around one record. It runs across four pages, and
// the way in is choosing which of them you are here to work. So the same slot,
// at the same weight, carries the same kind of thing: not a report, a door.
//
// WHICH IS WHY THESE ARE ICONS AND NOT ROWS. The panel used to be four
// full-width rows, each with its chapel count and peso total under the label,
// under a "Queues" heading. Everything about that said REPORT — and the
// dashboard already reports those figures twice, in the tiles at the top of the
// work column and in the tabs over the queue itself. A third telling put the
// module's navigation in the costume of a summary, so it was read as one and
// the way out of the page went unnoticed. An icon over a label is read as a
// destination before either is read as a word.
//
// WHAT WAS GIVEN UP, deliberately: the per-queue counts. The three stages the
// dashboard is not currently showing had their figures nowhere else. That is a
// real loss and it is the right one — a navigation control that also quotes
// numbers is a report again, and the numbers are one click away on the page
// that owns them.
//
// THESE ARE NOT THE TABS, though they name the same four stages. The tabs
// change what the dashboard is REPORTING and leave the reader here; these
// leave the page entirely, for the workspace where that queue is worked.
//
// IT STANDS ON THE WORKSPACES TOO, not only on the dashboard — see
// `activeStage`. A process that runs across four pages is one a user arrives
// in the middle of, and having got to For Process they should not have to go
// back through the dashboard to reach For Verification. That is what makes
// this a module nav rather than a dashboard panel: it travels with the module.
//
// EVERY QUEUE IS LISTED, including the empty ones — nothing here can go quiet,
// because nothing here is reporting. Four fixed cells are a map of the process,
// and a processor who has learned that For Approval is the third one should not
// have to find it again because it happens to be clear this morning.

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuBadgeCheck, LuInbox, LuSearchCheck, LuSend } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  BILLING_QUEUE_LABELS,
  BILLING_STAGES,
  BILLING_STAGE_ROUTES,
  type BillingStage,
} from "../service-payables-data";

/**
 * The face of each destination — one icon per stage, drawn from what is DONE
 * there rather than from where the billing sits.
 *
 * Read them as the verb of the queue: services land in a tray to be billed, a
 * billing is checked, then passed, then sent on. Keyed by stage and not by
 * queue label, because the two are offset by one — `processed` is the For
 * Verification queue — and an icon picked off the label would end up on the
 * cell before it.
 */
const STAGE_ICONS: Record<BillingStage, ReactNode> = {
  "for-process": <LuInbox size={17} />,
  processed: <LuSearchCheck size={17} />,
  verified: <LuBadgeCheck size={17} />,
  approved: <LuSend size={17} />,
};

/**
 * One destination: its icon, and the queue it opens.
 *
 * The label stays. Four line drawings with nothing under them is a puzzle —
 * "verified" and "approved" are one tick apart as ideas and their icons cannot
 * carry the difference alone — and the point of the strip is that the reader
 * knows where they are going before they press it.
 *
 * `active` is the page the reader is already on. It is drawn, not dropped: a
 * nav that hides the current stop stops being a map of the process and becomes
 * three arbitrary links, and the reader loses the one thing the strip is best
 * at telling them — where in the run of four they are standing. It is NOT a
 * link, because pressing it would reload the page the reader is looking at.
 */
function StageLink({
  stage,
  active,
}: {
  stage: BillingStage;
  active: boolean;
}) {
  const cell = (
    <Flex
      direction="column"
      align="center"
      gap={1.5}
      px={1}
      py={2.5}
      borderRadius="lg"
      cursor={active ? "default" : "pointer"}
      transition="background 0.15s ease"
      _hover={active ? undefined : { bg: "gray.50" }}
    >
      {/* A filled tile rather than a bare glyph. Four loose icons in a row
          read as decoration over the label under them; a filled square reads
          as something to press.

          The current stage inverts it — solid green, white glyph — rather than
          taking an underline or a ring. The tiles are what the eye lands on
          first, so "you are here" belongs on the tile; a marker under the label
          is found after the reader has already read all four. */}
      <Flex
        align="center"
        justify="center"
        boxSize="36px"
        borderRadius="lg"
        flexShrink={0}
        bg={active ? BRAND_COLORS.darkGreen : BRAND_COLORS.successBg}
        color={active ? BRAND_COLORS.white : BRAND_COLORS.darkGreen}
      >
        {STAGE_ICONS[stage]}
      </Flex>

      {/* Wraps rather than truncates. At a quarter of the rail "For
          Verification" does not fit on one line, and "For Verific..." names
          nothing — two short lines cost a few pixels of height and keep the
          word that distinguishes the destination. */}
      <Text
        fontSize="10px"
        fontWeight={active ? "700" : "600"}
        color={active ? BRAND_COLORS.darkGreen : "gray.700"}
        lineHeight="1.25"
        textAlign="center"
      >
        {BILLING_QUEUE_LABELS[stage]}
      </Text>
    </Flex>
  );

  if (active) {
    // `aria-current` and not a disabled control: it is a position in a nav, not
    // an action that has been switched off.
    return (
      <Box flex="1 1 0" minW={0} aria-current="page">
        {cell}
      </Box>
    );
  }

  return (
    <Link
      href={BILLING_STAGE_ROUTES[stage]}
      style={{
        textDecoration: "none",
        display: "block",
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      {cell}
    </Link>
  );
}

export interface StageQuickLinksProps {
  /**
   * The queue the reader is already in, marked rather than linked. Left unset
   * on the dashboard, which is not any of the four.
   */
  activeStage?: BillingStage;
}

export function StageQuickLinks({ activeStage }: StageQuickLinksProps) {
  return (
    // No heading, matching the search field this stands in for. A heading over
    // four labelled icons explains what is already legible, and — whatever it
    // were called — puts a section's frame back around something that is meant
    // to read as one control.
    //
    // CAPPED, and that is what lets one component serve both hosts. In the
    // dashboard rail the cells stretch to exactly fill its 340px; on a
    // workspace, which is as wide as the window, the same four cells would
    // spread until the labels were islands. The cap holds the strip to the
    // shape it has in the rail, so the module's nav is the same object on
    // every page rather than a different one per width.
    //
    // AND CENTRED IN WHATEVER IT IS GIVEN, which is the cap's other half. A
    // capped box left to itself is flush left, so in a host wider than 340 —
    // the stacked layout, where the rail is the full width of the workspace —
    // every pixel of the slack piled up on the right: the strip started hard
    // against the left edge with a third of the panel empty beside it, and read
    // as something that had failed to fill its row rather than as a control of
    // its own size. In the 340px rail the margins are zero and nothing moves.
    //
    // `w="100%"` is not redundant beside the cap. Auto side margins turn OFF a
    // flex item's cross-axis stretch, and the dashboard rail is a flex column —
    // so without a width of its own the box fell back to fit-content there and
    // drew itself 318px wide, six pixels narrower per cell than the same strip
    // on the workspaces. Stated outright, it is min(100%, 340) everywhere,
    // whether the host is a block or a flex child.
    <Box w="100%" maxW="340px" mx="auto">
      <Flex align="stretch" gap={1}>
        {BILLING_STAGES.map((stage) => (
          <StageLink
            key={stage}
            stage={stage}
            active={stage === activeStage}
          />
        ))}
      </Flex>
    </Box>
  );
}

export default StageQuickLinks;
