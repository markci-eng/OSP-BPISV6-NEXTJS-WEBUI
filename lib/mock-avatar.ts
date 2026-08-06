/**
 * Deterministically gives ~2/3 of ids a mock photo (by hash) so agent lists
 * and profile headers show a realistic mix of photos and initials, not
 * photos on everyone. Same id always resolves to the same photo/undefined.
 */
export function mockAvatarUrl(id: string): string | undefined {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 3 !== 0 ? `https://i.pravatar.cc/150?u=${id}` : undefined;
}
