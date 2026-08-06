// Domain model for the PIS area (app/(pis)).
//
// This is a TypeScript translation of the real back-office data structure
// (see the C# reference `DataStructurePIS`). Each "table" is modelled twice:
//
//   - a plain **record** interface (`*Record`) — the raw row shape, using the
//     same fields as the database. This is what the seed data (`seed.ts`) and
//     the mock DB (`database.ts`) store.
//   - a domain **class** — a thin wrapper around a record (plus its resolved
//     relations) that exposes the computed/derived properties the UI needs
//     (age, insurability, nature code, formatted name/address, …). These mirror
//     the get-only properties on the C# entities.
//
// The mock DB does the joins and injects the resolved relations into the
// domain classes, so the classes stay pure (no back-reference to the DB) and
// there is no import cycle between this file and `database.ts`.

/* ============================== Name helpers ============================== */

/**
 * A person's name broken into parts so it can be rendered in different orders
 * (e.g. "First Middle Last" for lists, "Last, First Middle" for headers).
 */
export interface PersonName {
  firstName: string;
  middleName?: string;
  lastName: string;
  /** Generational suffix, e.g. "Jr." / "Sr." / "III". */
  suffix?: string;
}

/** Build the natural full name: "First Middle Last Suffix". */
export function toFullName(name: PersonName): string {
  return [name.firstName, name.middleName, name.lastName, name.suffix]
    .filter(Boolean)
    .join(" ");
}

/** Build the surname-first form used in headers: "Last, First Middle Suffix". */
export function toSurnameFirst(name: PersonName): string {
  const given = [name.firstName, name.middleName].filter(Boolean).join(" ");
  const tail = [given, name.suffix].filter(Boolean).join(" ");
  return tail ? `${name.lastName}, ${tail}` : name.lastName;
}

/** Two-letter initials (first name + surname) for avatars, e.g. "JC". */
export function toInitials(name: PersonName): string {
  const surnameWord = name.lastName.split(" ").pop() ?? "";
  return `${name.firstName[0] ?? ""}${surnameWord[0] ?? ""}`.toUpperCase();
}

/* ============================== Date helpers ============================== */

/** Full calendar years elapsed between two dates. */
export function fullYearsBetween(start: Date, end: Date): number {
  let years = end.getFullYear() - start.getFullYear();
  const monthDelta = end.getMonth() - start.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < start.getDate())) {
    years -= 1;
  }
  return years;
}

/**
 * Difference between two dates broken into whole years, months and days —
 * used for the "Age of Death" figure on a death claim (C# `AgeOfDeath`).
 * Returns a label like "61 yrs 1 mos 5 days".
 */
export function formatAgeOfDeath(birth: Date, death: Date): string {
  let years = death.getFullYear() - birth.getFullYear();
  let months = death.getMonth() - birth.getMonth();
  let days = death.getDate() - birth.getDate();

  if (days < 0) {
    // Borrow days from the previous (death) month.
    const prevMonth = new Date(death.getFullYear(), death.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return `${years} yrs ${months} mos ${days} days`;
}

/** ISO date (YYYY-MM-DD) N days before the given ISO date/datetime. */
export function daysBefore(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** "Apr 18, 2026" — used for a claim request's filed label. */
export function formatFiledDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Apr 18 · 8:00 am" — the compact filed label on the death dashboard. */
export function formatFiledDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${date} · ${time}`;
}

/* ============================== Reference data ============================== */

/**
 * Branch codes. These appear inside a claim request number, e.g. the "QCITY"
 * in `CLQCITY2026CAB000001`.
 */
export const BRANCH_LABELS: Record<string, string> = {
  ESTORE: "E-Store Branch",
  QCITY: "Quezon City Branch",
  MANILA: "Manila Branch",
  CEBU: "Cebu City Branch",
  BATANGAS: "Batangas City Branch",
  DAVAO: "Davao City Branch",
  ILOILO: "Iloilo City Branch",
  SANFER: "San Fernando Branch",
  BAGUIO: "Baguio City Branch",
  NAGA: "Naga City Branch",
  LUCENA: "Lucena City Branch",
  VIGAN: "Vigan Branch",
  CDO: "Cagayan de Oro Branch",
  ANGELES: "Angeles City Branch",
  TACLOBAN: "Tacloban City Branch",
};

/** Expand a branch code to its display name (falls back to the code). */
export function branchLabel(code: string): string {
  return BRANCH_LABELS[code] ?? code;
}

/** Claim status codes (`Status`) — the values stored on a claim request. */
export type ClaimStatusCode = "AP" | "DN" | "FA" | "FD" | "PE";

/** Where a claim sits in the approval pipeline (the display label). */
export type ClaimPhase =
  | "Approved"
  | "Denied"
  | "For Approval"
  | "For Denial"
  | "Pending";

/** Display labels for the claim status codes. */
export const CLAIM_STATUS_LABELS: Record<ClaimStatusCode, ClaimPhase> = {
  AP: "Approved",
  DN: "Denied",
  FA: "For Approval",
  FD: "For Denial",
  PE: "Pending",
};

/** Expand a status code to its label (falls back to "Pending"). */
export function claimStatusLabel(code: ClaimStatusCode): ClaimPhase {
  return CLAIM_STATUS_LABELS[code] ?? "Pending";
}

/**
 * The kind of claim being filed (`ClaimType`) — the real system files these
 * three. The short code in brackets is what appears in a request number.
 */
export type ClaimKind =
  | "Death Claim" // benefit code (CAB / ECAB / ADB / USB)
  | "Dismemberment" // DM
  | "Waiver of Installment"; // WOI

/** Death-claim benefit codes (C# `Benefits`). */
export type DeathBenefit = "CAB" | "ECAB" | "ADB" | "USB";

/** Full names for the death-claim benefit codes. */
export const DEATH_BENEFIT_LABELS: Record<DeathBenefit, string> = {
  CAB: "Cash Assistance Benefit",
  ECAB: "Extended Cash Assistance Benefit",
  ADB: "Accidental Death Benefit",
  USB: "Unrendered Service Benefit",
};

/** Expand a benefit code to its full name (falls back to the code). */
export function deathBenefitLabel(code: string): string {
  return DEATH_BENEFIT_LABELS[code as DeathBenefit] ?? code;
}

/* ================================ Person ================================ */

export type Gender = "Male" | "Female";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated";

/** A row in the `Person` table. Mirrors the C# `Person` entity. */
export interface PersonRecord {
  personId: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  dateOfBirth: string; // ISO
  placeOfBirth: string;
  genderAtBirth: Gender;
  preferredGender: Gender;
  civilStatus: CivilStatus;
  /** Stored as free text in the source system. */
  weight: string;
  height: string;
  auditUser: string;
  auditDate: string; // ISO
  /** Reference to the owned `Address` rows (by `addressId`). */
  addresses: number[];
}

/** A row in the `Address` table. Mirrors the C# `Address` entity. */
export interface AddressRecord {
  addressId: number;
  personId: string;
  addressType: string;
  addressNo: string;
  street: string;
  barangay: string;
  district?: string;
  city: string;
  province: string;
  zipCode: number;
  geoTag?: string;
  auditUser: string;
  auditDate: string;
}

/** Contact channel types used by the source system. */
export type ContactType = "mobile" | "phone" | "email";

/** A row in the `ContactInfo` table. Mirrors the C# `ContactInfo` entity. */
export interface ContactInfoRecord {
  contactId: string;
  personId: string;
  contactType: ContactType;
  contactDetails: string; // the number or email address
  isActive: boolean;
  auditUser: string;
  auditDate: string;
}

/** A single postal address with a `formatted` one-line rendering. */
export class Address {
  constructor(private readonly record: AddressRecord) {}

  get addressId(): number {
    return this.record.addressId;
  }
  get addressType(): string {
    return this.record.addressType;
  }

  /** One-line address, e.g. "12 Sampaguita St., Brgy. Malaya, Quezon City". */
  get formatted(): string {
    const r = this.record;
    const line = [r.addressNo, r.street].filter(Boolean).join(" ");
    const brgy = r.barangay ? `Brgy. ${r.barangay}` : "";
    return [line, brgy, r.city, r.province].filter(Boolean).join(", ");
  }
}

/** A single contact channel. */
export class ContactInfo {
  constructor(private readonly record: ContactInfoRecord) {}

  get contactId(): string {
    return this.record.contactId;
  }
  get contactType(): ContactType {
    return this.record.contactType;
  }
  get contactDetails(): string {
    return this.record.contactDetails;
  }
  get isActive(): boolean {
    return this.record.isActive;
  }
}

/* ============================ Payout channel ============================ */

/** The kind of channel a payout is disbursed through (`ChannelType`). */
export type PayoutChannelType = "BANK ACCOUNT" | "EWALLET" | "LIFEPLAN BRANCH";

/** A row in the `RefPayoutChannel` table. Mirrors the C# `RefPayoutChannel`. */
export interface RefPayoutChannelRecord {
  channelCode: string;
  channelDesc: string;
  channelType: PayoutChannelType;
  isActive: boolean;
  orderBy: number;
}

/**
 * A row in the `PayoutAccount` table. Mirrors the C# `PayoutAccount` entity —
 * a bank / e-wallet / branch destination a person can be paid into.
 */
export interface PayoutAccountRecord {
  payoutId: string;
  personId: string;
  channelCode: string; // reference to RefPayoutChannel
  accountNo: string;
  payoutBranch: string;
  isActive: boolean;
}

/**
 * A person's payout destination, wrapping a {@link PayoutAccountRecord} with
 * its resolved {@link RefPayoutChannelRecord} (the mock DB does the join).
 */
export class PayoutAccount {
  constructor(
    private readonly record: PayoutAccountRecord,
    /** The channel this account belongs to (BANK / EWALLET / branch). */
    readonly channel: RefPayoutChannelRecord | undefined,
  ) {}

  get payoutId(): string {
    return this.record.payoutId;
  }
  get personId(): string {
    return this.record.personId;
  }
  get channelCode(): string {
    return this.record.channelCode;
  }
  /** Channel display name, e.g. "BDO" / "GCash". */
  get channelName(): string {
    return this.channel?.channelDesc ?? this.record.channelCode;
  }
  get channelType(): PayoutChannelType | undefined {
    return this.channel?.channelType;
  }
  get accountNo(): string {
    return this.record.accountNo;
  }
  /** Account number with all but the last four digits masked. */
  get maskedAccountNo(): string {
    const raw = this.record.accountNo;
    if (raw.length <= 4) return raw;
    return `${"•".repeat(Math.max(0, raw.length - 4))}${raw.slice(-4)}`;
  }
  get payoutBranch(): string {
    return this.record.payoutBranch;
  }
  get isActive(): boolean {
    return this.record.isActive;
  }
}

/* ================================ Person ================================ */

/**
 * A person. Wraps a {@link PersonRecord} together with its resolved addresses,
 * contacts and payout accounts (the mock DB performs the join and injects them).
 */
export class Person {
  readonly addresses: Address[];
  readonly contacts: ContactInfo[];
  readonly payoutAccounts: PayoutAccount[];

  constructor(
    private readonly record: PersonRecord,
    addresses: Address[],
    contacts: ContactInfo[],
    payoutAccounts: PayoutAccount[] = [],
  ) {
    this.addresses = addresses;
    this.contacts = contacts;
    this.payoutAccounts = payoutAccounts;
  }

  get personId(): string {
    return this.record.personId;
  }

  /** The name broken into parts. */
  get name(): PersonName {
    return {
      firstName: this.record.firstName,
      middleName: this.record.middleName,
      lastName: this.record.lastName,
      suffix: this.record.suffix,
    };
  }

  get dateOfBirth(): Date {
    return new Date(this.record.dateOfBirth);
  }
  get placeOfBirth(): string {
    return this.record.placeOfBirth;
  }
  get genderAtBirth(): Gender {
    return this.record.genderAtBirth;
  }
  get preferredGender(): Gender {
    return this.record.preferredGender;
  }
  get civilStatus(): CivilStatus {
    return this.record.civilStatus;
  }
  get height(): string {
    return this.record.height;
  }
  get weight(): string {
    return this.record.weight;
  }

  /** Current age in full years. */
  get age(): number {
    return fullYearsBetween(this.dateOfBirth, new Date());
  }

  /** Primary address, one-line — "—" when the person has none on file. */
  get address(): string {
    return this.addresses[0]?.formatted ?? "—";
  }

  /** Primary active contact detail — prefers a mobile number. */
  get contact(): string {
    const active = this.contacts.filter((c) => c.isActive);
    const preferred =
      active.find((c) => c.contactType === "mobile") ??
      active.find((c) => c.contactType === "phone") ??
      active[0];
    return preferred?.contactDetails ?? "—";
  }

  /** Active email address, if one is on file. */
  get email(): string | undefined {
    return this.contacts.find((c) => c.isActive && c.contactType === "email")
      ?.contactDetails;
  }
}

/* =============================== Plan type =============================== */

/** A row in the `PlanType` table. Mirrors the C# `PlanType` entity. */
export interface PlanTypeRecord {
  planCode: string;
  planDesc: string;
  productCode: string;
  planClass: string;
  contractPrice: number;
  instAmt: number;
  /** Number of years for payment. */
  term: number;
}

/* ============================== Planholder ============================== */

/** Account status codes (`AcctStatCode`). */
export type AccountStatus = "AC" | "LP"; // AC = Active, LP = Lapsed
export type Contestability = "within" | "over";

/**
 * A row in the `Planholder` table. Mirrors the C# `Planholder` entity. The
 * trailing ledger fields live in a separate payment subsystem in production;
 * they are kept here so the prototype can render the "Plan Detail" panel
 * without a second data source. Contract price and installment amount are NOT
 * stored here — they come from the plan's {@link PlanTypeRecord}.
 */
export interface PlanholderRecord {
  lpaNo: string;
  personId: string;
  planCode: string;
  planTAP: number;
  planClass: string;
  accountClass: string;
  acctStatCode: AccountStatus;
  termiStatCode: string;
  balance: number;
  dueDate: string; // ISO
  effectivityDate: string; // ISO
  instNo: number;
  isServiceOnly: boolean;
  newEffectivityDate?: string | null;
  riDate?: string | null;
  transferDate?: string | null;
  auditUser: string;
  auditDate: string;

  // Ledger extras (see note above).
  totalAmountPaid: number;
  lastPaymentDate: string; // ISO
}

/** The financial detail shown on the plan holder's "Plan Detail" tab. */
export interface PlanDetail {
  contractPrice: number;
  tap: number;
  balance: number;
  instAmount: number;
  totalAmountPaid: number;
  dueDate: string;
  instNo: number;
  lastRIDate?: string | null;
  lastPaymentDate: string;
}

/** Human labels for termination status codes. */
const TERMINATION_LABELS: Record<string, string> = {
  "": "None",
  NONE: "None",
  MT: "Matured",
  SR: "Surrendered",
  LP: "Lapsed",
};

/**
 * A plan holder — one plan (LPA number) plus the underwriting facts derived
 * from it. Wraps a {@link PlanholderRecord} with its resolved {@link Person}
 * and {@link PlanTypeRecord}. This is the main entity of the claims domain:
 * every claim request links back to a plan holder by its LPA number.
 */
export class Planholder {
  constructor(
    private readonly record: PlanholderRecord,
    /** The owner, resolved from `personId` (undefined if missing). */
    readonly person: Person | undefined,
    /** The plan, resolved from `planCode` (supplies price / installment). */
    readonly planType: PlanTypeRecord | undefined,
  ) {}

  get lpaNo(): string {
    return this.record.lpaNo;
  }
  get personId(): string {
    return this.record.personId;
  }
  get planCode(): string {
    return this.record.planCode;
  }
  /** Plan name, e.g. "ST.ANNE". */
  get planDesc(): string {
    return this.planType?.planDesc ?? "—";
  }
  get productCode(): string {
    return this.planType?.productCode ?? "—";
  }
  get planClass(): string {
    return this.record.planClass;
  }
  get accountClass(): string {
    return this.record.accountClass;
  }
  /** Payment term in years. */
  get term(): number | undefined {
    return this.planType?.term;
  }
  get accountStatus(): AccountStatus {
    return this.record.acctStatCode;
  }
  get isServiceOnly(): boolean {
    return this.record.isServiceOnly;
  }

  /** Whether/why the plan was terminated ("None" when it wasn't). */
  get terminationStatus(): string {
    const code = this.record.termiStatCode ?? "";
    return TERMINATION_LABELS[code] ?? code;
  }

  get effectivityDate(): Date {
    return new Date(this.record.effectivityDate);
  }
  get newEffectivityDate(): Date | null {
    return this.record.newEffectivityDate
      ? new Date(this.record.newEffectivityDate)
      : null;
  }
  get riDate(): Date | null {
    return this.record.riDate ? new Date(this.record.riDate) : null;
  }
  get transferDate(): Date | null {
    return this.record.transferDate ? new Date(this.record.transferDate) : null;
  }

  /** Kept for backward compatibility with the earlier model (usually blank). */
  get laf(): string {
    return "";
  }

  /** The plan holder's name, pulled from the Person record. */
  get name(): PersonName | undefined {
    return this.person?.name;
  }

  /** Date of birth, pulled from the Person record. */
  get dateOfBirth(): Date | undefined {
    return this.person?.dateOfBirth;
  }

  /** Current age of the plan holder, in full years. */
  get age(): number | undefined {
    return this.person?.age;
  }

  /** Financial detail assembled for the "Plan Detail" panel. */
  get planDetail(): PlanDetail {
    const r = this.record;
    return {
      contractPrice: this.planType?.contractPrice ?? 0,
      tap: r.planTAP,
      balance: r.balance,
      instAmount: this.planType?.instAmt ?? 0,
      totalAmountPaid: r.totalAmountPaid,
      dueDate: r.dueDate,
      instNo: r.instNo,
      lastRIDate: r.riDate ?? null,
      lastPaymentDate: r.lastPaymentDate,
    };
  }

  /** Insurable when the person is 18–64 years old at the plan's effectivity. */
  get insurability(): boolean {
    if (!this.dateOfBirth) return false;
    const ageAtEffectivity = fullYearsBetween(
      this.dateOfBirth,
      this.effectivityDate,
    );
    return ageAtEffectivity >= 18 && ageAtEffectivity <= 64;
  }

  /** "within" while the plan is ≤ 1 year old, "over" once it is older. */
  get contestability(): Contestability {
    const oneYearIn = new Date(this.effectivityDate);
    oneYearIn.setFullYear(oneYearIn.getFullYear() + 1);
    return new Date() > oneYearIn ? "over" : "within";
  }
}

/** A row in the `Beneficiary` table. Mirrors the C# `Beneficiary` entity. */
export interface BeneficiaryRecord {
  beneficiaryId: string;
  /** The plan this beneficiary was declared on. */
  lpaNo: string;
  /** The person named as beneficiary. */
  personId: string;
  auditUser: string;
  auditDate: string;
  /** Set the first time the row is edited — absent on an untouched row. */
  editUser?: string;
  editDate?: string;
  /** Relationship to the plan holder, e.g. "Spouse". */
  relation: string;
}

/**
 * A beneficiary declared on a plan — the C# `Beneficiary` entity, with its
 * `Planholder` and `Person` navigation properties resolved.
 *
 * NOT a claim payee (`ClaimsPayeeRecord`): a beneficiary is named by the plan
 * holder when the plan is bought and belongs to the PLAN, while a payee is
 * filed against a specific CLAIM and can be someone else entirely.
 */
export class Beneficiary {
  constructor(
    private readonly record: BeneficiaryRecord,
    /** The plan, resolved from `lpaNo` (undefined if missing). */
    readonly planholder: Planholder | undefined,
    /** The person named, resolved from `personId` (undefined if missing). */
    readonly person: Person | undefined,
  ) {}

  get beneficiaryId(): string {
    return this.record.beneficiaryId;
  }
  get lpaNo(): string {
    return this.record.lpaNo;
  }
  get personId(): string {
    return this.record.personId;
  }
  /** Relationship to the plan holder, e.g. "Spouse". */
  get relation(): string {
    return this.record.relation;
  }

  /** The beneficiary's name parts, or undefined if the person is missing. */
  get name(): PersonName | undefined {
    return this.person?.name;
  }

  /** Age in full years today, or undefined if the person is missing. */
  get age(): number | undefined {
    return this.person
      ? fullYearsBetween(this.person.dateOfBirth, new Date())
      : undefined;
  }

  get auditUser(): string {
    return this.record.auditUser;
  }
  get auditDate(): Date {
    return new Date(this.record.auditDate);
  }
  /** Who last edited the row, or null if it has never been edited. */
  get editUser(): string | null {
    return this.record.editUser ?? null;
  }
  get editDate(): Date | null {
    return this.record.editDate ? new Date(this.record.editDate) : null;
  }
}

/* ======================= Remarks / notes / documents ======================= */

/** A row in the `PlanholderRemarks` table. */
export interface PlanholderRemarkRecord {
  idx: number;
  lpaNo: string;
  value: string;
  auditUser: string;
  auditDate: string;
}

/** A row in the `PlanholderNotes` table. */
export interface PlanholderNoteRecord {
  idx: number;
  lpaNo: string;
  value: string;
  auditUser: string;
  auditDate: string;
}

/** A row in the `DocumentType` table. */
export interface DocumentTypeRecord {
  documentCode: string;
  documentDesc: string;
}

/** A row in the `Document` table. */
export interface DocumentRecord {
  docId: number;
  documentCode: string;
  personId: string;
  /** The URL (or bytes) of the stored document. */
  value: string;
}

/* ============================ Claim requests ============================ */

/** A row in the `ClaimRequest` table. Mirrors the C# `ClaimRequest` entity. */
export interface ClaimRequestRecord {
  /** e.g. "CLQCITY2026CAB000001" — CL + branch + year + claim code + seq. */
  requestNo: string;
  /** Branch code, e.g. "QCITY". */
  requestingBranch: string;
  lpaNo: string; // reference to the plan holder
  claimType: ClaimKind;
  causeOfIncident: string;
  incidentDate: string; // ISO
  status: ClaimStatusCode;
  auditUser: string;
  auditDate: string; // the file date (ISO)
}

/** A claim request — the filing that a {@link ClaimsHdr} is opened against. */
export class ClaimRequest {
  constructor(private readonly record: ClaimRequestRecord) {}

  get requestNo(): string {
    return this.record.requestNo;
  }
  /** Raw branch code, e.g. "QCITY". */
  get requestingBranchCode(): string {
    return this.record.requestingBranch;
  }
  /** Branch display name, e.g. "Quezon City Branch". */
  get requestingBranch(): string {
    return branchLabel(this.record.requestingBranch);
  }
  get lpaNo(): string {
    return this.record.lpaNo;
  }
  get claimType(): ClaimKind {
    return this.record.claimType;
  }
  get causeOfIncident(): string {
    return this.record.causeOfIncident;
  }
  get incidentDate(): Date {
    return new Date(this.record.incidentDate);
  }
  /** Raw ISO incident date (handy for adapters). */
  get incidentDateISO(): string {
    return this.record.incidentDate;
  }
  /** The raw status code, e.g. "PE". */
  get status(): ClaimStatusCode {
    return this.record.status;
  }
  /** The status display label, e.g. "Pending". */
  get statusLabel(): ClaimPhase {
    return claimStatusLabel(this.record.status);
  }
  /** The file date (C# `AuditDate`). */
  get fileDate(): Date {
    return new Date(this.record.auditDate);
  }
  get fileDateISO(): string {
    return this.record.auditDate;
  }
  get auditUser(): string {
    return this.record.auditUser;
  }
}

/**
 * A row in the `ClaimsHdr` table (death-claim specialisation). Mirrors the C#
 * `ClaimsHdrDC : ClaimsHdr`. `Status`, `NatureCode`, `DateOfDeath` and
 * `AgeOfDeath` are NOT stored — they are derived on the domain classes below.
 */
export interface ClaimsHdrDCRecord {
  /** e.g. "NCT2-2DC26009785" — territory + claim code + 2-digit year + seq. */
  claimNo: string;
  claimRequest: string; // reference to the ClaimRequest (requestNo)
  auditUser: string; // the processor
  auditDate: string; // ISO
  editUser?: string;
  editDate?: string;
  isQuitClaim: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string | null;
  benefits: DeathBenefit;
}

/**
 * A row in the `ClaimsPayee` table. Mirrors the C# `ClaimsPayee` entity — a
 * claim can be paid to one or two payees (e.g. joint claimants).
 */
export interface ClaimsPayeeRecord {
  idx: number;
  claimNo: string;
  /** Primary payee — a `Person` key. */
  payeeOneId: string;
  /** Secondary/joint payee, if any — a `Person` key. */
  payeeTwoId?: string;
  amount: number;
  relation: string;
  /** Payment held pending review (e.g. document or eligibility check). */
  isOnHold: boolean;
  remarks?: string;
}

/**
 * Shared claim-header behaviour (C# abstract `ClaimsHdr`). Status and the
 * requesting branch are read straight off the linked claim request.
 */
export class ClaimsHdr {
  constructor(
    protected readonly hdr: ClaimsHdrDCRecord,
    /** The request this claim was opened against. */
    readonly claimRequest: ClaimRequest,
    /** The owning plan holder — supplies the deceased and contestability. */
    readonly planholder: Planholder | undefined,
  ) {}

  get claimNo(): string {
    return this.hdr.claimNo;
  }
  get isQuitClaim(): boolean {
    return this.hdr.isQuitClaim;
  }
  get isVerified(): boolean {
    return this.hdr.isVerified;
  }
  get verifiedBy(): string | undefined {
    return this.hdr.verifiedBy;
  }

  /** The processor assigned to the claim (C# `AuditUser`). */
  get processor(): string {
    return this.hdr.auditUser;
  }

  /** Status code, taken from the request (C# `Status`). */
  get status(): ClaimStatusCode {
    return this.claimRequest.status;
  }
  /** Status display label, e.g. "For Approval". */
  get statusLabel(): ClaimPhase {
    return this.claimRequest.statusLabel;
  }

  /** The file date, taken from the request (C# `FileDate`). */
  get fileDate(): Date {
    return this.claimRequest.fileDate;
  }

  /** The requesting branch, taken from the request. */
  get requestingBranch(): string {
    return this.claimRequest.requestingBranch;
  }

  /**
   * "within" while the plan is ≤ 1 year past effectivity, "over" afterwards
   * (C# `Contestability`). Delegates to the owning plan holder.
   */
  get contestability(): Contestability {
    return this.planholder?.contestability ?? "over";
  }
}

/**
 * A death claim header (C# `ClaimsHdrDC : ClaimsHdr`). Adds the derived
 * `natureCode`, `dateOfDeath` and `ageOfDeath` on top of the shared header.
 */
export class ClaimsHdrDC extends ClaimsHdr {
  get benefits(): DeathBenefit {
    return this.hdr.benefits;
  }

  /** The deceased plan holder (resolved from the plan). */
  get deceased(): Person | undefined {
    return this.planholder?.person;
  }

  /**
   * "SC" (Special Claim) when the incident was filed within 7 days, otherwise
   * "RC" (Regular Claim). Mirrors the C# `NatureCode` rule — computed here
   * against the file date so it is stable for historical rows.
   */
  get natureCode(): "SC" | "RC" {
    const days =
      (this.fileDate.getTime() - this.claimRequest.incidentDate.getTime()) /
      86_400_000;
    return days <= 7 ? "SC" : "RC";
  }

  /** Date of death — the incident date on the request (C# `DateOfDeath`). */
  get dateOfDeath(): Date {
    return this.claimRequest.incidentDate;
  }
  get dateOfDeathISO(): string {
    return this.claimRequest.incidentDateISO;
  }

  /** Age of the deceased, "61 yrs 1 mos 5 days" (C# `AgeOfDeath`). */
  get ageOfDeath(): string {
    if (!this.deceased) return "—";
    return formatAgeOfDeath(this.deceased.dateOfBirth, this.dateOfDeath);
  }
}

/* ================================ Branch ================================ */

/** A row in the `Branch` table. Mirrors the C# `Branch` entity. */
export interface BranchRecord {
  branchCode: string;
  territoryCode: string;
  regionCode: string;
  description: string;
  address: string;
  contactNo: string;
  email: string;
}

/* ============================== RefPayClass ============================== */

/** A row in the `RefPayClass` table. Mirrors the C# `RefPayClass` entity. */
export interface RefPayClassRecord {
  /** e.g. "NS" (New Sale) / "DC" (Deferred Collection). */
  payClassCode: string;
  description: string;
  /** What the class is charged against, e.g. "PLAN". */
  payFor: string;
  minAmount: number;
  isActive: boolean;
}

/* ================================ Payment ================================ */

/** A row in the `Payment` table. Mirrors the C# `Payment` entity. */
export interface PaymentRecord {
  /** Official Receipt number — 8-digit sequence + branch code. Primary key. */
  orNo: string;
  lpaNo: string; // reference to the plan holder
  payClassId: string; // reference to RefPayClass
  orDate: string; // ISO — the date of payment
  amount: number;
  branchCode: string; // reference to Branch
}

/**
 * A payment (official receipt) against a plan, wrapping a {@link PaymentRecord}
 * with its resolved pay class (the mock DB does the join).
 */
export class Payment {
  constructor(
    private readonly record: PaymentRecord,
    /** The pay class this OR belongs to (NS / DC / …). */
    readonly payClass: RefPayClassRecord | undefined,
  ) {}

  get orNo(): string {
    return this.record.orNo;
  }
  get lpaNo(): string {
    return this.record.lpaNo;
  }
  get payClassId(): string {
    return this.record.payClassId;
  }
  /** Pay class name, e.g. "NEW SALE" / "DEFFERED COLLECTION". */
  get payClassName(): string {
    return this.payClass?.description ?? this.record.payClassId;
  }
  get orDate(): Date {
    return new Date(this.record.orDate);
  }
  get orDateISO(): string {
    return this.record.orDate;
  }
  get amount(): number {
    return this.record.amount;
  }
  get branchCode(): string {
    return this.record.branchCode;
  }
}
