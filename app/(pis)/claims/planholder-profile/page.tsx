"use client";

import { Page } from "osp-ui-kit";
import { SectionTitle } from "../components/section-title";
import { PlanholderSearch } from "./components/PlanholderSearch";

/**
 * The claims sidebar's "Planholder Profile" entry. A profile needs an LPA
 * number to render, so this page is the search that supplies one — picking a
 * result routes on to `/claims/planholder/[lpaNo]`.
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
          <SectionTitle
            title="Search Plan Holder"
            subtitle="Search by LPA number or name, then open the profile."
          />
          <PlanholderSearch />
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
