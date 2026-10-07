"use client";

// ONE DOCUMENT, OPENED — the frame every claims screen shows a filed document
// in: the planholder profile and Death Claim (`PlanholderDocumentDrawer`) and
// Service Payables (`ServiceDocumentPreview`). Option "A · Compact card" of the
// mock-up (user, 2026-10-02: "Build A", then "check it in the death and
// service. They should have similar design").
//
// ONE COMPONENT so the screens cannot drift: they were two hand-made copies of
// the same sheet, and the second had already fallen behind the first.
//
// - THE HEADER SAYS WHICH FILE: a tile with its format, the document name, and
//   under it the code and the file name. Those two are not rows as well.
// - THE ROWS ARE THE CALLER'S FACTS — pairs on a desktop, leader rows on a
//   phone (`InfoLabel`). Anything above them (Service's rendered file) is
//   `children`.
// - ONE FOOTER. On a desktop the remove is a quiet red link at the far left and
//   the caller's actions sit at the right, primary last. On a phone the foot is
//   where the thumb is, so it holds the caller's actions only, and the remove is
//   a full-width row in the body above it — never the button under the thumb.
//
// A SHEET ON A PHONE, A POP-UP IN THE MIDDLE FROM `lg` (user, 2026-10-02: "when
// pc it is ideal that it is in the middle and pop-up at the middle") — the
// payee details' rule, `POPUP_FROM_LG`. `asDialog` centres it at every width.

import { useEffect, type ReactNode } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { InfoLabel } from "./info-label";
import {
  DIALOG_SHEET_CSS,
  DIALOG_SHEET_FROM_LG_CSS,
  POPUP_FROM_LG,
} from "../planholder/components/dialog-sheet";

/**
 * The pop-up's width from `lg` — the mock-up's 520px. Narrower than the payee
 * details' 840 because there is less in it: a few facts and a footer.
 */
const DIALOG_WIDTH = "520px";

/** A 44px target on a phone, the kit's small size on a desktop. */
export const DOCUMENT_ACTION_HEIGHT = { base: "44px", lg: "36px" };

export interface DocumentFact {
  label: string;
  value: ReactNode;
  /** Across both columns on a desktop — a path, a name. */
  wide?: boolean;
}

export interface DocumentDetailSheetProps {
  open: boolean;
  onClose: () => void;
  /** Centred at every width, not a sheet from the bottom on a phone. */
  asDialog?: boolean;
  /** The document's name — the sheet's title. */
  title: string;
  code: string;
  fileName: string;
  /** "PDF" — what the tile reads. */
  format: string;
  /** The rows, in order. */
  facts: DocumentFact[];
  /** Above the rows — Service's rendered file. */
  children?: ReactNode;
  /**
   * The footer's right-hand actions, primary LAST. On a phone they share the
   * foot, so give the primary `flex={{ base: "1", lg: "none" }}`.
   */
  actions: ReactNode;
  /** Remove the document. Confirms first, at the caller. Omit to hide it. */
  onRemove?: () => void;
  /** The verb this screen uses — "Remove" on the profile, "Delete" on Service. */
  removeVerb?: string;
}

/** The file's format as a small page — which kind of file this is, at a glance. */
function FileTile({ format }: { format: string }) {
  return (
    <Box
      position="relative"
      w="44px"
      h="52px"
      flexShrink={0}
      display="flex"
      alignItems="flex-end"
      justifyContent="center"
      pb="6px"
      bg="#e7f4ec"
      borderWidth="1px"
      borderColor="#cfe6d8"
      borderRadius="6px"
      // The folded corner.
      _before={{
        content: '""',
        position: "absolute",
        top: "-1px",
        right: "-1px",
        w: "13px",
        h: "13px",
        borderTopRightRadius: "6px",
        bg: "linear-gradient(225deg, white 50%, #b9dcc7 50%)",
      }}
      aria-hidden
    >
      <Text
        fontSize="9.5px"
        fontWeight="700"
        letterSpacing="0.06em"
        color={BRAND_COLORS.darkGreen}
      >
        {format || "FILE"}
      </Text>
    </Box>
  );
}

export function DocumentDetailSheet({
  open,
  onClose,
  asDialog = false,
  title,
  code,
  fileName,
  format,
  facts,
  children,
  actions,
  onRemove,
  removeVerb = "Remove",
}: DocumentDetailSheetProps) {
  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. The query keeps it
  // from firing while the remove confirmation is still up over this sheet.
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
          {...(asDialog
            ? { alignItems: "center", justifyContent: "center", p: 3 }
            : POPUP_FROM_LG.positioner)}
        >
          <Drawer.Content
            {...(asDialog
              ? {
                  borderRadius: "xl",
                  w: "full",
                  maxH: { base: "88dvh", md: "82vh" },
                }
              : POPUP_FROM_LG.content)}
            maxW={{
              base: asDialog ? "calc(100dvw - 24px)" : "100%",
              lg: DIALOG_WIDTH,
            }}
            css={asDialog ? DIALOG_SHEET_CSS : DIALOG_SHEET_FROM_LG_CSS}
            bg={{ base: BRAND_COLORS.subtleBg, lg: "white" }}
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            {/* The drag handle is the sheet's — a grab bar on a centred dialog
                offers a gesture that does nothing there. */}
            {!asDialog && (
              <Box
                pt={2.5}
                display={{ base: "flex", lg: "none" }}
                justifyContent="center"
              >
                <Box w="36px" h="4px" bg="gray.300" borderRadius="full" />
              </Box>
            )}

            <Drawer.Header
              display="flex"
              alignItems="center"
              gap={3}
              px={{ base: 4, lg: 5 }}
              pt={4}
              pb={3.5}
            >
              <FileTile format={format} />
              <Box flex="1" minW={0}>
                <Drawer.Title
                  fontSize="md"
                  fontWeight="700"
                  color={BRAND_COLORS.darkGreen}
                  lineHeight="1.3"
                >
                  {title}
                </Drawer.Title>
                <Flex align="center" gap={1.5} mt={1} minW={0}>
                  <Box
                    as="span"
                    flexShrink={0}
                    px="7px"
                    h="20px"
                    lineHeight="20px"
                    borderRadius="4px"
                    bg="gray.100"
                    color="gray.600"
                    fontFamily="mono"
                    fontSize="11px"
                  >
                    {code}
                  </Box>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {fileName}
                  </Text>
                </Flex>
              </Box>
              <Drawer.CloseTrigger asChild position="static" alignSelf="start">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body
              px={{ base: 4, lg: 5 }}
              pt={0.5}
              pb={{ base: 4, lg: 5 }}
              overflowY="auto"
            >
              {children && <Box mb={4}>{children}</Box>}

              <SimpleGrid columns={2} gapX={5} gapY={{ base: 2.5, lg: 3.5 }}>
                {facts.map((fact) =>
                  fact.wide ? (
                    <Box key={fact.label} gridColumn="1 / -1" minW={0}>
                      <InfoLabel label={fact.label} value={fact.value} />
                    </Box>
                  ) : (
                    <InfoLabel
                      key={fact.label}
                      label={fact.label}
                      value={fact.value}
                    />
                  ),
                )}
              </SimpleGrid>

              {/* THE PHONE'S REMOVE — a row of its own above the foot. */}
              {onRemove && (
                <Button
                  display={{ base: "flex", lg: "none" }}
                  w="full"
                  h="44px"
                  mt={4}
                  variant="outline"
                  bg="white"
                  borderColor="gray.200"
                  color="red.600"
                  fontWeight="600"
                  _hover={{ bg: "red.50", borderColor: "red.200" }}
                  onClick={onRemove}
                >
                  <LuTrash2 size={15} />
                  {removeVerb} Document
                </Button>
              )}
            </Drawer.Body>

            <Flex
              flexShrink={0}
              align="center"
              gap={2}
              px={{ base: 4, lg: 5 }}
              py={3}
              bg="white"
              borderTopWidth="1px"
              borderColor="gray.100"
            >
              {/* THE DESKTOP'S REMOVE — at the far left, quiet and red, away
                  from the primary at the far right. */}
              {onRemove && (
                <Button
                  display={{ base: "none", lg: "flex" }}
                  variant="ghost"
                  size="sm"
                  color="red.600"
                  _hover={{ bg: "red.50" }}
                  onClick={onRemove}
                >
                  <LuTrash2 size={15} />
                  {removeVerb}
                </Button>
              )}
              <Box flex="1" display={{ base: "none", lg: "block" }} />
              {actions}
            </Flex>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default DocumentDetailSheet;
