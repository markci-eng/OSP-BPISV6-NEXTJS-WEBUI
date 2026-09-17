import type { AccessModule, PermissionMap } from "../types";

/**
 * The permission catalogue: every module of the branch console and the
 * functions that can be granted inside it. Module codes mirror the ones the
 * policy service persists, so they are stable identifiers — not display text.
 */
export const ACCESS_MODULES: AccessModule[] = [
  {
    code: "DB",
    name: "Dashboard",
    functions: [
      { code: "vw_acct", description: "View Account Overview" },
      { code: "vw_eff", description: "View Efficiency" },
      { code: "vw_sa_lb", description: "View Sales Agent Leaderboards" },
      { code: "vw_mth_ns", description: "View Monthly New Sales" },
    ],
  },
  {
    code: "APR",
    name: "Approvals",
    functions: [
      { code: "vw_doc_ra", description: "View Document Reassignment Requests" },
      { code: "appr_doc", description: "Approve Document Reassignment Request" },
      { code: "deny_doc", description: "Deny Document Reassignment Request" },
      { code: "vw_emp_mv", description: "View Employee Movement Requests" },
      { code: "appr_emp", description: "Approve Employee Movement Request" },
      { code: "deny_emp", description: "Deny Employee Movement Request" },
    ],
  },
  {
    code: "SAM",
    name: "Sales Agent Management",
    functions: [
      { code: "vw_sa_list", description: "View Sales Agent Lists" },
      { code: "vw_sa_prof", description: "View Sales Agent Profile" },
      { code: "edit_sa", description: "Edit Sales Agent Profile" },
      { code: "reorg_sa", description: "Reorganize Sales Agent" },
      { code: "move_sa", description: "Move Sales Agent" },
      { code: "add_sa", description: "Add Sales Agent" },
    ],
  },
  {
    code: "DOC",
    name: "Document Management",
    functions: [
      { code: "vw_sa_doc", description: "View Sales Agent Documents" },
      { code: "assign_doc", description: "Assign Document to Sales Agent" },
      { code: "reassign", description: "Reassign Document to Sales Agent" },
      { code: "block_doc", description: "Block Document" },
    ],
  },
  {
    code: "PLN",
    name: "Plan Management",
    functions: [
      { code: "vw_ph_list", description: "View Policyholder Lists" },
      { code: "vw_ph_prof", description: "View Policyholder Profile" },
      { code: "edit_ph", description: "Edit Policyholder Profile" },
      { code: "del_ph", description: "Delete Policyholder" },
      { code: "pay_ph", description: "Post Policyholder Payment" },
      { code: "apply_com", description: "Apply Commission" },
      { code: "apply_rop", description: "Apply Return of Premium" },
      { code: "apply_clm", description: "Apply Claim" },
      { code: "apply_loan", description: "Apply Policy Loan" },
      { code: "apply_csv", description: "Apply Cash Surrender Value" },
      { code: "apply_ri", description: "Apply Reinstatement" },
      { code: "apply_tor", description: "Apply Transfer of Rights" },
      { code: "print_soa", description: "Print Statement of Account" },
      { code: "vw_phid", description: "View Policyholder ID" },
      { code: "del_ph_pln", description: "Delete Policyholder Plan" },
      { code: "vw_ph_pln", description: "View Policyholder Plans" },
      { code: "vw_ph_ben", description: "View Policyholder Beneficiaries" },
      { code: "add_ph_ben", description: "Add Policyholder Beneficiary" },
      { code: "edit_ben", description: "Edit Beneficiary" },
      { code: "del_ph_ben", description: "Delete Policyholder Beneficiary" },
      {
        code: "vw_ph_soa",
        description: "View Policyholder Statement of Account",
      },
      { code: "vw_ph_hlth", description: "View Policyholder Health Records" },
      { code: "vw_ph_loan", description: "View Policyholder Loans" },
      { code: "vw_ph_srv", description: "View Policyholder Service Requests" },
      { code: "vw_ph_rop", description: "View Policyholder Return of Premium" },
      { code: "vw_pln_xfr", description: "View Plan Transfers" },
    ],
  },
  {
    code: "PAY",
    name: "Payment",
    functions: [
      { code: "enc_lp_pay", description: "Encode Lapsed Policy Payment" },
      { code: "enc_ln_pay", description: "Encode Loan Payment" },
      { code: "vw_drs", description: "View Daily Receipt Summary" },
      { code: "enc_dep_slp", description: "Encode Deposit Slip" },
      { code: "vw_dep_slp", description: "View Deposit Slip" },
    ],
  },
  {
    code: "DSB",
    name: "Disbursement",
    functions: [
      { code: "req_cr_memo", description: "Request Credit Memo" },
      { code: "disb_comte", description: "Disburse Committee Funds" },
      { code: "vw_rf_exp", description: "View Revolving Fund Expenses" },
      { code: "enc_rf_exp", description: "Encode Revolving Fund Expense" },
      {
        code: "vw_mcpr",
        description: "View Monthly Collection Performance Report",
      },
    ],
  },
  {
    code: "ACM",
    name: "Accounts Maintenance",
    functions: [
      { code: "nxt_mth_ld", description: "Run Next Month Loading" },
      { code: "vw_float", description: "View Float Accounts" },
      { code: "assign_flt", description: "Assign Float Account" },
      { code: "xfer_acct", description: "Transfer Account" },
      { code: "xfer_acct_ob", description: "Transfer Account (Onboarding)" },
    ],
  },
];

/**
 * Permissions the security policy pins on for every user. They render as
 * read-only and are skipped by the module-level select-all.
 */
export const LOCKED_PERMISSIONS: ReadonlySet<string> = new Set([
  "vw_acct",
  "vw_sa_list",
]);

export const TOTAL_PERMISSION_COUNT = ACCESS_MODULES.reduce(
  (total, module) => total + module.functions.length,
  0,
);

/** Every code known to the catalogue, denied. */
export function emptyPermissionMap(): PermissionMap {
  const map: PermissionMap = {};
  ACCESS_MODULES.forEach((module) =>
    module.functions.forEach((fn) => {
      map[fn.code] = false;
    }),
  );
  return map;
}

export function isLocked(code: string): boolean {
  return LOCKED_PERMISSIONS.has(code);
}

/** Number of granted permissions across the whole catalogue. */
export function countGranted(permissions: PermissionMap): number {
  return ACCESS_MODULES.reduce(
    (total, module) =>
      total + module.functions.filter((fn) => permissions[fn.code]).length,
    0,
  );
}
