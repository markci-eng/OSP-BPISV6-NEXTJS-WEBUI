import { delay } from "@/lib/delay";
import type {
  AddBeneficiaryPayload,
  AddBeneficiaryResponse,
  PersonIdentity,
  PersonSearchResult,
} from "@/types/plan-management.types";
import type { RefRelationship } from "@/types/reference-table.types";
import { planholderLookup } from "../../../data/planholder-lookup";
import { PlanholderAddress } from "../../../data/planholder-address.data";
import { PlanholderInfoData } from "../../../data/planholder-info.data";

/*
 * Mock beneficiary endpoints, answering in the real API's shapes. Person
 * search matches against the planholders on file, so naming an existing
 * planholder as a beneficiary fills in their address.
 */

const RELATIONSHIPS = [
  ["BRO", "BROTHER"],
  ["DAU", "DAUGHTER"],
  ["FAT", "FATHER"],
  ["GDA", "GRANDDAUGHTER"],
  ["GSO", "GRANDSON"],
  ["MOT", "MOTHER"],
  ["NEP", "NEPHEW"],
  ["NIE", "NIECE"],
  ["SIS", "SISTER"],
  ["SON", "SON"],
  ["SPO", "SPOUSE"],
  ["OTH", "OTHERS"],
] as const;

export async function getRelationships(): Promise<RefRelationship[]> {
  await delay(200);
  return RELATIONSHIPS.map(([relationCode, description]) => ({
    relationCode,
    description,
    isActive: true,
    auditUser: null,
    auditDate: null,
    editUser: null,
    editDate: null,
  }));
}

/** The person on file with this name and birth date, or null for nobody. */
export async function searchPerson(
  identity: PersonIdentity,
): Promise<PersonSearchResult | null> {
  await delay(300);

  const info = PlanholderInfoData.find(
    (i) =>
      i.lastName?.toUpperCase() === identity.lastName.toUpperCase() &&
      i.firstName?.toUpperCase() === identity.firstName.toUpperCase() &&
      i.dateOfBirth != null &&
      new Date(i.dateOfBirth).toLocaleDateString("en-CA") === identity.birthDate,
  );
  const lookup = info && planholderLookup.find((ph) => ph.lpaNumber === info.lpaNumber);
  if (!info || !lookup) return null;

  return {
    personId: lookup.personId,
    lastName: info.lastName,
    firstName: info.firstName,
    middleName: info.middleName,
    suffix: info.suffix ?? null,
    dateOfBirth: new Date(info.dateOfBirth!).toISOString(),
    addresses: PlanholderAddress.filter((a) => a.lpaNumber === info.lpaNumber).map(
      (a) => ({
        addressId: `${a.lpaNumber}-${a.addressType}`,
        personId: lookup.personId,
        addType: a.addressType,
        addNo: a.addressNo,
        street: a.street,
        barangay: a.barangay,
        district: a.district,
        city: a.city,
        province: a.province,
        zipCode: a.zipCode,
        isPrimary: a.isMailAddress ?? false,
        isActive: true,
      }),
    ),
  };
}

/** Adds a beneficiary to a plan. The mock keeps nothing; it answers with ids. */
export async function addBeneficiary(
  payload: AddBeneficiaryPayload,
): Promise<AddBeneficiaryResponse> {
  await delay(400);
  return {
    beneficiaryId: crypto.randomUUID(),
    personId: payload.personId ?? crypto.randomUUID(),
  };
}
