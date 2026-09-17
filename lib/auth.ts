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

// `vercel dev` (and tunnels like ngrok pointed at it) terminate TLS in front
// of a plain-HTTP local server, so `new URL(request.url).protocol` is always
// "http:" even when the public-facing URL is https. Trust
// `x-forwarded-proto`/`x-forwarded-host` (which ngrok and Vercel's real edge
// both set) when present so redirect_uri construction and the cookie Secure
// flag reflect the URL the browser/Google actually see.
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : url.protocol.replace(":", "");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? url.host;
  return `${protocol}://${host}`;
}

function isRequestSecure(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
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
  const secure = isRequestSecure(request);
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
  const secure = isRequestSecure(request);
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

export const OAUTH_STATE_COOKIE = "sb-oauth-state";

// Builds a Set-Cookie string for OAUTH_STATE_COOKIE — a CSRF guard for the
// direct Google authorize request (see api/auth-google.ts): the start half
// stashes a random value here, the callback half requires the `state` query
// param it gets back from Google to match it exactly before exchanging the
// code.
export function oauthStateCookieHeader(request: Request, value: string, maxAge: number): string {
  const secure = isRequestSecure(request);
  const parts = [
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(value)}`,
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

// Resolves app_users.id for a Supabase uid. Never throws — it hands back an
// AuthError instead, so a caller running it concurrently with session
// verification can keep the 401-before-502 error precedence rather than
// letting a Promise.all reject out from under the auth check.
type MapLookup =
  | { rows: { app_user_id: string }[] }
  | { error: AuthError };

async function fetchAuthUserMap(
  supabaseUrl: string,
  serviceKey: string,
  supabaseUid: string
): Promise<MapLookup> {
  const mapHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  try {
    const mapRes = await fetch(
      `${restBase(supabaseUrl)}/auth_user_map?supabase_uid=eq.${encodeURIComponent(
        supabaseUid
      )}&select=app_user_id`,
      { headers: mapHeaders }
    );
    if (!mapRes.ok) return { error: new AuthError(502, "identity lookup failed") };
    return { rows: (await mapRes.json()) as { app_user_id: string }[] };
  } catch {
    return { error: new AuthError(502, "identity lookup failed") };
  }
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) throw new AuthError(500, "auth not configured");

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: readOnlyCookies(request),
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new AuthError(401, "missing session");

  // The `sub` as decoded from the cookie locally. NOT TRUSTED, and not an
  // authorization decision: it is used only as a speculative cache key so the
  // auth_user_map lookup can run concurrently with the getUser() round trip
  // below instead of waiting a full RTT behind it. Its result is discarded
  // unless getUser() independently succeeds AND returns this exact same uuid
  // — see the guard after the await.
  const claimedUid = sessionData.session?.user?.id;
  if (!claimedUid) throw new AuthError(401, "missing session");

  const [userResult, mapLookup] = await Promise.all([
    supabase.auth.getUser(),
    fetchAuthUserMap(supabaseUrl, serviceKey, claimedUid),
  ]);

  // getUser() re-verifies against Supabase's own server. getSession() alone
  // just decodes the cookie locally and must never be trusted by itself for
  // an authorization decision — which is exactly why nothing below reads
  // mapLookup until getUser() has both succeeded and confirmed the identity
  // the cookie claimed.
  const { data: userData, error } = userResult;
  if (error || !userData.user || !userData.user.email) {
    throw new AuthError(401, "invalid or expired session");
  }
  if (userData.user.id !== claimedUid) {
    // The verified session is for a different account than the cookie decoded
    // to, so the speculative lookup was keyed on the wrong identity. Refuse
    // rather than re-issue it: this should be unreachable.
    throw new AuthError(401, "invalid or expired session");
  }

  if ("error" in mapLookup) throw mapLookup.error;
  if (mapLookup.rows.length === 0) {
    throw new AuthError(409, "account not linked — sign in again");
  }

  return {
    userId: mapLookup.rows[0].app_user_id,
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
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
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
