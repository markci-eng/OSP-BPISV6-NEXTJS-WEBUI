/**
 * Types for role and access group management: the permission vocabulary the
 * policy service speaks — modules, functions, and the maps a user or a group
 * is granted — and the access groups built on top of it.
 */

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

/**
 * A reusable permission preset. `AccessGroupCode` is the stable identifier the
 * policy service persists against a user, so it is never display text.
 *
 * System groups are shipped with the platform: they are rendered read-only and
 * cannot be edited or copied over, because the console relies on them existing
 * with a known shape.
 */
export type AccessGroup = {
  code: string;
  description: string;
  /** One-line explanation shown on the preset cards during assignment. */
  summary: string;
  system?: boolean;
  modified: string;
};

/** AccessGroupCode -> the permissions that group grants. */
export type GroupPresetMap = Record<string, PermissionMap>;

/** User id -> the AccessGroupCodes they hold. A user may hold several. */
export type UserRoleMap = Record<string, string[]>;

/** The base a newly created group starts from: blank, or an existing preset. */
export type NewGroupBase = "blank" | (string & {});

export type CreateGroupInput = {
  code: string;
  description: string;
  base: NewGroupBase;
};
