"use client";

import { LuClipboardCheck, LuPrinter, LuRotateCcw } from "react-icons/lu";
import { toast } from "sonner";
import ActionButtons, {
  type ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import type { Planholder } from "../../claims-data";

/** An entry in the "More" sheet, before its onClick is bound to the plan. */
type PlanAction = Omit<
  Extract<ActionButtonItem, { type?: "action" }>,
  "onClick"
>;

/**
 * The whole-plan actions — the legacy PISv5 toolbar operations that apply to
 * the plan itself rather than to any one section down the page. None are wired
 * to a back end yet, so each says so rather than failing silently.
 */
const PLAN_ACTIONS: PlanAction[] = [
  {
    label: "Print SOA",
    icon: LuPrinter,
    description: "Print the statement of account",
  },
  {
    label: "Cancel Plan Termination",
    icon: LuRotateCcw,
    description: "Reverse the termination filed on this plan",
  },
  {
    label: "Consider Plan",
    icon: LuClipboardCheck,
    description: "Consider this plan for the claim",
  },
];

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
