import { COFP_LOCATION_PATHS } from "./locations";
import type { CofpAddress, CofpForPrinting, CofpRegion } from "./types";

/**
 * The regions the For Printing view lists (user, 2026-10-02).
 *
 * Copied from the region reference table as it stands — the descriptions keep
 * the table's own spelling and abbreviations (e.g. "GATTAR", "PANGSINAN"), so a
 * row here can be matched against the source by eye.
 */
export const COFP_REGIONS: CofpRegion[] = [
  { code: "BT1", description: "DAET, IRIGA, JOSE PANGANIBAN, LABO, LIBMANAN, NAGA, SIPOCOT" },
  { code: "BT2", description: "LEGASPI, POLANGUI, TABACO, VIRAC" },
  { code: "CL1-1", description: "BALIUAG ( CENTRAL BULACAN),MALOLOS,MEYCAUAYAN,SAN MIGUEL BULACAN,STA.MARIA BULACAN" },
  { code: "CL1-2", description: "ANGELES,SAN FERNANDO PAMPANGA" },
  { code: "CL1-3", description: "BALANGA,DINALUPIHAN,MARIVELES,OLONGAPO,STA.CRUZ ZAMBALES" },
  { code: "CL2-1", description: "CAMILING,TARLAC" },
  { code: "CL2-2", description: "ALAMINOS PANGSINAN,SAN CARLOS PANGSINAN,URDANETA PANGSINAN,MANGALDAN PANGSINAN" },
  { code: "CLBZ1", description: "AGDANGAN,BOAC,CANDELARIA,CATANAUA,LUCBAN,LUCENA" },
  { code: "CLBZ2", description: "ATIMONAN,GUINAYANGAN,GUMACA,LOPEZ" },
  { code: "CLBZ3", description: "BATANGAS,LIPA,NASUGBU,ODIONGAN,ROSARIO BATANGAS,STO. TOMAS,TANAUAN" },
  { code: "CV1", description: "APARRI,GATTARAN,TUGUEGARAO" },
  { code: "CV2", description: "CAUAYAN, DIFFUN, ILAGAN, SANTIAGO, SOLANO" },
  { code: "CVR", description: "APARRI, GATTAR, TUGUEG, CAUAYA, DIFFUN, ILAGAN, SANTIA, SOLANO" },
  { code: "IR", description: "BAGUIO,LA TRI, SFLU, ABRA, CANDON, LAOAG, VIGAN" },
  { code: "IT1", description: "BAGUIO,LA TRINIDAD,SAN FERNANDO LA UNION" },
  { code: "IT2", description: "ABRA,LAOAG,VIGAN,CANDON" },
  { code: "MC1", description: "BUHANGIN, CALINAN, DAVAO, TORIL" },
  { code: "MC2", description: "DIGOS KABACAN, KIDAPAWAN" },
  { code: "MC3", description: "COTABATO, GENERAL SANTOS CITY, GENERAL SANTOS CITY 2, GLAN, KORONADAL, MIDSAYAP, TACURONG" },
  { code: "MC4", description: "BUTUAN EAST, BUTUAN WEST, SURIGAO" },
  { code: "MC5", description: "COMPOSTELA, MANGAGOY, NABUNTURAN, SAN FERNANDO AGUSAN DEL SUR, TANDAG" },
  { code: "MIMAROPA1", description: "BONGABONG,CALAPAN,MAMBURAO,PINAMALAYAN,PUERTO GALERA,SAN JOSE OCCIDENTAL MINDORO,VICTORIA" },
  { code: "MIMAROPA2", description: "NARRA,PUERTO PRINCESA,ROXAS PALAWAN" },
  { code: "MIMAROPA3", description: "CALAMBA LAGUNA,SAN PEDRO LAGUNA" },
  { code: "MIMAROPA4", description: "INFANTA,SAN PABLO,STA. CRUZ LAGUNA" },
  { code: "MN1", description: "BALINGASAG, CAGAYAN DE ORO EAST, GINGOOG" },
  { code: "MN2", description: "MALAYBALAY, MARAMAG, VALENCIA" },
  { code: "MW1", description: "MARANDING, MOLAVE, OZAMIS, PAGADIAN" },
  { code: "MW2", description: "DIPOLOG, OROQUIETA, SINDANGAN" },
  { code: "NCT1-1", description: "ANTIPOLO, BINANGONAN, COGEO, MARIKINA, MONTALBAN, TANAY" },
  { code: "NCT1-2", description: "CALOOCAN2, NOVALICHES, SANGANDAAN, VALENZUELA" },
  { code: "NCT1-3", description: "HEAD OFFICE1,CUBAO,QUEZON AVENUE, FAIRVIEW" },
  { code: "NCT2-1", description: "CALOOCAN1, ERMITA, SAMPALOC, SAN JUAN, STA. CRUZ MANILA" },
  { code: "NCT2-2", description: "MAYON, PASIG, STA. MESA" },
  { code: "NCT2-3", description: "GUADALUPE, MAKATI, MUNTINLUPA, TAGUIG" },
  { code: "NCT3-1", description: "BACOOR WEST, BACOOR EAST, BICUTAN, LAS PIÑAS, PARAÑAQUE, PASAY" },
  { code: "NCT3-2", description: "ALFONSO, CAVITE, DASMARIÑAS, GMA, IMUS, TRECE" },
  { code: "OS", description: "OS" },
  { code: "VC1", description: "VC1" },
  { code: "VC2", description: "DALAGU" },
  { code: "VC3", description: "VC3" },
  { code: "VER1", description: "TACLOBAN NORTH,TACLOBAN SOUTH,BORONGAN,CALBAYOG,CATARMAN,CATBALOGAN" },
  { code: "VER2", description: "BAYBAY,MAASIN,ORMOC,SOGOD,NAVAL,PALOMPON" },
  { code: "VW1-1", description: "BACOLOD 1, BACOLOD 2, HINIGARAN, KABANGKALAN" },
  { code: "VW1-2", description: "CADIZ, DUMAGUETE, ESCALANTE, SAN CARLOS NEGROS OCCIDENTAL, TANJAY" },
  { code: "VW2-1", description: "ILOILO, MIAG-AO, MOLO, PASSI, SAN JOSE ANTIQUE" },
  { code: "VW2-2", description: "IBAJAY, KALIBO, ROXAS CAPIZ, SARA, SIGMA" },
];

/**
 * The From COFP Replacement queue (user, 2026-10-05; first named "Special
 * Request") — replacement certificates to reprint, from any branch. Listed like a region so the rail,
 * the region card and the For Printing list all take it as they are, but
 * pinned above the regions and drawn to stand out.
 *
 * MOCK branches, a spread across regions, so its list reads as coming from
 * all over.
 */
export const COFP_SPECIAL_REQUEST: CofpRegion = {
  code: "SR",
  description: "CUBAO, MAKATI, BAGUIO, NAGA, ILOILO, DAVAO, TACLOBAN NORTH, LUCENA",
  special: true,
};

/**
 * The label a region is shown under — its code, or for the pinned queue
 * "From COFP Replacement" (renamed from "Special Request", user, 2026-10-05).
 */
export const regionLabelOf = (region: CofpRegion): string =>
  region.special ? "From COFP Replacement" : region.code;

/**
 * How many certificates a region has queued for printing (user, 2026-10-02).
 *
 * MOCK, and derived from the region code so a region shows the same figure on
 * every render. The COFP requests' branch codes do not line up with this table
 * yet, so there is nothing real to count; swap this for the source's own figure
 * when there is one. Every few regions comes out at zero, so the row's empty
 * state is exercised too.
 */
export function forPrintingCountOf(region: CofpRegion): number {
  const seed = [...region.code].reduce(
    (sum, char, i) => sum + char.charCodeAt(0) * (i + 1),
    0,
  );
  // Special Request always has a few waiting, so it is never an empty row.
  if (region.special) return (seed % 9) + 4;
  return seed % 5 === 0 ? 0 : (seed % 48) + 1;
}

/** A region's description split into its branches, one per comma. */
export function branchesOf(region: CofpRegion): string[] {
  return region.description
    .split(",")
    .map((branch) => branch.trim())
    .filter(Boolean);
}

// Name pools for the mock queue, of co-prime lengths so a long region does not
// repeat a plan holder every handful of rows.
const LAST_NAMES = ["DELA CRUZ", "SANTOS", "REYES", "GARCIA", "MENDOZA", "TORRES", "VILLANUEVA", "AQUINO", "NAVARRO", "BAUTISTA", "PASCUAL"];
const FIRST_NAMES = ["MARIA", "JOSE", "ANTONIO", "ROSARIO", "EDUARDO", "LETICIA", "RAMON", "CRISTINA", "FERNANDO", "MILAGROS", "ROGELIO", "BEATRIZ", "TEODORO"];
const MIDDLE_NAMES = ["CRUZ", "RAMOS", "LOPEZ", "FLORES", "GONZALES", "CASTILLO", "MERCADO"];
const STREETS = ["P. BURGOS ST.", "RIZAL AVENUE", "MABINI ST.", "QUEZON BLVD.", "BONIFACIO ST.", "ACACIA LANE"];
const PLANS = [
  { name: "ST. GREGORY", value: 47400 },
  { name: "ST. ANNE", value: 53000 },
  { name: "ST. FRANCIS", value: 100000 },
  { name: "ST. GEORGE", value: 38500 },
  { name: "ST. CLAIRE", value: 62750 },
];
const COVERAGES = ["MEMORIAL SERVICE ONLY", "MEMORIAL SERVICE WITH INTERMENT"];

/**
 * The certificates a region has queued for printing — MOCK, one row per
 * {@link forPrintingCountOf}, so the table and the row's badge always agree.
 *
 * Each row is filed under one of the region's own branches, and its address is
 * a real path through {@link COFP_LOCATIONS}, so the edit dialog opens with
 * every dropdown already on a value it lists. Every few rows carry a long
 * house number, so the table's wrapping is exercised; every few have none.
 */
export function forPrintingOf(region: CofpRegion): CofpForPrinting[] {
  const branches = branchesOf(region);
  // Special Request is not in the table — it seeds after the last region, so
  // its rows do not repeat any region's.
  const index = COFP_REGIONS.indexOf(region);
  const regionIndex = index < 0 ? COFP_REGIONS.length : index;

  return Array.from({ length: forPrintingCountOf(region) }, (_, i) =>
    mockCertificateRow({
      id: `${region.code}-${i + 1}`,
      code: region.code,
      branch: branches[i % branches.length],
      n: regionIndex * 53 + i,
      i,
    }),
  );
}

/**
 * One MOCK certificate row — shared by For Printing and Deficient, so both
 * lists carry the same details. `n` seeds every field so a row is the same on
 * every render; `i` is its place in its list, which picks the house-number
 * shape; `code` is the region or branch the CFP number is printed under.
 */
export function mockCertificateRow({
  id,
  code,
  branch,
  n,
  i,
}: {
  id: string;
  code: string;
  branch: string;
  n: number;
  i: number;
}): CofpForPrinting {
  const path = COFP_LOCATION_PATHS[n % COFP_LOCATION_PATHS.length];
  const houseNo =
    i % 4 === 0
      ? `UNIT ${(n % 30) + 1}, BLK ${(n % 12) + 1} LOT ${(n % 20) + 1}`
      : i % 3 === 0
        ? ""
        : String((n % 250) + 1);
  const plan = PLANS[n % PLANS.length];

  return {
    // CFP + the region's code + the year + a running number, the shape the
    // printed form carries ("CFPWT126-007077").
    cofpNo: `CFP${code.replace(/[^A-Z0-9]/g, "")}26-${String(7000 + n).padStart(
      6,
      "0",
    )}`,
    planName: plan.name,
    planValue: plan.value,
    coverage: COVERAGES[n % COVERAGES.length],
    fullPaidDate: `2026-${String((n % 9) + 1).padStart(2, "0")}-${String(
      (n % 27) + 1,
    ).padStart(2, "0")}`,
    id,
    branch,
    lpaNo: `L26${String(10000 + n).padStart(6, "0")}E`,
    lastName: LAST_NAMES[n % LAST_NAMES.length],
    firstName: FIRST_NAMES[n % FIRST_NAMES.length],
    middleName: MIDDLE_NAMES[n % MIDDLE_NAMES.length],
    address: { ...path, street: STREETS[n % STREETS.length], houseNo },
  };
}

/** An address on one line, house number first, the way it prints. */
export function formatAddress(address: CofpAddress): string {
  const head = [address.houseNo, address.street].filter(Boolean).join(" ");
  return [
    head,
    address.barangay && `BRGY. ${address.barangay}`,
    address.district,
    address.city,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");
}
