"use server";
import { PlanholderPageProps } from "@/components/new-planholder-profile/planholder-page";

import { PlanholderInfoProps } from "@/components/new-planholder-profile/sections/planholder-info";

import { BreadcrumbItemType } from "st-peter-ui";

import { planholderLookup } from "../../data/planholder-lookup";
import { PlanholderAddress } from "../../data/planholder-address.data";
import { Address } from "@/components/new-planholder-profile/sections/address-info";
import { PlanholderContactData } from "../../data/planholder-contact.data";
import { PlanDetailsData } from "../../data/plan-details.data";
import { redirect } from "next/navigation";
import { PlanholderPage } from "./planholder-page";

export default async function Page({
  params,
}: {
  params: { personId: string };
}) {
  const { personId } = await params;

  const planholder = planholderLookup.find((ph) => ph.personId === personId);

  if (!planholder) {
    redirect("/plan-management/planholder");
  }

  const breadcrumbItems: BreadcrumbItemType[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Planholder",
      href: "/plan-management/planholder/",
    },
    {
      label: personId,
      href: `/plan-management/planholder/${personId}`,
    },
  ];

  const planholderProfileData: PlanholderPageProps = {
    breadcrumbItems,
    hyperlinks: {
      payMyPlan: `/plan-management/planholder/${personId}/pay-my-plan`,
      returnedOfPremium: `/plan-management/planholder/${personId}/rop`,
      claimApplication: "/claims",
      changeOfMode: `/plan-management/planholder/${personId}/change-of-mode`,
      cashSurrenderedValue: "/",
      transferOfRights: `/plan-management/planholder/${personId}/transfer-of-rights`,
      reinstement: `/plan-management/planholder/${personId}/reinstate-plan`,
    },
    planholderInfo: {
      personId,
      lastName: planholder.lastName,
      firstName: planholder.firstName,
      middleName: planholder.middleName,
      nationality: "FILIPINO",
      naturalizationDate: new Date("1900-01-01T00:00:00"),
      dateOfBirth: new Date("1900-01-01T00:00:00"),
      placeOfBirth: "QUEZON CITY",
      gender: "MALE",
      civilStatus: "SINGLE",
      height: "66``",
      weight: 60.0,
      employerName: "ST. PETER LIFE PLAN, INC.",
      employmentStatus: "EMPLOYED",
      tin: "TIN-123-456-789-0000",
      securityNo: "SSS-123-456-7",
      sourceOfFund: "SALARY",
    } as PlanholderInfoProps,
    planholderAddress: PlanholderAddress.filter((address) =>
      planholderLookup
        .filter((ph) => ph.personId === personId)
        .map((ph) => ph.lpaNumber)
        .includes(address.lpaNumber),
    ).map((address) => ({
      id: address.lpaNumber + "-" + address.addressType,
      personId: personId,
      addressType: address.addressType,
      addressNo: address.addressNo,
      street: address.street,
      barangay: address.barangay,
      city: address.city,
      province: address.province,
      district: address.district,
      zipCode: address.zipCode,
      isMailAddress: address.isMailAddress,
    })) as Address[],
    planholderContact: PlanholderContactData.filter((contact) =>
      planholderLookup
        .filter((ph) => ph.personId == personId)
        .map((ph) => ph.lpaNumber)
        .includes(contact.lpaNumber),
    ).map((contact) => ({
      personId: personId,
      value: contact.value,
      type: contact.type,
    })),
    plans: PlanDetailsData.filter((plan) =>
      planholderLookup
        .filter((ph) => ph.personId === personId)
        .map((ph) => ph.lpaNumber)
        .includes(plan.lpaNumber),
    ),
  };

  return <PlanholderPage props={planholderProfileData} />;
}
