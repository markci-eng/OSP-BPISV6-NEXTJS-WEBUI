"use client";

import { Page } from "osp-ui-kit";
import { PlanholderSearch } from "./components/PlanholderSearch";

/**
 * The claims sidebar's "Planholder Profile" entry. A profile needs an LPA
 * number to render, so this page is the list that supplies one — picking a row
 * routes on to `/claims/planholder/[lpaNo]`.
 *
 * NO SECTION TITLE (user, 2026-09-16: "remove the title and display the search
 * bar"). A `SectionTitle` reading "Search Plan Holder" stood over the search
 * field, under a page header already reading "Plan Holder · Look up a plan
 * holder's profile" — the same sentence twice, with the control it described
 * eighteen pixels below it. The table's own search bar is the first thing on the
 * page now, which is how `/plan-management/planholder` reads.
 *
 * THE PAGE HEADER STAYS. It is what the sidebar entry lands on and what the
 * breadcrumb ends at; the BPIS list keeps its own for the same reason. What was
 * removed is the heading INSIDE the content, not the page's name.
 */
export default function ClaimsPlanholderProfilePage() {
  return (
    <Page.Root
      subtitle="Claims"
      title="Plan Holder"
      description="Look up a plan holder's profile"
      headerButton="menu"
    >
      <Page.MainContent>
        <Page.Row>
          <PlanholderSearch />
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
