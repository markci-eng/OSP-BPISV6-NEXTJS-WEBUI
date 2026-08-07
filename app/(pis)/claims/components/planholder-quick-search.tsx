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

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchPlanholders } from "../claims-data";
import { PlanholderResultRow } from "./planholder-result-row";
import { SearchBar } from "./search-bar";

export interface PlanholderQuickSearchProps {
  /**
   * How many hits to show. The default suits a narrow column — a rail full of
   * results would bury whatever it is standing above.
   */
  limit?: number;
  /** Tighter rows, for a narrow column. See {@link PlanholderResultRow}. */
  compact?: boolean;
  placeholder?: string;
}

export function PlanholderQuickSearch({
  limit = 6,
  compact = false,
  placeholder,
}: PlanholderQuickSearchProps) {
  const router = useRouter();

  // Debounced at 300ms, matching the plan holder list in accounts-management —
  // the field this one is modelled on. `query` drives the input and
  // `debouncedQuery` drives the results, which is the whole point of the pair:
  // the field stays immediate under the fingers while the list settles behind.
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Whether the panel is UP, which is not the same question as whether there is
  // a query. A field left with a name still in it is a common way to leave one
  // — the reader looked, found what they wanted or did not, and moved on — and
  // the results have no business floating over the rail after that. So the
  // panel is dismissed as soon as the field is left, and comes back when it is
  // returned to.
  const [open, setOpen] = useState(false);
  const showResults = open && query.trim().length > 0;

  const results = useMemo(
    () => searchPlanholders(debouncedQuery, limit),
    [debouncedQuery, limit],
  );

  // The whole control — field and panel. What is INSIDE it keeps the panel up;
  // anything else takes it down.
  const rootRef = useRef<HTMLDivElement>(null);

  // Dismissal is listened for on the document rather than handled as the
  // field's own blur: a click on a result would otherwise dismiss the panel
  // before the click landed on the row (the blur fires first), and the hit
  // would be swallowed on the browsers that do not focus a button when it is
  // pressed. Asking "was the thing that happened inside this control?" is the
  // same question without that ordering problem.
  //
  // `pointerdown` covers the click and the tap; `focusin` covers tabbing away
  // to something else on the page.
  useEffect(() => {
    if (!showResults) return;

    const dismissIfOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) setOpen(false);
    };

    document.addEventListener("pointerdown", dismissIfOutside);
    document.addEventListener("focusin", dismissIfOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissIfOutside);
      document.removeEventListener("focusin", dismissIfOutside);
    };
  }, [showResults]);

  const openProfile = (lpaNo: string) => {
    setOpen(false);
    router.push(`/claims/planholder/${encodeURIComponent(lpaNo)}`);
  };

  /** One hit means the answer is already decided — see the search page. */
  const submit = () => {
    if (results.length === 1) openProfile(results[0].lpaNo);
  };

  return (
    // The anchor the results hang from. Everything below this component keeps
    // its place while they are up, so it has to be the nearest positioned
    // ancestor — the panel is measured against THIS box, not the page.
    //
    // No height of its own: the field's height is the section's, so a caller
    // that stacks this above something else gets the two adjacent rather than
    // separated by whatever room was left over.
    <Box position="relative" ref={rootRef}>
      <SearchBar
        value={query}
        // Typing is the other way in, and the one that matters after Escape:
        // the panel was dismissed with the query still in the field, and the
        // next keystroke should bring the results back rather than leave the
        // reader typing at nothing.
        onChange={(next) => {
          setQuery(next);
          setOpen(true);
        }}
        placeholder={placeholder ?? "Search by LPA No. or name"}
        label="Search plan holders"
        onSearch={submit}
        // Bubbles up from the input inside — the whole control counts as
        // focused, which is what returning to the field means here.
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
            return;
          }
          // Escape puts the panel away without clearing what was typed, and
          // leaves the caret where it is — the standard way out of an open
          // list, and the only one available without lifting a hand.
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        // A notch shorter and tighter in a narrow column, where the field is
        // one of three things stacked in a rail rather than the subject of a
        // page. `size` and not a height: the input carries both, see SearchBar.
        size={compact ? "sm" : "md"}
      />

      {/* Nothing at rest, and nothing once the control is left. An empty query
          has no results to show and no message worth the room — the placeholder
          in the field has already said what this is, and a standing hint under
          it would cost a block of the column permanently to repeat itself. */}
      {showResults && (
        // Floated over the section below rather than pushed into it. In the
        // flow, every keystroke that changed the number of hits would move
        // Recent Updates down the page under the reader's eye — and clearing
        // the field would snap it back. Out of the flow, the column is still
        // while the search runs.
        //
        // Same panel the kit's own lookup drops under its field: white, `xl`
        // radius, hairline border, deep shadow. It has to read as sitting ABOVE
        // the page rather than as a section of it, and the shadow is what says
        // so.
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex={1500}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="xl"
          overflow="hidden"
          p={1}
        >
          {results.length === 0 ? (
            <Text fontSize="xs" color="gray.500" py={3} textAlign="center">
              {/* The typed query, not the debounced one: the debounced value
                  lags by 300ms, and quoting it back would name something the
                  user has already finished changing. */}
              No plan holder matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            <Flex direction="column">
              {results.map((result) => (
                <PlanholderResultRow
                  key={result.lpaNo}
                  result={result}
                  onSelect={openProfile}
                  compact={compact}
                />
              ))}
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}

export default PlanholderQuickSearch;
