import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  getRole,
  SESSION_COOKIE,
  USER_COOKIE,
  MAX_AGE,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // TODO: Replace with actual credential validation against your backend API
    // Example:
    // const authResp = await fetch("https://your-api/auth/login", {
    //   method: "POST",
    //   body: JSON.stringify({ email, password }),
    // });
    // if (!authResp.ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = await createSession(email);
    const role = getRole(email);

    const response = NextResponse.json({ role });
    response.cookies.set(SESSION_COOKIE, token, {
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
