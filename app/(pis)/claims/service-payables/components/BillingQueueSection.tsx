"use client";

// The dashboard's work: the four stages a billing passes through, behind one
// set of tabs.
//
// The tabs are {@link TileTabs} — the same control as the death dashboard's
// claim queues and the death form's benefit picker, for the reason given there:
// it is already the shape this area uses for "pick one of these", and the bold
// figure on each tab is the number the user is actually deciding on.
//
// WHAT THE LIST IS CUT BY CHANGES WITH THE STAGE, and that is the whole point
// of this section.
//
//   For Process — territories. Work not yet done is FOUND, and it is found the
//     way the old screen made you find it: pick a territory, then a chapel
//     inside it. Listing billings here would be the workspace's chapel table
//     rendered twice, once without the plan holders that make it useful.
//
//   Processed, Verified, Approved — processors. A billing only leaves For
//     Process once it carries a number and every plan holder under it has been
//     terminated, so a billing on these tabs is finished work with somebody's
//     name on it. Where it sits has stopped being the question; who put it
//     through is the answer these tabs report. See `isProcessorStage`.
//
// Both lists offer the same two views and keep the same view across a stage
// change — a user who switched to the table did so for a reason, and that reason
// does not expire when they look at another stage.

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { SectionTitle } from "../../components/section-title";
import { TileTabs } from "../../components/tile-tabs";
import { useKeepInView } from "../../components/use-keep-in-view";
import {
  ClaimsViewToggle,
  type ClaimsView,
} from "../../components/view-toggle";
import {
  BILLING_QUEUE_LABELS,
  BILLING_STAGE_LABELS,
  BILLING_STAGE_ROUTES,
  formatCSP,
  getProcessorSummaries,
  getTerritorySummaries,
  isProcessorStage,
  type BillingStage,
} from "../service-payables-data";
import { useServicePayablesStore } from "../service-payables-store";
import { STAGE_ICONS } from "../stage-icons";
import { TerritoryCard } from "./TerritoryCard";
import { TerritoryDataTable } from "./TerritoryDataTable";
import { ProcessorCard } from "./ProcessorCard";
import { ProcessorDataTable } from "./ProcessorDataTable";

/**
 * The tab labels, which are NOT {@link BILLING_STAGE_LABELS} — a tab names the
 * QUEUE, so "Processed" billings sit under "For Verification".
 *
 * They used to be spelled out here. They are shared now, because the dashboard's
 * rail links to the same four queues by name and two private copies of a
 * destination's name is how one of them quietly becomes wrong.
 */
const TAB_LABELS = BILLING_QUEUE_LABELS;

/** Reads after the territory count, e.g. "3 territories with work to bill". */
const TERRITORY_VERB: Record<BillingStage, string> = {
  "for-process": "with work to bill",
  processed: "billed, awaiting verification",
  verified: "verified, awaiting approval",
  approved: "approved for release",
};

/**
 * Reads after the BILLING count on a processor stage, e.g. "2 processors · 9
 * billings awaiting verification".
 *
 * Billings rather than processors, because that is what the phrase is about: it
 * is the billings that are awaiting verification, not the people who processed
 * them. "for-process" is here only to make the record total — no processor list
 * is ever drawn for it.
 */
const PROCESSOR_VERB: Record<BillingStage, string> = {
  "for-process": "to bill",
  processed: "awaiting verification",
  verified: "awaiting approval",
  approved: "approved for release",
};

/**
 * Narrowest a card may be laid out before the grid stops adding columns. Every
 * phone is under two of these, so a phone gets one column of full-width cards;
 * the dashboard's main column on a desktop gets two.
 */
const CARD_MIN_WIDTH = "300px";

/**
 * Tallest the section may be on a desktop — a screenful, less the page header
 * and some air. A MAXIMUM, not a height: a short list takes the room it needs,
 * and only a long one starts scrolling inside itself so the tabs stay put.
 */
const DESKTOP_MAX_HEIGHT = "calc(100vh - 200px)";

/** "1 territory" / "3 territories". */
const territories = (count: number) =>
  `${count} ${count === 1 ? "territory" : "territories"}`;

/** "1 processor" / "3 processors". */
const processors = (count: number) =>
  `${count} ${count === 1 ? "processor" : "processors"}`;

/** "1 billing" / "9 billings". */
const billings = (count: number) =>
  `${count} ${count === 1 ? "billing" : "billings"}`;

export interface BillingQueueSectionProps {
  /** The open stage, held by the page so the overview can count the same one. */
  stage: BillingStage;
  onStageChange: (stage: BillingStage) => void;
}

export function BillingQueueSection({
  stage,
  onStageChange,
}: BillingQueueSectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const bringIntoView = useKeepInView(sectionRef);

  // The TABLE by default, which is where this section differs from the claim
  // queues — they open on cards.
  //
  // The difference is what each list is for. A claim queue is worked one claim
  // at a time, so a card is the unit; neither list here is worked at all. The
  // territory list is CHOSEN from and the processor list is READ, and both of
  // those are comparative — which territory is owed most, who has the most
  // stuck. Columns put those figures in line with each other and sort on any of
  // them; the cards can only ever present them in the one order the data
  // arrives in.
  const [view, setView] = useState<ClaimsView>("table");

  const byProcessor = isProcessorStage(stage);

  // Everything on this page is re-read whenever the store changes: creating a
  // billing and terminating the last plan under it move it from one stage to
  // the next, which changes both lists and every tab count.
  const storeVersion = useServicePayablesStore();

  const territorySummaries = useMemo(
    () => (byProcessor ? [] : getTerritorySummaries(stage)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, byProcessor, storeVersion],
  );

  const processorSummaries = useMemo(
    () => (byProcessor ? getProcessorSummaries(stage) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, byProcessor, storeVersion],
  );

  /**
   * Where a territory goes when it is opened, from a card or from a row.
   *
   * The route names the PAGE and the territory rides along as a parameter, so
   * opening a card is the same page a user can reach cold from the sidebar —
   * arriving with the picker already set rather than at a different screen.
   */
  const openTerritory = (territoryCode: string) =>
    router.push(
      `/claims/service-payables/for-process?territory=${encodeURIComponent(
        territoryCode,
      )}`,
    );

  /**
   * Where a processor goes when they are opened, from a card or from a row.
   *
   * The same construction as {@link openTerritory} one stage on: the route names
   * the PAGE and the person rides along as a parameter, so pressing a card is
   * the same screen the sidebar reaches cold, arriving with the picker already
   * set on whoever was pressed.
   *
   * ONLY ON PROCESSED, which is why this is handed to the list conditionally
   * below. Verified and Approved are cut by processor too, and neither has a
   * workspace yet — a card that led to the "coming soon" placeholder would be
   * offering a door onto a wall. They become clickable by giving them a page,
   * not by removing this condition.
   *
   * The path comes from {@link BILLING_STAGE_ROUTES} rather than being spelled
   * out here: the queue's route was renamed once already, and a second copy of
   * it in a dashboard card is exactly the copy that gets missed.
   */
  const openProcessor = (processor: string) =>
    router.push(
      `${BILLING_STAGE_ROUTES.processed}?processor=${encodeURIComponent(
        processor,
      )}`,
    );

  /** Whether the processor list leads anywhere — see {@link openProcessor}. */
  const processorOpens = stage === "processed";

  /**
   * The tab counts, which are the number of ROWS each tab will show — five
   * territories on one, three processors on another.
   *
   * The unit therefore changes with the tab, and that is deliberate: the figure
   * answers "how many things to get through here", which is the question a user
   * scanning the strip is asking, and it never disagrees with the list it sits
   * above. Read whole rather than taken from the lists above, because a billing
   * that moves stage changes a count on a tab that is not the open one.
   */
  const counts = useMemo(() => {
    const byStage = {} as Record<BillingStage, number>;
    for (const key of Object.keys(TAB_LABELS) as BillingStage[]) {
      byStage[key] = isProcessorStage(key)
        ? getProcessorSummaries(key).length
        : getTerritorySummaries(key).length;
    }
    return byStage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeVersion]);

  const rowCount = byProcessor
    ? processorSummaries.length
    : territorySummaries.length;

  const totalCSP = byProcessor
    ? processorSummaries.reduce((sum, p) => sum + p.totalCSP, 0)
    : territorySummaries.reduce((sum, t) => sum + t.totalCSP, 0);

  const billingCount = processorSummaries.reduce(
    (sum, p) => sum + p.billingCount,
    0,
  );

  const subtitle = byProcessor
    ? `${processors(rowCount)} · ${billings(billingCount)} ${
        PROCESSOR_VERB[stage]
      } · ${formatCSP(totalCSP)}`
    : `${territories(rowCount)} ${TERRITORY_VERB[stage]} · ${formatCSP(
        totalCSP,
      )}`;

  return (
    <Box
      ref={sectionRef}
      maxH={{ lg: DESKTOP_MAX_HEIGHT }}
      minH={{ lg: 0 }}
      display={{ lg: "flex" }}
      flexDirection="column"
    >
      {/* Both halves of the heading move with the stage here, where only the
          subtitle used to: the tabs say which stage is open, and the title says
          what the list below is cut by — which is the thing that changes. */}
      <SectionTitle
        title={byProcessor ? "Processed by" : "Territories"}
        subtitle={subtitle}
        // In the heading's action slot rather than in a toolbar of its own:
        // this section has no toolbar — the tabs are the only other control and
        // they change WHICH rows are listed, not how they are drawn. A row
        // holding nothing but the toggle would be a whole band of page spent on
        // one 76px control.
        action={
          <ClaimsViewToggle
            label={byProcessor ? "Processor list view" : "Territory list view"}
            value={view}
            onChange={setView}
          />
        }
      />

      <Box mb={3} flexShrink={0}>
        <TileTabs
          label="Billing stages"
          value={stage}
          onChange={(next) => {
            onStageChange(next);
            // Two stages can happen to hold the same number of rows, in which
            // case nothing resizes and the observer never fires — but the user
            // just asked for this section, so bring it up regardless.
            bringIntoView();
          }}
          options={(Object.keys(TAB_LABELS) as BillingStage[]).map((key) => ({
            value: key,
            label: TAB_LABELS[key],
            count: counts[key],
            Icon: STAGE_ICONS[key],
          }))}
        />
      </Box>

      <Box
        flex={{ lg: "1 1 auto" }}
        minH={{ lg: 0 }}
        overflowY={{ lg: "auto" }}
      >
        {rowCount === 0 ? (
          <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderStyle="dashed"
            borderRadius="xl"
            py={8}
            px={4}
            textAlign="center"
          >
            <Text fontSize="sm" fontWeight="600" color="gray.600">
              Nothing {BILLING_STAGE_LABELS[stage].toLowerCase()}
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              {byProcessor
                ? "No billing has been put through to this stage."
                : "No territory has a billing at this stage."}
            </Text>
          </Box>
        ) : byProcessor ? (
          view === "table" ? (
            <ProcessorDataTable
              data={processorSummaries}
              onOpen={
                processorOpens
                  ? (summary) => openProcessor(summary.processor)
                  : undefined
              }
            />
          ) : (
            <SimpleGrid
              gridTemplateColumns={`repeat(auto-fill, minmax(min(${CARD_MIN_WIDTH}, 100%), 1fr))`}
              gap={3}
            >
              {processorSummaries.map((summary) => (
                <ProcessorCard
                  key={summary.processor}
                  summary={summary}
                  onClick={
                    processorOpens
                      ? () => openProcessor(summary.processor)
                      : undefined
                  }
                />
              ))}
            </SimpleGrid>
          )
        ) : view === "table" ? (
          <TerritoryDataTable
            data={territorySummaries}
            onOpen={(summary) => openTerritory(summary.territoryCode)}
          />
        ) : (
          <SimpleGrid
            gridTemplateColumns={`repeat(auto-fill, minmax(min(${CARD_MIN_WIDTH}, 100%), 1fr))`}
            gap={3}
          >
            {territorySummaries.map((summary) => (
              <TerritoryCard
                key={summary.territoryCode}
                summary={summary}
                onClick={() => openTerritory(summary.territoryCode)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

export default BillingQueueSection;
