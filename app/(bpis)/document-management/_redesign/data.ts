// Accountable-documents inventory domain model + seed data.
// Ported from the "Document Management" design and adapted to the app.

export type DocUnit = "Pieces" | "Booklets";

export type DocStatus =
  | "Assigned"
  | "Partially Assigned"
  | "Fully Used"
  | "Blocked"
  | "Expired";

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

const SEED_ROWS: SeedRow[] = [
  [
    "SI-2026-0007",
    "CN-100871",
    "Service Invoice",
    210001,
    210500,
    "Pieces",
    312,
    "Assigned",
    0,
    "2026-06-02",
    "Admin Cruz",
    "2026-08-05",
    null,
  ],
  [
    "SI-2026-0006",
    "CN-100862",
    "Service Invoice",
    209001,
    209500,
    "Pieces",
    180,
    "Partially Assigned",
    1,
    "2026-04-18",
    "Admin Lopez",
    "2027-02-28",
    null,
  ],
  [
    "AR-2026-0142",
    "CN-233110",
    "Acknowledgement Receipt",
    500001,
    502500,
    "Booklets",
    1600,
    "Assigned",
    2,
    "2026-05-20",
    "Admin Cruz",
    "2027-01-31",
    50,
  ],
  [
    "LPAF-2026-0031",
    "CN-771004",
    "Life Plan Application Form",
    700001,
    700300,
    "Pieces",
    210,
    "Blocked",
    3,
    "2026-03-10",
    "Admin Lopez",
    "2027-03-31",
    null,
  ],
  [
    "OR-2025-0910",
    "CN-905512",
    "Official Receipt",
    900001,
    900500,
    "Pieces",
    75,
    "Expired",
    4,
    "2025-06-01",
    "Admin Cruz",
    "2026-05-30",
    null,
  ],
  [
    "CR-2026-0055",
    "CN-300221",
    "Collection Receipt",
    300001,
    300500,
    "Pieces",
    0,
    "Fully Used",
    5,
    "2026-01-15",
    "Admin Lopez",
    "2026-12-31",
    null,
  ],
  [
    "SI-2026-0009",
    "CN-101003",
    "Service Invoice",
    211001,
    211500,
    "Pieces",
    500,
    "Assigned",
    6,
    "2026-07-01",
    "You (Admin)",
    "2027-06-30",
    null,
  ],
  [
    "AR-2026-0150",
    "CN-233240",
    "Acknowledgement Receipt",
    503001,
    503500,
    "Pieces",
    96,
    "Partially Assigned",
    7,
    "2026-05-05",
    "Admin Cruz",
    "2026-07-28",
    null,
  ],
  [
    "LPAF-2026-0040",
    "CN-771120",
    "Life Plan Application Form",
    700501,
    700900,
    "Pieces",
    280,
    "Assigned",
    0,
    "2026-06-20",
    "Admin Lopez",
    "2027-03-31",
    null,
  ],
  [
    "OR-2026-0120",
    "CN-906001",
    "Official Receipt",
    901001,
    901500,
    "Pieces",
    430,
    "Assigned",
    1,
    "2026-06-28",
    "Admin Cruz",
    "2026-11-30",
    null,
  ],
  [
    "CR-2026-0061",
    "CN-300880",
    "Collection Receipt",
    301001,
    301500,
    "Pieces",
    360,
    "Assigned",
    2,
    "2026-06-10",
    "Admin Lopez",
    "2027-01-31",
    null,
  ],
  [
    "SI-2026-0003",
    "CN-100540",
    "Service Invoice",
    208001,
    208500,
    "Pieces",
    150,
    "Blocked",
    3,
    "2026-02-14",
    "Admin Cruz",
    "2027-01-31",
    null,
  ],
  [
    "AR-2026-0130",
    "CN-232900",
    "Acknowledgement Receipt",
    502501,
    503000,
    "Pieces",
    500,
    "Assigned",
    4,
    "2026-07-05",
    "You (Admin)",
    "2027-04-30",
    null,
  ],
  [
    "LPAF-2026-0028",
    "CN-770800",
    "Life Plan Application Form",
    699501,
    699900,
    "Pieces",
    120,
    "Partially Assigned",
    5,
    "2026-03-22",
    "Admin Lopez",
    "2027-02-28",
    null,
  ],
  [
    "OR-2026-0100",
    "CN-905880",
    "Official Receipt",
    900601,
    900900,
    "Pieces",
    0,
    "Fully Used",
    6,
    "2026-02-01",
    "Admin Cruz",
    "2026-10-31",
    null,
  ],
  [
    "CR-2026-0070",
    "CN-301100",
    "Collection Receipt",
    301501,
    302000,
    "Pieces",
    410,
    "Assigned",
    7,
    "2026-06-30",
    "You (Admin)",
    "2027-05-31",
    null,
  ],
  [
    "SI-2026-0011",
    "CN-101200",
    "Service Invoice",
    212001,
    214500,
    "Booklets",
    2000,
    "Assigned",
    0,
    "2026-07-08",
    "You (Admin)",
    "2027-06-30",
    50,
  ],
  [
    "AR-2026-0155",
    "CN-233400",
    "Acknowledgement Receipt",
    503501,
    504000,
    "Pieces",
    210,
    "Assigned",
    1,
    "2026-06-15",
    "Admin Cruz",
    "2026-08-10",
    null,
  ],
];

export function seedDocuments(): DocumentRecord[] {
  return SEED_ROWS.map((r, i) => {
    const [
      code,
      control,
      type,
      s,
      e,
      unit,
      remaining,
      status,
      ai,
      assignedDate,
      by,
      expiry,
      bs,
    ] = r;
    const qty = e - s + 1;
    const ag = AGENTS[ai];

    const timeline: TimelineEvent[] = [
      {
        type: "assigned",
        date: assignedDate,
        by,
        text: `Assigned ${qty.toLocaleString()} ${unit.toLowerCase()} (${s}–${e}) to ${ag.name}`,
      },
    ];

    if (status === "Partially Assigned")
      timeline.push({
        type: "reassign",
        date: addDays(assignedDate, 22),
        by: "Admin Cruz",
        text: `Partial reassignment · ${(qty - remaining).toLocaleString()} pcs moved out`,
      });
    if (status === "Blocked")
      timeline.push({
        type: "block",
        date: addDays(assignedDate, 40),
        by: "Admin Lopez",
        text: "Blocked remaining series — Administrative Hold",
      });
    if (status === "Fully Used")
      timeline.push({
        type: "used",
        date: addDays(assignedDate, 180),
        by: "System",
        text: "All pieces consumed — series fully used",
      });
    if (status === "Expired")
      timeline.push({
        type: "expired",
        date: expiry,
        by: "System",
        text: "Series reached expiry date",
      });

    return {
      id: "d" + (i + 1),
      code,
      control,
      type,
      s,
      e,
      origS: s,
      origE: e,
      unit,
      assignedQty: qty,
      remaining,
      status,
      agentId: ag.id,
      assignedDate,
      by,
      expiry,
      bookletSize: bs,
      timeline,
    };
  });
}

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
  return status === "Assigned" || status === "Partially Assigned";
}
