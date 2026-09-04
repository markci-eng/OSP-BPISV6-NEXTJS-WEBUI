import type { PermissionMap } from "../types";
import { ACCESS_USERS, baselinePermissions } from "../data/access-users";

/**
 * In-memory mock "backend" for user permissions, mirroring
 * `approvals.store.ts`. Seeded from each user's profile, then mutated in place
 * by saves so a later read (or refetch) sees the persisted result.
 */
const store = new Map<string, PermissionMap>(
  ACCESS_USERS.map((user) => [user.id, baselinePermissions(user.profile)]),
);

export function readPermissions(userId: string): PermissionMap | undefined {
  const permissions = store.get(userId);
  return permissions ? { ...permissions } : undefined;
}

export function writePermissions(
  userId: string,
  permissions: PermissionMap,
): void {
  store.set(userId, { ...permissions });
}
