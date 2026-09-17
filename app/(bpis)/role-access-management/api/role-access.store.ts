import type { PermissionMap } from "../types";
import type { AccessGroup } from "../types";
import {
  ACCESS_GROUPS,
  BASELINE_USER_ROLES,
  baselineGroupPresets,
} from "../data/access-groups";

/**
 * In-memory mock "backend" for access groups, mirroring
 * `user-access.store.ts`. Seeded from the shipped presets, then mutated in
 * place by saves so a later read (or refetch) sees the persisted result.
 */
const groups: AccessGroup[] = ACCESS_GROUPS.map((group) => ({ ...group }));

const presets = new Map<string, PermissionMap>(
  Object.entries(baselineGroupPresets()),
);

const userRoles = new Map<string, string[]>(
  Object.entries(BASELINE_USER_ROLES).map(([userId, codes]) => [
    userId,
    [...codes],
  ]),
);

export function readGroups(): AccessGroup[] {
  return groups.map((group) => ({ ...group }));
}

export function readPreset(groupCode: string): PermissionMap | undefined {
  const preset = presets.get(groupCode);
  return preset ? { ...preset } : undefined;
}

export function readAllPresets(): Record<string, PermissionMap> {
  const all: Record<string, PermissionMap> = {};
  presets.forEach((preset, code) => {
    all[code] = { ...preset };
  });
  return all;
}

export function writePreset(
  groupCode: string,
  permissions: PermissionMap,
): void {
  presets.set(groupCode, { ...permissions });

  const group = groups.find((entry) => entry.code === groupCode);
  if (group) group.modified = "Just now";
}

export function addGroup(group: AccessGroup, permissions: PermissionMap): void {
  groups.push({ ...group });
  presets.set(group.code, { ...permissions });
}

export function hasGroup(groupCode: string): boolean {
  return groups.some((group) => group.code === groupCode);
}

export function readUserRoles(): Record<string, string[]> {
  const all: Record<string, string[]> = {};
  userRoles.forEach((codes, userId) => {
    all[userId] = [...codes];
  });
  return all;
}

export function writeUserRoles(userId: string, roleCodes: string[]): void {
  userRoles.set(userId, [...roleCodes]);
}
