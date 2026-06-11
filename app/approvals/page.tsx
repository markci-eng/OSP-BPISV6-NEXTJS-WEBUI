"use client";
import { useState } from "react";
import { createListCollection } from "@chakra-ui/react";
import { SelectFloatingLabel } from "st-peter-ui";
import Page from "@/components/layout/page/Page";
import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "./data/types";

const APPROVAL_TYPES: { label: string; value: ApprovalView }[] = [
  { label: "Reassignment of Documents", value: "reassignment-doc" },
  { label: "Digital Remittance Slip (DRS)", value: "drs" },
  { label: "Movement of Employees", value: "movement-employees" },
  { label: "Reassignment of SA2", value: "reassignment-sa2" },
];

const approvalCollection = createListCollection({ items: APPROVAL_TYPES });

export default function page() {
  const [view, setView] = useState<ApprovalView>("reassignment-doc");

  return (
    <Page.Root
      title="Approvals"
      description="Review and process pending approval requests across all transaction types."
    >
      <Page.MainContent>
        <SelectFloatingLabel
          label="Request Type"
          collection={approvalCollection}
          value={[view]}
          onValueChanged={(values) => setView(values[0] as ApprovalView)}
          w={{ base: "full", md: "sm" }}
        />
        <ApprovalsTable view={view} setView={setView} />
      </Page.MainContent>
    </Page.Root>
  );
}
