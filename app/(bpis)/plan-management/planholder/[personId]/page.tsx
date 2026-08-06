import { redirect } from "next/navigation";
import { PlanholderPage } from "./planholder-page";
import { getPlanholderProfile } from "./api/planholder-profile.api";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ lpaNumber?: string }>;
}) {
  const { personId } = await params;
  const { lpaNumber } = await searchParams;

  const planholderProfileData = await getPlanholderProfile(personId);

  if (!planholderProfileData) {
    redirect("/plan-management/planholder");
  }

  return (
    <PlanholderPage props={planholderProfileData} selectedLpaNumber={lpaNumber} />
  );
}
