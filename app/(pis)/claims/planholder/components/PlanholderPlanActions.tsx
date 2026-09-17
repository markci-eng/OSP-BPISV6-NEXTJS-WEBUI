"use client";

import { toast } from "sonner";
import { ActionButtonRow } from "../../components/action-button-row";
import { PLAN_ACTIONS } from "../../components/plan-action-items";
import type { Planholder } from "../../claims-data";

/**
 * Columns for the row — three, so the plan's actions are ONE row.
 *
 * "Cancel Plan Termination" does not fit a third of the rail on one line and
 * wraps to two, which stands all three buttons at the taller height. That is
 * accepted rather than worked around: this briefly ran at two columns to keep
 * every label on one line, and the second row it cost was worse. Height is the
 * scarce thing in a rail that also holds the claims and the folder; a label on
 * two lines costs 15px, a second row of buttons costs 55px.
 */
const PLAN_ACTION_COLUMNS = 3;

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
      columns={PLAN_ACTION_COLUMNS}
      actions={PLAN_ACTIONS.map((action) => ({
        ...action,
        onClick: () => notWired(action.label),
      }))}
    />
  );
}

export default PlanholderPlanActions;
