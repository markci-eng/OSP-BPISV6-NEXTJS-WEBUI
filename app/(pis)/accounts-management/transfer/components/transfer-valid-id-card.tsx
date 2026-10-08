"use client";

// One party's Valid ID — the transferor's or the transferee's — as a card of
// its own, under that party's details card.
//
// THE VIEWER IS THE SUBMITTED IDS CAROUSEL (`transfer-submitted-ids-card`),
// with a zoom control over it. Under it, DATA MATCH: what the ID on show says
// about its holder, checked against the details the request was filed with,
// one chip per fact — so a processor sees a mismatch before verifying rather
// than after. Then "View Full" (the carousel's light-box) and Verify.
//
// Verification is the PARTY'S, not one ID's: it records that the person's
// identity was checked against what they filed. The page holds the state.

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Check, IdCard, Maximize2, TriangleAlert, X } from "lucide-react";
import { OSPBadge, PrimarySmButton, SecondarySmButton } from "osp-ui-kit";

import { formatFiledDate } from "@/app/(pis)/data";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { TransferSubmittedId } from "../data/types";
import {
  IdCounter,
  TransferSubmittedIdsViewer,
  useIdCarousel,
} from "./transfer-submitted-ids-card";
import { ZoomControl } from "./zoom-control";

/** The facts about a person the ID is checked against. */
export interface ValidIdParty {
  lastName: string;
  firstName: string;
  middleName: string;
  /** ISO date (yyyy-mm-dd). */
  dateOfBirth: string;
}

interface MatchResult {
  key: string;
  ok: boolean;
  /** What the chip says — the request's value. */
  shown: string;
  /** What the ID says instead, when it does not match. */
  onId?: string;
}

const norm = (value: string) => value.trim().toUpperCase();

/** Name and birthdate on the ID, against the party's. */
function matchId(id: TransferSubmittedId, party: ValidIdParty): MatchResult[] {
  const { holder } = id;
  const nameOk =
    norm(holder.lastName) === norm(party.lastName) &&
    norm(holder.firstName) === norm(party.firstName) &&
    norm(holder.middleName) === norm(party.middleName);
  const dobOk = holder.dateOfBirth === party.dateOfBirth;

  return [
    {
      key: "Name",
      ok: nameOk,
      shown: `${party.lastName}, ${party.firstName}`,
      onId: nameOk
        ? undefined
        : `${holder.lastName}, ${holder.firstName} ${holder.middleName}`,
    },
    {
      key: "DOB",
      ok: dobOk,
      shown: party.dateOfBirth ? formatFiledDate(party.dateOfBirth) : "—",
      onId:
        dobOk || !holder.dateOfBirth
          ? undefined
          : formatFiledDate(holder.dateOfBirth),
    },
  ];
}

function MatchChip({ result }: { result: MatchResult }) {
  return (
    <Flex
      align="center"
      gap={1}
      px={2}
      py={0.5}
      maxW="full"
      borderWidth="1px"
      borderRadius="sm"
      bg={result.ok ? "green.50" : "red.50"}
      borderColor={result.ok ? "green.200" : "red.200"}
      color={result.ok ? "green.700" : "red.700"}
      title={result.ok ? "Matches the request" : `ID shows ${result.onId}`}
    >
      <Box display="flex" flexShrink={0}>
        {result.ok ? (
          <Check size={11} strokeWidth={3} />
        ) : (
          <X size={11} strokeWidth={3} />
        )}
      </Box>
      <Text fontSize="2xs" fontWeight="600" truncate>
        {result.key}: {result.shown}
      </Text>
    </Flex>
  );
}

export interface TransferValidIdCardProps {
  /** "Transferor Valid ID" or "Transferee Valid ID". */
  title: string;
  /** The party the IDs belong to, as the request has them. */
  party: ValidIdParty;
  /** Their proofs of identity, in the order they were filed. */
  documents: TransferSubmittedId[];
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
}

export function TransferValidIdCard({
  title,
  party,
  documents,
  verified,
  onVerifiedChange,
}: TransferValidIdCardProps) {
  const carousel = useIdCarousel(documents);
  const [zoom, setZoom] = useState(1);

  // Back to fitted whenever the set changes — the card stays mounted as the
  // user moves down the list.
  useEffect(() => {
    setZoom(1);
  }, [documents]);

  const current = documents[carousel.index];
  const matches = useMemo(
    () => (current ? matchId(current, party) : []),
    [current, party],
  );
  const mismatches = matches.filter((m) => !m.ok);
  const hasIds = documents.length > 0;

  return (
    <SectionCard
      icon={<IdCard size={14} />}
      title={title}
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      action={
        verified ? (
          <OSPBadge type="success">Verified ID</OSPBadge>
        ) : (
          <OSPBadge type="warning">Not Verified</OSPBadge>
        )
      }
      fill
    >
      <Flex direction="column" gap={3} flex="1" minH={0}>
        {hasIds && (
          <Flex align="center" justify="space-between" gap={2}>
            <IdCounter carousel={carousel} />
            <ZoomControl zoom={zoom} onZoomChange={setZoom} label="ID" />
          </Flex>
        )}

        {/* A FIXED HEIGHT FROM `lg`, so the two Valid ID cards in a row end
            level whatever the scans' shapes; the viewer fits or scrolls the
            scan inside it. Stacked, it is as tall as the scan needs. */}
        <Flex direction="column" h={{ base: "auto", lg: "300px" }} minH={0}>
          <TransferSubmittedIdsViewer
            documents={documents}
            carousel={carousel}
            zoom={zoom}
          />
        </Flex>

        {mismatches.length > 0 && (
          <Flex
            gap={2}
            align="flex-start"
            px={3}
            py={2}
            borderWidth="1px"
            borderColor="red.200"
            bg="red.50"
            color="red.700"
            borderRadius="md"
          >
            <Box display="flex" flexShrink={0} mt="2px">
              <TriangleAlert size={14} />
            </Box>
            <Box minW={0}>
              {mismatches.map((m) => (
                <Text key={m.key} fontSize="xs">
                  <Text as="span" fontWeight="700">
                    {m.key} does not match.
                  </Text>{" "}
                  The ID shows {m.onId}; the request shows {m.shown}.
                </Text>
              ))}
            </Box>
          </Flex>
        )}

        {/* DATA MATCH, then the card's two actions at the right. */}
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={2}
          pt={3}
          mt="auto"
          borderTopWidth="1px"
          borderColor="border.muted"
        >
          <Flex align="center" wrap="wrap" gap={1.5} minW={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              Data Match:
            </Text>
            {hasIds ? (
              matches.map((m) => <MatchChip key={m.key} result={m} />)
            ) : (
              <Text fontSize="xs" color="gray.400">
                No ID to check
              </Text>
            )}
          </Flex>

          <Flex gap={1.5} ml="auto" flexShrink={0}>
            <SecondarySmButton
              disabled={!hasIds}
              onClick={() => carousel.setZoomed(true)}
            >
              <Maximize2 size={14} />
              View Full
            </SecondarySmButton>
            {verified ? (
              <SecondarySmButton onClick={() => onVerifiedChange(false)}>
                <X size={14} />
                Unverify
              </SecondarySmButton>
            ) : (
              <PrimarySmButton
                disabled={!hasIds}
                onClick={() => onVerifiedChange(true)}
              >
                <Check size={14} />
                Verify
              </PrimarySmButton>
            )}
          </Flex>
        </Flex>
      </Flex>
    </SectionCard>
  );
}

export default TransferValidIdCard;
