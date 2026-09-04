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

import { serviceDateFor } from "./billing-period";

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
 * Difference between two dates in whole years, months and days.
 *
 * Borrowing, the way anyone does it on paper: short of days, take them from the
 * month before the END date — which is why the length of that particular month
 * matters and a fixed 30 would be wrong.
 */
export function yearsMonthsDays(
  start: Date,
  end: Date,
): { years: number; months: number; days: number } {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

/**
 * The "Age of Death" figure on a death claim (C# `AgeOfDeath`) — "61 yrs 1 mos
 * 5 days".
 *
 * NO COMMA, unlike {@link formatAge}. The two are the same arithmetic worded
 * two ways because two screens word them two ways, and neither is this layer's
 * to normalise: this one matches the death claim's own paperwork.
 */
export function formatAgeOfDeath(birth: Date, death: Date): string {
  const { years, months, days } = yearsMonthsDays(birth, death);
  return `${years} yrs ${months} mos ${days} days`;
}

/**
 * How old somebody is TODAY, to the day — "52 yrs, 2 mos 2 days"
 * (user-confirmed 2026-08-26).
 *
 * WHY TO THE DAY AND NOT IN YEARS. On a service payable the age is read against
 * the contestable year, and "38 yrs" is the one rounding that hides the thing
 * being looked for — a plan a fortnight either side of its anniversary reads the
 * same as one six months clear of it.
 *
 * The comma sits after the YEARS only, which is how it was given.
 */
export function formatAge(birth: Date, asOf: Date = new Date()): string {
  const { years, months, days } = yearsMonthsDays(birth, asOf);
  return `${years} yrs, ${months} mos ${days} days`;
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
  /**
   * The person this address belongs to.
   *
   * Denormalised — the source `Address` table has no such column; a person
   * points AT their addresses (`Person.Addresses`). It is kept here because
   * every lookup in this layer runs the other way, from a person to their rows.
   *
   * Optional, because not every address is a person's: a chapel branch has one
   * too, and it is owned by the chapel rather than by anybody. Such a row is
   * reachable only through {@link ChapelBranchRecord.addressId}, which is
   * exactly how the source system reaches it.
   */
  personId?: string;
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

/* ========================= Account / termination ========================= */

/**
 * A row in the `RefAccountStatus` table. Mirrors the C# `RefAccountStatus`.
 *
 * Where a plan's ACCOUNT stands — whether it is still being collected on, has
 * been paid out, or has fallen over. Distinct from {@link RefTermiStatRecord},
 * which says what became of the PLAN: an account can be fully paid while the
 * plan itself has not been terminated at all, and that combination is exactly
 * the one a service payable is raised against.
 */
export interface RefAccountStatusRecord {
  acctStatCode: AccountStatus;
  description: string;
}

/** Account status codes (`AcctStatCode`) — the `RefAccountStatus` key set. */
export type AccountStatus =
  | "AC" // ACTIVE
  | "DN" // DENIED
  | "FP" // FULLY PAID
  | "LA" // LE APPLICATION
  | "LP" // LAPSED
  | "NS" // NEW SALES
  | "RI"; // REINSTATED

/**
 * Account status descriptions, as the reference table words them.
 *
 * TITLE CASE, not the table's own upper case. The source stores "FULLY PAID"
 * because that is how a 1990s green screen wrote everything; this is what the
 * label reads in a sentence, and the code beside it is the thing anyone quotes.
 */
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  AC: "Active",
  DN: "Denied",
  FP: "Fully Paid",
  LA: "LE Application",
  LP: "Lapsed",
  NS: "New Sales",
  RI: "Reinstated",
};

/** Expand an account status code to its label (falls back to the code). */
export function accountStatusLabel(code: string): string {
  return ACCOUNT_STATUS_LABELS[code as AccountStatus] ?? code;
}

/**
 * Whether an account is one the plan is still in good standing under — the
 * green-or-amber question every status pill in claims asks.
 *
 * Written as the two that are NOT, rather than the five that are, because the
 * failing set is the stable one: `LP` fell over and `DN` was refused. Everything
 * else is a plan on its way somewhere, including `FP`, which is the BEST an
 * account gets — it is paid off — and which read as "Lapsed" for as long as the
 * only two codes in this layer were AC and LP.
 */
export function isAccountInGoodStanding(code: AccountStatus): boolean {
  return code !== "LP" && code !== "DN";
}

/** A row in the `RefTermiStat` table. Mirrors the C# `RefTermiStat` entity. */
export interface RefTermiStatRecord {
  termiStatCode: TerminationStatus;
  description: string;
}

/**
 * Termination status codes (`TermiStatCode`) — what became of the PLAN.
 *
 * Four of these decide things elsewhere in the system and are worth knowing by
 * sight:
 *
 *   NT      the plan is simply still standing. The default, and what every
 *           untouched row carries.
 *   SA / SP the plan was SERVICED — assigned, or by the plan holder themselves.
 *           These are what a service payable's termination WRITES, which is why
 *           the nature of service and the termination status are the same
 *           choice made once (see `NATURE_OF_SERVICE` in service payables).
 *   FR / RP return of premium. A plan under either is not serviceable at all —
 *           see {@link Planholder.canBeServiced}.
 */
export type TerminationStatus =
  | "AR"
  | "CA"
  | "CB"
  | "CF"
  | "CT"
  | "CU"
  | "DC"
  | "FR"
  | "NT"
  | "RD"
  | "RP"
  | "SA"
  | "SP"
  | "TP"
  | "TR"
  | "UA"
  | "UC"
  | "UF"
  | "UP"
  | "UR"
  | "UT";

/** Termination status descriptions, as the reference table words them. */
export const TERMINATION_STATUS_LABELS: Record<TerminationStatus, string> = {
  AR: "Active ROP",
  CA: "Cash Surrender from AC Account",
  CB: "Cash Benefit",
  CF: "Cash Surrender from FP Account",
  CT: "Cancelled/Forfeited Plan Termination Value",
  CU: "Cancelled Loan",
  DC: "Denied Claim",
  FR: "Fully Paid ROP",
  NT: "Not Yet Terminated",
  RD: "St. Peter ACE Program",
  RP: "Return of Premium",
  SA: "Serviced - Assigned",
  SP: "Serviced - Planholder",
  TP: "Terminated Plan",
  TR: "Transferred ROP",
  UA: "USB - One Fully Paid Plan from AC Account",
  UC: "USB - Continue Payment",
  UF: "USB - One Fully Paid Plan from FP Account",
  UP: "USB - One Fully Paid Plan",
  UR: "USB - Cremation Plan",
  UT: "USB - Termination Value or 70%",
};

/**
 * The termination statuses that mean RETURN OF PREMIUM, and so bar the plan
 * from ever being serviced — see {@link Planholder.canBeServiced}.
 *
 * TWO CODES, NOT FOUR. `AR` (Active ROP) and `TR` (Transferred ROP) are return
 * of premium too by their descriptions, and they are deliberately NOT in here:
 * the rule as given names FR and RP, and widening it to everything with "ROP"
 * in its description would block plans nobody has said to block. If the rule
 * turns out to cover all four, this array is the whole change.
 */
export const ROP_TERMINATION_STATUSES: TerminationStatus[] = ["FR", "RP"];

/** The account status a plan must be in before it can be serviced. */
export const SERVICEABLE_ACCOUNT_STATUS: AccountStatus = "FP";

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
  termiStatCode: TerminationStatus;
  balance: number;
  dueDate: string; // ISO
  effectivityDate: string; // ISO
  instNo: number;
  /**
   * Whether the plan holder was insurable when the plan took effect.
   *
   * STORED here because the source system stores it (C# `IsInsured`), and it is
   * stored there because the answer is fixed at effectivity — it is a fact
   * about a date that has already passed, not something that changes as the
   * plan holder ages. The domain class recomputes it as
   * {@link Planholder.insurability}; the two agree, and a row that disagrees is
   * a row whose date of birth was corrected after the fact.
   */
  isInsured?: boolean;
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

/**
 * Why a plan cannot be serviced, when it cannot — see
 * {@link Planholder.serviceBlock}.
 *
 * `rop`        the plan was returned as premium (FR / RP). Nothing was left to
 *              render service against.
 * `not-paid`   the account is not fully paid, so the plan has not yet earned
 *              the service it was bought for.
 */
export type ServiceBlockReason = "rop" | "not-paid";

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
  /** Account status as a sentence, e.g. "Fully Paid". */
  get accountStatusLabel(): string {
    return accountStatusLabel(this.record.acctStatCode);
  }
  get isServiceOnly(): boolean {
    return this.record.isServiceOnly;
  }

  /** The raw termination status code, e.g. "NT" / "SA" / "FR". */
  get termiStatCode(): TerminationStatus {
    return this.record.termiStatCode;
  }

  /** Whether/why the plan was terminated ("Not Yet Terminated" when it wasn't). */
  get terminationStatus(): string {
    const code = this.record.termiStatCode;
    return TERMINATION_STATUS_LABELS[code] ?? code;
  }

  /** The account has been settled in full — the `FP` status. */
  get isFullyPaid(): boolean {
    return this.record.acctStatCode === SERVICEABLE_ACCOUNT_STATUS;
  }

  /**
   * The plan was returned as premium — `FR` or `RP`. See
   * {@link ROP_TERMINATION_STATUSES}.
   */
  get isROP(): boolean {
    return ROP_TERMINATION_STATUSES.includes(this.record.termiStatCode);
  }

  /** The plan has already been serviced — `SA` or `SP`. */
  get isServiced(): boolean {
    return (
      this.record.termiStatCode === "SA" || this.record.termiStatCode === "SP"
    );
  }

  /**
   * Whether this plan may be serviced and terminated at all.
   *
   * Two clauses, both from the service-payable rules and both about the PLAN
   * rather than about the funeral: the termination status must not be a return
   * of premium, and the account must be fully paid. A chapel can render service
   * for anybody — the family buries their dead either way — but the company
   * only owes a payable on a plan that was still standing and paid for.
   *
   * Checked in the service-payables module before a plan is terminated into a
   * billing. What a failure MEANS there is not the same in both cases, which is
   * why {@link serviceBlock} says which clause failed rather than this
   * returning a bare false: a return of premium is a DISCREPANCY the branch has
   * to answer for, and an unpaid account is simply a plan that is not ready.
   */
  get canBeServiced(): boolean {
    return this.serviceBlock === undefined;
  }

  /** Why the plan cannot be serviced, or nothing when it can. */
  get serviceBlock(): ServiceBlockReason | undefined {
    if (this.isROP) return "rop";
    if (!this.isFullyPaid) return "not-paid";
    return undefined;
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
  /** e.g. "NCT1DC26009785" — territory + claim code + 2-digit year + seq. */
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
  /** Reference to {@link TerritoryRecord} — the territory the branch sits in. */
  territoryCode: string;
  regionCode: string;
  description: string;
  address: string;
  contactNo: string;
  email: string;
}

/* =============================== Territory =============================== */

/**
 * A row in the `Territory` table. Mirrors the C# `Territory` entity.
 *
 * The territory is the widest unit of the org chart this layer models: branches
 * sell within one, chapels render service within one, and a claim number is
 * prefixed with one. Its code is what every other table stores; the description
 * here is the only place the name it is actually called by is written down.
 */
export interface TerritoryRecord {
  territoryCode: string;
  /** The territory's name, e.g. "BICOL TERRITORY". */
  description: string;
  /** PersonID of the territory head. */
  territoryHead: string;
  isActive: boolean;
  auditUser: string;
  auditDate: string; // ISO
  editUser?: string;
  editDate?: string;
}

/* ============================== ChapelBranch ============================== */

/**
 * A row in the `ChapelBranch` table. Mirrors the C# `ChapelBranch` entity.
 *
 * A chapel is where the service a plan pays for is actually rendered, and it is
 * a different thing from a {@link BranchRecord} — a branch sells and collects,
 * a chapel buries. They are grouped by the same territories, which is the only
 * place the two meet.
 *
 * `isFranchise` is false for nearly every row, as it is for nearly every chapel
 * in the real system. The franchised ones bill under a different process and
 * the service-payables module branches on this flag — see `isSystemCapable`.
 */
export interface ChapelBranchRecord {
  chapelCode: string;
  /** The chapel's name, e.g. "IRIGA - SAN MIGUEL". */
  chapelDesc: string;
  /** Reference to the chapel's own {@link AddressRecord}. */
  addressId: number;
  /** PersonID of the chapel manager. */
  chapelMngr: string;
  /** Reference to the chapel's {@link ContactInfoRecord}. */
  contactId: string;
  /** Reference to {@link TerritoryRecord}. */
  territoryCode: string;
  isFranchise: boolean;
  /**
   * Whether this chapel endorses its services THROUGH the system.
   *
   * NOT IN THE SOURCE STRUCTURE — `ChapelBranch` has no such column yet, and
   * this is the one field on this record that is not a translation of one. It
   * is here because the service-payable rules turn on it: some franchises are
   * not equipped to use the system at all and submit their paperwork by hand,
   * which means their plan holders are keyed in by the processor rather than
   * arriving with the endorsement. That is a different screen, not a different
   * label, so the flag has to live somewhere.
   *
   * Absent means true. Every company-owned chapel is on the system, so the flag
   * is only ever written on a franchise — and only on the ones that are not.
   */
  isSystemCapable?: boolean;
  isActive: boolean;
  auditUser: string;
  auditDate: string; // ISO
  editUser?: string;
  editDate?: string;
}

/**
 * A chapel branch with its territory, address, contact and manager resolved
 * (the mock DB does the joins).
 */
export class ChapelBranch {
  constructor(
    private readonly record: ChapelBranchRecord,
    /** The territory this chapel belongs to. */
    readonly territory: TerritoryRecord | undefined,
    /** The chapel's own address. */
    readonly address: Address | undefined,
    /** The chapel's contact channel. */
    readonly contact: ContactInfo | undefined,
    /** The person managing the chapel. */
    readonly manager: Person | undefined,
  ) {}

  get chapelCode(): string {
    return this.record.chapelCode;
  }
  get chapelDesc(): string {
    return this.record.chapelDesc;
  }
  get territoryCode(): string {
    return this.record.territoryCode;
  }
  get isFranchise(): boolean {
    return this.record.isFranchise;
  }
  /**
   * Whether the chapel endorses through the system. See
   * {@link ChapelBranchRecord.isSystemCapable} — absent means yes.
   */
  get isSystemCapable(): boolean {
    return this.record.isSystemCapable ?? true;
  }
  /**
   * A franchise that submits its paperwork by hand — the case whose plan
   * holders have to be keyed in rather than arriving with the endorsement.
   *
   * Both halves are required. An owned chapel is never on this path, and a
   * franchise that IS on the system follows exactly the process an owned chapel
   * does.
   */
  get isManualFranchise(): boolean {
    return this.record.isFranchise && !this.isSystemCapable;
  }
  get isActive(): boolean {
    return this.record.isActive;
  }

  /** Territory name, falling back to its code when the row is missing. */
  get territoryName(): string {
    return this.territory?.description ?? this.record.territoryCode;
  }

  /** One-line address — "—" when the chapel has none on file. */
  get addressLine(): string {
    return this.address?.formatted ?? "—";
  }

  /** The chapel's contact number — "—" when it has none on file. */
  get contactNo(): string {
    return this.contact?.contactDetails ?? "—";
  }
}

/* ============================== RefMortuary ============================== */

/**
 * Who owns a mortuary. Mirrors the C# `RefMortuary.Class`.
 *
 * `OW` company-owned — a "ST.PETER CHAPEL - …", staffed and run by the company.
 * `FR` franchised — an independent funeral home operating under the brand.
 */
export type MortuaryClass = "OW" | "FR";

/**
 * A row in the `RefMortuary` table. Mirrors the C# `RefMortuary` entity — the
 * funeral home a service payable is actually raised against.
 *
 * A MORTUARY IS NOT A CHAPEL, though the owned ones are named after one. The
 * chapel is the company's branch in a town; the mortuary is the establishment
 * that performs the service and is paid for it. Most towns have one of each and
 * they line up; a franchise territory has mortuaries the company does not own at
 * all, and those are where the different process comes from.
 *
 * THE SOURCE COLUMN IS CALLED "BranchCode" AND HOLDS CHAPEL CODES. Every value
 * in it — IRIGA, POLANG, NAGA, GENSAN — is a {@link ChapelBranchRecord}'s
 * `chapelCode`, not a {@link BranchRecord}'s `branchCode`. It is named for what
 * a mortuary belongs to in this data: a chapel. Carried under its source name so
 * a query written against the real table still reads the same.
 */
export interface RefMortuaryRecord {
  /** The source system's own code, e.g. "BT1-01". Primary key. */
  mortCode: string;
  /** e.g. "ST.PETER CHAPEL - IRIGA SAN MIGUEL". */
  mortuary: string;
  /**
   * The chapel this mortuary operates out of — a `ChapelBranch.chapelCode`,
   * despite the column's name. Carried exactly as the reference data gives it,
   * which means it does not always resolve, and one franchise row has none at
   * all.
   */
  branchCode: string;
  /** Reference to the mortuary's own {@link AddressRecord}, when it has one. */
  addressId?: number;
  /** `FR` franchised, `OW` company-owned. */
  mortClass: MortuaryClass;
}

/**
 * A mortuary with its chapel and address resolved (the mock DB does the joins).
 */
export class Mortuary {
  constructor(
    private readonly record: RefMortuaryRecord,
    /** The chapel it operates out of — absent when the code does not resolve. */
    readonly chapel: ChapelBranch | undefined,
    /** The mortuary's own address, when one is on file. */
    readonly address: Address | undefined,
  ) {}

  get mortCode(): string {
    return this.record.mortCode;
  }
  /** The establishment's name, e.g. "ABAO FUNERAL PARLOR". */
  get mortuary(): string {
    return this.record.mortuary;
  }
  /** The chapel code as the reference data gives it — may not resolve. */
  get chapelCode(): string {
    return this.record.branchCode;
  }
  get mortClass(): MortuaryClass {
    return this.record.mortClass;
  }
  get isFranchise(): boolean {
    return this.record.mortClass === "FR";
  }
  /** "Franchised" / "Company-owned" — how the class reads in a sentence. */
  get classLabel(): string {
    return this.record.mortClass === "FR" ? "Franchised" : "Company-owned";
  }
  /** The territory the chapel behind it sits in, when that chapel resolves. */
  get territoryCode(): string | undefined {
    return this.chapel?.territoryCode;
  }
  /** One-line address — "—" when the mortuary has none on file. */
  get addressLine(): string {
    return this.address?.formatted ?? "—";
  }
}

/* ===================== RefMortuaryCSP / …CSPRate ===================== */
//
// THE TWO TABLES THAT PRICE A SERVICE PAYABLE, and they only work as a pair:
//
//   RefMortuaryCSP      what a plan is CALLED in the payables world — the code
//                       list. 47 rows, code and description.
//   RefMortuaryCSPRate  what that code is WORTH at one mortuary. 7,985 rows,
//                       one per mortuary-and-code, and the amount is the whole
//                       of the row.
//
// Together they are the rule the module went a fortnight without (2026-08-26).
// The CSP amount used to be a ladder of plausible pesos in
// `service-payables-data` because no table for it had been given; both of these
// have now landed and the amount is read rather than invented.
//
// HOW A SERVICE GETS PRICED, in the two steps the rules give:
//
//   1. the plan's DESCRIPTION is looked up in `RefMortuaryCSP.cspDesc` —
//      "ST.CLAIRE" is SC — and that is the CSP code;
//   2. the code and the MORTUARY the billing is raised against are looked up in
//      `RefMortuaryCSPRate`, and that is the amount.
//
// So the same plan is worth different money at two funeral homes, which is the
// point of the second table: the rate is a term of the mortuary's contract, not
// a property of the plan. See `cspCodeFor` and `cspAmountFor` in
// `service-payables-data`.

/**
 * A row in the `RefMortuaryCSP` table — the CSP code list.
 *
 * MOST OF IT IS THE PLAN CATALOGUE under a second set of codes: ST. ANNE is SA
 * where `PlanType` calls it A5M, ST. CLAIRE is SC where the plan is C5M8. The
 * rest are caskets and services a plan does not name at all — BARON, DUCHESS,
 * METAL SEALER, and an INVALID row the source keeps for rows that price to
 * nothing.
 *
 * THE DESCRIPTION IS THE JOIN, and it is a join on TEXT: there is no plan code
 * on this table, so the only thing tying SC to C5M8 is that both read
 * "ST. CLAIRE" — one with the space, one without. That difference is why
 * `PisDatabase.getCSPCodeForPlan` compares them word by word rather than
 * string to string.
 */
export interface RefMortuaryCSPRecord {
  /** e.g. "SC". Primary key. */
  cspCode: string;
  /** e.g. "ST. CLAIRE" — the text a plan description is matched against. */
  cspDesc: string;
}

/**
 * A row in the `RefMortuaryCSPRate` table — what one CSP code is worth at one
 * mortuary, in pesos.
 *
 * KEYED BY THE PAIR. Neither half is unique: a mortuary has a rate for each code
 * it handles, and a code has a rate at each mortuary that handles it.
 *
 * THE TABLE IS SPARSE AND THAT IS NOT A GAP IN THE DATA. 840 mortuaries against
 * 23 codes would be 19,320 rows and there are 7,985 — a mortuary carries a rate
 * only for the plans it has actually contracted to serve, and asking for one it
 * has not gets nothing back rather than zero. See `PisDatabase.getCSPRate`.
 */
export interface RefMortuaryCSPRateRecord {
  /** A `RefMortuary.mortCode` — though see the seed: not all of them resolve. */
  mortCode: string;
  /** A {@link RefMortuaryCSPRecord}'s `cspCode`. */
  cspCode: string;
  /** Pesos. Whole in every row on file. */
  cspAmount: number;
}

/* ========================== RefCreditOfService ========================== */

/**
 * A row in the `RefCreditOfService` table. Mirrors the C#
 * `RefCreditOfService` entity — how the service is credited to the chapel that
 * rendered it.
 *
 * FOUR ROWS, on file since 2026-08-25: 1ST POINT, 2ND POINT, CREM ONLY,
 * REGULAR. The table was known from the first structure drop and stood empty
 * until those values arrived, because this layer does not invent values for a
 * reference list that gets quoted back at the source system.
 *
 * NO CODES CAME WITH THEM, so the value is its own id — see `seed.ts`.
 */
export interface RefCreditOfServiceRecord {
  creditOfServiceId: string;
  creditOfServiceDesc: string;
  auditUser: string;
  auditDate: string; // ISO
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

/* ========================= Service-payable billing ========================= */
//
// THE FOUR TABLES A CHAPEL SERVICE PAYABLE IS MADE OF, and the order they are
// written in, which is the order the "For Process" screen works:
//
//   TblBillingHdr              one row per chapel-period. It is what a BILLING
//                              CODE is: DONSOL1AUG26, and the chapel behind it.
//   TblICIS_Billing_Processed  the accounts under that code — one row per plan
//                              a chapel has already SERVICED. Many rows to one
//                              header; the header is where the code's own
//                              details live.
//   TblClaimsBilling           written when the processor creates the billing.
//                              This is the row that carries the BILLING NO, and
//                              it does not exist until that moment.
//   TblClaimsSP                written as each account is terminated INTO that
//                              billing no. One row per terminated plan.
//
// So the first two are read and the last two are written, which is why a billing
// with no `TblClaimsBilling` row is exactly what "For Process" means.
//
// The names are the source system's, hence `Tbl…` in the prose and the `Ref`-
// less record names here. See `service-payables-data` for the read model built
// on top of them.

/**
 * A row in `TblBillingHdr` — one chapel's period, under the code it is known by.
 *
 * ONE HEADER TO MANY PROCESSED ACCOUNTS. The C# calls `BillingCode` the primary
 * key of both this table and {@link IcisBillingProcessedRecord}, but the rules
 * describe the relationship as one-to-many, so it is a key here and a foreign
 * key there.
 */
export interface BillingHdrRecord {
  /** "DONSOL1AUG26" — chapel + cut + month + 2-digit year. Primary key. */
  billingCode: string;
  chapelCode: string;
  /** The chapel's name as this table carries it. */
  chapel: string;
  /** The company that owes the payable, e.g. "ST. PETER LIFE PLAN, INC.". */
  company: string;
  /**
   * The header's own status.
   *
   * STAND-IN VALUE. The column is in the structure; its code list is not, and
   * nothing reads it yet — where a billing has got to is answered by whether it
   * has a {@link ClaimsBillingRecord} and what has been signed on it, which is a
   * fact rather than a label. Seeded "PROCESSED" throughout until real codes
   * land.
   */
  status: string;
}

/**
 * A row in `TblICIS_Billing_Processed` — one plan a chapel has serviced.
 *
 * WHERE THE "FOR PROCESS" QUEUE COMES FROM. Every account listed there is a row
 * of this table: the service has been rendered and endorsed, and what is left is
 * to bill it. The chapel and the territory behind the queue are read off here
 * too, through {@link chapelCode}.
 *
 * IT IS AN ICIS TABLE AND IT DOES NOT JOIN. The columns name the plan holder,
 * the plan and the branches in TEXT rather than by key — `PolicyNo` is the LPA
 * number but there is no foreign key behind it, and `Planholder` is a NAME that
 * is deliberately independent of the `Planholder` table so the two can be
 * compared. That comparison is the name discrepancy: see `discrepancyFor` in
 * `service-payables-data`.
 */
export interface IcisBillingProcessedRecord {
  /** The {@link BillingHdrRecord} this account is billed under. */
  billingCode: string;
  /** The chapel that rendered the service. */
  chapelCode: string;
  dateOfDeath: string; // ISO
  /** The deceased. May be a different person from the plan holder. */
  deceasedName: string;
  /**
   * The plan holder AS ENDORSED — the name the chapel sent in.
   *
   * Independent of the `Planholder` table on purpose, which is what the C#
   * comment means by "independent for checking": an owned chapel endorses
   * through the system so its name is the plan's, and a franchise sends paper
   * carrying whatever was written at the counter.
   */
  planholder: string;
  /** The branch that collects on the plan. */
  phBranch: string;
  /** The branch that handled the claim — a branch code, not a chapel code. */
  servicingBranch: string;
  /** The LPA number. A `Planholder.lpaNo`, without the foreign key. */
  policyNo: string;
  /** The plan's description, e.g. "ST.GEORGE". */
  plan: string;
  /**
   * The CIS contract number — the column the source system queries this table
   * by, beside the billing code and the policy.
   *
   * DELIBERATELY EMPTY, for the reason `RefCreditOfService` is: no format for it
   * has been given, and a made-up key in a column that gets quoted back at the
   * source system is worse than an absent one. The read model falls back to
   * {@link policyNo} wherever a contract number is shown.
   */
  contractNo: string;
  /**
   * Who the service is credited to when it is not the chapel that rendered it.
   * Empty until `RefCreditOfService` has rows — see `RefCreditOfServiceRecord`.
   */
  creditOfService: string;
}

/**
 * A processed account with its chapel and its plan resolved (the mock DB does
 * the joins) — what a service payable is read from.
 */
export class BillingProcessed {
  constructor(
    private readonly record: IcisBillingProcessedRecord,
    /** The chapel that rendered the service. */
    readonly chapel: ChapelBranch | undefined,
    /**
     * The plan behind {@link policyNo} — absent when the number resolves to
     * nothing, which is itself a discrepancy rather than an error.
     */
    readonly planholder: Planholder | undefined,
  ) {}

  get billingCode(): string {
    return this.record.billingCode;
  }
  get chapelCode(): string {
    return this.record.chapelCode;
  }
  get dateOfDeathISO(): string {
    return this.record.dateOfDeath;
  }
  /**
   * When the chapel rendered the service — the date the billing period is
   * decided by. Derived, because the table has no column for it: see
   * {@link serviceDateFor}.
   */
  get serviceDateISO(): string {
    return serviceDateFor(this.record.dateOfDeath);
  }
  get deceasedName(): string {
    return this.record.deceasedName;
  }
  /** The name the chapel endorsed — see {@link IcisBillingProcessedRecord}. */
  get endorsedName(): string {
    return this.record.planholder;
  }
  get phBranch(): string {
    return this.record.phBranch;
  }
  get servicingBranch(): string {
    return this.record.servicingBranch;
  }
  get policyNo(): string {
    return this.record.policyNo;
  }
  get plan(): string {
    return this.record.plan;
  }
  /** The contract number, falling back to the policy while the column is empty. */
  get contractNo(): string {
    return this.record.contractNo || this.record.policyNo;
  }
  get creditOfService(): string {
    return this.record.creditOfService;
  }
}

/**
 * A row in `TblClaimsBilling` — the billing itself, written when it is created.
 *
 * THIS ROW IS THE BILLING NO. A chapel-period with no row here has not been
 * billed: that is what the For Process queue is, and it is why creating the
 * billing is what unlocks terminating the plans under it — a terminated plan is
 * posted against {@link billingNo}, so the number has to exist first.
 *
 * IT IS ALSO WHERE THE BILLING'S PROGRESS IS. Verified and approved are not a
 * status column, they are two signatures and their dates — which means a stage
 * cannot be set without saying who set it.
 */
export interface ClaimsBillingRecord {
  /** "B26004427" — B + 2-digit year + a per-year sequence. Primary key. */
  billingNo: string;
  /** Cash voucher number. Blank until accounting raises one. */
  cvNo: string;
  cvDate: string; // ISO
  /** The mortuary the billing is raised against — a `RefMortuary.mortCode`. */
  mortCode: string;
  /** The period in words, e.g. "AUGUST 1-7, 2026". */
  period: string;
  /** Blank until the billing is verified — that is what "For Verification" is. */
  verifiedBy: string;
  dateVerified: string; // ISO, blank while unverified
  approvedBy: string;
  dateApproved: string; // ISO, blank while unapproved
  /** The billing CODE — `TblBillingHdr.billingCode`. */
  cisBillingNo: string;
  cisUploadDate: string; // ISO
  company: string;
  /** The chapel CODE, despite the column's name. */
  chapel: string;
  /** How many accounts are on the billing. A string in the source. */
  noOfAccount: string;
  /**
   * Who created the billing.
   *
   * NOT IN THE SOURCE STRUCTURE. The table records who verified and who approved
   * but not who put it through, and the dashboard groups everything past For
   * Process by exactly that person. Kept here rather than read off the
   * `TblClaimsSP` rows underneath because a billing has one processor whether or
   * not it has any terminated accounts yet.
   */
  processedBy: string;
}

/**
 * A row in `TblClaimsSP` — one plan terminated into a billing.
 *
 * Written per account as the processor works down the billing, which is why the
 * service record's own fields are on it: the CSP code, the nature of service,
 * the wreath and the credit of service are what the processor filled in for THIS
 * plan, not for the billing.
 */
export interface ClaimsSpRecord {
  /** The claim this service answers — key and foreign key both. */
  claimNo: string;
  /** The CIS contract number — see `IcisBillingProcessedRecord.contractNo`. */
  cisContractNo: string;
  /** The chapel that rendered the service. */
  servicingChapel: string;
  /** Special (SC) or regular (RC) claim. */
  natureCode: string;
  /** The {@link ClaimsBillingRecord} this account was terminated into. */
  billingNo: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfDeath: string; // ISO
  mortCode: string;
  /**
   * The CSP code the service was charged under — a
   * {@link RefMortuaryCSPRecord}'s `cspCode`, derived from the plan's own
   * description and confirmed by the processor. Real since 2026-08-26; it was a
   * three-value stand-in for as long as no code list had been given.
   *
   * THE AMOUNT IS NOT ON THIS ROW, and that is the source structure's doing
   * rather than an omission here: `cspCode` and `mortCode` are both columns, and
   * `RefMortuaryCSPRate` prices the pair. What was posted is therefore
   * recoverable from what was written.
   */
  cspCode: string;
  creditOfService: string;
  isWithWreath: boolean;
  wreathAmt: number;
  /** The processor who terminated the plan. */
  auditUser: string;
  auditDate: string; // ISO
}
