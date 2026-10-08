"use client";

// Planholder Remarks and Notes — under the payout details and their
// proof. A collapsible fold (the kit's `InfoCardAccordion`) on both Return of
// Premium and Reinstatement (user, 2026-09-28).
//
// The REMARKS are the plan holder module's trail and are only read here. They
// are drawn in a plain box rather than a read-only textarea so the box grows
// with the trail and the whole of it is always visible — a textarea holds a
// fixed number of rows and scrolls the rest out of sight (user, 2026-09-24).
//
// The NOTES are a compact LIST (user, 2026-09-28): LPA No, the note, who wrote
// it and when, newest first. Add Notes opens `RopAddNoteDialog`; a note added
// there goes to the top of the list. Local state only; there is nowhere to
// persist them to yet.

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, InfoCardAccordion, SecondarySmButton } from "osp-ui-kit";
import { MessageSquareText, Plus } from "lucide-react";
import { toast } from "sonner";

import { formatFiledDateTime } from "@/app/(pis)/data";
import type { PlanholderNote } from "../data/types";
import { RopAddNoteDialog } from "./rop-add-note-dialog";

/** How many notes the list shows before it pages. */
const PAGE_SIZE = 5;

/** Who a note is credited to when the kit has no display name stored. */
const FALLBACK_AUTHOR = "Current User";

/**
 * COMPACT ROWS (user, 2026-09-28). The kit's smallest table size still pads
 * every cell 10px top and bottom and takes no prop for it, so it is tightened
 * here, scoped to this table only, and the text drops a size to match.
 */
const COMPACT_ROWS = {
  "& thead th": { paddingBlock: "4px" },
  "& tbody td": { paddingBlock: "2px", lineHeight: "1.2" },
  "& tbody td p": { fontSize: "var(--chakra-font-sizes-xs)", lineHeight: "1.2" },
} as const;

const columns: ColumnDef<PlanholderNote>[] = [
  {
    accessorKey: "lpaNo",
    header: "LPA No",
    cell: (info) => (
      <Text fontFamily="mono" whiteSpace="nowrap">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    // Wraps rather than truncates, so the whole note is read in the row.
    cell: (info) => (
      <Text whiteSpace="pre-wrap" wordBreak="break-word">
        {info.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: (info) => <Text whiteSpace="nowrap">{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
    cell: (info) => (
      <Text whiteSpace="nowrap">
        {formatFiledDateTime(info.getValue<string>())}
      </Text>
    ),
  },
];

export interface RopRemarksCardProps {
  /** The plan the card is for; shown in Add Notes and stamped on its notes. */
  lpaNo: string;
  /** Shown, not editable, in Add Notes. */
  planholderName: string;
  remarks: string;
  /** The notes on file, newest first. */
  notes: PlanholderNote[];
}

function FieldLabel({ children, mb = 1.5 }: { children: string; mb?: number }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="700"
      color="gray.700"
      textTransform="uppercase"
      letterSpacing="wide"
      mb={mb}
    >
      {children}
    </Text>
  );
}

export function RopRemarksCard({
  lpaNo,
  planholderName,
  remarks,
  notes: initialNotes,
}: RopRemarksCardProps) {
  // The panel keys this card by record, so each record starts from its own
  // notes.
  const [notes, setNotes] = useState(initialNotes);
  const [addOpen, setAddOpen] = useState(false);

  const addNote = (text: string) => {
    // Read on save, not during render: `localStorage` is not there on the
    // server.
    const createdBy =
      localStorage.getItem("user-display-name")?.trim() || FALLBACK_AUTHOR;
    const dateCreated = new Date().toISOString();
    setNotes((current) => [
      { id: `${lpaNo}-${dateCreated}`, lpaNo, notes: text, createdBy, dateCreated },
      ...current,
    ]);
    toast.success("Note added");
  };

  return (
    <InfoCardAccordion
      icon={<MessageSquareText />}
      title="Planholder Remarks and Notes"
      defaultOpen
    >
      <Box mb={4}>
        <FieldLabel>Remarks:</FieldLabel>
        {/* No height and no overflow: the box is as tall as the trail. */}
        <Box
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          px={3}
          py={2.5}
          fontFamily="mono"
          fontSize="xs"
          lineHeight="1.7"
          color={remarks ? "gray.700" : "gray.400"}
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {remarks || "No remarks on file."}
        </Box>
      </Box>

      <Box>
        {/* The title and, at the far right of it, Add Notes (user,
            2026-09-28). */}
        <Flex justify="space-between" align="center" mb={1.5}>
          <FieldLabel mb={0}>Notes:</FieldLabel>
          <SecondarySmButton onClick={() => setAddOpen(true)}>
            <Plus size={14} />
            Add Notes
          </SecondarySmButton>
        </Flex>
        <Box css={COMPACT_ROWS}>
          <DataTable<PlanholderNote>
            columns={columns}
            data={notes}
            size="sm"
            defaultPageSize={PAGE_SIZE}
            getRowId={(row) => row.id}
            features={{
              sorting: true,
              pagination: true,
              search: false,
              filtering: false,
              columnToggle: false,
              selection: false,
              detailSidebar: false,
            }}
            emptyState={
              <Text fontSize="xs" color="gray.400" py={3} textAlign="center">
                No notes on this plan yet.
              </Text>
            }
            mobileConfig={{
              viewMode: "card",
              primaryField: "createdBy",
              titleTransform: "none",
              secondaryField: "dateCreated",
              visibleFields: ["lpaNo", "notes"],
              labelMap: { lpaNo: "LPA No", notes: "Notes" },
              valueFormatter: {
                dateCreated: (value) => formatFiledDateTime(String(value)),
              },
            }}
          />
        </Box>
      </Box>

      <RopAddNoteDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        lpaNo={lpaNo}
        planholderName={planholderName}
        onAdd={addNote}
      />
    </InfoCardAccordion>
  );
}

export default RopRemarksCard;
