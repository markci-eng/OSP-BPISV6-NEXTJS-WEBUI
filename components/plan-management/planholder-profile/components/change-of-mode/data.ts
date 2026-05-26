import type { PlanDetails, PlanType } from "./change-mode.types";

export const PlanTypes : PlanType[] = [
    {
        plan_code: "G5M6",
        description: "St. Gregory",
        installment_no: 60,
        term: 5,
        mode: "Monthly",
        mop: 1,
        contract_price: 57000,
        total_amount_payable: 66000,
        installment_amount: 1100
    },
    {
        plan_code: "G5Q6",
        description: "St. Gregory",
        installment_no: 20,
        term: 5,
        mode: "Quarterly",
        mop: 2,
        contract_price: 57000,
        total_amount_payable: 62700,
        installment_amount: 3135
    },
    {
        plan_code: "G5S6",
        description: "St. Gregory",
        installment_no: 10,
        term: 5,
        mode: "Semi-Annual",
        mop: 3,
        contract_price: 57000,
        total_amount_payable: 60400,
        installment_amount: 6040
    },
    {
        plan_code: "G5A6",
        description: "St. Gregory",
        installment_no: 5,
        term: 5,
        mode: "Annual",
        mop: 4,
        contract_price: 57000,
        total_amount_payable: 57000,
        installment_amount: 11400
    },
    {
        plan_code: "LG5M10",
        description: "St. George",
        installment_no: 60,
        term: 5,
        mode: "Monthly",
        mop: 1,
        contract_price: 53000,
        total_amount_payable: 60000,
        installment_amount: 1000
    },
    {
        plan_code: "LG5Q10",
        description: "St. George",
        installment_no: 20,
        term: 5,
        mode: "Quarterly",
        mop: 2,
        contract_price: 53000,
        total_amount_payable: 58300,
        installment_amount: 2915
    },
    {
        plan_code: "LG5S10",
        description: "St. George",
        installment_no: 10,
        term: 5,
        mode: "Semi-Annual",
        mop: 3,
        contract_price: 53000,
        total_amount_payable: 56200,
        installment_amount: 5620
    },
    {
        plan_code: "LG5A10",
        description: "St. George",
        installment_no: 5,
        term: 5,
        mode: "Annual",
        mop: 4,
        contract_price: 53000,
        total_amount_payable: 53000,
        installment_amount: 10600
    }
];

export const PHPlans : PlanDetails[] = [
    {
        lpa_no: "L36447545F",
        plan_code: "G5M6",
        plan_type: "St. Gregory",
        mode: "Monthly",
        total_amount_payable: 66000,
        total_amount_paid: 39600,
        installment_no: 24,
        installment_amount: 1100,
        balance: 26400
    },
    {
        lpa_no: "L63454543I",
        plan_code: "G5M6",
        plan_type: "St. Gregory",
        mode: "Monthly",
        total_amount_payable: 66000,
        total_amount_paid: 6600,
        installment_no: 54,
        installment_amount: 1100,
        balance: 59400
    },
    {
        lpa_no: "L8567876I",
        plan_code: "LG5Q10",
        plan_type: "St. George",
        mode: "Quarterly",
        total_amount_payable: 58300,
        total_amount_paid: 17490,
        installment_no: 14,
        installment_amount: 2915,
        balance: 40810
    },
    
];