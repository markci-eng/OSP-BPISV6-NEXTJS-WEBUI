// Accountable-documents inventory domain model + seed data.
// Ported from the "Document Management" design and adapted to the app.

export type DocUnit = "Pieces" | "Booklets";

export type DocStatus =
  | "Assigned"
  | "Unassigned"
  | "Unknown Employee"
  | "Blocked";

export type DocType =
  | "Service Invoice"
  | "Acknowledgement Receipt"
  | "Life Plan Application Form"
  | "Official Receipt"
  | "Collection Receipt";

export type TimelineType =
  | "assigned"
  | "reassign"
  | "block"
  | "used"
  | "expired";

export type TimelineEvent = {
  type: TimelineType;
  date: string;
  by: string;
  text: string;
};

export type Agent = {
  id: string;
  name: string;
  emp: string;
  branch: string;
};

export type Batch = {
  id: string;
  type: DocType;
  s: number;
  e: number;
  unit: DocUnit;
  expiry: string;
  bookletSize?: number;
};

export type DocumentRecord = {
  id: string;
  code: string;
  control: string;
  type: DocType;
  s: number;
  e: number;
  origS: number;
  origE: number;
  unit: DocUnit;
  assignedQty: number;
  remaining: number;
  status: DocStatus;
  agentId: string;
  assignedDate: string;
  by: string;
  expiry: string;
  bookletSize?: number | null;
  timeline: TimelineEvent[];
};

/** Reference "now" for expiry calculations (matches the design's sample data window). */
export const TODAY = new Date("2026-07-15T00:00:00");

export const AGENTS: Agent[] = [
  {
    id: "a1",
    name: "Maria Santos",
    emp: "EMP-1042",
    branch: "Makati Main",
  },
  {
    id: "a2",
    name: "Juan Dela Cruz",
    emp: "EMP-2087",
    branch: "Cebu",
  },
  {
    id: "a3",
    name: "Ana Reyes",
    emp: "EMP-1155",
    branch: "Quezon City",
  },
  {
    id: "a4",
    name: "Carlo Mendoza",
    emp: "EMP-3021",
    branch: "Davao",
  },
  {
    id: "a5",
    name: "Liza Bautista",
    emp: "EMP-1198",
    branch: "Iloilo",
  },
  {
    id: "a6",
    name: "Ramon Aquino",
    emp: "EMP-2234",
    branch: "Baguio",
  },
  {
    id: "a7",
    name: "Grace Villanueva",
    emp: "EMP-1076",
    branch: "Pasig",
  },
  {
    id: "a8",
    name: "Paolo Ramos",
    emp: "EMP-3145",
    branch: "Cagayan de Oro",
  },
];

export const BATCHES: Batch[] = [
  {
    id: "b1",
    type: "Service Invoice",
    s: 215001,
    e: 216000,
    unit: "Pieces",
    expiry: "2027-06-30",
  },
  {
    id: "b2",
    type: "Service Invoice",
    s: 216001,
    e: 216500,
    unit: "Pieces",
    expiry: "2027-06-30",
  },
  {
    id: "b3",
    type: "Acknowledgement Receipt",
    s: 504001,
    e: 506500,
    unit: "Booklets",
    expiry: "2027-01-31",
    bookletSize: 50,
  },
  {
    id: "b4",
    type: "Life Plan Application Form",
    s: 701001,
    e: 701500,
    unit: "Pieces",
    expiry: "2027-03-31",
  },
  {
    id: "b5",
    type: "Life Plan Application Form",
    s: 701501,
    e: 702000,
    unit: "Pieces",
    expiry: "2027-03-31",
  },
  {
    id: "b6",
    type: "Official Receipt",
    s: 902001,
    e: 903000,
    unit: "Pieces",
    expiry: "2026-11-30",
  },
  {
    id: "b7",
    type: "Collection Receipt",
    s: 302001,
    e: 304500,
    unit: "Booklets",
    expiry: "2027-01-31",
    bookletSize: 50,
  },
];

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

export function getAgent(id: string): Agent {
  return (
    AGENT_MAP.get(id) ?? {
      id: "",
      name: "—",
      emp: "",
      branch: "",
    }
  );
}

function addDays(s: string, n: number): string {
  const d = new Date(s + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// [code, control, type, start, end, unit, remaining, status, agentIndex, assignedDate, by, expiry, bookletSize]
type SeedRow = [
  string,
  string,
  DocType,
  number,
  number,
  DocUnit,
  number,
  DocStatus,
  number,
  string,
  string,
  string,
  number | null,
];

// ---------- formatting helpers ----------

export function fmt(n: number): string {
  return Number(n).toLocaleString("en-US");
}

export function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysTo(s: string): number {
  return Math.round(
    (new Date(s + "T00:00:00").getTime() - TODAY.getTime()) / 86400000,
  );
}

export type ExpiryState = "ok" | "near" | "expired";

export function expState(s: string): ExpiryState {
  const d = daysTo(s);
  if (d < 0) return "expired";
  if (d <= 30) return "near";
  return "ok";
}

export function seriesLabel(d: Pick<DocumentRecord, "s" | "e">): string {
  return `${d.s} – ${d.e}`;
}

export function booklets(qty: number, size?: number | null): number {
  return size ? Math.round(qty / size) : 0;
}

export function isActiveStatus(status: DocStatus): boolean {
  return status === "Assigned" || status === "Unknown Employee";
}
