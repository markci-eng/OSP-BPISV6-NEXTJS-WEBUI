"use client";

// Proof of Payout — beside the Payout Details card.
//
// THE SCAN FOR THE CHANNEL THAT IS SELECTED (user, 2026-09-24). Each submitted
// payout carries its own proof — a passbook page, a wallet screenshot — so the
// picture follows the Payout Details dropdown: change the channel and the proof
// changes with it, and the processor checks the account name on the scan
// against the one in the rows beside it.
//
// Same `SectionCard`, edge and lift as the Submitted IDs card, and the same
// click-to-zoom light-box, so the two image cards on the panel behave alike.

import { useState, type ReactNode } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";
import { ImageOff, Receipt, ZoomIn } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import { ColumnHeading } from "../../transfer/components/transfer-party-card";
import type { RopPayout } from "../data/types";

export interface RopPayoutProofCardProps {
  /** The submission selected in the Payout Details card. */
  payout?: RopPayout;
  /** A cheque has no account, so there is nothing a proof could show. */
  onCheque?: boolean;
  /**
   * Drawn without a card of its own, under a column heading, as the other
   * half of the surface the Payout Details sit on (user, 2026-10-02).
   */
  embedded?: boolean;
}

export function RopPayoutProofCard({
  payout,
  onCheque = false,
  embedded = false,
}: RopPayoutProofCardProps) {
  const [zoomed, setZoomed] = useState(false);

  const imageUrl = !onCheque ? payout?.proofImageUrl : undefined;
  const label = payout ? `${payout.channel} proof of payout` : "Proof of payout";

  // Which channel the scan belongs to, so it cannot be mistaken for the proof
  // of a different submission.
  const action =
    payout && !onCheque ? (
      <Text fontSize="xs" fontWeight="600" color="green.700" truncate>
        {payout.channel}
      </Text>
    ) : undefined;

  // The card's own strip, or — embedded — a column heading, filling the
  // height it is given as the card's `fill` does.
  const shell = (children: ReactNode) =>
    embedded ? (
      <Flex direction="column" h="full" minW={0}>
        <ColumnHeading action={action}>Proof of Payout</ColumnHeading>
        {children}
      </Flex>
    ) : (
      <SectionCard
        icon={<Receipt size={14} />}
        title="Proof of Payout"
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        action={action}
        fill
      >
        {children}
      </SectionCard>
    );

  return shell(
    <>
      {imageUrl ? (
        // FIXED SIZE, SCROLLING INSIDE (user, 2026-09-29), as the Reinstatement
        // Submitted Documents viewer does. The image sits in an absolutely
        // placed layer, so it never adds to the card's height. EVERY proof —
        // wallet screenshot and bank statement alike (user, 2026-09-29) — is
        // shown at the viewer's full width and scrolls when it is taller than
        // the viewer, so the account details are read at a legible size.
        <Box
          position="relative"
          flex={{ base: "none", lg: "1" }}
          minH={{ base: "auto", lg: "220px" }}
          aspectRatio={{ base: 16 / 10, lg: "auto" }}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
          overflow="hidden"
        >
          <Box
            // Keyed by image so a new proof opens scrolled to the top.
            key={imageUrl}
            position="absolute"
            inset={0}
            overflowY="auto"
          >
            <Box
              as="button"
              onClick={() => setZoomed(true)}
              w="full"
              display="block"
              cursor="zoom-in"
              aria-label={`Open ${label} full screen`}
            >
              <Image src={imageUrl} alt={label} w="full" h="auto" />
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
        </Box>
      ) : (
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
            {onCheque ? "No proof for cheque" : "No proof of payout"}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {onCheque
              ? "A cheque is collected over the counter, so there is no account to prove."
              : payout
                ? "No proof was submitted for this payout channel."
                : "Select a payout channel to see its proof."}
          </Text>
        </Flex>
      )}

      {imageUrl && (
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
              <Dialog.Content
                bg="transparent"
                boxShadow="none"
                overflow="hidden"
              >
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

                {/* THE PROOF BESIDE WHAT IT PROVES (user, 2026-09-29). The
                    light-box covers the Payout Details card, so the rows the
                    proof is checked against come with it — the account name
                    and number set large, since those are what the processor
                    reads off the scan. */}
                <Dialog.Body
                  display="flex"
                  flexDirection={{ base: "column", lg: "row" }}
                  alignItems="center"
                  justifyContent="center"
                  gap={6}
                  p={{ base: 4, lg: 8 }}
                  h="full"
                  overflowY="auto"
                >
                  <Flex
                    direction="column"
                    align="center"
                    gap={3}
                    minW={0}
                    flexShrink={1}
                  >
                    <Image
                      src={imageUrl}
                      alt={label}
                      maxW="full"
                      maxH={{ base: "60vh", lg: "85vh" }}
                      objectFit="contain"
                      borderRadius="md"
                    />
                    <Text fontSize="sm" fontWeight="600" color="white">
                      {label}
                    </Text>
                  </Flex>

                  {payout && <ZoomPayoutDetails payout={payout} />}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}
    </>,
  );
}

/** The Payout Details rows, as the light-box shows them beside the proof. */
function ZoomPayoutDetails({ payout }: { payout: RopPayout }) {
  return (
    <Flex
      direction="column"
      gap={4}
      w={{ base: "full", lg: "340px" }}
      maxW="420px"
      flexShrink={0}
      p={5}
      bg="white"
      borderRadius="lg"
      boxShadow="lg"
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        Payout Details
      </Text>

      <KeyDetail label="Account Name" value={payout.accountName} />
      <KeyDetail label="Payout Account No." value={payout.accountNo} mono />

      <Flex
        direction="column"
        gap={2}
        pt={3}
        borderTopWidth="1px"
        borderColor="gray.200"
      >
        <MinorDetail label="Payout Channel" value={payout.channel} />
        <MinorDetail label="Payee Name" value={payout.payeeName} />
        <MinorDetail label="Relationship" value={payout.relationship} />
        <MinorDetail label="Reason" value={payout.reason} />
      </Flex>
    </Flex>
  );
}

/** One of the two values checked against the scan — set to be read at a glance. */
function KeyDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Box
      px={4}
      py={3}
      bg="green.50"
      borderLeftWidth="4px"
      borderColor={BRAND_COLORS.primaryGreen}
      borderRadius="md"
    >
      <Text fontSize="xs" fontWeight="600" color="gray.600">
        {label}
      </Text>
      <Text
        fontSize="xl"
        fontWeight="800"
        color="gray.900"
        fontFamily={mono ? "mono" : undefined}
        letterSpacing={mono ? "wide" : undefined}
        wordBreak="break-word"
      >
        {value || "—"}
      </Text>
    </Box>
  );
}

function MinorDetail({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" align="baseline" gap={3}>
      <Text fontSize="xs" color="gray.500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="600"
        color="gray.800"
        textAlign="right"
        wordBreak="break-word"
      >
        {value || "—"}
      </Text>
    </Flex>
  );
}

export default RopPayoutProofCard;
