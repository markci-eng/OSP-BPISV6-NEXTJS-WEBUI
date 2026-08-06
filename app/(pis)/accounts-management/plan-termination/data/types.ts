export type PlanTerminationStatus = "PENDING" | "APPROVED" | "DENIED";

export interface PlanTerminationRequest {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  terminationReason: string;
  refundAmount: number;
  terminationDate: string;
  requestDate: string;
  requester: string;
  status: PlanTerminationStatus;
}
