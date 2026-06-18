export const SESSION_COOKIE = "osp_session";
export const USER_COOKIE = "osp_user";
export const MAX_AGE = 8 * 60 * 60; // 8 hours

const SECRET =
  process.env.SESSION_SECRET ?? "dev-secret-do-not-use-in-production";

export interface SessionPayload {
  email: string;
  role: string;
  exp: number;
}

export function getRole(email: string): string {
  const lower = email.toLowerCase();
  if (lower === "branch@stpeter.com.ph") return "branch";
  if (lower === "bm@stpeter.com.ph") return "bm";
  if (lower === "stl@stpeter.com.ph") return "stl";
  return "sales-agent";
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

export async function createSession(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    role: getRole(email),
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
