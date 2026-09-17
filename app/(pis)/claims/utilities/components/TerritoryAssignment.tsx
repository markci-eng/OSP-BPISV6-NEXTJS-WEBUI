"use client";

// Assigning territories to staff: who, what they hold, and what that leaves
// exposed.
//
// TWO PANES: pick a person, order their territories. The screen does one thing
// and reads left to right.
//
// IT HELD A THIRD — a coverage panel reporting which territories nobody was
// holding — and that is gone at the user's direction (2026-09-14). Worth
// recording rather than quietly forgetting, because the signal went with it: an
// uncovered territory is invisible from any single ladder, so nothing on this
// screen now reports one. If it comes back it should be a strip above the two
// panes rather than a column, which is what made it expensive here.
//
// THE TEAM IS A SWITCH, NOT A SECOND SCREEN — but it swaps more than the
// numbers. Death claims and service payables are fed by different records AND
// worked by different people, so changing it changes the roster underneath: the
// four on the claim team and the three on payables are not the same staff, and
// nobody appears on both. The screen keeps its shape; everything in it is the
// other team's.

import { useState } from "react";
import { Box, Grid } from "@chakra-ui/react";
import { Users } from "lucide-react";

import { SectionTitle } from "../../components/section-title";
import { SectionCard } from "../../components/section-card";
import { MenuSelect } from "../../components/menu-select";
import { ScrollFade } from "../../components/scroll-fade";
import { SegmentedTabs } from "../../components/segmented-tabs";
import {
  describeNextPull,
  getStaffStandings,
  getTerritoryStandings,
} from "../territory-assignment-data";
import {
  addTerritory,
  getHolders,
  getLadder,
  getStaff,
  moveTerritory,
  removeTerritory,
  useTerritoryAssignmentStore,
  WORK_TYPES,
  type WorkType,
} from "../territory-assignment-store";
import { AssignmentList, type AssignmentListItem } from "./AssignmentList";
import { TerritoryLadder } from "./TerritoryLadder";
import { TerritoryHolders } from "./TerritoryHolders";

export function TerritoryAssignment() {
  // Subscribes this whole view to assignment writes. Everything below is read
  // fresh on each render, the way the payables workspace reads its store.
  useTerritoryAssignmentStore();

  const [workType, setWorkType] = useState<WorkType>("SERVICE_PAYABLE");

  /**
   * Which end of the assignment is being held still while the other is edited.
   *
   * The same rows either way — `processor_territory` has two columns and this
   * chooses which one you browse by. A supervisor arrives with one of two
   * questions ("Beliesta is back from leave, give her Bicol" / "Central Luzon
   * is backing up, who is on it?") and answering the second through the staff
   * list means opening people one at a time until you find them.
   */
  const [side, setSide] = useState<"staff" | "territory">("staff");

  /**
   * One selection per side, not one shared.
   *
   * Switching tabs to check who covers a territory and back should return to
   * the person you were editing — a single slot would drop them, and the pane
   * on the right is mid-edit.
   */
  const [selected, setSelected] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("");

  const roster = getStaff(workType);
  const staff = getStaffStandings(workType);
  const standings = getTerritoryStandings(workType);

  /**
   * DERIVED, NOT HELD, because the roster changes under it. Switching Team
   * swaps the whole staff list — the death claim team and the payables team are
   * different people — and a name held in state would survive that switch and
   * leave the right-hand pane editing somebody who is not on the list beside
   * it. Falling back to the first of the new roster keeps the two panes talking
   * about the same person at all times. Same reason the territory below is
   * derived.
   */
  const processor = roster.includes(selected) ? selected : (roster[0] ?? "");
  const ladder = getLadder(processor, workType);

  const territory =
    standings.find((s) => s.territoryCode === selectedTerritory) ?? standings[0];
  const holders = territory ? getHolders(territory.territoryCode, workType) : [];
  const held = new Set(holders.map((h) => h.processor));
  const availableStaff = roster.filter((p) => !held.has(p));

  const staffItems: AssignmentListItem[] = staff.map((s) => ({
    key: s.processor,
    title: s.processor,
    subtitle: s.primary ?? "No territory",
    subtitleAlert: s.ladderLength === 0,
    value: s.ladderLength,
    valueLabel: s.ladderLength === 1 ? "TERRITORY" : "TERRITORIES",
    valueAlert: s.ladderLength === 0,
  }));

  const territoryItems: AssignmentListItem[] = standings.map((s) => {
    const assigned = s.primaries.length + s.fallbacks.length;
    const uncovered = s.primaries.length === 0 && !s.isDormant;

    return {
      key: s.territoryCode,
      title: s.description,
      subtitle: s.primaries.length
        ? s.primaries.join(", ")
        : s.isDormant
          ? "Dormant — no primary needed"
          : "No primary",
      subtitleAlert: uncovered,
      value: assigned,
      valueLabel: assigned === 1 ? "ASSIGNED" : "ASSIGNED",
      valueAlert: uncovered && assigned === 0,
    };
  });

  return (
    <Box>
      {/* WIDTH capped rather than left to fill the page, but the cap STEPS with
          the display instead of holding at one figure. Left to fill, two columns
          on a wide monitor would stretch a ladder row to the width of the screen,
          putting its rank badge and its buttons a hand's width apart — the row is
          a short label and four controls, and it reads as one object only while
          it stays about this wide. Held at 4xl, the same monitor leaves half the
          glass empty beside a screen that has two lists to show.

          So: 4xl to `xl`, then 6xl, then 7xl on the widest. The ladder row is
          what sets the ceiling — past roughly 640px it stops reading as one
          object — and the ratio below shifts to 1fr 1fr at `xl` so the extra
          width is SPLIT rather than handed to the ladder. That keeps the right
          column near where it already sits (~500px → ~560px → ~620px) while the
          staff picker, which is a two-line row with a number on the end and has
          room to spare, takes the rest.

          HEIGHT capped to one screenful, which is what keeps the left column on
          screen (user, 2026-09-14: "the left section should always be shown no
          matter how long the page"). Sticky alone could not promise that: a
          sticky column is still trapped by its container, so the last screenful
          of a long ladder pushes it back up and out of view. Bounding the grid
          instead means the PAGE never scrolls — the ladder scrolls inside its
          own column — and a column that is never scrolled past is a column that
          is always there.

          THE TWO NUMBERS ARE ONE DECISION: end 32px above the foot of the
          display, and do not scroll the page to do it.

          179px of chrome sits above this — 76px of app header over the
          scrollport, 103px of page title and description inside it — so a grid
          reaching to 32px off the bottom is `100vh - 211px`. Under it the
          layout keeps 96px of padding, a bottom-nav allowance that is dead
          space on a page which no longer scrolls; `-64px` of margin takes back
          all but the 32px gutter. Change the gutter and both numbers move
          together: `mb = gutter - 96`.

          If a narrow window wraps the description, the figure is low by a line
          and the page gains a little scroll of its own. That is the direction to
          be wrong in; clipping is the other one. */}
      <Grid
        templateColumns={{ base: "1fr", md: "0.85fr 1.15fr", xl: "1fr 1fr" }}
        gap={{ base: 6, md: 6 }}
        maxW={{ base: "4xl", xl: "6xl", "2xl": "7xl" }}
        // A DEFINITE HEIGHT AND A BOUNDED ROW, not `maxH` alone. A grid sizes
        // its rows to their content, and `max-height` clips the box without
        // touching the track — so with `maxH` the columns stayed their full
        // height and simply overflowed a 300px grid. `minmax(0, 1fr)` is what
        // lets the row be the container's height instead of its content's, and
        // `minH={0}` on each column is what lets them shrink into it.
        h={{ md: "calc(100vh - 211px)" }}
        mb={{ md: "-64px" }}
        gridTemplateRows={{ md: "minmax(0, 1fr)" }}
        overflow={{ base: "visible", md: "hidden" }}
      >
        {/* ── Who ──
            IN A CARD, AND THE LADDER BESIDE IT IS NOT. The two panes are not the
            same kind of thing: this one is a PICKER — a bounded list you choose a
            name from, which ends where the card ends — and the one beside it is
            the surface being edited. Giving both an edge would say they are
            peers and leave the eye nowhere to land.

            ALWAYS ON SCREEN, because the grid above it is bounded to one
            screenful and this column never outgrows it — no sticky, no travel,
            nothing to scroll past. Who you are editing, and which team they are
            on, is true of the whole ladder rather than of whatever part of it
            happens to be in view.

            THE COLUMN ITSELF NEVER SCROLLS; the staff list inside it does. A
            column taller than its share puts its own foot somewhere that can
            never be reached, and a branch with forty staff would do exactly
            that. Same answer the plan holder rail gives: height is the screen's,
            and the one list with an unbounded number of rows scrolls inside its
            share. */}
        <Box
          minW={0}
          minH={0}
          overflow={{ base: "visible", md: "hidden" }}
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <MenuSelect
            label="Team"
            value={workType}
            options={WORK_TYPES}
            onChange={setWorkType}
            icon={<Users size={18} />}
            width="full"
          />

          {/* `SectionCard` draws a card and takes no layout props, so the card
              is made a shrinkable flex column from out here — the same technique
              `KitCardShape` uses in that file to reshape a card it did not
              draw. Without it the card keeps its natural height and the list
              inside has nothing to scroll against. */}
          {/* `0 1 auto`, NOT `1 1 auto`: the card may SHRINK to fit the pinned
              column but must never GROW to fill it. Five staff should be a short
              card, not a screen-high box with its list stranded at the top. */}
          <Box
            flex="0 1 auto"
            minH={0}
            display="flex"
            flexDirection="column"
            css={{
              "& > div": {
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                flex: "0 1 auto",
              },
            }}
          >
            <SectionCard>
              {/* THE TABS ARE THE HEADING — a card titled "Staff" whose first
                  tab is also "Staff" names the same thing twice. Whichever is
                  live reads as the title of the list under it.

                  The conveyor's switch, via `SegmentedTabs`: the two screens are
                  worked by the same people, and a tab strip that looks like the
                  one next door is one less thing to learn. It sits directly over
                  the search the way the stage switch does, because the two are
                  one block — which list, then the field that narrows it. */}
              <Box mb={2.5}>
                <SegmentedTabs
                  label="Assign by"
                  value={side}
                  onChange={setSide}
                  options={[
                    { value: "staff", label: "Staff", count: staff.length },
                    {
                      value: "territory",
                      label: "Territory",
                      count: standings.length,
                    },
                  ]}
                />
              </Box>

              {side === "staff" ? (
                <AssignmentList
                  items={staffItems}
                  selected={processor}
                  onSelect={setSelected}
                  placeholder="Search staff…"
                  label="Search staff"
                />
              ) : (
                <AssignmentList
                  items={territoryItems}
                  selected={territory?.territoryCode ?? ""}
                  onSelect={setSelectedTerritory}
                  placeholder="Search territories…"
                  label="Search territories"
                />
              )}
            </SectionCard>
          </Box>
        </Box>

        {/* ── What they hold ──
            THE ONE PART OF THE PAGE THAT SCROLLS. The ladder is the long half —
            thirteen ranks at most, plus the picker and the preview under them —
            so it takes the scrolling and leaves the staff column still.

            `ScrollFade` rather than `overflowY`, which is how the death claim
            and payables queues scroll: no bar, and the edge it continues past
            fades instead. Below `md` the grid has no height, so there is nothing
            to overflow and it neither scrolls nor fades. */}
        <ScrollFade minW={0} minH={0}>
          {side === "staff" ? (
            <>
              <PaneHeading
                title={processor || "No staff"}
                subtitle="Tried in order — rank 1 is the primary"
              />
              <TerritoryLadder
                processor={processor}
                ladder={ladder}
                standings={standings}
                preview={describeNextPull(processor, workType)}
                onAdd={(code) => addTerritory(processor, workType, code)}
                onRemove={(code) => removeTerritory(processor, workType, code)}
                onMove={(code, dir) =>
                  moveTerritory(processor, workType, code, dir)
                }
              />
            </>
          ) : (
            territory && (
              <>
                <PaneHeading
                  title={territory.description}
                  subtitle="Who covers it, and at what rank"
                />
                <TerritoryHolders
                  territory={territory}
                  holders={holders}
                  available={availableStaff}
                  onAdd={(processor) =>
                    addTerritory(processor, workType, territory.territoryCode)
                  }
                  onRemove={(processor) =>
                    removeTerritory(processor, workType, territory.territoryCode)
                  }
                />
              </>
            )
          )}
        </ScrollFade>
      </Grid>
    </Box>
  );
}

/**
 * The heading of the right-hand pane: who (or what) is being edited, in a card.
 *
 * IN A CARD BECAUSE OF WHAT IS UNDER IT (user, 2026-09-14). Bare, the name sat
 * directly on the page background with a stack of bordered rows beneath it, and
 * read as a caption that had come loose from the first row rather than as the
 * subject of the whole column. The column already ends in a card — "Add a
 * territory" — so the heading in one closes the shape: card, the ranks, card.
 *
 * `SectionTitle` INSIDE IT, not a heading of its own — the claims area's
 * headings all come from that component and this is not the place to fork the
 * typography. All the card adds is the edge.
 *
 * NOTHING AT THE RIGHT OF THE ROW. A second fact was set there briefly — the
 * person's job title on the staff side, the territory's code on the other — and
 * taken out again at the user's direction (2026-09-14). The name is the whole
 * subject of the column; an attribute beside it competed with it for the row
 * and, on a phone, pushed the subtitle onto two lines to do it.
 */
function PaneHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Box mb={3}>
      <SectionCard>
        {/* `SectionTitle` owns a 12px bottom margin so a section can drop it
            straight above its content. Here there IS no content under it — the
            card's own padding is the gap — so the margin is cancelled from out
            here rather than made a prop on a heading shared with six other
            screens. */}
        <Box mb={-3}>
          <SectionTitle title={title} subtitle={subtitle} compact />
        </Box>
      </SectionCard>
    </Box>
  );
}

export default TerritoryAssignment;
