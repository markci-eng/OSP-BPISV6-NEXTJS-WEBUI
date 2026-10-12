import { delay } from "@/lib/delay";
import type {
  AddressInfo,
  Beneficiary,
  ContactInfo,
  PaymentRecord,
  PersonalInfo,
  PlanDetails,
  PlanholderInfo,
  PlanInfo,
  PlanOverview,
} from "@/types/plan-management.types";
import type { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { getPlanStatement } from "@/components/plan-management/planholder-profile/data/plan-statement";
import { planholderLookup } from "../../../data/planholder-lookup";
import { PlanholderAddress } from "../../../data/planholder-address.data";
import { PlanholderContactData } from "../../../data/planholder-contact.data";
import { PlanDetailsData } from "../../../data/plan-details.data";
import { PlanholderInfoData } from "../../../data/planholder-info.data";
import { PlanholderPaymentData } from "../../../data/planholder-payment.data";

/*
 * Mock plan-management API. Each function answers in the shape the real API
 * returns (see types/plan-management.types.ts), assembled from the per-LPA
 * mock tables under plan-management/data.
 */

/** ISO string for Mon Oct 12 16:35:24 MPST 2026, or null when it is missing or unparseable. */
const iso = (date: Date | null | undefined) => {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const CONTACT_TYPES: Record<string, string> = {
  Email: "EMAIL ADDRESS",
  MobileNo: "MOBILE NUMBER",
  LandlineNo: "TELEPHONE/LANDLINE",
};

// How many months each payment covers, keyed by plan mode.
const MODE_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  "SEMI-ANNUAL": 6,
  ANNUAL: 12,
  CASH: 0,
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function toPlanOverview(plan: PlanDetailType): PlanOverview {
  const lookup = planholderLookup.find((ph) => ph.lpaNumber === plan.lpaNumber);

  return {
    lpaNo: plan.lpaNumber,
    planDescription: plan.planDescription,
    accountStatus: lookup?.accountStatus ?? plan.accountStatus,
    terminationStatus: lookup?.terminationStatus ?? plan.terminationStatus,
    mode: plan.mode,
    term: plan.term,
    branch: plan.branch,
    dueDate: iso(lookup?.dueDate),
    installmentNo: lookup?.installmentNo ?? null,
    amountDue: plan.installmentAmount,
    planTAP: plan.totalAmountPayable,
  };
}

function toPlanDetails(plan: PlanDetailType): PlanDetails {
  return {
    lpaNo: plan.lpaNumber,
    accountStatus: plan.accountStatus,
    terminationStatus: plan.terminationStatus,
    planDescription: plan.planDescription,
    mode: plan.mode,
    term: plan.term,
    planClass: plan.planClass,
    accountClass: plan.accountClass,
    planCode: plan.planCode,
    contractPrice: plan.contractPrice,
    installmentAmount: plan.installmentAmount,
    planTAP: plan.totalAmountPayable,
    effectivityDate: iso(plan.effectivityDate),
    newEffectivityDate: iso(plan.newEffectivityDate),
    branch: plan.branch,
    cofpNo: plan.cfpNumber ?? null,
    cofpDate: iso(plan.cfpDate),
    isServiceOnly: plan.isServiceOnly,
    sfCode1: "",
    sfCode2: "",
    sfName1: plan.salesAgent1,
    sfName2: plan.salesAgent2,
    phRemarks: plan.remarks ?? null,
  };
}

/** The plan's receipts, newest first. Falls back to a derived schedule for a
 * plan with no receipts on file, so its statement still reads sensibly. */
function toPaymentRecords(plan: PlanDetailType): PaymentRecord[] {
  const receipts = PlanholderPaymentData.filter(
    (p) => p.lpaNumber === plan.lpaNumber,
  );

  if (receipts.length === 0) {
    return getPlanStatement(plan).paymentRecords.map((r) => ({
      siNumber: r.siNumber,
      payClass: r.payClass,
      siDate: r.siDate.toISOString(),
      siAmount: r.siAmount,
      planCode: r.planCode,
      instNo: r.installmentNumber,
      nextDueDate: r.nextDueDate.toISOString(),
      cvNumber: r.cvNumber,
      pcvNumber: r.pcvNumber,
      auditDate: r.auditDate.toISOString(),
    }));
  }

  const months = MODE_MONTHS[plan.mode?.toUpperCase()] ?? 1;

  return receipts
    .map((r) => ({
      siNumber: r.siNumber.trim(),
      payClass: r.payClass,
      siDate: new Date(r.siDate).toISOString(),
      siAmount: r.siAmount,
      planCode: r.planCode,
      instNo: r.installmentNo,
      nextDueDate: addMonths(new Date(r.siDate), months).toISOString(),
      cvNumber: "",
      pcvNumber: "",
      // A few mock audit stamps are malformed ("09:5427"); fall back to the receipt date.
      auditDate: iso(r.auditDate) ?? new Date(r.siDate).toISOString(),
    }))
    .sort((a, b) => b.siDate.localeCompare(a.siDate));
}

/** One planholder: personal details, contacts, addresses and their plans.
 * `lpaNumber` picks which plan's personal record to read when they differ. */
export async function getPlanholderInfo(
  personId: string,
  lpaNumber?: string,
): Promise<PlanholderInfo | null> {
  await delay(400);

  const rows = planholderLookup.filter((ph) => ph.personId === personId);
  if (rows.length === 0) return null;

  const lpaNumbers = rows.map((ph) => ph.lpaNumber);
  const primaryLpa =
    lpaNumber && lpaNumbers.includes(lpaNumber) ? lpaNumber : lpaNumbers[0];
  const lookup = rows.find((ph) => ph.lpaNumber === primaryLpa)!;
  const info = PlanholderInfoData.find((i) => i.lpaNumber === primaryLpa);
  const plans = PlanDetailsData.filter((p) => lpaNumbers.includes(p.lpaNumber));

  const personalInfo: PersonalInfo = {
    personId,
    lastName: info?.lastName ?? lookup.lastName,
    firstName: info?.firstName ?? lookup.firstName,
    middleName: info?.middleName ?? lookup.middleName,
    suffix: info?.suffix ?? null,
    isInsured: plans[0]?.isInsured ?? true,
    avatarUrl: null,
    nationality: info?.nationality ?? "",
    naturalizationDate: iso(info?.naturalizationDate),
    dateOfBirth: iso(info?.dateOfBirth) ?? "",
    placeOfBirth: info?.placeOfBirth ?? null,
    gender: info?.gender ?? "",
    civilStatus: info?.civilStatus ?? "",
    height: info?.height ?? null,
    weight: info?.weight == null ? null : String(info.weight),
    employerName: info?.employerName ?? null,
    employmentStatus: info?.employmentStatus ?? null,
    tin: info?.tin ?? null,
    securityNo: info?.securityNo ?? null,
    sourceOfFund: info?.sourceOfFund ?? null,
  };

  // The same contact or address is often filed under each of the person's
  // plans; list it once.
  const contacts: ContactInfo[] = [];
  for (const c of PlanholderContactData) {
    if (!lpaNumbers.includes(c.lpaNumber)) continue;
    const contactType = CONTACT_TYPES[c.type] ?? c.type;
    if (contacts.some((x) => x.contactType === contactType && x.value === c.value))
      continue;
    contacts.push({
      contactTypeId: `${c.lpaNumber}-${c.type}`,
      personId,
      contactType,
      value: c.value,
      isPrimary: !contacts.some((x) => x.contactType === contactType),
    });
  }

  const addresses: AddressInfo[] = [];
  for (const a of PlanholderAddress) {
    if (!lpaNumbers.includes(a.lpaNumber)) continue;
    const key = [a.addressType, a.addressNo, a.street, a.barangay, a.city].join("|");
    if (
      addresses.some(
        (x) =>
          [x.addressType, x.addNo || null, x.street || null, x.barangay || null, x.city].join("|") === key,
      )
    )
      continue;
    addresses.push({
      addressId: `${a.lpaNumber}-${a.addressType}`,
      personId,
      addressType: a.addressType,
      addNo: a.addressNo ?? "",
      street: a.street ?? "",
      barangay: a.barangay ?? "",
      district: a.district ?? "",
      city: a.city,
      province: a.province,
      zipCode: a.zipCode ?? 0,
      isPrimary: a.isMailAddress ?? false,
    });
  }

  return {
    personalInfo,
    contacts,
    addresses,
    plans: plans.map(toPlanOverview),
  };
}

/** One plan's details, beneficiaries and payment records. */
export async function getPlanInfo(lpaNo: string): Promise<PlanInfo | null> {
  await delay(300);

  const plan = PlanDetailsData.find((p) => p.lpaNumber === lpaNo);
  if (!plan) return null;

  const owner = planholderLookup.find((ph) => ph.lpaNumber === lpaNo);
  const residence = PlanholderAddress.find(
    (a) => a.lpaNumber === lpaNo && a.addressType === "RESIDENCE",
  );

  // No beneficiary table in the mock data yet: one principal per plan.
  const beneficiaries: Beneficiary[] = [
    {
      beneficiaryId: `${lpaNo}-B1`,
      personId: "PI10001",
      lastName: owner?.lastName ?? "DELA ROSA",
      firstName: "ROLAND",
      middleName: "C",
      suffix: null,
      avatarUrl: null,
      relationCode: "SON",
      relationship: "SON",
      dateOfBirth: "2003-02-14T00:00:00.000Z",
      gender: "MALE",
      address: {
        addressId: `${lpaNo}-B1-RESIDENCE`,
        personId: "PI10001",
        addressType: "RESIDENCE",
        addNo: residence?.addressNo ?? "",
        street: residence?.street ?? "",
        barangay: residence?.barangay ?? "",
        district: residence?.district ?? "",
        city: residence?.city ?? "CALOOCAN CITY",
        province: residence?.province ?? "",
        zipCode: residence?.zipCode ?? 0,
        isPrimary: true,
      },
      isPrincipal: true,
    },
  ];

  return {
    planDetails: toPlanDetails(plan),
    beneficiaries,
    paymentRecords: toPaymentRecords(plan),
    healthDeclaration: null,
  };
}
