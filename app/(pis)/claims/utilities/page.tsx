"use client";

// Claims utilities — the setup screens behind the work queues.
//
// A CATEGORY, NOT A TASK. Every other entry in the claims rail is somewhere a
// claim is worked or looked up; this is where the rules those screens obey are
// edited. Territory assignment is the first of them, and the reference tables
// that follow (nature codes, holiday calendars, rate tables) become further
// views in `UTILITY_VIEWS` rather than routes of their own — so the rail stops
// growing at six entries however many of these accumulate.
//
// The view selector follows `approvals/page.tsx`: one `useState` over a literal
// list of views, with the page itself holding no opinion about what any of them
// render. When the second view lands, lift the list into
// `config/utilities-config.tsx` as a `Record<UtilityView, UtilityConfig>` the
// way approvals does — one record per view, page left dumb.
//
// ASSIGNMENTS ARE KEYED ON A NAME, WHICH IS A KNOWN GAP, NOT AN OVERSIGHT.
// There is no processor entity to point at — `PROCESSORS` in the payables seed
// is a list of display names, `ServiceBilling` records a `processedBy` string,
// and `useCurrentUser()` returns a first name and a role. So this screen edits
// ladders that are correct in shape and unenforceable in fact: nothing routes
// off them until a PersonID reaches the session. `ProcessorId` in the store is
// where that changes.

import { useState } from "react";
import { Page } from "osp-ui-kit";
import { TerritoryAssignment } from "./components/TerritoryAssignment";

type UtilityView = "territory-assignment";

const UTILITY_VIEWS: { label: string; value: UtilityView }[] = [
  { label: "Territory Assignment", value: "territory-assignment" },
];

export default function page() {
  const [view] = useState<UtilityView>("territory-assignment");

  return (
    <Page.Root
      title="Utilities"
      description="Territory assignment and reference setup for the claims area."
      headerButton="menu"
    >
      <Page.MainContent>
        {view === "territory-assignment" && <TerritoryAssignment />}
      </Page.MainContent>
    </Page.Root>
  );
}
