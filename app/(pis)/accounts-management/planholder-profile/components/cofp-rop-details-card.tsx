"use client";

// COFP and ROP Details — beside Planholder Details on the PIS planholder
// profile, in the other half of the row (user, 2026-10-07).
//
// THE SAME CARD AS PLANHOLDER DETAILS: `SectionCard` and `InfoRow`, with the
// name card's edge and lift, so the two halves read as a pair. One card with
// two groups, each under a small caption, rather than two cards: they are
// both the plan's after-payment standing.

import type { ReactNode } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Award } from "lucide-react";

import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import { buildCofpRopDetails, ropScheduleLabel } from "../data/cofp-rop.data";
import { ledgerDate } from "./planholder-details-card";

type Plan = NonNullable<PlanholderPageProps["plans"]>[number];

function Row(props: { label: string; value?: ReactNode }) {
  return <InfoRow {...props} labelWrap compact />;
}

const yesNo = (value?: boolean) =>
  value === undefined ? undefined : value ? "Yes" : "No";

/** A group's caption — the card's title-strip lettering, a size down. */
function GroupLabel({ children, mt = 0 }: { children: string; mt?: number }) {
  return (
    <Text
      mt={mt}
      mb={1}
      pb={1}
      fontSize="2xs"
      fontWeight="semibold"
      color="green.700"
      textTransform="uppercase"
      letterSpacing="wider"
      borderBottomWidth="1px"
      borderColor="gray.100"
    >
      {children}
    </Text>
  );
}

export function CofpRopDetailsCard({
  plan,
  fill = false,
}: {
  plan?: Plan;
  /** Take the height of the row it sits in, from `lg` (`SectionCard`'s). */
  fill?: boolean;
}) {
  const details = plan ? buildCofpRopDetails(plan) : undefined;
  // Unpaid plans have no certificate: every COFP row is an em dash, and so is
  // every ROP row, as is each one for a plan without ROP.
  const cofp = details?.cofp;
  const rop = details?.rop;

  return (
    <SectionCard
      icon={<Award size={14} />}
      title="COFP and ROP Details"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      fill={fill}
    >
      <Box>
        <GroupLabel>COFP</GroupLabel>
        <Row label="COFP No." value={cofp?.cofpNo} />
        <Row label="Memo No." value={cofp?.memoNo} />
        <Row label="Requesting Branch" value={cofp?.requestingBranch} />
        <Row label="Printed" value={yesNo(cofp?.isPrinted)} />
        <Row label="Service Only" value={yesNo(cofp?.serviceOnly)} />
        <Row label="Date Issued" value={ledgerDate(cofp?.dateIssued)} />
        <Row label="Released To" value={cofp?.releasedTo} />
        <Row label="Confiscated" value={yesNo(cofp?.confiscated)} />

        {/* Filled only for a plan with both a COFP and Return of Premium
            (user, 2026-10-07); With ROP says which half is missing when the
            rows below are dashes. */}
        <GroupLabel mt={3}>ROP</GroupLabel>
        <Row label="With ROP" value={yesNo(details?.withRop)} />
        <Row
          label="ROP Schedule"
          value={rop ? ropScheduleLabel(rop.scheduleCount) : undefined}
        />
        <Row label="Assignable" value={yesNo(rop?.isAssignable)} />
        <Row label="Transferable" value={yesNo(rop?.isTransferable)} />
        <Row label="Last ROP Date" value={ledgerDate(rop?.lastRopDate)} />
        <Row label="Next ROP Date" value={ledgerDate(rop?.nextRopDate)} />
      </Box>
    </SectionCard>
  );
}

export default CofpRopDetailsCard;
