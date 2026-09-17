import type { DepositHdr } from "@/app/(bpis)/payment/data/payment.types";

export type ApprovalStatus = "Pending" | "Approved" | "Denied";

export type ApprovalView =
  | "reassignment-doc"
  | "drs"
  | "movement-employees"
  | "reassignment-sa2"
  | "user-assignment";

export interface BaseApproval {
  status: ApprovalStatus;
  requestDate: string;
  requester: string;
}

export function getApprovalStatus(row: any): ApprovalStatus {
  return row.drs?.status ?? row.status;
}

export interface ReassignmentRequest extends BaseApproval {
  salesForceId: string;
  document: string;
  from: string;
  fromEmpCode: string;
  to: string;
  toEmpCode: string;
  series: string;
}

export interface DRSApproval extends BaseApproval {
  id: string;
  depositedBy: string;
  siNo: string;
  amount: number;
  date: string;
  branch: string;
  remarks: string;
  depositDateTime: string;
}

export interface SA2Reassignment extends BaseApproval {
  id: string;
  employee: string;
  fromManager: string;
  toManager: string;
  branch: string;
  date: string;
}

/**
 * A request to change the access groups a user holds.
 *
 * Assignment is not applied when it is made: what the user will hold is the
 * union of `requestedGroups`, and only once this row is approved. The group
 * codes are the policy service's own `AccessGroupCode`s, comma-separated
 * because the table filters and sorts them as text.
 */
export interface UserAssignmentRequest extends BaseApproval {
  id: string;
  user: string;
  memberCode: string;
  position: string;
  branch: string;
  /** Groups the user holds today. */
  currentGroups: string;
  /** Groups they would hold once approved. */
  requestedGroups: string;
  /** Permissions gained and lost by the change, e.g. "+21 / −0". */
  permissionEffect: string;
  date: string;
}

export interface EmployeeMovement extends BaseApproval {
  id: string;
  employee: string;
  currentPosition: string;
  newPosition: string;
  movementType: "Promotion" | "Demotion";
  date: string;
}

export type PaymentRecordApproval = {
  LPANo: string;
  name: string;
  SI: string;
  SIDate: string;
  SIAmount: string;
  InstNo: number;
  PayClass: string;
  TEPCV: string;
  TEDue: string;
  COMPCV: string;
  GrossCom: string;
  TaxCom: string;
  ComDue: string;
  AuditDate: string;
  AuditUser: string;
  EditDate: string;
  EditUser: string;
  SINo: string;
};

export interface DepositDtl {
  depositDateTime: string;
  SINo: string;
}

export interface DRSRecord {
  id: string;
  referenceNo: string;
  status: ApprovalStatus;
  createdAt: string;
}

export interface DepositDtlWithPayment {
  depositDtl: DepositDtl;
  payment: PaymentRecordApproval | null;
}

export interface DepositWithPayments {
  deposit: DepositHdr;
  details: DepositDtlWithPayment[];
}

export interface DRSWithDepositAndPayments {
  drs: DRSRecord;
  deposit: DepositWithPayments | null;
}

export function mapDRSToDepositAndPayments(
  drsList: DRSRecord[],
  depositHdrList: DepositHdr[],
  depositDtlList: DepositDtl[],
  paymentList: PaymentRecordApproval[],
): DRSWithDepositAndPayments[] {
  return drsList.map((drs) => {
    const matchedDeposit =
      depositHdrList.find((d) => d.name === drs.referenceNo) ?? null;

    if (!matchedDeposit) {
      return {
        drs,
        deposit: null,
      };
    }

    const matchedDepositDetails = depositDtlList.filter(
      (detail) => detail.depositDateTime === matchedDeposit.DepositDateTime,
    );

    const detailsWithPayments: DepositDtlWithPayment[] =
      matchedDepositDetails.map((detail) => {
        const matchedPayment =
          paymentList.find((payment) => payment.SINo === detail.SINo) ?? null;

        return {
          depositDtl: detail,
          payment: matchedPayment,
        };
      });

    return {
      drs,
      deposit: {
        deposit: matchedDeposit,
        details: detailsWithPayments,
      },
    };
  });
}
