"use client";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { AgentReassignForm } from "@/components/saleforce/forms/agent-reassign-form";
import Page from "@/claude components/layout/page/Page";
import { useRouter } from "next/navigation";

export default function ReOrganizePage({ agent }: { agent: SalesAgent }) {
  const router = useRouter();

  return (
    <Page.Root
      title="Re-Organize Agent"
      description="Assign a new superior for this sales agent. The request will be submitted for approval."
    >
      <Page.MainContent>
        <AgentReassignForm
          selectedAgent={agent}
          onCancel={() => router.back()}
          onSubmitted={() => router.back()}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
