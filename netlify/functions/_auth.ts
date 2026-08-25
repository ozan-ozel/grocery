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

export function authErrorResponse(err: unknown): Response {
  const status = err instanceof AuthError ? err.status : 401;
  const message = err instanceof AuthError ? err.message : "unauthorized";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
