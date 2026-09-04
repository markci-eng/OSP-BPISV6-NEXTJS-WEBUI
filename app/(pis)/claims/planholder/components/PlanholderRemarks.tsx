"use client";

import { useState } from "react";
import { Flex, Textarea, VStack } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import {
  BottomQuickActions,
  PrimaryMdButton,
  SecondaryMdButton,
  TertiarySmButton,
} from "osp-ui-kit";
import { RemarksPanel } from "../../components/remarks-panel";

const ALL_SECTIONS = [
  {
    key: "remarks",
    label: "Remarks",
    subtitle: "Remarks on record",
    empty: "No remarks on file.",
  },
  {
    key: "notes",
    label: "Notes",
    subtitle: "Internal notes on record",
    empty: "No notes on file.",
  },
] as const;

/**
 * Remarks and Notes — read-only text panels, each one its own section under its
 * own heading. They used to share a swipeable tab strip; stacking them means
 * both are readable at a glance without a pager, and they line up with every
 * other section on the page.
 *
 * EACH SECTION IS `RemarksPanel` NOW (2026-08-27), the claims area's own, and
 * this file is what is left once that is taken out: which two sections there
 * are, and the sheet that writes a note. The heading and the bordered read-only
 * panel were built here first — every other screen that wanted a trail has been
 * copying them out of this file since, and the service record had two such
 * copies going in different directions before they were pulled together. This
 * component is now one of the callers rather than the original.
 *
 * NOTHING ABOUT THE SECTIONS CHANGED in the move, which was checked rather than
 * assumed: the panel is `SectionTitle` over the same textarea with the same
 * values, and the heading here was `PlanholderSectionHeader` — which IS
 * `SectionTitle`, plus a count pill neither of these sections passes. Measured
 * before and after: same 5 rows, same 114px, same #fafafa on the same #e4e4e7.
 *
 * WHAT THIS STILL OWNS is the pair. Remarks and Notes are rendered together
 * because on a CLAIM they belong to the same thing — the claim's own trail and
 * the processor's notes on it. Where the two belong to different things they
 * cannot be one block, which is why the service record reaches for the panel
 * directly and puts its remarks under the plan holder and its notes below the
 * form.
 *
 * Notes takes an "Add Note" button in its heading when the caller passes
 * `onAddNote` — writing a note is the caller's business, since only it knows
 * what the note is being written against.
 *
 * Two contexts share this component:
 *   - Claim request drawer → both Remarks and Notes (per claim).
 *   - Plan holder profile   → Remarks only (`showNotes={false}`).
 */
export function PlanholderRemarks({
  remarks = "",
  notes = "",
  showNotes = true,
  onAddNote,
}: {
  remarks?: string;
  notes?: string;
  /** Show the Notes section below Remarks. When false, Remarks only. */
  showNotes?: boolean;
  /** Write a note. Omit it and the Notes heading carries no button. */
  onAddNote?: (text: string) => void;
}) {
  const values: Record<string, string> = { remarks, notes };
  const sections = showNotes ? ALL_SECTIONS : ALL_SECTIONS.slice(0, 1);

  // The add-note form, and its in-progress text.
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const closeAdd = () => {
    setAddOpen(false);
    setDraft("");
  };

  const saveNote = () => {
    const note = draft.trim();
    if (!note) return;
    onAddNote?.(note);
    closeAdd();
  };

  return (
    // Same gap the stacked sections use elsewhere, so the two read as peers of
    // the sections around them rather than as one block.
    <VStack align="stretch" gap={6}>
      {sections.map((section) => (
        <RemarksPanel
          key={section.key}
          title={section.label}
          subtitle={section.subtitle}
          value={values[section.key]}
          empty={section.empty}
          action={
            section.key === "notes" && onAddNote ? (
              // Ghost, not solid: a heading control should stay quiet next to
              // the section's own content. Same slot and weight as the
              // library's "History" header action.
              //
              // FROM `osp-ui-kit` and no longer from `st-peter-ui`, which this
              // project does not import from any more. The same component
              // either way — checked against the rendered button rather than
              // taken on trust: same class, same 32px, same 12px label.
              <TertiarySmButton onClick={() => setAddOpen(true)}>
                <LuPlus /> Add Note
              </TertiarySmButton>
            ) : undefined
          }
        />
      ))}

      {/* Write a note — the same sheet the claim's "More" button opens
          (BottomQuickActions): slides up from the bottom on mobile, in from
          the right on desktop, drag to dismiss. Passing children puts the
          form in its body in place of the usual action list. */}
      <BottomQuickActions
        open={addOpen}
        onOpenChange={(next) => {
          if (!next) closeAdd();
        }}
        title="Add Note"
        subtitle="Kept with this record — not part of the remarks trail."
      >
        <VStack align="stretch" gap={3}>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write the note…"
            rows={6}
            resize="none"
            bg="white"
            autoFocus
          />
          {/* One row at every width — Cancel on the left, Add on the right. */}
          <Flex align="center" justify="space-between" gap={3}>
            <SecondaryMdButton onClick={closeAdd}>Cancel</SecondaryMdButton>
            <PrimaryMdButton
              onClick={saveNote}
              disabled={draft.trim().length === 0}
            >
              Add
            </PrimaryMdButton>
          </Flex>
        </VStack>
      </BottomQuickActions>
    </VStack>
  );
}

export default PlanholderRemarks;
