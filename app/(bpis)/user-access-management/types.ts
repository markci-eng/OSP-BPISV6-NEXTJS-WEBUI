/** A single grantable action inside a module. */
export type AccessFunction = {
  /** Stable permission code persisted against the user. */
  code: string;
  description: string;
};

/** A module groups the functions a user can be granted access to. */
export type AccessModule = {
  code: string;
  name: string;
  functions: AccessFunction[];
};

/** Permission code -> granted. Every known code is present, granted or not. */
export type PermissionMap = Record<string, boolean>;

/** Seeded access template a user starts from. */
export type AccessProfile =
  | "all"
  | "none"
  | "manager"
  | "supervisor"
  | "cashier"
  | "accounts";

export type AccessUserStatus = "Active" | "Suspended";

export type AccessUser = {
  id: string;
  name: string;
  memberCode: string;
  position: string;
  branch: string;
  status: AccessUserStatus;
  email: string;
  profile: AccessProfile;
};

/** Toolbar filter over the permission list. */
export type AccessFilter = "All" | "Assigned" | "Not assigned";

export type PermissionChange = {
  code: string;
  description: string;
  moduleCode: string;
  moduleName: string;
  kind: "grant" | "revoke";
};

/** Pending edits, split by direction. */
export type AccessDiff = {
  granted: PermissionChange[];
  revoked: PermissionChange[];
};
