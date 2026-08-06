import { PlanholderPage } from "./[personId]/planholder-page";

/**
 * Landing route for Planholder Profile. Opens the profile itself rather than a
 * list: every section renders empty until the toolbar's lookup picks someone,
 * which routes on to `[personId]`. The browsable list still lives at
 * `/accounts-management/planholder-profile/list`.
 */
export default function Page() {
  return <PlanholderPage props={{}} />;
}
