"use client";

// ONE DOCUMENT ON FILE, on the planholder profile and Death Claim — option
// "A · Compact card" of the mock-up (user, 2026-10-02: "Build A"). The frame is
// `DocumentDetailSheet`, shared with Service Payables; this file says what a
// planholder's document shows in it.
//
// Name and file name are in the header, so the rows are what is left: Document
// Code, Format, Location. The file actions are Download, Print and Preview —
// icons beside a full-width Preview on a phone, labelled on a desktop.

import { Box } from "@chakra-ui/react";
import { LuDownload, LuEye, LuPrinter } from "react-icons/lu";
import { PrimarySmButton, SecondarySmButton } from "osp-ui-kit";
import type { PlanholderDocument } from "../../claims-data";
import {
  DOCUMENT_ACTION_HEIGHT,
  DocumentDetailSheet,
} from "../../components/document-detail-sheet";

interface PlanholderDocumentDrawerProps {
  /** The document being viewed. `null`/`undefined` keeps the drawer closed. */
  document?: PlanholderDocument | null;
  open: boolean;
  onClose: () => void;
  /**
   * Remove the document from the plan holder — the same action as swiping the
   * row left, for anyone who opened the document instead. Confirms before
   * removing; omit to hide the button.
   */
  onRemove?: () => void;
  /**
   * Show this as a CENTRED DIALOG at every width rather than a sheet from the
   * bottom edge on a phone. On `/claims/death-claim` the folder is one card in
   * a column and its sheets should arrive the way that page's others do.
   */
  asDialog?: boolean;
}

/** A secondary action — an icon on a phone, labelled on a desktop. */
function IconAction({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <SecondarySmButton
      h={DOCUMENT_ACTION_HEIGHT}
      minH={DOCUMENT_ACTION_HEIGHT}
      minW={{ base: "44px", lg: "auto" }}
      px={{ base: 0, lg: 3.5 }}
      aria-label={label}
    >
      {icon}
      <Box as="span" display={{ base: "none", lg: "inline" }}>
        {label}
      </Box>
    </SecondarySmButton>
  );
}

export function PlanholderDocumentDrawer({
  document: doc,
  open,
  onClose,
  onRemove,
  asDialog = false,
}: PlanholderDocumentDrawerProps) {
  return (
    <DocumentDetailSheet
      open={open && !!doc}
      onClose={onClose}
      asDialog={asDialog}
      title={doc?.name ?? "Document"}
      code={doc?.code ?? ""}
      fileName={doc?.fileName ?? ""}
      format={doc?.format ?? ""}
      facts={
        doc
          ? [
              {
                label: "Document Code",
                value: <Box as="span" fontFamily="mono">{doc.code}</Box>,
              },
              { label: "Format", value: doc.format },
              {
                label: "Location",
                value: <Box as="span" fontFamily="mono">{doc.url}</Box>,
                wide: true,
              },
            ]
          : []
      }
      onRemove={onRemove}
      // No handlers wired yet — here to show the layout, as before.
      actions={
        <>
          <IconAction label="Download" icon={<LuDownload size={16} />} />
          <IconAction label="Print" icon={<LuPrinter size={16} />} />
          <PrimarySmButton
            flex={{ base: "1", lg: "none" }}
            h={DOCUMENT_ACTION_HEIGHT}
            minH={DOCUMENT_ACTION_HEIGHT}
            px={3.5}
          >
            <LuEye size={16} />
            Preview
          </PrimarySmButton>
        </>
      }
    />
  );
}

export default PlanholderDocumentDrawer;
