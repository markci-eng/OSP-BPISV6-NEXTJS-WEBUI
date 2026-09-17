"use client";

// PENDING REQUEST(S) — everything in flight against this plan, whatever raised
// it (user, 2026-09-16).
//
// IT IS THE BPIS PROFILE'S CARD, restated. `components/plan-management/
// planholder-profile/sections/pending-requests` answers the same question on the
// plan-management profile and this is that card: the clock, the count, the
// History action, and a swipeable deck of step-tracked request cards.
//
// IT DRAWS THE SHARED CARD AND THE SHARED DRAWER (user, 2026-09-16: "yes update
// the shared ProgressCard and RequestHistoryDrawer"). Both took a `type` that
// was a CLOSED UNION of four plan-management requests — Reinstatement, Change of
// Mode, Transfer of Rights, Returned of Premium — so for a day this file carried
// copies of both rather than post a death claim as a "Reinstatement" to get past
// the type. The unions are widened now and the copies are gone.
//
// WHAT IS STILL THIS FILE'S OWN is everything above the card: which requests
// there are, whether one is outstanding or settled, and where a press goes. The
// card renders a request; it does not know what a claim is.
//
// WHAT IT REPLACED is `PlanholderClaimRequests`, whose cards carried seven
// fields a death claim is judged on. That detail has not been lost — it is on
// the claim itself, which is one tap away and, in the rail, opens beside the
// plan holder rather than over it. What changed is the QUESTION the section
// answers: not "what claims exist on this plan" but "is anything already running
// against it", which is the one a service payables processor arrives with.

import { useState } from "react";
import { Box, Carousel, Flex, IconButton, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight, LuClock, LuHistory } from "react-icons/lu";
import { StaticCard } from "osp-ui-kit";
import { ProgressCard } from "@/components/plan-management/planholder-profile/cards/pending-request-card";
import RequestHistoryDrawer from "@/components/common/drawers/request-history-drawer";
import { useClaimStore } from "../../claim-store";
import { useServicePayablesStore } from "../../service-payables/service-payables-store";
import {
  getPlanholderRequests,
  pendingRequests,
  settledRequests,
  toHistoryItem,
  type PlanholderRequest,
} from "../planholder-requests";

export interface PlanholderPendingRequestsProps {
  lpaNo: string;
  /**
   * A CLAIM was picked and this page can show it in place — the profile swaps
   * its main column to the claim rather than navigating.
   *
   * Only claims. Anything else carries an `href` and is routed to, because this
   * page has no view for it; see {@link PlanholderRequest.href}.
   */
  onSelectClaim?: (request: PlanholderRequest) => void;
}

/**
 * Pending Request(s) — the profile's one section for work in flight.
 *
 * IT SUBSCRIBES TO BOTH STORES, which is the whole reason it can be one list:
 * opening a claim writes to one and terminating a plan writes to the other, and
 * a section reading both has to wake for either.
 */
export function PlanholderPendingRequests({
  lpaNo,
  onSelectClaim,
}: PlanholderPendingRequestsProps) {
  useClaimStore();
  useServicePayablesStore();

  const [historyOpen, setHistoryOpen] = useState(false);

  const all = getPlanholderRequests(lpaNo);
  const pending = pendingRequests(all);
  const settled = settledRequests(all);

  const open = (request: PlanholderRequest) => {
    if (request.claim) {
      onSelectClaim?.(request);
      return;
    }
    if (request.href) window.location.href = request.href;
  };

  return (
    // `0 0 auto` — NEITHER GROW NOR SHRINK, which is the change the carousel
    // brought with it. As a scrolling list this section was the rail's giving
    // block: it took what height was left and scrolled the rest away. A deck has
    // one card on screen whatever the count, so its height is fixed and correct
    // — and a rail still allowed to shrink it would crop that one card rather
    // than scroll it, which is the one thing a deck cannot recover from.
    <Box flex={{ xl: "0 0 auto" }}>
      <StaticCard
        activeIcon={<LuClock size={16} />}
        title="Pending Request(s)"
        subtitle={
          pending.length > 0
            ? `${pending.length} request${pending.length > 1 ? "s" : ""} awaiting action`
            : "No pending requests"
        }
        headerAction={
          <IconButton
            aria-label="View request history"
            size="xs"
            variant="ghost"
            // The theme's variable, as the card below it uses — see
            // `StepTrack`. The History action and the card's own green have to
            // be the same green, and only one of them can be the source.
            color="var(--chakra-colors-primary)"
            // NOTHING TO SHOW IS STILL WORTH A CONTROL THAT SAYS SO — but not
            // one that opens an empty drawer. A plan with no settled request has
            // no history, and the button goes quiet rather than disappearing, so
            // the card's header does not change shape between plans.
            disabled={settled.length === 0}
            onClick={() => setHistoryOpen(true)}
          >
            <LuHistory /> History
          </IconButton>
        }
      >
        {/* ONE REQUEST AT A TIME, IN A CAROUSEL (user, 2026-09-16: "only display
            one item at a time and make it carousel") — the BPIS card's own
            arrangement, arrows and indicators included.

            I ARGUED FOR A SCROLLING LIST AND WAS OVERRULED, which is worth
            recording because the argument was not wrong, it was outweighed. A
            deck is hard to page with a pointer — a wheel does nothing to it and
            the only way through is the arrows or the dots — and that is what
            `PlanholderClaimRequests` reasoned its way out of when this section
            was a list of claims. What it buys instead is a FIXED HEIGHT: a plan
            with one request and a plan with nine now make the same rail, where a
            list made the sections below shift down by however many cards this
            one happened to have. In a rail that already fights for height, that
            is the better trade.

            THE ARROWS ONLY EXIST ABOVE ONE REQUEST. A prev/next pair around a
            single card is two controls that do nothing, and the indicator row
            below says how many there are in any case.

            THE ITEM GROUP SITS INSIDE `Carousel.Control`, which reads oddly and
            is deliberate: it is what puts the arrows either SIDE of the card
            rather than under it, and it is exactly how the BPIS card is built.
            Straying from that arrangement is how the two profiles start looking
            like cousins instead of the same thing. */}
        {pending.length === 0 ? (
          <Flex align="center" justify="center" py={8}>
            <Text fontSize="sm" color="gray.500">
              No pending request
            </Text>
          </Flex>
        ) : (
          <Carousel.Root slideCount={pending.length} maxW="full">
            <Carousel.Control justifyContent="center" gap={2} w="full">
              {pending.length > 1 && (
                <Carousel.PrevTrigger asChild>
                  <IconButton
                    size="2xs"
                    variant="outline"
                    aria-label="Previous request"
                  >
                    <LuArrowLeft />
                  </IconButton>
                </Carousel.PrevTrigger>
              )}

              <Carousel.ItemGroup w="full">
                {pending.map((request, index) => (
                  <Carousel.Item key={request.id} index={index} minW={0}>
                    <ProgressCard
                      current={request.currentStep}
                      total={request.totalSteps}
                      title={request.title}
                      description={request.description}
                      transactionId={request.reference}
                      type={request.kind}
                      status={request.status}
                      date={request.date}
                      onClick={() => open(request)}
                      // THE CARD DOES NOT ROUTE FOR ITSELF HERE. Left on, it
                      // would push `/transaction/{reference}` on top of whatever
                      // `open` did — and a request on this page goes to one of
                      // two places depending on what raised it, which only this
                      // page knows. See the prop's own note.
                      navigateOnClick={false}
                    />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>

              {pending.length > 1 && (
                <Carousel.NextTrigger asChild>
                  <IconButton
                    size="2xs"
                    variant="outline"
                    aria-label="Next request"
                  >
                    <LuArrowRight />
                  </IconButton>
                </Carousel.NextTrigger>
              )}
            </Carousel.Control>

            {/* The BPIS card's indicators to the pixel — the active one stretches
                into a bar rather than growing, which is what makes a row of dots
                readable as a POSITION rather than as a count. */}
            <Carousel.Indicators
              transition="width 0.2s ease-in-out"
              transformOrigin="center"
              opacity="0.5"
              boxSize="2"
              bg="gray.200"
              _current={{ width: "10", bg: "gray.300", opacity: 1 }}
            />
          </Carousel.Root>
        )}
      </StaticCard>

      {/* THE SHARED DRAWER, on the same widened union — see `toHistoryItem`,
          which is the whole of what this page has to do to speak to it. */}
      <RequestHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        items={settled.map(toHistoryItem)}
      />
    </Box>
  );
}

export default PlanholderPendingRequests;
