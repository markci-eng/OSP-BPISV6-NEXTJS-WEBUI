// The planholder as a claim reads it: the record, with the claim's corrections
// laid over it.
//
// THE RECORD IS NEVER CHANGED. A correction is carried on the claim — see
// `PlanholderCorrection` — so what the page shows is assembled here, per claim,
// from two things that both stay as they are: the record as filed, and the
// corrections against it. A reverted correction simply stops being laid over.

import {
  formatAgeOfDeath,
  fullYearsBetween,
  toSurnameFirst,
  type PersonName,
} from "../../../data";
import {
  CORRECTABLE_PLANHOLDER_FIELDS,
  type PlanholderCorrection,
  type PlanholderField,
  type PlanholderValues,
} from "../../claim-store";
import type { Planholder } from "../../claims-data";

/** What the record says, as the edit form holds it. */
export function planholderValuesOnFile(planholder: Planholder): PlanholderValues {
  const name = planholder.name;
  const dob = planholder.dateOfBirth;
  return {
    lastName: name?.lastName ?? "",
    firstName: name?.firstName ?? "",
    middleName: name?.middleName ?? "",
    suffix: name?.suffix ?? "",
    // The same slice the payee form takes of a birth date, so the two ISO
    // strings compare equal when nothing has changed.
    dateOfBirthISO: dob ? dob.toISOString().slice(0, 10) : "",
  };
}

/** The values the claim reads: each correction laid over the record. */
export function correctedValues(
  onFile: PlanholderValues,
  corrections: PlanholderCorrection[],
): PlanholderValues {
  const values = { ...onFile };
  for (const correction of corrections) values[correction.field] = correction.to;
  return values;
}

function nameOf(values: PlanholderValues): PersonName {
  return {
    firstName: values.firstName,
    middleName: values.middleName || undefined,
    lastName: values.lastName,
    suffix: values.suffix || undefined,
  };
}

/** "Dela Cruz, Juan Santos" — the card's heading, from whichever values apply. */
export function displayNameOf(values: PlanholderValues): string {
  return values.lastName ? toSurnameFirst(nameOf(values)) : "—";
}

/**
 * The planholder with the corrected name and birth date in place of the record's.
 *
 * A VIEW, NOT A COPY. It is the record with three getters shadowed — name, date
 * of birth, and the age that follows from it — and everything else read through
 * to the record underneath, so the card can be handed it exactly as it is handed
 * a planholder and draws nothing differently except those three.
 */
export function withValues(
  planholder: Planholder,
  values: PlanholderValues,
): Planholder {
  const dob = values.dateOfBirthISO ? new Date(values.dateOfBirthISO) : undefined;
  return Object.create(planholder, {
    name: { get: () => nameOf(values) },
    dateOfBirth: { get: () => dob },
    age: { get: () => (dob ? fullYearsBetween(dob, new Date()) : undefined) },
  }) as Planholder;
}

/** "42 yrs 7 mos 7 days" against the claim's date of death, or undefined. */
export function ageAtDeathOf(
  dateOfBirthISO: string,
  dateOfDeathISO: string,
): string | undefined {
  if (!dateOfBirthISO || !dateOfDeathISO) return undefined;
  return formatAgeOfDeath(new Date(dateOfBirthISO), new Date(dateOfDeathISO));
}

/** "43 yrs" today, or "—". */
export function ageOf(dateOfBirthISO: string): string {
  if (!dateOfBirthISO) return "—";
  return `${fullYearsBetween(new Date(dateOfBirthISO), new Date())} yrs`;
}

export const fieldLabel = (field: PlanholderField) =>
  CORRECTABLE_PLANHOLDER_FIELDS[field];
