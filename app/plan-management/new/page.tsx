// import LifePlanApplication from "@/components/plan-management/lifeplan-application/lifeplan-application";
"use client";
import Page from "@/components/layout/page/Page";
import { LifePlanApplicationFormWrapper } from "new-sales-page-component";

export default function NewSalePage() {
  return (
    <Page.Root
      title={"Add New Sales"}
      description="Quick sales entry."
    >
      <Page.MainContent>
        <LifePlanApplicationFormWrapper />
        {/* <FormStepper steps={[]} /> */}
      </Page.MainContent>
    </Page.Root>
  );
}
