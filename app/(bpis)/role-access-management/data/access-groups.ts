import type { PermissionMap } from "../types";
import {
  ACCESS_MODULES,
  emptyPermissionMap,
} from "../data/access-modules";
import type { AccessGroup, UserRoleMap } from "../types";

/**
 * The system this console administers. Written onto every access group header
 * record, and shown beside the AccessGroupCode in the group detail.
 */
export const SYSTEM_CODE = "BOS";

/** Every permission code in the catalogue, in catalogue order. */
export const ALL_PERMISSION_CODES: string[] = ACCESS_MODULES.flatMap((module) =>
  module.functions.map((fn) => fn.code),
);

/** Read permissions across every module — the auditor preset. */
const VIEW_ONLY_CODES = ALL_PERMISSION_CODES.filter((code) =>
  code.startsWith("vw_"),
);

/** Builds a permission map with exactly `codes` granted. */
export function presetFromCodes(codes: readonly string[]): PermissionMap {
  const permissions = emptyPermissionMap();
  codes.forEach((code) => {
    if (code in permissions) permissions[code] = true;
  });
  return permissions;
}

export const ACCESS_GROUPS: AccessGroup[] = [
  {
    code: "SYSADM",
    description: "System Administrator",
    system: true,
    modified: "02 Jun 2026",
    summary:
      "Unrestricted access to every module. Reserved for IT administration; membership is audited monthly.",
  },
  {
    code: "BRMGR",
    description: "Branch Manager",
    modified: "18 Aug 2026",
    summary:
      "Full oversight of a branch: dashboards, approvals, agent management and read access to plans.",
  },
  {
    code: "SLSSUP",
    description: "Sales Supervisor",
    modified: "11 Aug 2026",
    summary:
      "Manages a sales unit: agent profiles, document assignment and leaderboard visibility.",
  },
  {
    code: "CASHR",
    description: "Cashier",
    modified: "27 Jul 2026",
    summary:
      "Front-desk collection: posts payments, encodes deposit slips and prints statements.",
  },
  {
    code: "ACCTOFF",
    description: "Accounts Officer",
    modified: "05 Aug 2026",
    summary:
      "Account maintenance and disbursement: float accounts, transfers, credit memos and expenses.",
  },
  {
    code: "AUDIT",
    description: "Read-Only Auditor",
    modified: "22 Jun 2026",
    summary:
      "Sees everything, changes nothing. Every view permission across all eight modules.",
  },
  {
    code: "TRNEE",
    description: "Trainee",
    modified: "30 Aug 2026",
    summary: "Onboarding baseline: dashboard overview and agent lists only.",
  },
];

/** The permissions each seeded group grants. */
const GROUP_PERMISSION_CODES: Record<string, readonly string[]> = {
  SYSADM: ALL_PERMISSION_CODES,
  BRMGR: [
    "vw_acct",
    "vw_eff",
    "vw_sa_lb",
    "vw_mth_ns",
    "vw_doc_ra",
    "appr_doc",
    "deny_doc",
    "vw_emp_mv",
    "appr_emp",
    "deny_emp",
    "vw_sa_list",
    "vw_sa_prof",
    "edit_sa",
    "reorg_sa",
    "move_sa",
    "vw_sa_doc",
    "assign_doc",
    "reassign",
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_pln",
    "vw_ph_ben",
    "vw_ph_soa",
    "vw_ph_loan",
    "vw_ph_srv",
    "vw_ph_rop",
    "vw_pln_xfr",
    "print_soa",
    "vw_phid",
    "apply_com",
    "vw_drs",
    "vw_dep_slp",
    "vw_rf_exp",
    "vw_mcpr",
    "vw_float",
  ],
  SLSSUP: [
    "vw_acct",
    "vw_eff",
    "vw_sa_lb",
    "vw_mth_ns",
    "vw_sa_list",
    "vw_sa_prof",
    "edit_sa",
    "add_sa",
    "vw_sa_doc",
    "assign_doc",
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_pln",
    "print_soa",
  ],
  CASHR: [
    "vw_acct",
    "vw_sa_list",
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_soa",
    "pay_ph",
    "print_soa",
    "enc_lp_pay",
    "enc_ln_pay",
    "vw_drs",
    "enc_dep_slp",
    "vw_dep_slp",
  ],
  ACCTOFF: [
    "vw_acct",
    "vw_sa_list",
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_soa",
    "vw_ph_loan",
    "apply_loan",
    "apply_rop",
    "apply_clm",
    "apply_ri",
    "nxt_mth_ld",
    "vw_float",
    "assign_flt",
    "xfer_acct",
    "xfer_acct_ob",
    "req_cr_memo",
    "vw_rf_exp",
    "enc_rf_exp",
    "vw_mcpr",
    "disb_comte",
  ],
  AUDIT: VIEW_ONLY_CODES,
  TRNEE: ["vw_acct", "vw_sa_list"],
};

/** Seeded presets, keyed by AccessGroupCode. */
export function baselineGroupPresets(): Record<string, PermissionMap> {
  const presets: Record<string, PermissionMap> = {};
  ACCESS_GROUPS.forEach((group) => {
    presets[group.code] = presetFromCodes(
      GROUP_PERMISSION_CODES[group.code] ?? [],
    );
  });
  return presets;
}

/**
 * Which roles each user in the directory starts with. Two users hold more than
 * one role, because effective access is the union of every preset they hold.
 */
export const BASELINE_USER_ROLES: UserRoleMap = {
  u1: ["BRMGR"],
  u2: ["SLSSUP"],
  u3: ["CASHR"],
  u4: ["ACCTOFF", "CASHR"],
  u5: ["TRNEE"],
  u6: ["BRMGR", "AUDIT"],
};

/** AccessGroupCode rules, mirrored by the create-group dialog's validation. */
export const GROUP_CODE_PATTERN = /^[A-Z0-9_]{2,10}$/;
