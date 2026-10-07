"use client";

// Submitted Documents — the papers filed with the reinstatement request, in the
// 70% beside the Plan Details card.
//
// Cloned from ROP's `RopSubmittedIdsCard`: the same carousel, light-box and
// empty state, for the same reason — a document is checked by reading it, which
// needs the scan at the size the column can give it.

import { useEffect, useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  IconButton,
  Image,
  Portal,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  FileStack,
  FileX,
  ZoomIn,
} from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { SubmittedDocument } from "../data/types";

const TITLE = "Submitted Documents";

export interface SubmittedDocumentsCardProps {
  documents: SubmittedDocument[];
  /** Shows a placeholder viewer while the documents are being fetched. */
  loading?: boolean;
}

export function SubmittedDocumentsCard({
  documents,
  loading = false,
}: SubmittedDocumentsCardProps) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  // Whether the scan on show is taller than wide — read off the image once it
  // loads, and decides whether the viewer scrolls or fits it.
  const [portrait, setPortrait] = useState(false);

  const count = documents.length;

  // Back to the first document whenever the set changes — the card stays
  // mounted as the user moves down the list.
  useEffect(() => {
    setIndex(0);
  }, [documents]);

  // Wraps at both ends, so either arrow always advances.
  const go = (delta: number) => {
    if (count === 0) return;
    setIndex((i) => (i + delta + count) % count);
  };

  if (loading) {
    return (
      <SectionCard
        icon={<FileStack size={14} />}
        title={TITLE}
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        fill
      >
        <Flex direction="column" gap={3} flex="1" minH={0}>
          <Skeleton
            flex={{ base: "none", lg: "1" }}
            minH={{ base: "auto", lg: "220px" }}
            aspectRatio={{ base: 16 / 10, lg: "auto" }}
            borderRadius="md"
          />
          <Skeleton h="16px" w="40%" mx="auto" borderRadius="sm" />
        </Flex>
      </SectionCard>
    );
  }

  const current = documents[index];

  // `!current` as well as `count === 0`: for the one render after the set
  // shrinks and before the effect resets `index`, it can point past the end.
  if (count === 0 || !current) {
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
            This request has no supporting documents on file yet.
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
          {index + 1} / {count}
        </Text>
      }
      fill
    >
      <Flex direction="column" gap={3} flex="1" minH={0}>
        {/* THE VIEWER. On desktop it takes the height left in the card, so the
            card ends level with Plan Details beside it; `minH` is the floor
            below which a scan cannot be read. Below `lg` it falls back to a
            fixed ratio.

            FIXED SIZE, SCROLLING INSIDE (user, 2026-09-29). The scan sits in
            an absolutely placed layer, so it never adds to the card's height
            — a tall page like the RI form would otherwise stretch the card.
            A portrait page is shown at the viewer's full width and scrolls
            down; a landscape one (ID, invoice) is fitted whole with
            `contain`, as before. */}
        <Box
          position="relative"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
          overflow="hidden"
          role="group"
          flex={{ base: "none", lg: "1" }}
          minH={{ base: "auto", lg: "220px" }}
          aspectRatio={{ base: 16 / 10, lg: "auto" }}
        >
          <Box
            // Keyed by document so a new page opens scrolled to the top.
            key={current.id}
            position="absolute"
            inset={0}
            overflowY={portrait ? "auto" : "hidden"}
            display="flex"
          >
            <Box
              as="button"
              onClick={() => setZoomed(true)}
              w="full"
              h={portrait ? "auto" : "full"}
              display="block"
              cursor="zoom-in"
              aria-label={`Open ${current.label} full screen`}
            >
              <Image
                src={current.imageUrl}
                alt={current.label}
                w="full"
                h={portrait ? "auto" : "full"}
                objectFit="contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setPortrait(img.naturalHeight > img.naturalWidth);
                }}
              />
            </Box>
          </Box>

          <Flex
            position="absolute"
            top={2}
            right={2}
            align="center"
            gap={1}
            px={2}
            py={1}
            borderRadius="md"
            bg="blackAlpha.600"
            color="white"
            fontSize="10px"
            fontWeight="600"
            pointerEvents="none"
          >
            <ZoomIn size={12} />
            Click to zoom
          </Flex>

          {count > 1 && (
            <>
              <CarouselArrow
                side="left"
                label="Previous document"
                onClick={() => go(-1)}
              />
              <CarouselArrow
                side="right"
                label="Next document"
                onClick={() => go(1)}
              />
            </>
          )}
        </Box>

        <Text
          fontSize="sm"
          fontWeight="700"
          color="gray.800"
          textAlign="center"
          truncate
        >
          {current.label}
        </Text>

        {count > 1 && (
          <Flex align="center" justify="center" gap={2}>
            {documents.map((document, i) => (
              <Box
                key={document.id}
                as="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${document.label}`}
                aria-current={i === index ? "true" : undefined}
                h="8px"
                w={i === index ? "20px" : "8px"}
                borderRadius="full"
                bg={i === index ? BRAND_COLORS.primaryGreen : "gray.300"}
                transition="all 0.2s ease"
                cursor="pointer"
                _hover={{ bg: i === index ? undefined : "gray.400" }}
              />
            ))}
          </Flex>
        )}
      </Flex>

      {/* THE LIGHT-BOX — the whole window for reading a document. */}
      <Dialog.Root
        open={zoomed}
        onOpenChange={(e) => setZoomed(e.open)}
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

              <Dialog.Body
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={4}
                p={4}
                h="full"
              >
                {/* A portrait page (the RI form) is shown at its ORIGINAL size,
                    never scaled down, and scrolls both ways when it does not
                    fit the window (user, 2026-09-29). Auto margins centre it
                    when it is smaller, without clipping its left/top edge when
                    it is larger — `justify-content: center` would. A landscape
                    scan (ID, invoice) is still fitted whole. */}
                {portrait ? (
                  <Box
                    key={current.id}
                    flex="1"
                    minH={0}
                    w="full"
                    overflow="auto"
                    display="flex"
                  >
                    <Image
                      src={current.imageUrl}
                      alt={current.label}
                      m="auto"
                      flexShrink={0}
                      w="auto"
                      h="auto"
                      maxW="none"
                      maxH="none"
                      borderRadius="md"
                    />
                  </Box>
                ) : (
                  <Image
                    src={current.imageUrl}
                    alt={current.label}
                    maxW="full"
                    maxH="80vh"
                    objectFit="contain"
                    borderRadius="md"
                  />
                )}
                <Flex align="center" gap={3} flexShrink={0}>
                  {count > 1 && (
                    <IconButton
                      aria-label="Previous document"
                      size="sm"
                      variant="solid"
                      bg="whiteAlpha.300"
                      color="white"
                      _hover={{ bg: "whiteAlpha.400" }}
                      onClick={() => go(-1)}
                    >
                      <ChevronLeft size={18} />
                    </IconButton>
                  )}
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {current.label}
                    {count > 1 && ` · ${index + 1} / ${count}`}
                  </Text>
                  {count > 1 && (
                    <IconButton
                      aria-label="Next document"
                      size="sm"
                      variant="solid"
                      bg="whiteAlpha.300"
                      color="white"
                      _hover={{ bg: "whiteAlpha.400" }}
                      onClick={() => go(1)}
                    >
                      <ChevronRight size={18} />
                    </IconButton>
                  )}
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </SectionCard>
  );
}

/** One of the two arrows over the viewer. */
function CarouselArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <IconButton
      aria-label={label}
      onClick={onClick}
      size="sm"
      variant="solid"
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      {...(side === "left" ? { left: 2 } : { right: 2 })}
      borderRadius="full"
      bg="whiteAlpha.900"
      color="gray.700"
      boxShadow="sm"
      _hover={{ bg: "white", color: BRAND_COLORS.primaryGreen }}
    >
      {side === "left" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </IconButton>
  );
}

export default SubmittedDocumentsCard;
