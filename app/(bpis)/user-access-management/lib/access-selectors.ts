import type {
  AccessDiff,
  AccessFilter,
  AccessFunction,
  AccessModule,
  PermissionMap,
} from "../types";
import { ACCESS_MODULES } from "../data/access-modules";

/** A module reduced to the functions that survive the search + filter. */
export type VisibleModule = {
  module: AccessModule;
  functions: AccessFunction[];
};

/** Grant/revoke counts for one module, used by its header summary. */
export type ModuleStats = {
  total: number;
  granted: number;
  isAll: boolean;
  isNone: boolean;
  addedCount: number;
  removedCount: number;
  changeCount: number;
};

/**
 * Pending edits between the saved baseline and the working draft, in
 * catalogue order so the confirmation list reads top-to-bottom like the page.
 */
export function computeDiff(
  base: PermissionMap,
  draft: PermissionMap,
): AccessDiff {
  const granted: AccessDiff["granted"] = [];
  const revoked: AccessDiff["revoked"] = [];

  ACCESS_MODULES.forEach((module) =>
    module.functions.forEach((fn) => {
      const was = !!base[fn.code];
      const now = !!draft[fn.code];
      if (was === now) return;

      const change = {
        code: fn.code,
        description: fn.description,
        moduleCode: module.code,
        moduleName: module.name,
      };

      if (now) granted.push({ ...change, kind: "grant" });
      else revoked.push({ ...change, kind: "revoke" });
    }),
  );

  return { granted, revoked };
}

/**
 * Modules matching the search text and filter. A module whose *name or code*
 * matches keeps all of its functions — searching "Payment" should show the
 * whole module, not nothing. Modules left with no functions drop out.
 */
export function filterModules(
  query: string,
  filter: AccessFilter,
  draft: PermissionMap,
): VisibleModule[] {
  const q = query.trim().toLowerCase();
  const visible: VisibleModule[] = [];

  ACCESS_MODULES.forEach((module) => {
    const moduleMatches =
      !!q &&
      (module.name.toLowerCase().includes(q) ||
        module.code.toLowerCase().includes(q));

    const functions = module.functions.filter((fn) => {
      const textMatches =
        !q ||
        moduleMatches ||
        fn.description.toLowerCase().includes(q) ||
        fn.code.toLowerCase().includes(q);
      if (!textMatches) return false;

      if (filter === "Assigned") return !!draft[fn.code];
      if (filter === "Not assigned") return !draft[fn.code];
      return true;
    });

    if (functions.length) visible.push({ module, functions });
  });

  return visible;
}

export function moduleStats(
  module: AccessModule,
  base: PermissionMap,
  draft: PermissionMap,
): ModuleStats {
  const total = module.functions.length;
  const granted = module.functions.filter((fn) => draft[fn.code]).length;
  const changed = module.functions.filter(
    (fn) => !!draft[fn.code] !== !!base[fn.code],
  );
  const addedCount = changed.filter((fn) => draft[fn.code]).length;

  return {
    total,
    granted,
    isAll: granted === total,
    isNone: granted === 0,
    addedCount,
    removedCount: changed.length - addedCount,
    changeCount: changed.length,
  };
}

/** "+3 −1" style summary of a module's pending edits. */
export function formatChangeLabel(added: number, removed: number): string {
  const parts: string[] = [];
  if (added) parts.push(`+${added}`);
  if (removed) parts.push(`\u2212${removed}`);
  return parts.join(" ");
}
