"use client";

// Submitted Documents — the ROP form and any IDs filed with the return, in the
// panel's right-hand column.
//
// ONE SCROLLING COLUMN, NOT A CAROUSEL (user, 2026-10-08). The documents are
// stacked top to bottom in the viewer and the reader scrolls from one to the
// next — no previous / next buttons. The ROP form is a tall page that is
// already read by scrolling, so carrying on down into the IDs is the same
// gesture rather than a second control.
//
// The strip's "1 / 3" follows the scroll, and the dots under the viewer jump
// to a document, so a request with several is still easy to get around.

import { useEffect, useRef, useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";
import { FileStack, FileX, ZoomIn } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { RopSubmittedDocument } from "../data/types";

const TITLE = "Submitted Documents";

/** Space above a document when the viewer is scrolled to it. */
const ITEM_GAP = 12;

export interface RopSubmittedDocumentsCardProps {
  documents: RopSubmittedDocument[];
  /**
   * What the empty state says is missing. The CSV and Reinstatement screens
   * use this card too (user, 2026-10-08), and their requests are not ROP
   * applications.
   */
  emptyMessage?: string;
}

export function RopSubmittedDocumentsCard({
  documents,
  emptyMessage = "This request has no ROP form on file yet.",
}: RopSubmittedDocumentsCardProps) {
  // The document in view, which the counter and the dots show.
  const [active, setActive] = useState(0);
  // The document the light-box opens on; null while it is closed.
  const [zoomed, setZoomed] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const zoomRefs = useRef<(HTMLDivElement | null)[]>([]);

  const count = documents.length;

  // Back to the top whenever the set changes — the panel keeps this card
  // mounted as the user moves down the ROP list.
  useEffect(() => {
    setActive(0);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [documents]);

  // The light-box opens scrolled to the document that was clicked.
  useEffect(() => {
    if (zoomed === null) return;
    const frame = requestAnimationFrame(() =>
      zoomRefs.current[zoomed]?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [zoomed]);

  // The document in view is the last one whose top has passed the upper third
  // of the viewer — or the last of all once the viewer is scrolled to the end,
  // since a short final document may never reach that line.
  const handleScroll = () => {
    const box = scrollRef.current;
    if (!box) return;
    const atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;
    if (atEnd) {
      setActive(count - 1);
      return;
    }
    const mark = box.scrollTop + box.clientHeight / 3;
    let next = 0;
    itemRefs.current.forEach((el, n) => {
      if (el && el.offsetTop <= mark) next = n;
    });
    setActive(next);
  };

  const jumpTo = (n: number) => {
    const box = scrollRef.current;
    const el = itemRefs.current[n];
    if (!box || !el) return;
    box.scrollTo({ top: el.offsetTop - ITEM_GAP, behavior: "smooth" });
  };

  if (count === 0) {
    return (
      <SectionCard
        icon={<FileStack size={14} />}
        title={TITLE}
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        fill
      >
        {/* Says what is MISSING rather than that a list is empty, and fills
            the card the way the viewer does so the row keeps its shape. */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={2}
          flex="1"
          minH={{ base: "auto", lg: "220px" }}
          py={12}
          px={6}
          textAlign="center"
          bg="gray.50"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Box color="gray.400">
            <FileX size={28} />
          </Box>
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            No documents submitted
          </Text>
          <Text fontSize="xs" color="gray.500">
            {emptyMessage}
          </Text>
        </Flex>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={<FileStack size={14} />}
      title={TITLE}
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      action={
        <Text fontSize="xs" fontWeight="600" color="green.700">
          {Math.min(active, count - 1) + 1} / {count}
        </Text>
      }
      fill
    >
      <Flex direction="column" gap={3} flex="1" minH={0}>
        {/* THE VIEWER. On desktop it takes the height left in the card, so the
            card ends level with the ROP details beside it; below `lg` it is a
            fixed height. The column scrolls in an absolutely placed layer, so
            its content never adds to the card's height. */}
        <Box
          position="relative"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
          overflow="hidden"
          flex={{ base: "none", lg: "1" }}
          h={{ base: "480px", lg: "auto" }}
          minH={{ base: "auto", lg: "220px" }}
        >
          <Box
            ref={scrollRef}
            onScroll={handleScroll}
            position="absolute"
            inset={0}
            overflowY="auto"
            p={`${ITEM_GAP}px`}
          >
            <Flex direction="column" gap={`${ITEM_GAP * 2}px`}>
              {documents.map((document, n) => (
                <Box
                  key={document.id}
                  ref={(el: HTMLDivElement | null) => {
                    itemRefs.current[n] = el;
                  }}
                >
                  {/* What the page IS, which the page does not say. */}
                  <Flex align="center" justify="space-between" gap={2} mb={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="gray.700"
                      truncate
                    >
                      {n + 1}. {document.label}
                    </Text>
                    <Flex
                      align="center"
                      gap={1}
                      flexShrink={0}
                      fontSize="10px"
                      fontWeight="600"
                      color="gray.500"
                    >
                      <ZoomIn size={12} />
                      Click to zoom
                    </Flex>
                  </Flex>
                  <Box
                    as="button"
                    onClick={() => setZoomed(n)}
                    display="block"
                    w="full"
                    cursor="zoom-in"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="sm"
                    overflow="hidden"
                    bg="white"
                    aria-label={`Open ${document.label} full screen`}
                  >
                    <Image
                      src={document.imageUrl}
                      alt={document.label}
                      w="full"
                      h="auto"
                    />
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>

        {/* Dots: where the scroll is, and a way to jump to a document. */}
        {count > 1 && (
          <Flex align="center" justify="center" gap={2}>
            {documents.map((document, n) => (
              <Box
                key={document.id}
                as="button"
                onClick={() => jumpTo(n)}
                aria-label={`Scroll to ${document.label}`}
                aria-current={n === active ? "true" : undefined}
                h="8px"
                w={n === active ? "20px" : "8px"}
                borderRadius="full"
                bg={n === active ? BRAND_COLORS.primaryGreen : "gray.300"}
                transition="all 0.2s ease"
                cursor="pointer"
                _hover={{ bg: n === active ? undefined : "gray.400" }}
              />
            ))}
          </Flex>
        )}
      </Flex>

      {/* THE LIGHT-BOX — the same stack at full size, scrolled to the one
          that was clicked, and scrolled through the same way. */}
      <Dialog.Root
        open={zoomed !== null}
        onOpenChange={(e) => {
          if (!e.open) setZoomed(null);
        }}
        size="cover"
        placement="center"
        motionPreset="scale"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.800" />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" boxShadow="none" overflow="hidden">
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top={3}
                  right={3}
                  zIndex={2}
                  size="sm"
                  bg="blackAlpha.700"
                  color="white"
                  _hover={{ bg: "blackAlpha.800" }}
                />
              </Dialog.CloseTrigger>

              <Dialog.Body p={4} h="full" overflowY="auto">
                <Flex direction="column" align="center" gap={8}>
                  {documents.map((document, n) => (
                    <Flex
                      key={document.id}
                      ref={(el: HTMLDivElement | null) => {
                        zoomRefs.current[n] = el;
                      }}
                      direction="column"
                      align="center"
                      gap={2}
                      maxW="full"
                    >
                      <Text fontSize="sm" fontWeight="600" color="white">
                        {document.label}
                        {count > 1 && ` · ${n + 1} / ${count}`}
                      </Text>
                      {/* At its original size, never scaled up, and only
                          scaled down where the window is narrower. */}
                      <Image
                        src={document.imageUrl}
                        alt={document.label}
                        w="auto"
                        h="auto"
                        maxW="full"
                        borderRadius="md"
                      />
                    </Flex>
                  ))}
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </SectionCard>
  );
}

export default RopSubmittedDocumentsCard;
