// import LifePlanApplication from "@/components/plan-management/lifeplan-application/lifeplan-application";
"use client";
import { Page } from "@/components/page/page";
import { LifePlanApplicationFormWrapper } from "new-sales-page-component";

export default function NewSalePage() {
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
      label: "Add New Sale",
      href: "#",
    },
  ];

  return (
    <Page
      breadcrumbItems={breadcrumbItems}
      title={"Add New Sales"}
      description="Quick sales entry."
    >
      <LifePlanApplicationFormWrapper />
      {/* <FormStepper steps={[]} /> */}
    </Page>
  );
}
