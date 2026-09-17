import type {
  AccessUser,
  PermissionMap,
} from "../types";
import {
  ACCESS_MODULES,
  emptyPermissionMap,
} from "../data/access-modules";
import type { AccessGroup, GroupPresetMap, UserRoleMap } from "../types";

/**
 * Effective access for a set of roles: the union of every preset held. A
 * permission granted by any one role is granted, so roles only ever add.
 */
export function unionOf(
  roleCodes: readonly string[],
  presets: GroupPresetMap,
): PermissionMap {
  const union = emptyPermissionMap();
  roleCodes.forEach((code) => {
    const preset = presets[code];
    if (!preset) return;
    Object.keys(preset).forEach((permission) => {
      if (preset[permission]) union[permission] = true;
    });
  });
  return union;
}

/** Users currently holding `groupCode`. */
export function membersOf(
  groupCode: string,
  users: readonly AccessUser[],
  userRoles: UserRoleMap,
): AccessUser[] {
  return users.filter((user) => (userRoles[user.id] ?? []).includes(groupCode));
}

/** Per-module grant counts for one preset, used by the role card chips. */
export type ModuleContribution = {
  code: string;
  name: string;
  granted: number;
  total: number;
};

export function moduleContributions(
  permissions: PermissionMap,
): ModuleContribution[] {
  return ACCESS_MODULES.map((module) => ({
    code: module.code,
    name: module.name,
    granted: module.functions.filter((fn) => permissions[fn.code]).length,
    total: module.functions.length,
  }));
}

/**
 * Permissions `groupCode` is the *only* selected role to provide. Dropping the
 * role would remove exactly these, which is what makes it worth showing.
 */
export function uniqueContributionCount(
  groupCode: string,
  selectedCodes: readonly string[],
  presets: GroupPresetMap,
): number {
  const preset = presets[groupCode];
  if (!preset) return 0;

  const others = selectedCodes.filter((code) => code !== groupCode);
  const fromOthers = unionOf(others, presets);

  return Object.keys(preset).filter((code) => preset[code] && !fromOthers[code])
    .length;
}

/** True when two role selections hold the same codes, whatever their order. */
export function sameRoles(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((code, index) => code === right[index]);
}

/** Looks a group up by code, falling back to the first so the UI always has one. */
export function findGroup(
  groups: readonly AccessGroup[],
  code: string | null,
): AccessGroup | null {
  if (!groups.length) return null;
  return groups.find((group) => group.code === code) ?? groups[0];
}
