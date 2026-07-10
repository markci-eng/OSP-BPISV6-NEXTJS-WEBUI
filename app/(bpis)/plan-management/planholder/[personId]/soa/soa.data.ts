import type { SoaRecord } from "./soa.types";

// Mock SOA lookup, matching the rest of plan-management's data/*.ts convention
// until a real Statement of Account API is wired in. Planholder identity
// fields (name, LPA number, plan type) are intentionally NOT duplicated here
// — they're derived from `planholderLookup` at render time.
export const soaRecords: SoaRecord[] = [
  {
    personId: "PI10529",
    lpaNumber: "L25048596I",
    soaNumber: "SOA-2026-000381",
    billingPeriodStart: new Date("2026-01-05T00:00:00"),
    billingPeriodEnd: new Date("2027-01-05T00:00:00"),
    dueDate: new Date("2026-04-05T00:00:00"),
    amountDue: 53000,
    status: "unpaid",
    pdfUrl: "/documents/sample-soa.pdf",
  },
  {
    personId: "PI10532",
    lpaNumber: "L25053163I",
    soaNumber: "SOA-2026-000512",
    billingPeriodStart: new Date("2025-10-13T00:00:00"),
    billingPeriodEnd: new Date("2026-10-13T00:00:00"),
    dueDate: new Date("2026-10-13T00:00:00"),
    amountDue: 22800,
    status: "partial",
    pdfUrl: "/documents/sample-soa.pdf",
  },
  {
    personId: "PI10002",
    lpaNumber: "L25053168I",
    soaNumber: "SOA-2026-000634",
    billingPeriodStart: new Date("2025-04-24T00:00:00"),
    billingPeriodEnd: new Date("2026-04-24T00:00:00"),
    dueDate: new Date("2026-04-24T00:00:00"),
    amountDue: 0,
    status: "paid",
    pdfUrl: "/documents/sample-soa.pdf",
  },
];

export function findSoaRecordByPersonId(personId: string): SoaRecord | undefined {
  return soaRecords.find((record) => record.personId === personId);
}
