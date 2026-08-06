"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Separator,
  SimpleGrid,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { LuFileText } from "react-icons/lu";
import { EmptyStateCard } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { useClaimStore } from "../../claim-store";
import {
  getClaimRequests,
  type ClaimPhase,
  type ClaimRequest,
} from "../../claims-data";
import {
  paginate,
  SwipeIndicator,
  useSwipePages,
} from "../../components/swipe-carousel";
import { ScrollFade } from "../../components/scroll-fade";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { PlanholderClaimRequestDrawer } from "./PlanholderClaimRequestDrawer";

/** From this many requests up, the list switches to simpler, paged cards. */
const SIMPLE_LIMIT = 5;
/** Cards per swipe page in the simpler (5+) layout. */
const PAGE_SIZE = 5;

/** Pill colours per phase — matches the tones used across the claims area. */
const PHASE_STYLE: Record<ClaimPhase, { bg: string; color: string }> = {
  Pending: { bg: "gray.100", color: "gray.600" },
  "For Approval": { bg: "orange.50", color: "orange.600" },
  "For Denial": { bg: "red.50", color: "red.500" },
  Denied: { bg: "red.50", color: "red.600" },
  Approved: { bg: "green.50", color: "green.600" },
};

const claimNoOf = (claim: ClaimRequest) => claim.claimNo ?? claim.reference;
/** The "type" shown under the claim no — the benefit for death claims. */
const claimTypeOf = (claim: ClaimRequest) =>
  claim.benefit ?? claim.kind ?? "—";
const contestabilityLabel = (claim: ClaimRequest) =>
  claim.contestability
    ? claim.contestability === "within"
      ? "Within"
      : "Over"
    : "—";
/** Primary payee (claimant) label — "Name · Relation", "+N more" if several. */
const payeeLabel = (claim: ClaimRequest) => {
  const payees = claim.payees ?? [];
  if (payees.length === 0) return undefined;
  const [first, ...rest] = payees;
  const base = `${first.name} · ${first.relation}`;
  return rest.length ? `${base} +${rest.length} more` : base;
};

/** Small coloured status pill for a claim's phase. */
function PhasePill({ phase }: { phase: ClaimPhase }) {
  const s = PHASE_STYLE[phase];
  return (
    <Box
      display="inline-flex"
      flexShrink={0}
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="11px"
      fontWeight="semibold"
      whiteSpace="nowrap"
      bg={s.bg}
      color={s.color}
    >
      {phase}
    </Box>
  );
}

/** Label / value pair used inside the feature card's detail grid. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box minW={0}>
      <Text
        fontSize="2xs"
        textTransform="uppercase"
        letterSpacing="wider"
        fontWeight="semibold"
        color="gray.400"
        lineHeight="1.2"
      >
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium" color="gray.800" mt="2px">
        {value}
      </Text>
    </Box>
  );
}

/* ------------------------------ feature card ------------------------------ */

/**
 * Detailed card shown when a plan has 1–4 claims. Surfaces every field the
 * user asked for: Claim Type, Claim No, Status, Date of Death, Age of Death
 * and Contestability.
 */
function FeatureCard({
  claim,
  onClick,
}: {
  claim: ClaimRequest;
  onClick?: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      bg="white"
      boxShadow="sm"
      p={{ base: 4, md: 5 }}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ boxShadow: "md", borderColor: BRAND_COLORS.primaryGreen }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={3}
            borderRadius="full"
            bg="#eaf5ee"
            color={BRAND_COLORS.darkGreen}
            flexShrink={0}
          >
            <LuFileText size={20} />
          </Box>
          <Box minW={0}>
            <Text fontSize="md" fontWeight="700" color="gray.800" truncate>
              {claimNoOf(claim)}
            </Text>
            <Text fontSize="xs" color="gray.500" truncate>
              {claimTypeOf(claim)}
            </Text>
          </Box>
        </Flex>
        <PhasePill phase={claim.phase} />
      </Flex>

      <Separator my={4} />

      <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
        <Detail label="Date of Death" value={claim.dateOfDeathDisplay ?? "—"} />
        <Detail label="Age of Death" value={claim.ageOfDeath ?? "—"} />
        <Detail label="Contestability" value={contestabilityLabel(claim)} />
        {payeeLabel(claim) && (
          <Box gridColumn={{ base: "1 / -1", md: "auto" }} minW={0}>
            <Detail label="Payee" value={payeeLabel(claim)!} />
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
}

/* ------------------------------ simple card ------------------------------ */

/** Compact card shown when a plan has 5+ claims — Type, No, Status only. */
function SimpleCard({
  claim,
  onClick,
}: {
  claim: ClaimRequest;
  onClick?: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: "gray.300", boxShadow: "sm" }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            {claimNoOf(claim)}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {claimTypeOf(claim)}
          </Text>
          {claim.payees?.[0] && (
            <Text fontSize="11px" color="gray.400" truncate>
              Payee: {claim.payees[0].name}
            </Text>
          )}
        </Box>
        <PhasePill phase={claim.phase} />
      </Flex>
    </Box>
  );
}

/** Simpler cards grouped into swipeable pages of five. */
function SimpleCardCarousel({
  requests,
  onSelect,
}: {
  requests: ClaimRequest[];
  onSelect?: (claim: ClaimRequest) => void;
}) {
  const pages = paginate(requests, PAGE_SIZE);
  const { trackRef, active, handleScroll, goToPage } = useSwipePages();

  return (
    <Box>
      <Flex
        ref={trackRef}
        onScroll={handleScroll}
        overflowX="auto"
        scrollSnapType="x mandatory"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        scrollbarWidth="none"
      >
        {pages.map((page, pi) => (
          <Box key={pi} minW="100%" scrollSnapAlign="start" pr="1px">
            <VStack align="stretch" gap={2}>
              {page.map((claim) => (
                <SimpleCard
                  key={claim.id}
                  claim={claim}
                  onClick={() => onSelect?.(claim)}
                />
              ))}
            </VStack>
          </Box>
        ))}
      </Flex>

      {/* Same swipe affordance the processor's queue uses. */}
      <SwipeIndicator
        pageCount={pages.length}
        active={active}
        onGoTo={goToPage}
      />
    </Box>
  );
}

/* ------------------------------ section ------------------------------ */

interface PlanholderClaimRequestsProps {
  lpaNo: string;
  onSelect?: (claim: ClaimRequest) => void;
}

/**
 * Claim history for a plan holder. The layout adapts to how many there are:
 *   - 1–4 requests → detailed feature cards, stacked
 *   - 5 or more    → simpler cards, swipeable in pages of five
 */
export function PlanholderClaimRequests({
  lpaNo,
  onSelect,
}: PlanholderClaimRequestsProps) {
  // Re-read whenever a claim is opened, so a claim the processor just created
  // shows up here with its claim no, computation and payee.
  useClaimStore();
  const requests = getClaimRequests(lpaNo);
  const count = requests.length;

  /**
   * Whether this is in the profile's side rail rather than stacked down the
   * page — which is the same question as "is this being driven by a pointer".
   *
   * `xl` because that is the width the page becomes two columns and the rail
   * gets a height of its own; below it the section is the full-width stacked
   * one the phone gets, as tall as its content, and it keeps the phone's swipe
   * paging with it. `false` until it has measured, so the server and the first
   * client render agree.
   */
  const isRail =
    useBreakpointValue({ base: false, xl: true }, { ssr: false }) ?? false;

  // The claim currently open in the side drawer, held by REFERENCE rather than
  // as a snapshot: acting on a claim from inside the drawer (endorsing it, say)
  // writes to the store, and looking it up again each render is what lets the
  // drawer show the result instead of the copy taken when the card was tapped.
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const selected = selectedRef
    ? (requests.find((r) => r.reference === selectedRef) ?? null)
    : null;

  const handleSelect = (claim: ClaimRequest) => {
    // In the rail there is no drawer: the PAGE swaps to the claim, putting it
    // in the main column with the plan holder beside it. Only the stacked
    // layouts, which have nowhere to put a claim but on top of the profile,
    // open one here.
    if (!isRail) setSelectedRef(claim.reference);
    onSelect?.(claim);
  };

  let body: React.ReactNode;
  if (count === 0) {
    // The shared empty state, the same one every section on this page shows
    // when it has nothing: a dashed outline saying what is missing and what
    // would fill it. Each section used to draw its own, and they had drifted —
    // a solid card here, a grey icon circle there, three different type scales.
    body = (
      <EmptyStateCard
        title="No claim requests"
        description="Requests filed against this plan will appear here."
      />
    );
  } else if (isRail) {
    // A desktop SCROLLS the list; it does not swipe it. A deck is built for a
    // thumb — a wheel does nothing to it, and the only way through with a
    // pointer is to hunt for the dots. So in the rail there is no paging at
    // all: every request is in one list, bounded by the height the rail was
    // given, and how many are on screen is whatever that height allows.
    //
    // Which CARD is unchanged — detailed below five requests, compact from
    // five up — so the rail reads exactly as the stacked page does. Only the
    // way through them differs.
    body = (
      <ScrollFade
        // `1 1 auto`, never `flex={1}`: that is a basis of ZERO, and a zero
        // basis inside a parent whose height comes from its content collapses
        // the parent to nothing. Basis `auto` means "as tall as the cards",
        // which is the height the rail then shrinks from.
        flex="1 1 auto"
        minH={0}
        // A card lifts on hover and a scroll box clips what leaves it, so the
        // shadow needs room either side; taken straight back with the negative
        // margin so the cards stay in line with the heading above them.
        px={1}
        mx={-1}
      >
        <VStack align="stretch" gap={count < SIMPLE_LIMIT ? 3 : 2}>
          {requests.map((claim) =>
            count < SIMPLE_LIMIT ? (
              <FeatureCard
                key={claim.id}
                claim={claim}
                onClick={() => handleSelect(claim)}
              />
            ) : (
              <SimpleCard
                key={claim.id}
                claim={claim}
                onClick={() => handleSelect(claim)}
              />
            ),
          )}
        </VStack>
      </ScrollFade>
    );
  } else if (count < SIMPLE_LIMIT) {
    body = (
      <VStack align="stretch" gap={3}>
        {requests.map((claim) => (
          <FeatureCard
            key={claim.id}
            claim={claim}
            onClick={() => handleSelect(claim)}
          />
        ))}
      </VStack>
    );
  } else {
    body = <SimpleCardCarousel requests={requests} onSelect={handleSelect} />;
  }

  return (
    // In the rail this section is a COLUMN that flexes: the heading keeps its
    // own height, the list takes whatever is left, and it scrolls within that.
    // Every box between the rail and the list needs a height and a
    // `min-height: 0` for that to hold — break the chain anywhere and the list
    // grows to fit every card and the RAIL scrolls instead, which is the thing
    // being replaced. Stacked, none of this applies and the section is as tall
    // as its content.
    <Box
      display={{ xl: "flex" }}
      flexDirection="column"
      flex={{ xl: "1 1 auto" }}
      minH={{ xl: 0 }}
    >
      <PlanholderSectionHeader
        title="Claim Requests"
        subtitle="Requests filed against this plan"
        count={count}
      />
      <Box
        display={{ xl: "flex" }}
        flexDirection="column"
        flex={{ xl: "1 1 auto" }}
        minH={{ xl: 0 }}
      >
        {body}
      </Box>

      <PlanholderClaimRequestDrawer
        claim={selected}
        open={selected !== null}
        onClose={() => setSelectedRef(null)}
      />
    </Box>
  );
}

export default PlanholderClaimRequests;
