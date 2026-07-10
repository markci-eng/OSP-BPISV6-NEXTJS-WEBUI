import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE, USER_COOKIE } from "./lib/session";
import { isRouteAllowed, homeRouteForRole } from "./lib/access-control";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Redirect already-authenticated users away from /login to their role home
  if (pathname === "/login" && token) {
    const session = await verifySession(token);
    if (session) {
      return NextResponse.redirect(
        new URL(homeRouteForRole(session.role), request.url),
      );
    }
  }

  // Protect all non-public paths
  if (!isPublicPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifySession(token);
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
      response.cookies.set(USER_COOKIE, "", { maxAge: 0, path: "/" });
      return response;
    }

    // Enforce role-based route access for page routes. API routes are only
    // session-gated (above) — their handlers own any finer authorization.
    if (
      !pathname.startsWith("/api") &&
      !isRouteAllowed(session.role, pathname)
    ) {
      return NextResponse.redirect(
        new URL(homeRouteForRole(session.role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|images/|icons/|documents/|pdf.worker.min.mjs).*)",
  ],
};
