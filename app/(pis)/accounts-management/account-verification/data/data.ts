// The Account Verification records the list shows.
//
// Built from the planholder lookup, the same as the CSV and ROP records, so
// every row is a real planholder on file rather than an invented name.

import { planholderLookup } from "../../planholder-profile/data/planholder-lookup";
import type {
  AccountVerificationRecord,
  AccountVerificationView,
  ChapelCorrectionStatus,
} from "./types";

export const ACCOUNT_VERIFICATION_VIEWS: AccountVerificationView[] = [
  "For Verification",
  "Chapel Correction",
];

export const CHAPEL_CORRECTION_STATUSES: ChapelCorrectionStatus[] = [
  "For Process",
  "Pending",
];

const CHAPELS = [
  "St. Peter Chapel - Quezon Ave.",
  "St. Peter Chapel - Araneta Ave.",
  "St. Peter Chapel - Commonwealth",
  "St. Peter Chapel - Cebu",
  "St. Peter Chapel - Davao",
  "St. Peter Chapel - Zamboanga",
];

// Every third planholder is a chapel correction, alternating between the two
// piles; the rest wait for verification.
const ACCOUNT_VERIFICATION_RECORDS: AccountVerificationRecord[] =
  planholderLookup.map((planholder, index) => {
    const correction = index % 3 === 2;
    return {
      id: `${planholder.personId}-${planholder.lpaNumber}`,
      personId: planholder.personId,
      view: correction ? "Chapel Correction" : "For Verification",
      planholderName: `${planholder.lastName}, ${planholder.firstName}`,
      lpaNo: planholder.lpaNumber,
      chapel: CHAPELS[index % CHAPELS.length],
      status: correction
        ? CHAPEL_CORRECTION_STATUSES[Math.floor(index / 3) % 2]
        : "For Verification",
    };
  });

export function fetchAccountVerificationRecords(): Promise<
  AccountVerificationRecord[]
> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ACCOUNT_VERIFICATION_RECORDS), 600);
  });
}
