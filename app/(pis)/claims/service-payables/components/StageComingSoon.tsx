"use client";

// The stand-in for a stage that has no workspace yet — Processed, Verified and
// Approved, all three of which are routes before they are screens.
//
// WHY IT IS NOT JUST THE WORD "coming soon". The route exists because the stage
// exists, and the stage already HAS work in it: the dashboard counts it on a tab
// and totals it in a tile. A page that arrived at a blank line would be throwing
// away figures it is already holding, and would leave a user who followed a link
// here unable to tell whether the stage is empty or the screen is unbuilt.
//
// So it says both things. What is here, in the same four figures the dashboard
// leads with, and what is not here yet, in as many words. The one thing it does
// NOT do is offer an action — there is nothing behind it to do.

import Link from "next/link";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { LuArrowLeft } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  BILLING_STAGE_LABELS,
  formatCSP,
  getStageTotals,
  getSupplementaryItems,
  isEndorsedToAccounting,
  type BillingStage,
} from "../service-payables-data";
import { STAGE_ICONS } from "../stage-icons";
import { SupplementaryPanel } from "./SupplementaryPanel";

/** Where the dashboard lives — the one link this page offers. */
const DASHBOARD_HREF = "/claims/service-payables";

/** One figure, in the flat style a summary uses when it is not the headline. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      bg="white"
      px={3}
      py={2.5}
      minW={0}
    >
      <Text
        fontSize="10px"
        fontWeight="600"
        color="gray.400"
        textTransform="uppercase"
        letterSpacing="0.06em"
        truncate
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="700"
        color="gray.800"
        mt="2px"
        whiteSpace="nowrap"
      >
        {value}
      </Text>
    </Box>
  );
}

export interface StageComingSoonProps {
  stage: BillingStage;
  /** One line on what this screen will be for, once it is built. */
  intent: string;
}

export function StageComingSoon({ stage, intent }: StageComingSoonProps) {
  const Icon = STAGE_ICONS[stage];
  const label = BILLING_STAGE_LABELS[stage];

  // Read on every render rather than memoised: this page has no store
  // subscription and nothing on it changes without a navigation, so there is
  // nothing for a memo to save.
  const totals = getStageTotals(stage);

  // The supplementary queue belongs to the ENDORSED stages and only to them —
  // see the panel's own note. Read here rather than inside it so the panel does
  // not have to know what stage it is on.
  const endorsed = isEndorsedToAccounting(stage);
  const supplementary = endorsed ? getSupplementaryItems(stage) : [];

  return (
    // `headerButton="back-mobile"`: the same choice the For Process page makes —
    // the breadcrumb goes back on a desktop, and a phone has no breadcrumb.
    <Page.Root
      title={`${label} Billings`}
      description={intent}
      headerButton="back-mobile"
      paddingBottom={{
        base: "calc(62px + 40px + env(safe-area-inset-bottom, 0px))",
        lg: 10,
        xl: 12,
      }}
    >
      <Page.MainContent>
        <Page.Row>
          {/* No section heading above the panel. `Page.Root` has already put
              this page's title and its one-line intent at the top, and a
              `SectionTitle` under it would say both again — there is only one
              section here for it to name. */}
          <Box maxW="720px">
            <Box
              borderWidth="1px"
              borderColor="gray.200"
              borderStyle="dashed"
              borderRadius="xl"
              bg="gray.50"
              px={{ base: 4, md: 6 }}
              py={{ base: 6, md: 8 }}
            >
              <Flex align="center" gap={2.5} mb={1}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={`${BRAND_COLORS.primaryGreen}15`}
                  color={BRAND_COLORS.darkGreen}
                  display="flex"
                  flexShrink={0}
                >
                  <Icon size={18} />
                </Box>
                <Text fontSize="md" fontWeight="700" color="gray.800">
                  Coming soon
                </Text>
              </Flex>

              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                This screen has not been laid out yet. The stage itself is live —
                the figures below are what is sitting in it right now, and the
                dashboard counts them on its {label} tab.
              </Text>

              {/* The stage's own figures, so the page is worth arriving at even
                  while it is a placeholder. Four across on a desktop, two on a
                  phone — the same break the dashboard's tiles take. */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={2.5} mt={4}>
                <Figure label="Total CSP" value={formatCSP(totals.totalCSP)} />
                <Figure label="Chapels" value={totals.chapels.toLocaleString()} />
                <Figure
                  label="Services"
                  value={totals.services.toLocaleString()}
                />
                <Figure
                  label="Processors"
                  value={totals.processors.toLocaleString()}
                />
              </SimpleGrid>

              {/* Held services are counted here and NOT on the dashboard's
                  fourth tile, which past For Process gives its slot to the
                  processor count. A billing now moves with its unanswered plan
                  holders still unanswered, so the figure is real at this stage
                  and has to be somewhere. */}
              {totals.deficient + totals.discrepant > 0 && (
                <Text fontSize="11px" color="gray.500" mt={2.5}>
                  {totals.discrepant} held by a discrepancy, {totals.deficient}{" "}
                  waiting on paperwork — carried with these billings rather than
                  holding them up.
                </Text>
              )}

              <Flex mt={5}>
                <Link href={DASHBOARD_HREF}>
                  <Flex
                    align="center"
                    gap={1.5}
                    color={BRAND_COLORS.darkGreen}
                    fontSize="xs"
                    fontWeight="700"
                    _hover={{ textDecoration: "underline" }}
                  >
                    <LuArrowLeft size={14} />
                    Back to Service Payables
                  </Flex>
                </Link>
              </Flex>
            </Box>
          </Box>
        </Page.Row>

        {/* Only where the rule applies. A corrected discrepancy on a billing
            that has NOT been endorsed goes straight back onto that billing, so
            on those stages this panel would be a queue that can never fill. */}
        {endorsed && (
          <Page.Row>
            <Box maxW="720px">
              <SupplementaryPanel items={supplementary} />
            </Box>
          </Page.Row>
        )}
      </Page.MainContent>
    </Page.Root>
  );
}

export default StageComingSoon;
