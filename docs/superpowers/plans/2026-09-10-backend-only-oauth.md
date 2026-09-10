# Backend-Only OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` from the frontend bundle by moving
the entire Google OAuth handshake (start, callback, identity-linking) onto `api/*.ts`, while
keeping Supabase Auth + RLS exactly as documented in the 2026-09-09 migration design.

**Architecture:** Two new endpoints — `api/auth-google-start.ts` (redirects the browser into
Supabase's hosted OAuth flow, using `@supabase/ssr`'s `signInWithOAuth()` called server-side so it
writes the PKCE verifier cookie itself) and `api/auth-callback.ts` (exchanges the code for a
session, does the identity upsert `api/auth-link.ts` used to do, then redirects back). A shared
writable cookie adapter and a `returnTo` open-redirect guard move into `lib/auth.ts`, used by both
new endpoints and the existing `auth-logout.ts`. The frontend drops `supabase-js`/`@supabase/ssr`
entirely.

**Tech Stack:** `@supabase/ssr`'s `createServerClient` (already a dependency), Vercel `api/*.ts`
functions (web-standard `Request`/`Response`), Preact frontend.

**Spec:** `docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md`

## Global Constraints

- **No automated tests are written for this work** — per explicit user instruction. Every "Verify"
  step below is `tsc`/`vite build`/manual, never a new `vitest` file.
- **No `git commit` runs automatically after a task.** This project's standing convention is
  implement-and-verify-then-stop; the user commits after reviewing. Each task ends with "stop for
  review," not a commit command. (This overrides the writing-plans skill's default per-task commit
  step.)
- **Branch first, before any step below.** Create and check out a new branch
  (e.g. `feature/backend-only-oauth`) before Task 1 — never write this code with `master` checked
  out.
- Relative imports between `api/*.ts` and `lib/auth.ts` use the existing `.js`-extension convention
  seen in every current `api/*.ts` file (e.g. `import { requireUser } from "../lib/auth.js";`) even
  though the source file is `.ts` — match it exactly, don't introduce a different import style.
- Every new/modified `api/*.ts` file must typecheck under `api/tsconfig.json`
  (`npx tsc -p api/tsconfig.json --noEmit`) and every new/modified `src/*` file under the root
  `tsc -b` — run both after every task, not just at the end.
- Do not touch `netlify/functions/`, `supabase/*.sql`, or `docs/superpowers/plans|specs/` other
  than this plan/spec pair — out of scope (see the spec's "Explicitly out of scope").

---

### Task 1: Shared cookie/returnTo helpers in `lib/auth.ts`; refactor `auth-logout.ts`

**Files:**
- Modify: `lib/auth.ts`
- Modify: `api/auth-logout.ts`

**Interfaces:**
- Produces: `writableCookies(request: Request, responseHeaders: Headers)` — a `@supabase/ssr`
  cookie adapter whose `setAll()` appends real `Set-Cookie` headers onto `responseHeaders` (Tasks
  2, 3 depend on this). `isSafeReturnTo(value: string | null): value is string` — true only for a
  same-origin-relative path (Task 2 depends on this). `RETURN_TO_COOKIE: string` — the cookie name
  both new endpoints must agree on (Tasks 2, 3 depend on this).

- [ ] **Step 1: Add the shared helpers to `lib/auth.ts`**

Change the top import line from:

```typescript
import { createServerClient } from "@supabase/ssr";
```

to:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
```

Then insert this immediately after the existing `readOnlyCookies` function (before
`export async function requireUser`):

```typescript
export const RETURN_TO_COOKIE = "sb-return-to";

// Writable cookie adapter shared by every endpoint that must set/clear
// cookies (sign-out, the OAuth start/callback pair) — unlike
// readOnlyCookies() above, setAll() here actually appends Set-Cookie
// headers onto the response being built. Only these endpoints ever write
// auth cookies; every other function only ever reads them via
// requireUser()'s read-only adapter.
export function writableCookies(request: Request, responseHeaders: Headers) {
  return {
    getAll() {
      const jar = parseCookies(request.headers.get("cookie"));
      return Object.entries(jar).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      for (const { name, value, options } of cookiesToSet) {
        const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax"];
        if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
        responseHeaders.append("set-cookie", parts.join("; "));
      }
    },
  };
}

// Same-origin-relative path only — rejects absolute/protocol-relative URLs
// (open-redirect guard for the OAuth returnTo param, since it round-trips
// through a plain cookie with no signature). "/x" is fine; "//evil.com",
// "https://evil.com", "/\\evil.com" are not.
export function isSafeReturnTo(value: string | null): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/\\")) return false;
  return true;
}
```

Also update the file's header comment (lines 1-14): replace the line

```
// api/auth-link.ts for how a Supabase identity gets linked to this app's
```

with

```
// api/auth-callback.ts for how a Supabase identity gets linked to this app's
```

(`api/auth-link.ts` is deleted in Task 3 — this comment must not point at a file that no longer
exists.)

- [ ] **Step 2: Refactor `api/auth-logout.ts` to use the shared adapter**

Replace the entire file with:

```typescript
// POST /api/auth-logout -> { ok: true }, clears the Supabase session
// cookies via supabase.auth.signOut().

import { createServerClient } from "@supabase/ssr";
import { writableCookies } from "../lib/auth.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "supabase not configured" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const responseHeaders = new Headers({ "content-type": "application/json" });
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: writableCookies(request, responseHeaders),
    });

    await supabase.auth.signOut();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
  },
};
```

(This is a pure refactor — behavior is unchanged. The old inline `parseCookies`/cookie-adapter
code is deleted from this file since `writableCookies` now provides it.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc -p api/tsconfig.json --noEmit`
Expected: no errors.

Run: `npx tsc -b`
Expected: no errors (this file isn't under root `tsc -b`'s `include`, but confirms nothing else
broke).

- [ ] **Step 4: Stop for review.** Do not commit — leave the change staged/unstaged for the user
  to review per this project's no-auto-commit convention.

---

### Task 2: `api/auth-google-start.ts`

**Files:**
- Create: `api/auth-google-start.ts`

**Interfaces:**
- Consumes: `writableCookies`, `isSafeReturnTo`, `RETURN_TO_COOKIE` from `../lib/auth.js` (Task 1).
- Produces: `GET /api/auth-google-start?returnTo=<path>` — 302 redirect to Supabase's hosted OAuth
  authorize URL. Task 3's `api/auth-callback.ts` is the `redirect_to` this endpoint sends Supabase.

- [ ] **Step 1: Create the file**

```typescript
// GET /api/auth-google-start?returnTo=<path> -> 302 to Google (via
// Supabase Auth's hosted OAuth flow). Google redirects back to Supabase,
// which redirects to api/auth-callback.ts. This kicks off the whole
// handshake server-side so the frontend never needs
// SUPABASE_URL/SUPABASE_ANON_KEY at all — see
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.
//
// Calling signInWithOAuth() on a server client (not the browser client) is
// the documented @supabase/ssr pattern for this: it still generates and
// writes the PKCE code_verifier cookie via writableCookies below, just
// from a route handler instead of client-side JS. api/auth-callback.ts's
// exchangeCodeForSession() reads that same cookie back.

import { createServerClient } from "@supabase/ssr";
import { writableCookies, isSafeReturnTo, RETURN_TO_COOKIE } from "../lib/auth.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return new Response("supabase not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const requestedReturnTo = url.searchParams.get("returnTo");
    const returnTo = isSafeReturnTo(requestedReturnTo) ? requestedReturnTo : "/";
    const callbackUrl = `${url.origin}/api/auth-callback`;

    const responseHeaders = new Headers();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: writableCookies(request, responseHeaders),
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (error || !data.url) {
      return new Response(`failed to start sign-in: ${error?.message ?? "no url"}`, {
        status: 502,
        headers: responseHeaders,
      });
    }

    // Stashed separately from Supabase's own PKCE cookie (already appended
    // above by signInWithOAuth via writableCookies) — this one just
    // carries where to land the user after api/auth-callback.ts finishes,
    // since redirect_to must exactly match an allow-listed URL in
    // Supabase's Auth settings and can't carry it directly.
    responseHeaders.append(
      "set-cookie",
      `${RETURN_TO_COOKIE}=${encodeURIComponent(returnTo)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
    );
    responseHeaders.set("location", data.url);

    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api/tsconfig.json --noEmit`
Expected: no errors.

- [ ] **Step 3: Stop for review.** Do not commit yet.

---

### Task 3: `api/auth-callback.ts`; delete `api/auth-link.ts`

**Files:**
- Create: `api/auth-callback.ts`
- Delete: `api/auth-link.ts`
- Modify: `api/_auth-test-login.ts` (one comment reference)

**Interfaces:**
- Consumes: `writableCookies`, `RETURN_TO_COOKIE`, `parseCookies` from `../lib/auth.js` (Task 1).
- Produces: `GET /api/auth-callback` — the `redirect_to` Task 2 sends Supabase to. On success, 302s
  to the original `returnTo` with the Supabase session cookie set. On any failure, 302s to
  `returnTo` (or `/`) with `?auth_error=1` — Task 5's `LoginGate.tsx` reads this.

- [ ] **Step 1: Create `api/auth-callback.ts`**

```typescript
// GET /api/auth-callback -> 302 to the original returnTo, session cookie
// set. Google redirects here via Supabase after the user approves (or
// denies) consent — see api/auth-google-start.ts for how the flow starts.
// Folds in what api/auth-link.ts used to do as a separate client-triggered
// POST: resolve the Google `sub` from the verified Supabase session,
// upsert app_users (unchanged shape) and auth_user_map. See
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.

import { createServerClient } from "@supabase/ssr";
import { writableCookies, RETURN_TO_COOKIE, parseCookies } from "../lib/auth.js";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function errorRedirect(returnTo: string, responseHeaders: Headers): Response {
  const separator = returnTo.includes("?") ? "&" : "?";
  responseHeaders.set("location", `${returnTo}${separator}auth_error=1`);
  // Clear any half-set returnTo cookie regardless of outcome.
  responseHeaders.append(
    "set-cookie",
    `${RETURN_TO_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return new Response(null, { status: 302, headers: responseHeaders });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const responseHeaders = new Headers();
    const returnTo = parseCookies(request.headers.get("cookie"))[RETURN_TO_COOKIE] ?? "/";

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return errorRedirect(returnTo, responseHeaders);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      // Google/Supabase redirects here with an error param (access_denied,
      // etc.) instead of code when the user declines consent.
      return errorRedirect(returnTo, responseHeaders);
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: writableCookies(request, responseHeaders),
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user || !data.user.email) {
      return errorRedirect(returnTo, responseHeaders);
    }

    const googleIdentity = data.user.identities?.find((i) => i.provider === "google");
    const googleSub =
      googleIdentity?.id ?? (googleIdentity?.identity_data?.sub as string | undefined);
    if (!googleSub) {
      return errorRedirect(returnTo, responseHeaders);
    }

    const email = data.user.email.toLowerCase();
    const serviceHeaders = {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      accept: "application/json",
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    };
    const base = restBase(supabaseUrl);

    try {
      const userRes = await fetch(`${base}/app_users`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ id: googleSub, email }),
      });
      if (!userRes.ok) return errorRedirect(returnTo, responseHeaders);

      const mapRes = await fetch(`${base}/auth_user_map`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
      });
      if (!mapRes.ok) return errorRedirect(returnTo, responseHeaders);
    } catch {
      return errorRedirect(returnTo, responseHeaders);
    }

    // Success: clear the returnTo cookie, keep the session cookies
    // exchangeCodeForSession already wrote via writableCookies above.
    responseHeaders.append(
      "set-cookie",
      `${RETURN_TO_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );
    responseHeaders.set("location", returnTo);
    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
```

- [ ] **Step 2: Delete `api/auth-link.ts`**

```bash
git rm api/auth-link.ts
```

- [ ] **Step 3: Fix the stale comment in `api/_auth-test-login.ts`**

Find this comment (around line 127-128):

```typescript
    // Same app_users/auth_user_map upsert as the real login-linking step
    // (api/auth-link.ts) — the test user's "Google sub" is just a stable
```

Change `(api/auth-link.ts)` to `(api/auth-callback.ts)`.

- [ ] **Step 4: Typecheck**

Run: `npx tsc -p api/tsconfig.json --noEmit`
Expected: no errors — confirms `api/auth-link.ts`'s removal broke nothing (nothing else imported
from it; it was only ever called over HTTP from the frontend, never imported as a module).

- [ ] **Step 5: Stop for review.** Do not commit yet.

---

### Task 4: Frontend — delete `supabaseAuthClient.ts`, rewrite `useAuth.ts`

**Files:**
- Delete: `src/lib/supabaseAuthClient.ts`
- Modify: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `GET /api/auth-session` (unchanged), `GET /api/auth-google-start` (Task 2),
  `POST /api/auth-logout` (unchanged), `DELETE /api/auth-delete-account` (pre-existing, separately
  broken — see spec's "Explicitly out of scope"; not this task's concern).
- Produces: `useAuth()`'s existing return shape (`{ session, checked, signInWithGoogle, signOut,
  deleteAccount }`) is unchanged — `src/App.tsx`'s consumption of it needs no changes.

- [ ] **Step 1: Delete `src/lib/supabaseAuthClient.ts`**

```bash
git rm src/lib/supabaseAuthClient.ts
```

- [ ] **Step 2: Rewrite `src/hooks/useAuth.ts`**

Replace the entire file with:

```typescript
import { useEffect, useState } from "react";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchAppSession();
  }, []);

  // Reads the canonical { email, userId } pair from our own backend.
  // userId here is always app_users.id (the Google sub), never a raw
  // Supabase uuid — TenantSwitcher etc. compare it directly against
  // households.owner_id.
  async function fetchAppSession(): Promise<void> {
    try {
      const res = await fetch("/api/auth-session", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { email: string | null; userId: string | null };
        setSession({ email: data.email, userId: data.userId });
      } else {
        setSession(undefined);
      }
    } catch {
      setSession(undefined);
    } finally {
      setChecked(true);
    }
  }

  function signInWithGoogle() {
    // Full-page navigation, not fetch — OAuth needs a top-level browser
    // navigation to Google's consent screen. Handled entirely server-side
    // by api/auth-google-start.ts / api/auth-callback.ts — see
    // docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.
    // returnTo is a relative path, not the full URL: the backend's
    // isSafeReturnTo() rejects absolute URLs as an open-redirect guard.
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = "/api/auth-google-start?returnTo=" + encodeURIComponent(returnTo);
  }

  async function signOut() {
    await fetch("/api/auth-logout", { method: "POST", credentials: "include" });
    setSession(undefined);
  }

  async function deleteAccount() {
    await fetch("/api/auth-delete-account", { method: "DELETE", credentials: "include" });
    setSession(undefined);
  }

  return { session, checked, signInWithGoogle, signOut, deleteAccount };
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm run build`
Expected: succeeds. Then confirm the client bundle no longer references the removed env vars:

Run: `grep -c "VITE_SUPABASE" dist/assets/*.js`
Expected: no matches (grep exits non-zero / prints nothing), confirming the anon key and Supabase
URL are no longer in the shipped frontend bundle.

- [ ] **Step 4: Stop for review.** Do not commit yet.

---

### Task 5: `LoginGate.tsx` — auth_error display, stale comment fix

**Files:**
- Modify: `src/components/LoginGate.tsx`

**Interfaces:**
- Consumes: the `?auth_error=1` query param `api/auth-callback.ts` (Task 3) sets on failure.
- Produces: no change to `Props` or how `App.tsx` uses `LoginGate` — purely internal.

- [ ] **Step 1: Replace the file**

```tsx
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onSignIn: () => void;
};

// Netlify was retired (NUT-52); this notice is now stale and can be
// removed once nobody's still landing on the old Netlify domain via a
// bookmark or cached link.
const NEW_APP_URL = "https://grocery-five-ecru.vercel.app";

function isRunningOnVercel(): boolean {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
}

// Set by api/auth-callback.ts's error redirect (see
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md) when the
// user declines Google consent or the OAuth exchange fails.
function hasAuthError(): boolean {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("auth_error")
  );
}

export function LoginGate({ onSignIn }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col items-center justify-center gap-6 px-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Giriş yap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Devam etmek için Google hesabınla giriş yap.
        </p>
      </div>
      <Button type="button" onClick={onSignIn} className="w-full">
        <Chrome className="size-4" />
        Google ile giriş yap
      </Button>
      {hasAuthError() && (
        <p className="text-center text-xs text-destructive">
          Giriş başarısız oldu. Lütfen tekrar dene.
        </p>
      )}
      {!isRunningOnVercel() && (
        <p className="text-center text-xs text-muted-foreground">
          Bu adresi yakında kapatıyoruz. Yeni adresimiz:{" "}
          <a
            href={NEW_APP_URL}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {NEW_APP_URL.replace("https://", "")}
          </a>
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Stop for review.** Do not commit yet.

---

### Task 6: Docs, external config notes, full manual verification

**Files:**
- Modify: `docs/architecture.md`

**Interfaces:**
- Consumes: nothing new — this task is documentation + verification only.
- Produces: nothing further downstream — this is the last task.

- [ ] **Step 1: Update `docs/architecture.md`'s Environment variables section**

Find this paragraph:

```
**Required env vars** (Vercel project settings for production; `.env.local` for local dev via
`npm run vercel:dev`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Most
`api/*.ts` functions authenticate to PostgREST as the caller's own Supabase session
(`lib/auth.ts`'s `userRestHeaders`, built from the anon key + the caller's token); a handful of
endpoints (`meal-entries.ts`'s writes, `nutrition.ts`'s writes, `auth-link.ts`, `_auth-test-login.ts`)
use `SUPABASE_SERVICE_ROLE_KEY` for operations that must bypass RLS (linking identities, bootstrapping
a test session, etc.) — see each file's own comments for which. `.env.local.example` only lists
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `USDA_API_KEY` because it's scoped to the one-off
`scripts/upload-nutrition.ts` seeding script — it does not cover `SUPABASE_ANON_KEY`, which the
functions also need.
```

Replace with:

```
**Required env vars** (Vercel project settings for production; `.env.local` for local dev via
`npm run vercel:dev`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. These are
server-only — the frontend bundle never receives Supabase credentials directly; the entire Google
OAuth handshake (`api/auth-google-start.ts` → `api/auth-callback.ts`) runs server-side instead of
via a browser-side Supabase client (see
`docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md`). Most `api/*.ts` functions
authenticate to PostgREST as the caller's own Supabase session (`lib/auth.ts`'s `userRestHeaders`,
built from the anon key + the caller's token); a handful of endpoints (`meal-entries.ts`'s writes,
`nutrition.ts`'s writes, `auth-callback.ts`, `_auth-test-login.ts`) use
`SUPABASE_SERVICE_ROLE_KEY` for operations that must bypass RLS (linking identities, bootstrapping
a test session, etc.) — see each file's own comments for which. `.env.local.example` only lists
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `USDA_API_KEY` because it's scoped to the one-off
`scripts/upload-nutrition.ts` seeding script — it does not cover `SUPABASE_ANON_KEY`, which the
functions also need.
```

- [ ] **Step 2: External manual steps (cannot be done from this repo — flag to the user, don't attempt)**

- **Supabase dashboard**: confirm `<vercel-domain>/api/auth-callback` (both the production domain
  and, if tested locally against a real Supabase project, `http://localhost:3000/api/auth-callback`)
  is in Auth → URL Configuration → Redirect URLs. This may already be covered by whatever was
  allow-listed during the original Supabase Auth migration — verify, don't assume.
- **Vercel project settings**: remove `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
  `VITE_SUPABASE_AUTH_ENABLED` if any of them are still set there — they're no longer read by
  anything after this change (the frontend never imports `import.meta.env.VITE_SUPABASE_*`
  anymore).

- [ ] **Step 3: Full manual end-to-end verification**

Run `npm run vercel:dev` and, through the browser:

- Fresh login (use a Google account with no existing `auth_user_map` row, or truncate the row
  for a test account): full redirect chain completes, lands back on the original page,
  `/api/auth-session` returns the right `{ email, userId }`.
- Returning login (same account, second time): same result, and confirm in Supabase's table
  editor that `auth_user_map` has exactly one row for that `supabase_uid` (the upsert didn't
  duplicate).
- Deny consent on Google's screen: lands back on the original page with `?auth_error=1` in the
  URL, the "Giriş başarısız oldu" message shows, no session cookie set,
  `/api/auth-session` still 401s.
- Tamper with `returnTo` (`curl -i "http://localhost:3000/api/auth-google-start?returnTo=https://evil.example"`):
  confirm the resulting Supabase redirect's `redirect_to` still points at `/api/auth-callback` on
  this app's own origin, not `evil.example` — the absolute URL was rejected and `/` used instead.
- Logout: `/api/auth-logout` still clears the session; reload shows the login gate again;
  `/api/auth-session` 401s.
- Confirm `npm run build`'s output bundle (from Task 4) still has no `VITE_SUPABASE` references.
- Run the full existing suite once more as a regression check (not new tests):
  `npx tsc -b && npx tsc -p api/tsconfig.json --noEmit && npm run build && npx vitest run`.
  Expected: all clean, 108/108 passing (unchanged from before this work — nothing here touches
  code any existing test covers).

- [ ] **Step 4: Stop for review.** Do not commit — this is the last task; leave the full change set
  for the user to review and commit themselves.

## Self-Review Notes

- **Spec coverage:** every section of the design spec maps to a task — sign-in trigger (Task 2),
  callback + folded-in identity linking (Task 3), writable cookie adapter extraction (Task 1),
  frontend changes (Task 4), error display (Task 5), docs + external config + manual verification
  (Task 6). The spec's "Explicitly out of scope" items (service_role+JWT revert, Docker, fixing
  `auth-delete-account`, session refresh) have no task here — correctly, since they're out of
  scope.
- **Placeholder scan:** no TBD/TODO; every code block is complete, runnable code, not a sketch.
- **Type consistency:** `writableCookies`, `isSafeReturnTo`, `RETURN_TO_COOKIE`, `parseCookies`
  are named and typed identically everywhere they're consumed across Tasks 1-3.
