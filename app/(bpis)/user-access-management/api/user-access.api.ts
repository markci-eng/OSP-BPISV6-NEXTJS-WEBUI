import { delay } from "@/lib/delay";
import type { AccessUser, PermissionMap } from "../types";
import { ACCESS_USERS } from "../data/access-users";
import { LOCKED_PERMISSIONS } from "../data/access-modules";
import { readPermissions, writePermissions } from "./user-access.store";

export async function getAccessUsers(): Promise<AccessUser[]> {
  await delay(300);

  return ACCESS_USERS;
}

export async function getUserPermissions(
  userId: string,
): Promise<PermissionMap> {
  await delay(850);

  const permissions = readPermissions(userId);
  if (!permissions) {
    throw new Error(`No access record found for user ${userId}`);
  }

  return permissions;
}

export async function saveUserPermissions(
  userId: string,
  permissions: PermissionMap,
): Promise<PermissionMap> {
  await delay(1000);

  if (!readPermissions(userId)) {
    throw new Error(`No access record found for user ${userId}`);
  }

  // Locked permissions are pinned by the security policy — never let a payload
  // revoke them, whatever the client sent.
  const next: PermissionMap = { ...permissions };
  LOCKED_PERMISSIONS.forEach((code) => {
    next[code] = true;
  });

  writePermissions(userId, next);

  return next;
}
