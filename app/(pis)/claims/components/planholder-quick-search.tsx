"use client";

// Plan holder search as a section of its own — a way into a claim from
// anywhere it is dropped, rather than a control belonging to whatever sits
// under it.
//
// That independence is the point. The dashboard's feed shows what has just
// MOVED; this searches the whole file. Put inside the feed, the field reads as
// a filter over those few updates, and typing a name that is not among them
// looks like the search is broken rather than like the feed is short. Standing
// on its own, with its own rows, it is what it is: the same search the plan
// holder search page runs, against the same data, arriving in the same place.
//
// The control itself is the kit's `LookupField` — the standard lookup, fed our
// plan holders. It brings the parts this used to hand-roll and then some: the
// typeahead panel under the field, "See all N results", and a full table behind
// it with per-column sorting and filtering, paged, keyboard-navigable. What is
// ours is the DATA and where a pick GOES.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { LookupField, type LookupColumn } from "osp-ui-kit";
import {
  listPlanholders,
  type PlanholderSearchResult,
} from "../claims-data";

/**
 * The table behind "See all results". Narrow enough to read in the modal on a
 * phone, and in the order the paperwork gives them: the number identifies the
 * plan, the name identifies the person, the plan is what they hold.
 *
 * The plan is the one column worth FILTERING on — there is a handful of plans
 * and hundreds of holders, so the filter narrows the set; a filter on a number
 * or a name is just the search field again.
 */
const COLUMNS: LookupColumn<PlanholderSearchResult>[] = [
  { key: "lpaNo", header: "LPA No." },
  { key: "name", header: "Plan Holder" },
  { key: "planDesc", header: "Plan", enableColumnFilter: true },
];

/**
 * What is matched as you type, and what the modal's own field searches.
 *
 * The two the paperwork gives a processor — they type whichever one they were
 * handed and should not have to say which. `planDesc` is deliberately NOT here:
 * typing "ST.ANNE" would return every holder of that plan, which is a filter
 * dressed as a search, and the column filter already does it properly.
 */
const SEARCH_KEYS: (keyof PlanholderSearchResult & string)[] = [
  "lpaNo",
  "name",
];

export interface PlanholderQuickSearchProps {
  placeholder?: string;
}

export function PlanholderQuickSearch({
  placeholder,
}: PlanholderQuickSearchProps) {
  const router = useRouter();

  // Read once per mount rather than on every render: the lookup filters,
  // sorts and pages this array, and handing it a new one each time would throw
  // that work away between keystrokes.
  const planholders = useMemo(() => listPlanholders(), []);

  return (
    // The kit's field lights a 3px `primary-disabled` ring on focus and eases
    // its border over 150ms. Both are off our own `SearchBar` — at that width
    // the ring is a solid band of light green and reads as a second, filled box
    // behind the field — and the two controls have to agree, so they come off
    // here as well.
    //
    // Scoped to the trigger — the lookup's own root is this wrapper's child and
    // the field is the first thing in it. The suggestion panel is a later
    // sibling and the modal is portalled out entirely, so neither is touched.
    // `!important` because the kit's values arrive as a class of equal weight
    // and this has to be the one that lands.
    <Box
      css={{
        "& > div > div:first-of-type": { transitionProperty: "none !important" },
        "& > div > div:first-of-type:focus-within": {
          boxShadow: "none !important",
        },
      }}
    >
      <LookupField<PlanholderSearchResult>
        placeholder={placeholder ?? "Search by LPA No. or name"}
        modalTitle="Search Plan Holders"
        columns={COLUMNS}
        dataSource={planholders}
        searchKeys={SEARCH_KEYS}
        // One line per suggestion, so the name leads and the number that
        // confirms it follows — the order they are read in.
        renderDisplay={(planholder) =>
          `${planholder.name} · ${planholder.lpaNo}`
        }
        // Never holds a selection. A pick here is a way OUT of this page, not a
        // value to keep in the field: the profile it opens IS the answer, and a
        // name left sitting in the rail afterwards would claim the search is
        // still the subject of a page that has since moved on.
        value={null}
        onSelect={(planholder) => {
          if (!planholder) return;
          router.push(
            `/claims/planholder/${encodeURIComponent(planholder.lpaNo)}`,
          );
        }}
        // The modal is the whole screen on a phone. It is a table with a search
        // field over it, and a centred dialog would leave it scrolling inside a
        // box inside a page.
        mobileFullscreen
      />
    </Box>
  );
}

export default PlanholderQuickSearch;
