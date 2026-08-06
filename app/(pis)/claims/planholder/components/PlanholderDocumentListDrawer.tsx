"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Drawer, Flex, Portal, Text, VStack } from "@chakra-ui/react";
import { LuChevronLeft, LuFolderOpen, LuPlus } from "react-icons/lu";
import { TertiarySmButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderDocument } from "../../claims-data";
import { DocumentRow } from "./DocumentRow";

/** Documents loaded per batch as the user scrolls to the bottom. */
const BATCH_SIZE = 15;

interface PlanholderDocumentListDrawerProps {
  documents: PlanholderDocument[];
  open: boolean;
  onClose: () => void;
  /** Open a document's detail. */
  onSelect: (doc: PlanholderDocument) => void;
  /** Confirm + remove a document (same as swiping the row). Resolves removed. */
  onRequestRemove: (doc: PlanholderDocument) => Promise<boolean>;
  /** Start the add-document flow (owned by the parent, so it works from here). */
  onAdd: () => void;
}

/**
 * The full document list — a dedicated bottom sheet opened from the section's
 * "View all". The whole list is here (not just the overflow) with infinite
 * scroll, so a long list stays cheap to render; tapping a row opens the
 * document, and swiping it left removes it. Its own "Add Document" button means
 * the user never has to close the sheet to file a new one.
 */
export function PlanholderDocumentListDrawer({
  documents,
  open,
  onClose,
  onSelect,
  onRequestRemove,
  onAdd,
}: PlanholderDocumentListDrawerProps) {
  // How many rows are currently rendered; grows as the sentinel scrolls in.
  const [limit, setLimit] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restart paging whenever the sheet opens or the list changes underneath it.
  useEffect(() => {
    if (open) setLimit(BATCH_SIZE);
  }, [open, documents.length]);

  // Load the next batch when the bottom sentinel comes into view.
  useEffect(() => {
    if (!open) return;
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLimit((n) => (n < documents.length ? n + BATCH_SIZE : n));
        }
      },
      { root, rootMargin: "120px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [open, documents.length, limit]);

  const count = documents.length;
  const visible = documents.slice(0, limit);

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
            display="flex"
            flexDirection="column"
            h="100dvh"
            maxH="100dvh"
            borderRadius={0}
            overflow="hidden"
          >
            <Drawer.Header
              borderBottomWidth="1px"
              borderColor="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Flex align="center" gap={2} minW={0}>
                {/* Back — green chevron, soft green hover (matches the payee
                    drawer chrome). */}
                <Flex
                  as="button"
                  align="center"
                  onClick={onClose}
                  cursor="pointer"
                  color="green.600"
                  _dark={{ color: "green.400" }}
                  aria-label="Go back"
                  flexShrink={0}
                  px={1}
                  py={1}
                  mr={1}
                  borderRadius="md"
                  _hover={{ bg: "green.50" }}
                  _active={{ transform: "scale(0.93)" }}
                  transition="all 0.14s ease"
                  userSelect="none"
                >
                  <LuChevronLeft size={20} strokeWidth={2.5} />
                </Flex>
                <Box minW={0}>
                  <Drawer.Title>
                    <Text fontWeight="bold" color={BRAND_COLORS.darkGreen} truncate>
                      Documents
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {count} {count === 1 ? "file" : "files"} on record
                  </Text>
                </Box>
              </Flex>
              {/* Same ghost control as the section heading it was opened
                  from, so the action reads as one thing in both places. */}
              <TertiarySmButton onClick={onAdd}>
                <LuPlus /> Add Document
              </TertiarySmButton>
            </Drawer.Header>

            <Drawer.Body ref={scrollRef} py={5} overflowY="auto">
              {count === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  textAlign="center"
                  py={16}
                  gap={3}
                >
                  <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
                    <LuFolderOpen size={24} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      No documents yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1} maxW="280px">
                      Documents filed for this plan holder will appear here.
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <>
                  <VStack align="stretch" gap={2}>
                    {visible.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        onClick={() => onSelect(doc)}
                        onRequestRemove={() => onRequestRemove(doc)}
                      />
                    ))}
                  </VStack>
                  {/* Sentinel — scrolling this into view loads the next batch. */}
                  <Box ref={sentinelRef} h="1px" />
                </>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderDocumentListDrawer;
