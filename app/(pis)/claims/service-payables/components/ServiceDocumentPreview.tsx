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
// Built as the plan holder page's document sheet is built — bottom drawer,
// grabber, green chip in the header, `RowItem` details — because it is the same
// object seen the same way.

import { useEffect } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuFileText, LuTrash2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
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

export function ServiceDocumentPreview({
  document: doc,
  open,
  onClose,
  onDelete,
}: ServiceDocumentPreviewProps) {
  // Safety net for Chakra v3 (zag-js) leaving `pointer-events: none` /
  // `data-inert` on <body> after a modal closes — the same guard every overlay
  // in this module carries. The query keeps it from firing while the remove
  // confirmation is still up over this sheet.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = window.document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        window.document.body.style.pointerEvents = "";
        window.document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            roundedTop="2xl"
            maxH="85vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Box pt={3} pb={1} display="flex" justifyContent="center">
              <Box
                w="36px"
                h="4px"
                bg="gray.300"
                borderRadius="full"
                opacity={0.7}
              />
            </Box>

            <Drawer.Header
              pt={2}
              pb={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Flex align="center" gap={3} minW={0}>
                <Box
                  p={2.5}
                  borderRadius="full"
                  bg="#eaf5ee"
                  color={BRAND_COLORS.darkGreen}
                  flexShrink={0}
                >
                  <LuFileText size={18} />
                </Box>
                <Box minW={0}>
                  <Drawer.Title>
                    <Text
                      fontWeight="bold"
                      color={BRAND_COLORS.darkGreen}
                      truncate
                    >
                      {doc ? doc.documentDesc : "Document"}
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {doc ? doc.fileName : ""}
                  </Text>
                </Box>
              </Flex>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body pb={6} overflowY="auto">
              {doc && (
                <VStack align="stretch" gap={4}>
                  <PreviewPane document={doc} />

                  <Box>
                    <RowItem label="Document" value={doc.documentDesc} />
                    <RowItem label="Document Code" value={doc.documentCode} />
                    <RowItem label="File Name" value={doc.fileName} />
                    <RowItem label="Format" value={formatOf(doc.fileName)} />
                    {/* Only on one added this session. A seeded document has no
                        audit trail in this data layer, and printing "—" against
                        two rows says the file has no author rather than that
                        nobody recorded one. */}
                    {doc.origin === "added" && doc.addedBy && (
                      <RowItem label="Added By" value={doc.addedBy} />
                    )}
                  </Box>

                  {/* The two things that can be done, side by side, with the
                      destructive one drawn as the destructive one. Close is
                      here as well as in the header corner: this sheet's whole
                      job on a desktop is to be the place a document is acted
                      on, and "I am done looking" deserves a real target rather
                      than a 16px × in the corner. */}
                  <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                    <Button
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      flex="1"
                      color="red.600"
                      borderColor="gray.200"
                      _hover={{ bg: "red.50", borderColor: "red.200" }}
                      onClick={onDelete}
                    >
                      <LuTrash2 size={14} />
                      Delete Document
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      flex="1"
                      borderColor="gray.200"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </Flex>
                </VStack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default ServiceDocumentPreview;
