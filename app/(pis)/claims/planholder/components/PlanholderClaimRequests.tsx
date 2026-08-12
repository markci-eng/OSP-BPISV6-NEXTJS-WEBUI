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
import { PlanholderCreateClaim } from "./PlanholderCreateClaim";
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

/**
 * A claim request that has been OPENED — one a processor has worked, which is
 * to say one with a claim no.
 *
 * The section lists only these. A request number tracks a request through the
 * branch; a CLAIM number is minted when the claim itself is created, and from
 * then on it is what the whole system quotes. A row showing a request number
 * was showing the tracking reference for something that is not yet a claim.
 *
 * Carried as a type rather than checked at each use, so the claim no can be
 * read as the string it is: the predicate below is the only place the absence
 * is handled, and everything past it has one.
 */
type ProcessedClaim = ClaimRequest & { claimNo: string };

const isProcessed = (claim: ClaimRequest): claim is ProcessedClaim =>
  Boolean(claim.claimNo);

/** Never the request no in its place — see {@link ProcessedClaim}. */
const claimNoOf = (claim: ProcessedClaim) => claim.claimNo;

/**
 * What is shown under the claim no: the BENEFIT claimed, not the kind of claim.
 *
 * "Death Claim" was the same three words on every card in the section — it is
 * what the section is for, so it said nothing. The benefit is what differs
 * between two claims on one plan and what decides how each is worked.
 *
 * Set on the same pass that sets the claim no, so anything reaching this has
 * one; the dash is for a claim edited by hand into a state the data layer does
 * not otherwise produce.
 */
const benefitOf = (claim: ProcessedClaim) => claim.benefit ?? "—";
const contestabilityLabel = (claim: ClaimRequest) =>
  claim.contestability
    ? claim.contestability === "within"
      ? "Within"
      : "Over"
    : "—";
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

/**
 * Label / value pair used inside the feature card's detail grid.
 *
 * `tone` colours the VALUE, and only for the reading that needs acting on — a
 * claim still within contestability, a claim with requirements outstanding. The
 * other reading of each stays grey, so a coloured value on a card means "this
 * one has something on it" rather than "this field exists".
 */
function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
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
      <Text
        fontSize="sm"
        fontWeight={tone ? "semibold" : "medium"}
        color={tone ?? "gray.800"}
        mt="2px"
      >
        {value}
      </Text>
    </Box>
  );
}

/* ------------------------------ feature card ------------------------------ */

/**
 * Detailed card shown when a plan has 1–4 claims.
 *
 * Carries the seven things a death claim is judged on, and nothing else: the
 * CLAIM NO and the BENEFIT identify it, the STATUS says where it has got to, and
 * the four below the rule are what a processor actually reads it for — DATE OF
 * DEATH, CONTESTABILITY, DEFICIENT and NATURE OF CLAIM.
 *
 * Two fields were dropped to make room, and the reason is the same for both:
 * AGE OF DEATH is a restatement of the date beside it, and the PAYEE is a fact
 * about who gets paid rather than about whether the claim is payable — which is
 * the question this card exists to answer. Both are on the claim itself, one tap
 * away.
 */
function FeatureCard({
  claim,
  onClick,
}: {
  claim: ProcessedClaim;
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
          {/* Bare, and given no colour of its own — the same treatment as the
              beneficiary card's mark, and for the same reason: a chip holds a
              small icon steady inside a ROW of text, and this is a card with a
              heading for the icon to sit against. react-icons draw with
              `currentColor`, so leaving the colour unset is what keeps it on
              the card's own text. */}
          <Box flexShrink={0}>
            <LuFileText size={20} />
          </Box>
          <Box minW={0}>
            <Text fontSize="md" fontWeight="700" color="gray.800" truncate>
              {claimNoOf(claim)}
            </Text>
            <Text fontSize="xs" color="gray.500" truncate>
              {benefitOf(claim)}
            </Text>
          </Box>
        </Flex>
        <PhasePill phase={claim.phase} />
      </Flex>

      <Separator my={4} />

      {/* Two across, never three: four details divide evenly into two rows,
          where three would leave one alone on a second row and the eye reading
          down a column would find a different field in each card. */}
      <SimpleGrid columns={2} gap={4}>
        <Detail label="Date of Death" value={claim.dateOfDeathDisplay ?? "—"} />
        <Detail
          label="Contestability"
          value={contestabilityLabel(claim)}
          // "Within" is the reading that matters: the claim is inside the
          // period where the plan can still be contested, so it is worked
          // differently. "Over" is the ordinary case and stays quiet.
          tone={claim.contestability === "within" ? "orange.600" : undefined}
        />
        <Detail
          label="Deficient"
          value={claim.isDeficient ? "Yes" : "No"}
          // Every claim reads "Yes" today — the data layer has no deficiency
          // list yet, see `isDeficient` on `ClaimRequest`. The tone is written
          // against the real thing rather than the placeholder, so it needs no
          // second pass when that arrives.
          tone={claim.isDeficient ? "red.600" : undefined}
        />
        <Detail label="Nature of Claim" value={claim.natureOfClaim ?? "—"} />
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
  claim: ProcessedClaim;
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
            {benefitOf(claim)}
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
  requests: ProcessedClaim[];
  onSelect?: (claim: ProcessedClaim) => void;
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
  // Only claims that have been opened — see {@link ProcessedClaim}. A request
  // nobody has worked yet has no claim no, and this section is the plan's list
  // of CLAIMS; an unopened request belongs to the branch that filed it and to
  // the "For Process" queue, both of which track it by its request no.
  const requests = getClaimRequests(lpaNo).filter(isProcessed);
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
      // Worded for what the list now holds. "Requests filed against this plan
      // will appear here" would be a promise the section no longer keeps: a
      // request that has been filed but not opened does NOT appear here.
      <EmptyStateCard
        title="No claims opened"
        description="Claims opened against this plan will appear here."
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
      {/* Create Claim rides in the heading's action slot, the same place Add
          Document and Add Note sit — it is what FILLS this list, since a claim
          appears here the moment it is opened. It renders nothing when the plan
          has no unopened request, which is the usual case. */}
      <PlanholderSectionHeader
        title="Claim Requests"
        subtitle="Requests filed against this plan"
        count={count}
        action={<PlanholderCreateClaim lpaNo={lpaNo} />}
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
