"use client";

// Submitted IDs — the proofs of identity filed with the return, in the panel's
// right-hand column.
//
// A CAROUSEL RATHER THAN A ROW OF THUMBNAILS: an ID is checked by reading it —
// the name, the number, the face — which needs the picture at the size the
// column can give it. Thumbnails would fit three across and be too small to
// verify anything, which is the only reason this card exists.
//
// It is the same `SectionCard` the ROP details card uses, with the same edge
// and lift, so the two read as one family across the two columns.

import { useEffect, useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  IconButton,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, IdCard, ImageOff, ZoomIn } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { RopSubmittedId } from "../data/types";

export interface RopSubmittedIdsCardProps {
  documents: RopSubmittedId[];
}

export function RopSubmittedIdsCard({ documents }: RopSubmittedIdsCardProps) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const count = documents.length;

  // Back to the first document whenever the set changes — the panel keeps this
  // card mounted as the user moves down the ROP list, and slide three of the
  // last request is not slide three of this one.
  useEffect(() => {
    setIndex(0);
  }, [documents]);

  // WRAPS at both ends. With two or three documents, a disabled arrow is a
  // control that spends most of its life doing nothing; wrapping means either
  // arrow always advances.
  const go = (delta: number) => {
    if (count === 0) return;
    setIndex((i) => (i + delta + count) % count);
  };

  const current = documents[index];

  if (count === 0) {
    return (
      <SectionCard
        icon={<IdCard size={14} />}
        title="Submitted IDs"
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        fill
      >
        {/* The empty state says what is MISSING rather than that a list is
            empty: nothing on file is a reason a return cannot be processed,
            not a quiet nothing.

            It fills the card the same way the viewer does, so a request with
            no documents leaves a column the same height as one with them —
            the panel should not change shape with the contents of a card. */}
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
            <ImageOff size={28} />
          </Box>
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            No IDs submitted
          </Text>
          <Text fontSize="xs" color="gray.500">
            This request has no proof of identity on file yet.
          </Text>
        </Flex>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={<IdCard size={14} />}
      title="Submitted IDs"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      // Which of how many, in the strip — so the count is readable without
      // counting the dots underneath.
      action={
        <Text fontSize="xs" fontWeight="600" color="green.700">
          {index + 1} / {count}
        </Text>
      }
      fill
    >
      <Flex direction="column" gap={3} flex="1" minH={0}>
        {/* THE VIEWER.

            ON DESKTOP IT TAKES WHATEVER HEIGHT IS LEFT (user, 2026-09-24), so
            the card ends level with the bottom of the ROP details card in the
            column beside it. `minH` is the floor — an ID squeezed under about
            220px cannot be read, and at that point the card is better being
            taller than its neighbour than useless.

            The height is FIXED by that neighbour, not by the scan: the panel
            takes this card out of flow on `lg`, so a wider column (the list
            hidden) leaves the card as it was and the scan is fitted inside
            it, letterboxed at the sides.

            Below `lg` there is no neighbour to match, so the card is as tall
            as the picture needs, which is what a stacked column wants.

            `contain` either way, so a tall ID is letterboxed rather than
            cropped — a cropped ID can lose the very number being checked. */}
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
          display="flex"
        >
          {/* No `type="button"`: Chakra's polymorphic `Box` does not carry the
              native button props in its types, which is how the rest of this
              codebase writes `as="button"`. Nothing here sits in a form, so
              the implicit submit type costs nothing. */}
          <Box
            as="button"
            onClick={() => setZoomed(true)}
            w="full"
            flex="1"
            minH={0}
            display="flex"
            cursor="zoom-in"
            aria-label={`Open ${current.label} full screen`}
          >
            {/* On desktop the scan is FITTED to the viewer — the whole ID in
                view at whatever size the box allows, at the list's width and
                with the list hidden alike (user, 2026-09-30). The box's height
                is fixed by the panel, so `h="full"` here cannot feed back into
                it. Below `lg` it keeps the ID's own ratio. */}
            <Image
              src={current.imageUrl}
              alt={current.label}
              w="full"
              h={{ base: "auto", lg: "full" }}
              aspectRatio={{ base: 16 / 10, lg: "auto" }}
              objectFit="contain"
            />
          </Box>

          {/* The zoom affordance, so the image reads as openable before
              anybody tries it. */}
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

          {/* Arrows only where there is more than one thing to move between. */}
          {count > 1 && (
            <>
              <CarouselArrow
                side="left"
                label="Previous ID"
                onClick={() => go(-1)}
              />
              <CarouselArrow
                side="right"
                label="Next ID"
                onClick={() => go(1)}
              />
            </>
          )}
        </Box>

        {/* What the picture IS, which the picture does not say. */}
        <Text
          fontSize="sm"
          fontWeight="700"
          color="gray.800"
          textAlign="center"
          truncate
        >
          {current.label}
        </Text>

        {/* Dots: position AND a way to jump, so a three-document set does not
            have to be paged through one at a time. */}
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
                // The current dot is a capsule rather than a bigger circle —
                // it reads as "you are here" at a glance without the row of
                // dots changing height.
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

      {/* THE LIGHT-BOX. Its own dialog rather than a bigger card: an ID is
          checked against a face or a signature, and that is worth the whole
          window. */}
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
                <Image
                  src={current.imageUrl}
                  alt={current.label}
                  maxW="full"
                  maxH="80vh"
                  objectFit="contain"
                  borderRadius="md"
                />
                <Flex align="center" gap={3}>
                  {count > 1 && (
                    <IconButton
                      aria-label="Previous ID"
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
                      aria-label="Next ID"
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

export default RopSubmittedIdsCard;
