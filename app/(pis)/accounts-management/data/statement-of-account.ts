// The Statement of Account, as PIS prints it — shared by Transfer,
// Reinstatement, CSV and Return of Premium, whose header buttons all open it.
//
// SAMPLE DATA. There is no SOA endpoint yet, so `buildStatementOfAccount` lays
// the record's own facts over a sample plan taken from a printed PIS statement.
// Whatever the record does not carry (mode, term, address, the ledger on
// Transfer) comes from that sample.

/** One receipt on the ledger. Dates are ISO (yyyy-mm-dd). */
export interface SoaPayment {
  payClass: string;
  planCode: string;
  orNo: string;
  /** The branch (or channel, e.g. ESTORE) that issued the receipt. */
  branch: string;
  orDate: string;
  amount: number;
  /** Absent on receipts that do not move the due date (e.g. RF). */
  nextDue?: string;
}

/** Dates are ISO (yyyy-mm-dd); an empty string is printed blank. */
export interface StatementOfAccount {
  contractNo: string;
  name: string;
  birthDate: string;
  branch: string;
  address: string;
  salesAgent: string;
  salesAgent2: string;

  planType: string;
  contractPrice: number;
  mode: string;
  termYears: number;
  instAmount: number;
  planTap: number;
  instNo: number;

  insurability: string;
  effectivity: string;
  newEffectivity: string;
  dueDate: string;
  accountStatus: string;
  terminationStatus: string;
  cofpNo: string;

  payments: SoaPayment[];

  insurance: number;
  others: number;
  miscellaneous: number;
  loan: number;
  totalPayments: number;
  balance: number;
  remarks: string;
}

/** Pay classes that are fees rather than payments toward the plan. */
const MISC_PAY_CLASSES = new Set(["RF"]);

const SAMPLE_PAYMENTS: SoaPayment[] = [
  { payClass: "NS", planCode: "LG5M10", orNo: "00019352", branch: "LAGRO", orDate: "2025-01-07", amount: 1000, nextDue: "2025-02-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00019362", branch: "LAGRO", orDate: "2025-02-07", amount: 1000, nextDue: "2025-03-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00019379", branch: "LAGRO", orDate: "2025-03-11", amount: 1000, nextDue: "2025-04-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "0002009763", branch: "ESTORE", orDate: "2025-04-08", amount: 1000, nextDue: "2025-05-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00061112", branch: "LAGRO", orDate: "2025-05-13", amount: 1000, nextDue: "2025-06-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00061129", branch: "LAGRO", orDate: "2025-06-04", amount: 1000, nextDue: "2025-07-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00094107", branch: "LAGRO", orDate: "2025-07-07", amount: 1000, nextDue: "2025-08-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00094128", branch: "LAGRO", orDate: "2025-08-08", amount: 1000, nextDue: "2025-09-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00094148", branch: "LAGRO", orDate: "2025-09-05", amount: 1000, nextDue: "2025-10-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00121172", branch: "LAGRO", orDate: "2025-10-14", amount: 1000, nextDue: "2025-11-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00121199", branch: "LAGRO", orDate: "2025-11-05", amount: 1000, nextDue: "2025-12-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00148619", branch: "LAGRO", orDate: "2025-12-02", amount: 1000, nextDue: "2026-01-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00173683", branch: "LAGRO", orDate: "2026-02-22", amount: 1000, nextDue: "2026-02-07" },
  { payClass: "DC", planCode: "LG5M10", orNo: "00173694", branch: "LAGRO", orDate: "2026-03-07", amount: 1000, nextDue: "2026-03-07" },
  { payClass: "RF", planCode: "LG5M10", orNo: "00231588", branch: "LAGRO", orDate: "2026-06-01", amount: 500 },
  { payClass: "RI", planCode: "LG5M10", orNo: "00231589", branch: "LAGRO", orDate: "2026-06-01", amount: 3000, nextDue: "2026-09-01" },
  { payClass: "DC", planCode: "LG5M10", orNo: "0003474745", branch: "ESTORE", orDate: "2026-07-07", amount: 1000, nextDue: "2026-10-01" },
  { payClass: "DC", planCode: "LG5M10", orNo: "0003529930", branch: "ESTORE", orDate: "2026-08-07", amount: 1000, nextDue: "2026-11-01" },
  { payClass: "DC", planCode: "LG5M10", orNo: "0003586874", branch: "ESTORE", orDate: "2026-09-09", amount: 1000, nextDue: "2026-12-01" },
];

const SAMPLE: Omit<
  StatementOfAccount,
  "totalPayments" | "balance" | "miscellaneous"
> = {
  contractNo: "L25074644I",
  name: "RICKY N. LOGRONO",
  birthDate: "1993-01-13",
  branch: "LAGRO",
  address: "-, OCAMPO DRIVE, INAYWAN, N/A, CEBU CITY, CEBU",
  salesAgent: "GINESSA RUPINTA",
  salesAgent2: "MARK JOSEPH MALAGA",

  planType: "ST. GEORGE",
  contractPrice: 53000,
  mode: "Monthly",
  termYears: 5,
  instAmount: 1000,
  planTap: 60000,
  instNo: 20,

  insurability: "INSURABLE",
  effectivity: "2025-01-07",
  newEffectivity: "2025-04-01",
  dueDate: "2026-12-01",
  accountStatus: "ACTIVE",
  terminationStatus: "NOT YET TERMINATED",
  cofpNo: "",

  payments: SAMPLE_PAYMENTS,

  insurance: 0,
  others: 0,
  loan: 0,
  remarks: "",
};

/**
 * The record's facts over the sample. Totals not given are worked out from the
 * ledger: fees (RF) count as Miscellaneous, everything else toward the plan,
 * and the balance is what is left of the TAP.
 */
export function buildStatementOfAccount(
  overrides: Partial<StatementOfAccount>,
): StatementOfAccount {
  const base = { ...SAMPLE, ...overrides };
  const sum = (rows: SoaPayment[]) =>
    rows.reduce((total, row) => total + row.amount, 0);

  const totalPayments =
    overrides.totalPayments ??
    sum(base.payments.filter((p) => !MISC_PAY_CLASSES.has(p.payClass)));

  return {
    ...base,
    totalPayments,
    miscellaneous:
      overrides.miscellaneous ??
      sum(base.payments.filter((p) => MISC_PAY_CLASSES.has(p.payClass))),
    balance: overrides.balance ?? Math.max(base.planTap - totalPayments, 0),
  };
}
