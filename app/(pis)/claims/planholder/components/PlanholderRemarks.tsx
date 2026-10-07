"use client";

import { useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
  Textarea,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import {
  BottomQuickActions,
  PrimaryMdButton,
  PrimarySmButton,
  SecondaryMdButton,
  SecondarySmButton,
} from "osp-ui-kit";
import { BottomSheet } from "../../components/bottom-sheet";
import { RemarksPanel } from "../../components/remarks-panel";
import {
  SectionAddAction,
  SectionAddFoot,
} from "../../components/section-add-button";
import { FieldError, SheetTextArea } from "../../components/sheet-picker";

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
 * Three contexts share this component:
 *   - Claim request drawer  → both Remarks and Notes (per claim).
 *   - Plan holder profile   → Remarks only (`showNotes={false}`).
 *   - Death Claim v2        → Notes only (`showRemarks={false}`), because that
 *     column reads the PLAN's remarks in one card and the CLAIM's notes in
 *     another — two different records, so they cannot be one block.
 */
export function PlanholderRemarks({
  remarks = "",
  notes = "",
  showRemarks = true,
  showNotes = true,
  showSubtitles = true,
  asDialog = false,
  noteSubtitle,
  onAddNote,
}: {
  remarks?: string;
  notes?: string;
  /**
   * Show the Remarks section. When false, Notes only — the mirror of
   * {@link showNotes}, for a caller that has somewhere else for the remarks to
   * be.
   */
  showRemarks?: boolean;
  /** Show the Notes section below Remarks. When false, Remarks only. */
  showNotes?: boolean;
  /**
   * Show the line under each heading — "Remarks on record", "Internal notes on
   * record".
   *
   * Off where the heading is enough, which is most places once you read the two
   * together: "Remarks" over "Remarks on record" is the same word twice, and the
   * panel underneath already says what it holds when it is empty. What the
   * subtitle earns is the word "internal" on Notes, which is a real distinction
   * — so it is a caller's choice rather than a deletion.
   */
  showSubtitles?: boolean;
  /**
   * Open "Add Note" as a CENTRED DIALOG rather than the kit's quick-actions
   * sheet.
   *
   * The sheet is right where this sits in a claim drawer — it slides in from
   * the same edge the drawer did, and drags away the same way. On
   * `/claims/death-claim` the notes are one card in a column, and a sheet
   * that takes the whole side of the screen to hold six lines of text is the
   * wrong size of gesture for it; the other sheets on that page are centred and
   * this one should match them.
   *
   * The FORM is identical either way. Only what it arrives in changes.
   *
   * ON A PHONE THE DIALOG BECOMES A BOTTOM SHEET — option A of the mock-up
   * (user, 2026-10-02, for Death Claim and Service alike): the sheet Deny and
   * Return use, the note box, then Cancel and Add side by side at its foot,
   * which rides on the keyboard while typing. Below `lg`, the line every phone
   * form on these screens switches at.
   */
  asDialog?: boolean;
  /**
   * The record the note is written against — the claim number, the LPA —
   * under the phone sheet's title. Only the sheet shows it.
   */
  noteSubtitle?: string;
  /** Write a note. Omit it and the Notes heading carries no button. */
  onAddNote?: (text: string) => void;
}) {
  const values: Record<string, string> = { remarks, notes };
  // Each section asks its own flag, so the three combinations — both, remarks
  // alone, notes alone — all fall out of one line. Slicing could only ever drop
  // from the end, which is why Notes alone was not expressible before.
  const sections = ALL_SECTIONS.filter((s) =>
    s.key === "remarks" ? showRemarks : showNotes,
  );

  // The add-note form, and its in-progress text.
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState("");
  /** The phone sheet's one error — its Add is always pressable. */
  const [error, setError] = useState<string | null>(null);
  const isPhone = useBreakpointValue({ base: true, lg: false }) ?? false;

  const closeAdd = () => {
    setAddOpen(false);
    setDraft("");
    setError(null);
  };

  const saveNote = () => {
    const note = draft.trim();
    if (!note) {
      setError("Write the note first.");
      return;
    }
    onAddNote?.(note);
    closeAdd();
  };

  /**
   * The note form itself — ONE copy, handed to whichever sheet is rendered
   * below. Inlined in both branches it would be two forms that merely look
   * alike, and the next change would land in one of them.
   */
  const noteForm = (
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
        <PrimaryMdButton onClick={saveNote} disabled={draft.trim().length === 0}>
          Add
        </PrimaryMdButton>
      </Flex>
    </VStack>
  );

  return (
    // Same gap the stacked sections use elsewhere, so the two read as peers of
    // the sections around them rather than as one block.
    <VStack align="stretch" gap={6}>
      {sections.map((section) => (
        <RemarksPanel
          key={section.key}
          title={section.label}
          subtitle={showSubtitles ? section.subtitle : undefined}
          value={values[section.key]}
          empty={section.empty}
          // Ghost in the heading on a desktop; a full-width button under the
          // panel on a phone, where the corner is a reach — see
          // `SectionAddAction` / `SectionAddFoot`.
          action={
            section.key === "notes" && onAddNote ? (
              <SectionAddAction
                label="Add Note"
                onClick={() => setAddOpen(true)}
              />
            ) : undefined
          }
          footer={
            section.key === "notes" && onAddNote ? (
              <SectionAddFoot
                label="Add Note"
                onClick={() => setAddOpen(true)}
              />
            ) : undefined
          }
        />
      ))}

      {/* THE NOTE FORM, in whichever sheet this caller asked for — see
          `asDialog`. The body is written once and handed to both, so the two
          presentations cannot drift into two different forms.

          The dialog is narrower than the page's other pop-ups: those hold a
          ledger and a record, this holds a textarea and two buttons, and 840px
          of it would be mostly empty. */}
      {/* THE PHONE'S SHEET — see `asDialog`. Mounted beside the dialog with
          `open` choosing between them, never one swapped for the other. No
          sentence under the title: the record number is all it needs. */}
      {asDialog && (
        <BottomSheet
          title={
            <Box as="span" display="block">
              Add Note
              {noteSubtitle && (
                <Text
                  as="span"
                  display="block"
                  fontSize="xs"
                  fontWeight="500"
                  color="gray.500"
                >
                  {noteSubtitle}
                </Text>
              )}
            </Box>
          }
          open={addOpen && isPhone}
          onClose={closeAdd}
          footer={
            <Flex gap={2.5}>
              <SecondarySmButton flex="1" h="42px" minH="42px" onClick={closeAdd}>
                Cancel
              </SecondarySmButton>
              <PrimarySmButton flex="1" h="42px" minH="42px" onClick={saveNote}>
                Add
              </PrimarySmButton>
            </Flex>
          }
        >
          <SheetTextArea
            label="Note"
            value={draft}
            autoFocus
            onChange={(e) => {
              setDraft(e.currentTarget.value);
              setError(null);
            }}
          />
          {error && <FieldError>{error}</FieldError>}
        </BottomSheet>
      )}

      {asDialog ? (
        <Dialog.Root
          open={addOpen && !isPhone}
          onOpenChange={(e) => {
            if (!e.open) closeAdd();
          }}
          placement="center"
          size="lg"
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.500" backdropFilter="blur(2px)" />
            <Dialog.Positioner>
              <Dialog.Content
                w="full"
                maxW={{ base: "calc(100dvw - 24px)", md: "560px" }}
                maxH={{ base: "88dvh", md: "82vh" }}
                borderRadius="xl"
              >
                <Flex
                  align="flex-start"
                  justify="space-between"
                  gap={3}
                  px={5}
                  pt={4}
                  pb={2}
                >
                  <Box minW={0}>
                    <Dialog.Title>
                      <Text fontWeight="700" color="gray.800">
                        Add Note
                      </Text>
                    </Dialog.Title>
                    <Text fontSize="xs" color="gray.500">
                      Kept with this record — not part of the remarks trail.
                    </Text>
                  </Box>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>

                <Dialog.Body px={5} pb={5} pt={0}>
                  {noteForm}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      ) : (
        /* The kit's quick-actions sheet: slides up from the bottom on mobile,
           in from the right on desktop, drag to dismiss. Passing children puts
           the form in its body in place of the usual action list. */
        <BottomQuickActions
          open={addOpen}
          onOpenChange={(next) => {
            if (!next) closeAdd();
          }}
          title="Add Note"
          subtitle="Kept with this record — not part of the remarks trail."
        >
          {noteForm}
        </BottomQuickActions>
      )}
    </VStack>
  );
}

export default PlanholderRemarks;
