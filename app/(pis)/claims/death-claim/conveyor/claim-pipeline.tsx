"use client";

// WHERE THIS CLAIM IS, on the way from filed to paid.
//
// The Conveyor serves one claim at a time and the processor owns exactly one
// step of its life. That is easy to lose sight of when the step is all you can
// see, so the stages are drawn across the top: what has already happened, what
// you are being asked for, and who has it after you.
//
// IT IS A READ-OUT, NOT A CONTROL. Nothing here is clickable. A processor
// cannot put a claim into "Released" by pressing Released — they answer the one
// step in front of them and the claim moves because of what they answered.

import { Flex, Box, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  getClaimComplianceReturn,
  getClaimDecision,
  getClaimRework,
  getClaimVerdict,
} from "../../claim-store";
import type { DeathClaim } from "../death-claims-data";

/**
 * The claim's life, in the order it happens.
 *
 * FIVE STAGES AND NOT THREE QUEUES. The rail on the v2 dashboard shows For
 * Process / For Verification / For Endorsement, which are the three lists a
 * claim can be sitting in — a fact about the board. These are what happens TO
 * the claim, which is a fact about the claim, and they are what a processor
 * needs when the board is not on screen.
 *
 * "Review" is the only one a processor answers. The rest are here so they can
 * see the shape of what they are part of.
 */
const STAGES = [
  "Filed",
  "Review",
  "Verification",
  "Approval",
  "Released",
] as const;

type Stage = (typeof STAGES)[number];

export function ClaimPipeline({ claim }: { claim: DeathClaim }) {
  const decision = getClaimDecision(claim.reference);
  const verdict = getClaimVerdict(claim.reference);
  // EITHER WAY BACK counts as back. A branch owes a document, or the processor
  // owes more work — the claim is at Review in both cases, and which of the two
  // it is belongs in the remarks, not in a five-word strip.
  const returned =
    getClaimComplianceReturn(claim.reference) ??
    getClaimRework(claim.reference);

  /**
   * Which stage the claim is waiting at.
   *
   * Read off what has been RECORDED rather than off the claim's status label,
   * because the two can disagree while there is no write path to the data
   * layer: answering a claim writes a decision to the local store and leaves
   * the seed's status alone. The record is the thing that just happened, so it
   * is the thing to believe.
   *
   * A returned claim shows Review as current and not done — it is coming back
   * to this same step once the branch answers, which is exactly what the
   * processor should understand about it.
   */
  /*
   * FIVE STAGES, THREE READERS, and each hand-off is a different person:
   *
   *   Review        the processor works it and endorses a recommendation
   *   Verification  the supervisor checks that recommendation and verifies
   *   Approval      the verified claim is approved and released
   *
   * Read newest-record-first, because the store is what just happened and the
   * seed's `phase` is what was true before this session started.
   *
   * A claim sent back — to the branch for compliance, or by the supervisor to
   * the processor — shows Review as current and NOT done. It is coming back to
   * that same step once somebody answers, which is exactly what should be
   * understood about it.
   */
  const current: Stage = returned
    ? "Review"
    : verdict
      ? "Approval"
      : decision
        ? "Verification"
        : "Review";
  const currentIndex = STAGES.indexOf(current);

  return (
    <Flex align="center" gap={1.5} px={{ base: 4, md: 5 }} py={3.5}>
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const now = i === currentIndex;

        return (
          <Flex key={stage} align="center" gap={1.5} minW={0} flex={i === STAGES.length - 1 ? "0 0 auto" : "1"}>
            <Flex align="center" gap={1.5} flexShrink={0}>
              <Box
                w="7px"
                h="7px"
                borderRadius="full"
                flexShrink={0}
                bg={done || now ? BRAND_COLORS.primaryGreen : "gray.200"}
                boxShadow={now ? `0 0 0 3px #E7F3EB` : undefined}
              />
              {/* The stage names shrink out of the way before the rails do —
                  on a narrow card the shape of the pipeline is still readable
                  when the words are not, and the current one keeps its name. */}
              <Text
                fontSize="11px"
                fontWeight={now ? "700" : "500"}
                whiteSpace="nowrap"
                display={now ? "block" : { base: "none", sm: "block" }}
                color={
                  now
                    ? BRAND_COLORS.darkGreen
                    : done
                      ? "gray.600"
                      : "gray.400"
                }
              >
                {stage}
              </Text>
            </Flex>

            {i < STAGES.length - 1 && (
              <Box
                flex="1"
                minW="8px"
                h="1px"
                bg={done ? BRAND_COLORS.primaryGreen : "gray.200"}
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}

export default ClaimPipeline;
