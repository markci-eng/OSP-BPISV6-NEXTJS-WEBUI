"use client";

// The death-claim dashboard's three queues, as one tabbed section.
//
// They were three stacked sections, each with its own heading and its own copy
// of the toolbar. On a phone that meant scrolling past a whole screenful of one
// queue to reach the next, and it read as three lists that happened to be near
// each other rather than as three stages of the same claim. Tabbed, only the
// queue being worked is on screen, and the tabs themselves say what the other
// two hold — the counts are on them.
//
// The tabs are {@link TileTabs}, the same control as the benefit picker on the
// death-claim form, for the reason given there: it is already the shape this
// area uses for "pick one of these".

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  LuChevronRight,
  LuInbox,
  LuSend,
  LuShieldCheck,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { deathBenefitLabel } from "@/app/(pis)/data";
import { SectionTitle } from "../../components/section-title";
import { TileTabs } from "../../components/tile-tabs";
import { useKeepInView } from "../../components/use-keep-in-view";
import {
  claimIdentity,
  planholderName,
  toFullName,
  type ClaimIdentifier,
  type DeathClaim,
} from "../death-claims-data";
import { TYPE_DOT, type DeathClaimFilter } from "./DeathClaimsFilter";
import { DeathClaimsTable } from "./DeathClaimsTable";

/**
 * One already-processed claim as a clickable card — used by both queues that
 * work claims which have a header.
 *
 * Ordered by what a supervisor works from. The CLAIM NO leads: it is generated
 * when the claim is created and becomes that claim's reference everywhere —
 * not only in this system — so it outranks everything else on the card. Then
 * the plan it was filed against and the benefit claimed, with the deceased and
 * the requesting branch as context underneath.
 *
 * No status is shown. Membership of a queue already says where the claim is;
 * the specific status lives on the claim itself, which is one tap away.
 */
function ProcessedClaimCard({
  claim,
  showTypeDot,
  onClick,
}: {
  claim: DeathClaim;
  showTypeDot: boolean;
  onClick?: () => void;
}) {
  const name = planholderName(claim.lpaNo);
  const context = [name ? toFullName(name) : "—", claim.requestingBranch]
    .filter(Boolean)
    .join(" · ");

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
      p={3}
      boxShadow="xs"
      cursor="pointer"
      transition="all 0.18s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: BRAND_COLORS.primaryGreen,
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Flex align="flex-start" gap={2} minW={0} flex="1">
          {showTypeDot && (
            <Box
              mt="6px"
              w="8px"
              h="8px"
              borderRadius="full"
              bg={TYPE_DOT[claim.type]}
              flexShrink={0}
            />
          )}
          <Box minW={0} flex="1">
            {/* 1 — the claim no: this claim's reference across every system.
                Never the request no in its place — the same rule, and the same
                helper, as the identity column of the table view. */}
            <Text fontSize="sm" fontWeight="700" color="gray.800" truncate>
              {claimIdentity(claim, "claim")}
            </Text>
            {/* 2 — the plan, then 3 — the benefit being claimed. */}
            <Text
              fontSize="xs"
              fontWeight="600"
              color="gray.600"
              mt="1px"
              truncate
            >
              {claim.lpaNo}
              <Text as="span" fontWeight="400" color="gray.500">
                {" · "}
                {deathBenefitLabel(claim.benefits)}
              </Text>
            </Text>
            {/* Context — who died, and which branch filed it. */}
            <Text fontSize="11px" color="gray.500" mt="2px" truncate>
              {context}
            </Text>
          </Box>
        </Flex>

        <Box color={BRAND_COLORS.primaryGreen} flexShrink={0} mt="2px">
          <LuChevronRight size={18} />
        </Box>
      </Flex>
    </Box>
  );
}

/* ─── Queues ─── */

/**
 * The section's heading. Fixed, not the active queue's name: the tabs sit
 * directly underneath and already say which queue is open, and a heading that
 * changed on every tap would be a second, slower answer to a question the tabs
 * have already answered — and one that moves the eye away from the control the
 * user just used. This names the section; the tabs name the queue.
 */
const SECTION_TITLE = "Claim Queues";

/**
 * The type filter every queue opens on, on every device.
 *
 * Special claims are the ones with a clock on them, and that is true wherever
 * the claim has got to: one waiting to be worked, one endorsed for a decision
 * and one ready to endorse are all held up by the same thing. The queues used to
 * differ here — only "For Process" opened on Special — which meant the filter
 * silently changed under the processor as they moved along a claim's path, and
 * the one type that should never wait was the one they had to ask for twice.
 */
const DEFAULT_FILTER: DeathClaimFilter = "special";

type QueueKey = "process" | "verification" | "endorsement";

interface QueueDefinition {
  key: QueueKey;
  /** Label on the tab — short, since three of them share a phone's width. */
  tabLabel: string;
  Icon: IconType;
  /** Reads after the count and the filter label, e.g. "…awaiting your action". */
  verb: string;
  /**
   * Which number identifies a claim once it has reached this queue.
   *
   * "For Process" holds requests nobody has opened yet, so the request no is all
   * they have. The other two hold claims that have been opened, and from that
   * point the claim no is the reference the whole system quotes. This is the one
   * fact behind both the card each queue uses and the identity column its table
   * drops — kept here so the two cannot answer it differently.
   */
  identifier: ClaimIdentifier;
  /** Card width to match in the skeleton — a date, or a chevron. */
  skeletonTrailingWidth: string;
}

const QUEUES: QueueDefinition[] = [
  {
    key: "process",
    tabLabel: "For Process",
    Icon: LuInbox,
    verb: "awaiting your action",
    identifier: "request",
    skeletonTrailingWidth: "64px",
  },
  {
    key: "verification",
    tabLabel: "For Verification",
    Icon: LuShieldCheck,
    // "decision", not "approval" — a claim can be endorsed for denial.
    verb: "endorsed for your decision",
    identifier: "claim",
    skeletonTrailingWidth: "18px",
  },
  {
    key: "endorsement",
    tabLabel: "For Endorsement",
    Icon: LuSend,
    verb: "ready to endorse",
    identifier: "claim",
    skeletonTrailingWidth: "18px",
  },
];

const DEFAULT_FILTERS = Object.fromEntries(
  QUEUES.map((queue) => [queue.key, DEFAULT_FILTER]),
) as Record<QueueKey, DeathClaimFilter>;

export interface ClaimQueuesSectionProps {
  forProcess: DeathClaim[];
  forVerification: DeathClaim[];
  forEndorsement: DeathClaim[];
}

/**
 * The three claim queues behind one set of tabs.
 *
 * Each queue keeps its OWN Special / Regular / All filter, so coming back to a
 * queue finds it as it was left rather than reset by a trip through another
 * one. Switching queues runs the list's skeleton beat: the queues are different
 * lengths, so the list is about to change height, and the loader is what makes
 * that read as the new queue arriving rather than as the page jumping.
 */
export function ClaimQueuesSection({
  forProcess,
  forVerification,
  forEndorsement,
}: ClaimQueuesSectionProps) {
  const router = useRouter();
  const [active, setActive] = useState<QueueKey>("process");
  const [filters, setFilters] =
    useState<Record<QueueKey, DeathClaimFilter>>(DEFAULT_FILTERS);

  // The section's own top: how many cards fit a page is measured from here, not
  // from the top of the page, since this section sits below the fold on a phone.
  //
  // That measurement assumes the section is scrolled to, so the same ref is what
  // keeps it there — a queue of a different length, or a page size that changed
  // on rotation, would otherwise leave the section standing half off-screen with
  // its cards sized for a screenful it no longer has.
  const sectionRef = useRef<HTMLDivElement>(null);
  const bringIntoView = useKeepInView(sectionRef);

  const data: Record<QueueKey, DeathClaim[]> = useMemo(
    () => ({
      process: forProcess,
      verification: forVerification,
      endorsement: forEndorsement,
    }),
    [forProcess, forVerification, forEndorsement],
  );

  const queue = QUEUES.find((q) => q.key === active) ?? QUEUES[0];
  const claims = data[active];
  const filter = filters[active];

  const counts = useMemo(
    () => ({
      regular: claims.filter((c) => c.type === "regular").length,
      special: claims.filter((c) => c.type === "special").length,
      all: claims.length,
    }),
    [claims],
  );

  const branchOptions = useMemo(
    () =>
      Array.from(new Set(claims.map((c) => c.requestingBranch)))
        .filter(Boolean)
        .sort(),
    [claims],
  );

  const filtered = useMemo(
    () => (filter === "all" ? claims : claims.filter((c) => c.type === filter)),
    [claims, filter],
  );

  const openPlanholder = (claim: DeathClaim) =>
    router.push(`/claims/planholder/${encodeURIComponent(claim.lpaNo)}`);

  /**
   * Where a claim goes when it is opened, from wherever it was opened — a card,
   * or a row of the table view.
   *
   * "For Process" opens the claim for processing. The other two work claims that
   * already have a header, so they open the plan holder, which is where such a
   * claim is read and acted on. Defined once because a row and a card are the
   * same claim, and the two arriving somewhere different would be a bug nobody
   * would think to look for.
   */
  const openClaim = (claim: DeathClaim) =>
    active === "process"
      ? router.push(
          `/claims/death/create/${encodeURIComponent(claim.reference)}`,
        )
      : openPlanholder(claim);

  const count = filtered.length;
  const filterLabel =
    filter === "all" ? "" : filter === "special" ? "Special " : "Regular ";

  return (
    // A column on a desktop, so the heading and the tabs keep their own height
    // and the table below them takes the rest — see the chain note on the page.
    <Box
      ref={sectionRef}
      h={{ lg: "100%" }}
      minH={{ lg: 0 }}
      display={{ lg: "flex" }}
      flexDirection="column"
    >
      {/* The title is fixed; the line under it is the live count for whichever
          queue is open, which is the one thing the tabs do not already say. */}
      <SectionTitle
        title={SECTION_TITLE}
        subtitle={`${count} ${filterLabel}${
          count === 1 ? "claim" : "claims"
        } ${queue.verb}`}
      />

      <Box mb={3} flexShrink={0}>
        <TileTabs
          label="Claim queues"
          value={active}
          onChange={(value) => {
            setActive(value);
            // Two queues can happen to be the same height, in which case nothing
            // resizes and the observer never fires — but the user still just
            // asked for this section, so bring it up regardless.
            bringIntoView();
          }}
          options={QUEUES.map((q) => ({
            value: q.key,
            label: q.tabLabel,
            count: data[q.key].length,
            Icon: q.Icon,
          }))}
        />
      </Box>

      <DeathClaimsTable
        // Takes whatever the heading and tabs leave, and no more.
        flex={{ lg: 1 }}
        minH={{ lg: 0 }}
        // The queue's data, filter and card all change together, so the table is
        // driven rather than remounted: remounting would drop the search box and
        // the branch filter, which a processor comparing two queues is most
        // likely to want kept.
        data={filtered}
        showTypeDot={filter === "all"}
        filter={filter}
        onFilterChange={(value) => {
          setFilters((current) => ({ ...current, [active]: value }));
          // Same reason as the queue tabs: filtering changes how many claims are
          // listed, so it changes the section's height. Asked for directly here
          // rather than left to the resize observer, because this is a tap — the
          // user is looking at the section right now, and the response should not
          // wait on a layout notification to arrive.
          bringIntoView();
        }}
        counts={counts}
        branchOptions={branchOptions}
        loadKey={active}
        originRef={sectionRef}
        skeletonTrailingWidth={queue.skeletonTrailingWidth}
        identifier={queue.identifier}
        // Serves the default card AND every row of the table view — see
        // `openClaim` for where each queue sends them.
        onProcess={openClaim}
        // Keyed on the same fact as the table's identity column, because it IS
        // the same question: the default card leads with the request no, and
        // this one leads with the claim no.
        renderCard={
          queue.identifier === "request"
            ? undefined
            : (claim, showDot) => (
                <ProcessedClaimCard
                  claim={claim}
                  showTypeDot={showDot}
                  onClick={() => openClaim(claim)}
                />
              )
        }
      />
    </Box>
  );
}

export default ClaimQueuesSection;
