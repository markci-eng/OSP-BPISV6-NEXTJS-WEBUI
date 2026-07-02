// Central role-based route access rules.
//
// This is the single source of truth for *what each role is allowed to load*.
// Keep it in sync with the navigation defined in
// `components/layout/data/sidebar-items.ts` (which is *what each role can see*).
//
// This module is intentionally free of React / icon imports so it can run in
// the Edge middleware runtime (see `middleware.ts`).

export type UserRole =
  | "branch"
  | "bm"
  | "stl"
  | "claims"
  | "amd"
  | "sales-agent";

/**
 * Routes every authenticated user may access regardless of role: account /
 * profile pages plus cross-cutting confirmation / printing / claim-form pages
 * that flows land on. Matched as prefixes.
 */
export const SHARED_ROUTES: string[] = [
  "/account",
  "/profile",
  "/success",
  "/printing",
  "/claim-application",
];

/**
 * Allowed route prefixes per role. A path is allowed when it equals a prefix
 * or starts with `prefix + "/"`, so nested / dynamic routes such as
 * `/plan-management/planholder/123/change-of-mode` are covered by
 * `/plan-management`.
 *
 * The root route "/" is deliberately NOT listed here — it is handled via
 * `ROLE_HOME` and matched exactly, otherwise "/" as a prefix would allow
 * every route.
 */
const ROLE_ROUTES: Record<UserRole, string[]> = {
  branch: [
    "/approvals",
    "/sales-force",
    "/document-management",
    "/plan-management",
    "/payment",
    "/disbursement",
    "/loan",
    "/accounts-maintenance",
    "/stl-approval",
    "/transaction",
  ],
  bm: ["/approvals"],
  stl: ["/approvals", "/stl-approval"],
  claims: ["/claims"],
  amd: ["/accountmanagement"],
  "sales-agent": [
    "/accounts-maintenance/mcpr",
    "/payment",
    "/disbursement/comte",
    "/plan-management",
    "/dc",
    "/transaction",
  ],
};

/** Landing route for each role (also the fallback when access is denied). */
export const ROLE_HOME: Record<UserRole, string> = {
  branch: "/",
  bm: "/",
  stl: "/",
  claims: "/claims",
  amd: "/accountmanagement",
  "sales-agent": "/",
};

export function isKnownRole(role: string | null | undefined): role is UserRole {
  return !!role && Object.prototype.hasOwnProperty.call(ROLE_ROUTES, role);
}

/** Home route for a role, or the login page when the role is unknown. */
export function homeRouteForRole(role: string | null | undefined): string {
  return isKnownRole(role) ? ROLE_HOME[role] : "/login";
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/**
 * Whether `pathname` is accessible to `role`.
 *
 * - Unknown roles are denied everything.
 * - The root route "/" is allowed only for roles whose home is "/".
 * - Shared routes are allowed for every known role.
 */
export function isRouteAllowed(
  role: string | null | undefined,
  pathname: string,
): boolean {
  if (!isKnownRole(role)) return false;

  if (pathname === "/") return ROLE_HOME[role] === "/";

  if (SHARED_ROUTES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return true;
  }

  return ROLE_ROUTES[role].some((prefix) => matchesPrefix(pathname, prefix));
}
