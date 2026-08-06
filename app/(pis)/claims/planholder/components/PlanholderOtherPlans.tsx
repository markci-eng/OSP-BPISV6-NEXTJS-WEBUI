"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, VStack } from "@chakra-ui/react";
import {
  getOtherPlansForPerson,
  type PlanholderOtherPlan,
} from "../../claims-data";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { OtherPlanRow } from "./OtherPlanRow";

/* ------------------------------ section ------------------------------ */

interface PlanholderOtherPlansProps {
  /** The person whose plans are looked up. */
  personId?: string;
  /** The plan being viewed — excluded from the list. */
  currentLpaNo?: string;
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

  return (
    // Owns its top margin, unlike the sections above: the page cannot wrap this
    // in a spacing Box, because that Box's margin would survive as a phantom
    // gap on the plans where this section renders nothing.
    <Box mt={4}>
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
    </Box>
  );
}

export default PlanholderOtherPlans;
