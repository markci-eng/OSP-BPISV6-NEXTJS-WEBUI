import { COFP_BRANCHES } from "../../certificateoffullpayment/data/branches";
import {
  COFP_REGIONS,
  branchesOf,
  forPrintingCountOf,
  mockCertificateRow,
} from "../../certificateoffullpayment/data/regions";
import type {
  CofpBranch,
  CofpRegion,
} from "../../certificateoffullpayment/data/types";
import type { CoicForPrinting, CoicMemo } from "./types";

/** The regions and branches are COFP's own — one reference table for both. */
export const COIC_REGIONS = COFP_REGIONS;
export const COIC_BRANCHES = COFP_BRANCHES;

/**
 * What every Confirmation of Cover prints the same (from the printed form,
 * user, 2026-10-06): the policyholder company, its group policies, the covers
 * and the rider.
 */
export const COIC_POLICY = {
  company: "St. Peter Life Plan, Inc.",
  groupPolicyNumbers: ["GTL-14-700000019392", "GCL-14-700000019414"],
  typesOfCover: ["Group Yearly Renewable Term Life", "Group Credit Life"],
  riders: ["Total and Permanent Disability Benefit Rider"],
} as const;

/**
 * A mock row with the COIC's own fields laid over it. `n` seeds them, as it
 * does the rest of the row, so a row is the same on every render.
 */
function coicRow(args: Parameters<typeof mockCertificateRow>[0]): CoicForPrinting {
  const { n } = args;
  return {
    ...mockCertificateRow(args),
    // CLT + the year + a running number — the printed form's "CLT126-019341".
    coicNo: `CLT126-${String(19000 + (n % 900000)).padStart(6, "0")}`,
    effectiveDate: `2026-${String((n % 9) + 1).padStart(2, "0")}-${String(
      (n % 27) + 1,
    ).padStart(2, "0")}`,
  };
}

/**
 * The certificates a region has queued for printing — MOCK, one row per
 * {@link forPrintingCountOf}, so the region row's badge and the region card's
 * figure agree with the table. Seeded past COFP's offsets so the plan holders
 * are not COFP's.
 */
export function coicForPrintingOf(region: CofpRegion): CoicForPrinting[] {
  const branches = branchesOf(region);
  const regionIndex = Math.max(COIC_REGIONS.indexOf(region), 0);

  return Array.from({ length: forPrintingCountOf(region) }, (_, i) =>
    coicRow({
      id: `COIC-${region.code}-${i + 1}`,
      code: region.code,
      branch: branches[i % branches.length],
      n: 70000 + regionIndex * 53 + i,
      i,
    }),
  );
}

/** How many printed certificates a branch has — MOCK, steady per branch. */
function printedCountOf(branch: CofpBranch): number {
  const seed = [...branch.code].reduce(
    (sum, char, i) => sum + char.charCodeAt(0) * (i + 23),
    0,
  );
  return seed % 4 === 0 ? 0 : (seed % 30) + 1;
}

/** How many printed certificates one mock memo carries at most. */
const MEMO_SIZE = 5;

/**
 * The transmittal memos a branch's printed certificates went out under —
 * newest first. MOCK, cut the way COFP's are: runs of {@link MEMO_SIZE}, a
 * week apart counting back from 2026-10-01.
 */
export function coicPrintedMemosOf(branch: CofpBranch): CoicMemo[] {
  const branchIndex = COIC_BRANCHES.indexOf(branch);
  const rows = Array.from({ length: printedCountOf(branch) }, (_, i) =>
    coicRow({
      id: `COIC-${branch.code}-P${i + 1}`,
      code: branch.code,
      branch: branch.description,
      n: 80000 + branchIndex * 31 + i,
      i,
    }),
  );
  const memoCount = Math.ceil(rows.length / MEMO_SIZE);

  return Array.from({ length: memoCount }, (_, i) => {
    const seq = memoCount - i;
    const transmitted = new Date(Date.UTC(2026, 9, 1 - i * 7 - (branchIndex % 5)));
    return {
      id: `COIC-${branch.code}-M${seq}`,
      branch: branch.code,
      memoNo: `CICM-${String(branchIndex + 1).padStart(3, "0")}-${String(seq).padStart(4, "0")}`,
      dateTransmitted: transmitted.toISOString().slice(0, 10),
      rows: rows.slice((seq - 1) * MEMO_SIZE, seq * MEMO_SIZE),
    };
  });
}
