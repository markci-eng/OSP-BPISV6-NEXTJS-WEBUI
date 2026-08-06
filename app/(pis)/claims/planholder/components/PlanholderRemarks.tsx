"use client";

import { useState } from "react";
import { Box, Flex, Textarea, VStack } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { BottomQuickActions } from "osp-ui-kit";
import {
  PrimaryMdButton,
  SecondaryMdButton,
  TertiarySmButton,
} from "st-peter-ui";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";

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
 * own heading (the claims `SectionTitle`, via PlanholderSectionHeader). They
 * used to share a swipeable tab strip; stacking them means both are readable at
 * a glance without a pager, and they line up with every other section on the
 * page.
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
        <Box key={section.key}>
          <PlanholderSectionHeader
            title={section.label}
            subtitle={section.subtitle}
            action={
              section.key === "notes" && onAddNote ? (
                // Ghost, not solid: a heading control should stay quiet next to
                // the section's own content. Same slot and weight as the
                // library's "History" header action.
                <TertiarySmButton onClick={() => setAddOpen(true)}>
                  <LuPlus /> Add Note
                </TertiarySmButton>
              ) : undefined
            }
          />
          <Textarea
            value={values[section.key]}
            readOnly
            placeholder={section.empty}
            rows={5}
            resize="none"
            bg="gray.50"
            color="gray.700"
            borderColor="gray.200"
            cursor="default"
            _focusVisible={{ borderColor: "gray.300", boxShadow: "none" }}
          />
        </Box>
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
