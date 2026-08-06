import { redirect } from "next/navigation";
import { AgentProfilePage } from "./agent-profile-page";
import { getAgentProfile } from "./api/agent-profile.api";

export default async function Page({
  params,
}: {
  params: Promise<{ saleforceId: string }>;
}) {
  const { saleforceId } = await params;
  const agent = await getAgentProfile(saleforceId);

  if (!agent) {
    redirect("/sales-force/profile");
  }

  return <AgentProfilePage agent={agent} />;
}
