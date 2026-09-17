import { getRoleForEmail } from "./users";

export const SESSION_COOKIE = "osp_session";
export const USER_COOKIE = "osp_user";

/**
 * The signed-in address, readable by the browser.
 *
 * `SESSION_COOKIE` carries it too, but that one is `httpOnly` — so client
 * components wanting the person's name, position or office have nothing to look
 * them up by, and have been falling back to placeholders instead. This is that
 * key and nothing else.
 *
 * IT IS NOT A CREDENTIAL. Anything can write it; `proxy.ts` trusts only the
 * signed session for who someone is and what they may load.
 */
export const EMAIL_COOKIE = "osp_email";

export const MAX_AGE = 8 * 60 * 60; // 8 hours

const SECRET =
  process.env.SESSION_SECRET ?? "dev-secret-do-not-use-in-production";

export interface SessionPayload {
  email: string;
  role: string;
  exp: number;
}

/**
 * The role an address signs in as.
 *
 * The addresses live in `lib/users.ts` now, alongside the name, position and
 * office that belong to the same person, rather than in a list here that knew
 * only half of each record. The mapping is unchanged, including the
 * `sales-agent` fallback for an address the seed has never heard of.
 */
export function getRole(email: string): string {
  return getRoleForEmail(email);
}

function base64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padding));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createSession(
  email: string,
  role: string = getRole(email),
): Promise<string> {
  const payload: SessionPayload = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const json = base64urlEncode(JSON.stringify(payload));
  const sig = await hmacSign(json);
  return `${json}.${sig}`;
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const json = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const expected = await hmacSign(json);
    if (expected !== sig) return null;
    const payload: SessionPayload = JSON.parse(base64urlDecode(json));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
