import { mockCertificateRow } from "./regions";
import type {
  CofpBranch,
  CofpForPrinting,
  CofpMemo,
  CofpReplacementRequest,
  CofpReplacementSource,
  CofpView,
} from "./types";

/** The views whose rail lists branches (user, 2026-10-05). */
export type CofpBranchView = Extract<
  CofpView,
  "DEFICIENT" | "PRINTED" | "CONFISCATED"
>;

/** The branch pinned at the top of the branch list (user, 2026-10-05). */
export const COFP_PINNED_BRANCH_CODE = "SPFC";

export const isBranchView = (view: CofpView): view is CofpBranchView =>
  view === "DEFICIENT" || view === "PRINTED" || view === "CONFISCATED";

/**
 * How each branch view's MOCK figures are drawn: a salt so the two views do
 * not show the same count on a branch, a ceiling for the count, a tag for the
 * row ids, and an offset so their rows do not repeat each other's plan holders
 * (or the regions', which sit below 5000).
 */
const BRANCH_MOCK: Record<
  CofpBranchView,
  { salt: number; max: number; tag: string; offset: number }
> = {
  DEFICIENT: { salt: 0, max: 15, tag: "D", offset: 5000 },
  PRINTED: { salt: 7, max: 30, tag: "P", offset: 10000 },
  // Past the Add Special COFP candidates too, which start at 20000.
  CONFISCATED: { salt: 13, max: 12, tag: "C", offset: 30000 },
};

/**
 * How many certificates a branch has under a branch view — deficient,
 * printed, or confiscated (user, 2026-10-05).
 *
 * MOCK, and derived from the branch code so a branch shows the same figure on
 * every render — there is no source yet. Swap this for the source's own figure
 * when there is one. Every few branches comes out at zero, so the row's empty
 * state is exercised too.
 */
export function branchCountOf(view: CofpBranchView, branch: CofpBranch): number {
  const { salt, max } = BRANCH_MOCK[view];
  const seed = [...branch.code].reduce(
    (sum, char, i) => sum + char.charCodeAt(0) * (i + 1 + salt),
    0,
  );
  return seed % 4 === 0 ? 0 : (seed % max) + 1;
}

/**
 * The certificates a branch has under a branch view — MOCK, one row per
 * {@link branchCountOf}, so the table and the row's badge always agree. Built
 * by the same generator as For Printing's rows, so the lists carry the same
 * details.
 */
export function branchRowsOf(
  view: CofpBranchView,
  branch: CofpBranch,
): CofpForPrinting[] {
  const { tag, offset } = BRANCH_MOCK[view];
  const branchIndex = COFP_BRANCHES.indexOf(branch);

  return Array.from({ length: branchCountOf(view, branch) }, (_, i) => {
    const n = offset + branchIndex * 31 + i;
    const row = mockCertificateRow({
      id: `${branch.code}-${tag}${i + 1}`,
      code: branch.code,
      branch: branch.description,
      n,
      i,
    });
    if (view === "DEFICIENT") {
      return { ...row, reason: DEFICIENT_REASONS[n % DEFICIENT_REASONS.length] };
    }
    if (view === "CONFISCATED") {
      // MOCK (user, 2026-10-07): when it was confiscated — a few days apart
      // counting back from 2026-10-05 — and, for SPFC, the batch it came in.
      return {
        ...row,
        dateConfiscated: new Date(Date.UTC(2026, 9, 5 - i * 4 - (n % 3)))
          .toISOString()
          .slice(0, 10),
        batchNo: `CB-2026-${String(10 - Math.floor(i / 4)).padStart(3, "0")}`,
      };
    }
    return row;
  });
}

/**
 * Whether a branch has confiscated certificates still waiting to be confirmed
 * (user, 2026-10-07) — the rail tags it "With pending confirmation".
 *
 * MOCK, derived from the branch code like its count; only a branch with
 * confiscated certificates can have one pending.
 */
export function hasPendingConfirmation(branch: CofpBranch): boolean {
  if (branchCountOf("CONFISCATED", branch) === 0) return false;
  const seed = [...branch.code].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return seed % 3 === 0;
}

/**
 * Why a certificate is held under Deficient (user, 2026-10-07) — MOCK, until
 * the source says.
 */
const DEFICIENT_REASONS = [
  "INCOMPLETE ADDRESS",
  "UNPOSTED PAYMENT",
  "NAME DISCREPANCY",
  "MISSING BIRTHDATE",
  "UNDERPAYMENT ON LAST INSTALLMENT",
  "PENDING ACCOUNT TRANSFER",
];

/** How many Replacement requests the SPFC and Confiscated sources hold. */
const REPLACEMENT_FIXED_COUNT: Record<
  Exclude<CofpReplacementSource, "BRANCH">,
  number
> = { SPFC: 8, CONFISCATED: 11 };

/**
 * How many Replacement requests a branch has sent in (user, 2026-10-05) —
 * MOCK, derived from the branch code like {@link branchCountOf}, so a branch
 * keeps its figure on every render. Most branches have none.
 */
export function replacementCountOf(branch: CofpBranch): number {
  const seed = [...branch.code].reduce(
    (sum, char, i) => sum + char.charCodeAt(0) * (i + 19),
    0,
  );
  return seed % 3 === 0 ? (seed % 9) + 1 : 0;
}

/**
 * The Replacement requests from a source (user, 2026-10-05) — MOCK, built by
 * the same generator as the other lists, seeded past their offsets so they do
 * not repeat anyone already listed.
 *
 * - SPFC: requests raised by SPFC itself.
 * - CONFISCATED: certificates taken back and now to be reissued, from any
 *   branch.
 * - BRANCH: the picked branch's requests — none until one is picked.
 */
export function replacementRowsOf(
  source: CofpReplacementSource,
  branch?: CofpBranch,
): CofpReplacementRequest[] {
  if (source === "BRANCH") {
    if (!branch) return [];
    const branchIndex = COFP_BRANCHES.indexOf(branch);
    return Array.from({ length: replacementCountOf(branch) }, (_, i) => {
      const n = 50000 + branchIndex * 31 + i;
      return {
        ...mockCertificateRow({
          id: `${branch.code}-RB${i + 1}`,
          code: branch.code,
          branch: branch.description,
          n,
          i,
        }),
        dateRequested: mockDateRequested(n, i),
        // MOCK (user, 2026-10-07): most are for process, the rest pending or
        // denied.
        status: n % 4 === 1 ? "PENDING" : n % 5 === 2 ? "DENIED" : "FOR_PROCESS",
      };
    });
  }

  const offset = source === "SPFC" ? 40000 : 45000;
  return Array.from({ length: REPLACEMENT_FIXED_COUNT[source] }, (_, i) => {
    const from =
      source === "SPFC"
        ? COFP_BRANCHES[0]
        : COFP_BRANCHES[1 + ((i * 17) % (COFP_BRANCHES.length - 1))];
    const n = offset + i;
    return {
      ...mockCertificateRow({
        id: `${source}-R${i + 1}`,
        code: from.code,
        branch: from.description,
        n,
        i,
      }),
      dateRequested: mockDateRequested(n, i),
    };
  });
}

/**
 * When a mock Replacement request was raised — newest first down the list,
 * a few days apart counting back from 2026-10-05, steady across renders.
 */
function mockDateRequested(n: number, i: number): string {
  const daysBack = i * 3 + (n % 3);
  return new Date(Date.UTC(2026, 9, 5 - daysBack)).toISOString().slice(0, 10);
}

/** How many printed certificates one mock memo carries at most. */
const MEMO_SIZE = 5;

/**
 * The transmittal memos a branch's printed certificates went out under (user,
 * 2026-10-05) — newest first.
 *
 * MOCK: the branch's printed rows cut into runs of {@link MEMO_SIZE}, one memo
 * each, a week apart counting back from 2026-10-01. Derived from the branch so
 * a memo keeps its number and date on every render.
 */
export function printedMemosOf(branch: CofpBranch): CofpMemo[] {
  const rows = branchRowsOf("PRINTED", branch);
  const branchIndex = COFP_BRANCHES.indexOf(branch);
  const memoCount = Math.ceil(rows.length / MEMO_SIZE);

  // MOCK: every third branch's newest memo is still to be transmitted.
  const newestPending = branchIndex % 3 === 1;

  return Array.from({ length: memoCount }, (_, i) => {
    const seq = memoCount - i;
    const transmitted = new Date(Date.UTC(2026, 9, 1 - i * 7 - (branchIndex % 5)));
    const pendingTransmit = newestPending && i === 0;
    return {
      id: `${branch.code}-M${seq}`,
      branch: branch.code,
      memoNo: `CFPM-${String(branchIndex + 1).padStart(3, "0")}-${String(seq).padStart(4, "0")}`,
      dateTransmitted: transmitted.toISOString().slice(0, 10),
      pendingTransmit,
      rows: rows
        .slice((seq - 1) * MEMO_SIZE, seq * MEMO_SIZE)
        .map((row, j) => ({
          ...row,
          // Nothing is released from a memo that has not gone out yet.
          releasedTo: pendingTransmit
            ? undefined
            : RELEASED_TO[(branchIndex + seq + j) % RELEASED_TO.length],
        })),
    };
  });
}

/** Who a printed certificate was released to — MOCK (user, 2026-10-07). */
const RELEASED_TO = [
  "PLANHOLDER",
  "BRANCH CASHIER",
  "AUTHORIZED REPRESENTATIVE",
  "SALES AGENT",
  "BRANCH MANAGER",
];

/**
 * The codes of the branches with a memo still to be transmitted (user,
 * 2026-10-07) — what the Printed combo box highlights.
 */
let pendingTransmitCodes: Set<string> | undefined;
export function branchesPendingTransmit(): Set<string> {
  pendingTransmitCodes ??= new Set(
    COFP_BRANCHES.filter((branch) =>
      printedMemosOf(branch).some((memo) => memo.pendingTransmit),
    ).map((branch) => branch.code),
  );
  return pendingTransmitCodes;
}

/** A plan holder the Add Special COFP dialog can find (user, 2026-10-05). */
export interface CofpSpecialCandidate {
  lpaNo: string;
  /** Surname-first, the way the certificate prints it. */
  name: string;
  /** The plan holder's own branch — the Originating Branch. */
  branch: CofpBranch;
  /** The certificate as the lists draw it — what Add Confiscated COFP adds. */
  row: CofpForPrinting;
}

/** How many plan holders the mock search pool holds. */
const CANDIDATE_COUNT = 120;

/**
 * Plan holders the Add Special COFP dialog searches — MOCK, built by the same
 * generator as the lists, seeded past their offsets so they do not repeat
 * anyone already listed, and spread across {@link COFP_BRANCHES}.
 */
let candidates: CofpSpecialCandidate[] | undefined;
function specialCandidates(): CofpSpecialCandidate[] {
  candidates ??= Array.from({ length: CANDIDATE_COUNT }, (_, i) => {
    const branch = COFP_BRANCHES[(i * 7) % COFP_BRANCHES.length];
    const row = mockCertificateRow({
      id: `SPC-${i + 1}`,
      code: branch.code,
      branch: branch.description,
      n: 20000 + i,
      i,
    });
    return {
      lpaNo: row.lpaNo,
      name: `${row.lastName}, ${row.firstName} ${row.middleName}`,
      branch,
      row,
    };
  });
  return candidates;
}

/**
 * The plan holders whose LPA number or name holds every word of `query`,
 * case-blind. An empty query finds no one.
 */
export function searchSpecialCandidates(query: string): CofpSpecialCandidate[] {
  const words = query.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return specialCandidates().filter((candidate) => {
    const haystack = `${candidate.lpaNo} ${candidate.name}`.toUpperCase();
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * The branches the Deficient and Confiscated views list (user, 2026-10-05).
 *
 * Copied from the branch reference table as it stands — the descriptions keep
 * the table's own spelling (e.g. "SAN FERNADO LA UNION"), so a row here can be
 * matched against the source by eye.
 *
 * SPFC comes first, out of alphabetical order (user, 2026-10-05): the rail
 * pins it above the rest the way For Printing pins From COFP Replacement, and
 * being first it is also the branch picked on arrival.
 */
export const COFP_BRANCHES: CofpBranch[] = [
  { code: "SPFC", description: "ST.PETER FINANCE CORP" },
  { code: "ABRA", description: "ABRA" },
  { code: "ALABAT", description: "ALABAT" },
  { code: "ALAMIN", description: "ALAMINOS PANGASINAN" },
  { code: "ALFONS", description: "ALFONSO-TAGAYTAY" },
  { code: "AMD", description: "AMD" },
  { code: "ANGELE", description: "ANGELES" },
  { code: "ANTIPO", description: "ANTIPOLO" },
  { code: "APARRI", description: "APARRI" },
  { code: "ATIMON", description: "ATIMONAN" },
  { code: "BACALI", description: "BACOLOD 2" },
  { code: "BACOLO", description: "BACOLOD 1" },
  { code: "BACOOR", description: "BACOOR EAST" },
  { code: "BACOWE", description: "BACOOR WEST" },
  { code: "BAGUIO", description: "BAGUIO" },
  { code: "BALANG", description: "BALANGA" },
  { code: "BATANG", description: "BATANGAS" },
  { code: "BAYBAY", description: "BAYBAY" },
  { code: "BELAIR", description: "BEL-AIR, LAGUNA" },
  { code: "BICUTA", description: "BICUTAN" },
  { code: "BINANG", description: "BINANGONAN" },
  { code: "BINANL", description: "BIÑAN LAGUNA" },
  { code: "BOAC", description: "BOAC" },
  { code: "BOGO", description: "BOGO" },
  { code: "BONGAB", description: "BONGABONG" },
  { code: "BORONG", description: "BORONGAN" },
  { code: "BUHANG", description: "BUHANGIN" },
  { code: "BULAN", description: "BULAN" },
  { code: "BUTUAN", description: "BUTUAN EAST" },
  { code: "BUTUWE", description: "BUTUAN WEST" },
  { code: "CABANA", description: "CABANATUAN" },
  { code: "CABUYA", description: "CABUYAO" },
  { code: "CAGAYA", description: "CAGAYAN DE ORO WEST" },
  { code: "CAGAYE", description: "CAGAYAN DE ORO EAST" },
  { code: "CAINTA", description: "CAINTA" },
  { code: "CALAML", description: "CALAMBA LAGUNA" },
  { code: "CALAPA", description: "CALAPAN" },
  { code: "CALBAY", description: "CALBAYOG" },
  { code: "CALINA", description: "CALINAN" },
  { code: "CAMILI", description: "CAMILING" },
  { code: "CANDEL", description: "CANDELARIA" },
  { code: "CANDON", description: "CANDON" },
  { code: "CANLUB", description: "CANLUBANG" },
  { code: "CAPAS", description: "CAPAS" },
  { code: "CARCAR", description: "CARCAR" },
  { code: "CARLNO", description: "SAN CARLOS NEGROS OCCIDENTAL" },
  { code: "CATANA", description: "CATANAUAN" },
  { code: "CATARM", description: "CATARMAN" },
  { code: "CATBAL", description: "CATBALOGAN" },
  { code: "CAUAYA", description: "CAUAYAN" },
  { code: "CAVITE", description: "CAVITE" },
  { code: "CEBU", description: "CEBU DOWNTOWN" },
  { code: "CEBUAY", description: "CEBU AYALA" },
  { code: "CEBUUP", description: "CEBU UPTOWN" },
  { code: "CENBUL", description: "BALIUAG ( CENTRAL BULACAN)" },
  { code: "CLAIMS", description: "CLAIMS DEPARTMENT" },
  { code: "COGEO", description: "COGEO" },
  { code: "COMMON", description: "COMMONWEALTH" },
  { code: "CRUZLA", description: "STA. CRUZ LAGUNA" },
  { code: "CRUZMM", description: "STA. CRUZ" },
  { code: "CRUZZA", description: "OLONGAPO" },
  { code: "CUBAO", description: "CUBAO" },
  { code: "DAET", description: "DAET" },
  { code: "DAGUPA", description: "MANGALDAN PANGASINAN" },
  { code: "DALAGU", description: "DALAGUETE" },
  { code: "DANAO", description: "DANAO" },
  { code: "DASMAR", description: "DASMARIÑAS" },
  { code: "DAVAO", description: "DAVAO" },
  { code: "DIFFUN", description: "DIFFUN" },
  { code: "DIGOS", description: "DIGOS" },
  { code: "DINALU", description: "DINALUPIHAN" },
  { code: "DIPOLO", description: "DIPOLOG" },
  { code: "DUMAGU", description: "DUMAGUETE" },
  { code: "ECOMME", description: "ECOMMERCE SALES DEPARTMENT" },
  { code: "ERMITA", description: "ERMITA" },
  { code: "ERODRI", description: "E. RODRIGUEZ" },
  { code: "ESCALA", description: "ESCALANTE" },
  { code: "ESTORE", description: "ESTORE" },
  { code: "FAIRV2", description: "FAIRVIEW COMMONWEALTH" },
  { code: "GALERA", description: "PUERTO GALERA" },
  { code: "GATTAR", description: "GATTARAN" },
  { code: "GENSAN", description: "GENERAL SANTOS CITY" },
  { code: "GINGOO", description: "GINGOOG" },
  { code: "GMA", description: "GMA" },
  { code: "GOA", description: "GOA CAM" },
  { code: "GSCPIO", description: "GENERAL SANTOS PIONEER" },
  { code: "GUADAL", description: "GUADALUPE" },
  { code: "GUINOB", description: "GUINOBATAN" },
  { code: "GUMACA", description: "GUMACA" },
  { code: "HINIGA", description: "HINIGARAN" },
  { code: "HO", description: "HEAD OFFICE1" },
  { code: "HOCASH", description: "TREASURY HEAD OFFICE" },
  { code: "HOFW", description: "HEAD OFFICE - HOFW" },
  { code: "IBAZAM", description: "STA.CRUZ ZAMBALES" },
  { code: "ILAGAN", description: "ILAGAN" },
  { code: "ILIGA2", description: "ILIGAN 2" },
  { code: "ILIGAN", description: "ILIGAN" },
  { code: "ILOILO", description: "ILOILO" },
  { code: "IMUS", description: "IMUS" },
  { code: "INFANT", description: "INFANTA" },
  { code: "IPIL", description: "IPIL" },
  { code: "IRIGA", description: "IRIGA" },
  { code: "ITD", description: "MAIN OFFICE ITD SAMPLE DATABASE" },
  { code: "JOSEAN", description: "SAN JOSE ANTIQUE" },
  { code: "JOSEDE", description: "SAN JOSE DEL MONTE" },
  { code: "JOSEOM", description: "SAN JOSE OCCIDENTAL MINDORO" },
  { code: "JOSEPA", description: "JOSE PANGANIBAN" },
  { code: "JOSNUE", description: "SAN JOSE NUEVA ECIJA" },
  { code: "KABACA", description: "KABACAN" },
  { code: "KABANK", description: "KABANKALAN" },
  { code: "KALIBO", description: "KALIBO" },
  { code: "KALOO2", description: "CALOOCAN 2" },
  { code: "KALOO3", description: "CALOOCAN 3" },
  { code: "KALOOK", description: "CALOOCAN" },
  { code: "KAMUNI", description: "KAMUNING" },
  { code: "KATIPU", description: "KATIPUNAN" },
  { code: "KIDAPA", description: "KIDAPAWAN" },
  { code: "KORONA", description: "KORONADAL" },
  { code: "LA TRI", description: "LA TRINIDAD" },
  { code: "LABO", description: "LABO" },
  { code: "LAGRO", description: "LAGRO" },
  { code: "LANANG", description: "LANANG" },
  { code: "LAOAG", description: "LAOAG" },
  { code: "LAPU-L", description: "MANDAUE" },
  { code: "LAS PI", description: "LAS PIÑAS" },
  { code: "LASPI2", description: "LAS PIÑAS 2" },
  { code: "LEGASP", description: "LEGASPI" },
  { code: "LIBMAN", description: "LIBMANAN" },
  { code: "LINGAY", description: "LINGAYEN" },
  { code: "LIPA", description: "LIPA" },
  { code: "LOPEZ", description: "LOPEZ" },
  { code: "LUBAO", description: "GUAGUA" },
  { code: "LUCBAN", description: "LUCBAN" },
  { code: "LUCENA", description: "LUCENA" },
  { code: "LUPON", description: "MATI" },
  { code: "LUPONL", description: "LUPON" },
  { code: "MAASIN", description: "MAASIN" },
  { code: "MACTAN", description: "MACTAN" },
  { code: "MAKATI", description: "MAKATI" },
  { code: "MALAYB", description: "MALAYBALAY" },
  { code: "MALITA", description: "MALITA" },
  { code: "MALOLO", description: "MALOLOS" },
  { code: "MAMBUR", description: "MAMBURAO" },
  { code: "MANDAL", description: "PASIG" },
  { code: "MANGAG", description: "MANGAGOY" },
  { code: "MARAMA", description: "MARAMAG" },
  { code: "MARIKI", description: "MARIKINA" },
  { code: "MARIVE", description: "MARIVELES" },
  { code: "MASBAT", description: "MASBATE" },
  { code: "MATINA", description: "MATINA" },
  { code: "MEYCAU", description: "MEYCAUAYAN" },
  { code: "MIAGAO", description: "MIAG-AO" },
  { code: "MIDSAY", description: "MIDSAYAP" },
  { code: "MKTGBR", description: "E-LPA" },
  { code: "MOLO", description: "MOLO" },
  { code: "MONTAL", description: "MONTALBAN" },
  { code: "MUNTIN", description: "MUNTINLUPA" },
  { code: "NABUNT", description: "NABUNTURAN" },
  { code: "NAGA", description: "NAGA" },
  { code: "NARRA", description: "NARRA" },
  { code: "NASUGB", description: "NASUGBU" },
  { code: "NAVAL", description: "NAVAL" },
  { code: "NOVALI", description: "NOVALICHES" },
  { code: "ODIONG", description: "ODIONGAN" },
  { code: "ORMOC", description: "ORMOC" },
  { code: "OROQUI", description: "OROQUIETA" },
  { code: "ORTIGA", description: "ORTIGAS" },
  { code: "OZAMIS", description: "OZAMIS" },
  { code: "PAGADI", description: "PAGADIAN" },
  { code: "PALOMP", description: "PALOMPON" },
  { code: "PANABO", description: "PANABO" },
  { code: "PANIQU", description: "PANIQUI" },
  { code: "PARANA", description: "PARAÑAQUE" },
  { code: "PASAY", description: "PASAY" },
  { code: "PASSI", description: "PASSI" },
  { code: "PINAMA", description: "PINAMALAYAN" },
  { code: "POLANG", description: "POLANGUI" },
  { code: "QUEZAV", description: "MAYON" },
  { code: "ROOSEV", description: "ROOSEVELT" },
  { code: "ROSARI", description: "ROSARIO BATANGAS" },
  { code: "ROXAKA", description: "ROXAS CAPIZ" },
  { code: "ROXAPA", description: "PUERTO PRINCESA" },
  { code: "SAMPAL", description: "SAMPALOC" },
  { code: "SANFER", description: "SAN FERNANDO PAMPANGA" },
  { code: "SANFRA", description: "SAN FRANCISCO AGUSAN DEL SUR" },
  { code: "SANGAN", description: "SANGANDAAN" },
  { code: "SANJUA", description: "SAN JUAN" },
  { code: "SANMIG", description: "SAN MIGUEL BULACAN" },
  { code: "SANPAB", description: "SAN PABLO" },
  { code: "SANPED", description: "SAN PEDRO LAGUNA" },
  { code: "SANTIA", description: "SANTIAGO" },
  { code: "SARA", description: "SARA" },
  { code: "SFLU", description: "SAN FERNADO LA UNION" },
  { code: "SIPOCO", description: "SIPOCOT" },
  { code: "SNCARL", description: "SAN CARLOS PANGASINAN" },
  { code: "SOGOD", description: "SOGOD" },
  { code: "SOLANO", description: "SOLANO" },
  { code: "SORSOG", description: "SORSOGON" },
  { code: "SPMCQA", description: "QUEZON AVENUE" },
  { code: "STA.MA", description: "STA.MARIA BULACAN" },
  { code: "STA.ME", description: "STA.MESA" },
  { code: "STAROS", description: "STA. ROSA LAGUNA" },
  { code: "STOTOM", description: "STO. TOMAS" },
  { code: "SURIGA", description: "SURIGAO" },
  { code: "TABACO", description: "TABACO" },
  { code: "TACLOB", description: "TACLOBAN NORTH" },
  { code: "TACLOS", description: "TACLOBAN SOUTH" },
  { code: "TACURO", description: "TACURONG" },
  { code: "TAGBIL", description: "TAGBILARAN" },
  { code: "TAGBIM", description: "TAGBILARAN MEGA" },
  { code: "TAGUIG", description: "TAGUIG" },
  { code: "TAGUM", description: "TAGUM" },
  { code: "TALAVE", description: "TALAVERA" },
  { code: "TALIBO", description: "TALIBON" },
  { code: "TALISA", description: "TALISAY" },
  { code: "TANAUA", description: "TANAUAN" },
  { code: "TANAY", description: "TANAY" },
  { code: "TANDAG", description: "TANDAG" },
  { code: "TANJAY", description: "TANJAY" },
  { code: "TANZA", description: "TANZA" },
  { code: "TARLAC", description: "TARLAC" },
  { code: "TOLEDO", description: "TOLEDO" },
  { code: "TORIL", description: "TORIL" },
  { code: "TRECE", description: "TRECE MARTIRES" },
  { code: "TUBIGO", description: "TUBIGON" },
  { code: "TUGUEG", description: "TUGUEGARAO" },
  { code: "URDANE", description: "URDANETA PANGASINAN" },
  { code: "VALENC", description: "VALENCIA" },
  { code: "VALENZ", description: "VALENZUELA" },
  { code: "VICTOR", description: "VICTORIA" },
  { code: "VIGAN", description: "VIGAN" },
  { code: "VIRAC", description: "VIRAC" },
  { code: "ZAMBOA", description: "ZAMBOANGA WEST" },
  { code: "ZAMBOE", description: "ZAMBOANGA EAST" },
];

/**
 * The branches the Replacement view's Branch combo box offers (user,
 * 2026-10-05) — only those with a Replacement request, SPFC left out since it
 * has a button of its own.
 */
export const COFP_REPLACEMENT_BRANCHES: CofpBranch[] = COFP_BRANCHES.filter(
  (branch) =>
    branch.code !== COFP_PINNED_BRANCH_CODE && replacementCountOf(branch) > 0,
);
