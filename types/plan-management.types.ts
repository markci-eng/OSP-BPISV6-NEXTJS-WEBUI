/**
 * Planholder profile data, shaped as the plan-management API returns it
 * (mirrors OSP-LIFEPLAN-OPERATIONS-WEBUI). Dates are ISO strings: JSON has no
 * Date, so this is what response.json() gives.
 */

export interface PersonalInfo {
  personId: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;

  isInsured: boolean;
  avatarUrl: string | null;
  nationality: string;
  naturalizationDate: string | null;
  dateOfBirth: string;
  placeOfBirth: string | null;

  gender: string;
  civilStatus: string;

  height: string | null;
  weight: string | null;

  employerName: string | null;
  employmentStatus: string | null;
  tin: string | null;
  securityNo: string | null;
  sourceOfFund: string | null;
}

export interface ContactInfo {
  contactTypeId: string;
  personId: string;
  /** "EMAIL ADDRESS", "MOBILE NUMBER" or "TELEPHONE/LANDLINE". */
  contactType: string;
  value: string;
  isPrimary: boolean;
}

export interface AddressInfo {
  addressId: string;
  personId: string;
  /** "RESIDENCE" or "OFFICE". */
  addressType: string;
  addNo: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: number;
  isPrimary: boolean;
}

/** One plan as the profile's plan list shows it. */
export interface PlanOverview {
  lpaNo: string;
  planDescription: string;
  accountStatus: string;
  terminationStatus: string;
  mode: string;
  term: number;
  branch: string;
  dueDate: string | null;
  installmentNo: number | null;
  amountDue: number | null;
  planTAP: number | null;
}

export interface PlanholderInfo {
  personalInfo: PersonalInfo;
  contacts: ContactInfo[];
  addresses: AddressInfo[];
  plans: PlanOverview[];
}

export interface PlanDetails {
  lpaNo: string;
  accountStatus: string;
  terminationStatus: string;
  planDescription: string;
  mode: string;
  term: number;
  planClass: string;
  accountClass: string;
  planCode: string;
  contractPrice: number;
  installmentAmount: number;
  planTAP: number;
  effectivityDate: string | null;
  newEffectivityDate: string | null;
  branch: string;
  cofpNo: string | null;
  cofpDate: string | null;
  isServiceOnly: boolean;
  sfCode1: string;
  sfCode2: string;
  sfName1: string;
  sfName2: string;
  phRemarks: string | null;
}

export interface Beneficiary {
  beneficiaryId: string;
  personId: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;
  avatarUrl: string | null;
  relationCode: string | null;
  relationship: string;
  dateOfBirth: string | null;
  gender?: string | null;
  address: AddressInfo;
  isPrincipal: boolean;
}

export interface PaymentRecord {
  siNumber: string;
  payClass: string;
  siDate: string;
  siAmount: number;
  planCode: string;
  instNo: number;
  nextDueDate: string;
  cvNumber: string;
  pcvNumber: string;
  auditDate: string;
}

export interface HealthDeclaration {
  health1: string;
  health2: string;
  health3: string;
}

/** Everything the profile shows about one plan. */
export interface PlanInfo {
  planDetails: PlanDetails | null;
  beneficiaries: Beneficiary[];
  paymentRecords: PaymentRecord[];
  healthDeclaration: HealthDeclaration | null;
}

/**
 * The body for adding a beneficiary to a plan, or updating one already on
 * it — one shape for both, told apart by `beneficiaryId`. Build it with
 * `toBeneficiaryPayload`.
 */
export interface BeneficiaryPayload {
  /** The plan the beneficiary is named on. */
  lpaNo: string;
  /** The beneficiary to update, or null to add a new one. */
  beneficiaryId: string | null;
  /** The beneficiary's own person record, or null when they are new. */
  personId: string | null;
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;
  // ISO date (yyyy-mm-dd).
  dateOfBirth: string;
  gender: string;
  /** The relationship as the reference table's code. */
  relationCode: string | null;
  isPrincipal: boolean;
  address: BeneficiaryAddressPayload;
}

/** An add never names a beneficiary. */
export type AddBeneficiaryPayload = Omit<BeneficiaryPayload, "beneficiaryId"> & {
  beneficiaryId: null;
};

/** What the API answers an add with; none of it is relied on yet. */
export interface AddBeneficiaryResponse {
  beneficiaryId?: string;
  personId?: string;
  message?: string;
}

export interface BeneficiaryAddressPayload {
  /** The address to update; left out to add one. */
  addressId?: string;
  addressType: string;
  addNo: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: number;
  isPrimary: boolean;
}

/** What a person search matches a person on. */
export interface PersonIdentity {
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;
  // ISO date (yyyy-mm-dd).
  birthDate: string;
}

/** An address as the person search returns it. */
export interface PersonSearchAddress {
  addressId: string;
  personId: string | null;
  addType: string | null;
  addNo: string | null;
  street: string | null;
  barangay: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  zipCode: number | null;
  isPrimary: boolean;
  isActive: boolean;
}

/** The person a search matched. */
export interface PersonSearchResult {
  personId: string;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  suffix: string | null;
  dateOfBirth: string;
  addresses: PersonSearchAddress[] | null;
}
