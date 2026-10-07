// The planholder profile's props, assembled from the PIS reference data.
//
// EXTRACTED FROM THE ROUTE (2026-09-23) so it is not only the profile ROUTE
// that can build them. The Return of Premium module shows the same profile in
// its right panel, and a second copy of this assembly would be a second answer
// to "what is a planholder" — the two would drift the first time one of these
// tables gained a column.
//
// The route still owns the redirect for an unknown person; this returns
// `undefined` and leaves that decision to the caller, since a panel inside a
// page cannot redirect the way a route can.

import { planholderLookup } from "./planholder-lookup";
import { PlanholderAddress } from "./planholder-address.data";
import { PlanholderContactData } from "./planholder-contact.data";
import { PlanDetailsData } from "./plan-details.data";
import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import type { PlanholderInfoProps } from "@/components/plan-management/planholder-profile/sections/planholder-info";
import type { Address } from "@/components/plan-management/planholder-profile/sections/address-info";

/**
 * Everything the profile needs about one person, or `undefined` if no such
 * person is on file.
 *
 * The base path for the hyperlinks is a parameter because the same profile is
 * reached from two places: its own route under `planholder-profile`, and the
 * ROP module's right panel. The links have to point back at whichever one the
 * user is standing in.
 */
export function buildPlanholderProfile(
  personId: string,
  basePath = `/accounts-management/planholder-profile/${personId}`,
): PlanholderPageProps | undefined {
  const planholder = planholderLookup.find((ph) => ph.personId === personId);
  if (!planholder) return undefined;

  const lpaNumbers = planholderLookup
    .filter((ph) => ph.personId === personId)
    .map((ph) => ph.lpaNumber);

  return {
    hyperlinks: {
      payMyPlan: `${basePath}/pay-my-plan`,
      returnedOfPremium: `${basePath}/rop`,
      claimApplication: `${basePath}/claim-application`,
      changeOfMode: `${basePath}/change-of-mode`,
      cashSurrenderedValue: "/",
      transferOfRights: `${basePath}/transfer-of-rights`,
      reinstement: `${basePath}/reinstate-plan`,
      loanApplication: `${basePath}/loan`,
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
      personId,
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
      personId,
      value: contact.value,
      type: contact.type,
    })),
    plans: PlanDetailsData.filter((plan) =>
      lpaNumbers.includes(plan.lpaNumber),
    ),
  };
}
