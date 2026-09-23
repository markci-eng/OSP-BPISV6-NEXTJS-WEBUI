"use client";

// Who the certificate is FOR — the plan holder block of the COFP screen.
//
// The same two-part treatment the service payables panel uses: the shared
// `ProfileHeaderCard` on top (face, name, LPA number, insurability, address and
// contact), then everything the profile card does NOT carry in a card of
// labelled facts under it. The pair reads as one record in two parts, so the
// name and the LPA number are not repeated below.
//
// `DetailCard`, `InfoLabel` and `TooltipLabel` come from the claims area rather
// than being copied here. They are the PIS card shape and the PIS label-over-
// value pair — copying them would put a second of each in the app, and a change
// to one would leave this screen behind.
//
// COFP Number has no source yet. It is shown all the same, with the same dash
// every other empty field shows: a field that is visible and empty is a question
// somebody can answer, where an absent one is one nobody can ask.

import { Box, SimpleGrid } from "@chakra-ui/react";
import { ProfileHeaderCard } from "osp-ui-kit";

import { mockAvatarUrl } from "@/lib/mock-avatar";
import { formatAge, formatFiledDate } from "@/app/(pis)/data";
import { DetailCard } from "../../../claims/components/detail-card";
import { InfoLabel } from "../../../claims/components/info-label";
import { TooltipLabel } from "../../../claims/components/tooltip-label";
import { paymentsFor } from "../data/data";
import type { CofpPlanholder } from "../data/types";
import { CofpPaymentsCard } from "./payments-card";

/** The warning colour the claims cards use for a value worth stopping on. */
const WARNING = "#e11d48";

/** A date on file, or nothing — an empty field draws its own dash. */
function shownDate(iso: string | undefined): string | undefined {
  return iso ? formatFiledDate(iso) : undefined;
}

/** Pesos as the ledger prints them — the unit is in the label. */
function peso(amount: number | undefined): string | undefined {
  if (amount === undefined || !Number.isFinite(amount)) return undefined;
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface CofpPlanholderCardProps {
  planholder: CofpPlanholder;
}

export function CofpPlanholderCard({ planholder }: CofpPlanholderCardProps) {
  const { profile, details } = planholder;

  return (
    <Box>
      <ProfileHeaderCard
        name={profile.name}
        personId={profile.lpaNo}
        avatarUrl={mockAvatarUrl(profile.personId)}
        isInsured={profile.isInsured}
        homeAddress={profile.homeAddress}
        officeAddress={profile.officeAddress}
        contactNo={profile.mobileNo}
        landlineNo={profile.landlineNo}
        email={profile.email}
      />

      <Box mt={4}>
        <DetailCard>
          {/* Four columns where the page is wide enough for them: the dates fill
              the first rows, the money the fourth, and what is left the fifth. */}
          <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gapX={4} gapY={3}>
            <InfoLabel label="Birthdate" value={shownDate(details.birthdate)} />
            {/* TO THE DAY, not in whole years — the contestable year is read
                against it, and a rounded age hides the thing being looked for. */}
            <InfoLabel
              label="Age"
              value={
                details.birthdate
                  ? formatAge(new Date(details.birthdate))
                  : undefined
              }
            />
            <InfoLabel
              label="Effectivity Date"
              value={shownDate(details.effectivityDate)}
            />
            <InfoLabel
              label="New Effectivity Date"
              value={shownDate(details.newEffectivityDate)}
            />

            <InfoLabel label="Move Date" value={shownDate(details.moveDate)} />
            {/* The code, with what it means on hover — see {@link TooltipLabel}. */}
            <TooltipLabel
              label="Termination Status"
              code={details.terminationStatusCode}
              description={details.terminationStatusLabel}
            />
            <InfoLabel
              label="Termination Date"
              value={shownDate(details.terminationDate)}
            />
            <InfoLabel label="PT Status" value={details.ptStatus} />

            {/* The clause this screen is most likely to be stopped by: a
                certificate of full payment only goes out on an account that is
                fully paid, so anything but FP is why the request cannot move. */}
            <TooltipLabel
              label="Account Status"
              code={details.accountStatusCode}
              description={details.accountStatusLabel}
              color={
                details.accountStatusCode && details.accountStatusCode !== "FP"
                  ? WARNING
                  : undefined
              }
            />
            <TooltipLabel
              label="Branch Code"
              code={details.branchCode}
              description={details.branchName}
            />
            <TooltipLabel
              label="Plan Code"
              code={details.planCode}
              description={details.planDesc}
            />
            <InfoLabel label="Plan Class" value={details.planClass} />

            <InfoLabel label="Plan Value" value={peso(details.planValue)} />
            <InfoLabel label="Plan TAP" value={peso(details.planTap)} />
            <InfoLabel
              label="Total Amount Paid"
              value={peso(details.totalAmountPaid)}
            />
            <InfoLabel label="Balance" value={peso(details.balance)} />

            <InfoLabel label="RI Date" value={shownDate(details.riDate)} />
            {/* The one fact here that carries a colour: a plan still inside its
                contestable year is what a processor reads this block for. */}
            <InfoLabel
              label="Contestability"
              value={
                details.contestability === undefined
                  ? undefined
                  : details.contestability === "within"
                    ? "Within contestability"
                    : "Over contestability"
              }
              color={
                details.contestability === "within" ? WARNING : undefined
              }
            />
            {/* NO SOURCE YET — shown empty on purpose, see the note at the top. */}
            <InfoLabel label="COFP Number" value={details.cofpNumber} />
          </SimpleGrid>
        </DetailCard>
      </Box>

      {/* THE LEDGER, folded shut, under the facts it is read against. */}
      <Box mt={4}>
        <CofpPaymentsCard payments={paymentsFor(profile.lpaNo)} />
      </Box>
    </Box>
  );
}

export default CofpPlanholderCard;
