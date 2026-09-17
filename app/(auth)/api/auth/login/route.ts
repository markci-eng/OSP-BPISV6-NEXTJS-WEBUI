import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  SESSION_COOKIE,
  USER_COOKIE,
  EMAIL_COOKIE,
  MAX_AGE,
} from "@/lib/session";
import { resolveUser, verifyCredentials } from "@/lib/users";

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
    //
    // Until then, `lib/users.ts` stands in for that API. It checks the password
    // of an address it knows and waves through one it does not — see its header
    // for why an unlisted address is still allowed to sign in.
    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    // The whole record, not just the role: the client has no other way to learn
    // the person's name, and without one the header greets everybody as the
    // same hardcoded placeholder.
    const user = resolveUser(email);
    const role = user.role;
    const token = await createSession(user.email, role);

    const response = NextResponse.json({ role, user });
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
    // Readable, unlike the session — it is the key client components look the
    // seed up by. See `EMAIL_COOKIE`'s own note on why that is not a hole.
    response.cookies.set(EMAIL_COOKIE, user.email, {
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
