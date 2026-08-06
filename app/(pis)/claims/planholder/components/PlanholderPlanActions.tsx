"use client";

import { LuClipboardCheck, LuPrinter, LuRotateCcw } from "react-icons/lu";
import { toast } from "sonner";
import { ActionButtonRow } from "../../components/action-button-row";
import type { Planholder } from "../../claims-data";

/**
 * The whole-plan actions — the legacy PISv5 toolbar operations that apply to
 * the plan itself rather than to any one section down the page. None are wired
 * to a back end yet, so each says so rather than failing silently.
 */
const PLAN_ACTIONS = [
  { label: "Print SOA", icon: LuPrinter },
  { label: "Cancel Plan Termination", icon: LuRotateCcw },
  { label: "Consider Plan", icon: LuClipboardCheck },
];

/**
 * The plan's actions, as a section of their own directly above Claim Requests.
 *
 * DESKTOP only — the page renders this from `lg` up and keeps the "More" pill
 * ({@link PlanholderActionsMenu}) below that. A wide screen has room to spell
 * three operations out rather than hide them behind a tap; a phone does not,
 * and its bottom sheet stays exactly as it was.
 *
 * The section has no heading and no card around it: three labelled buttons say
 * what they are, and a title or a border would only frame what is already a
 * row of controls. The row itself is {@link ActionButtonRow}, shared with the
 * claim's actions so the two cannot drift apart.
 */
export function PlanholderPlanActions({
  planholder,
}: {
  /** The plan the actions apply to. */
  planholder: Planholder;
}) {
  const notWired = (label: string) =>
    toast.info(`${label} is not available yet`, {
      description: `LPA No. ${planholder.lpaNo}`,
    });

  return (
    <ActionButtonRow
      columns={3}
      actions={PLAN_ACTIONS.map((action) => ({
        ...action,
        onClick: () => notWired(action.label),
      }))}
    />
  );
}

export default PlanholderPlanActions;
