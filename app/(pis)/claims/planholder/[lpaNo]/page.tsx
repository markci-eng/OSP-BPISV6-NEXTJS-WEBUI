"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Flex,
  Box,
  Grid,
  Separator,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuUserX } from "react-icons/lu";
import { Page } from "osp-ui-kit";
import { useClaimStore } from "../../claim-store";
import {
  getClaimRequests,
  getPlanholder,
  getPlanholderRemarks,
} from "../../claims-data";
import { PlanholderClaimDetail } from "../components/PlanholderClaimDetail";
import { PlanholderSwapSkeleton } from "../components/PlanholderSwapSkeleton";
import { PlanholderProfileHeader } from "../components/PlanholderProfileHeader";
import { PlanholderInfoCard } from "../components/PlanholderInfoCard";
import { PlanholderRemarks } from "../components/PlanholderRemarks";
import { PlanholderClaimRequests } from "../components/PlanholderClaimRequests";
import { PlanholderDocuments } from "../components/PlanholderDocuments";
import { PlanholderPayments } from "../components/PlanholderPayments";
import { PlanholderBeneficiaries } from "../components/PlanholderBeneficiaries";
import { PlanholderOtherPlans } from "../components/PlanholderOtherPlans";
import { PlanholderActionsMenu } from "../components/PlanholderActionsMenu";
import { PlanholderPlanActions } from "../components/PlanholderPlanActions";
import { PlanholderQuickSearch } from "../../components/planholder-quick-search";

/**
 * How long the swap's placeholder is held, in milliseconds.
 *
 * Long enough to read as a transition and not a flicker, short enough that it
 * is never a wait: the content behind it is already in hand — this is mock data
 * resolved synchronously — so every millisecond here is one the user is paying
 * for the ANIMATION, not for the page.
 */
const SWAP_MS = 320;

/**
 * Fades content in behind the placeholder rather than cutting to it. Declared
 * once here and applied to both layouts, since either can be the one arriving.
 */
const SWAP_FADE = {
  "@keyframes planholderSwapIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  animation: "planholderSwapIn 0.22s ease-out",
  // A reader who has asked for less motion gets the content, immediately.
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

/** Shown when the route param doesn't match any plan holder on file. */
function PlanholderNotFound({ lpaNo }: { lpaNo: string }) {
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
        <LuUserX size={28} />
      </Box>
      <Text fontSize="lg" fontWeight="700" color="gray.800">
        Plan Holder Not Found
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="360px">
        {lpaNo ? (
          <>
            No plan holder is on file for LPA No.{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {lpaNo}
            </Text>
            .
          </>
        ) : (
          "No plan was specified."
        )}
      </Text>
    </Flex>
  );
}

export default function ClaimsPlanholderPage() {
  const params = useParams<{ lpaNo: string }>();
  const lpaNo = decodeURIComponent(params?.lpaNo ?? "");

  // Re-read whenever a claim is acted on, so verifying or endorsing the open
  // claim shows the result rather than the copy taken when it was tapped.
  useClaimStore();

  // The plan holder is looked up directly by its LPA number (the unique key).
  const planholder = lpaNo ? getPlanholder(lpaNo) : undefined;

  /**
   * Whether the page is two columns — the same `xl` the rail appears at.
   * `false` until measured, so the server and the first client render agree.
   */
  const isDesktop =
    useBreakpointValue({ base: false, xl: true }, { ssr: false }) ?? false;

  // The claim the page is showing INSTEAD of the profile, held by reference
  // rather than as a snapshot: acting on it writes to the store, and looking it
  // up again each render is what lets the view show the result.
  //
  // Only ever set from the rail — below `xl` a tapped claim opens the drawer
  // the list owns, and this stays null. Which also means shrinking the window
  // with a claim open falls back to the profile, and the claim is one tap away
  // again rather than stranded in a layout that no longer exists.
  const [openClaimRef, setOpenClaimRef] = useState<string | null>(null);
  const openClaim =
    isDesktop && openClaimRef && planholder
      ? (getClaimRequests(planholder.lpaNo).find(
          (c) => c.reference === openClaimRef,
        ) ?? null)
      : null;

  // Whether the placeholder is up. Both columns change at once during a swap,
  // and cutting straight between them reads as a flicker rather than a move —
  // see `PlanholderSwapSkeleton`.
  const [swapping, setSwapping] = useState(false);
  const swapTimer = useRef<number | null>(null);

  /**
   * Open a claim, or (with `null`) go back to the profile.
   *
   * The placeholder is only for the DESKTOP swap. Below `xl` the same tap opens
   * the drawer the list owns: the page underneath does not change, so there is
   * nothing to cover and a placeholder would only blink over a page that was
   * about to be hidden anyway.
   */
  const swapTo = useCallback(
    (reference: string | null) => {
      setOpenClaimRef(reference);
      if (!isDesktop) return;

      setSwapping(true);
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => {
        setSwapping(false);
        swapTimer.current = null;
      }, SWAP_MS);
    },
    [isDesktop],
  );

  // A swap left mid-flight — navigating away, or the claim opened from a list
  // that unmounts — must not call back into a page that is gone.
  useEffect(
    () => () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    },
    [],
  );

  return (
    <Page.Root
      subtitle="Claims"
      title="Planholder Profile"
      description="Explore the plan holder's details, claims, and documents."
      // Phone only, the same as the dashboard and the create form: a desktop
      // has the sidebar and the browser's own back button, and the arrow beside
      // the title says nothing the page does not.
      headerButton="back-mobile"
      // The shell's 96px reserve is for the mobile bottom navigation; a desktop
      // does not render it and should not scroll past it.
      paddingBottom={{ base: "96px", lg: "24px" }}
    >
      {/* The plan's actions, in the page header's tool slot — far right of the
          title row. A PHONE only: the title row is the width of the screen
          there and there is nowhere better, while a desktop shows the same
          three actions spelled out above Claim Requests (see below). Only
          rendered for a plan that exists — there is nothing to act on
          otherwise. */}
      {planholder && (
        <Page.ToolContent>
          <Box display={{ base: "block", lg: "none" }}>
            <PlanholderActionsMenu planholder={planholder} />
          </Box>
        </Page.ToolContent>
      )}

      <Page.MainContent>
        <Page.Row>
          {planholder && swapping ? (
            /* Mid-swap. Shaped like the layout ARRIVING, so the real content
               lands on a shape that is already correct. */
            <PlanholderSwapSkeleton target={openClaimRef ? "claim" : "profile"} />
          ) : planholder && openClaim ? (
            /* A claim is open, and this is a desktop — so the page IS the
               claim. The two columns swap roles: the claim takes the main one
               and the plan holder becomes the summary beside it, which is
               exactly the shape the death-claim create form uses. The rest of
               the profile — payments, beneficiaries, other plans, the folder —
               is not on screen, because none of it is what a processor opened
               the claim to read. "<" in the claim's own header brings it back.

               Below `xl` this branch is never taken: `openClaim` is null there
               and the list opens its drawer instead. */
            <Box css={SWAP_FADE}>
              {/* Both columns are the claim view's own — the actions and the
                  plan holder in the rail belong to it, and the sheets they open
                  are its state. The page only decides WHICH claim. */}
              <PlanholderClaimDetail
                claim={openClaim}
                planholder={planholder}
                onBack={() => swapTo(null)}
                asPage
              />
            </Box>
          ) : planholder ? (
            <>
              {/* Two columns from `xl`, the same shape as the death dashboard
                  and the create form: what is read on the left, what is WORKED
                  on the right. */}
              <Grid
                // `minmax(0, …)` on the stacked track as well, and not just the
                // desktop one: a plain `1fr` floors at the widest child's
                // min-content, and a section here that will not wrap below some
                // width — a row of nowrap labels, a table — would push the whole
                // column past the phone's screen rather than scroll inside
                // itself, as it does today outside a grid.
                templateColumns={{
                  base: "minmax(0, 1fr)",
                  xl: "minmax(0, 1fr) 380px",
                  "2xl": "minmax(0, 1fr) 420px",
                }}
                // Stacked, every section brings its own top margin, so the grid
                // adds nothing between them. Side by side there is a gutter.
                gap={{ base: 0, xl: 6 }}
                alignItems="start"
                // Fades in when this is the layout ARRIVING from a swap back.
                // It also runs on the page's first paint, which is the same
                // thing happening for the same reason.
                css={SWAP_FADE}
              >
                {/* The record: who they are, what has been said, what has been
                    paid, who benefits, what else they hold.

                    `display: contents` up to `xl` is what lets this page be two
                    columns without reordering the phone. Stacked, the wrapper
                    disappears and its sections become children of the grid
                    itself, so `order` can interleave them with the rail's — the
                    phone keeps summary, remarks, CLAIMS, DOCUMENTS, payments,
                    beneficiaries, other plans, exactly as before. From `xl` the
                    wrapper is a real box again, the orders stop applying, and
                    each column stacks its own. */}
                <Box display={{ base: "contents", xl: "block" }}>
                  {/* Who this is. In the left column rather than across both,
                      so it is the width of the summary that follows it — and,
                      more to the point, so the rail starts at the TOP of the
                      page: a claim request and the folder are the two things
                      worth reaching from anywhere, and a full-width header
                      above them would push them a header's height down before
                      they could be seen at all. */}
                  <Box order={0}>
                    <PlanholderProfileHeader planholder={planholder} />
                  </Box>

                  <Box mt={4} order={1}>
                    <PlanholderInfoCard planholder={planholder} asDetails />
                  </Box>

                  <Box mt={4} order={2}>
                    <PlanholderRemarks
                      remarks={getPlanholderRemarks(planholder.lpaNo)}
                      showNotes={false}
                    />
                  </Box>

                  <Box mt={4} order={6}>
                    <PlanholderPayments lpaNo={planholder.lpaNo} />
                  </Box>

                  <Box mt={4} order={7}>
                    <PlanholderBeneficiaries lpaNo={planholder.lpaNo} />
                  </Box>

                  {/* Renders nothing when the person holds no other plan, so the
                      wrapper's top margin must not collapse into a gap. */}
                  <Box order={8}>
                    <PlanholderOtherPlans
                      personId={planholder.personId}
                      currentLpaNo={planholder.lpaNo}
                    />
                  </Box>
                </Box>

                {/* The work: the claims filed against this plan, and the folder
                    of documents they are decided on. Everything else on this
                    page is looked up; these two are acted on — a request opened,
                    a file added — so on a desktop they stop being two stops down
                    a long scroll and stand in a column that follows it. */}
                <Box
                  display={{ base: "contents", xl: "flex" }}
                  flexDirection="column"
                  position={{ xl: "sticky" }}
                  top={{ xl: "8px" }}
                  // A CEILING, not a height: one screenful is the most the rail
                  // may take, and short sections leave it shorter than that
                  // rather than padding themselves out to reach it. The shell's
                  // header takes 64px above the scrollport and this sits 8px
                  // into it.
                  //
                  // The rail used to scroll ITSELF past that height, which put
                  // the two things worth reaching — a claim request, the folder
                  // — behind a scroll of a column that is already pinned. Now
                  // the ceiling is a budget the sections divide between them
                  // and each scrolls its own ITEMS inside its share, so both
                  // headings stay on screen and how many rows are under them is
                  // whatever the device is tall enough for.
                  maxH={{ xl: "calc(100vh - 88px)" }}
                  overflow={{ xl: "hidden" }}
                >
                  {/* The way to ANOTHER plan holder, above the actions for this
                      one — the same field the dashboard carries, so the search
                      is in the same place on both of the pages a processor
                      lives in.

                      `order: 2` puts it ahead of the actions at `xl`, where the
                      rail is a flex column. Below that it is not rendered at
                      all, so it takes no part in the stacked order: the phone
                      gets a field of its own design later, and this one would
                      be the wrong shape full-width.

                      It takes its OWN height — the field's, and nothing more.
                      It used to be stretched to the profile card's, so that the
                      rail's second row started level with the plan details
                      opposite, and the cost was a search bar several times the
                      height of a search bar with the plan's actions pushed to
                      the bottom of it. The field is a field; the actions follow
                      it immediately.

                      No top margin: both columns start at the grid's top edge,
                      and a margin here would offset one of them by itself —
                      which is what keeps this level with the top of the profile
                      card beside it. */}
                  <Box
                    order={2}
                    display={{ base: "none", xl: "block" }}
                    flexShrink={0}
                  >
                    <PlanholderQuickSearch compact />
                  </Box>

                  {/* The plan's actions, at the top of the work column. On a
                      desktop only: they were a "More" pill in the Claim
                      Requests heading, which hid three operations behind a tap
                      on a screen with room to spell them out. A phone does not
                      have that room and keeps the pill, in the header above. */}
                  <Box
                    mt={4}
                    order={3}
                    display={{ base: "none", lg: "block" }}
                    // A row of buttons costs what it costs; the height left
                    // over is what the two sections below divide.
                    flexShrink={0}
                  >
                    <PlanholderPlanActions planholder={planholder} />
                  </Box>

                  {/* `0 1 auto` — shrink, never grow. The height each section
                      ASKS for is its content's; the rail only ever takes height
                      away, in proportion to how much was asked for, and what is
                      taken becomes a scroll inside that section's own list.
                      `minH: 0` is what lets a flex item shrink below its
                      content at all.

                      The grow half is deliberately off. With it, a plan with
                      two claim requests had its list stretched to half the rail
                      regardless — a short list with a long blank below it and
                      the Documents heading pushed down past it. Height follows
                      content; only the CAP comes from the screen. */}
                  <Box
                    mt={4}
                    order={4}
                    // Flex in its own right, not just a flex ITEM: the section
                    // inside sizes itself against this box, and a block parent
                    // gives it no height to size against — it would grow to fit
                    // every card and be clipped by the rail instead of
                    // scrolling its own list.
                    display={{ xl: "flex" }}
                    flexDirection="column"
                    flex={{ xl: "0 1 auto" }}
                    minH={{ xl: 0 }}
                  >
                    <PlanholderClaimRequests
                      lpaNo={planholder.lpaNo}
                      // In the rail the list does NOT open a drawer — it hands
                      // the claim up here and the page swaps to it. Below `xl`
                      // this still fires, and setting it is harmless: the
                      // swapped view is gated on `isDesktop`, so the drawer the
                      // list opened is what is seen.
                      onSelect={(claim) => swapTo(claim.reference)}
                    />
                  </Box>

                  <Box
                    mt={4}
                    order={5}
                    display={{ xl: "flex" }}
                    flexDirection="column"
                    flex={{ xl: "0 1 auto" }}
                    minH={{ xl: 0 }}
                    // The rail's last section: the margin below it is the gap
                    // to the bottom of the screenful, not to another section.
                    pb={{ xl: 1 }}
                  >
                    <PlanholderDocuments personId={planholder.personId} />
                  </Box>
                </Box>
              </Grid>
            </>
          ) : (
            <PlanholderNotFound lpaNo={lpaNo} />
          )}
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
