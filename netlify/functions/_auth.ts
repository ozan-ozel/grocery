// Shared session validation for Netlify Functions. Every function that
// touches Supabase data calls requireUser() first; on failure it throws
// AuthError, which callers catch and translate to a Response via
// authErrorResponse(). Validates our own session JWT (signed on Google
// OAuth callback, see auth-google-callback.ts) read from the httpOnly
// "session" cookie.
//
// Leading underscore keeps Netlify from treating this as a routable
// function.

import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: string;
  email: string;
};

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

type SessionPayload = { sub: string; email: string };

export const SESSION_COOKIE = "session";

// Hand-rolled: zero cookie-parsing exists anywhere in this repo yet and the
// format needed is trivial. Not adding the `cookie` npm dependency for this.
export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq)] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AuthError(500, "auth not configured");

  const token = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  if (!token) throw new AuthError(401, "missing session cookie");

  try {
    const payload = jwt.verify(token, secret) as SessionPayload;
    if (!payload.sub || !payload.email) throw new AuthError(401, "invalid session");
    return { userId: payload.sub, email: payload.email };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(401, "invalid or expired session");
  }
}

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

type HouseholdOwnerRow = { owner_id: string | null };
type ShareRow = { email: string };

export async function requireHouseholdAccess(
  householdId: string,
  user: AuthUser,
  opts: { ownerOnly?: boolean } = {}
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new AuthError(500, "supabase not configured");

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

  const householdRes = await fetch(
    `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(householdId)}&select=owner_id`,
    { headers }
  );
  if (!householdRes.ok) throw new AuthError(502, "household lookup failed");
  const rows = (await householdRes.json()) as HouseholdOwnerRow[];
  if (rows.length === 0) throw new AuthError(404, "not found");

  if (rows[0].owner_id === user.userId) return;
  if (opts.ownerOnly) throw new AuthError(404, "not found");

  const shareRes = await fetch(
    `${restBase(supabaseUrl)}/household_shares?household_id=eq.${encodeURIComponent(
      householdId
    )}&email=eq.${encodeURIComponent(user.email)}&select=email`,
    { headers }
  );
  if (!shareRes.ok) throw new AuthError(502, "household share lookup failed");
  const shares = (await shareRes.json()) as ShareRow[];
  if (shares.length === 0) throw new AuthError(404, "not found");
}

export function authErrorResponse(err: unknown): Response {
  const status = err instanceof AuthError ? err.status : 401;
  const message = err instanceof AuthError ? err.message : "unauthorized";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
