"use client";

// ARCHIVED — no route. This was `/claims/death-claim-v2` while the three
// designs were being compared; the Conveyor won and took the death-claim route.
// The folder above starts with an underscore, which is how Next is told to serve
// nothing for this `page.tsx`. See `_archive/README.md`.
//
// The death-claim dashboard, redesigned.
//
// THE INVERSION. The current dashboard gives its widest column to the LIST and
// opens a claim somewhere else, so the thing being worked is never the thing on
// screen. Here the list is a pinned rail on the right and the CLAIM takes the
// main column: pick on the right, work on the left, and the queue never leaves.
//
// THE DOCK. A second and third claim can be put in floating windows along the
// bottom edge — the Gmail compose / Messenger thread pattern — so two claims can
// be read at once without either of them losing the main column. See
// `FloatingDock`.
//
// It stands BESIDE `/claims/death-claim` rather than replacing it, so the
// two can be worked side by side until this one wins. The queue in the rail is
// that page's own `DeathClaimsTable`, not a copy of it.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { useClaimStore } from "../../claim-store";
import { scrollParentOf, visibleBandOf } from "../../components/scroll-parent";
import {
  getForEndorsementClaims,
  getForProcessClaims,
  getForVerificationClaims,
  type DeathClaim,
} from "../../death-claim/death-claims-data";
import { FloatingDock, FloatingDockProvider } from "./components/floating-dock";
import { PendingClaimsSummary } from "../../death-claim/components/PendingClaimsSummary";
import { ClaimWindowBody, CLAIM_WINDOW_KIND } from "./components/claim-window";
import { ClaimDetailPanel } from "./components/claim-detail-panel";
// The nature's CONTROL is a dropdown on the rail's filter row; only its state
// lives here, because the work column reads it too. See `nature` below.
import { isNatureBuilt, type ClaimNature } from "../../components/nature-select";
import {
  IDENTIFIER,
  QueueRail,
  RAIL_TOP,
  type QueueKey,
} from "./components/queue-rail";

/**
 * Room under the work column so the dock's title bars never cover its last row.
 *
 * A docked window is ~44px of title bar at rest. On a phone the shell's bottom
 * navigation takes its own 62px underneath, which is why the two are added
 * rather than one replacing the other.
 *
 * IT SITS ON THE WORK COLUMN, NOT ON `Page.Root`, and that is load-bearing for
 * the rail beside it rather than a matter of taste.
 *
 * A sticky element can only stay pinned while its containing block is still
 * passing the viewport — here, the grid ROW. Put this reserve on the page and it
 * lands OUTSIDE that row: the page then scrolls 72px further than the row
 * extends, so for the last stretch of the scroll the rail has run out of
 * containing block and drifts upward out of view. It was doing exactly that,
 * unpinning in the final couple of pixels, which is invisible until the claim is
 * long enough to make it obvious.
 *
 * Moved onto the column, the reserve becomes part of the row. The row now ends
 * where the scrollable content ends, so the rail stays pinned for the whole
 * scroll — and it does so with room to spare rather than by a margin that has to
 * be kept in step: see the arithmetic over `RAIL_MAX_HEIGHT`.
 */
const WORK_COLUMN_PADDING_BOTTOM = {
  base: "calc(62px + 56px + env(safe-area-inset-bottom, 0px))",
  lg: "72px",
} as const;

function DeathClaimV2Content() {
  // Creating a claim moves it between queues, so all three are re-read whenever
  // the claim store changes.
  const storeVersion = useClaimStore();

  const forProcess = useMemo(
    () => getForProcessClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );
  const forVerification = useMemo(
    () => getForVerificationClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );
  const forEndorsement = useMemo(
    () => getForEndorsementClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  /**
   * The claim in the main column, held by REFERENCE rather than as the record.
   *
   * A stored record would be a snapshot: work the claim and the queues rebuild,
   * but the main column would keep painting the copy taken when it was picked.
   * The reference is resolved against the current queues on every render, so the
   * panel is always showing live data — and a claim that leaves the board
   * resolves to `undefined`, which the panel has an empty state for.
   */
  const [selected, setSelected] = useState<string | undefined>();

  /**
   * Which nature the page is about — the three routes this screen replaces, or
   * all of them. See {@link NatureSelect}.
   *
   * `all` is the default: a processor opening the page has not yet decided which
   * nature they are working, and every claim on the board is one they might.
   *
   * Held here rather than in the rail because it governs BOTH columns: the queue
   * offers a different set of claims and the work column is about a different
   * kind of claim.
   *
   * Local state, not a URL parameter. That is the one thing consolidating three
   * routes into one page costs — a nature can no longer be linked to or
   * bookmarked — and it is worth saying out loud rather than discovering later.
   * Moving it to `?nature=woi` is a small change when it is wanted.
   */
  const [nature, setNature] = useState<ClaimNature>("all");

  /**
   * Which stage's queue the rail is showing.
   *
   * The CONTROL is in the rail — same arrangement as `nature` — but the state is
   * here because the summary band at the head of the work column counts this
   * queue. Two columns reading one value is the whole reason it is lifted; left
   * inside the rail, the band would have had to guess.
   */
  const [queue, setQueue] = useState<QueueKey>("process");

  /**
   * What the band above the claim reports: the size of the queue on show, split
   * by type.
   *
   * SCOPED TO THE QUEUE, not to the whole board. The alternative — one running
   * total across all three — puts a figure on screen that nothing else on the
   * page agrees with: the rail's own type filter directly beside it counts the
   * queue it is filtering, so a board-wide 37 over a list of 13 reads as one of
   * the two being wrong. Switching stages moves both numbers together instead.
   *
   * It also gives the stage tabs' counts a home. Those tiles used to carry their
   * own figures and no longer do — a tab is a destination, not a report — and
   * this is where the figure it used to show can actually be read.
   */
  const counts = useMemo(() => {
    const claims =
      queue === "verification"
        ? forVerification
        : queue === "endorsement"
          ? forEndorsement
          : forProcess;

    return {
      all: claims.length,
      special: claims.filter((c) => c.type === "special").length,
      regular: claims.filter((c) => c.type === "regular").length,
    };
  }, [queue, forProcess, forVerification, forEndorsement]);

  const allClaims = useMemo(
    () => [...forProcess, ...forVerification, ...forEndorsement],
    [forProcess, forVerification, forEndorsement],
  );

  const byReference = useMemo(
    () => new Map(allClaims.map((c) => [c.reference, c])),
    [allClaims],
  );

  const selectedClaim = selected ? byReference.get(selected) : undefined;

  /**
   * The work column, so the dock can confine its windows to it.
   *
   * The queue is on the right now, and a window docked to the viewport's
   * bottom-right would cover it — hiding the control you pick the next claim
   * from, which is what a comparison is FOR. See `boundsRef` on the dock.
   */
  const workColumnRef = useRef<HTMLDivElement>(null);

  /**
   * Bring the claim into view when picking it did not already put it there.
   *
   * STACKED ONLY, in effect, and without asking what the width is. In two
   * columns the work column is beside the queue and always on screen, so the
   * test below is false and nothing moves. Stacked, the detail sits BELOW the
   * queue — tapping a card would otherwise change something off-screen, which
   * reads as the tap having done nothing.
   *
   * Written as "scroll it if it is not visible" rather than as a breakpoint
   * check, so it cannot fall out of step with the `xl` the grid actually
   * switches on.
   *
   * `scrollBy` and not `scrollIntoView`: the shell scrolls an inner element
   * rather than the document, and `scrollIntoView`'s smooth form silently does
   * nothing inside it. Same finding as `scrollDetailIntoView` in service
   * payables, and the same two helpers underneath.
   */
  useEffect(() => {
    const el = workColumnRef.current;
    if (!el || !selected) return;
    const scroller = scrollParentOf(el);
    const band = visibleBandOf(scroller);
    const top = el.getBoundingClientRect().top;
    if (top <= band.bottom - 80) return;
    scroller.scrollBy({ top: top - band.top - 16 });
  }, [selected]);

  return (
    // A FRAGMENT, and the dock is Root's SIBLING — not its child. `Page.Root`
    // partitions its children by slot: it keeps `Page.ToolContent` and
    // `Page.MainContent` and discards everything else silently, with no error
    // and no warning. A `FloatingDock` inside it would simply never render.
    <>
      {/* `headerButton="menu"`: a sidebar destination has no parent to go back
          to, so its header carries the menu rather than a back chevron.

          No `overflowY`, deliberately: passing it at all switches the shell into
          a full-height flex column that does not scroll — and a sticky rail
          needs the PAGE to be what scrolls, or it has nothing to hold still
          against. */}
      <Page.Root
        title="Death Claims"
        headerButton="menu"
        // THE SHELL'S OWN 96px RESERVE, HANDED BACK. `Page.Root` pads every page
        // by 96px for the mobile bottom navigation unless it is given a value,
        // and that padding lands OUTSIDE the grid row. A sticky element can only
        // stay pinned while its containing block — the row — is still passing
        // the viewport, so those 96 pixels were 96 pixels of scrolling with
        // nothing left to pin against: the rail drifted up and out of view over
        // the last stretch of every long claim.
        //
        // Zero, not a smaller number, because the reserve has moved rather than
        // gone: the work column carries it now, inside the row, where it does
        // the same job for the dock without costing the rail its anchor. See
        // `WORK_COLUMN_PADDING_BOTTOM`.
        paddingBottom={0}
      >
        <Page.MainContent>
          <Page.Row>
            <Grid
              // The work takes the larger share; the rail is sized to a claim
              // card and no wider. Below `xl` there is only one column and the
              // rail becomes a section above the work.
              templateColumns={{
                base: "1fr",
                xl: "minmax(0, 1fr) 360px",
                "2xl": "minmax(0, 1fr) 380px",
              }}
              gap={{ base: 5, xl: 6 }}
              // THE LINE THE PINNING HANGS ON. Grid items stretch to the row by
              // default, which would make the rail as tall as the work column —
              // and a sticky box the height of its scroll container never
              // travels. See `QueueRail`.
              alignItems="start"
            >
              {/* Written FIRST so that stacked — every phone, and every window
                  under `xl` — the order is the mobile one: pick the claim, then
                  read it. `order` swaps it once there are two columns, where the
                  work belongs on the left. */}
              <GridItem
                order={{ base: 0, xl: 1 }}
                minW={0}
                alignSelf="start"
                position={{ xl: "sticky" }}
                top={{ xl: RAIL_TOP }}
              >
                <QueueRail
                  forProcess={forProcess}
                  forVerification={forVerification}
                  forEndorsement={forEndorsement}
                  nature={nature}
                  // Changing the nature clears the claim being worked: that
                  // claim belongs to the nature it was picked from, and leaving
                  // a death claim on screen under the Dismemberment tab would
                  // be the page contradicting its own rail.
                  onNatureChange={(next: ClaimNature) => {
                    setNature(next);
                    setSelected(undefined);
                  }}
                  queue={queue}
                  onQueueChange={setQueue}
                  selectedReference={selected}
                  onSelect={(claim: DeathClaim) => setSelected(claim.reference)}
                />
              </GridItem>

              <GridItem
                ref={workColumnRef}
                order={{ base: 1, xl: 0 }}
                minW={0}
                // The dock's reserve, and the thing that keeps the rail pinned
                // for the whole scroll — see `WORK_COLUMN_PADDING_BOTTOM`.
                pb={WORK_COLUMN_PADDING_BOTTOM}
              >
                {/* THE FIGURES, THEN THE WORK — the same opening the current
                    dashboard's main column has, in its smaller build. Three
                    tiles across one row, no rule under the heading, and the
                    heading naming the queue they count.

                    NO HEADING. The band named the queue it was counting — "For
                    Process" over the figures — and it was one label too many:
                    the stage is already chosen and shown in the rail beside it,
                    and the three tiles carry their own names. What is left is
                    the figures, which is all this was ever for.

                    `xl` AND NO LOWER, for two reasons that happen to agree.
                    It is the top of a COLUMN, and `xl` is where there is a
                    second column for it to be the top of — the same line the
                    current dashboard draws for its own band. Below that the
                    layout is one stack in mobile order, the queue first and the
                    claim under it, so this would land between them: a summary
                    of the list you have just scrolled past, in the way of the
                    claim you tapped to reach. It would also take the landing
                    spot — picking a claim scrolls this column into view, and
                    what should arrive under the thumb is the claim.

                    Only where there IS a queue. On a nature with no module the
                    rail says so rather than showing a list, and three zeroes
                    over that message would be reporting an empty queue, which
                    is a different fact — see `NatureComingSoon`. `all` counts,
                    since it is every nature there is data for. */}
                {isNatureBuilt(nature) && (
                  <Box display={{ base: "none", xl: "block" }} mb={4}>
                    <PendingClaimsSummary
                      counts={counts}
                      title={null}
                      subtitle={null}
                      singleRow
                      dense
                    />
                  </Box>
                )}

                <ClaimDetailPanel
                  claim={selectedClaim}
                  nature={nature}
                  // The same number the card in the rail is showing — the two
                  // read off one map so they cannot drift.
                  identifier={IDENTIFIER[queue]}
                  stage={queue}
                />
              </GridItem>
            </Grid>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* THE DOCK — always mounted, and OUTSIDE Root for the reason above.
          It is `pointer-events: none` and only its windows take clicks, so an
          empty dock cannot swallow clicks along the bottom of the page. */}
      <FloatingDock
        boundsRef={workColumnRef}
        renderBody={(w) =>
          w.kind === CLAIM_WINDOW_KIND ? (
            <ClaimWindowBody claim={byReference.get(w.payload)} />
          ) : null
        }
      />
    </>
  );
}

export default function DeathClaimV2Page() {
  // The provider wraps the page rather than living inside it: the detail panel
  // and the dock are siblings that read the same window list.
  return (
    <FloatingDockProvider>
      <DeathClaimV2Content />
    </FloatingDockProvider>
  );
}
