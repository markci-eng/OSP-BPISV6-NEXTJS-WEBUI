"use client";

// Who the service record is FOR — the plan holder block of the LEFT column,
// above the form that is filled in against them.
//
// It leads with the SHARED PROFILE CARD, the same `PlanholderProfileHeader` the
// plan holder page and the claim view lead with. This used to be a hand-built
// grid of eighteen labelled facts under a "Plan Holder" heading, which meant one
// person was drawn one way here and another way everywhere else in claims — and
// the way here was the poorer of the two: no face, no address, no contact, and a
// heading doing the work a card's own identity should do.
//
// The card carries the name, the LPA number, the avatar, whether they are
// insurable, both addresses and all three contact channels. It does NOT carry
// the plan or the dates, and this screen is where those matter — so THE NEXT ROW
// is the rest of the record, under the card, in the claims area's own pairs.
//
// No section heading over either. The card names the person; a heading above it
// reading "Plan Holder" was naming what was already unmistakable.
//
// WHICH NINETEEN FACTS, AND IN WHAT ORDER, is the user's own list (2026-08-26)
// and it is followed exactly. It is the order the screen this replaces reads in,
// which is the order a processor's eye already knows — so it is not re-grouped
// here on any argument about how it might read better.
//
// THREE OF THE NINETEEN HAVE NO SOURCE YET: PT Status, Termination Date and COFP
// Number. They are SHOWN ALL THE SAME, at the user's instruction, and they show
// the same dash every other empty field on this card shows.
//
// That reverses a decision this file used to carry, and the reasoning it
// reversed was not wrong: a dash reads as "this plan has none", where the truth
// is "nobody has wired this up". Leaving the fields OUT said the same thing more
// honestly. What it also did was hide, from the person who has to check the
// list, which fields are still owed — and the fields are owed. Shown and empty
// is a question somebody can answer; absent is one nobody can ask.
//
// TERMINATION DATE IS HALF-IMPLEMENTED and that is the one worth knowing about.
// It is the date the account was terminated — either here, or earlier at the
// branch as a pre-termination. This session's own terminations carry it
// (`TblClaimsSP.AuditDate`), so it fills in the moment the plan is terminated;
// a plan pre-terminated at a branch has no column in this data layer to read,
// and shows the dash.
//
// THERE IS NO LEDGER SUB-GROUP any more. The four money figures used to be ruled
// off under their own label, on the reasoning that they read as one block; the
// given order puts them in the middle of the list, between Plan Class and RI
// Date, so the block would have to be broken to keep the order or the order
// broken to keep the block. The order is the user's and the grouping was ours.

import { Box, SimpleGrid } from "@chakra-ui/react";
import { db, formatAge, formatFiledDate, type Planholder } from "../../../data";
import { TooltipLabel } from "../../components/tooltip-label";
import { DetailCard } from "../../components/detail-card";
import { InfoLabel } from "../../components/info-label";
import { PlanholderProfileHeader } from "../../planholder/components/PlanholderProfileHeader";
import type { ServiceRecord } from "../service-payables-data";
import { getTermination } from "../service-payables-store";

/** A date on file, or nothing. `Date | null` because that is what the model has. */
function shownDate(date: Date | null | undefined): string | undefined {
  return date ? formatFiledDate(date.toISOString()) : undefined;
}

/** Pesos as the ledger prints them — the unit is in the label. */
function peso(amount: number | undefined): string | undefined {
  if (amount === undefined || !Number.isFinite(amount)) return undefined;
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface PlanholderPanelProps {
  service: ServiceRecord;
  /** The plan, when it is on file. A service always names one, so it is. */
  planholder?: Planholder;
}

export function PlanholderPanel({ service, planholder }: PlanholderPanelProps) {
  /**
   * When the account was terminated — this session's, when there is one.
   *
   * `TblClaimsSP.AuditDate` is the date the plan went into the billing, which is
   * exactly what this field is asking for. A plan PRE-TERMINATED at a branch has
   * the same field filled from somewhere this data layer does not have, so it
   * stays empty until it does — see the note at the top.
   */
  const terminatedAtISO = getTermination(service.id)?.auditDate;

  return (
    <Box>
      {planholder && <PlanholderProfileHeader planholder={planholder} />}

      {/* The next row: everything the profile card does not carry.
          Deliberately NOT the name, the LPA number or insurability — the card
          above has all three, and repeating them would make the pair read as
          two records of one person rather than one record in two parts. */}
      <Box mt={4}>
        <DetailCard>
          {/* The same column counts the profile's own details panel uses, so
              the same facts are set the same way in both places. This is the
              wide column of the page, which is what makes four possible here
              and two the most a 380px rail could take. */}
          {/* NINETEEN FACTS IN THE GIVEN ORDER — see the note at the top. Four
              columns is what makes that order read as rows of related things:
              the dates fill the first three rows, the money the fourth, and the
              three that are left the fifth. */}
          <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gapX={4} gapY={3}>
            <InfoLabel
              label="Birthdate"
              value={shownDate(planholder?.dateOfBirth)}
            />
            {/* TO THE DAY, not in whole years — see `formatAge`. */}
            <InfoLabel
              label="Age"
              value={
                planholder?.dateOfBirth
                  ? formatAge(planholder.dateOfBirth)
                  : undefined
              }
            />
            <InfoLabel
              label="Effectivity Date"
              value={shownDate(planholder?.effectivityDate)}
            />
            <InfoLabel
              label="New Effectivity Date"
              value={shownDate(planholder?.newEffectivityDate)}
            />

            <InfoLabel
              label="Move Date"
              value={shownDate(planholder?.transferDate)}
            />
            {/* The code, with what it means on hover — see {@link TooltipLabel}. */}
            <TooltipLabel
              label="Termination Status"
              code={planholder?.termiStatCode}
              description={planholder?.terminationStatus}
            />
            {/* Filled the moment this session terminates the plan; empty for one
                pre-terminated at a branch, which this layer cannot read. */}
            <InfoLabel
              label="Termination Date"
              value={terminatedAtISO ? formatFiledDate(terminatedAtISO) : undefined}
            />
            {/* NO SOURCE YET. Shown because the list asks for it. */}
            <InfoLabel label="PT Status" />

            {/* The clause of the service rule this screen is most likely to be
                stopped by: a plan is only serviceable once its account is fully
                paid, so anything else here is why the Terminate button will not
                fire.

                IT KEEPS ITS COLOUR THROUGH THE CODE. `FP` in red is the same
                warning "Lapsed" in red was — the field is read for whether it
                says FP, and a two-letter value is read faster than a phrase. */}
            <TooltipLabel
              label="Account Status"
              code={planholder?.accountStatus}
              description={planholder?.accountStatusLabel}
              color={
                planholder && !planholder.isFullyPaid ? "#e11d48" : undefined
              }
            />
            {/* The branch's NAME on hover — this one was already a bare code
                with nothing on the card saying which branch it is, so the hover
                adds a fact rather than tucking one away. */}
            <TooltipLabel
              label="Branch Code"
              code={service.phBranchCode}
              description={db.getBranch(service.phBranchCode)?.description}
            />
            {/* The code, with the plan's name on hover — the same treatment
                Termination Status gets, see {@link TooltipLabel}.

                THE DESCRIPTION IS NOT DROPPED, and it matters more here than on
                the other one: the CSP code on the form below is derived from the
                plan's DESCRIPTION, so a processor checking that derivation needs
                to be able to read it. A hover is where it goes, not the bin. */}
            <TooltipLabel
              label="Plan Code"
              code={service.planCode}
              description={service.planDesc}
            />
            <InfoLabel label="Plan Class" value={planholder?.planClass} />

            <InfoLabel
              label="Plan Value"
              value={peso(planholder?.planDetail.contractPrice)}
            />
            <InfoLabel
              label="Plan TAP"
              value={peso(planholder?.planDetail.tap)}
            />
            <InfoLabel
              label="Total Amount Paid"
              value={peso(planholder?.planDetail.totalAmountPaid)}
            />
            <InfoLabel
              label="Balance"
              value={peso(planholder?.planDetail.balance)}
            />

            <InfoLabel label="RI Date" value={shownDate(planholder?.riDate)} />
            {/* The one fact here that carries a colour: a plan still inside its
                contestable year is what can stop a payable, and it is why a
                processor reads this block at all. */}
            <InfoLabel
              label="Contestability"
              value={
                planholder === undefined
                  ? undefined
                  : planholder.contestability === "within"
                    ? "Within contestability"
                    : "Over contestability"
              }
              color={
                planholder?.contestability === "within" ? "#e11d48" : undefined
              }
            />
            {/* NO SOURCE YET. Shown because the list asks for it. */}
            <InfoLabel label="COFP Number" />
          </SimpleGrid>

          {/* THE REMARKS USED TO BE RULED OFF HERE, as a run of plain lines
              under a `GroupLabel`. They are their own section under the card now
              — `RemarksPanel`, the shape the death claim has always drawn a
              trail in (user, 2026-08-27). Two things were wrong with them here:
              a run of unbounded lines inside a card of labelled facts grew the
              card by however many years of account history the plan happened to
              have, and it was the one thing in claims that said "remarks"
              without looking like the remarks on every other screen. */}
        </DetailCard>
      </Box>
    </Box>
  );
}

export default PlanholderPanel;
