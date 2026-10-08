"use client";

// Planholder Details — the card under the name card on the PIS planholder
// profile (user, 2026-10-07).
//
// THE ROP DETAILS CARD'S DESIGN, by rendering the same components: the
// green-tinted title strip, the dashed leaders, the right-aligned values and
// the em dash for an empty field all come from `SectionCard` and `InfoRow`,
// with the name card's edge and lift, as the ROP panel draws it.
//
// ONE COLUMN on every screen (user, 2026-10-07; it was briefly two). The
// card's width is set by where it is placed, not here. Remarks and Notes are
// not here (user, 2026-10-07): they are the Planholder Remarks and Notes card
// under this one.
//
// NO LPA NUMBER OR NAME: the name card above carries both.

import type { ReactNode } from "react";
import { Grid } from "@chakra-ui/react";
import { User } from "lucide-react";

import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import { getPlanStatement } from "@/components/plan-management/planholder-profile/data/plan-statement";

type Plan = NonNullable<PlanholderPageProps["plans"]>[number];

/** MM/DD/YYYY, as the ROP Details card and the PIS ledger print a date. */
export function ledgerDate(date?: Date | null): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

/** "₱30,000.00", as the PIS screen prints an amount. */
function peso(amount?: number | null): string | undefined {
  if (amount == null) return undefined;
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Compact, labels allowed two lines — a half-width card is narrow for these. */
function Row(props: { label: string; value?: ReactNode; valueWrap?: boolean }) {
  return <InfoRow {...props} labelWrap compact />;
}

export interface PlanholderDetailsCardProps {
  planholder: PlanholderPageProps["planholderInfo"];
  /** The plan selected on the name card; the plan-level rows are its. */
  plan?: Plan;
  /**
   * NO SOURCE YET (2026-10-07): the profile data carries neither, so they
   * show as an em dash until it does.
   */
  dateOfDeath?: Date | null;
  moveDate?: Date | null;
  /** Take the height of the row it sits in, from `lg` (`SectionCard`'s). */
  fill?: boolean;
}

export function PlanholderDetailsCard({
  plan,
  dateOfDeath,
  moveDate,
  fill = false,
}: PlanholderDetailsCardProps) {
  const statement = plan ? getPlanStatement(plan) : undefined;

  return (
    <SectionCard
      icon={<User size={14} />}
      title="Planholder Details"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      fill={fill}
    >
      <Grid templateColumns="minmax(0, 1fr)">
        {/* IN THE USER'S ORDER (2026-10-07). Date of Birth, Age and the
            three statuses are on the name card instead. Total Amount Paid,
            Balance, Installment No., Due Date and Last Payment Date come from
            the statement the Statement of Accounts is built from, so the
            figures agree with it. */}
        <Row label="Account Class" value={plan?.accountClass} />
        <Row
          label="Plan Type"
          value={
            plan
              ? [plan.planCode, plan.planDescription]
                  .filter(Boolean)
                  .join(" - ")
              : undefined
          }
        />
        <Row label="Contract Price" value={peso(plan?.contractPrice)} />
        <Row
          label="Total Amount Payable"
          value={peso(plan?.totalAmountPayable)}
        />
        <Row label="Total Amount Paid" value={peso(statement?.totalPayments)} />
        <Row label="Balance" value={peso(statement?.balance)} />
        <Row
          label="Installment Amount"
          value={plan?.installmentAmount?.toLocaleString("en-PH")}
        />
        <Row label="Installment No." value={statement?.installmentsPaid} />
        <Row
          label="Effectivity Date"
          value={ledgerDate(plan?.effectivityDate)}
        />
        <Row
          label="New Effectivity Date"
          value={ledgerDate(plan?.newEffectivityDate)}
        />
        {/* The next unpaid installment's due date, or the last one's once
            the plan is fully paid — the statement's own figure. */}
        <Row label="Due Date" value={ledgerDate(statement?.nextDueDate)} />
        <Row label="Move Date" value={ledgerDate(moveDate)} />
        <Row
          label="Service Only"
          value={plan ? (plan.isServiceOnly ? "Yes" : "No") : undefined}
        />
        <Row label="Date of Death" value={ledgerDate(dateOfDeath)} />
        <Row
          label="Last Payment Date"
          value={ledgerDate(statement?.paymentRecords[0]?.siDate)}
        />
      </Grid>
    </SectionCard>
  );
}

export default PlanholderDetailsCard;
