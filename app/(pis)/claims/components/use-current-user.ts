"use client";

// Who is signed in, as much of it as the browser can actually see.
//
// Not as much as you would expect. `osp_session` carries the email and the
// role, but it is set `httpOnly` (see the login route), so `document.cookie`
// cannot read it — the kit's own navigation tries and silently falls back to a
// hardcoded name for the same reason. What IS readable is `osp_user`, which the
// same route sets `httpOnly: false` and which holds the role on its own, plus
// the display name the kit keeps in `localStorage`.
//
// So this reads those two and nothing else. Everything here degrades to a
// placeholder rather than an empty string: the one caller renders a greeting,
// and "Welcome back, !" is worse than a name that happens to be wrong.

import { useEffect, useState } from "react";

/** Matches the kit's own fallback, so the two never disagree on screen. */
const FALLBACK_NAME = "Joyce";

/**
 * Where a role works out of.
 *
 * A stand-in, and knowingly so: the session carries a ROLE, not a branch, so
 * there is no real branch to read. Replace this the moment the API returns one
 * — the banner is showing it as a location ("📍 Head Office"), which is a claim
 * about the person, not about their permissions.
 */
const OFFICE_BY_ROLE: Record<string, string> = {
  claims: "Head Office",
  amd: "Head Office",
  branch: "Branch Office",
  bm: "Branch Office",
  stl: "Branch Office",
  "sales-agent": "Branch Office",
};

const FALLBACK_OFFICE = "Head Office";

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
  /** The office they work out of, for display. See {@link OFFICE_BY_ROLE}. */
  branch: string;
}

/**
 * The signed-in user's given name and office.
 *
 * Read in an effect rather than during render, and seeded with the same
 * placeholder the server would produce: cookies and `localStorage` do not exist
 * on the server, so reading them while rendering would make the first client
 * paint disagree with the markup React is hydrating against.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({
    firstName: FALLBACK_NAME,
    branch: FALLBACK_OFFICE,
  });

  useEffect(() => {
    const displayName = localStorage.getItem("user-display-name")?.trim();
    const role = readCookie("osp_user");

    setUser({
      // The given name is the first word: the kit stores a full name
      // ("Joyce Basilio-Ramos") and the greeting wants one word of it.
      firstName: displayName?.split(/\s+/)[0] || FALLBACK_NAME,
      branch: (role && OFFICE_BY_ROLE[role]) || FALLBACK_OFFICE,
    });
  }, []);

  return user;
}
