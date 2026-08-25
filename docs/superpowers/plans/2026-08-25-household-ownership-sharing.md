# Household Ownership + Email Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current "everyone logged-in sees every household" model with
owner + invited-by-email access: each household has an owner, non-owners must be
explicitly invited by email to use it, and unauthorized households 404 instead of
appearing.

**Architecture:** A new `owner_id` column on `households` plus a new
`household_shares` (household_id, email) invite table. A single new backend helper,
`requireHouseholdAccess`, gates every per-household endpoint (owner or invited ->
pass, else 404; `ownerOnly` narrows to owner-only for delete/invite-management).
Household listing filters instead of gating. Frontend threads the current user's id
and each household's `ownerId` through so the UI can show owner-only controls
(a new invite/revoke chip-list in `TenantSwitcher`) only to the owner.

**Tech Stack:** Netlify Functions (Deno-style `Request`/`Response`, PostgREST over
`fetch`), Preact/React function components + Tailwind, Supabase Postgres.

**Spec:** [docs/superpowers/specs/2026-08-25-household-ownership-sharing-design.md](../specs/2026-08-25-household-ownership-sharing-design.md)

## Global Constraints

- Unauthorized household access always returns **404**, never 403 — a household a
  user can't access must not reveal that it exists.
- `owner_id IS NULL` must never pass an access check — NULL never equals a user id.
  The schema migration and its backfill ship in the same SQL file; the backfill
  covers all three existing households so nobody gets locked out.
- The migration (Task 1) is run manually by the user in the Supabase SQL editor —
  Claude does not execute DDL against the live database. Enforcement code
  (Tasks 2–7) must not be deployed until the user confirms the migration ran.
  Backfill emails: `ozandozel@gmail.com` (Evim `default`, Ayrancı `yxq8fr4k`) and
  `egeozeldev@gmail.com` (Akbük `6e5xkctg`) — confirmed live household ids as of
  2026-08-25.
- No test suite exists in this repo. Verification after every TypeScript-touching
  task is: `npm run build` (runs `tsc -b` across `src/`) and
  `npx tsc --noEmit -p netlify/functions/tsconfig.json` (typechecks
  `netlify/functions/`). Both must pass with zero errors before moving on.
- Match existing per-function conventions: each `netlify/functions/*.ts` file
  defines its own local `restBase()` helper (no shared HTTP client), reads use the
  anon key where RLS allows it and the service_role key where a table has no
  public read policy, writes always use the service_role key, and PostgREST query
  values built from user input are passed through `encodeURIComponent`.

---

### Task 1: Ownership + sharing migration

**Files:**
- Create: `supabase/05-household-ownership.sql`

**Interfaces:**
- Produces: `public.households.owner_id` (text, nullable, FK ->
  `public.app_users(id) on delete set null`) and `public.household_shares
  (household_id text, email text, created_at timestamptz, primary key
  (household_id, email))` — consumed by Task 2's `requireHouseholdAccess` and
  every backend task after it.

- [ ] **Step 1: Write the migration file**

```sql
-- Household ownership + invite-by-email sharing. Run after 04-hidden-households.sql.
-- Adds households.owner_id, the household_shares invite table, and backfills
-- owner_id for the three existing households so nobody gets locked out.
--
-- IMPORTANT: run this only after both Ege (egeozeldev@gmail.com) and Ozan
-- (ozandozel@gmail.com) have logged in at least once via Google, so their
-- app_users rows exist for the backfill subqueries below to find. Do not
-- deploy the enforcement code (households.ts / state.ts / etc. auth checks)
-- until this script has been run — owner_id IS NULL locks everyone out.
--
-- Idempotent: safe to re-run.

alter table public.households
  add column if not exists owner_id text references public.app_users(id) on delete set null;

create table if not exists public.household_shares (
  household_id text not null references public.households(id) on delete cascade,
  email        text not null,
  created_at   timestamptz not null default now(),
  primary key (household_id, email)
);

create index if not exists household_shares_email_idx on public.household_shares (email);

-- Backfill: Evim (default) + Ayrancı (yxq8fr4k) -> Ozan; Akbük (6e5xkctg) -> Ege.
update public.households
  set owner_id = (select id from public.app_users where email = 'ozandozel@gmail.com')
  where id in ('default', 'yxq8fr4k') and owner_id is null;

update public.households
  set owner_id = (select id from public.app_users where email = 'egeozeldev@gmail.com')
  where id = '6e5xkctg' and owner_id is null;
```

- [ ] **Step 2: Verify the file was written correctly**

Read the file back and confirm it matches Step 1 exactly (no automated test — this
is a SQL script for manual execution, not app code).

- [ ] **Step 3: Tell the user this migration is ready, but do not run it**

State clearly: "`supabase/05-household-ownership.sql` is ready. Before any of the
enforcement code in this branch is deployed, run it in the Supabase SQL editor —
and make sure Ozan has logged in via Google at least once first, or his backfill
row will silently stay NULL." Do not execute this SQL yourself.

- [ ] **Step 4: Commit**

```bash
git add supabase/05-household-ownership.sql
git commit -m "Add household ownership + sharing migration"
```

---

### Task 2: `requireHouseholdAccess` helper

**Files:**
- Modify: `netlify/functions/_auth.ts`

**Interfaces:**
- Consumes: `AuthUser { userId: string; email: string }`, `AuthError` (both
  already defined in this file).
- Produces: `requireHouseholdAccess(householdId: string, user: AuthUser, opts?: {
  ownerOnly?: boolean }): Promise<void>` — throws `AuthError(404, ...)` for a
  missing household or one the user can't access, `AuthError(404, ...)` for a
  non-owner when `ownerOnly` is set, `AuthError(500, ...)` if Supabase env vars
  are missing, `AuthError(502, ...)` on a Supabase fetch failure, resolves
  otherwise. Consumed by every task from here on.

- [ ] **Step 1: Add the helper to `_auth.ts`**

Add this below the existing `requireUser` function (after its closing `}`, before
`authErrorResponse`):

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors (the function is unused so far — that's fine, it's exported).

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/_auth.ts
git commit -m "Add requireHouseholdAccess auth helper"
```

---

### Task 3: Enforce ownership in `households.ts`

**Files:**
- Modify: `netlify/functions/households.ts`

**Interfaces:**
- Consumes: `requireHouseholdAccess` and `type AuthUser` from Task 2.
- Produces: `Household` type gains `owner_id: string | null` — consumed by
  Task 9's frontend types.

- [ ] **Step 1: Replace the whole file**

```ts
// GET    /api/households?id=<id>     -> Household       (read by id; access-gated)
// GET    /api/households              -> Household[]     (list; filtered to owned + invited)
// POST   /api/households              -> Household       (create; creator becomes owner)
// PATCH  /api/households               -> Household       (rename; any member)
// DELETE /api/households?id=<id>     -> { ok: true }     (delete; owner only)
//
// Uses PostgREST anon... no — service_role key throughout (households has no
// public read policy). Access is owner-or-invited, see
// docs/superpowers/specs/2026-08-25-household-ownership-sharing-design.md.

import type { Context } from "@netlify/functions";
import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "./_auth";
import { getStore } from "@netlify/blobs";

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

export default async (request: Request, _context: Context): Promise<Response> => {
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
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

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

  // No id: list only households this user can access (owns, or was invited to
  // by email) instead of gating a single lookup.
  try {
    const sharesTarget = `${restBase(supabaseUrl)}/household_shares?email=eq.${encodeURIComponent(
      user.email
    )}&select=household_id`;
    const sharesRes = await fetch(sharesTarget, { headers });
    if (!sharesRes.ok) return json({ error: `supabase ${sharesRes.status}` }, 502);
    const shareRows = (await sharesRes.json()) as { household_id: string }[];
    const invitedIds = shareRows.map((r) => r.household_id);

    const filter =
      invitedIds.length > 0
        ? `or=${encodeURIComponent(
            `(owner_id.eq.${user.userId},id.in.(${invitedIds.map((i) => `"${i}"`).join(",")}))`
          )}`
        : `owner_id=eq.${encodeURIComponent(user.userId)}`;

    const target = `${restBase(supabaseUrl)}/households?select=*&order=created_at.asc&${filter}`;
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    prefer: "return=representation",
  };

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

    // The household row cascades to lists/items/item_category_memory at the
    // DB level (FK ON DELETE CASCADE), but the actively-synced list state
    // lives in Blobs — a separate store the FK cascade can't reach. Clean it
    // up too so a future household re-created with the same id can't
    // resurrect stale state.
    const store = getStore({ name: "state", consistency: "strong" });
    await store.delete(`state:${id}`);
    if (id === "default") await store.delete("state:global");

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

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/households.ts
git commit -m "Gate households.ts on owner/invited access"
```

---

### Task 4: Enforce ownership in `state.ts`

**Files:**
- Modify: `netlify/functions/state.ts`

**Interfaces:**
- Consumes: `requireHouseholdAccess` from Task 2. The tenant id from
  `tenantIdFrom(request)` (already defined in this file) **is** the household id.

- [ ] **Step 1: Replace the default export**

Replace:

```ts
export default async (request: Request, _context: Context): Promise<Response> => {
  try {
    await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const store = getStore({ name: "state", consistency: "strong" });
  const method = request.method.toUpperCase();

  if (method === "GET") return handleGet(request, store);
  if (method === "PUT") return handlePut(request, store);
  return json({ error: "method not allowed" }, 405);
};
```

with:

```ts
export default async (request: Request, _context: Context): Promise<Response> => {
  let user;
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
  const store = getStore({ name: "state", consistency: "strong" });
  const method = request.method.toUpperCase();

  if (method === "GET") return handleGet(request, store);
  if (method === "PUT") return handlePut(request, store);
  return json({ error: "method not allowed" }, 405);
};
```

- [ ] **Step 2: Update the import**

Replace:

```ts
import { requireUser, authErrorResponse } from "./_auth";
```

with:

```ts
import { requireUser, requireHouseholdAccess, authErrorResponse } from "./_auth";
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/state.ts
git commit -m "Gate state.ts on owner/invited access"
```

---

### Task 5: Enforce ownership in `item-category-memory.ts`

**Files:**
- Modify: `netlify/functions/item-category-memory.ts`

**Interfaces:**
- Consumes: `requireHouseholdAccess` and `type AuthUser` from Task 2.

- [ ] **Step 1: Replace the whole file**

```ts
// GET /api/item-category-memory?household_id=<id>            -> Row[]   (read)
// PUT /api/item-category-memory  { household_id, name_lower, category } -> Row (upsert)
//
// The read proxies to PostgREST so the anon key stays server-side. The write
// uses the service_role key (also server-side) so RLS on
// public.item_category_memory can stay locked to reads only. Both are gated
// by owner/invited household access.

import type { Context } from "@netlify/functions";
import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "./_auth";

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

export default async (request: Request, _context: Context): Promise<Response> => {
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
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
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

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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
          apikey: serviceKey,
          authorization: `Bearer ${serviceKey}`,
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

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/item-category-memory.ts
git commit -m "Gate item-category-memory.ts on owner/invited access"
```

---

### Task 6: Enforce ownership in `meal-entries.ts`

**Files:**
- Modify: `netlify/functions/meal-entries.ts`

**Interfaces:**
- Consumes: `requireHouseholdAccess` and `type AuthUser` from Task 2.
- Produces: local helper `mealEntryHouseholdId(supabaseUrl, serviceKey, entryId):
  Promise<string | null>` used by PATCH/DELETE to resolve which household an
  entry belongs to before gating (they're addressed by entry id, not household id).

- [ ] **Step 1: Update the dispatcher and imports**

Replace:

```ts
import type { Context } from "@netlify/functions";
import { requireUser, authErrorResponse } from "./_auth";
```

with:

```ts
import type { Context } from "@netlify/functions";
import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "./_auth";
```

Replace:

```ts
export default async (request: Request, _context: Context): Promise<Response> => {
  try {
    await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request);
  if (method === "POST") return handleCreate(request);
  if (method === "PATCH") return handleUpdate(request);
  if (method === "DELETE") return handleDelete(request);
  return json({ error: "method not allowed" }, 405);
};
```

with:

```ts
export default async (request: Request, _context: Context): Promise<Response> => {
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
};

async function mealEntryHouseholdId(
  supabaseUrl: string,
  serviceKey: string,
  entryId: string
): Promise<string | null> {
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  const res = await fetch(
    `${restBase(supabaseUrl)}/meal_entries?id=eq.${encodeURIComponent(entryId)}&select=household_id`,
    { headers }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as { household_id: string }[];
  return rows[0]?.household_id ?? null;
}
```

- [ ] **Step 2: Gate `handleGet`**

Change the signature from `async function handleGet(request: Request): Promise<Response> {`
to `async function handleGet(request: Request, user: AuthUser): Promise<Response> {`.

Right after this existing block:

```ts
  if (!householdId || !from || !to) {
    return json({ error: "expected ?householdId=<id>&from=<date>&to=<date>" }, 400);
  }
```

insert:

```ts

  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }
```

- [ ] **Step 3: Gate `handleCreate`**

Change the signature from `async function handleCreate(request: Request): Promise<Response> {`
to `async function handleCreate(request: Request, user: AuthUser): Promise<Response> {`.

Right after this existing block:

```ts
  if (typeof body.household_id !== "string" || body.household_id.trim().length === 0) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }
```

insert:

```ts

  try {
    await requireHouseholdAccess(body.household_id.trim(), user);
  } catch (err) {
    return authErrorResponse(err);
  }
```

- [ ] **Step 4: Gate `handleUpdate`**

Change the signature from `async function handleUpdate(request: Request): Promise<Response> {`
to `async function handleUpdate(request: Request, user: AuthUser): Promise<Response> {`.

Right after this existing block:

```ts
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }
```

(the one inside `handleUpdate`, before the `let body: {...}` for the PATCH payload)
insert:

```ts

  const householdId = await mealEntryHouseholdId(supabaseUrl, serviceKey, id);
  if (householdId === null) return json({ error: "meal entry not found" }, 404);
  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }
```

- [ ] **Step 5: Gate `handleDelete`**

Change the signature from `async function handleDelete(request: Request): Promise<Response> {`
to `async function handleDelete(request: Request, user: AuthUser): Promise<Response> {`.

Right after this existing block:

```ts
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }
```

(the one inside `handleDelete`) insert:

```ts

  const householdId = await mealEntryHouseholdId(supabaseUrl, serviceKey, id);
  if (householdId === null) return json({ error: "meal entry not found" }, 404);
  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors. If `restBase` is reported unused in the new helper's scope,
confirm it's the same module-level `restBase` already defined near the top of this
file (it is — `mealEntryHouseholdId` is a new function inside the same file and
uses the existing helper, not a new one).

- [ ] **Step 7: Commit**

```bash
git add netlify/functions/meal-entries.ts
git commit -m "Gate meal-entries.ts on owner/invited access"
```

---

### Task 7: New `household-shares.ts` function

**Files:**
- Create: `netlify/functions/household-shares.ts`

**Interfaces:**
- Consumes: `requireUser`, `requireHouseholdAccess`, `authErrorResponse`, `type
  AuthUser` from Task 2.
- Produces: `GET/POST/DELETE /api/household-shares` — consumed by Task 10's
  frontend client wrapper.

- [ ] **Step 1: Write the file**

```ts
// GET    /api/household-shares?household_id=<id>                  -> string[]     (invited emails; owner only, 404 otherwise)
// POST   /api/household-shares  { household_id, email }            -> { ok: true } (invite; owner only)
// DELETE /api/household-shares?household_id=<id>&email=<email>     -> { ok: true } (revoke; owner only)
//
// Owner-only management of who else can access a household. See
// docs/superpowers/specs/2026-08-25-household-ownership-sharing-design.md.

import type { Context } from "@netlify/functions";
import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "./_auth";

type ShareRow = { email: string };

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
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
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    prefer: "return=minimal",
  };

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

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/household-shares.ts
git commit -m "Add household-shares.ts owner-only invite management endpoint"
```

---

### Task 8: Expose `userId` from session

**Files:**
- Modify: `netlify/functions/auth-session.ts`
- Modify: `src/hooks/useAuth.ts`

**Interfaces:**
- Produces: `Session { email: string | null; userId: string | null }` (widened
  from `{ email: string | null }`) — consumed by Task 11's `App.tsx`/`AppHeader`
  wiring, which needs the current user's id to decide whether to show owner-only
  controls.

- [ ] **Step 1: Update `auth-session.ts`**

Replace:

```ts
  return new Response(JSON.stringify({ email: user.email }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
```

with:

```ts
  return new Response(JSON.stringify({ email: user.email, userId: user.userId }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
```

- [ ] **Step 2: Typecheck the function**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Update `useAuth.ts`**

Replace:

```ts
type Session = { email: string | null };
```

with:

```ts
type Session = { email: string | null; userId: string | null };
```

Replace:

```ts
      if (res.ok) {
        const data = (await res.json()) as { email: string | null };
        setSession({ email: data.email });
      } else {
```

with:

```ts
      if (res.ok) {
        const data = (await res.json()) as { email: string | null; userId: string | null };
        setSession({ email: data.email, userId: data.userId });
      } else {
```

- [ ] **Step 4: Typecheck the frontend**

Run: `npm run build`
Expected: succeeds (this alone won't compile yet if App.tsx doesn't reference
`session.userId` — it doesn't yet, so this should still pass cleanly).

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/auth-session.ts src/hooks/useAuth.ts
git commit -m "Expose userId on the session"
```

---

### Task 9: Frontend ownership types

**Files:**
- Modify: `src/lib/store.ts`
- Modify: `src/lib/households.ts`
- Modify: `src/hooks/useTenants.ts`

**Interfaces:**
- Produces: `Tenant { id: string; name: string; createdAt: number; ownerId: string
  | null }` and `Household { id: string; name: string; created_at: string;
  owner_id: string | null }` — consumed by Task 11's `TenantSwitcher`/`AppHeader`.
- Consumes: nothing new (uses the `owner_id` column already returned by
  `households.ts`'s `select=*` from Task 3, since the column now exists per
  Task 1's migration).

- [ ] **Step 1: Widen `Tenant` in `store.ts`**

Replace:

```ts
export type Tenant = {
  id: string;
  name: string;
  createdAt: number;
};
```

with:

```ts
export type Tenant = {
  id: string;
  name: string;
  createdAt: number;
  ownerId: string | null;
};
```

- [ ] **Step 2: Update `newTenant` in `store.ts`**

Replace:

```ts
export function newTenant(name: string): Tenant {
  return { id: uid(), name: name.trim() || "Ev", createdAt: Date.now() };
}
```

with:

```ts
export function newTenant(name: string): Tenant {
  return { id: uid(), name: name.trim() || "Ev", createdAt: Date.now(), ownerId: null };
}
```

- [ ] **Step 3: Widen `Household` in `src/lib/households.ts`**

Replace:

```ts
export type Household = {
  id: string;
  name: string;
  created_at: string;
};
```

with:

```ts
export type Household = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string | null;
};
```

- [ ] **Step 4: Thread `ownerId` through `useTenants.ts`**

Replace:

```ts
      let effective: Tenant[] = list.map((h) => ({
        id: h.id,
        name: h.name,
        createdAt: Date.parse(h.created_at),
      }));
```

with:

```ts
      let effective: Tenant[] = list.map((h) => ({
        id: h.id,
        name: h.name,
        createdAt: Date.parse(h.created_at),
        ownerId: h.owner_id,
      }));
```

Replace:

```ts
        if (created) {
          effective = [
            { id: created.id, name: created.name, createdAt: Date.parse(created.created_at) },
          ];
        } else {
          const refetched = await listHouseholds();
          if (cancelled) return;
          effective = refetched.map((h) => ({
            id: h.id,
            name: h.name,
            createdAt: Date.parse(h.created_at),
          }));
        }
```

with:

```ts
        if (created) {
          effective = [
            {
              id: created.id,
              name: created.name,
              createdAt: Date.parse(created.created_at),
              ownerId: created.owner_id,
            },
          ];
        } else {
          const refetched = await listHouseholds();
          if (cancelled) return;
          effective = refetched.map((h) => ({
            id: h.id,
            name: h.name,
            createdAt: Date.parse(h.created_at),
            ownerId: h.owner_id,
          }));
        }
```

Replace:

```ts
    const t: Tenant = {
      id: created.id,
      name: created.name,
      createdAt: Date.parse(created.created_at),
    };
```

with:

```ts
    const t: Tenant = {
      id: created.id,
      name: created.name,
      createdAt: Date.parse(created.created_at),
      ownerId: created.owner_id,
    };
```

- [ ] **Step 5: Typecheck**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/store.ts src/lib/households.ts src/hooks/useTenants.ts
git commit -m "Thread household ownerId through Tenant/Household types"
```

---

### Task 10: `src/lib/householdShares.ts` client wrapper

**Files:**
- Create: `src/lib/householdShares.ts`

**Interfaces:**
- Consumes: `GET/POST/DELETE /api/household-shares` from Task 7.
- Produces: `listHouseholdShares(householdId: string): Promise<string[]>`,
  `inviteToHousehold(householdId: string, email: string): Promise<boolean>`,
  `revokeHouseholdShare(householdId: string, email: string): Promise<boolean>` —
  consumed by Task 11's `TenantSwitcher.tsx`.

- [ ] **Step 1: Write the file**

```ts
function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function listHouseholdShares(householdId: string): Promise<string[]> {
  try {
    const res = await fetch(
      apiUrl(`/api/household-shares?household_id=${encodeURIComponent(householdId)}`),
      { method: "GET", headers: { "content-type": "application/json" } }
    );
    if (!res.ok) {
      console.warn("[household-shares] list failed:", res.status);
      return [];
    }
    return (await res.json()) as string[];
  } catch (err) {
    console.warn("[household-shares] list threw:", err);
    return [];
  }
}

export async function inviteToHousehold(householdId: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/household-shares"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ household_id: householdId, email }),
    });
    if (!res.ok) {
      console.warn("[household-shares] invite failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[household-shares] invite threw:", err);
    return false;
  }
}

export async function revokeHouseholdShare(householdId: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/household-shares?household_id=${encodeURIComponent(householdId)}&email=${encodeURIComponent(
          email
        )}`
      ),
      { method: "DELETE" }
    );
    if (!res.ok) {
      console.warn("[household-shares] revoke failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[household-shares] revoke threw:", err);
    return false;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: succeeds (file is unused so far — that's fine, it's all named exports).

- [ ] **Step 3: Commit**

```bash
git add src/lib/householdShares.ts
git commit -m "Add household-shares client wrapper"
```

---

### Task 11: Owner-only share UI in `TenantSwitcher`

**Files:**
- Modify: `src/components/TenantSwitcher.tsx`
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `listHouseholdShares`, `inviteToHousehold`, `revokeHouseholdShare`
  from Task 10; `Tenant.ownerId` from Task 9; `Session.userId` from Task 8.

- [ ] **Step 1: Add imports and the `currentUserId` prop to `TenantSwitcher.tsx`**

Replace:

```tsx
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/lib/store";

type Props = {
  tenants: Tenant[];
  activeId: string;
  hiddenIds: string[];
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
};

export function TenantSwitcher({
  tenants,
  activeId,
  hiddenIds,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onToggleHidden,
}: Props) {
```

with:

```tsx
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff, Plus, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/lib/store";
import { inviteToHousehold, listHouseholdShares, revokeHouseholdShare } from "@/lib/householdShares";

type Props = {
  tenants: Tenant[];
  activeId: string;
  hiddenIds: string[];
  currentUserId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
};

export function TenantSwitcher({
  tenants,
  activeId,
  hiddenIds,
  currentUserId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onToggleHidden,
}: Props) {
```

- [ ] **Step 2: Add share-management state and handlers**

Right after the existing:

```tsx
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
```

insert:

```tsx
  const [managingSharesId, setManagingSharesId] = useState<string | null>(null);
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [shareDraft, setShareDraft] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
```

Replace the outside-click/Escape effect:

```tsx
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setDraft("");
        setEditingId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setAdding(false);
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
```

with:

```tsx
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setDraft("");
        setEditingId(null);
        setManagingSharesId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setAdding(false);
        setEditingId(null);
        setManagingSharesId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
```

Right after the existing `submittingRename` ref and `commitRename` function (before
the `return (` that starts the JSX), insert:

```tsx
  const submittingShare = useRef(false);

  async function openShares(id: string) {
    if (managingSharesId === id) {
      setManagingSharesId(null);
      return;
    }
    setManagingSharesId(id);
    setShareDraft("");
    setShareLoading(true);
    const emails = await listHouseholdShares(id);
    setShareLoading(false);
    setShareEmails(emails);
  }

  async function commitInvite(householdId: string) {
    if (submittingShare.current) return;
    const email = shareDraft.trim();
    if (!email) return;
    submittingShare.current = true;
    const ok = await inviteToHousehold(householdId, email);
    if (ok) {
      const normalized = email.toLowerCase();
      setShareEmails((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
      setShareDraft("");
    }
    submittingShare.current = false;
  }

  async function removeShare(householdId: string, email: string) {
    const ok = await revokeHouseholdShare(householdId, email);
    if (ok) setShareEmails((prev) => prev.filter((e) => e !== email));
  }
```

- [ ] **Step 3: Add the share-management icon button**

Replace:

```tsx
                      <button
                        type="button"
                        aria-label={`${t.name} yeniden adlandır`}
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft(t.name);
                        }}
                        className="rounded p-1 text-muted-foreground transition hover:text-foreground [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {tenants.length > 1 && (
```

with:

```tsx
                      <button
                        type="button"
                        aria-label={`${t.name} yeniden adlandır`}
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft(t.name);
                        }}
                        className="rounded p-1 text-muted-foreground transition hover:text-foreground [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {currentUserId != null && t.ownerId === currentUserId && (
                        <button
                          type="button"
                          aria-label={`${t.name} paylaşımını yönet`}
                          onClick={() => openShares(t.id)}
                          className={cn(
                            "rounded p-1 text-muted-foreground transition hover:text-foreground [@media(pointer:fine)]:focus-visible:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100",
                            managingSharesId === t.id
                              ? "text-foreground"
                              : "[@media(pointer:fine)]:opacity-0"
                          )}
                        >
                          <UserPlus className="size-3.5" />
                        </button>
                      )}
                      {tenants.length > 1 && (
```

- [ ] **Step 4: Gate the delete button to the owner too**

The backend now rejects a non-owner's delete with 404 (Task 3), but the delete
button itself was only ever gated on "more than one household exists" — a
non-owner would still see it and get a confusing failure. Gate it on ownership
too, same as the new share button, keeping the existing last-household guard.

Replace:

```tsx
                      {tenants.length > 1 && (
                        <button
                          type="button"
                          aria-label={`${t.name} sil`}
```

with:

```tsx
                      {tenants.length > 1 && currentUserId != null && t.ownerId === currentUserId && (
                        <button
                          type="button"
                          aria-label={`${t.name} sil`}
```

- [ ] **Step 5: Render the share panel below the row**

Replace:

```tsx
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
```

with:

```tsx
                    </div>
                  )}
                  {managingSharesId === t.id && (
                    <div className="border-t border-border bg-accent/30 px-3 py-2">
                      <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                        Davetliler
                      </div>
                      {shareLoading ? (
                        <div className="text-xs text-muted-foreground">Yükleniyor…</div>
                      ) : (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {shareEmails.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Henüz kimse davet edilmedi.
                            </span>
                          )}
                          {shareEmails.map((email) => (
                            <span
                              key={email}
                              className="ledger flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                            >
                              {email}
                              <button
                                type="button"
                                aria-label={`${email} daveti kaldır`}
                                onClick={() => removeShare(t.id, email)}
                                className="rounded-full text-muted-foreground transition hover:text-signal"
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        value={shareDraft}
                        placeholder="email@ornek.com"
                        onInput={(e: Event) =>
                          setShareDraft((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === "Enter") commitInvite(t.id);
                        }}
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-foreground"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
```

- [ ] **Step 6: Pass `currentUserId` through `AppHeader.tsx`**

Replace:

```tsx
type Props = {
  tenants: Tenant[];
  activeTenantId: string;
  hiddenTenantIds: string[];
  onSelectTenant: (id: string) => void;
```

with:

```tsx
type Props = {
  tenants: Tenant[];
  activeTenantId: string;
  hiddenTenantIds: string[];
  currentUserId: string | null;
  onSelectTenant: (id: string) => void;
```

Replace:

```tsx
export function AppHeader({
  tenants,
  activeTenantId,
  hiddenTenantIds,
  onSelectTenant,
```

with:

```tsx
export function AppHeader({
  tenants,
  activeTenantId,
  hiddenTenantIds,
  currentUserId,
  onSelectTenant,
```

Replace:

```tsx
        <TenantSwitcher
          tenants={tenants}
          activeId={activeTenantId}
          hiddenIds={hiddenTenantIds}
          onSelect={onSelectTenant}
```

with:

```tsx
        <TenantSwitcher
          tenants={tenants}
          activeId={activeTenantId}
          hiddenIds={hiddenTenantIds}
          currentUserId={currentUserId}
          onSelect={onSelectTenant}
```

- [ ] **Step 7: Thread `currentUserId` from `App.tsx`**

Replace:

```tsx
  return <AppShell onSignOut={signOut} />;
}

function AppShell({ onSignOut }: { onSignOut: () => void }) {
```

with:

```tsx
  return <AppShell onSignOut={signOut} currentUserId={session.userId} />;
}

function AppShell({
  onSignOut,
  currentUserId,
}: {
  onSignOut: () => void;
  currentUserId: string | null;
}) {
```

Replace:

```tsx
      <AppHeader
        tenants={tenants}
        activeTenantId={activeTenantId}
        hiddenTenantIds={hiddenIds}
        onSelectTenant={selectTenant}
```

with:

```tsx
      <AppHeader
        tenants={tenants}
        activeTenantId={activeTenantId}
        hiddenTenantIds={hiddenIds}
        currentUserId={currentUserId}
        onSelectTenant={selectTenant}
```

- [ ] **Step 8: Typecheck**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 9: Manual smoke test**

Run: `npm run netlify:dev`
As the owner of a household, open the tenant switcher, click the new user-plus
icon on your own household row, confirm the invite panel opens (empty list +
input). Type an email and press Enter — confirm it appears as a chip. Click its
✕ — confirm it disappears. Confirm the icon does **not** appear on a household
row you don't own (if you only have one household to test with, temporarily log
in as a different `app_users` row, or verify by reading the render logic: the
button is gated on `t.ownerId === currentUserId`).

- [ ] **Step 10: Commit**

```bash
git add src/components/TenantSwitcher.tsx src/components/AppHeader.tsx src/App.tsx
git commit -m "Add owner-only household share management UI"
```

---

### Task 12: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Full frontend build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with zero errors.

- [ ] **Step 2: Full functions typecheck**

Run: `npx tsc --noEmit -p netlify/functions/tsconfig.json`
Expected: zero errors.

- [ ] **Step 3: Confirm the migration has been run**

Ask the user to confirm `supabase/05-household-ownership.sql` (Task 1) has been
run in the Supabase SQL editor, and that Ozan has logged in via Google at least
once, before this branch is deployed. Do not merge/deploy on the user's behalf
until they confirm.

- [ ] **Step 4: Manual QA checklist (run with `npm run netlify:dev`, per the spec's Testing section)**

  - As the owner: rename, delete, invite, and revoke on your own household all
    work.
  - As an invited (non-owner) user: you can open and use the household (lists,
    meal entries, item-category memory), but see no delete/share controls in the
    tenant switcher.
  - As a third, uninvited logged-in user: the household never appears in your
    `GET /api/households` list, and `curl`ing `/api/households?id=<id>`,
    `/api/state?tenant=<id>`, `/api/item-category-memory?household_id=<id>`, and
    `/api/meal-entries?householdId=<id>&from=...&to=...` directly (with a valid
    session cookie for the wrong household) all return `404`, not `403` or `200`.
  - The existing `hidden_households` hide/show toggle still works within
    whatever set of households a user can see.

- [ ] **Step 5: Report status to the user**

Summarize what was implemented, remind them the migration (Task 1) still needs to
be run manually if it hasn't been, and stop — do not commit further or open a PR
unless asked (this repo's convention: implement and verify, then the user commits
after testing, per BCMP/CMP as they direct).
