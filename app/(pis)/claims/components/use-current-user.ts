"use client";

// Who is signed in, as much of it as the browser can actually see.
//
// `osp_session` carries the email and the role, but it is set `httpOnly` (see
// the login route), so `document.cookie` cannot read it — the kit's own
// navigation tries and silently falls back to a hardcoded name for the same
// reason. What IS readable is `osp_email`, which the same route sets beside it,
// and which is the key into `lib/users.ts`.
//
// THE SEED ANSWERS, RATHER THAN THIS FILE GUESSING. It used to hardcode "Joyce"
// for the name and derive the office from the ROLE — which is a claim about
// someone's permissions dressed up as a claim about where they sit, and the
// banner renders it under a location pin. Both are fields on the person now.
//
// A RENAME STILL WINS. The kit's profile screen writes `user-display-name` to
// localStorage; someone who has renamed themselves should keep seeing it, so it
// is preferred over the seed's name whenever it is set.
//
// Everything here degrades to a placeholder rather than an empty string: the
// callers render a greeting, and "Welcome back, !" is worse than a name that
// happens to be wrong.

import { useEffect, useState } from "react";

import { resolveUser } from "@/lib/users";

/** Matches the kit's own fallback, so the two never disagree on screen. */
const FALLBACK_NAME = "Joyce";
const FALLBACK_OFFICE = "Head Office";

/**
 * Spelled out rather than imported from `lib/session.ts`.
 *
 * That module carries the session signing code, and this one runs in the
 * browser — there is no reason to pull HMAC into the client bundle for the sake
 * of two string constants. They are the same two `osp_user` was already written
 * out for before this file read anything else.
 */
const EMAIL_COOKIE = "osp_email";
const USER_COOKIE = "osp_user";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

export interface CurrentUser {
  /** Given name alone — what a greeting uses. */
  firstName: string;
  /** Full name, as the seed records it or as they renamed themselves. */
  fullName: string;
  /** The office they work out of, for display. */
  branch: string;
  /** Job title. Empty when the address is not one the seed knows. */
  position: string;
  /**
   * Employee code — the closest thing to a person id the session can offer.
   *
   * Empty for an unlisted address. `territory-assignment-store.ts` keys
   * assignments on a display name and says in its own header that it does so
   * only because no id reaches it; this is the field that changes that.
   */
  memberCode: string;
  /** Role slug, the same value `osp_user` holds. */
  role: string;
}

/**
 * The signed-in user.
 *
 * Read in an effect rather than during render, and seeded with the same
 * placeholder the server would produce: cookies and `localStorage` do not exist
 * on the server, so reading them while rendering would make the first client
 * paint disagree with the markup React is hydrating against.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({
    firstName: FALLBACK_NAME,
    fullName: FALLBACK_NAME,
    branch: FALLBACK_OFFICE,
    position: "",
    memberCode: "",
    role: "",
  });

  useEffect(() => {
    const email = readCookie(EMAIL_COOKIE);
    const seeded = email ? resolveUser(email) : null;

    // The kit stores a full name ("Joyce Basilio-Ramos"); the greeting wants one
    // word of it.
    const displayName =
      localStorage.getItem("user-display-name")?.trim() ||
      seeded?.name ||
      FALLBACK_NAME;

    setUser({
      firstName: displayName.split(/\s+/)[0] || FALLBACK_NAME,
      fullName: displayName,
      branch: seeded?.branch || FALLBACK_OFFICE,
      position: seeded?.position ?? "",
      memberCode: seeded?.memberCode ?? "",
      // `osp_user` rather than the seed's role: switching roles re-signs the
      // session and rewrites that cookie without changing who is signed in, so
      // it is the one that stays right.
      role: readCookie(USER_COOKIE) ?? seeded?.role ?? "",
    });
  }, []);

  return user;
}
