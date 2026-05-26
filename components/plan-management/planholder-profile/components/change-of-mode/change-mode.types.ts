
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

export type PlanType = {
    plan_code: string;
    description: string;
    installment_no: number;
    term: number;
    mode: string;
    mop: number;
    contract_price: number;
    total_amount_payable: number;
    installment_amount: number;
}

export type CheckedPlanType = {
    lpa_no: string;
    pending_installment: number;
    pending_installment_amount: number;
    new_plan_code: string;
    new_mode: string;
    new_installment_amount: number;
    new_installment_number_done: number;
    new_balance: number;
    new_tap: number;
}