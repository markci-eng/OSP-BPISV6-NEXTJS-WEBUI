import type { AccessProfile, AccessUser, PermissionMap } from "../types";
import { emptyPermissionMap, LOCKED_PERMISSIONS } from "./access-modules";

/** Directory of users an administrator can configure access for. */
export const ACCESS_USERS: AccessUser[] = [
  {
    id: "u1",
    name: "Mark Cristian Ibe",
    memberCode: "10001",
    position: "Branch Manager",
    branch: "Cebu — Mandaue",
    status: "Active",
    email: "mc.ibe@stpeter.com.ph",
    profile: "manager",
  },
  {
    id: "u2",
    name: "Jasmine Delos Reyes",
    memberCode: "10247",
    position: "Sales Supervisor",
    branch: "Cebu — Mandaue",
    status: "Active",
    email: "j.delosreyes@stpeter.com.ph",
    profile: "supervisor",
  },
  {
    id: "u3",
    name: "Renato Villanueva",
    memberCode: "10382",
    position: "Cashier",
    branch: "Davao — Matina",
    status: "Active",
    email: "r.villanueva@stpeter.com.ph",
    profile: "cashier",
  },
  {
    id: "u4",
    name: "Aileen Bautista",
    memberCode: "10455",
    position: "Accounts Officer",
    branch: "Manila — Ortigas",
    status: "Suspended",
    email: "a.bautista@stpeter.com.ph",
    profile: "accounts",
  },
  {
    id: "u5",
    name: "Paolo Mendoza",
    memberCode: "10612",
    position: "New Hire — Trainee",
    branch: "Manila — Ortigas",
    status: "Active",
    email: "p.mendoza@stpeter.com.ph",
    profile: "none",
  },
  {
    id: "u6",
    name: "Grace Ann Tolentino",
    memberCode: "10733",
    position: "Regional Director",
    branch: "National",
    status: "Active",
    email: "g.tolentino@stpeter.com.ph",
    profile: "all",
  },
];

/** Permissions each profile is seeded with, keyed by permission code. */
const PROFILE_PERMISSIONS: Record<
  Exclude<AccessProfile, "all" | "none">,
  string[]
> = {
  manager: [
    "vw_eff",
    "vw_sa_lb",
    "vw_mth_ns",
    "vw_doc_ra",
    "appr_doc",
    "vw_emp_mv",
    "appr_emp",
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
    "print_soa",
    "vw_phid",
    "vw_ph_rop",
    "vw_pln_xfr",
    "apply_com",
    "vw_drs",
    "vw_dep_slp",
    "vw_rf_exp",
    "vw_mcpr",
    "vw_float",
  ],
  supervisor: [
    "vw_eff",
    "vw_sa_lb",
    "vw_sa_prof",
    "edit_sa",
    "vw_sa_doc",
    "assign_doc",
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_pln",
    "print_soa",
  ],
  cashier: [
    "pay_ph",
    "print_soa",
    "vw_ph_soa",
    "enc_lp_pay",
    "enc_ln_pay",
    "vw_drs",
    "enc_dep_slp",
    "vw_dep_slp",
  ],
  accounts: [
    "vw_ph_list",
    "vw_ph_prof",
    "vw_ph_soa",
    "vw_ph_loan",
    "nxt_mth_ld",
    "vw_float",
    "assign_flt",
    "xfer_acct",
    "xfer_acct_ob",
    "req_cr_memo",
    "vw_rf_exp",
    "enc_rf_exp",
    "vw_mcpr",
  ],
};

/**
 * Seeds the permission map for a profile. Locked permissions are always on —
 * they are pinned by the security policy rather than by the profile.
 */
export function baselinePermissions(profile: AccessProfile): PermissionMap {
  const permissions = emptyPermissionMap();

  if (profile === "all") {
    Object.keys(permissions).forEach((code) => {
      permissions[code] = true;
    });
    return permissions;
  }

  LOCKED_PERMISSIONS.forEach((code) => {
    permissions[code] = true;
  });

  if (profile === "none") return permissions;

  PROFILE_PERMISSIONS[profile].forEach((code) => {
    permissions[code] = true;
  });

  return permissions;
}
