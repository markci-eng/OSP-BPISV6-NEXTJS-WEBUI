// The demo user directory.
//
// HARDCODED ON PURPOSE, and in one place on purpose. There is no user service
// behind this app yet — the login route's own TODO says so — so every screen
// that needs a name, a role, a position or an office has been inventing one
// locally: the role came from an `if` chain in `lib/session.ts`, the greeting
// in `use-current-user.ts` fell back to a bare "Joyce", and the profile page
// carries a `PROFILE` const of its own. This file is what those agree on.
//
// THERE ARE NO PER-USER PASSWORDS, deliberately. Every account shares
// `DEMO_PASSWORD`, which is also the literal the sign-in screen sends for
// whatever is typed (see `login-page.tsx`). Keeping it a single constant rather
// than a field per record means this module can be imported by client code
// without shipping a password table to the browser — and it is honest about
// what this is. When a real auth API arrives, delete this module rather than
// growing a hashing scheme on top of it.
//
// AN UNLISTED ADDRESS STILL SIGNS IN, as `sales-agent` — exactly what the login
// route did before this file existed. Rejecting unknown addresses would be more
// realistic and would also break every ad-hoc address anyone is demoing with,
// so the seed adds data without taking access away. `isSeeded()` is the test
// for "this is an address we know something about".
//
// EDGE-SAFE: `lib/session.ts` imports this, and `proxy.ts` imports that, so
// this module must stay free of React, icons and Node built-ins.

import type { UserRole } from "./access-control";

/** The one password every seeded account accepts. See the file header. */
export const DEMO_PASSWORD = "splpi";

/** What an address that is not in {@link USERS} signs in as. */
export const FALLBACK_ROLE: UserRole = "sales-agent";

export interface SeedUser {
  email: string;
  /** Full name, as the header and profile card show it. */
  name: string;
  role: UserRole;
  /** Job title. Describes the person, not their permissions. */
  position: string;
  /**
   * The office they work out of.
   *
   * A LOCATION, NOT A ROLE. `use-current-user.ts` renders this under a pin, so
   * "Head Office" here is a claim about where someone sits — which is why it is
   * a field on the person rather than something derived from `role`, as it was
   * before this file existed.
   */
  branch: string;
  /** Employee / member code, matching the format the access directory uses. */
  memberCode: string;
  phone: string;
}

/** A seeded record, or one derived for an unlisted address. */
export type PublicUser = SeedUser;

/**
 * The accounts this build knows about.
 *
 * The addresses are the ones `lib/session.ts` has always recognised, so every
 * sign-in that worked before this file still works and lands on the same role.
 * `branch@` and `joycemb@` are one person with two addresses — the generic
 * branch login the sign-in screen's social buttons use, and her named one —
 * which is why both map to `branch` and carry the same record.
 */
export const USERS: readonly SeedUser[] = [
  {
    email: "branch@stpeter.com.ph",
    name: "Joyce Basilio-Ramos",
    role: "branch",
    position: "Branch Officer",
    branch: "Cebu — Mandaue",
    memberCode: "10118",
    phone: "+63 917 555 0118",
  },
  {
    email: "joycemb@stpeter.com.ph",
    name: "Joyce Basilio-Ramos",
    role: "branch",
    position: "Branch Officer",
    branch: "Cebu — Mandaue",
    memberCode: "10118",
    phone: "+63 917 555 0118",
  },
  {
    email: "bm@stpeter.com.ph",
    name: "Mark Cristian Ibe",
    role: "bm",
    position: "Branch Manager",
    branch: "Cebu — Mandaue",
    memberCode: "10001",
    phone: "+63 917 555 0001",
  },
  {
    email: "stl@stpeter.com.ph",
    name: "Jasmine Delos Reyes",
    role: "stl",
    position: "Sales Team Leader",
    branch: "Cebu — Mandaue",
    memberCode: "10247",
    phone: "+63 917 555 0247",
  },
  {
    email: "claims@stpeter.com.ph",
    name: "Grace Ann Tolentino",
    role: "claims",
    position: "Claims Officer",
    branch: "Head Office",
    memberCode: "10733",
    phone: "+63 917 555 0733",
  },
  {
    email: "amd@stpeter.com.ph",
    name: "Aileen Bautista",
    role: "amd",
    position: "Accounts Officer",
    branch: "Head Office",
    memberCode: "10455",
    phone: "+63 917 555 0455",
  },
  {
    email: "agent@stpeter.com.ph",
    name: "Renato Villanueva",
    role: "sales-agent",
    position: "Sales Agent",
    branch: "Davao — Matina",
    memberCode: "10382",
    phone: "+63 917 555 0382",
  },
  {
    email: "ortigas@stpeter.com.ph",
    name: "Paolo Mendoza",
    role: "branch",
    position: "Branch Officer",
    branch: "Manila — Ortigas",
    memberCode: "10612",
    phone: "+63 917 555 0612",
  },
];

/** Addresses are matched case-insensitively — people type them how they like. */
function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function findUserByEmail(email: string): SeedUser | undefined {
  const wanted = normalize(email);
  return USERS.find((user) => user.email === wanted);
}

export function isSeeded(email: string): boolean {
  return findUserByEmail(email) !== undefined;
}

/**
 * A name from an address, for an address the seed does not know.
 *
 * Mirrors osp-ui-kit's own fallback ("a.dela.cruz@…" → "A Dela Cruz") so the
 * kit's header and anything reading this never show two different names for
 * the same person.
 */
function nameFromEmail(email: string): string {
  return (normalize(email).split("@")[0] ?? "")
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

/**
 * Everything known about an address — seeded or not.
 *
 * Never returns undefined: an unlisted address is a real signed-in user here
 * (see the file header), so it gets a derived record rather than nothing. The
 * fields it cannot know are empty strings, which callers can test, rather than
 * invented values that would read as fact.
 */
export function resolveUser(email: string): PublicUser {
  const seeded = findUserByEmail(email);
  if (seeded) return seeded;

  return {
    email: normalize(email),
    name: nameFromEmail(email),
    role: FALLBACK_ROLE,
    position: "Sales Agent",
    branch: "Branch Office",
    memberCode: "",
    phone: "",
  };
}

/** The role an address signs in as. Unlisted addresses get {@link FALLBACK_ROLE}. */
export function getRoleForEmail(email: string): UserRole {
  return findUserByEmail(email)?.role ?? FALLBACK_ROLE;
}

/**
 * Whether these credentials are good enough to sign in.
 *
 * A SEEDED ADDRESS IS CHECKED; AN UNLISTED ONE IS WAVED THROUGH. That asymmetry
 * is the whole policy of this module in one function — see the file header for
 * why unlisted addresses are not rejected.
 */
export function verifyCredentials(email: string, password: string): boolean {
  if (!isSeeded(email)) return true;
  return password === DEMO_PASSWORD;
}
