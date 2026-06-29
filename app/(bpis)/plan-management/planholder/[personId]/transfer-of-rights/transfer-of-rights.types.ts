export interface CheckedPlan {
  lpaNo: string;
  planType: string;
  isFullyPaid: boolean;
  reinstatementFee: number;
  reinstatementPayment: number;
}

export type PlanDetails = {
    lpa_no: string;
    plan_code: string;
    plan_type: string;
    mode: string;
    total_amount_payable: number;
    total_amount_paid: number;
    installment_no: number;
    balance: number;
    installment_amount: number;
}
