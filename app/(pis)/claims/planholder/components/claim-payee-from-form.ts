// Turning the Add Payee form into a payee row.
//
// EXTRACTED (2026-09-08) so two screens can add a payee the same way. It was
// inline in `PlanholderClaimDetail`, which was fine while that was the only
// place a payee could be named; `/claims/death-claim` names them too, and the
// alternative was a second copy of the name assembly, the address assembly and
// the peso formatting — three chances for two screens to disagree about what a
// payee filed on the same claim looks like.
//
// PURE, and that is the whole point of the split: it takes what the form
// collected and returns the row, touching no state and no toast. Where the row
// then goes, and what is said about it, stays with the caller.

import { formatFiledDate, toFullName } from "../../../data";
import type { BeneficiaryPayout, ClaimPayee } from "../../claims-data";
import type { PayeeFormValues } from "./PlanholderPayeeAddDrawer";

export interface ClaimPayeeFromFormInput {
  values: PayeeFormValues;
  /**
   * The payout channels registered on the form — a list the section edits in
   * place rather than a field the form registers, which is why it arrives
   * separately.
   */
  payouts: BeneficiaryPayout[];
  /** The claim the payee is named on. */
  claimNo: string;
  /** How many payees the claim already has — the new row sits past the end. */
  existingCount: number;
}

/**
 * Build the payee row a filled-in Add Payee form describes.
 *
 * Returns `undefined` when the two fields the row is identified by are blank.
 * Those are guarded and the rest are not: a payee with no name is not a row at
 * all, where one missing an address or a channel is a row that can be completed
 * later.
 */
export function claimPayeeFromForm({
  values,
  payouts,
  claimNo,
  existingCount,
}: ClaimPayeeFromFormInput): ClaimPayee | undefined {
  const lastName = values.lastName.trim();
  const firstName = values.firstName.trim();
  if (!lastName || !firstName) return undefined;

  const middleName = values.middleName.trim();
  const suffix = values.suffix.trim();

  // Assembled the way every other name in claims is, rather than concatenated
  // here.
  const name = toFullName({
    firstName,
    middleName: middleName || undefined,
    lastName,
    suffix: suffix || undefined,
  });

  const address =
    [
      [values.lotBldgUnit.trim(), values.street.trim()].filter(Boolean).join(" "),
      values.barangay.trim() ? `Brgy. ${values.barangay.trim()}` : "",
      values.district.trim(),
      values.city.trim(),
      values.province.trim(),
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const amount = Number(values.amount) || 0;

  // A payee row shows ONE payout, so the first channel registered is the one it
  // is paid through — the same choice `toClaimPayees` makes when it picks the
  // active account off a person's list.
  const primary = payouts[0];

  return {
    // No payee record on file for one added in-session, hence the index past
    // the end and the empty person id.
    idx: existingCount + 1,
    claimNo,
    personId: "",
    name,
    relation: values.relation || "—",
    amount,
    amountDisplay:
      "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    birthDate: values.birthDate ? formatFiledDate(values.birthDate) : "—",
    birthDateISO: values.birthDate,
    address,
    contact: "—",
    isOnHold: values.isOnHold,
    payout: primary
      ? `${primary.channelName} ${primary.accountNoMasked}`
      : "—",
    channelName: primary?.channelName ?? "—",
    channelCode: primary?.channelCode ?? "",
    accountNo: primary?.accountNo ?? "—",
    accountNoMasked: primary?.accountNoMasked ?? "—",
    payoutBranch: "—",
  };
}
