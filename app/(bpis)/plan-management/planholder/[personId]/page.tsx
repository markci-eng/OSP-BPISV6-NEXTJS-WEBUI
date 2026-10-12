import { redirect } from "next/navigation";
import { PlanholderProfilePage } from "./planholder-page";
import { getPlanholderInfo } from "./api/planholder-profile.api";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ lpaNumber?: string }>;
}) {
  const { personId } = await params;
  const { lpaNumber } = await searchParams;

  const planholderInfo = await getPlanholderInfo(personId, lpaNumber);

  if (!planholderInfo) {
    redirect("/plan-management/planholder");
  }

  return (
    <PlanholderProfilePage
      personId={personId}
      selectedLpaNumber={lpaNumber ?? ""}
      planholderInfo={planholderInfo}
    />
  );
}
