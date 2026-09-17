import { NextResponse } from "next/server";
import { SESSION_COOKIE, USER_COOKIE, EMAIL_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(USER_COOKIE, "", { maxAge: 0, path: "/" });
  // Cleared with the rest of them, or the next person to sign in is looked up
  // as the last one until their own login overwrites it.
  response.cookies.set(EMAIL_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
