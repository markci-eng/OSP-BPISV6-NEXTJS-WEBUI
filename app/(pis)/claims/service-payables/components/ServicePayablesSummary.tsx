"use client";

// The dashboard's opening figures: what is waiting to be billed, and what is
// stuck.
//
// Built to the SAME recipe as the death dashboard's `PendingClaimsSummary` — a
// 2px accent border over an 18%-alpha wash of the same accent, an icon chip at
// 15% alpha, the value, then a footer split by a hairline rule. Someone moving
// between the two dashboards should not have to learn a second kind of tile.
//
// It is a separate component rather than a shared one because the two count
// different things and say so in their types: that one is keyed on a claim's
// nature, this one on the stages of a billing. What they share is the look, and
// the look is the part written down twice — deliberately, since merging them
// would mean a tile component with a union of two dashboards' props.
//
// The leading figure is the MONEY. Everything else here — chapels, services,
// deficiencies — is a way of getting to it, and the amount owed is the fact the
// section exists to state.

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { BaseText, Body, Small } from "osp-ui-kit";
import {
  LuBuilding2,
  LuCircleAlert,
  LuFileStack,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionTitle } from "../../components/section-title";
import {
  BILLING_STAGE_LABELS,
  CSP_RULE_PENDING,
  formatCSP,
  type BillingStage,
} from "../service-payables-data";

/** Accent for the discrepancy tile — the one colour that means "attention". */
const DEFICIENCY_ACCENT = "#e11d48";

export interface ServicePayablesTotals {
  /** Sum of the billable CSP across the stage being shown. */
  totalCSP: number;
  /** Distinct chapels with work at this stage. */
  chapels: number;
  /** Billable services at this stage — the plans that will be terminated. */
  services: number;
  /** Services waiting on paperwork, which cannot be billed. */
  deficient: number;
  /** Services held by a disagreement about the plan, which cannot be billed. */
  discrepant: number;
  /** Distinct people whose name is on a billing at this stage. */
  processors: number;
}

interface TileProps {
  Icon: IconType;
  title: string;
  /** The figure, already formatted — amounts are money, counts are counts. */
  value: string;
  footerLabel: string;
  footerValue: string;
  color: string;
}

const Tile = ({
  Icon,
  title,
  value,
  footerLabel,
  footerValue,
  color,
}: TileProps) => (
  <Box
    borderRadius="3xl"
    position="relative"
    bg={`${color}18`}
    border="2px solid"
    borderColor={color}
    boxShadow="0 1px 4px rgba(0,0,0,0.06)"
    overflow="hidden"
  >
    <Box p={3.5}>
      <Flex align="center" gap={2} mb={2}>
        <Box
          p={1.5}
          bg={`${color}15`}
          style={{ color }}
          borderRadius="lg"
          flexShrink={0}
        >
          <Icon size={15} />
        </Box>
        <Body fontWeight="600" color="gray.500" truncate>
          {title}
        </Body>
      </Flex>

      {/* The money tile carries a far longer string than the count tiles —
          "Php 474,000.00" against "32" — so the figure is sized by what it
          actually says rather than by one size that has to suit both. Keyed on
          length rather than on a `kind` prop, because length is the thing that
          overflows the tile and a caller should not have to know that. */}
      <BaseText
        as="div"
        fontSize={value.length > 10 ? { base: "xl", lg: "2xl" } : "4xl"}
        fontWeight="700"
        color="gray.800"
        lineHeight="1"
      >
        {value}
      </BaseText>

      {/* Dropped on a short screen, exactly as the claims tiles drop theirs —
          it is the least important line, and losing it is what keeps the
          section and the queue below it on one screen. */}
      <Flex
        align="baseline"
        justify="space-between"
        gap={2}
        mt={2.5}
        pt={2}
        borderTop="1px solid"
        borderColor="gray.100"
        css={{ "@media (max-height: 700px)": { display: "none" } }}
      >
        <Small
          color="gray.400"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
          }}
        >
          {footerLabel}
        </Small>
        <Text
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color,
            letterSpacing: "0.02em",
          }}
        >
          {footerValue}
        </Text>
      </Flex>
    </Box>
  </Box>
);

export interface ServicePayablesSummaryProps {
  totals: ServicePayablesTotals;
  /**
   * The stage these figures cover. Taken as the stage rather than as its label
   * because one tile's footer reads differently before a billing has been
   * billed than after it — a comparison the label cannot be trusted with.
   */
  stage: BillingStage;
  /** Lay all four tiles across one row — for a full-width band on a desktop. */
  singleRow?: boolean;
}

/**
 * Four figures: the payable, the chapels it is owed to, the services behind it,
 * and the ones that cannot be billed yet.
 *
 * Stacked two-by-two by default, which is what the narrow rail can hold, and
 * across one row when the caller has the width for it.
 */
export function ServicePayablesSummary({
  totals,
  stage,
  singleRow = false,
}: ServicePayablesSummaryProps) {
  const stageLabel = BILLING_STAGE_LABELS[stage];

  const tiles: (TileProps & { key: string })[] = [
    {
      key: "csp",
      Icon: LuWallet,
      title: "Total CSP",
      value: formatCSP(totals.totalCSP),
      // Says out loud that the amount is a stand-in, rather than leaving a
      // figure on the dashboard that looks settled when it is not.
      footerLabel: CSP_RULE_PENDING ? "Provisional" : stageLabel,
      footerValue: `${totals.services} svc`,
      color: BRAND_COLORS.darkGreen,
    },
    {
      key: "chapels",
      Icon: LuBuilding2,
      title: "Chapels",
      value: totals.chapels.toLocaleString(),
      // Only the For Process stage is awaiting anything; a chapel on any later
      // tab has been billed, and the tile said otherwise on three tabs out of
      // four.
      footerLabel: stage === "for-process" ? "Awaiting billing" : "Billed",
      footerValue: stageLabel,
      color: BRAND_COLORS.primaryGreen,
    },
    {
      key: "services",
      Icon: LuFileStack,
      title: "Services",
      value: totals.services.toLocaleString(),
      footerLabel: "Plans to terminate",
      footerValue: `${totals.services}`,
      color: BRAND_COLORS.gold,
    },
    // The fourth tile is the one that changes with the stage.
    //
    // AT FOR PROCESS IT COUNTS DISCREPANCIES, and it counted both kinds until
    // 2026-08-24. The old note said "a deficiency and a discrepancy are equally
    // not ready", and that is the part that was wrong: a deficiency is a
    // document in the post and clears itself when the folder is complete, while
    // a discrepancy means the plan CANNOT BE SERVICED until somebody outside
    // this module corrects a record. Only the second is news, and a tile is the
    // loudest thing on the dashboard.
    //
    // AND THE DEFICIENCIES ARE NOT COUNTED HERE AT ALL. The footer carried them
    // for about an hour ("+ 12 on paperwork") and that was still the dashboard
    // reporting the ordinary course of business: a folder short a document is
    // worked in the billing it belongs to, where the row is marked and Mark
    // Complied closes it. Nothing on this page mentions them now.
    //
    // This slot used to be reasoned about the other way: a billing could not
    // move while anything was outstanding, so the figure was nought on every
    // later tab and the tile was swapped out to avoid a slot that could only say
    // 0. The 2026-08-18 rules removed that premise — a billing now goes through
    // around what it cannot answer — so the figure is real at every stage.
    //
    // The tile still swaps, all the same. Past For Process the useful question
    // is no longer what is unready but WHO put the work through, which is what
    // the list below is cut by there.
    stage === "for-process"
      ? {
          key: "discrepancies",
          Icon: LuCircleAlert,
          title: "Discrepancies",
          value: totals.discrepant.toLocaleString(),
          footerLabel: "Cannot be serviced",
          footerValue: totals.discrepant === 0 ? "None" : stageLabel,
          color: DEFICIENCY_ACCENT,
        }
      : {
          key: "processors",
          Icon: LuUsers,
          title: "Processors",
          value: totals.processors.toLocaleString(),
          footerLabel: "Put through by",
          footerValue:
            totals.processors === 1 ? "1 person" : `${totals.processors} people`,
          // The slate, not another green: the three tiles beside it already
          // carry the brand's two greens and its gold, and a fourth tile in a
          // shade of one of them would read as a repeat of that tile rather
          // than as a figure of its own.
          color: BRAND_COLORS.neutralText,
        },
  ];

  return (
    <Box>
      <SectionTitle
        title="Payables Overview"
        subtitle={`${stageLabel} — what is owed and to whom`}
      />

      <SimpleGrid columns={singleRow ? 4 : 2} gap={3} w="100%">
        {tiles.map(({ key, ...tile }) => (
          <Tile key={key} {...tile} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default ServicePayablesSummary;
