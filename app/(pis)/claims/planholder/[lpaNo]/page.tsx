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
import { LuReceipt, LuUsers, LuUserX } from "react-icons/lu";
import { Page } from "osp-ui-kit";
import { useClaimStore } from "../../claim-store";
import {
  getClaimRequests,
  getPlanholder,
  getPlanholderBeneficiaries,
  getPlanholderPayments,
  getPlanholderRemarks,
} from "../../claims-data";
import { SectionCard } from "../../components/section-card";
import { SectionLauncher, SectionPopup } from "../../components/section-popup";
import { PlanholderClaimDetail } from "../components/PlanholderClaimDetail";
import { PlanholderSwapSkeleton } from "../components/PlanholderSwapSkeleton";
import { PlanholderProfileHeader } from "../components/PlanholderProfileHeader";
import { PlanholderInfoCard } from "../components/PlanholderInfoCard";
import { PlanholderRemarks } from "../components/PlanholderRemarks";
import { PlanholderPendingRequests } from "../components/PlanholderPendingRequests";
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
    useBreakpointValue({ base: false, xl: true }) ?? false;

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
   * Which of the two LOOK-UPS is open over the page — the payment ledger, the
   * declared beneficiaries, or neither.
   *
   * See the launchers below for why they are pop-ups here and not sections.
   */
  const [popup, setPopup] = useState<"payments" | "beneficiaries" | null>(null);

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

  /**
   * Whether the claim view is up — settled OR arriving.
   *
   * Read off the REFERENCE and not the looked-up claim, so it is already true
   * during the swap: the page's heading has to be gone before the claim lands,
   * or it goes at the end of the animation and reads as a second, later move.
   */
  const claimSheetUp = isDesktop && openClaimRef !== null;

  /**
   * What the two launchers say before they are opened.
   *
   * Read on every render rather than held in state, the same as the death
   * claim's: both come out of the mock data layer synchronously, and a number
   * cached here would go stale the moment a receipt or a beneficiary was added
   * behind one of the pop-ups.
   */
  const paymentCount = planholder
    ? getPlanholderPayments(planholder.lpaNo).length
    : 0;
  const beneficiaryCount = planholder
    ? getPlanholderBeneficiaries(planholder.lpaNo).length
    : 0;

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
      // IT NO LONGER ENUMERATES "CLAIMS" (2026-09-16). The description listed
      // the page's sections, and one of them has stopped being claims-only —
      // the rail carries REQUESTS now, of which a claim is one kind. A header
      // naming a section that no longer goes by that name is the kind of
      // sentence that outlives its reason.
      //
      // `subtitle` is still the area, because that is what the route is under
      // and what every other header in this area says; it names where the page
      // LIVES, not who is allowed to read it.
      description="Explore the plan holder's details, requests, and documents."
      // Phone only, the same as the dashboard and the create form: a desktop
      // has the sidebar and the browser's own back button, and the arrow beside
      // the title says nothing the page does not.
      headerButton="back-mobile"
      // The shell's 96px reserve is for the mobile bottom navigation; a desktop
      // does not render it and should not scroll past it.
      paddingBottom={{ base: "96px", lg: "24px" }}
      /*
       * The page's own heading, dropped while a claim is open.
       *
       * A claim replaces this page rather than sitting under it, and a title
       * reading "Planholder Profile" over a view that has taken the profile's
       * place names the wrong thing. The claim names itself: the plan holder is
       * the first card on it, and the way back is directly above them.
       *
       * Done here rather than by dropping the props, because the props are still
       * right — the MOBILE bar goes on using them, and a claim never opens into
       * this branch there. Only the desktop heading is hidden.
       *
       * The shell renders three boxes in order: the mobile bar, the desktop
       * heading, the content. `of-type` and not `nth-child`, for the reason
       * given on the plan holder card — emotion inserts a <style> among these
       * children when the page is rendered on the server and shifts every child
       * index by one.
       */
      css={
        claimSheetUp
          ? { "& > div:nth-of-type(2)": { display: "none" } }
          : undefined
      }
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
            <PlanholderSwapSkeleton
              target={openClaimRef ? "claim" : "profile"}
            />
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
                // THE READING COLUMN LEADS, and the rail stands beside it.
                //
                // IT WAS FLIPPED TO RAIL-FIRST FOR AN HOUR (2026-09-16) to match
                // `/claims/death-claim` and the service payables conveyor, which
                // are both `<rail> minmax(0, 1fr)` — and reverted at the user's
                // word. Noted because the argument for the flip was a real one
                // and will come round again: those two screens are CONVEYORS,
                // where the rail is the queue's control surface and is read
                // before the work. This page is a PROFILE — it is looked up, the
                // plan holder is the subject, and the rail is what to reach for
                // once you have found them.
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
                    paid, who benefits, what is on file, what else they hold.

                    `display: contents` up to `xl` is what lets this page be two
                    columns without reordering the phone. Stacked, the wrapper
                    disappears and its sections become children of the grid
                    itself, so `order` can interleave them with the rail's — the
                    phone reads summary, remarks, REQUESTS, the two look-ups,
                    documents, other plans. From `xl` the wrapper is a real box
                    again, the orders stop applying, and each column stacks its
                    own — which is why the DOM order here already matches. */}
                <Box display={{ base: "contents", xl: "block" }}>
                  {/* Who this is. In the left column rather than across both,
                      so it is the width of the summary that follows it — and,
                      more to the point, so the rail starts at the TOP of the
                      page: a pending request is the thing worth reaching from
                      anywhere, and a full-width header above it would push it a
                      header's height down before it could be seen at all. */}
                  <Box order={0}>
                    <PlanholderProfileHeader planholder={planholder} />
                  </Box>

                  <Box mt={4} order={1}>
                    <PlanholderInfoCard planholder={planholder} asDetails />
                  </Box>

                  {/* IN A CARD, THE DEATH CLAIM'S (user, 2026-09-16: "place
                      the remarks into a card similar with the death claim").
                      It was a bare band — a heading and a scroll box, with the
                      heading doing the dividing — between the plan details card
                      above it and the launcher cards below. A section with no
                      edge between two that have one reads as content that has
                      fallen out of the card above. Same for the folder further
                      down; see `SectionCard`, whose own note this change
                      supersedes. */}
                  <Box mt={4} order={2}>
                    <SectionCard>
                      <PlanholderRemarks
                        remarks={getPlanholderRemarks(planholder.lpaNo)}
                        showNotes={false}
                      />
                    </SectionCard>
                  </Box>

                  {/* THE TWO LOOK-UPS, BEHIND BUTTONS (user, 2026-09-16:
                      "make the payment and beneficiary same as the death claim
                      design"). Both stood here as full sections — a paged
                      ledger of four columns and a list of beneficiary cards —
                      which is a lot of column spent on the two things nobody
                      opens this profile to read. Neither decides anything; they
                      are consulted, occasionally, and deliberately.

                      So each is a card that says how many rows are behind it
                      and opens the section over the page. The SECTIONS are
                      unchanged — `PlanholderPayments` and
                      `PlanholderBeneficiaries` render inside the pop-ups below,
                      exactly as they do on the death claim. */}
                  <Box mt={4} order={5}>
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(auto-fit, minmax(min(240px, 100%), 1fr))"
                      gap={3}
                    >
                      <SectionLauncher
                        Icon={LuReceipt}
                        title="Payments"
                        subtitle="Official receipts on record"
                        count={paymentCount}
                        onClick={() => setPopup("payments")}
                      />
                      <SectionLauncher
                        Icon={LuUsers}
                        title="Beneficiaries"
                        subtitle="Declared on this plan"
                        count={beneficiaryCount}
                        onClick={() => setPopup("beneficiaries")}
                      />
                    </Box>
                  </Box>

                  {/* THE FOLDER, MOVED OUT OF THE RAIL (user, 2026-09-16:
                      "move the document into the left-section"). It sat under
                      Pending Request(s) as the rail's second section, which put
                      a list of files in a 380px column next to the record they
                      belong to — and made the rail's height a budget two
                      sections had to divide.

                      NO DEFICIENCIES TAB. `withDeficiencies` is deliberately
                      off, as it always has been here: a deficiency is what a
                      REQUEST is short of, and which documents are outstanding
                      depends on which kind of request is asking. A plan
                      holder's folder is a record, and a record has nothing to
                      be deficient against — the claim view and the service
                      record each carry their own.

                      CAPPED, BECAUSE THE SECTION READS THE VIEWPORT. From `xl`
                      it believes it is in a rail and lists every document
                      rather than five behind a "View all", expecting the bound
                      a rail would have given it. This is that bound — the same
                      420px the death claim gives the same section for the same
                      reason. */}
                  <Box mt={4} order={6}>
                    <SectionCard>
                      <Box
                        display={{ xl: "flex" }}
                        flexDirection="column"
                        maxH={{ xl: "420px" }}
                        minH={{ xl: 0 }}
                      >
                        <PlanholderDocuments personId={planholder.personId} />
                      </Box>
                    </SectionCard>
                  </Box>

                  {/* Renders nothing when the person holds no other plan, so the
                      wrapper's top margin must not collapse into a gap. */}
                  <Box order={8}>
                    <PlanholderOtherPlans
                      personId={planholder.personId}
                      currentLpaNo={planholder.lpaNo}
                      // The card is drawn INSIDE this one, not around it — see
                      // the prop. Everything else in the column is carded at
                      // the call site.
                      carded
                    />
                  </Box>
                </Box>

                {/* The work: the requests running against this plan, and the
                    ways in to another one. Everything else on this page is
                    looked up; these are acted on — a request opened, a plan
                    searched for — so on a desktop they stop being a stop down a
                    long scroll and stand in a column that follows it.
                    THE FOLDER USED TO BE HERE TOO, and is now the left column's
                    last section; see the note on it there.

                    NO HEIGHT CEILING ANY MORE. The rail was capped at one
                    screenful with `overflow: hidden`, and the cap was a BUDGET:
                    the folder was the shrinkable section, and what the screen
                    could not give it became a scroll inside its own list. With
                    the folder gone, every section left is fixed — a field, a
                    row of buttons, a one-card deck — so there is nothing to
                    divide, and a cap over fixed content can only crop it. */}
                <Box
                  display={{ base: "contents", xl: "flex" }}
                  flexDirection="column"
                  position={{ xl: "sticky" }}
                  // The shell's header takes 64px above the scrollport and this
                  // sits 8px into it.
                  top={{ xl: "8px" }}
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
                      card beside it.

                      IN THE COLUMN'S CARD (user, 2026-09-16). The field stood
                      bare on the page's background at the top of the rail, with
                      the profile card level with it across the gutter — the one
                      thing on either column that was not on a surface. The card
                      is drawn here and not in `PlanholderQuickSearch`, which is
                      shared with the dashboard and answers to that page's
                      rhythm, not this one's. */}
                  <Box
                    order={2}
                    display={{ base: "none", xl: "block" }}
                    flexShrink={0}
                  >
                    <SectionCard>
                      <PlanholderQuickSearch />
                    </SectionCard>
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
                    // FIXED, SINCE THE SECTION BECAME A DECK (2026-09-16). It
                    // was `0 1 auto` with a `minH: 0` — shrink, never grow —
                    // because the section inside was a scrolling LIST and the
                    // rail's job was to decide how much of it was on screen.
                    // Pending Request(s) shows one card at a time now, so its
                    // height is the same on every plan and there is nothing to
                    // take away; leaving it shrinkable would crop the single
                    // card instead, which a deck cannot scroll back.
                    flex={{ xl: "0 0 auto" }}
                    // The rail's last section now: the margin below it is the
                    // gap to the bottom of the column, not to another section.
                    pb={{ xl: 1 }}
                  >
                    {/* PENDING REQUEST(S), NOT CLAIM REQUESTS (user,
                        2026-09-16: "our planholder profile will be view now by
                        Death Claim and Service so we need to make it dynamic…
                        the request would be claims and others").

                        The section that stood here listed CLAIMS, which was the
                        right question while the claims area was the only way in
                        to this profile. A service payables processor opens the
                        same plan holder off the conveyor and arrives with a
                        different one: not "what claims exist" but "is anything
                        already running against this plan". See
                        `planholder-requests`, where both sources are read into
                        one list. */}
                    <PlanholderPendingRequests
                      lpaNo={planholder.lpaNo}
                      // A CLAIM STILL SWAPS IN PLACE — the one behaviour worth
                      // keeping from the section this replaced. In the rail the
                      // claim goes into the main column beside the plan holder
                      // rather than over it. Anything that is not a claim
                      // carries its own `href` and is routed to, because this
                      // page has no view for it.
                      onSelectClaim={(request) => {
                        if (request.claim) swapTo(request.claim.reference);
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* THE TWO LOOK-UPS' POP-UPS, always mounted with `open` driving
                  them — never `{popup === "payments" && <SectionPopup/>}`. A
                  dialog mounted at the moment it opens has left this app with
                  the page behind it unclickable.

                  The sections inside are the same ones that stood in the column
                  until today, handed the same prop; only where they are drawn
                  has changed. */}
              <SectionPopup
                title="Payments"
                open={popup === "payments"}
                onClose={() => setPopup(null)}
              >
                <PlanholderPayments lpaNo={planholder.lpaNo} />
              </SectionPopup>

              <SectionPopup
                title="Beneficiaries"
                open={popup === "beneficiaries"}
                onClose={() => setPopup(null)}
              >
                <PlanholderBeneficiaries lpaNo={planholder.lpaNo} />
              </SectionPopup>
            </>
          ) : (
            <PlanholderNotFound lpaNo={lpaNo} />
          )}
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
