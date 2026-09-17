"use client";

// What a claim looks like inside a floating window, and how one is described to
// the dock.
//
// A WINDOW IS NOT A PROFILE. The plan holder page is the full record and stays
// where it is — this shows what a processor decides FROM: who the claim is for,
// what was filed, when, by whom, and how far along it is. Everything a second
// opinion needs and nothing that would make the window a page in a box.
//
// The "Open full profile" action is therefore the window's most important
// control, not an afterthought: the window answers the quick question and hands
// off the long one.

import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { LuExternalLink } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { deathBenefitLabel } from "@/app/(pis)/data";
import {
  planholderName,
  toSurnameFirst,
  type DeathClaim,
} from "../../../death-claim/death-claims-data";
import type { DockWindow } from "./floating-dock";

/** The dock's key for a claim window. */
export const CLAIM_WINDOW_KIND = "claim";

/**
 * Describes a claim to the dock.
 *
 * The id is derived from the reference, so opening the same claim from the
 * queue, the rail or the feed lands on the ONE window rather than three copies
 * of it — see `open` in the dock.
 */
export function claimWindowFor(claim: DeathClaim): Omit<DockWindow, "minimized"> {
  const name = planholderName(claim.lpaNo);
  return {
    id: `${CLAIM_WINDOW_KIND}:${claim.reference}`,
    kind: CLAIM_WINDOW_KIND,
    payload: claim.reference,
    title: claim.claimNo || claim.reference,
    subtitle: name ? toSurnameFirst(name) : claim.lpaNo,
  };
}

/** One labelled value in the window's detail grid. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box minW={0}>
      <Text
        fontSize="10px"
        fontWeight="700"
        color="gray.400"
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        {label}
      </Text>
      <Text fontSize="xs" fontWeight="600" color="gray.800" mt="2px">
        {value}
      </Text>
    </Box>
  );
}

export function ClaimWindowBody({ claim }: { claim: DeathClaim | undefined }) {
  const router = useRouter();

  // The record can go while its window is open — a claim worked to the next
  // phase leaves the queue this was opened from. Say so rather than painting an
  // empty grid.
  if (!claim) {
    return (
      <Box p={4}>
        <Text fontSize="sm" color="gray.500">
          This claim is no longer in the queue it was opened from.
        </Text>
      </Box>
    );
  }

  const name = planholderName(claim.lpaNo);

  return (
    <Flex direction="column" gap={3} p={3}>
      {/* WHO — the person the claim is for, which is the one thing a processor
          reads first and the reason the window was opened. */}
      <Box>
        <Text fontSize="sm" fontWeight="800" color="gray.900" lineClamp={2}>
          {name ? toSurnameFirst(name) : "—"}
        </Text>
        <Flex align="center" gap={2} mt={1}>
          <Text fontSize="xs" color="gray.500">
            LPA {claim.lpaNo}
          </Text>
          <Box
            px={2}
            py="1px"
            borderRadius="full"
            bg={claim.type === "special" ? "#FFF7ED" : "#F0FDF4"}
            color={
              claim.type === "special"
                ? BRAND_COLORS.warningText
                : BRAND_COLORS.darkGreen
            }
            fontSize="10px"
            fontWeight="700"
          >
            {claim.type === "special" ? "Special" : "Regular"}
          </Box>
        </Flex>
      </Box>

      <Box h="1px" bg="gray.100" />

      <Grid templateColumns="1fr 1fr" gap={3}>
        <Field label="Phase" value={claim.phase} />
        <Field label="Benefit" value={deathBenefitLabel(claim.benefits)} />
        <Field label="Date of death" value={claim.dateOfDeath} />
        <Field label="Age at death" value={claim.ageOfDeath} />
        <Field label="Incident" value={claim.typeOfIncident} />
        <Field label="Filed" value={claim.filedDisplay} />
        <Field label="Branch" value={claim.requestingBranch} />
        <Field label="Processor" value={claim.processor.name} />
      </Grid>

      <Box h="1px" bg="gray.100" />

      <Field label="Request no." value={claim.reference} />
      {claim.claimNo && <Field label="Claim no." value={claim.claimNo} />}

      {/* THE HAND-OFF — see the note at the top. The window answers the quick
          question; this is where the long one goes. */}
      <Button
        size="sm"
        variant="outline"
        borderColor={BRAND_COLORS.primaryGreen}
        color={BRAND_COLORS.darkGreen}
        _hover={{ bg: "#f4faf6" }}
        onClick={() =>
          router.push(`/claims/planholder/${encodeURIComponent(claim.lpaNo)}`)
        }
      >
        <LuExternalLink />
        Open full profile
      </Button>
    </Flex>
  );
}

export default ClaimWindowBody;
