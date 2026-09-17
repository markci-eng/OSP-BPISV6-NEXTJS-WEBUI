import type {
  ProcessOverview,
  ProcessByType,
  QuotaAndCollections,
  StaffLeaderboardEntry,
  MonthlyProcessYear,
} from "@/app/(bpis)/data/dashboard/types";
import { getStaff } from "./utilities/territory-assignment-store";

export const processOverview: ProcessOverview = {
  newRequests: 28,
  inProcess: 14,
  completed: 97,
  pendingApproval: 8,
  prevNewRequests: 33,
  prevInProcess: 17,
  prevCompleted: 89,
  prevPendingApproval: 12,
};

export const processByType: ProcessByType[] = [
  { type: "Death", pending: 3, processing: 5, completed: 32 },
  { type: "WOI", pending: 2, processing: 3, completed: 21 },
  { type: "Dismemberment", pending: 1, processing: 2, completed: 14 },
  { type: "Service Payables", pending: 2, processing: 4, completed: 30 },
];

export const quotaAndCollections: QuotaAndCollections = {
  comQuota: 54200,
  comCollection: 31800,
  comAcctDue: 40,
  comAcctCollection: 26,
  nComQuota: 198750,
  nComCollection: 152300,
  nComAcctDue: 84,
  nComAcctCollection: 58,
};

/**
 * How many claims each name is shown having processed, longest bar first.
 *
 * THE COUNTS ARE INVENTED AND THE NAMES ARE NOT, which is the one thing to hold
 * in mind here. They are the ladder this board has always had — 27 down to 12,
 * a spread chosen so the bars are visibly different lengths — and they say
 * nothing whatever about the people they are now beside. Nobody's actual volume
 * is in this repo: the dashboard has no source, it is hardcoded (see CLAUDE.md).
 * Do not read a ranking off this and do not put it in front of the staff on it
 * as one.
 *
 * Seven entries rather than the ten it held, because the department has seven
 * people. The board draws whatever length it is given.
 */
const LEADERBOARD_COUNTS = [27, 24, 22, 20, 17, 15, 12];

/**
 * The claims department, ranked.
 *
 * DERIVED FROM THE ROSTER rather than retyped (user, 2026-09-14). The board held
 * ten invented names; these are the real department, and taking them from
 * `ROSTER` — the same list the territory ladders assign and `PROCESSORS` stamps
 * on billings — means a hire or a correction reaches this board without anybody
 * remembering it exists. It is the fourth place a name could have been copied
 * to, and copies are what put four spellings of one person on four screens.
 *
 * DEATH CLAIM FIRST, THEN PAYABLES, which is roster order and nothing more. The
 * pairing of a name to a count is arbitrary — see {@link LEADERBOARD_COUNTS}.
 */
export const staffLeaderboard: StaffLeaderboardEntry[] = [
  ...getStaff("DEATH_CLAIM"),
  ...getStaff("SERVICE_PAYABLE"),
].map((name, i) => ({ name, ns: LEADERBOARD_COUNTS[i] ?? 0 }));

export const monthlyProcesses: MonthlyProcessYear[] = [
  {
    year: "2026",
    data: [
      { month: "Jan", value: 91 },
      { month: "Feb", value: 84 },
      { month: "Mar", value: 78 },
      { month: "Apr", value: 96 },
      { month: "May", value: 88 },
      { month: "Jun", value: 97 },
      { month: "Jul", value: 0 },
      { month: "Aug", value: 0 },
      { month: "Sep", value: 0 },
      { month: "Oct", value: 0 },
      { month: "Nov", value: 0 },
      { month: "Dec", value: 0 },
    ],
  },
  {
    year: "2025",
    data: [
      { month: "Jan", value: 72 },
      { month: "Feb", value: 65 },
      { month: "Mar", value: 81 },
      { month: "Apr", value: 69 },
      { month: "May", value: 77 },
      { month: "Jun", value: 85 },
      { month: "Jul", value: 74 },
      { month: "Aug", value: 90 },
      { month: "Sep", value: 79 },
      { month: "Oct", value: 71 },
      { month: "Nov", value: 93 },
      { month: "Dec", value: 66 },
    ],
  },
  {
    year: "2024",
    data: [
      { month: "Jan", value: 54 },
      { month: "Feb", value: 48 },
      { month: "Mar", value: 61 },
      { month: "Apr", value: 57 },
      { month: "May", value: 63 },
      { month: "Jun", value: 59 },
      { month: "Jul", value: 68 },
      { month: "Aug", value: 64 },
      { month: "Sep", value: 58 },
      { month: "Oct", value: 55 },
      { month: "Nov", value: 71 },
      { month: "Dec", value: 76 },
    ],
  },
];
