import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  verifySession,
  SESSION_COOKIE,
  USER_COOKIE,
  MAX_AGE,
} from "@/lib/session";
import { isKnownRole } from "@/lib/access-control";

// Demo-only: lets an already-authenticated user preview the app as a
// different role. Re-issues a freshly signed session so proxy.ts's
// route-gating (which trusts SESSION_COOKIE, not USER_COOKIE) honors it.
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { role } = await request.json();
  if (!isKnownRole(role)) {
    return NextResponse.json({ error: "Unknown role" }, { status: 400 });
  }

  const newToken = await createSession(session.email, role);

  const response = NextResponse.json({ role });
  response.cookies.set(SESSION_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });
  response.cookies.set(USER_COOKIE, role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });

  return response;
}
