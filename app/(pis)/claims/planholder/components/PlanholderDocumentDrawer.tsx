"use client";

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
import {
  LuDownload,
  LuEye,
  LuFileText,
  LuPrinter,
  LuTrash2,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import type { PlanholderDocument } from "../../claims-data";
import { DIALOG_SHEET_CSS } from "./dialog-sheet";

/** The document actions — no handlers wired yet; here to show the layout. */
const ACTIONS = [
  { label: "Preview", icon: LuEye },
  { label: "Download", icon: LuDownload },
  { label: "Print", icon: LuPrinter },
];

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
   * Show this as a CENTRED DIALOG rather than a sheet from the bottom edge.
   *
   * Same content, different presentation — see the twin prop on the payee
   * sheets. Sliding up from the bottom is a phone's gesture; on
   * `/claims/death-claim` the folder is one card in a column and its sheets
   * should arrive the way that page's others do.
   */
  asDialog?: boolean;
}

/**
 * Slide-up sheet for a single document on file — the same interaction the
 * Claim Requests section uses, scaled down to the handful of fields a document
 * carries.
 */
export function PlanholderDocumentDrawer({
  document: doc,
  open,
  onClose,
  onRemove,
  asDialog = false,
}: PlanholderDocumentDrawerProps) {
  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. Restore it.
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
        <Drawer.Positioner
          alignItems={asDialog ? "center" : undefined}
          justifyContent={asDialog ? "center" : undefined}
          p={asDialog ? 3 : undefined}
        >
          <Drawer.Content
            borderRadius={asDialog ? "xl" : undefined}
            roundedTop={asDialog ? undefined : "2xl"}
            w={asDialog ? "full" : undefined}
            maxW={
              asDialog
                ? { base: "calc(100dvw - 24px)", md: "640px" }
                : undefined
            }
            maxH={asDialog ? { base: "88dvh", md: "82vh" } : "80vh"}
            css={asDialog ? DIALOG_SHEET_CSS : undefined}
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            {/* The drag handle is the sheet's — a grab bar on a centred dialog
                offers a gesture that does nothing there. */}
            {!asDialog && (
            <Box pt={3} pb={1} display="flex" justifyContent="center">
              <Box
                w="36px"
                h="4px"
                bg="gray.300"
                borderRadius="full"
                opacity={0.7}
              />
            </Box>
            )}

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
                      {doc ? doc.name : "Document"}
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
                  <Flex align="center" gap={2}>
                    {ACTIONS.map(({ label, icon: Icon }) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="xs"
                        borderRadius="full"
                        flex="1"
                        minW={0}
                      >
                        <Icon size={13} />
                        <Text as="span" truncate>
                          {label}
                        </Text>
                      </Button>
                    ))}
                  </Flex>

                  <Box>
                    <RowItem label="Document" value={doc.name} />
                    <RowItem label="Document Code" value={doc.code} />
                    <RowItem label="File Name" value={doc.fileName} />
                    <RowItem label="Format" value={doc.format} />
                    <RowItem label="Location" value={doc.url} />
                  </Box>

                  {onRemove && (
                    <Button
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      color="red.600"
                      borderColor="gray.200"
                      _hover={{ bg: "red.50", borderColor: "red.200" }}
                      onClick={onRemove}
                    >
                      <LuTrash2 size={14} />
                      Remove Document
                    </Button>
                  )}
                </VStack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderDocumentDrawer;
