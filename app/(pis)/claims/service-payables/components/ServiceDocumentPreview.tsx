"use client";

// One document, opened.
//
// This is where a document is REMOVED on a desktop. The row itself is only a
// row there: no swipe, no trash tucked against its edge — it is tapped, this
// opens, and the two things that can be done with a document are two buttons at
// the bottom of it. Delete is a destructive action on a record somebody filed,
// and asking for it through a drag gesture on a mouse was the wrong door.
//
// Below `xl` the row can still be swiped, which is the plan holder page's
// idiom and the one a thumb already knows. Both paths land on the same
// confirmation, so neither is a shortcut past it.
//
// WHAT IT ACTUALLY PREVIEWS. A document added this session is a real file the
// browser is holding, so the image or the PDF is rendered — that is the point
// of requiring the attachment. A SEEDED document is a path into a document
// store this environment does not have, and rendering an `<img>` at it would
// show a broken-image glyph and let the user think the file was corrupt. Those
// say what they are instead.
//
// Drawn in `DocumentDetailSheet`, the frame the planholder page's document
// sheet uses too, because it is the same object seen the same way.

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFileText } from "react-icons/lu";
import { SecondarySmButton } from "osp-ui-kit";
import {
  DOCUMENT_ACTION_HEIGHT,
  DocumentDetailSheet,
} from "../../components/document-detail-sheet";
import type { ServiceDocument } from "../service-documents-store";

/** Tallest the preview pane runs before the sheet's own scroll takes over. */
const PREVIEW_MAX_HEIGHT = "340px";

/** "PDF" off a file name. */
export function formatOf(fileName: string): string {
  if (!fileName.includes(".")) return "FILE";
  return fileName.split(".").pop()!.toUpperCase();
}

/**
 * The file itself, when there is one to show.
 *
 * Only a `blob:` URL is rendered. That is not a limitation of the viewer, it is
 * the truth about the data: those are the documents this tab is holding, and
 * everything else is a path to a store that is not wired up.
 */
function PreviewPane({ document: doc }: { document: ServiceDocument }) {
  const isLocal = doc.value.startsWith("blob:");
  const format = formatOf(doc.fileName);
  const isImage =
    doc.mimeType?.startsWith("image/") ||
    ["PNG", "JPG", "JPEG", "GIF", "WEBP", "BMP"].includes(format);
  const isPdf = doc.mimeType === "application/pdf" || format === "PDF";

  if (isLocal && isImage) {
    return (
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        bg="gray.50"
        overflow="hidden"
        maxH={PREVIEW_MAX_HEIGHT}
        display="flex"
        justifyContent="center"
      >
        {/* A plain <img>, not next/image: the source is an object URL with no
            intrinsic size known ahead of time and nothing for the optimiser to
            fetch. `objectFit: contain` so a tall ID photo is not cropped to the
            pane it is being checked in. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={doc.value}
          alt={doc.documentDesc}
          style={{ maxHeight: PREVIEW_MAX_HEIGHT, objectFit: "contain" }}
        />
      </Box>
    );
  }

  if (isLocal && isPdf) {
    return (
      <Box
        as="iframe"
        // @ts-expect-error — `src`/`title` are iframe attributes Chakra's Box
        // types do not carry; `as` does not widen them.
        src={doc.value}
        title={doc.documentDesc}
        w="full"
        h={PREVIEW_MAX_HEIGHT}
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        bg="gray.50"
      />
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={2}
      textAlign="center"
      borderWidth="1px"
      borderColor="gray.200"
      borderStyle="dashed"
      borderRadius="xl"
      bg="gray.50"
      py={10}
      px={4}
    >
      <Box p={3} borderRadius="full" bg="white" color="gray.400">
        <LuFileText size={22} />
      </Box>
      <Text fontSize="sm" fontWeight="600" color="gray.600">
        {isLocal ? `${format} cannot be shown here` : "Stored off this system"}
      </Text>
      <Text fontSize="xs" color="gray.500" maxW="320px">
        {isLocal
          ? "The file is attached — this viewer only renders images and PDFs."
          : "This document was filed before, and the store it lives in is not connected to this environment yet."}
      </Text>
    </Flex>
  );
}

export interface ServiceDocumentPreviewProps {
  /** The document being viewed. `null` keeps the sheet closed. */
  document: ServiceDocument | null;
  open: boolean;
  onClose: () => void;
  /** Remove it. Confirms first; the sheet closes only once it is actually gone. */
  onDelete: () => void;
}

/**
 * THE SAME FRAME AS THE PLANHOLDER PROFILE'S AND DEATH CLAIM'S (user,
 * 2026-10-02: "check it in the death and service. They should have similar
 * design") — `DocumentDetailSheet`, option A of the mock-up. What is Service's
 * own stays: the file rendered above the rows, Added By, and Delete beside
 * Close rather than Preview / Download / Print.
 */
export function ServiceDocumentPreview({
  document: doc,
  open,
  onClose,
  onDelete,
}: ServiceDocumentPreviewProps) {
  return (
    <DocumentDetailSheet
      open={open && !!doc}
      onClose={onClose}
      title={doc?.documentDesc ?? "Document"}
      code={doc?.documentCode ?? ""}
      fileName={doc?.fileName ?? ""}
      format={doc ? formatOf(doc.fileName) : ""}
      facts={
        doc
          ? [
              {
                label: "Document Code",
                value: <Box as="span" fontFamily="mono">{doc.documentCode}</Box>,
              },
              { label: "Format", value: formatOf(doc.fileName) },
              // Only on one added this session. A seeded document has no
              // audit trail in this data layer, and printing "—" says the file
              // has no author rather than that nobody recorded one.
              ...(doc.origin === "added" && doc.addedBy
                ? [{ label: "Added By", value: doc.addedBy, wide: true }]
                : []),
            ]
          : []
      }
      onRemove={onDelete}
      removeVerb="Delete"
      // CLOSE is here as well as in the header corner: this sheet's whole job
      // on a desktop is to be the place a document is acted on, and "I am done
      // looking" deserves a real target rather than a 16px × in the corner.
      actions={
        <SecondarySmButton
          flex={{ base: "1", lg: "none" }}
          h={DOCUMENT_ACTION_HEIGHT}
          minH={DOCUMENT_ACTION_HEIGHT}
          px={4}
          onClick={onClose}
        >
          Close
        </SecondarySmButton>
      }
    >
      {doc && <PreviewPane document={doc} />}
    </DocumentDetailSheet>
  );
}

export default ServiceDocumentPreview;
