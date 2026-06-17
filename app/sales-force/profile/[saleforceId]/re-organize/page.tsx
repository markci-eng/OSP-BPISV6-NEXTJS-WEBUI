"use server";
import { getAgentById } from "@/components/common/agent-lookup/agent-lookup.type";
import { redirect } from "next/navigation";
import ReOrganizePage from "./re-organize-page";

export default async function Page({
  params,
}: {
  params: Promise<{ saleforceId: string }>;
}) {
  const { saleforceId } = await params;
  const agent = getAgentById(saleforceId);

  if (!agent) {
    redirect("/sales-force/profile");
  }

  return <ReOrganizePage agent={agent} />;
}
