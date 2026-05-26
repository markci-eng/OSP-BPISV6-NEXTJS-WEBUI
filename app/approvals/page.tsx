"use client";
import { Page } from "@/components/page/page";
import { ApprovalsTable } from "./components/ApprovalsTable";

export default function page() {
  const breadItem = [{ label: "Home" }, { label: "Approvals" }];
  return (
    <Page
      breadcrumbItems={breadItem}
      title="Approvals"
      description="Review and act on pending approval requests across BPIS operations."
    >
      <ApprovalsTable />
    </Page>
  );
}
