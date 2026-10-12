import { delay } from "@/lib/delay";
import type { PermissionMap } from "../types";
import { LOCKED_PERMISSIONS } from "../data/access-modules";
import type { AccessGroup, CreateGroupInput } from "../types";
import { GROUP_CODE_PATTERN, presetFromCodes } from "../data/access-groups";
import { ACCESS_USERS } from "../data/access-users";
import {
  addGroup,
  hasGroup,
  readAllPresets,
  readGroups,
  readPreset,
  readUserRoles,
  writePreset,
  writeUserRoles,
} from "./role-access.store";

export async function getAccessGroups(): Promise<AccessGroup[]> {
  await delay(300);

  return readGroups();
}

export async function getGroupPresets(): Promise<Record<string, PermissionMap>> {
  await delay(300);

  return readAllPresets();
}

export async function getGroupPreset(
  groupCode: string,
): Promise<PermissionMap> {
  await delay(650);

  const preset = readPreset(groupCode);
  if (!preset) {
    throw new Error(`No access group found for code ${groupCode}`);
  }

  return preset;
}

export async function saveGroupPreset(
  groupCode: string,
  permissions: PermissionMap,
): Promise<PermissionMap> {
  await delay(950);

  if (!readPreset(groupCode)) {
    throw new Error(`No access group found for code ${groupCode}`);
  }

  // Locked permissions are pinned by the security policy — never let a payload
  // revoke them, whatever the client sent.
  const next: PermissionMap = { ...permissions };
  LOCKED_PERMISSIONS.forEach((code) => {
    next[code] = true;
  });

  writePreset(groupCode, next);

  return next;
}

export async function createAccessGroup({
  code,
  description,
  base,
}: CreateGroupInput): Promise<AccessGroup> {
  await delay(700);

  const normalized = code.trim().toUpperCase();
  const label = description.trim();

  if (!normalized) throw new Error("AccessGroupCode is required.");
  if (!GROUP_CODE_PATTERN.test(normalized)) {
    throw new Error("Use 2–10 characters: letters, numbers or underscore.");
  }
  if (hasGroup(normalized)) {
    throw new Error(`AccessGroupCode ${normalized} already exists.`);
  }
  if (!label) throw new Error("Description is required.");

  const permissions =
    base === "blank"
      ? presetFromCodes([])
      : (readPreset(base) ?? presetFromCodes([]));

  const seededFrom = readGroups().find((group) => group.code === base);

  const group: AccessGroup = {
    code: normalized,
    description: label,
    modified: "Just now",
    summary:
      base === "blank" || !seededFrom
        ? "New access group — no permissions assigned yet."
        : `Created from the ${seededFrom.description} preset.`,
  };

  addGroup(group, permissions);

  return group;
}

export async function getUserRoles(): Promise<Record<string, string[]>> {
  await delay(300);

  return readUserRoles();
}

export async function saveUserRoles(
  userId: string,
  roleCodes: string[],
): Promise<string[]> {
  await delay(950);

  if (!roleCodes.length) {
    throw new Error("A user must hold at least one role.");
  }

  const unknown = roleCodes.filter((code) => !hasGroup(code));
  if (unknown.length) {
    throw new Error(`Unknown access group(s): ${unknown.join(", ")}`);
  }

  writeUserRoles(userId, roleCodes);

  return [...roleCodes];
}

/**
 * Grants the roles an approved assignment request asked for.
 *
 * Keyed by member code rather than user id: the approvals queue holds what a
 * reviewer reads on the row, and the id the policy service files a user under
 * is not part of that.
 *
 * Nothing throws. An approval is the reviewer's decision on a queue that may
 * name a user who has since been removed, or a group that has since been
 * renamed; the decision itself must still record, so an assignment that cannot
 * be applied is skipped and reported rather than taking the action down.
 *
 * Returns the user id written to, or `null` when there was nothing to write.
 */
export function applyAssignedRoles(
  memberCode: string,
  roleCodes: string[],
): string | null {
  const user = ACCESS_USERS.find((entry) => entry.memberCode === memberCode);
  if (!user) return null;

  const known = roleCodes.filter((code) => hasGroup(code));
  if (!known.length) return null;

  writeUserRoles(user.id, known);

  return user.id;
}
