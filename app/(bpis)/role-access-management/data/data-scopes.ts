import type { DataScopeLevel } from "../types";

/** One selectable area at a given data scope level. */
export type DataScopeArea = {
  code: string;
  name: string;
  /** The area one level up, e.g. a branch's territory. */
  parent?: string;
};

export const REGIONS: DataScopeArea[] = [
  { code: "NCR", name: "National Capital Region" },
  { code: "LUZ", name: "North & South Luzon" },
  { code: "VIS", name: "Visayas" },
  { code: "MIN", name: "Mindanao" },
];

export const TERRITORIES: DataScopeArea[] = [
  { code: "MNL-N", name: "Metro Manila North", parent: "NCR" },
  { code: "MNL-S", name: "Metro Manila South", parent: "NCR" },
  { code: "CLZ", name: "Central Luzon", parent: "LUZ" },
  { code: "STZ", name: "Southern Tagalog", parent: "LUZ" },
  { code: "CVS", name: "Central Visayas", parent: "VIS" },
  { code: "WVS", name: "Western Visayas", parent: "VIS" },
  { code: "DVO", name: "Davao Region", parent: "MIN" },
  { code: "NMN", name: "Northern Mindanao", parent: "MIN" },
];

export const BRANCHES: DataScopeArea[] = [
  { code: "ORT", name: "Manila — Ortigas", parent: "MNL-N" },
  { code: "QC", name: "Manila — Quezon City", parent: "MNL-N" },
  { code: "MKT", name: "Manila — Makati", parent: "MNL-S" },
  { code: "ALB", name: "Manila — Alabang", parent: "MNL-S" },
  { code: "SFP", name: "Pampanga — San Fernando", parent: "CLZ" },
  { code: "CLB", name: "Laguna — Calamba", parent: "STZ" },
  { code: "MND", name: "Cebu — Mandaue", parent: "CVS" },
  { code: "CBC", name: "Cebu — City", parent: "CVS" },
  { code: "ILO", name: "Iloilo — City", parent: "WVS" },
  { code: "MAT", name: "Davao — Matina", parent: "DVO" },
  { code: "CDO", name: "Cagayan de Oro", parent: "NMN" },
];

export const DATA_SCOPE_AREAS: Record<DataScopeLevel, DataScopeArea[]> = {
  region: REGIONS,
  territory: TERRITORIES,
  branch: BRANCHES,
};

/** Display name for any region, territory or branch code. */
export function areaName(code: string): string {
  return (
    [...REGIONS, ...TERRITORIES, ...BRANCHES].find((area) => area.code === code)
      ?.name ?? code
  );
}

/** Singular and plural nouns for each level, for labels and validation. */
export const DATA_SCOPE_NOUNS: Record<
  DataScopeLevel,
  { one: string; many: string }
> = {
  region: { one: "region", many: "regions" },
  territory: { one: "territory", many: "territories" },
  branch: { one: "branch", many: "branches" },
};
