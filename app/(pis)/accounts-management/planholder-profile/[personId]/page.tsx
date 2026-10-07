"use server";

import { redirect } from "next/navigation";
import { PlanholderPage } from "./planholder-page";
import { buildPlanholderProfile } from "../data/build-profile";

export default async function Page({
  params,
}: {
  params: { personId: string };
}) {
  const { personId } = await params;

  // The assembly lives in `build-profile` so the ROP module's right panel can
  // show the same profile from the same data. The redirect stays here: it is
  // the ROUTE's answer to an unknown person, and a panel has no use for it.
  const planholderProfileData = buildPlanholderProfile(personId);

  if (!planholderProfileData) {
    redirect("/accounts-management/planholder-profile");
  }

  return <PlanholderPage props={planholderProfileData} />;
}
