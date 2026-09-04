"use client";

import { useParams } from "next/navigation";
import { Flex, Box, Grid, GridItem, Text } from "@chakra-ui/react";
import { LuFileX } from "react-icons/lu";
import { Page } from "osp-ui-kit";
import { getPlanholder } from "../../../../claims-data";
import { getDeathClaim } from "../../death-claims-data";
import { PlanholderProfileHeader } from "../../../../planholder/components/PlanholderProfileHeader";
import { PlanholderDetailsDrawer } from "../../../../planholder/components/PlanholderDetailsDrawer";
import { DeathClaimForm } from "./components/DeathClaimForm";

/** Shown when the reference doesn't match a claim / plan holder on file. */
function ClaimNotFound({ reference }: { reference: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={{ base: 16, md: 24 }}
      gap={3}
    >
      <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
        <LuFileX size={28} />
      </Box>
      <Text fontSize="lg" fontWeight="700" color="gray.800">
        Claim Not Found
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="360px">
        {reference ? (
          <>
            No claim is on file for reference{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {reference}
            </Text>
            .
          </>
        ) : (
          "No claim was specified."
        )}
      </Text>
    </Flex>
  );
}

export default function CreateDeathClaimPage() {
  const params = useParams<{ reference: string }>();
  const reference = decodeURIComponent(params?.reference ?? "");

  // Resolve the claim request being processed, then the plan holder that owns
  // its plan. No claim header exists yet — submitting this form opens one.
  const claim = reference ? getDeathClaim(reference) : undefined;
  const planholder = claim ? getPlanholder(claim.lpaNo) : undefined;

  return (
    <Page.Root
      subtitle="Death Claim"
      title="Create Claim"
      description={claim ? `${claim.reference}` : undefined}
      // The chevron is the phone's way back — the only one it has, since the
      // sidebar is behind a menu there. On a desktop that sidebar is on screen
      // with Death Claim already on it, and the browser has its own back button,
      // so the arrow sits beside the title saying nothing the page does not.
      // Same as the dashboard, which carries no arrow on a desktop either.
      headerButton="back-mobile"
      // The shell reserves 96px under every page for the bottom navigation,
      // which is mobile-only — on a desktop it is a strip of nothing the form
      // has to scroll past. Handed back on `lg`, where that navigation stops
      // being rendered. Same figures as the dashboard.
      paddingBottom={{ base: "96px", lg: "24px" }}
    >
      <Page.MainContent>
        <Page.Row>
          {claim && planholder ? (
            <Grid
              templateColumns={{
                base: "1fr",
                xl: "minmax(0, 1fr) 360px",
                "2xl": "minmax(0, 1fr) 400px",
              }}
              // Stacked, the sections space themselves — the details card brings
              // its own `mt`, and so does the form — so the grid adds nothing.
              // Side by side there is a gutter between the columns instead.
              gap={{ base: 0, xl: 6 }}
              // Each column as tall as its own content: the summary is a third
              // of the form's height, and stretching it would only put a card's
              // worth of empty white beside the fields. It is also what lets the
              // summary stick, since a stretched item has nowhere to travel.
              alignItems="start"
            >
              {/* The plan holder, written FIRST so that stacked — every phone,
                  and every window under `xl` — the page opens the way it always
                  has: who this claim is about, then the form for it. `order`
                  swaps them on a wide screen, where the form takes the main
                  column and this becomes the right one. */}
              <GridItem
                order={{ base: 0, xl: 1 }}
                minW={0}
                // Follows the scroll on a desktop. The form is long and every
                // line of it is about this person — the plan it was filed
                // against, who died, where the payee lives — so the summary is
                // worth more beside the fields than above them.
                position={{ xl: "sticky" }}
                top={{ xl: "8px" }}
              >
                {/* Picks its own layout from the width it is given — this rail
                    is 360px, so it lands on the stacked one. See
                    `PlanholderProfileHeader`. */}
                <PlanholderProfileHeader planholder={planholder} />
                <PlanholderDetailsDrawer planholder={planholder} />
              </GridItem>

              <GridItem order={{ base: 1, xl: 0 }} minW={0}>
                {/* The gap under the summary, stacked. Side by side there is
                    nothing above the form to be clear of. */}
                <Box mt={{ base: 6, xl: 0 }}>
                  <DeathClaimForm claim={claim} planholder={planholder} />
                </Box>
              </GridItem>
            </Grid>
          ) : (
            <ClaimNotFound reference={reference} />
          )}
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
