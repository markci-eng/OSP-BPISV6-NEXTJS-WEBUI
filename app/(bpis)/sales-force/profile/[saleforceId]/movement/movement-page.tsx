"use client";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { AgentMovementForm } from "@/components/saleforce/forms/agent-movement-form";
import { Page } from "osp-ui-kit";
import { useRouter } from "next/navigation";

export default function MovementPage({ agent }: { agent: SalesAgent }) {
  const router = useRouter();

  return (
    <Page.Root
      title="Agent Movement"
      description="Submit a movement request."
    >
      <Page.MainContent>
        <AgentMovementForm
          selectedAgent={agent}
          onCancel={() => router.back()}
          successLink={`/sales-force/profile/${agent.id}/movement/success`}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
