// GET /api/auth-test-login?secret=<TEST_LOGIN_SECRET>&email=<optional>&returnTo=<optional>
// -> 302 redirect with the session cookie set, same as auth-google-callback.ts,
// but without going through Google at all.
//
// Exists so a human or an automated browser tool can obtain a real, working
// session for manual/QA click-through without ever touching a real Google
// account or storing Google credentials anywhere. Two independent gates keep
// this from being usable in production:
//   1. process.env.CONTEXT !== "production" (Netlify's own build-context var —
//      never "production" outside an actual production deploy).
//   2. A required TEST_LOGIN_SECRET env var that must match the `secret` query
//      param. Leave it unset in any shared/public deploy-preview environment
//      and this route 404s regardless of gate 1.
// Never set TEST_LOGIN_SECRET in the production Netlify site's env vars.

import type { Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;
const DEFAULT_TEST_EMAIL = "test@local.dev";

function isProd(): boolean {
  return process.env.CONTEXT === "production";
}

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function sameOriginReturnTo(raw: string | null, requestUrl: URL): string {
  if (!raw) return "/";
  try {
    const target = new URL(raw, requestUrl);
    return target.origin === requestUrl.origin
      ? target.pathname + target.search + target.hash
      : "/";
  } catch {
    return "/";
  }
}

// Stable per-email id (not a real Google `sub`) so repeat logins with the same
// test email reuse the same app_users row and any data attached to it.
function testUserId(email: string): string {
  return `test-${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function notFound(): Response {
  return new Response("not found", { status: 404 });
}

export default async (request: Request, _context: Context): Promise<Response> => {
  if (isProd()) return notFound();

  const testLoginSecret = process.env.TEST_LOGIN_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!testLoginSecret || !jwtSecret || !supabaseUrl || !serviceKey) return notFound();

  const url = new URL(request.url);
  if (!secretMatches(url.searchParams.get("secret"), testLoginSecret)) return notFound();

  const email = (url.searchParams.get("email") || DEFAULT_TEST_EMAIL).toLowerCase();
  const returnTo = sameOriginReturnTo(url.searchParams.get("returnTo"), url);
  const sub = testUserId(email);

  try {
    const res = await fetch(`${restBase(supabaseUrl)}/app_users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ id: sub, email }),
    });
    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `failed to upsert app_users: ${text}` }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: `failed to upsert app_users: ${e}` }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const session = jwt.sign({ sub, email }, jwtSecret, { expiresIn: "30d" });
  const sessionCookie = [
    `${SESSION_COOKIE}=${session}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_S}`,
  ].join("; ");

  const headers = new Headers({ location: returnTo, "set-cookie": sessionCookie });
  return new Response(null, { status: 302, headers });
};
