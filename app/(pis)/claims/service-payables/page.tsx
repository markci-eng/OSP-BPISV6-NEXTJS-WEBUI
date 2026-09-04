"use client";

// The Service Payables dashboard.
//
// Laid out to the same plan as the death-claim dashboard, and deliberately: the
// two are worked by the same people, so the figures sit across the top of the
// work column, the work takes the wide column, and the context that qualifies it
// stands in a rail beside it. Below `xl` all of that becomes one stack in mobile
// order.
//
// What it answers depends on the stage, and the work column says which — "where
// is money waiting", territory by territory, on For Process; "who put this
// through", processor by processor, on every stage after it. See
// `BillingQueueSection`. It is not the workspace either way: picking a territory
// is the only action here, and everything on the page is there to make that
// choice an informed one.

import { useMemo, useState } from "react";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import {
  getServiceBillings,
  getStageTotals,
  type BillingStage,
} from "./service-payables-data";
import { useServicePayablesStore } from "./service-payables-store";
import {
  PAGE_PADDING_BOTTOM,
  STACKED_ONLY,
  TWO_COLUMN_ONLY,
  WORKSPACE_ASIDE,
  WORKSPACE_GRID,
  WORKSPACE_MAIN,
  WORKSPACE_ROOT,
} from "./workspace-layout";
import { ServicePayablesSummary } from "./components/ServicePayablesSummary";
import { BillingQueueSection } from "./components/BillingQueueSection";
import { PlanholderSearchField } from "./components/PlanholderSearchField";
import { StageQuickLinks } from "./components/StageQuickLinks";
import { RecentBillings } from "./components/RecentBillings";

const DESCRIPTION =
  "What the chapels are owed for the services they have rendered — by territory, by period.";

export default function ServicePayablesPage() {
  // Creating a billing moves it from one stage to the next, so everything on
  // this page is re-read whenever the store changes.
  const storeVersion = useServicePayablesStore();
  const [stage, setStage] = useState<BillingStage>("for-process");

  // The overview counts the stage that is open, so the tiles and the tabs can
  // never be describing two different things at once.
  //
  // Taken off the billings rather than off the list below, which is no longer
  // one list: the section cuts a For Process stage by territory and every later
  // stage by processor, and those two cuts do not agree on the chapel count.
  // The figures at the top must not move when the cut does.
  const totals = useMemo(
    () => getStageTotals(stage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, storeVersion],
  );

  // THE DISCREPANCY PANEL STOOD HERE and is gone — see the note at the top of
  // `StageQuickLinks`, which took its place. Short version: a discrepancy is
  // worked from the record it belongs to, not from a dashboard, and it is rare
  // enough that a standing panel gave the exception the most valuable column on
  // the page. What this module revolves around is the run of four queues, so
  // that is what the rail leads with now.

  const created = useMemo(
    () => getServiceBillings().filter((b) => b.billingNo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  return (
    // `headerButton="menu"`: a sidebar destination has no parent to go back to,
    // so its header carries the menu rather than a back chevron.
    <Page.Root
      title=""
      // description={DESCRIPTION}
      headerButton="menu"
      // The reserve every page in this module takes under it — see
      // `PAGE_PADDING_BOTTOM`.
      paddingBottom={PAGE_PADDING_BOTTOM}
    >
      <Page.MainContent>
        <Page.Row>
          {/* THE WORKSPACE — the container the split below is measured against.
              See the note at the top of `workspace-layout` on why it is this
              element's width and not the viewport's. */}
          <Box css={WORKSPACE_ROOT}>
            <Grid css={WORKSPACE_GRID}>
              {/* Written FIRST so that stacked — every phone, and every window
                too narrow for two columns — the order is the mobile one: the
                figures, then what is stuck, then the work. `order` swaps it
                once there are two columns.

                Sticky there too, where this is a column beside the work rather
                than a section above it: the user scrolls a long territory list
                for a while, and a deficiency is only context if it is still on
                screen while they do. */}
              <GridItem css={WORKSPACE_ASIDE}>
                <Flex direction="column" gap={5}>
                  {/* THE PLAN HOLDER SEARCH, at the head of the rail — the same
                    field and the same place as the For Process rail's, so the
                    two screens agree about where a name is looked up.

                    FIRST, above even the figures, because it is the one control
                    on this page that does not depend on anything else on it:
                    the tiles, the queues and the recent billings all describe
                    the stage that is open, and a name is looked up regardless of
                    which stage that is.

                    `mb={0}` — the column's own `gap` is the spacing here, where
                    in the For Process rail the controls carry their own.

                    DISPLAY ONLY for now — see `PlanholderSearchField`. */}
                  <PlanholderSearchField mb={0} />

                  {/* Stacked only. In two columns the same figures are the band
                    at the top of the work column, one column over; rendering
                    them here as well would say them twice. */}
                  <Box css={STACKED_ONLY}>
                    <ServicePayablesSummary totals={totals} stage={stage} />
                  </Box>

                  <StageQuickLinks />
                  <RecentBillings billings={created} />
                </Flex>
              </GridItem>

              <GridItem css={WORKSPACE_MAIN}>
                {/* The figures, then the work — only in two columns, because this
                  is the top of a COLUMN and two columns is where there is a
                  second column for it to be the top of. Laid out for the width
                  it has here: four tiles across one row. */}
                <Box css={TWO_COLUMN_ONLY} mb={5}>
                  <ServicePayablesSummary
                    totals={totals}
                    stage={stage}
                    singleRow
                  />
                </Box>

                <BillingQueueSection stage={stage} onStageChange={setStage} />
              </GridItem>
            </Grid>
          </Box>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
