# Real Supabase Auth Migration (Vercel only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom Google-OAuth-then-self-signed-JWT flow with real Supabase Auth on the Vercel (`api/*.ts`) backend only, so Postgres RLS can run as a genuine second, independent layer (keyed on `auth.uid()`) behind the existing `requireHouseholdAccess()` app-layer checks — closing the gap that made the Supabase Advisor's "RLS not enabled" warnings a real (if narrow) issue rather than noise.

**Architecture:** A new `auth_user_map` table links each Supabase Auth uuid to this app's existing Google-`sub`-as-text identity (`app_users.id`) without touching any existing data. `lib/auth.ts` is rewritten to validate a Supabase session instead of a self-signed JWT; every `api/*.ts` data call switches from `anon`/`service_role` keys to the caller's own Supabase access token, so `auth.uid()` is genuinely non-null when RLS evaluates. `netlify/functions/*` and the legacy login UI path are untouched — a Vite build-time flag (`VITE_SUPABASE_AUTH_ENABLED`), set only in Vercel's project env, keeps the single shared frontend bundle's behavior on Netlify byte-for-byte unchanged.

**Tech Stack:** `@supabase/ssr` (server-side session handling over raw `Request`/`Response`), `@supabase/supabase-js` (Admin API, browser client), Postgres RLS + `security definer` helper functions, existing PostgREST-via-`fetch()` pattern (no supabase-js query builder introduced — matches every existing `api/*.ts` file).

**Spec:** `docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md`

## Global Constraints

- **Scope: `api/*.ts` (Vercel) only.** Never edit `netlify/functions/*`. Netlify is still real users' live traffic today (NUT-29 closed with no cutover date) — this migration must have zero effect on it.
- **No existing data is touched.** `app_users`, `households.owner_id`, `personal_plan.user_id`, etc. keep their exact current values. Only additive schema changes (new table, new policies).
- **`requireHouseholdAccess()`'s logic is unchanged** — it stays the first layer, still backed by `service_role`. RLS is added underneath it, never as a replacement.
- **The two RLS helper functions must be `security definer`, `stable`, with a pinned `search_path`, created by a role Postgres doesn't apply RLS to** (the default when run via the Supabase SQL editor). Getting this wrong silently denies every user — verify live before trusting any policy (spec's own emphasis).
- **Session refresh is explicitly out of scope** (per the spec's "Explicitly out of scope" section) — the cookie adapter's `setAll()` is a no-op everywhere except `auth-logout.ts`. Sessions expire per Supabase's configured access-token lifetime (default 1 hour); increasing it is a Supabase dashboard config change, not a code change, if it proves too short in practice.
- **`nutrition.ts` is untouched** — not household-scoped, no owner concept, explicitly out of scope.
- Every code task's "test" step is `npx tsc -p api --noEmit` (per the Vercel migration handoff notes, `api/` isn't covered by the root `tsconfig.json`) — this repo has no test framework covering `api/*.ts` (see `CLAUDE.md`). Live/manual verification is deferred to Task 18.

## Discoveries made while writing this plan (beyond the approved spec)

Two gaps the spec didn't anticipate, found by reading the actual current code:

1. **`api/preparation-batches.ts` doesn't exist yet.** DEC-069's batch-cooking feature was only ever ported to `netlify/functions/`, never to `api/`. Since `preparation_batches` is one of the spec's 9 RLS-covered tables, Task 17 ports it — built directly on the new user-token pattern (never had an anon/service_role split to migrate away from).
2. **The frontend bundle is shared between Netlify and Vercel.** `src/hooks/useAuth.ts` is the single login/session hook for both deploys. Swapping it to Supabase-hosted OAuth unconditionally would break Netlify's real, live login the moment this merges to `master` (Netlify's backend has no Supabase Auth and would never receive the old session cookie the client stops setting). Task 9 resolves this with a Vite build-time flag, `VITE_SUPABASE_AUTH_ENABLED`, set to `"true"` only in Vercel's project env — Netlify's build never sets it, so its build output is provably unchanged.

A third correction to the spec's own RLS table: the spec listed `households` as "SELECT/UPDATE via `has_household_access`" but never specified an INSERT policy — without one, creating a household (`households.ts`'s `POST`) would be silently blocked. Task 3's migration adds `households_insert` (`with check (owner_id = current_app_user_id())`), matching what `handleCreate` already does today.

---

### Task 1: Dependencies and environment variables

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `@supabase/ssr` and `@supabase/supabase-js` available as runtime dependencies for every later task.

- [ ] **Step 1: Move `@supabase/supabase-js` from `devDependencies` to `dependencies`, add `@supabase/ssr`**

In `package.json`, remove this line from `devDependencies`:

```json
    "@supabase/supabase-js": "^2.112.3",
```

Add both to `dependencies` (alongside the existing `google-auth-library`/`jsonwebtoken` entries — those two stay for now, see note below):

```json
    "@supabase/supabase-js": "^2.112.3",
    "@supabase/ssr": "^0.7.0",
```

- [ ] **Step 2: Install and refresh the lockfile**

Run: `npm install`
Expected: `package-lock.json` updates, no errors. `@supabase/ssr` resolves to a real published version (npm will pick the latest matching `^0.7.0` — if that major line has moved on, use whatever `npm view @supabase/ssr version` reports and adjust the `package.json` line to match before running install).

- [ ] **Step 3: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: PASS (no source changes yet, this just confirms the dependency change didn't break anything).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @supabase/ssr, promote @supabase/supabase-js to a runtime dependency"
```

**Note on environment variables (no action here — recorded for Task 2 and Task 18):**

New variables needed, **set only in Vercel's project env** (never Netlify's):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — same values as the existing server-side `SUPABASE_URL`/`SUPABASE_ANON_KEY`, but Vite-prefixed so they're bundled into the client. This is a deliberate, expected change: the anon key is designed by Supabase to be public and is what the browser SDK needs for `signInWithOAuth`/`getUser`/`onAuthStateChange`. It has never been client-exposed before now (everything server-side kept it hidden) — RLS is what makes exposing it safe.
- `VITE_SUPABASE_AUTH_ENABLED=true` — the build-time flag from Discovery 2 above.
- `TEST_LOGIN_SECRET` — same convention as the Netlify version, **preview/dev Vercel environments only, never production**.

Existing `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` are unchanged. `JWT_SECRET`/`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` become unused by `api/*.ts` after Task 8 — harmless to leave set, no action required.

---

### Task 2: Supabase and Google Cloud Console setup (manual, external)

**Files:** none — dashboard configuration only.

- [ ] **Step 1: Enable Google as a Supabase Auth provider**

In the Supabase dashboard: Authentication → Providers → Google → enable it, paste in the existing `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` values (same ones already in Vercel's env for the old flow). Save.

- [ ] **Step 2: Note Supabase's generated callback URL**

Still on that provider page, copy the callback URL Supabase shows (shape: `https://<project-ref>.supabase.co/auth/v1/callback`).

- [ ] **Step 3: Register it in Google Cloud Console**

In the Google Cloud Console project used for this app's OAuth client: Credentials → the existing OAuth 2.0 Client ID → Authorized redirect URIs → add the URL from Step 2. **Do not remove** the existing `https://grocery-five-ecru.vercel.app/api/auth-google-callback` entry yet — Task 8 deletes the code that used it, but leaving the registration in place costs nothing and avoids a mid-migration lockout if something needs rolling back.

- [ ] **Step 4: Confirm**

In the Supabase dashboard, Authentication → Providers → Google should show as enabled with no validation errors.

---

### Task 3: Database migration — `auth_user_map` and real RLS policies

**Files:**
- Create: `supabase/19-auth-user-map-and-rls.sql`

**Interfaces:**
- Produces: `public.auth_user_map` table, `public.current_app_user_id()`, `public.has_household_access(text)` — every later task's RLS behavior depends on these existing and being correct.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/19-auth-user-map-and-rls.sql
--
-- Real Supabase Auth migration (Vercel/api/*.ts only) — see
-- docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md.
--
-- Links Supabase Auth's uuid-per-user identity to this app's existing
-- Google-sub-as-text identity (public.app_users) without touching any
-- existing owner_id/user_id value, then enables real RLS keyed off
-- auth.uid() on every household/user-scoped table, as a second layer behind
-- the existing Netlify/Vercel-function-layer checks (requireHouseholdAccess
-- in lib/auth.ts) — not a replacement for them.
--
-- IMPORTANT: run this via the Supabase SQL editor (or any connection using
-- the `postgres` role) — NOT as an authenticated/anon PostgREST call. The
-- two helper functions below are `security definer`, owned by whichever
-- role runs this script; if that role is itself subject to RLS, every
-- policy that depends on these functions will silently deny every user.
-- This is the single most important thing to verify live after running
-- this migration (see Task 18).
--
-- Idempotent: safe to re-run.

create table if not exists public.auth_user_map (
  supabase_uid uuid primary key references auth.users(id) on delete cascade,
  app_user_id  text not null unique references public.app_users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

alter table public.auth_user_map enable row level security;
-- No policy: locked to service_role only, same as public.app_users already is.

create or replace function public.current_app_user_id()
returns text
language sql stable security definer set search_path = public
as $$
  select app_user_id from public.auth_user_map where supabase_uid = auth.uid()
$$;

create or replace function public.has_household_access(hh_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = hh_id and h.owner_id = public.current_app_user_id()
  ) or exists (
    select 1 from public.household_shares s
    -- lower() on both sides: household-shares.ts always lowercases before
    -- writing (see handleInvite), but auth.email() reflects whatever case
    -- Google/Supabase returned — must normalize the same way the app layer
    -- does (_auth.ts's user.email.toLowerCase()), or this OR-branch can
    -- silently deny a legitimately shared user on a mixed-case address.
    where s.household_id = hh_id and lower(s.email) = lower(auth.email())
  )
$$;

-- households: members can read/rename, only the owner can delete; creating
-- one sets owner_id to yourself.
alter table public.households enable row level security;

drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (public.has_household_access(id));

drop policy if exists households_update on public.households;
create policy households_update on public.households
  for update using (public.has_household_access(id))
  with check (public.has_household_access(id));

drop policy if exists households_insert on public.households;
create policy households_insert on public.households
  for insert with check (owner_id = public.current_app_user_id());

drop policy if exists households_delete on public.households;
create policy households_delete on public.households
  for delete using (owner_id = public.current_app_user_id());

-- lists, items: SELECT only — dead-write scaffolding today (see
-- docs/architecture.md's Sync section); nothing writes them live.
alter table public.lists enable row level security;

drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists
  for select using (public.has_household_access(household_id));

alter table public.items enable row level security;

drop policy if exists items_select on public.items;
create policy items_select on public.items
  for select using (
    exists (
      select 1 from public.lists l
      where l.id = items.list_id and public.has_household_access(l.household_id)
    )
  );

-- item_category_memory, meal_entries, preparation_batches, sync_state: full
-- CRUD, actively read/written household-scoped tables.
alter table public.item_category_memory enable row level security;

drop policy if exists item_category_memory_all on public.item_category_memory;
create policy item_category_memory_all on public.item_category_memory
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.meal_entries enable row level security;

drop policy if exists meal_entries_all on public.meal_entries;
create policy meal_entries_all on public.meal_entries
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.preparation_batches enable row level security;

drop policy if exists preparation_batches_all on public.preparation_batches;
create policy preparation_batches_all on public.preparation_batches
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

alter table public.sync_state enable row level security;

drop policy if exists sync_state_all on public.sync_state;
create policy sync_state_all on public.sync_state
  for all using (public.has_household_access(household_id))
  with check (public.has_household_access(household_id));

-- personal_plan, hidden_households: per-person, keyed by the owning user.
alter table public.personal_plan enable row level security;

drop policy if exists personal_plan_all on public.personal_plan;
create policy personal_plan_all on public.personal_plan
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

alter table public.hidden_households enable row level security;

drop policy if exists hidden_households_all on public.hidden_households;
create policy hidden_households_all on public.hidden_households
  for all using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

-- household_shares: owner-only for every operation (matches
-- requireHouseholdAccess(..., { ownerOnly: true }) used on every call in
-- household-shares.ts).
alter table public.household_shares enable row level security;

drop policy if exists household_shares_owner_all on public.household_shares;
create policy household_shares_owner_all on public.household_shares
  for all using (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = public.current_app_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_shares.household_id
        and h.owner_id = public.current_app_user_id()
    )
  );
```

- [ ] **Step 2: Run it against the real Supabase project**

Paste the file into the Supabase SQL editor (this runs as the `postgres` role, satisfying the `security definer` ownership requirement) and execute. Expected: no errors, all `create table`/`alter table`/`create policy` statements succeed.

- [ ] **Step 3: Sanity-check the helper functions directly**

In the SQL editor, run:

```sql
select proname, prosecdef from pg_proc where proname in ('current_app_user_id', 'has_household_access');
```

Expected: two rows, both with `prosecdef = true` (confirms `security definer` actually took effect).

- [ ] **Step 4: Commit**

```bash
git add supabase/19-auth-user-map-and-rls.sql
git commit -m "feat: add auth_user_map and real per-row RLS policies (Vercel-only)"
```

---

### Task 4: Rewrite `lib/auth.ts` for Supabase session validation

**Files:**
- Modify: `lib/auth.ts` (full rewrite)

**Interfaces:**
- Consumes: `public.auth_user_map` (Task 3), `@supabase/ssr` (Task 1).
- Produces: `AuthUser = { userId: string; email: string; accessToken: string }`, `requireUser(request): Promise<AuthUser>`, `userRestHeaders(user): Record<string,string>`, `requireHouseholdAccess(householdId, user, opts?): Promise<void>` (signature unchanged), `authErrorResponse(err): Response` (unchanged), `AuthError` (unchanged). Every later task (5-17) imports from here.

- [ ] **Step 1: Replace the file**

```ts
// Shared session validation for Vercel Functions. Every function that
// touches Supabase data calls requireUser() first; on failure it throws
// AuthError, which callers catch and translate to a Response via
// authErrorResponse(). Validates a real Supabase Auth session (see
// api/auth-link.ts for how a Supabase identity gets linked to this app's
// existing app_users/household model).
//
// Session refresh is deliberately not implemented here — the cookie
// adapter below never rewrites cookies. Sessions expire per Supabase's
// configured access-token lifetime (default 1 hour). This is an explicit,
// approved scope boundary (see
// docs/superpowers/specs/2026-09-09-supabase-auth-migration-design.md),
// the same class of tradeoff as this app's original JWT session having no
// refresh flow.

import { createServerClient } from "@supabase/ssr";

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
    throw new AuthError(409, "account not linked — call /api/auth-link first");
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: FAIL at this point — every file still importing the old shape compiles against the same exported names (`requireUser`, `requireHouseholdAccess`, `authErrorResponse`, `AuthUser`), so this specific file should actually typecheck cleanly on its own; failures, if any, will be reported against files not yet updated (`api/auth-google-callback.ts`, `api/auth-google-start.ts` reference `jsonwebtoken`/cookie logic removed from here — expected, Task 8 deletes them). Confirm the only errors are in those two files.

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: rewrite lib/auth.ts to validate real Supabase Auth sessions"
```

---

### Task 5: New `api/auth-link.ts` — identity-linking endpoint

**Files:**
- Create: `api/auth-link.ts`

**Interfaces:**
- Consumes: `@supabase/ssr`'s `createServerClient`, `public.app_users`/`public.auth_user_map` (Task 3).
- Produces: `POST /api/auth-link -> { ok: true, userId: string } | { error: string }`. Client-side Task 9 calls this once per sign-in, before relying on `requireUser()` elsewhere.

This is the single most security-sensitive file in this migration (per the spec's "Honest framing" section) — it is the one place `service_role` still writes user-identity data, at the exact seam between the old and new identity systems.

- [ ] **Step 1: Write the file**

```ts
// POST /api/auth-link -> { ok: true, userId: string }
//
// Called once by the client right after Supabase's onAuthStateChange fires
// SIGNED_IN (see src/hooks/useAuth.ts). Resolves the Google `sub` from the
// verified Supabase session, upserts app_users (unchanged shape) and
// auth_user_map. Deliberately does NOT call lib/auth.ts's requireUser() —
// that function requires an auth_user_map row to already exist, which is
// exactly what this endpoint creates on a user's very first login.
//
// Idempotent: safe to call on every sign-in, not just the first.

import { createServerClient } from "@supabase/ssr";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq)] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method.toUpperCase() !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "supabase not configured" }, 500);
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          const jar = parseCookies(request.headers.get("cookie"));
          return Object.entries(jar).map(([name, value]) => ({ name, value }));
        },
        setAll() {},
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || !data.user.email) {
      return json({ error: "invalid or expired session" }, 401);
    }

    const googleIdentity = data.user.identities?.find((i) => i.provider === "google");
    const googleSub =
      googleIdentity?.id ?? (googleIdentity?.identity_data?.sub as string | undefined);
    if (!googleSub) {
      return json({ error: "no linked Google identity" }, 400);
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
      if (!userRes.ok) {
        const text = await userRes.text();
        return json({ error: `failed to upsert app_users: ${text}` }, 502);
      }

      const mapRes = await fetch(`${base}/auth_user_map`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
      });
      if (!mapRes.ok) {
        const text = await mapRes.text();
        return json({ error: `failed to upsert auth_user_map: ${text}` }, 502);
      }
    } catch (e) {
      return json({ error: `link failed: ${e}` }, 500);
    }

    return json({ ok: true, userId: googleSub }, 200);
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add api/auth-link.ts
git commit -m "feat: add api/auth-link.ts to link Supabase Auth identities to app_users"
```

---

### Task 6: New `api/auth-test-login.ts` — Supabase Admin API QA bypass

**Files:**
- Create: `api/auth-test-login.ts`

**Interfaces:**
- Consumes: `@supabase/supabase-js`'s Admin API, `@supabase/ssr`.
- Produces: `GET /api/auth-test-login?secret=<TEST_LOGIN_SECRET>&email=<optional>&returnTo=<optional>` -> 302 with a real working session cookie, or 404. This does not replace an existing Vercel file — `netlify/functions/auth-test-login.ts` exists only on the Netlify side; this is new capability for Vercel, ported in spirit (same double gate) but using Supabase Auth's Admin API instead of hand-signing a JWT.

- [ ] **Step 1: Write the file**

```ts
// GET /api/auth-test-login?secret=<TEST_LOGIN_SECRET>&email=<optional>&returnTo=<optional>
// -> 302 redirect with a real, working Supabase session cookie set, without
// touching real Google. Mirrors netlify/functions/auth-test-login.ts's
// intent and double gate, ported to Supabase Auth's Admin API (this file is
// new on the Vercel side — there was no prior api/auth-test-login.ts).
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
    // (api/auth-link.ts) — the test user's "Google sub" is just a stable
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
    await fetch(`${base}/app_users`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ id: appUserId, email }),
    });
    await fetch(`${base}/auth_user_map`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ supabase_uid: supabaseUid, app_user_id: appUserId }),
    });

    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: no new errors. If the installed `@supabase/supabase-js`/`@supabase/ssr` versions' Admin API types differ slightly from what's used here (e.g. `generateLink`'s return shape), fix against the actual installed `.d.ts` rather than guessing — this is exactly the kind of integration detail that varies by version.

- [ ] **Step 3: Commit**

```bash
git add api/auth-test-login.ts
git commit -m "feat: add Supabase-Admin-API-based test login for Vercel previews"
```

---

### Task 7: Rewrite `api/auth-logout.ts`

**Files:**
- Modify: `api/auth-logout.ts` (full rewrite)

**Interfaces:**
- Consumes: `@supabase/ssr`.
- Produces: `POST /api/auth-logout -> { ok: true }`, same as before, now clearing Supabase's session cookies instead of the old custom one.

This is the one file in the whole migration where the cookie adapter's `setAll()` must actually apply (not the no-op used everywhere else) — its entire job is clearing cookies.

- [ ] **Step 1: Replace the file**

```ts
// POST /api/auth-logout -> { ok: true }, clears the Supabase session
// cookies via supabase.auth.signOut().

import { createServerClient } from "@supabase/ssr";

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq)] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

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
      cookies: {
        getAll() {
          const jar = parseCookies(request.headers.get("cookie"));
          return Object.entries(jar).map(([name, value]) => ({ name, value }));
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

    await supabase.auth.signOut();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add api/auth-logout.ts
git commit -m "feat: clear Supabase session cookies on logout"
```

---

### Task 8: Delete the old Google OAuth endpoints

**Files:**
- Delete: `api/auth-google-callback.ts`
- Delete: `api/auth-google-start.ts`

**Interfaces:** none — Supabase's own hosted OAuth (Task 2) replaces both entirely.

- [ ] **Step 1: Delete the files**

```bash
git rm api/auth-google-callback.ts api/auth-google-start.ts
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: PASS, zero errors — this is the point where the whole `api/` tree should compile clean again (everything up to here has been additive or self-contained).

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: remove the custom Google OAuth endpoints, superseded by Supabase-hosted OAuth"
```

---

### Task 9: Client-side — Supabase browser client and `useAuth.ts`, gated by a build-time flag

**Files:**
- Create: `src/lib/supabaseAuthClient.ts`
- Modify: `src/hooks/useAuth.ts` (full rewrite)

**Interfaces:**
- Consumes: `import.meta.env.VITE_SUPABASE_AUTH_ENABLED`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Task 1's env var notes); `/api/auth-link` (Task 5), `/api/auth-session` (unchanged — still compatible, see Step 3 below).
- Produces: `useAuth()` returns the exact same shape as before (`{ session, checked, signInWithGoogle, signOut, deleteAccount }`) — `App.tsx` and every consumer of `session.userId`/`session.email` needs zero changes.

**This is the fix for Discovery 2** — without the `supabaseAuthEnabled` branch, this change would break Netlify's live login (same shared bundle, no Supabase Auth on that backend).

- [ ] **Step 1: Create the browser client module**

```ts
// src/lib/supabaseAuthClient.ts
//
// Only used when VITE_SUPABASE_AUTH_ENABLED="true" — set in Vercel's
// project env only. Netlify's build never sets this, so its bundle never
// calls getSupabaseAuthClient() and this module's import has no runtime
// effect there beyond being dead code in the bundle.

import { createBrowserClient } from "@supabase/ssr";

export const supabaseAuthEnabled = import.meta.env.VITE_SUPABASE_AUTH_ENABLED === "true";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseAuthClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !anonKey) {
      throw new Error("VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not configured");
    }
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
```

- [ ] **Step 2: Replace `src/hooks/useAuth.ts`**

```ts
import { useEffect, useState } from "react";
import { getSupabaseAuthClient, supabaseAuthEnabled } from "../lib/supabaseAuthClient";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!supabaseAuthEnabled) {
      fetchAppSession();
      return;
    }
    fetchAppSessionAfterSupabaseCheck();
    const supabase = getSupabaseAuthClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void fetchAppSessionAfterSupabaseCheck();
      if (event === "SIGNED_OUT") setSession(undefined);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Reads the canonical { email, userId } pair from our own backend — same
  // endpoint, same shape, under either auth mode. userId here is always
  // app_users.id (the Google sub), never a raw Supabase uuid — TenantSwitcher
  // etc. compare it directly against households.owner_id.
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

  async function fetchAppSessionAfterSupabaseCheck(): Promise<void> {
    const supabase = getSupabaseAuthClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSession(undefined);
      setChecked(true);
      return;
    }
    // A fresh login has no app_users/auth_user_map row yet — this call
    // creates it. Safe to call every time: the upserts are idempotent.
    await fetch("/api/auth-link", { method: "POST", credentials: "include" });
    await fetchAppSession();
  }

  function signInWithGoogle() {
    if (supabaseAuthEnabled) {
      void getSupabaseAuthClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      return;
    }
    // Full-page navigation, not fetch — OAuth needs a top-level browser
    // navigation to Google's consent screen.
    window.location.href =
      "/api/auth-google-start?returnTo=" + encodeURIComponent(window.location.href);
  }

  async function signOut() {
    if (supabaseAuthEnabled) {
      await getSupabaseAuthClient().auth.signOut();
    }
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

- [ ] **Step 3: Confirm `/api/auth-session` needs no changes**

Read `api/auth-session.ts` — it calls `requireUser(request)` and returns `{ email: user.email, userId: user.userId }`. Since Task 4's `requireUser()` still resolves `userId` to `app_users.id` via the mapping table, this file's behavior is unchanged. No edit needed; this step is a verification, not a code change.

- [ ] **Step 4: Note — `deleteAccount()` calls a Vercel endpoint that doesn't exist yet**

`api/auth-delete-account.ts` was never ported to Vercel (only `netlify/functions/auth-delete-account.ts` exists) — a pre-existing gap, unrelated to this auth migration and out of scope here. `deleteAccount()` will 404 on Vercel today regardless of this plan; not introduced or worsened by it. Leave as-is.

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b` (this is client code, covered by the root tsconfig, not `api/`'s).
Expected: PASS. If `import.meta.env.VITE_SUPABASE_AUTH_ENABLED` etc. raise a type error, add them to `src/vite-env.d.ts` (or wherever this repo's `ImportMetaEnv` augmentation lives, if any) as optional `string` properties — check for an existing `vite-env.d.ts` first rather than assuming one needs creating.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabaseAuthClient.ts src/hooks/useAuth.ts
git commit -m "feat: add Supabase-hosted OAuth to useAuth.ts, gated by VITE_SUPABASE_AUTH_ENABLED"
```

---

### Task 10: Rewrite `api/households.ts` to use the caller's own token

**Files:**
- Modify: `api/households.ts` (full rewrite)

**Interfaces:**
- Consumes: `userRestHeaders` (Task 4).
- Produces: same HTTP surface as before (`GET`/`POST`/`PATCH`/`DELETE /api/households`), now RLS-backed. The list-mode `GET` (no `?id=`) is simplified: it used to manually fetch `household_shares` and build an `or=(owner_id.eq...,id.in.(...))` filter — that filtering is now what `households_select`'s RLS policy (Task 3) already does, so the manual filter is redundant and removed.

- [ ] **Step 1: Replace the file**

```ts
// GET    /api/households?id=<id>     -> Household       (read by id; access-gated)
// GET    /api/households              -> Household[]     (list; RLS-filtered to owned + invited)
// POST   /api/households              -> Household       (create; creator becomes owner)
// PATCH  /api/households               -> Household       (rename; any member)
// DELETE /api/households?id=<id>     -> { ok: true }     (delete; owner only)
//
// Every request authenticates to PostgREST as the caller's own Supabase
// session (userRestHeaders) — RLS (supabase/19-auth-user-map-and-rls.sql)
// is the real filter for the list/read paths; requireHouseholdAccess stays
// as the first-layer check for write paths, matching every other function.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

export type Household = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string | null;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request, user);
  if (method === "POST") return handleCreate(request, user);
  if (method === "PATCH") return handleRename(request, user);
  if (method === "DELETE") return handleDelete(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const headers = userRestHeaders(user);

  if (id) {
    try {
      await requireHouseholdAccess(id, user);
    } catch (err) {
      return authErrorResponse(err);
    }
    try {
      const target = `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}&select=*`;
      const response = await fetch(target, { headers });
      if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
      const data = (await response.json()) as Household[];
      if (data.length === 0) return json({ error: "household not found" }, 404);
      return json(data[0], 200);
    } catch (e) {
      return json({ error: `failed to fetch household: ${e}` }, 500);
    }
  }

  // No id: list every household this user can access. RLS's
  // households_select policy already restricts this to owned + invited —
  // no manual owner/shares filter needed on this side anymore.
  try {
    const target = `${restBase(supabaseUrl)}/households?select=*&order=created_at.asc`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as Household[];
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch households: ${e}` }, 500);
  }
}

async function handleCreate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { id?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; name?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(body.id.trim())) {
    return json({ error: "expected id: string (alphanumeric, underscore, hyphen, 1-64 chars)" }, 400);
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return json({ error: "expected name: string (non-empty)" }, 400);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = { id: body.id.trim(), name: body.name.trim(), owner_id: user.userId };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/households`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 409 ? 409 : 502
      );
    }
    const data = (await response.json()) as Household[];
    if (data.length === 0) {
      return json({ error: "household creation failed" }, 500);
    }
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create household: ${e}` }, 500);
  }
}

async function handleRename(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { id?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; name?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || body.id.trim().length === 0) {
    return json({ error: "expected id: string (non-empty)" }, 400);
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return json({ error: "expected name: string (non-empty)" }, 400);
  }

  const id = body.id.trim();
  try {
    await requireHouseholdAccess(id, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ name: body.name.trim() }),
      }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 404 ? 404 : 502
      );
    }
    const data = (await response.json()) as Household[];
    if (data.length === 0) return json({ error: "household not found" }, 404);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to rename household: ${e}` }, 500);
  }
}

async function handleDelete(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<id>" }, 400);
  }

  try {
    await requireHouseholdAccess(id, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = { ...userRestHeaders(user), prefer: "return=representation" };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    const data = (await response.json()) as unknown[];
    if (data.length === 0) return json({ error: "household not found" }, 404);

    // sync_state cascades automatically (FK ON DELETE CASCADE) — no manual
    // cleanup needed here.
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to delete household: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p api --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add api/households.ts
git commit -m "refactor: api/households.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 11: Rewrite `api/household-shares.ts`

**Files:**
- Modify: `api/household-shares.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
// GET    /api/household-shares?household_id=<id>                  -> string[]     (invited emails; owner only, 404 otherwise)
// POST   /api/household-shares  { household_id, email }            -> { ok: true } (invite; owner only)
// DELETE /api/household-shares?household_id=<id>&email=<email>     -> { ok: true } (revoke; owner only)
//
// Owner-only management of who else can access a household. Every request
// authenticates to PostgREST as the caller's own Supabase session — RLS's
// household_shares_owner_all policy backs the same owner-only restriction
// requireHouseholdAccess({ ownerOnly: true }) already enforces.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

type ShareRow = { email: string };

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request, user);
  if (method === "POST") return handleInvite(request, user);
  if (method === "DELETE") return handleRevoke(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  if (!householdId) {
    return json({ error: "expected ?household_id=<id>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);

  try {
    const target = `${restBase(supabaseUrl)}/household_shares?household_id=eq.${encodeURIComponent(
      householdId
    )}&select=email&order=created_at.asc`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as ShareRow[];
    return json(data.map((r) => r.email), 200);
  } catch (e) {
    return json({ error: `failed to list household shares: ${e}` }, 500);
  }
}

async function handleInvite(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { household_id?: unknown; email?: unknown };
  try {
    body = (await request.json()) as { household_id?: unknown; email?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const householdId = typeof body.household_id === "string" ? body.household_id.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!householdId || !email) {
    return json({ error: "expected { household_id, email }" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "resolution=merge-duplicates,return=minimal",
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/household_shares`, {
      method: "POST",
      headers,
      body: JSON.stringify({ household_id: householdId, email }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to invite: ${e}` }, 500);
  }
}

async function handleRevoke(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!householdId || !email) {
    return json({ error: "expected ?household_id=<id>&email=<email>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = { ...userRestHeaders(user), prefer: "return=minimal" };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/household_shares?household_id=eq.${encodeURIComponent(
        householdId
      )}&email=eq.${encodeURIComponent(email)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to revoke: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/household-shares.ts
git commit -m "refactor: api/household-shares.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 12: Rewrite `api/hidden-households.ts`

**Files:**
- Modify: `api/hidden-households.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
// GET    /api/hidden-households                       -> string[]     (household ids hidden by this user)
// POST   /api/hidden-households  { household_id }     -> { ok: true } (hide)
// DELETE /api/hidden-households?household_id=<id>     -> { ok: true } (unhide)
//
// Per-user preference. Every request authenticates to PostgREST as the
// caller's own Supabase session — RLS's hidden_households_all policy
// backs the existing user_id-scoped behavior.

import { requireUser, userRestHeaders, authErrorResponse, type AuthUser } from "../lib/auth.js";

type HiddenRow = { household_id: string };

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(user);
  if (method === "POST") return handleHide(request, user);
  if (method === "DELETE") return handleUnhide(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const headers = userRestHeaders(user);

  try {
    const target = `${restBase(supabaseUrl)}/hidden_households?user_id=eq.${encodeURIComponent(user.userId)}&select=household_id`;
    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as HiddenRow[];
    return json(data.map((r) => r.household_id), 200);
  } catch (e) {
    return json({ error: `failed to list hidden households: ${e}` }, 500);
  }
}

async function handleHide(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { household_id?: unknown };
  try {
    body = (await request.json()) as { household_id?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body.household_id !== "string" || body.household_id.trim().length === 0) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    // Upsert semantics: if the row already exists, do nothing rather than 409.
    prefer: "resolution=merge-duplicates,return=minimal",
  };

  const payload = { user_id: user.userId, household_id: body.household_id.trim() };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/hidden_households`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to hide household: ${e}` }, 500);
  }
}

async function handleUnhide(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  if (!householdId) {
    return json({ error: "expected ?household_id=<id>" }, 400);
  }

  const headers = { ...userRestHeaders(user), prefer: "return=minimal" };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/hidden_households?user_id=eq.${encodeURIComponent(user.userId)}&household_id=eq.${encodeURIComponent(householdId)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to unhide household: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/hidden-households.ts
git commit -m "refactor: api/hidden-households.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 13: Rewrite `api/item-category-memory.ts`

**Files:**
- Modify: `api/item-category-memory.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
// GET /api/item-category-memory?household_id=<id>            -> Row[]   (read)
// PUT /api/item-category-memory  { household_id, name_lower, category } -> Row (upsert)
//
// Every request authenticates to PostgREST as the caller's own Supabase
// session — RLS's item_category_memory_all policy backs the existing
// owner/invited household access, on top of requireHouseholdAccess.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

type Row = {
  name_lower: string;
  category: string;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS = "name_lower,category";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request, user);
  if (method === "PUT") return handleWrite(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  if (!householdId) {
    return json({ error: "expected ?household_id=<id>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);

  try {
    const res = await fetch(
      `${restBase(supabaseUrl)}/item_category_memory?select=${SELECT_COLS}&household_id=eq.${encodeURIComponent(
        householdId
      )}`,
      { headers }
    );
    if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
    const rows = ((await res.json()) as unknown[]) ?? [];
    const coerced = rows.map(coerce).filter((r): r is Row => r !== null);
    return json(coerced, 200);
  } catch (err) {
    return json({ error: String(err) }, 502);
  }
}

async function handleWrite(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { household_id?: unknown; name_lower?: unknown; category?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const household_id = typeof body.household_id === "string" ? body.household_id.trim() : "";
  const name_lower = typeof body.name_lower === "string" ? body.name_lower.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!household_id || !name_lower || !category) {
    return json({ error: "expected { household_id, name_lower, category }" }, 400);
  }

  try {
    await requireHouseholdAccess(household_id, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const res = await fetch(
      `${restBase(supabaseUrl)}/item_category_memory?select=${SELECT_COLS}`,
      {
        method: "POST",
        headers: {
          ...userRestHeaders(user),
          "content-type": "application/json",
          prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({ household_id, name_lower, category }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      return json({ error: `supabase ${res.status}: ${text}` }, 502);
    }
    const returned = (await res.json()) as unknown;
    const saved = Array.isArray(returned) ? returned.map(coerce).filter((r): r is Row => r !== null) : [];
    if (saved.length === 0) return json({ error: "supabase returned no row" }, 502);
    return json(saved[0], 200);
  } catch (err) {
    return json({ error: String(err) }, 502);
  }
}

function coerce(row: unknown): Row | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (typeof r.name_lower !== "string" || typeof r.category !== "string") return null;
  return { name_lower: r.name_lower, category: r.category };
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/item-category-memory.ts
git commit -m "refactor: api/item-category-memory.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 14: Rewrite `api/meal-entries.ts`

**Files:**
- Modify: `api/meal-entries.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
// GET    /api/meal-entries?householdId=<id>&from=<date>&to=<date>  -> MealEntryRow[]  (read range)
// POST   /api/meal-entries                                          -> MealEntryRow    (create)
// PATCH  /api/meal-entries?id=<id>                                  -> MealEntryRow    (update)
// DELETE /api/meal-entries?id=<id>                                  -> { ok: true }    (delete)
//
// Persists the Meal Plan tab's daily food+quantity entries. Nutrition is
// never stored here. Every request authenticates to PostgREST as the
// caller's own Supabase session — RLS's meal_entries_all policy backs the
// existing owner/invited household access, on top of requireHouseholdAccess.
// The one lookup that must stay on service_role is mealEntryHouseholdId:
// resolving which household an entry belongs to, for a PATCH/DELETE that
// only has the entry's own id, needs to work even for an entry a stranger
// is trying to touch — the access decision comes after that lookup, not
// from it.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

export type MealEntryRow = {
  id: string;
  household_id: string;
  date: string;
  slot: string;
  food_id: string;
  quantity_g: number;
  position: number;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS = "id,household_id,date,slot,food_id,quantity_g,position";

const VALID_SLOTS = ["kahvalti", "ogle", "aksam", "ara"];

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    let user: AuthUser;
    try {
      user = await requireUser(request);
    } catch (err) {
      return authErrorResponse(err);
    }
    const method = request.method.toUpperCase();
    if (method === "GET") return handleGet(request, user);
    if (method === "POST") return handleCreate(request, user);
    if (method === "PATCH") return handleUpdate(request, user);
    if (method === "DELETE") return handleDelete(request, user);
    return json({ error: "method not allowed" }, 405);
  },
};

async function mealEntryHouseholdId(entryId: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("supabase not configured");
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  const res = await fetch(
    `${restBase(supabaseUrl)}/meal_entries?id=eq.${encodeURIComponent(entryId)}&select=household_id`,
    { headers }
  );
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  const rows = (await res.json()) as { household_id: string }[];
  return rows[0]?.household_id ?? null;
}

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("householdId")?.trim();
  const from = url.searchParams.get("from")?.trim();
  const to = url.searchParams.get("to")?.trim();

  if (!householdId || !from || !to) {
    return json({ error: "expected ?householdId=<id>&from=<date>&to=<date>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);

  try {
    const target =
      `${restBase(supabaseUrl)}/meal_entries?select=${SELECT_COLS}` +
      `&household_id=eq.${encodeURIComponent(householdId)}` +
      `&date=gte.${encodeURIComponent(from)}&date=lte.${encodeURIComponent(to)}` +
      `&order=date.asc,slot.asc,position.asc`;

    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as MealEntryRow[];
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch meal entries: ${e}` }, 500);
  }
}

async function handleCreate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: {
    id?: unknown;
    household_id?: unknown;
    date?: unknown;
    slot?: unknown;
    food_id?: unknown;
    quantity_g?: unknown;
    position?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || body.id.trim().length === 0) {
    return json({ error: "expected id: string (non-empty)" }, 400);
  }
  if (typeof body.household_id !== "string" || body.household_id.trim().length === 0) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }

  try {
    await requireHouseholdAccess(body.household_id.trim(), user);
  } catch (err) {
    return authErrorResponse(err);
  }

  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return json({ error: "expected date: string (YYYY-MM-DD)" }, 400);
  }
  if (typeof body.slot !== "string" || !VALID_SLOTS.includes(body.slot)) {
    return json({ error: "expected slot: 'kahvalti' | 'ogle' | 'aksam' | 'ara'" }, 400);
  }
  if (typeof body.food_id !== "string" || body.food_id.trim().length === 0) {
    return json({ error: "expected food_id: string (non-empty)" }, 400);
  }
  if (typeof body.quantity_g !== "number" || !Number.isFinite(body.quantity_g) || body.quantity_g <= 0) {
    return json({ error: "expected quantity_g: positive number" }, 400);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = {
    id: body.id.trim(),
    household_id: body.household_id.trim(),
    date: body.date,
    slot: body.slot,
    food_id: body.food_id.trim(),
    quantity_g: body.quantity_g,
    position: typeof body.position === "number" ? body.position : 0,
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/meal_entries`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 409 ? 409 : 502
      );
    }
    const data = (await response.json()) as MealEntryRow[];
    if (data.length === 0) return json({ error: "meal entry creation failed" }, 500);
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create meal entry: ${e}` }, 500);
  }
}

async function handleUpdate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }

  let householdId: string | null;
  try {
    householdId = await mealEntryHouseholdId(id);
  } catch (e) {
    return json({ error: `failed to look up meal entry: ${e}` }, 502);
  }
  if (householdId === null) return json({ error: "not found" }, 404);
  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  let body: { quantity_g?: unknown; position?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const payload: Record<string, unknown> = {};
  if (body.quantity_g !== undefined) {
    if (typeof body.quantity_g !== "number" || !Number.isFinite(body.quantity_g) || body.quantity_g <= 0) {
      return json({ error: "quantity_g must be a positive number" }, 400);
    }
    payload.quantity_g = body.quantity_g;
  }
  if (typeof body.position === "number") payload.position = body.position;

  if (Object.keys(payload).length === 0) {
    return json({ error: "no fields to update (quantity_g, position)" }, 400);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/meal_entries?id=eq.${encodeURIComponent(id)}`,
      { method: "PATCH", headers, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 404 ? 404 : 502
      );
    }
    const data = (await response.json()) as MealEntryRow[];
    if (data.length === 0) return json({ error: "meal entry not found" }, 404);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to update meal entry: ${e}` }, 500);
  }
}

async function handleDelete(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }

  let householdId: string | null;
  try {
    householdId = await mealEntryHouseholdId(id);
  } catch (e) {
    return json({ error: `failed to look up meal entry: ${e}` }, 502);
  }
  if (householdId === null) return json({ error: "not found" }, 404);
  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/meal_entries?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to delete meal entry: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/meal-entries.ts
git commit -m "refactor: api/meal-entries.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 15: Rewrite `api/personal-plan.ts`

**Files:**
- Modify: `api/personal-plan.ts` (full rewrite)

- [ ] **Step 1: Replace the file**

```ts
// GET /api/personal-plan  -> PersonalPlanRow | null  (read the caller's own profile)
// PUT /api/personal-plan  { ...profile }             -> PersonalPlanRow  (upsert)
//
// One profile per logged-in user, scoped entirely by the session's userId
// (never a client-supplied id) — no separate access check needed beyond
// requireUser. Every request authenticates to PostgREST as the caller's own
// Supabase session — RLS's personal_plan_all policy (user_id =
// current_app_user_id()) backs this.

import { requireUser, userRestHeaders, authErrorResponse, type AuthUser } from "../lib/auth.js";

export type PersonalPlanRow = {
  user_id: string;
  name: string;
  equation_sex: string;
  age_years: number;
  height_cm: number;
  weight_kg: number;
  activity: string;
  goal: string;
  waist_cm: number | null;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS =
  "user_id,name,equation_sex,age_years,height_cm,weight_kg,activity,goal,waist_cm";

const VALID_SEX = ["female", "male"];
const VALID_ACTIVITY = ["sedentary", "light", "moderate", "high", "very_high"];
const VALID_GOAL = ["maintain", "loss", "gain"];

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    let user: AuthUser;
    try {
      user = await requireUser(request);
    } catch (err) {
      return authErrorResponse(err);
    }
    const method = request.method.toUpperCase();
    if (method === "GET") return handleGet(user);
    if (method === "PUT") return handleWrite(request, user);
    return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const headers = userRestHeaders(user);

  try {
    const target = `${restBase(supabaseUrl)}/personal_plan?select=${SELECT_COLS}&user_id=eq.${encodeURIComponent(
      user.userId
    )}`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as PersonalPlanRow[];
    return json(data[0] ?? null, 200);
  } catch (e) {
    return json({ error: `failed to fetch personal plan: ${e}` }, 500);
  }
}

async function handleWrite(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: {
    name?: unknown;
    equation_sex?: unknown;
    age_years?: unknown;
    height_cm?: unknown;
    weight_kg?: unknown;
    activity?: unknown;
    goal?: unknown;
    waist_cm?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return json({ error: "expected name: string (non-empty)" }, 400);
  if (typeof body.equation_sex !== "string" || !VALID_SEX.includes(body.equation_sex)) {
    return json({ error: "expected equation_sex: 'female' | 'male'" }, 400);
  }
  if (typeof body.activity !== "string" || !VALID_ACTIVITY.includes(body.activity)) {
    return json({ error: "invalid activity" }, 400);
  }
  if (typeof body.goal !== "string" || !VALID_GOAL.includes(body.goal)) {
    return json({ error: "expected goal: 'maintain' | 'loss' | 'gain'" }, 400);
  }
  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const ageYears = num(body.age_years);
  const heightCm = num(body.height_cm);
  const weightKg = num(body.weight_kg);
  if (ageYears === null || heightCm === null || weightKg === null) {
    return json({ error: "age_years, height_cm, weight_kg must be numbers" }, 400);
  }
  const waistCm = body.waist_cm === undefined || body.waist_cm === null ? null : num(body.waist_cm);

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "resolution=merge-duplicates,return=representation",
  };

  const payload = {
    user_id: user.userId,
    name,
    equation_sex: body.equation_sex,
    age_years: ageYears,
    height_cm: heightCm,
    weight_kg: weightKg,
    activity: body.activity,
    goal: body.goal,
    waist_cm: waistCm,
    updated_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/personal_plan?select=${SELECT_COLS}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    const data = (await response.json()) as PersonalPlanRow[];
    if (data.length === 0) return json({ error: "personal plan save failed" }, 500);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to save personal plan: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/personal-plan.ts
git commit -m "refactor: api/personal-plan.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 16: Rewrite `api/state.ts`

**Files:**
- Modify: `api/state.ts` (full rewrite)

**Interfaces:** `hydrateFromSupabase` gains a `user: AuthUser` parameter — its caller (`handleGet`) is updated accordingly.

- [ ] **Step 1: Replace the file**

```ts
// Shared grocery state.
// Backed by the `sync_state` Supabase table (one row per tenant):
// household_id -> { version, state }. Concurrent PUTs are last-write-wins by
// design; the version check is an optimistic-concurrency guard, not a
// transaction. Fine for a household of 2-4.
//
// Every request authenticates to PostgREST as the caller's own Supabase
// session — RLS's sync_state_all / lists_select / items_select policies
// back the existing owner/invited household access, on top of
// requireHouseholdAccess.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

type Envelope = { version: number; state: unknown };

// Shape mirrors src/lib/store.ts State/List/Item. Kept as a local type so this
// function doesn't need to import client code.
type HydratedItem = {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
  addedAt: number;
  category?: string;
};
type HydratedList = {
  id: string;
  title: string;
  createdAt: number;
  closedAt?: number;
  items: HydratedItem[];
};
type HydratedState = {
  lists: HydratedList[];
  activeId: string | null;
  version?: number;
  groupByCategory?: boolean;
};

const DEFAULT_TENANT = "default";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function tenantIdFrom(request: Request): string {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tenant")?.trim();
  if (!raw) return DEFAULT_TENANT;
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return safe || DEFAULT_TENANT;
}

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const tenantId = tenantIdFrom(request);
  try {
    await requireHouseholdAccess(tenantId, user);
  } catch (err) {
    return authErrorResponse(err);
  }
  const method = request.method.toUpperCase();

  if (method === "GET") return handleGet(tenantId, user);
  if (method === "PUT") return handlePut(request, tenantId, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function fetchRow(
  supabaseUrl: string,
  headers: Record<string, string>,
  tenantId: string
): Promise<{ version: number; state: unknown } | null> {
  const response = await fetch(
    `${restBase(supabaseUrl)}/sync_state?household_id=eq.${encodeURIComponent(tenantId)}&select=version,state`,
    { headers }
  );
  if (!response.ok) throw new Error(`supabase ${response.status}`);
  const rows = (await response.json()) as Array<{ version: number; state: unknown }>;
  return rows[0] ?? null;
}

async function handleGet(tenantId: string, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let row: { version: number; state: unknown } | null;
  try {
    row = await fetchRow(supabaseUrl, userRestHeaders(user), tenantId);
  } catch (err) {
    console.error(`[state] Supabase read failed tenant=${tenantId}:`, err);
    return json({ error: "storage read failed" }, 500);
  }
  if (row) {
    return json({ version: row.version, state: row.state }, 200);
  }

  // No row for this tenant yet: try hydrating from Supabase (households/lists/items).
  // One-time bridge — the first client PUT will populate sync_state and this
  // path won't run again for that tenant.
  const hydrated = await hydrateFromSupabase(tenantId, user);
  if (hydrated) {
    console.info(`[state] hydrated tenant=${tenantId} from Supabase (${hydrated.lists.length} lists)`);
    return json({ version: 0, state: hydrated }, 200);
  }

  return json({ version: 0, state: null }, 200);
}

async function hydrateFromSupabase(householdId: string, user: AuthUser): Promise<HydratedState | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  const base = restBase(supabaseUrl);
  const headers = userRestHeaders(user);

  try {
    const listsRes = await fetch(
      `${base}/lists?select=id,title,created_at,closed_at&household_id=eq.${encodeURIComponent(
        householdId
      )}&order=created_at.desc`,
      { headers }
    );
    if (!listsRes.ok) {
      console.error(`[state] hydrateFromSupabase: lists fetch failed tenant=${householdId} status=${listsRes.status}`);
      return null;
    }
    const listRows = (await listsRes.json()) as Array<{
      id: string;
      title: string;
      created_at: string;
      closed_at: string | null;
    }>;
    if (listRows.length === 0) return null;

    const listIds = listRows.map((l) => l.id);
    const inClause = `(${listIds.map((id) => `"${id}"`).join(",")})`;
    const itemsRes = await fetch(
      `${base}/items?select=id,list_id,name,qty,checked,category,added_at&list_id=in.${encodeURIComponent(
        inClause
      )}&order=added_at.asc`,
      { headers }
    );
    if (!itemsRes.ok) {
      console.error(`[state] hydrateFromSupabase: items fetch failed tenant=${householdId} status=${itemsRes.status}`);
      return null;
    }
    const itemRows = (await itemsRes.json()) as Array<{
      id: string;
      list_id: string;
      name: string;
      qty: string;
      checked: boolean;
      category: string | null;
      added_at: string;
    }>;

    const itemsByList = new Map<string, HydratedItem[]>();
    for (const row of itemRows) {
      const arr = itemsByList.get(row.list_id) ?? [];
      arr.push({
        id: row.id,
        name: row.name,
        qty: row.qty,
        checked: row.checked,
        addedAt: Date.parse(row.added_at),
        ...(row.category ? { category: row.category } : {}),
      });
      itemsByList.set(row.list_id, arr);
    }

    const lists: HydratedList[] = listRows.map((l) => ({
      id: l.id,
      title: l.title,
      createdAt: Date.parse(l.created_at),
      ...(l.closed_at ? { closedAt: Date.parse(l.closed_at) } : {}),
      items: itemsByList.get(l.id) ?? [],
    }));

    const active = lists.find((l) => l.closedAt === undefined);
    return {
      lists,
      activeId: active?.id ?? lists[0]?.id ?? null,
    };
  } catch (err) {
    console.error(`[state] hydrateFromSupabase threw tenant=${householdId}:`, err);
    return null;
  }
}

async function handlePut(request: Request, tenantId: string, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: Envelope;
  try {
    body = (await request.json()) as Envelope;
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body?.version !== "number" || body.state == null) {
    return json({ error: "expected { version, state }" }, 400);
  }

  const base = restBase(supabaseUrl);
  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  try {
    // Attempt the optimistic-concurrency update first — succeeds whether or
    // not the row previously existed, as long as its version matches.
    const patchRes = await fetch(
      `${base}/sync_state?household_id=eq.${encodeURIComponent(tenantId)}&version=eq.${body.version}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          version: body.version + 1,
          state: body.state,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!patchRes.ok) {
      console.error(`[state] update failed tenant=${tenantId}:`, patchRes.status, await patchRes.text());
      return json({ error: "storage write failed" }, 500);
    }
    const updated = (await patchRes.json()) as Array<{ version: number }>;
    if (updated.length > 0) {
      return json({ version: updated[0].version }, 200);
    }

    // No row matched — either it doesn't exist yet, or the version is stale.
    const current = await fetchRow(supabaseUrl, userRestHeaders(user), tenantId);
    if (current) {
      console.warn(
        `[state] 409 conflict tenant=${tenantId} clientVersion=${body.version} serverVersion=${current.version}`
      );
      return json({ version: current.version, state: current.state }, 409);
    }

    // Genuinely new tenant: insert. ignore-duplicates guards a concurrent
    // first-write race between two clients.
    const insertRes = await fetch(`${base}/sync_state?on_conflict=household_id`, {
      method: "POST",
      headers: { ...headers, prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify({ household_id: tenantId, version: body.version + 1, state: body.state }),
    });
    if (!insertRes.ok) {
      console.error(`[state] insert failed tenant=${tenantId}:`, insertRes.status, await insertRes.text());
      return json({ error: "storage write failed" }, 500);
    }
    const inserted = (await insertRes.json()) as Array<{ version: number }>;
    if (inserted.length === 0) {
      const race = await fetchRow(supabaseUrl, userRestHeaders(user), tenantId);
      return json({ version: race?.version ?? 0, state: race?.state ?? null }, 409);
    }
    return json({ version: inserted[0].version }, 200);
  } catch (err) {
    console.error(`[state] Supabase write failed tenant=${tenantId}:`, err);
    return json({ error: "storage write failed" }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add api/state.ts
git commit -m "refactor: api/state.ts uses the caller's own Supabase token, RLS-backed"
```

---

### Task 17: New `api/preparation-batches.ts` — port from Netlify, built on the new pattern

**Files:**
- Create: `api/preparation-batches.ts`

**Interfaces:**
- Consumes: `userRestHeaders`, `requireHouseholdAccess` (Task 4).
- Produces: `GET /api/preparation-batches?householdId=<id>`, `POST /api/preparation-batches` — same surface as `netlify/functions/preparation-batches.ts`, RLS-backed from the start (Discovery 1).

- [ ] **Step 1: Write the file**

```ts
// GET  /api/preparation-batches?householdId=<id>          -> PreparationBatchRow[]  (all, newest first)
// POST /api/preparation-batches                            -> PreparationBatchRow    (create)
//
// DEC-069 (batch cooking, leftovers, storage-aware planning). Persists an
// immutable snapshot of what was prepared in one cooking occasion — see
// src/lib/preparationBatch.ts. `composition` is written once here and never
// updated by this file — there is deliberately no PATCH/DELETE endpoint (a
// correction creates a new batch, it never edits an existing one). This is
// the Vercel port of netlify/functions/preparation-batches.ts — built
// directly on the caller's-own-token pattern (userRestHeaders), since this
// table didn't exist on Vercel before this migration.
//
// composition[].food_id uses the SAME value space as meal_entries.food_id —
// NOT the opaque Nutrition.food_id UUID. This function does not interpret
// food_id at all; it is validated only as a non-empty string.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

type CompositionItem = { food_id: string; quantity_g: number };

export type PreparationBatchRow = {
  id: string;
  household_id: string;
  prepared_date: string;
  storage_note: string | null;
  source_combo_id: string | null;
  composition: CompositionItem[];
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS = "id,household_id,prepared_date,storage_note,source_combo_id,composition";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    let user: AuthUser;
    try {
      user = await requireUser(request);
    } catch (err) {
      return authErrorResponse(err);
    }
    const method = request.method.toUpperCase();
    if (method === "GET") return handleGet(request, user);
    if (method === "POST") return handleCreate(request, user);
    return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("householdId")?.trim();
  if (!householdId) {
    return json({ error: "expected ?householdId=<id>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);

  try {
    const target =
      `${restBase(supabaseUrl)}/preparation_batches?select=${SELECT_COLS}` +
      `&household_id=eq.${encodeURIComponent(householdId)}` +
      `&order=prepared_date.desc`;

    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as PreparationBatchRow[];
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch preparation batches: ${e}` }, 500);
  }
}

function isValidComposition(value: unknown): value is CompositionItem[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).food_id === "string" &&
      (item as Record<string, unknown>).food_id !== "" &&
      typeof (item as Record<string, unknown>).quantity_g === "number" &&
      Number.isFinite((item as Record<string, unknown>).quantity_g as number) &&
      ((item as Record<string, unknown>).quantity_g as number) > 0
  );
}

async function handleCreate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: {
    id?: unknown;
    household_id?: unknown;
    prepared_date?: unknown;
    storage_note?: unknown;
    source_combo_id?: unknown;
    composition?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || body.id.trim().length === 0) {
    return json({ error: "expected id: string (non-empty)" }, 400);
  }
  if (typeof body.household_id !== "string" || body.household_id.trim().length === 0) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }

  try {
    await requireHouseholdAccess(body.household_id.trim(), user);
  } catch (err) {
    return authErrorResponse(err);
  }

  if (typeof body.prepared_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.prepared_date)) {
    return json({ error: "expected prepared_date: string (YYYY-MM-DD)" }, 400);
  }
  if (
    body.storage_note !== undefined &&
    body.storage_note !== null &&
    typeof body.storage_note !== "string"
  ) {
    return json({ error: "expected storage_note: string or null" }, 400);
  }
  if (
    body.source_combo_id !== undefined &&
    body.source_combo_id !== null &&
    (typeof body.source_combo_id !== "string" || body.source_combo_id.trim().length === 0)
  ) {
    return json({ error: "expected source_combo_id: string (non-empty) or null" }, 400);
  }
  if (!isValidComposition(body.composition)) {
    return json(
      { error: "expected composition: non-empty array of { food_id: string, quantity_g: positive number }" },
      400
    );
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = {
    id: body.id.trim(),
    household_id: body.household_id.trim(),
    prepared_date: body.prepared_date,
    storage_note: typeof body.storage_note === "string" ? body.storage_note : null,
    source_combo_id: typeof body.source_combo_id === "string" ? body.source_combo_id.trim() : null,
    composition: body.composition,
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/preparation_batches`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 409 ? 409 : 502
      );
    }
    const data = (await response.json()) as PreparationBatchRow[];
    if (data.length === 0) return json({ error: "preparation batch creation failed" }, 500);
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create preparation batch: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Typecheck** — `npx tsc -p api --noEmit`, expect PASS. This should now be a clean pass across the entire `api/` tree — the last code task before verification.

- [ ] **Step 3: Commit**

```bash
git add api/preparation-batches.ts
git commit -m "feat: port preparation-batches.ts to Vercel, built on the caller's-own-token pattern"
```

---

### Task 18: End-to-end verification on Vercel preview

**Files:** none — this task is manual verification, no code changes.

- [ ] **Step 1: Preview deploy**

Run: `npx vercel` (preview, not `--prod` — this is exactly what Deployment Protection is for; per the earlier Vercel handoff notes, use `--prod` only once ready for the smoke test, since preview is auth-protected and harder to curl against).

- [ ] **Step 2: Login flow**

In a browser, visit the preview URL, click "Sign in with Google," confirm the Supabase-hosted consent screen appears, complete it, confirm you land back in the app logged in (matching your real Google account's email).

- [ ] **Step 3: Confirm the identity-linking result directly**

In the Supabase SQL editor:

```sql
select au.email, aum.app_user_id, aum.supabase_uid
from public.auth_user_map aum
join auth.users au on au.id = aum.supabase_uid
order by aum.created_at desc
limit 5;
```

Expected: a row for the account just logged in, with `app_user_id` matching the **existing** `app_users.id` for that email (i.e. `egeozeldev@gmail.com` or `ozandozel@gmail.com`'s pre-existing Google `sub`, not a newly-minted id) — this is the single highest-scrutiny check from the spec's "Honest framing" section. If `app_user_id` is a fresh value instead of the pre-existing one, the Google-`sub` resolution in `api/auth-link.ts` (Step: `googleIdentity?.id ?? identity_data?.sub`) is wrong for this Supabase-js version — fix against the actual `identities[]` shape returned (log `JSON.stringify(data.user.identities)` temporarily in `api/auth-link.ts` if needed to inspect it live, then remove the log once fixed).

- [ ] **Step 4: Household/list/item CRUD**

Create a household, rename it, create a meal entry, a personal plan entry, and (if you have an existing preparation batch fixture) fetch preparation batches. Confirm each returns the expected data with no 401/403/404 surprises.

- [ ] **Step 5: `/api/state` sync**

Load the grocery list view, add an item, confirm it persists across a page reload (exercises `handlePut`'s optimistic-concurrency path).

- [ ] **Step 6: Household sharing**

As the owner, invite a second test email via household-shares; using `/api/auth-test-login?secret=...&email=<that address>` (Task 6), confirm the invited account can see and use the shared household, and that a plain `GET /api/household-shares?household_id=...` from the invited (non-owner) account returns 404 (owner-only, per the RLS policy).

- [ ] **Step 7: Adversarial cross-household check**

Using two `/api/auth-test-login` sessions for two different emails, each owning their own household: confirm session A's cookie against session B's household id returns 404 on every relevant endpoint (`households`, `meal-entries`, `personal-plan` is user-scoped so this doesn't apply there, `item-category-memory`, `preparation-batches`, `state`). This is the check the spec calls out as necessary "even without a CI test framework" — do it live and note the result in Task 19's Linear/checkpoint update.

- [ ] **Step 8: Logout**

Confirm `signOut()` actually clears the session (reload after logout shows the signed-out state, not a stale cached one).

---

### Task 19: Deploy to Vercel prod, update Linear and the session checkpoint

**Files:**
- Modify: `docs/SESSION_CHECKPOINT.md`

- [ ] **Step 1: Prod deploy**

Run: `npx vercel --prod`
Expected: build succeeds (READY), matching the pattern from NUT-29's earlier deploys.

- [ ] **Step 2: Repeat the Task 18 smoke checks against the prod URL**

Same steps, same expectations, against `https://grocery-five-ecru.vercel.app` (or whatever the current prod alias is) rather than a preview URL.

- [ ] **Step 3: Update NUT-52**

Add a comment to [NUT-52](https://linear.app/nutrition-grocery-planner/issue/NUT-52/netlifyi-sok-eski-deploy-hedefini-kaldir) noting this migration landed on Vercel — its own first checklist item ("sync Vercel prod with current master, re-verify end-to-end") is now satisfied by this work specifically, not just a plain redeploy.

- [ ] **Step 4: Update `docs/SESSION_CHECKPOINT.md`**

Add a dated entry summarizing: what shipped (real Supabase Auth on Vercel only), the two discoveries from this plan's header, the live verification results from Task 18 (especially the identity-linking and adversarial checks), and that `netlify/functions/*` remains untouched and unaffected.

- [ ] **Step 5: Commit**

```bash
git add docs/SESSION_CHECKPOINT.md
git commit -m "docs: log the Supabase Auth migration (Vercel only) in the session checkpoint"
```
