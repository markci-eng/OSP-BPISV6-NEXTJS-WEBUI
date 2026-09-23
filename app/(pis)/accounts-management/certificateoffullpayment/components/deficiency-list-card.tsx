"use client";

// COFP With Deficiency — the accounts a certificate was asked for that are not
// fully paid yet, so Generate cannot raise one.
//
// ITS OWN CARD, under the request rail (user, 2026-09-22). It was a second list
// inside that card and is not any more: these rows are a different job from the
// rows above them — a queue to chase a balance on, not the queue being worked
// through — and a card of its own is what says so without a caption having to.
//
// Under the GENERATE view only. Every other view is a certificate that has
// already been raised, by which point the account was settled, so the page
// hands this card nothing and it does not render.

import { Box, Flex, Text } from "@chakra-ui/react";

import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import type { CofpDeficiencyRequest } from "../data/types";
import { LIST_HEIGHT, ROW_GAP, RequestRow } from "./request-row";

/** The warning colour the plan holder card uses for a value worth stopping on. */
const WARNING = "#e11d48";

/** Pesos as the ledger prints them, to the centavo. */
function peso(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface CofpDeficiencyListCardProps {
  requests: CofpDeficiencyRequest[];
  /** The row drawn as picked — the same selection the rail above shares. */
  selectedId?: string;
  onSelect: (request: CofpDeficiencyRequest) => void;
}

export function CofpDeficiencyListCard({
  requests,
  selectedId,
  onSelect,
}: CofpDeficiencyListCardProps) {
  return (
    <Box
      // The same white ground as the rail above it and the plan holder card
      // beside it — see the note on it in `request-list-card`.
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      // The same corner as the rail above it and the plan holder card beside
      // it — see the note on that radius in `request-list-card`.
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      display="flex"
      flexDirection="column"
      // No cap of its own: the list inside is the same fixed five rows the
      // rail above shows, which is what keeps the two lists level.
      overflow="hidden"
    >
      {/* A TITLE, which the rail above does without: its rows are self-evidently
          the action's own, and these are not — without the words, a second run
          of plan holders under the first reads as more of the same. */}
      <Flex align="baseline" gap={2} mb={3} flexShrink={0}>
        <Text fontSize="sm" fontWeight="700" color={WARNING}>
          COFP With Deficiency
        </Text>
        <Text fontSize="xs" color="gray.400">
          {requests.length}
        </Text>
      </Flex>

      {/* FIVE ROWS TALL, exactly — the same height as the rail's list above,
          so the two are level whether this holds two accounts or twenty. */}
      <Flex
        direction="column"
        gap={`${ROW_GAP}px`}
        h={`${LIST_HEIGHT}px`}
        flexShrink={0}
        overflowY="auto"
      >
        {requests.length === 0 && (
          <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
            No account is short.
          </Text>
        )}

        {requests.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            active={request.id === selectedId}
            onClick={() => onSelect(request)}
            // WHAT IT IS SHORT stands where the LPA number does on the rail
            // above: it is the one fact that puts the row in this card, so it
            // is what the row is scanned for. The LPA number goes under it
            // rather than away — a row is still confirmed by it before
            // anybody rings the branch.
            trailing={
              <Box flexShrink={0} textAlign="end">
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="mono"
                  color={WARNING}
                  whiteSpace="nowrap"
                >
                  {peso(request.deficiency)}
                </Text>
                <Text
                  fontSize="10px"
                  fontFamily="mono"
                  color="gray.400"
                  whiteSpace="nowrap"
                >
                  {request.lpaNo}
                </Text>
              </Box>
            }
          />
        ))}
      </Flex>
    </Box>
  );
}

export default CofpDeficiencyListCard;
