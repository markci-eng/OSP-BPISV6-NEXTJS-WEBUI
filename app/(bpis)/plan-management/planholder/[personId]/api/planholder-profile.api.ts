import { delay } from "@/lib/delay";
import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import type { PlanholderInfoProps } from "@/components/plan-management/planholder-profile/sections/planholder-info";
import type { Address } from "@/components/plan-management/planholder-profile/sections/address-info";
import { planholderLookup } from "../../../data/planholder-lookup";
import { PlanholderAddress } from "../../../data/planholder-address.data";
import { PlanholderContactData } from "../../../data/planholder-contact.data";
import { PlanDetailsData } from "../../../data/plan-details.data";

export async function getPlanholderProfile(
  personId: string,
): Promise<PlanholderPageProps | null> {
  await delay(400);

  const planholder = planholderLookup.find((ph) => ph.personId === personId);

  if (!planholder) {
    return null;
  }

  const lpaNumbers = planholderLookup
    .filter((ph) => ph.personId === personId)
    .map((ph) => ph.lpaNumber);

  return {
    hyperlinks: {
      payMyPlan: `/plan-management/planholder/${personId}/pay-my-plan`,
      returnedOfPremium: `/plan-management/planholder/${personId}/rop`,
      claimApplication: `/plan-management/planholder/${personId}/claim-application`,
      changeOfMode: `/plan-management/planholder/${personId}/change-of-mode`,
      cashSurrenderedValue: "/",
      transferOfRights: `/plan-management/planholder/${personId}/transfer-of-rights`,
      reinstement: `/plan-management/planholder/${personId}/reinstate-plan`,
      loanApplication: `/plan-management/planholder/${personId}/loan`,
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
      lpaNumbers.includes(address.lpaNumber),
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
      lpaNumbers.includes(contact.lpaNumber),
    ).map((contact) => ({
      personId: personId,
      value: contact.value,
      type: contact.type,
    })),
    plans: PlanDetailsData.filter((plan) =>
      lpaNumbers.includes(plan.lpaNumber),
    ),
  };
}
