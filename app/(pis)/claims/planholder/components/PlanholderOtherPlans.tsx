"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, VStack } from "@chakra-ui/react";
import {
  getOtherPlansForPerson,
  type PlanholderOtherPlan,
} from "../../claims-data";
import { SectionCard } from "../../components/section-card";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { OtherPlanRow } from "./OtherPlanRow";

/* ------------------------------ section ------------------------------ */

interface PlanholderOtherPlansProps {
  /** The person whose plans are looked up. */
  personId?: string;
  /** The plan being viewed — excluded from the list. */
  currentLpaNo?: string;
  /**
   * Draw the section inside the column's card, the same as Remarks and the
   * folder above it.
   *
   * THE CARD IS DECIDED BY THE COLUMN, and everywhere else in this area the
   * column draws it at the call site — see the note on {@link SectionCard}. It
   * cannot here: this section renders NOTHING on a person who holds one plan,
   * and a card wrapped around it from outside would survive as an empty card at
   * the bottom of the page. Only this component knows whether there is anything
   * to card, so the caller asks for it and the component decides where.
   */
  carded?: boolean;
}

/**
 * The other plans owned by the same person — the last section on the plan
 * holder page.
 *
 * Unlike every section above it, this one RENDERS NOTHING when there is
 * nothing to show. The sections above are records the plan holder always has
 * (or can add to), so an empty state there is useful; a person with only one
 * plan has no "other plans" to add, so an empty card would be pure noise at the
 * bottom of an already long page.
 *
 * Rows navigate to the other plan's own page instead of opening a drawer — a
 * different plan is a different record, not a detail of this one.
 */
export function PlanholderOtherPlans({
  personId,
  currentLpaNo,
  carded = false,
}: PlanholderOtherPlansProps) {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanholderOtherPlan[]>([]);
  useEffect(() => {
    setPlans(
      personId && currentLpaNo
        ? getOtherPlansForPerson(personId, currentLpaNo)
        : [],
    );
  }, [personId, currentLpaNo]);

  // Hide the whole section — heading included — when the person holds no other
  // plan. See the note above: there is no empty state here by design.
  if (plans.length === 0) return null;

  const body = (
    <>
      <PlanholderSectionHeader
        title="Other Plans"
        subtitle="Other plans held by this person"
        count={plans.length}
      />

      <VStack align="stretch" gap={2}>
        {plans.map((plan) => (
          <OtherPlanRow
            key={plan.lpaNo}
            plan={plan}
            onClick={() =>
              router.push(`/claims/planholder/${encodeURIComponent(plan.lpaNo)}`)
            }
          />
        ))}
      </VStack>
    </>
  );

  return (
    // Owns its top margin, unlike the sections above: the page cannot wrap this
    // in a spacing Box, because that Box's margin would survive as a phantom
    // gap on the plans where this section renders nothing. The card inside it
    // is there for the same reason — see `carded`.
    <Box mt={4}>
      {carded ? <SectionCard>{body}</SectionCard> : body}
    </Box>
  );
}

export default PlanholderOtherPlans;
