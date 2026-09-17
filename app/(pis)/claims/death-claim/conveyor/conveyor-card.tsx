"use client";

// THE CLAIM — which one, where it is, and what is being claimed.
//
// THE CREATE FORM IS GONE, and that is what makes one screen possible. The
// branch files the claim; the processor's job is to CONFIRM what was filed and
// say what should happen to it. So everything here is read-only — a thing to
// check, not a thing to fill in.
//
// NO FOLD. There was one, and it emptied out: the processor is always the
// branch that filed the claim, so naming them told a branch user their own name;
// the territory follows from the branch; and the status is three characters a
// reader decodes at a glance, so it belongs in the open. What was left did not
// justify a control.
//
// THE HEADING KEEPS ITS LABELS, and that is the whole point of the arrangement.
// A heading usually drops them, and "Accidental Death Benefit · Electrocution"
// under a claim number is two strings a processor has to work out — the second
// one especially, since a bare "Electrocution" could be almost anything about a
// death claim. What makes this a heading is hierarchy: the number is large, the
// facts beneath it are small and quiet. Nothing is gained by also taking the
// words away.
//
// THE NATURE IS THE TOP LINE, above the claim number, and it is read off the
// claim rather than written in. Every claim this queue serves is a death claim
// today — see `kind` on `DeathClaim` — so the line is a constant, and that is
// precisely why it must not be a literal: when the waiver and dismemberment
// queues arrive, this heading is already right.
//
// SPECIAL / REGULAR IS A DEATH CLAIM'S BADGE AND NOBODY ELSE'S. The split comes
// from filing within seven days of the incident, which is a death claim rule; a
// waiver or a dismemberment has no such category, and a badge reading "Regular"
// on one would be inventing a distinction that does not exist. So it is drawn
// only when the nature calls for it — and the same caveat applies one level
// down, to the priority half of `compareByQueueOrder`.
//
// THE BADGES SIT ON THE RIGHT, opposite the identity rather than trailing it.
// They answer a different question: the number says WHICH claim, the badges say
// what state it is in and why it came up when it did. Trailing the number they
// read as part of it.
//
// WHAT IS ABOUT THE PERSON IS NOT HERE. Contestability, account status, the date
// of death and the age at it are all facts about the PLAN HOLDER, not about this
// filing, and the card below is the plan holder's own — the same
// `PlanholderInfoCard` v1 and v2 use, which carries every one of them. A copy
// here would be the same facts twice on one screen.

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { deathBenefitLabel, formatFiledDate } from "@/app/(pis)/data";
import { getClaimDecision } from "../../claim-store";
import { InfoLabel } from "../../components/info-label";
import { CARD_SHAPE } from "../../components/section-card";
import {
  filedFullDisplay,
  type DeathClaim,
} from "../death-claims-data";
import { ClaimPipeline } from "./claim-pipeline";

export function ConveyorCard({ claim }: { claim: DeathClaim }) {
  const special = claim.type === "special";

  /**
   * WHAT THE PROCESSOR CONCLUDED — the one thing a supervisor is here to agree
   * or disagree with, and the only reason verification is a step rather than a
   * rubber stamp.
   *
   * Read off the store rather than passed in, and drawn whenever it EXISTS
   * rather than when the page says the stage is verification. A claim in the
   * process queue has no recommendation on it — that is what makes it a process
   * claim — so the condition is the same either way, and a claim returned for
   * rework carries no stale one because `returnToProcessor` clears it.
   */
  const recommendation = getClaimDecision(claim.reference);

  /**
   * Whether this nature HAS a priority split at all.
   *
   * `type` is on every claim the view-model builds, and for a waiver or a
   * dismemberment it would be a value with nothing behind it — the seven-day
   * rule that makes a claim Special is a death claim rule. Asking the nature is
   * the only honest way to know whether the field means anything.
   */
  const hasPriority = claim.kind === "Death Claim";

  return (
    // The shared shape, not a restatement of it — see `CARD_SHAPE`.
    <Box {...CARD_SHAPE} bg="white" overflow="hidden">
      {/* WHICH CLAIM. The number leads because it is what the claim is quoted
          by, and the type badge beside it because it is why this one is on
          screen before the others. */}
      <Box px={{ base: 4, md: 5 }} pt={{ base: 4, md: 5 }}>
        <Flex align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box minW={0}>
            <Text
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="gray.400"
              mb="2px"
            >
              {claim.kind}
            </Text>

            <Text
              fontSize="lg"
              fontWeight="800"
              color="gray.900"
              letterSpacing="-0.01em"
            >
              {claim.claimNo ?? claim.reference}
            </Text>

            <Text fontSize="xs" color="gray.500" mt="2px">
              Filed {filedFullDisplay(claim)} · {claim.requestingBranch}
            </Text>
          </Box>

          <Flex gap={2} flexShrink={0} align="center">
            {/* DEATH CLAIMS ONLY — see the note at the top of this file. */}
            {hasPriority && (
              <Box
                px={2}
                py="1px"
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                bg={special ? "#FFF1F2" : "#F0FDF4"}
                color={
                  special ? BRAND_COLORS.destructiveRed : BRAND_COLORS.darkGreen
                }
              >
                {special ? "Special" : "Regular"}
              </Box>
            )}
            {/* THE STATUS, in the open. It is one or two words a processor
                reads without thinking — "Pending", "For Approval" — so it costs
                a badge and saves a disclosure. */}
            <Box
              px={2}
              py="1px"
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
              bg="gray.100"
              color="gray.600"
            >
              {claim.phase}
            </Box>
          </Flex>
        </Flex>

        {/* WHAT IS BEING CLAIMED, AND HOW — labelled, for the reason at the top
            of this file. Two tracks and not the four the panels below use: a
            pair reads as a pair, where the same two facts spread across a
            four-column grid look like the start of a list with two missing. */}
        <SimpleGrid
          columns={{ base: 1, sm: 3 }}
          gapX={4}
          gapY={3}
          mt={4}
          pt={4}
          pb={{ base: 4, md: 5 }}
          borderTopWidth="1px"
          borderColor="gray.100"
        >
          <InfoLabel
            label="Benefit"
            value={deathBenefitLabel(claim.benefits)}
          />
          <InfoLabel label="Cause" value={claim.typeOfIncident} />
          {/* The incident date and not the filing date: it is what makes this
              claim Special — one filed within seven days of the incident
              overtakes — so it is the date the queue order turns on. */}
          <InfoLabel label="Date of Incident" value={claim.incidentDate} />
        </SimpleGrid>
      </Box>

      {/* THE RECOMMENDATION, BETWEEN THE CLAIM AND ITS PIPELINE. It belongs to
          neither: it is not a fact about the filing, and it is not a stage. It
          is the previous reader's answer, and it sits where a supervisor meets
          it on the way down — after what the claim IS, before what happens next.

          Green for approval, red for denial, because at a glance the direction
          matters more than the words; the words are there for the second
          glance. */}
      {recommendation && (
        <Box
          px={{ base: 4, md: 5 }}
          py={3}
          borderTopWidth="1px"
          borderColor="gray.100"
          bg={
            recommendation.outcome === "approval"
              ? BRAND_COLORS.successBg
              : BRAND_COLORS.errorBg
          }
        >
          <Text
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="gray.500"
            mb="2px"
          >
            Processor&apos;s recommendation
          </Text>
          <Text
            fontSize="sm"
            fontWeight="700"
            color={
              recommendation.outcome === "approval"
                ? BRAND_COLORS.darkGreen
                : BRAND_COLORS.destructiveRed
            }
          >
            {recommendation.outcome === "approval"
              ? "Endorsed for approval"
              : "Endorsed for denial"}
            <Text as="span" fontWeight="500" color="gray.600">
              {" · "}
              {recommendation.decidedBy}
              {" · "}
              {formatFiledDate(recommendation.decidedAtISO)}
            </Text>
          </Text>
          {/* THE REASON, WHEN THERE IS ONE. A denial always carries one — the
              dialog refuses without it — and it is the sentence the supervisor
              is actually being asked to accept or reject. */}
          {recommendation.reason && (
            <Text fontSize="xs" color="gray.600" mt="2px">
              {recommendation.reason}
            </Text>
          )}
        </Box>
      )}

      <ClaimPipeline claim={claim} />

    </Box>
  );
}

export default ConveyorCard;
