// GET /api/auth-test-login?secret=<TEST_LOGIN_SECRET>&email=<optional>&returnTo=<optional>
// -> 302 redirect with a real, working Supabase session cookie set, without
// touching real Google. Mirrors the intent and double gate of the retired
// Netlify auth-test-login.ts, ported to Supabase Auth's Admin API.
//
// Two independent gates keep this from being usable in production:
//   1. process.env.VERCEL_ENV !== "production".
//   2. A required TEST_LOGIN_SECRET env var that must match the `secret`
//      query param. Never set TEST_LOGIN_SECRET in the production Vercel
//      project's env vars.

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { createHash, timingSafeEqual } from "node:crypto";

const DEFAULT_TEST_EMAIL = "test@local.dev";

function isProd(): boolean {
  return process.env.VERCEL_ENV === "production";
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

function errorResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });
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

// Stable per-email id, matching the Netlify version's convention, so
// repeat test logins with the same email reuse the same app_users row.
function testAppUserId(email: string): string {
  return `test-${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (isProd()) return notFound();

    const testLoginSecret = process.env.TEST_LOGIN_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!testLoginSecret || !supabaseUrl || !anonKey || !serviceKey) return notFound();

    const url = new URL(request.url);
    if (!secretMatches(url.searchParams.get("secret"), testLoginSecret)) return notFound();

    const email = (url.searchParams.get("email") || DEFAULT_TEST_EMAIL).toLowerCase();
    const returnTo = sameOriginReturnTo(url.searchParams.get("returnTo"), url);

    const admin = createClient(supabaseUrl, serviceKey);

    // Find-or-create the Supabase Auth user for this test email.
    let supabaseUid: string;
    const { data: existing, error: listError } = await admin.auth.admin.listUsers();
    if (listError) return errorResponse(`failed to list users: ${listError.message}`);
    const found = existing.users.find((u) => u.email?.toLowerCase() === email);
    if (found) {
      supabaseUid = found.id;
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createError || !created.user) {
        return errorResponse(`failed to create test user: ${createError?.message}`);
      }
      supabaseUid = created.user.id;
    }

    // Mint a real session for that user without a password or real Google,
    // via a magic-link token generated (not emailed) by the Admin API.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !linkData.properties?.hashed_token) {
      return errorResponse(`failed to generate link: ${linkError?.message}`);
    }

    const responseHeaders = new Headers({ location: returnTo });
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax"];
            if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
            responseHeaders.append("set-cookie", parts.join("; "));
          }
        },
      },
    });
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: linkData.properties.hashed_token,
    });
    if (verifyError) {
      return errorResponse(`failed to verify link: ${verifyError.message}`);
    }

    // Same app_users/auth_user_map upsert as the real login-linking step
    // (api/auth-callback.ts) — the test user's "Google sub" is just a stable
    // hash of its email, since no real Google account exists for it.
    const appUserId = testAppUserId(email);
    const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
    const serviceHeaders = {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      accept: "application/json",
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    };
    const userRes = await fetch(`${base}/app_users`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ id: appUserId, email }),
    });
    if (!userRes.ok) {
      const text = await userRes.text();
      return errorResponse(`failed to upsert app_users: ${text}`);
    }
    const mapRes = await fetch(`${base}/auth_user_map`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ supabase_uid: supabaseUid, app_user_id: appUserId }),
    });
    if (!mapRes.ok) {
      const text = await mapRes.text();
      return errorResponse(`failed to upsert auth_user_map: ${text}`);
    }

    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
