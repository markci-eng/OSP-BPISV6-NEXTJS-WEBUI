// import { PlanholderProfilePage } from "@/components/plan-management/planholder-profile/planholder-profile-page";

import PlanholderProfilePage from "@/components/new-planholder-profile/planholder-page";

const breadcrumbItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Plan Management",
    href: "#",
  },
  {
    label: "Planholders",
    href: "#",
  },
];

export default async function Page() {
  // return <PlanholderProfilePage props={{ breadcrumbItems }} />;
  return <PlanholderProfilePage props={{ breadcrumbItems }} />;
}
