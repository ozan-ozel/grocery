// api/agent-login.ts
//
// Two-step, short-lived login for QA/test agents, without touching real
// Google or a permanently-valid shared secret:
//
//   POST /api/agent-login?_action=mint    (server-to-server only, never
//     called from a browser — gated by AGENT_LOGIN_SECRET) -> mints a
//     random token, stores its SHA-256 hash with a 10-minute expiry, and
//     returns the raw token exactly once.
//   GET  /api/agent-login?_action=redeem&token=<token>  (the URL the agent
//     actually navigates to) -> single use, checked against expiry, mints
//     a real Supabase session cookie via the Admin API magic-link dance
//     (same mechanism as api/_auth-test-login.ts's generateLink+verifyOtp).
//
// Gates, independent of each other:
//   1. AGENT_LOGIN_SECRET must be set, and the mint call's
//      x-agent-login-secret header must match it (timing-safe compare).
//   2. AGENT_LOGIN_ENABLED must be the literal string "true" for this
//      endpoint to do anything AT ALL in production
//      (process.env.VERCEL_ENV === "production"). Unlike
//      api/_auth-test-login.ts (hard-blocked in prod), this endpoint is
//      meant to also run against the deployed app for live agent testing —
//      so production access is opt-in via this flag, not unconditionally
//      open. Never set AGENT_LOGIN_ENABLED in production unless the repo
//      owner has explicitly decided agents may log in to the live site.
//      This gate is checked before every route below, including `?_debug=1`
//      (which answers only `{ "ready": boolean }`, nothing about the env).
// Every minted token is single-use (used_at stamped on redeem) and expires
// 10 minutes after minting, enforced server-side against agent_login_tokens.

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 10 * 60 * 1000;
const DEFAULT_AGENT_EMAIL = "agent@local.dev";

function isProd(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function prodEnabled(): boolean {
  return process.env.AGENT_LOGIN_ENABLED === "true";
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function notFound(): Response {
  return new Response("not found", { status: 404 });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
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

function testAppUserId(email: string): string {
  return `agent-${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
}

// True only when everything mint + redeem need is configured. Deliberately a
// single boolean: `_debug=1` must not reveal which var is missing, any value's
// length, or any other environment detail.
function isReady(): boolean {
  return Boolean(
    process.env.AGENT_LOGIN_SECRET &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SECRET_KEY,
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // The production gate runs first, before anything else (including _debug):
    // nothing here is reachable in production unless AGENT_LOGIN_ENABLED is "true".
    if (isProd() && !prodEnabled()) return notFound();

    if (url.searchParams.get("_debug") === "1") {
      return new Response(JSON.stringify({ ready: isReady() }), {
        headers: { "content-type": "application/json" },
      });
    }

    const action = url.searchParams.get("_action");
    if (action === "mint" && request.method === "POST") return handleMint(request);
    if (action === "redeem" && request.method === "GET") return handleRedeem(request, url);
    return notFound();
  },
};

async function handleMint(request: Request): Promise<Response> {
  const secret = process.env.AGENT_LOGIN_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!secret || !supabaseUrl || !serviceKey) return notFound();

  if (!secretMatches(request.headers.get("x-agent-login-secret"), secret)) {
    return notFound();
  }

  let body: { email?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // No body is fine — falls back to DEFAULT_AGENT_EMAIL.
  }
  const email =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim().toLowerCase()
      : DEFAULT_AGENT_EMAIL;

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const res = await fetch(`${base}/agent_login_tokens`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({ token_hash: tokenHash, email, expires_at: expiresAt }),
  });
  if (!res.ok) {
    const text = await res.text();
    return errorResponse(`failed to store token: ${text}`, 502);
  }

  const requestUrl = new URL(request.url);
  const redeemUrl = `${requestUrl.origin}/api/agent-login?_action=redeem&token=${token}`;
  return new Response(JSON.stringify({ token, redeemUrl, expiresAt }), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}

async function handleRedeem(request: Request, url: URL): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) return notFound();

  const rawToken = url.searchParams.get("token");
  if (!rawToken) return errorResponse("expected ?token=<token>", 400);
  const tokenHash = hashToken(rawToken);
  const returnTo = sameOriginReturnTo(url.searchParams.get("returnTo"), url);

  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const serviceHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
  };

  const lookupRes = await fetch(
    `${base}/agent_login_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}&select=id,email,expires_at,used_at`,
    { headers: serviceHeaders },
  );
  if (!lookupRes.ok) return errorResponse("token lookup failed", 502);
  const rows = (await lookupRes.json()) as {
    id: string;
    email: string;
    expires_at: string;
    used_at: string | null;
  }[];
  const row = rows[0];
  if (!row) return notFound();
  if (row.used_at) return errorResponse("token already used", 410);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return errorResponse("token expired", 410);
  }

  // Mark used before minting the session so a retried/duplicated request
  // can't redeem the same token twice even under a race.
  const markUsedRes = await fetch(
    `${base}/agent_login_tokens?id=eq.${encodeURIComponent(row.id)}&used_at=is.null`,
    {
      method: "PATCH",
      headers: { ...serviceHeaders, prefer: "return=representation" },
      body: JSON.stringify({ used_at: new Date().toISOString() }),
    },
  );
  if (!markUsedRes.ok) return errorResponse("failed to consume token", 502);
  const markedRows = (await markUsedRes.json()) as unknown[];
  if (markedRows.length === 0) return errorResponse("token already used", 410);

  const email = row.email;
  const admin = createClient(supabaseUrl, serviceKey);

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
      return errorResponse(`failed to create agent user: ${createError?.message}`);
    }
    supabaseUid = created.user.id;
  }

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

  const appUserId = testAppUserId(email);
  const upsertUserRes = await fetch(`${base}/app_users`, {
    method: "POST",
    headers: { ...serviceHeaders, prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: appUserId, email }),
  });
  if (!upsertUserRes.ok) {
    return errorResponse(`failed to upsert app_users: ${await upsertUserRes.text()}`);
  }
  const upsertMapRes = await fetch(`${base}/auth_user_map`, {
    method: "POST",
    headers: { ...serviceHeaders, prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ supabase_uid: supabaseUid, app_user_id: appUserId }),
  });
  if (!upsertMapRes.ok) {
    return errorResponse(`failed to upsert auth_user_map: ${await upsertMapRes.text()}`);
  }

  return new Response(null, { status: 302, headers: responseHeaders });
}
