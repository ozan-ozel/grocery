// Shared session validation for Vercel Functions. Every function that
// touches Supabase data calls requireUser() first; on failure it throws
// AuthError, which callers catch and translate to a Response via
// authErrorResponse(). Validates a real Supabase Auth session (see
// api/auth-google.ts's callback half for how a Supabase identity gets linked to this app's
// existing app_users/household model).
//
// Session refresh is deliberately not implemented here — the cookie
// adapter below never rewrites cookies. Sessions expire per Supabase's
// configured access-token lifetime (default 1 hour). This is an explicit,
// approved scope boundary (see
// docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md),
// the same class of tradeoff as this app's original JWT session having no
// refresh flow.

import { createServerClient, type CookieOptions } from "@supabase/ssr";

export type AuthUser = {
  userId: string; // app_users.id (Google `sub`) — resolved via auth_user_map
  email: string;
  accessToken: string; // this caller's own Supabase access token
};

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

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

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

// Read-only cookie adapter: getAll() feeds @supabase/ssr the incoming
// request's cookies; setAll() is a no-op (see the file header comment —
// session refresh is out of scope for this pass).
function readOnlyCookies(request: Request) {
  return {
    getAll() {
      const jar = parseCookies(request.headers.get("cookie"));
      return Object.entries(jar).map(([name, value]) => ({ name, value }));
    },
    setAll() {
      // Intentional no-op.
    },
  };
}

export const RETURN_TO_COOKIE = "sb-return-to";

// Writable cookie adapter shared by every endpoint that must set/clear
// cookies (sign-out, the OAuth start/callback pair) — unlike
// readOnlyCookies() above, setAll() here actually appends Set-Cookie
// headers onto the response being built. Only these endpoints ever write
// auth cookies; every other function only ever reads them via
// requireUser()'s read-only adapter.
export function writableCookies(request: Request, responseHeaders: Headers) {
  const secure = new URL(request.url).protocol === "https:";
  return {
    getAll() {
      const jar = parseCookies(request.headers.get("cookie"));
      return Object.entries(jar).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      for (const { name, value, options } of cookiesToSet) {
        const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax"];
        if (secure) parts.push("Secure");
        if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
        responseHeaders.append("set-cookie", parts.join("; "));
      }
    },
  };
}

// Builds a Set-Cookie string for RETURN_TO_COOKIE, shared by api/auth-google.ts's
// start half (setting it) and its callback half (clearing it on both the
// error and success paths) so the attribute list — Secure included — lives
// in exactly one place.
export function returnToCookieHeader(request: Request, value: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:";
  const parts = [
    `${RETURN_TO_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

// Same-origin-relative path only — rejects absolute/protocol-relative URLs
// (open-redirect guard for the OAuth returnTo param, since it round-trips
// through a plain cookie with no signature). "/x" is fine; "//evil.com",
// "https://evil.com", "/\\evil.com" are not. Also rejects tab/CR/LF to
// guard against WHATWG URL normalization bypasses.
export function isSafeReturnTo(value: string | null): value is string {
  if (!value) return false;
  if (/[\t\r\n]/.test(value)) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  return true;
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) throw new AuthError(500, "auth not configured");

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: readOnlyCookies(request),
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new AuthError(401, "missing session");

  // getUser() re-verifies against Supabase's own server. getSession() alone
  // just decodes the cookie locally and must never be trusted by itself for
  // an authorization decision.
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user || !userData.user.email) {
    throw new AuthError(401, "invalid or expired session");
  }

  const mapHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  let mapRows: { app_user_id: string }[];
  try {
    const mapRes = await fetch(
      `${restBase(supabaseUrl)}/auth_user_map?supabase_uid=eq.${encodeURIComponent(
        userData.user.id
      )}&select=app_user_id`,
      { headers: mapHeaders }
    );
    if (!mapRes.ok) throw new AuthError(502, "identity lookup failed");
    mapRows = (await mapRes.json()) as { app_user_id: string }[];
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError(502, "identity lookup failed");
  }
  if (mapRows.length === 0) {
    throw new AuthError(409, "account not linked — sign in again");
  }

  return {
    userId: mapRows[0].app_user_id,
    email: userData.user.email.toLowerCase(),
    accessToken,
  };
}

// Builds PostgREST headers authenticated as the caller's own Supabase
// session, so auth.uid() is non-null and RLS actually evaluates for real —
// the entire point of this migration. `apikey` still needs to be the anon
// key (Supabase's gateway requires a valid project key there regardless);
// `authorization` carries the user's own token, which is what sets the
// Postgres role RLS checks against.
export function userRestHeaders(user: AuthUser): Record<string, string> {
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new AuthError(500, "supabase not configured");
  return {
    apikey: anonKey,
    authorization: `Bearer ${user.accessToken}`,
    accept: "application/json",
  };
}

type HouseholdOwnerRow = { owner_id: string | null };
type ShareRow = { email: string };

// Unchanged from the pre-migration version — still the first layer, still
// backed by service_role. RLS (Task 3) is an independent second layer
// underneath this, not a replacement for it.
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
