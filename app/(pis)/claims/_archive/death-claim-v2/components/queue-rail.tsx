"use client";

// THE RIGHT COLUMN — the queue, and the one control that does not belong to it.
//
// This is where a claim is PICKED. It stays on screen for the whole length of
// the work beside it, because picking the next claim is something a processor
// does from wherever they have got to in the current one — a queue you have to
// scroll back up to reach is a queue you leave the work to consult.
//
// IT IS THE SAME QUEUE COMPONENT THE CURRENT DASHBOARD USES — `DeathClaimsTable`
// — in its compact mode, not a second list built to look like it. That matters
// more than the few lines it saves: the search, the Special / Regular / All
// filter, the paging and the card itself are then one implementation, so a
// change to how a claim reads in a queue reaches both screens at once. See the
// `compact` prop for what that mode drops and why.
//
// NOTHING ELSE IS HERE, and that is the design. The column went through three
// rounds of removal — an "open windows" list, a recent-updates feed, and finally
// the plan holder lookup — and each went for the same reason: it was answering a
// question this column is not asked. The dock names its own windows along the
// bottom edge. A feed of movement is not how work is picked. And a search across
// the whole file is the Plan Holder page's job, one sidebar entry away, where
// the search that belongs HERE is the queue's own, inside the table.
//
// What is left is the pick and nothing between the user and it.
//
// HOW IT STAYS ON SCREEN. Three things together, all load-bearing:
//
//   1. `position: sticky` with a `top` offset, so it stops travelling once it
//      reaches the top of the viewport.
//   2. `align-self: start` on the grid item, set by the page. Grid items stretch
//      to the row by default, which would make this as tall as the work column —
//      and a sticky box as tall as its scroll container has nowhere to travel,
//      so it would never stick at all.
//   3. A height bound of one viewport, with the queue scrolling inside itself.
//      Without it a rail taller than the screen would have its lower half
//      permanently below the fold, since scrolling the page no longer moves it.

import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  LuConstruction,
  LuInbox,
  LuSend,
  LuShieldCheck,
} from "react-icons/lu";
import { TileTabs, type TileTabOption } from "../../../components/tile-tabs";
import {
  NatureSelect,
  NATURE_LABEL,
  isNatureBuilt,
  type ClaimNature,
} from "../../../components/nature-select";
import { DeathClaimsTable } from "../../../death-claim/components/DeathClaimsTable";
import type { DeathClaimFilter } from "../../../death-claim/components/DeathClaimsFilter";
import {
  compareByQueueOrder,
  type DeathClaim,
} from "../../../death-claim/death-claims-data";

/**
 * Tallest the rail's card may be — a screenful, less where the page's content
 * starts and a little air at the foot.
 *
 * Pinned, anything past the bottom of the screen cannot be scrolled to, so this
 * is what keeps the whole queue reachable.
 *
 * BACK TO 132 from the 150 it was. That larger figure paid for the nature card
 * and the gap under it, which pushed the stack's top down; the nature is a
 * dropdown on the filter row now and the card is gone, so the 18px it was
 * costing goes back to the queue as another half a row.
 *
 * IT ALSO HAS TO CLEAR THE PINNING LIMIT, and does so with room to spare. A
 * sticky box stays pinned for the whole scroll only while it is no taller than
 * its scroll container less its own top offset. The shell's header takes about
 * 64px of the viewport, so that container is roughly `100vh - 64`, and the
 * offset is 16: anything up to about `100vh - 80` is safe. At `100vh - 132`
 * there is around 50px of margin, so this does not become a number that has to
 * be kept in step with the shell — it only has to stay well under.
 *
 * The other half of that guarantee is where the dock's bottom reserve lives —
 * see `WORK_COLUMN_PADDING_BOTTOM` on the page.
 */
const RAIL_MAX_HEIGHT = "calc(100vh - 132px)";

/** Where the rail comes to rest under the sticky header. */
export const RAIL_TOP = "16px";

export type QueueKey = "process" | "verification" | "endorsement";

/**
 * Which number identifies a claim in each queue. For Process works requests
 * that have no header yet; the two after it work opened claims. The table takes
 * this and shows one number, never falling back to the other.
 *
 * EXPORTED because the work column has to agree with it. The claim strip at the
 * head of that column names the claim you just picked, and naming it by a
 * different number than the card you picked it from reads as having opened
 * something else — which is what it did until this was shared: a For Process
 * card says its request number, and the strip was answering with the claim
 * number for the same record.
 */
export const IDENTIFIER = {
  process: "request",
  verification: "claim",
  endorsement: "claim",
} as const;

export interface QueueRailProps {
  forProcess: DeathClaim[];
  forVerification: DeathClaim[];
  forEndorsement: DeathClaim[];
  /**
   * Which nature's queue this is — see {@link NatureSelect}.
   *
   * The CONTROL is rendered here, on the filter row, but the STATE lives on
   * the page: the work column's empty state names the nature too, and changing
   * it clears the claim being worked. A control can sit in one column while what
   * it governs spans both.
   */
  nature: ClaimNature;
  onNatureChange: (nature: ClaimNature) => void;
  /**
   * Which stage's queue is showing.
   *
   * CONTROLLED FROM THE PAGE, like `nature` above and for the same reason: the
   * summary band at the head of the work column counts THIS queue, so both
   * columns read it. Held here it would have left the band counting one set
   * while the list beside it showed another — the page contradicting itself in
   * two figures a reader can see at once.
   */
  queue: QueueKey;
  onQueueChange: (queue: QueueKey) => void;
  /** The claim currently open in the main column, so the rail can mark it. */
  selectedReference?: string;
  onSelect: (claim: DeathClaim) => void;
}

/**
 * Stands in for the queue on a nature that has no data behind it yet.
 *
 * SAYS SO PLAINLY, rather than showing an empty queue. The two are different
 * facts and a processor has to be able to tell them apart: an empty queue means
 * there is no work today, and it is worth reloading later; this means the module
 * has not been built, and reloading will never change it. An empty list would
 * report the second as the first, and be believed.
 *
 * Same wording as the standalone pages this screen replaces, so the answer does
 * not change depending on which way in you took.
 */
function NatureComingSoon({ nature }: { nature: ClaimNature }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap={3}
      py={12}
      px={4}
    >
      <Box p={3} borderRadius="full" bg="gray.100" color="gray.500">
        <LuConstruction size={22} />
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="700" color="gray.800">
          {NATURE_LABEL[nature]}
        </Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          This module is not available yet. Pick another nature above to work a queue.
        </Text>
      </Box>
    </Flex>
  );
}

export function QueueRail({
  forProcess,
  forVerification,
  forEndorsement,
  nature,
  onNatureChange,
  queue,
  onQueueChange,
  selectedReference,
  onSelect,
}: QueueRailProps) {
  const [filter, setFilter] = useState<DeathClaimFilter>("all");
  const railRef = useRef<HTMLDivElement>(null);

  const queueClaims = useMemo(() => {
    if (queue === "verification") return forVerification;
    if (queue === "endorsement") return forEndorsement;
    return forProcess;
  }, [queue, forProcess, forVerification, forEndorsement]);

  /**
   * THE ORDER THE QUEUE IS WORKED IN: special claims first, and within each
   * group the oldest request first.
   *
   * FIFO is the rule — a claim filed on the 2nd is worked before one filed on
   * the 19th, because the branch that filed first has been waiting longest. The
   * special/regular split sits ABOVE it rather than beside it: a special claim
   * is one filed within seven days of the incident, and the whole reason that
   * category exists is that it is meant to overtake. So the two are a primary
   * and a secondary key, not a single blended score.
   *
   * `localeCompare` on the ISO timestamp is a plain ascending sort — ISO dates
   * order correctly as strings, which is why nothing here parses them into
   * `Date` objects only to subtract them again.
   *
   * COPIED BEFORE SORTING. `sort` mutates, and these arrays come straight from
   * the data module's own memoised selectors — sorting in place would reorder
   * the array every other caller is holding, including the page's `allClaims`.
   *
   * The table below preserves the order of whatever it is given: its filters are
   * all `Array.filter`, which is order-preserving, so this ordering survives a
   * search, a branch pick and a territory tick.
   */
  const claims = useMemo(
    () => [...queueClaims].sort(compareByQueueOrder),
    [queueClaims],
  );

  /**
   * The three queues, named as VERBS.
   *
   * "For Process", "For Verification" and "For Endorsement" are what the claim
   * is waiting for; these are what the person reading the tab is about to DO,
   * which is the useful half in a control whose whole job is picking work. The
   * "For" was carrying no information — every queue on this page is a "for" —
   * and it cost the label the room it needed in a 360px rail, where the three
   * were truncating.
   *
   * It is also how this codebase already reasons about queue names elsewhere:
   * see `StageQuickLinks` in service payables, whose icons are chosen to be
   * "read as the verb of the queue".
   *
   * No counts. The tile is a destination here, not a report — see `count` on
   * `TileTabOption`. The figures for the queue that is OPEN are on the Special /
   * Regular / All filter directly underneath, which is where a number can
   * actually be acted on.
   */
  const options: TileTabOption<QueueKey>[] = [
    { value: "process", label: "Process", Icon: LuInbox },
    { value: "verification", label: "Verify", Icon: LuShieldCheck },
    { value: "endorsement", label: "Endorse", Icon: LuSend },
  ];

  /**
   * The claims the table actually lists.
   *
   * THE TYPE FILTER IS THE CALLER'S JOB. `DeathClaimsTable` owns the branch,
   * territory, benefit and search filters, but not this one — it takes `filter`
   * only to render the control and hand back changes, and lists whatever `data`
   * it is given. Passing the unfiltered queue leaves the dropdown reading
   * "Regular (26)" over a list of all 37, which is what it did until this was
   * added. Same division as `ClaimQueuesSection` on the current dashboard.
   */
  const filtered = useMemo(
    () => (filter === "all" ? claims : claims.filter((c) => c.type === filter)),
    [claims, filter],
  );

  // Counted off the QUEUE and not off `filtered`, so each option keeps stating
  // the size of the set it would select rather than collapsing to the one that
  // is already chosen.
  const counts = useMemo(
    () => ({
      all: claims.length,
      special: claims.filter((c) => c.type === "special").length,
      regular: claims.filter((c) => c.type === "regular").length,
    }),
    [claims],
  );

  // What the three filter controls offer, each taken from the queue that is
  // showing so nothing is listed that cannot match. All three are live in the
  // rail now — the branch dropdown beside the type dropdown, and the territory
  // and benefit groups behind the more-filters button.
  const branchOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.requestingBranch))).sort(),
    [claims],
  );

  const territoryOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.territoryCode))).sort(),
    [claims],
  );

  const benefitOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.benefits))).sort(),
    [claims],
  );

  return (
    // ONE CARD AGAIN. It was a stack of two while the nature had a card of its
    // own at the top; that control is a dropdown on the filter row now, so the
    // column is the queue and nothing else — which is what the note at the top
    // of this file has always said it should be.
    <Flex
      ref={railRef}
      direction="column"
      gap={3}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      p={2.5}
      // The bound, and the overflow that makes it safe. Two columns only — see
      // the note at the top; stacked, this is an ordinary section at its natural
      // height and nothing is pinned.
      maxH={{ xl: RAIL_MAX_HEIGHT }}
      minH={{ xl: 0 }}
      overflow={{ base: "visible", xl: "hidden" }}
    >
      {/* A NATURE WITH NO MODULE BEHIND IT STOPS HERE — everything but the way
          back out of it.

          THE DROPDOWN HAS TO BE RENDERED TWICE, and that is the cost of moving
          it onto the filter row. On a built nature it rides in the table's
          toolbar; the table is not rendered on an unbuilt one, so the only
          control that could change the nature would have gone with it and left
          the user on a dead end with no way back. The card at the top used to
          give that for free, by being outside the branch.

          One component, two placements — not two controls: it holds no state of
          its own, so the pair cannot disagree.

          `all` counts as built: it is every nature there IS data for, which
          today is death. */}
      {!isNatureBuilt(nature) ? (
          <>
            <Box flexShrink={0}>
              <NatureSelect value={nature} onChange={onNatureChange} />
            </Box>
            <NatureComingSoon nature={nature} />
          </>
        ) : (
          <>
          {/* THE QUEUE PICKER, and now the first thing in the rail.
              The plan holder lookup stood above it and is gone: this column is
              for picking work out of a queue, and the queue's own search —
              directly below, inside the table — is the search that belongs to
              it. Looking a person up across the whole file is the Plan Holder
              page's job, and it is one sidebar entry away. */}
          <Box flexShrink={0}>
            <TileTabs<QueueKey>
              compact
              options={options}
              value={queue}
              onChange={onQueueChange}
              label="Claim queues"
            />
          </Box>

          {/* THE QUEUE ITSELF — the shared component, compact. It takes what the
              two fixed blocks above leave and scrolls its cards inside that,
              which is what keeps the search and the tabs still while the list
              moves.

              `minH={0}` is required: without it this flex child refuses to
              shrink below its content and the whole rail grows past its bound. */}
          <Box
            flex={{ xl: "1 1 auto" }}
            minH={{ xl: 0 }}
            display="flex"
            flexDirection="column"
          >
            <DeathClaimsTable
              compact
              data={filtered}
              identifier={IDENTIFIER[queue]}
              // The nature, on the filter row where the branch picker was —
              // see `toolbarSlot`, and `NatureSelect` for why it lives there
              // rather than in a card of its own above the queue.
              toolbarSlot={
                <NatureSelect value={nature} onChange={onNatureChange} />
              }
              // Only in the combined view: filtered to Special, every dot on
              // screen would be the same colour and would be saying nothing.
              showTypeDot={filter === "all"}
              filter={filter}
              onFilterChange={setFilter}
              counts={counts}
              branchOptions={branchOptions}
              territoryOptions={territoryOptions}
              benefitOptions={benefitOptions}
              selectedReference={selectedReference}
              onProcess={onSelect}
              loadKey={queue}
              originRef={railRef}
              flex={{ xl: "1 1 auto" }}
              minH={{ xl: 0 }}
            />
            </Box>
          </>
        )}
    </Flex>
  );
}

export default QueueRail;
