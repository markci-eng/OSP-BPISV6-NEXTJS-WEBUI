"use client";

import { toast } from "sonner";
import ActionButtons, {
  type ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import { PLAN_ACTIONS } from "../../components/plan-action-items";
import type { Planholder } from "../../claims-data";

interface PlanholderActionsMenuProps {
  /** The plan the actions apply to. */
  planholder: Planholder;
}

/**
 * The plan holder header's "More" button — the same {@link ActionButtons} pill
 * and bottom sheet the claim request drawer uses, so a plan's actions and a
 * claim's actions open the same way.
 *
 * Rides in `Page.ToolContent`, which is where the claim drawer puts its own
 * pill (`DrawerPageHeader`'s `toolContent`): far right of the title row.
 */
export function PlanholderActionsMenu({
  planholder,
}: PlanholderActionsMenuProps) {
  const notWired = (label: string) =>
    toast.info(`${label} is not available yet`, {
      description: `LPA No. ${planholder.lpaNo}`,
    });

  const actions: ActionButtonItem[] = PLAN_ACTIONS.map((action) => ({
    ...action,
    onClick: () => notWired(action.label),
  }));

  return (
    <ActionButtons
      buttons={actions}
      title="Plan Actions"
      subtitle={planholder.lpaNo}
    />
  );
}

export default PlanholderActionsMenu;
