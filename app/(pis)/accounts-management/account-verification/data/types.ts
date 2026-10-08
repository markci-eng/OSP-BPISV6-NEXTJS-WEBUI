/** The two queues the list card's header steps between. */
export type AccountVerificationView = "For Verification" | "Chapel Correction";

/** The two piles under Chapel Correction, picked with the buttons. */
export type ChapelCorrectionStatus = "For Process" | "Pending";

export type AccountVerificationStatus =
  | "For Verification"
  | ChapelCorrectionStatus;

export interface AccountVerificationRecord {
  id: string;
  /** The planholder on file, whose profile the right panel shows. */
  personId: string;
  view: AccountVerificationView;
  planholderName: string;
  lpaNo: string;
  chapel: string;
  status: AccountVerificationStatus;
}
