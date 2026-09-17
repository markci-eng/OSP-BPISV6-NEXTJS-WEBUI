"use client";

// ANY LIST OF CLAIMS, over the page — the queue, the history, the ones sent back
// to a branch. One component, because they are the same table asked a different
// question, and three copies of it would be three places for the filters to
// drift apart.
//
// BEHIND A CONTROL AND NOT BESIDE THE WORK, which is the discipline the whole
// screen rests on. A list standing open next to the claim is a standing
// invitation to shop it: take the quick one, leave the awkward one for whoever
// is next. That is exactly what an ordered queue exists to prevent, and it is
// also why the list is not simply forbidden — a processor sometimes KNOWS that
// the third claim down is the urgent one, for a reason no ordering rule can
// hold. Behind a control, browsing stays free and stays one click; it is just a
// deliberate act rather than the default state of the screen.
//
// TWO FILTERS, AND THE SECOND OUTRANKS THE FIRST.
//
//  · NATURE — Death, WOI, Dismemberment, or all. Which kind of claim is being
//    looked at, so it is the first question and it is asked of every list.
//
//  · SPECIAL / REGULAR — drawn only when the nature is Death, because the split
//    comes from filing within seven days of the incident and that is a death
//    claim rule. Over a waiver list it would be a filter on a distinction those
//    claims do not have, whose two options could only ever empty the table. See
//    `showTypeFilter` on the table.
//
// THE FUNNEL IS ON, and it is cut to what a pop-up is opened for: TERRITORY,
// BRANCH and FILED DATE, behind the one icon.
//
// It was off, on the reasoning that a list someone opened to find one claim does
// not want three more questions put to it. That reasoning held for BENEFIT and
// still does — which benefit a claim is for narrows a report, not a search, and
// it is the one of the three left out — but it had the other two backwards. The
// caller who rings a processor does not say a reference number; they say a
// branch, or a territory and roughly when it was filed, and those three together
// are how a list of sixty-five becomes a list of four. The search box answers
// the call that DOES carry a number, which is the easy half.
//
// THE DATE IS THE ONE THAT COULD NOT BE ASKED ANY OTHER WAY. A branch can be
// typed into the search; a filed date cannot be typed into anything — the column
// shows "May 4 · 4:00 am" and no amount of typing finds the week around it. See
// `showFiledDateFilter` on the table.

import { useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { SectionPopup } from "../../components/section-popup";
import { NatureSelect, type ClaimNature } from "../../components/nature-select";
import { YearSelect, type ClaimYear } from "../../components/year-select";
import { DeathClaimsTable } from "../components/DeathClaimsTable";
import type { DeathClaimFilter } from "../components/DeathClaimsFilter";
import type { ClaimKind } from "../../claims-data";
import {
  planholderName,
  toFullName,
  type DeathClaim,
} from "../death-claims-data";

/**
 * The nature control's value against the value a claim carries.
 *
 * Two vocabularies for one fact, and this is the seam between them: the control
 * speaks the navigation's short words ("WOI"), the model speaks the register's
 * full ones ("Waiver of Installment"). Written out rather than derived, so
 * adding a nature to either side fails here instead of silently matching
 * nothing.
 */
const NATURE_KIND: Record<Exclude<ClaimNature, "all">, ClaimKind> = {
  death: "Death Claim",
  woi: "Waiver of Installment",
  dismemberment: "Dismemberment",
};

export function ClaimListPopup({
  open,
  onClose,
  title,
  claims,
  query = "",
  year,
  years,
  onYearChange,
  onOpenClaim,
}: {
  open: boolean;
  onClose: () => void;
  /** Names the dialog for a screen reader. There is no visible heading. */
  title: string;
  /** The claims to list, in the order they should be read. */
  claims: DeathClaim[];
  /**
   * What was typed before this was opened, if the caller has a search field of
   * its own.
   *
   * APPLIED BEFORE THE TABLE SEES THE LIST, rather than pushed into the table's
   * own search box. The rail's field is where the processor was already typing,
   * so arriving here to retype it would be the worst of both; this way the
   * query they ran is the list they get, and the table's own box narrows
   * further from there.
   */
  query?: string;
  /**
   * The period this list is cut by, and the control that changes it.
   *
   * HELD BY THE PAGE, not here, because the rail states the period next to its
   * counts: a year changed in the pop-up has to move the numbers behind it, or
   * the card would go on claiming a total for a year the reader has just left.
   *
   * OPTIONAL, AND THE QUEUE PASSES NOTHING. A queue is not a period — it is
   * everything still waiting, and a claim filed last December is still waiting
   * today. Cutting it by year would hide work rather than scope a total, so the
   * control is simply absent there.
   */
  year?: ClaimYear;
  years?: number[];
  onYearChange?: (year: ClaimYear) => void;
  onOpenClaim: (claim: DeathClaim) => void;
}) {
  const [nature, setNature] = useState<ClaimNature>("all");
  const [filter, setFilter] = useState<DeathClaimFilter>("all");

  // All three arrive together or not at all — see the prop note.
  const showYear =
    year !== undefined && years !== undefined && onYearChange !== undefined;

  // SPECIAL / REGULAR IS ONLY A QUESTION ABOUT DEATH CLAIMS — see the note at
  // the top. "all" and "death" both show death claims, so both draw it.
  const typeFilterApplies = nature === "all" || nature === "death";

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return claims;
    return claims.filter((claim) => {
      const name = planholderName(claim.lpaNo);
      // The four things a processor is ever handed: either number off the
      // paperwork, the plan, or the person. Matched as substrings so a partial
      // reference read off a phone call still finds the claim.
      return [
        claim.reference,
        claim.claimNo ?? "",
        claim.lpaNo,
        name ? toFullName(name) : "",
      ].some((field) => field.toLowerCase().includes(needle));
    });
  }, [claims, query]);

  const byNature = useMemo(
    () =>
      nature === "all"
        ? searched
        : searched.filter((claim) => claim.kind === NATURE_KIND[nature]),
    [searched, nature],
  );

  const counts = useMemo(
    () => ({
      regular: byNature.filter((c) => c.type === "regular").length,
      special: byNature.filter((c) => c.type === "special").length,
      all: byNature.length,
    }),
    [byNature],
  );

  /**
   * What the funnel's two lists offer, taken from the claims on show.
   *
   * OFF `byNature` — after the nature and the caller's query, before the type
   * filter and before the funnel's own ticks. That is the same line the v2 rail
   * draws, and it is drawn there for two reasons that both apply here: an option
   * for a branch that is not in this list could only ever empty it, and reading
   * them off the FILTERED rows instead would be circular — ticking Davao would
   * leave Davao as the only branch on offer, with no way back.
   */
  const branchOptions = useMemo(
    () => Array.from(new Set(byNature.map((c) => c.requestingBranch))).sort(),
    [byNature],
  );

  const territoryOptions = useMemo(
    () => Array.from(new Set(byNature.map((c) => c.territoryCode))).sort(),
    [byNature],
  );

  // The type filter is ignored, not merely hidden, when it does not apply: a
  // "Special" left selected from a death list must not follow the user into a
  // waiver list and empty it.
  const rows = useMemo(
    () =>
      !typeFilterApplies || filter === "all"
        ? byNature
        : byNature.filter((c) => c.type === filter),
    [byNature, filter, typeFilterApplies],
  );

  return (
    <SectionPopup
      title={title}
      open={open}
      onClose={onClose}
      // WIDE ENOUGH FOR THE COLUMNS. The look-up default of 840 cut the Branch
      // column off its own right edge — five columns of identifiers, two of them
      // stacked pairs, need more than a ledger does. The dialog is still capped
      // by the screen, so a narrow window gets a narrow sheet.
      maxW="1100px"
    >
      {/* NO HEADING. The title is the one the caller's own button already
          carries, and repeating it eighteen pixels below that button names the
          same thing twice. The count and nature are not rehoused either: the
          type dropdown on the toolbar carries the count and the nature dropdown
          beside it states the nature, both in the row the eye lands on first.
          The dialog is still LABELLED for a screen reader — see `title` above
          and `SR_ONLY` in `SectionPopup`. */}
      <DeathClaimsTable
        data={rows}
        // The order is the point of these lists, so the dot is on whenever both
        // types are in one — a reader scanning for why a claim sits where it
        // does should not have to open it to find out.
        showTypeDot={typeFilterApplies && filter === "all"}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        showTypeFilter={typeFilterApplies}
        // TERRITORY, BRANCH AND FILED DATE — see the note at the top of this
        // file for why these three and not the other one.
        showFiledDateFilter
        // The table is the answer here and the deck is not on offer — see the
        // prop. A phone still gets cards; it just is not asked.
        showViewToggle={false}
        branchOptions={branchOptions}
        territoryOptions={territoryOptions}
        // BENEFIT IS THE ONE LEFT OUT, and an empty list is how that is said:
        // the table draws no section for a group with nothing in it. One prop
        // the day it is wanted.
        benefitOptions={[]}
        // NATURE AND PERIOD, on the row the table keeps for a caller's own
        // questions — the same slot the v2 dashboard puts its nature dropdown
        // in. The two that scope the list stand together, ahead of the search
        // box that narrows whatever they leave.
        toolbarSlot={
          <Flex gap={2}>
            <NatureSelect value={nature} onChange={setNature} />
            {showYear && (
              <YearSelect
                value={year}
                years={years}
                onChange={onYearChange}
              />
            )}
          </Flex>
        }
        toolbarSlotWidth={showYear ? "290px" : "150px"}
        // THE REQUEST NO IDENTIFIES EVERY CLAIM, which the claim no does not: a
        // claim still waiting to be processed has no header yet. These lists mix
        // the two states — the history holds both — so the column that is always
        // filled is the one they are read by.
        identifier="request"
        // Changing nature changes the list's length, which is what the table
        // treats as a load; without this the rows would swap under the reader
        // with no beat.
        loadKey={`${title}:${nature}:${year ?? "any"}`}
        onProcess={(claim) => {
          onOpenClaim(claim);
          onClose();
        }}
      />
    </SectionPopup>
  );
}

export default ClaimListPopup;
