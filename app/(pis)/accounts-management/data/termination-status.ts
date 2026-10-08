// Termination status as every Accounts Management screen shows it (user,
// 2026-10-08): "CODE - DESCRIPTION", worded exactly as the RefTermiStat table
// has it — e.g. "NT - NOT YET TERMINATED".
//
// The mock data reaches the screens in three shapes — the bare code ("RP"), the
// description in either case ("Not Yet Terminated", "SERVICED - ASSIGNED"), or
// already formatted — so this takes any of them and resolves it against the
// table. Anything the table does not know is shown as given, upper-cased.

import { refTermiStatSeed } from "@/app/(pis)/data/seed";

const BY_CODE = new Map(refTermiStatSeed.map((s) => [s.termiStatCode, s]));

// Keyed with the spacing around dashes evened out, so the table's own "USB-"
// typo and a tidied "USB -" both find the row.
const normalise = (s: string) => s.trim().toUpperCase().replace(/\s*-\s*/g, " - ");
const BY_DESCRIPTION = new Map(
  refTermiStatSeed.map((s) => [normalise(s.description), s]),
);

export function formatTerminationStatus(value: string | undefined): string {
  if (!value) return "";
  const raw = value.trim().toUpperCase();

  // Already "CODE - DESCRIPTION", or a bare code.
  const code = raw.split(/\s*-\s*/, 1)[0];
  const byCode = BY_CODE.get(code as (typeof refTermiStatSeed)[number]["termiStatCode"]);
  if (byCode && (raw === code || raw.startsWith(`${code} `) || raw.startsWith(`${code}-`))) {
    return `${byCode.termiStatCode} - ${byCode.description}`;
  }

  const byDescription = BY_DESCRIPTION.get(normalise(raw));
  if (byDescription) {
    return `${byDescription.termiStatCode} - ${byDescription.description}`;
  }

  return raw;
}
