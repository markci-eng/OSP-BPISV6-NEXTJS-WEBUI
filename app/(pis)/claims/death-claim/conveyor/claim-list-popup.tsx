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
// ONE FILTER FOR WHAT KIND OF CLAIM — All, Special, Regular, Waiver of
// Installment, Dismemberment (user, 2026-10-05). It used to be two: a Nature
// control (Death / WOI / Dismemberment) and a Special / Regular one drawn only
// over death claims. Folded into one, a reader can no longer ask for a Special
// waiver, and Special and Regular stay death-claim-only by construction — see
// `matchesClaimFilter`.
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

import { useEffect, useMemo, useState } from "react";
import { Text, useBreakpointValue } from "@chakra-ui/react";
import { db } from "@/app/(pis)/data";
import { ListPopup } from "../../components/section-popup";
import {
  QueueSearchSheet,
  SheetChoiceGroup,
  SheetDateRange,
} from "../../components/queue-search-sheet";
import { YearSelect, type ClaimYear } from "../../components/year-select";
import { ClaimCard, DeathClaimsTable } from "../components/DeathClaimsTable";
import {
  FILTER_OPTIONS,
  claimFilterCounts,
  matchesClaimFilter,
  type DeathClaimFilter,
} from "../components/DeathClaimsFilter";
import {
  planholderName,
  toFullName,
  type DeathClaim,
} from "../death-claims-data";

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
  const [filter, setFilter] = useState<DeathClaimFilter>("all");

  // All three arrive together or not at all — see the prop note.
  const showYear =
    year !== undefined && years !== undefined && onYearChange !== undefined;

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

  /** Each filter's count over what the caller's query left. */
  const counts = useMemo(() => claimFilterCounts(searched), [searched]);

  /**
   * What the funnel's two lists offer, taken from the claims on show.
   *
   * OFF `searched` — after the caller's query, before the kind filter and before the funnel's own ticks. That is the same line the v2 rail
   * draws, and it is drawn there for two reasons that both apply here: an option
   * for a branch that is not in this list could only ever empty it, and reading
   * them off the FILTERED rows instead would be circular — ticking Davao would
   * leave Davao as the only branch on offer, with no way back.
   */
  const branchOptions = useMemo(
    () => Array.from(new Set(searched.map((c) => c.requestingBranch))).sort(),
    [searched],
  );

  const territoryOptions = useMemo(
    () => Array.from(new Set(searched.map((c) => c.territoryCode))).sort(),
    [searched],
  );

  const rows = useMemo(
    () => searched.filter((c) => matchesClaimFilter(c, filter)),
    [searched, filter],
  );

  /* ───────────── THE PHONE'S SHEET — see `QueueSearchSheet` ─────────────
     Below `lg` the list opens as a bottom sheet instead of the table's dialog.
     It starts from the same `searched` the table gets, and adds back what the
     table's own toolbar does on the desktop: its search box, and the funnel's
     territory, branch and filed date — matched exactly as the table matches
     them, so the two never disagree about what a filter finds. */
  const isPhone = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [sheetQuery, setSheetQuery] = useState("");
  const [territories, setTerritories] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [filed, setFiled] = useState({ from: "", to: "" });

  // A sitting's filters end with it, and with a change of list — the table's
  // own rule; see `loadKey` there.
  const loadKey = `${title}:${year ?? "any"}`;
  useEffect(() => {
    setTerritories([]);
    setBranches([]);
    setFiled({ from: "", to: "" });
  }, [loadKey, open]);
  useEffect(() => {
    if (open) setSheetQuery("");
  }, [open]);

  /** `searched` narrowed by the sheet's search — what the tab counts read. */
  const sheetSearched = useMemo(() => {
    const q = sheetQuery.trim().toLowerCase();
    if (!q) return searched;
    return searched.filter((c) => {
      const nm = planholderName(c.lpaNo);
      return [
        nm ? toFullName(nm) : "",
        c.reference,
        c.claimNo ?? "",
        c.lpaNo,
        c.requestingBranch,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [searched, sheetQuery]);

  // THE COUNTS FOLLOW THE SEARCH, NOT THE FUNNEL — Service's rule: a tab
  // reading 0 because a territory was ticked would say the claim is nowhere.
  const sheetCounts = claimFilterCounts(sheetSearched);
  const sheetTabs = FILTER_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    count: sheetCounts[opt.value],
  }));

  // Branches narrowed to the ticked territories, as the table does — a branch
  // belongs to one territory, so the rest could only empty the list.
  const sheetBranchOptions = useMemo(
    () =>
      territories.length
        ? branchOptions.filter((b) =>
            searched.some(
              (c) =>
                c.requestingBranch === b &&
                territories.includes(c.territoryCode),
            ),
          )
        : branchOptions,
    [branchOptions, searched, territories],
  );
  // ...and a branch ticked before its territory was taken away goes with it.
  useEffect(() => {
    setBranches((current) => {
      const next = current.filter((b) => sheetBranchOptions.includes(b));
      return next.length === current.length ? current : next;
    });
  }, [sheetBranchOptions]);

  const filedSpan = useMemo(() => {
    const days = searched.map((c) => c.filedAt.slice(0, 10)).sort();
    return { min: days[0], max: days[days.length - 1] };
  }, [searched]);

  const sheetRows = useMemo(
    () =>
      sheetSearched.filter((c) => {
        if (!matchesClaimFilter(c, filter)) return false;
        if (territories.length && !territories.includes(c.territoryCode)) {
          return false;
        }
        if (branches.length && !branches.includes(c.requestingBranch)) {
          return false;
        }
        // The day, not the instant — the table's own comparison.
        const day = c.filedAt.slice(0, 10);
        if (filed.from && day < filed.from) return false;
        if (filed.to && day > filed.to) return false;
        return true;
      }),
    [sheetSearched, filter, territories, branches, filed],
  );

  const sheetFilterCount =
    territories.length +
    branches.length +
    (filed.from || filed.to ? 1 : 0);

  const clearSheetFilters = () => {
    setTerritories([]);
    setBranches([]);
    setFiled({ from: "", to: "" });
  };

  // BOTH ALWAYS MOUNTED, `open` choosing between them — never one swapped for
  // the other. See `SectionPopup`.
  return (
    <>
      <QueueSearchSheet
        title={title}
        open={open && isPhone}
        onClose={onClose}
        tabs={sheetTabs}
        activeTab={filter}
        onTabChange={(key) => setFilter(key as DeathClaimFilter)}
        query={sheetQuery}
        onQueryChange={setSheetQuery}
        placeholder="Reference, name or LPA…"
        items={sheetRows}
        getKey={(claim) => claim.reference}
        renderItem={(claim) => (
          <ClaimCard
            claim={claim}
            showTypeDot={filter === "all"}
            identifier="request"
            onClick={() => {
              onOpenClaim(claim);
              onClose();
            }}
          />
        )}
        empty={
          <Text fontSize="sm" color="gray.500" textAlign="center" py={10}>
            {sheetFilterCount
              ? "No claim here matches the filters. Clear them to see the rest."
              : sheetQuery.trim()
                ? "No claim here carries that reference, name or LPA."
                : "There is no claim in this list."}
          </Text>
        }
        filterCount={sheetFilterCount}
        onClearFilters={clearSheetFilters}
        renderFilters={() => (
          <>
            {/* Checked one by one rather than through `showYear`, so the
                callbacks below know each is there. */}
            {year !== undefined && years && onYearChange && (
              <SheetChoiceGroup
                label="Year"
                options={[
                  { value: "all", label: "All years" },
                  ...years.map((y) => ({ value: String(y), label: String(y) })),
                ]}
                selected={[String(year)]}
                onChange={([y]) =>
                  onYearChange(y === "all" ? "all" : Number(y))
                }
              />
            )}
            <SheetDateRange
              label="Filed"
              from={filed.from}
              to={filed.to}
              min={filedSpan.min}
              max={filedSpan.max}
              onChange={setFiled}
            />
            <SheetChoiceGroup
              label="Territory"
              multi
              options={territoryOptions.map((t) => ({
                value: t,
                label: db.getTerritoryName(t) || t,
              }))}
              selected={territories}
              onChange={setTerritories}
            />
            <SheetChoiceGroup
              label="Branches"
              multi
              options={sheetBranchOptions.map((b) => ({ value: b, label: b }))}
              selected={branches}
              onChange={setBranches}
            />
          </>
        )}
      />

      <ListPopup
        title={title}
        open={open && !isPhone}
        onClose={onClose}
        // WIDE ENOUGH FOR THE COLUMNS. The look-up default of 840 cut the Branch
        // column off its own right edge — five columns of identifiers, two of them
        // stacked pairs, need more than a ledger does. The dialog is still capped
        // by the screen, so a narrow window gets a narrow sheet.
        maxW="1100px"
      >
        {/* NO HEADING. The title is the one the caller's own button already
            carries, and repeating it eighteen pixels below that button names the
            same thing twice. The count and kind are not rehoused either: the
            kind dropdown on the toolbar carries both, in the row the eye lands
            on first.
            The dialog is still LABELLED for a screen reader — see `title` above
            and `SR_ONLY` in `SectionPopup`. */}
        <DeathClaimsTable
          data={rows}
          // The order is the point of these lists, so the dot is on whenever both
          // types are in one — a reader scanning for why a claim sits where it
          // does should not have to open it to find out.
          showTypeDot={filter === "all"}
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
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
          // THE PERIOD, on the row the table keeps for a caller's own
          // questions, ahead of the search box that narrows whatever it leaves.
          // The nature dropdown that stood beside it went into the kind filter
          // (2026-10-05).
          toolbarSlot={
            showYear ? (
              <YearSelect value={year} years={years} onChange={onYearChange} />
            ) : undefined
          }
          toolbarSlotWidth="140px"
          // THE REQUEST NO IDENTIFIES EVERY CLAIM, which the claim no does not: a
          // claim still waiting to be processed has no header yet. These lists mix
          // the two states — the history holds both — so the column that is always
          // filled is the one they are read by.
          identifier="request"
          // Changing the year changes the list's length, which is what the table
          // treats as a load; without this the rows would swap under the reader
          // with no beat.
          loadKey={loadKey}
          onProcess={(claim) => {
            onOpenClaim(claim);
            onClose();
          }}
        />
      </ListPopup>
    </>
  );
}

export default ClaimListPopup;
