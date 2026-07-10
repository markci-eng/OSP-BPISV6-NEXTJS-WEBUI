export type SoaStatus = "paid" | "partial" | "unpaid";

export interface SoaRecord {
  personId: string;
  lpaNumber: string;
  soaNumber: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  amountDue: number;
  status: SoaStatus;
  pdfUrl: string;
  /** Demo-only flag to exercise the "Access restricted" state. */
  accessRestricted?: boolean;
}

export const SOA_STATUS_BADGE: Record<
  SoaStatus,
  { type: "success" | "warning" | "danger"; label: string }
> = {
  paid: { type: "success", label: "Paid" },
  partial: { type: "warning", label: "Partial" },
  unpaid: { type: "danger", label: "Unpaid" },
};
