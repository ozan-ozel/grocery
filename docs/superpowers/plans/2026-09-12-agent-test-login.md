# Short-Lived Agent Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Opus 5 — security-sensitive auth-bypass surface; production go/no-go
decision (Task 4) and token-hashing/expiry logic warrant the more careful model.

**Scope:** Backend only (new Supabase table + one Vercel function; no UI changes).

**Goal:** Let a test/QA agent (Playwright-driven Claude agent, CI job, etc.) sign in to the live
app for a bounded window — without a real Google account and without a permanently-valid shared
secret sitting in the app's auth surface.

**Architecture:** A two-step mint/redeem flow, one new Vercel function
(`api/agent-login.ts`, dispatched by `_action` like `api/auth-google.ts` already is, to stay
inside Vercel's Hobby-plan function-count budget). `_action=mint` is a server-to-server call
(never reachable from a browser) gated by a secret header; it writes a random, hashed,
10-minute-TTL, single-use token row to a new Supabase table. `_action=redeem` is the public URL
the agent actually navigates to; it looks the token up, checks it is unexpired and unused, marks
it used, and mints a real Supabase session cookie the same way `api/_auth-test-login.ts` already
does (`admin.generateLink` + `verifyOtp`).

**Tech Stack:** Vercel Functions (`Request`/`Response` Web APIs), `@supabase/supabase-js` admin
client, `@supabase/ssr` for cookie-based session creation, Supabase Postgres for token storage,
`node:crypto` for token generation/hashing.

**Spec:** No separate spec doc — derived directly from the product owner's request
(2026-09-12, Turkish: "Agent larımızın live test yapabilmesi için google auth olmaksızın kısa
süreliğine login olabilmesi gerekiyor... kısa süreli (10 dk) id generate edip login
olabileceğimiz bir sistem"). Ground truth for existing conventions: `api/_auth-test-login.ts`,
`api/auth-google.ts`, `lib/auth.ts`, and the Environment-variables section of
`docs/architecture.md`.

## Global Constraints

- No test suite/framework exists in this repo and none may be added (`CLAUDE.md`). Verify every
  task with `npm run build` (`tsc -b`) and by exercising the real endpoint via `npm run
  vercel:dev` (curl or a browser) — not with a new automated test file.
- Never commit, merge, or push without an explicit request from the repo owner (`CLAUDE.md` git
  guardrails). Each task ends with "stop for review," not a commit.
- All work happens on a feature branch, created before any code is written — never on `master`.
- This is a genuine authentication-bypass surface. **This plan must not be deployed to the
  production Vercel project without an explicit, separate go-ahead from the repo owner** — flag
  that decision at the point it matters (Task 4) rather than assuming it.
- Never store the raw token anywhere after the mint response — only its SHA-256 hash. Compare
  hashes with `timingSafeEqual`, mirroring `_auth-test-login.ts`'s `secretMatches`.
- New env vars are server-only secrets — never exposed to the client bundle (same rule
  `docs/architecture.md`'s Environment variables section states for existing ones).

---

## File Structure

- Create: `supabase/25-agent-login-tokens.sql` — new `agent_login_tokens` table + RLS (service-role
  only; no anon/authenticated grant, since this table is never read through PostgREST as the
  caller's own session).
- Create: `api/agent-login.ts` — the mint/redeem function, dispatched by `_action`.
- Modify: `docs/architecture.md` — add the new env vars and describe the flow next to the existing
  `TEST_LOGIN_SECRET` paragraph in "Environment variables."
- Modify: `.env.local.example` — document the two new local env vars if the owner chooses to test
  locally (Task 4 makes this conditional on the production decision).

## Task 1: Token storage table

**Files:**
- Create: `supabase/25-agent-login-tokens.sql`

**Interfaces:**
- Produces: table `agent_login_tokens(id uuid pk default gen_random_uuid(), token_hash text
  unique not null, email text not null, expires_at timestamptz not null, used_at timestamptz,
  created_at timestamptz not null default now())`.

- [ ] **Step 1: Write the migration**

```sql
-- 25-agent-login-tokens.sql
-- Short-lived, single-use login tokens for agent/QA sign-in (bypasses Google
-- OAuth). Never exposed via PostgREST to anon/authenticated roles — every
-- read/write goes through api/agent-login.ts using SUPABASE_SECRET_KEY, the
-- same pattern as api/_auth-test-login.ts's use of the Admin API. RLS is
-- enabled with no policies at all, which is PostgREST's default-deny: any
-- request using the anon/authenticated key is rejected outright; only the
-- service_role key (which bypasses RLS entirely) can touch this table.
create table if not exists public.agent_login_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.agent_login_tokens enable row level security;

create index if not exists agent_login_tokens_expires_at_idx
  on public.agent_login_tokens (expires_at);
```

- [ ] **Step 2: Apply it**

Run the migration against the project's Supabase instance the same way prior numbered
migrations in `supabase/` were applied (Supabase SQL editor or CLI — check
`docs/architecture.md`'s Deployment section for which one this project uses; there is no
migration-runner script in this repo).

- [ ] **Step 3: Verify**

In the Supabase dashboard's table editor, confirm `agent_login_tokens` exists with the five
columns above and RLS shown as "Enabled" with zero policies.

- [ ] **Step 4: Stop for review**

Do not commit. Leave the new file staged/unstaged for the repo owner to review with the rest of
this feature's diff.

## Task 2: Mint + redeem function

**Files:**
- Create: `api/agent-login.ts`

**Interfaces:**
- Consumes: `lib/auth.ts` is NOT used here — this endpoint is intentionally outside the normal
  `requireUser`/session-cookie-reading path (there is no session yet at mint/redeem time),
  exactly like `api/_auth-test-login.ts`.
- Produces: `POST /api/agent-login?_action=mint` (JSON body `{ email?: string }`, header
  `x-agent-login-secret: <AGENT_LOGIN_SECRET>`) → `{ token: string, redeemUrl: string, expiresAt:
  string }`. `GET /api/agent-login?_action=redeem&token=<token>&returnTo=<path>` → 302 redirect
  with a real Supabase session cookie set (same cookie mechanics as
  `api/_auth-test-login.ts`).

- [ ] **Step 1: Implement the shared pieces (hashing, env gates, Supabase clients)**

```typescript
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

export default {
  async fetch(request: Request): Promise<Response> {
    if (isProd() && !prodEnabled()) return notFound();

    const url = new URL(request.url);
    const action = url.searchParams.get("_action");
    if (action === "mint" && request.method === "POST") return handleMint(request);
    if (action === "redeem" && request.method === "GET") return handleRedeem(request, url);
    return notFound();
  },
};
```

- [ ] **Step 2: Implement `handleMint`**

```typescript
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
```

- [ ] **Step 3: Implement `handleRedeem`**

```typescript
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
```

- [ ] **Step 4: Run the typecheck**

Run: `npx tsc -p api/tsconfig.json --noEmit`
Expected: no errors referencing `api/agent-login.ts`.

- [ ] **Step 5: Manual verification against local dev**

Set `AGENT_LOGIN_SECRET=test-secret-value` in `.env.local`, then:

```bash
npm run vercel:dev
curl -X POST "http://localhost:3000/api/agent-login?_action=mint" \
  -H "x-agent-login-secret: test-secret-value" \
  -H "content-type: application/json" -d "{}"
```

Expected: a JSON body with `token`, `redeemUrl`, `expiresAt` (~10 minutes out). Open `redeemUrl`
in a browser — expect a redirect to `/` and a working, logged-in session (check the app shows
the signed-in state, e.g. Profile menu / household switcher works). Redeeming the same
`redeemUrl` a second time must return an error (410), and waiting past `expiresAt` before
redeeming must also fail (410).

- [ ] **Step 6: Stop for review**

Do not commit. Leave `api/agent-login.ts` for the repo owner's review.

## Task 3: Document the new env vars

**Files:**
- Modify: `docs/architecture.md` (Environment variables section)
- Modify: `.env.local.example`

- [ ] **Step 1: Add `AGENT_LOGIN_SECRET` and `AGENT_LOGIN_ENABLED` to the Environment variables
  section**, next to the existing `TEST_LOGIN_SECRET` paragraph, describing: what each gates,
  that `AGENT_LOGIN_SECRET` is never sent to the browser (only used server-to-server for the mint
  call), and the explicit warning that `AGENT_LOGIN_ENABLED=true` must only be set in the
  production Vercel project after the repo owner has signed off (see Task 4).

- [ ] **Step 2: Add both vars, commented out with a one-line explanation, to
  `.env.local.example`** for local development.

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: passes clean (docs-only + comment changes don't affect `tsc -b`, but confirms nothing
else broke).

- [ ] **Step 4: Stop for review.**

## Task 4: Production go/no-go decision (do not skip)

This is a decision task, not a code task — flagged separately because it changes this feature's
actual security posture.

- [ ] **Step 1:** Before setting `AGENT_LOGIN_ENABLED=true` on the production Vercel project, ask
  the repo owner to confirm: who holds `AGENT_LOGIN_SECRET` (which agents/CI systems), how it's
  rotated if leaked, and whether minted tokens should be restricted further (e.g. an IP allowlist
  at the Vercel edge, or a fixed `email` domain) before this is exposed on the live site. Do not
  set the production env var unilaterally.
- [ ] **Step 2:** If approved, set `AGENT_LOGIN_SECRET` and `AGENT_LOGIN_ENABLED=true` in the
  Vercel project's production environment settings (not `.env.local`), and confirm
  `AGENT_LOGIN_SECRET` is *not* also set for Preview/Development unless intentionally shared.
- [ ] **Step 3:** If not approved, leave `AGENT_LOGIN_ENABLED` unset in production — the endpoint
  stays fully inert there (`notFound()` on every request) while still usable locally and in
  Preview deployments (Preview is not gated by `isProd()`/`prodEnabled()` at all, matching how
  `_auth-test-login.ts` already treats Preview as non-production).

---

## Self-Review Notes

- **Spec coverage:** "kısa süreli (10 dk) id generate edip login olabileceğimiz bir sistem" →
  Task 2's mint (generates a 10-minute token) + redeem (logs in) pair. "google auth olmaksızın" →
  redeem never touches Google, only Supabase's Admin API magic-link mechanism, matching
  `_auth-test-login.ts`'s precedent. "Agent larımızın live test yapabilmesi" → Task 4 is what
  actually allows this to work against the deployed app, gated behind an explicit decision rather
  than silently inheriting `_auth-test-login.ts`'s hard production block.
- **Placeholder scan:** none — every step has runnable code or a concrete verification command.
- **Type consistency:** `handleMint`/`handleRedeem` signatures match the `fetch` dispatcher in
  Task 2 Step 1; `agent_login_tokens` columns used in Task 2 match the DDL in Task 1.
