# Daily Meal Planner (v1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a free-text daily meal planner (Kahvaltı/Öğle/Akşam + Ara öğün, optional manual kcal/P/Y/K/L per entry, per-day totals) as a new top-level section in the app.

**Architecture:** A new Supabase table (`meal_entries`) behind a thin Netlify function proxy (same pattern as `households.ts`/`items.ts`), a client API-wrapper module, a hook that owns the viewed date + a small prefetch window + optimistic CRUD, and a view component wired in as a third `Section` alongside Alışveriş/Besin değerleri.

**Tech Stack:** React 19 + TypeScript (Preact-compat JSX event typing, see Global Constraints), Vite, Netlify Functions, Supabase/PostgREST.

**Spec:** `docs/superpowers/specs/2026-08-21-meal-planner-design.md`

## Global Constraints

- No test suite or lint script exists in this repo (`CLAUDE.md` is explicit about this). Every task's automated check is `npm run build` (`tsc -b`, typechecks `src/` only — `netlify/functions/*` is not typechecked by this command). Netlify function correctness is verified by curling the running `netlify dev` server, not by a type-check.
- JSX event handlers in this codebase take raw DOM event types cast inline — `onInput={(e: Event) => ...}`, `onKeyDown={(e: KeyboardEvent) => ...}`, `onBlur={() => ...}` — not `React.ChangeEvent<...>`. Match this exactly; it's the existing convention throughout (see `ActiveListRow.tsx`, `NutritionEditorRow.tsx`).
- Netlify functions use the anon key for `GET`/reads and the service_role key for writes, with no auth — anyone with the app URL can write. This is a documented, deliberate trade-off in every existing function file; carry the same comment into the new one.
- Turkish-language UI copy throughout (labels, placeholders, aria-labels), matching existing tabs' style.
- Reuse existing helpers rather than reinventing them: `uid()` and `defaultTitle()` from `src/lib/store.ts`, the `readXFromUrl`/`writeXToUrl` per-param pattern already in `store.ts` (see `readTabFromUrl`/`writeTabToUrl` for the shape to copy), the `Button`/`Input` UI primitives from `src/components/ui/`.
- No offline queue or conflict-merge logic for this feature (see spec's "Why plain CRUD, not the list-sync engine"). Each edit is one direct API call.
- Every commit follows this repo's git convention from `CLAUDE.md`: branch first, never commit straight to `master`. Use one branch for this whole plan (e.g. `meal-planner-v1`), committing after each task.

---

## Task 1: Supabase schema — `meal_entries` table

**Files:**
- Modify: `supabase/01-schema.sql` (append at end)

**Interfaces:**
- Produces: the `public.meal_entries` table that Task 2's Netlify function reads/writes. Columns: `id text primary key, household_id text, date date, slot text, text text, kcal numeric, protein_g numeric, fat_g numeric, carbs_g numeric, fiber_g numeric, position integer, created_at timestamptz`.

- [ ] **Step 1: Append the table SQL**

Add this block to the end of `supabase/01-schema.sql`, matching the existing file's style (idempotent `if not exists`, index after table):

```sql

create table if not exists public.meal_entries (
  id           text primary key,
  household_id text not null references public.households(id) on delete cascade,
  date         date not null,        -- local calendar day, e.g. 2026-08-21
  slot         text not null,        -- 'kahvalti' | 'ogle' | 'aksam' | 'ara'
  text         text not null,
  kcal         numeric,
  protein_g    numeric,
  fat_g        numeric,
  carbs_g      numeric,
  fiber_g      numeric,
  position     integer not null default 0,  -- orders multiple 'ara' entries
  created_at   timestamptz not null default now()
);

create index if not exists meal_entries_household_date_idx
  on public.meal_entries (household_id, date);
```

- [ ] **Step 2: Apply it to Supabase (manual step, human-run)**

This repo has no Supabase CLI/migration tooling wired up — every existing table in `01-schema.sql` was applied by pasting into the Supabase SQL editor and running once (see the file's own header comment). Paste the appended block (or the whole file, since it's idempotent) into the Supabase SQL editor for this project and run it.

- [ ] **Step 3: Verify the table exists**

In the Supabase SQL editor, run:

```sql
select * from public.meal_entries limit 1;
```

Expected: an empty result set with the 12 columns listed above, no error.

- [ ] **Step 4: Commit**

```bash
git checkout -b meal-planner-v1
git add supabase/01-schema.sql
git commit -m "Add meal_entries table for the daily meal planner"
```

---

## Task 2: Netlify function — `meal-entries.ts`

**Depends on:** Task 1 (the table must exist in Supabase before this can be curl-tested).

**Files:**
- Create: `netlify/functions/meal-entries.ts`

**Interfaces:**
- Consumes: `public.meal_entries` table from Task 1.
- Produces: HTTP endpoints Task 3's client module calls:
  - `GET /api/meal-entries?householdId=<id>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>` → `MealEntryRow[]`
  - `POST /api/meal-entries` (body: `NewMealEntryRow`) → `MealEntryRow`, status 201
  - `PATCH /api/meal-entries?id=<id>` (body: partial fields) → `MealEntryRow`, status 200
  - `DELETE /api/meal-entries?id=<id>` → `{ ok: true }`, status 200

  Where:
  ```ts
  type MealEntryRow = {
    id: string;
    household_id: string;
    date: string;
    slot: string;
    text: string;
    kcal: number | null;
    protein_g: number | null;
    fat_g: number | null;
    carbs_g: number | null;
    fiber_g: number | null;
    position: number;
  };
  ```

- [ ] **Step 1: Write the function**

Create `netlify/functions/meal-entries.ts`:

```ts
// GET    /api/meal-entries?householdId=<id>&from=<date>&to=<date>  -> MealEntryRow[]  (read range)
// POST   /api/meal-entries                                          -> MealEntryRow    (create)
// PATCH  /api/meal-entries?id=<id>                                  -> MealEntryRow    (update)
// DELETE /api/meal-entries?id=<id>                                  -> { ok: true }    (delete)
//
// Uses PostgREST anon key for reads and service_role key for writes.
// Anyone with the app URL can hit POST/PATCH/DELETE. For a small household PWA
// this is fine; if this stops being personal, put the app behind authentication.

import type { Context } from "@netlify/functions";

export type MealEntryRow = {
  id: string;
  household_id: string;
  date: string;
  slot: string;
  text: string;
  kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  position: number;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS =
  "id,household_id,date,slot,text,kcal,protein_g,fat_g,carbs_g,fiber_g,position";

const VALID_SLOTS = ["kahvalti", "ogle", "aksam", "ara"];

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request);
  if (method === "POST") return handleCreate(request);
  if (method === "PATCH") return handleUpdate(request);
  if (method === "DELETE") return handleDelete(request);
  return json({ error: "method not allowed" }, 405);
};

async function handleGet(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("householdId")?.trim();
  const from = url.searchParams.get("from")?.trim();
  const to = url.searchParams.get("to")?.trim();

  if (!householdId || !from || !to) {
    return json({ error: "expected ?householdId=<id>&from=<date>&to=<date>" }, 400);
  }

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

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

async function handleCreate(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: {
    id?: unknown;
    household_id?: unknown;
    date?: unknown;
    slot?: unknown;
    text?: unknown;
    kcal?: unknown;
    protein_g?: unknown;
    fat_g?: unknown;
    carbs_g?: unknown;
    fiber_g?: unknown;
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
  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return json({ error: "expected date: string (YYYY-MM-DD)" }, 400);
  }
  if (typeof body.slot !== "string" || !VALID_SLOTS.includes(body.slot)) {
    return json({ error: "expected slot: 'kahvalti' | 'ogle' | 'aksam' | 'ara'" }, 400);
  }
  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    return json({ error: "expected text: string (non-empty)" }, 400);
  }

  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = {
    id: body.id.trim(),
    household_id: body.household_id.trim(),
    date: body.date,
    slot: body.slot,
    text: body.text.trim(),
    kcal: num(body.kcal),
    protein_g: num(body.protein_g),
    fat_g: num(body.fat_g),
    carbs_g: num(body.carbs_g),
    fiber_g: num(body.fiber_g),
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

async function handleUpdate(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }

  let body: {
    text?: unknown;
    kcal?: unknown;
    protein_g?: unknown;
    fat_g?: unknown;
    carbs_g?: unknown;
    fiber_g?: unknown;
    position?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const payload: Record<string, unknown> = {};
  if (typeof body.text === "string" && body.text.trim().length > 0) {
    payload.text = body.text.trim();
  }
  if (body.kcal !== undefined) payload.kcal = num(body.kcal);
  if (body.protein_g !== undefined) payload.protein_g = num(body.protein_g);
  if (body.fat_g !== undefined) payload.fat_g = num(body.fat_g);
  if (body.carbs_g !== undefined) payload.carbs_g = num(body.carbs_g);
  if (body.fiber_g !== undefined) payload.fiber_g = num(body.fiber_g);
  if (typeof body.position === "number") payload.position = body.position;

  if (Object.keys(payload).length === 0) {
    return json(
      { error: "no fields to update (text, kcal, protein_g, fat_g, carbs_g, fiber_g, position)" },
      400
    );
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

async function handleDelete(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<meal_entry_id>" }, 400);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

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

- [ ] **Step 2: Start the real backend and curl every endpoint**

```bash
npm run netlify:dev
```

Wait for it to report ready on `:8888`, then in another terminal (replace `default` with a real household id if `default` doesn't exist in your Supabase yet — `default` is the app's built-in seed tenant, `DEFAULT_TENANT_ID` in `src/lib/store.ts`):

```bash
# Create
curl -s -X POST http://localhost:8888/api/meal-entries \
  -H "content-type: application/json" \
  -d '{"id":"test-entry-1","household_id":"default","date":"2026-08-21","slot":"kahvalti","text":"Menemen","kcal":320,"protein_g":14,"fat_g":22,"carbs_g":8,"fiber_g":3}'
# Expected: 201, JSON body echoing the row with all fields, position:0

# Read range (should include the row just created)
curl -s "http://localhost:8888/api/meal-entries?householdId=default&from=2026-08-20&to=2026-08-22"
# Expected: 200, array containing the "Menemen" row

# Update
curl -s -X PATCH "http://localhost:8888/api/meal-entries?id=test-entry-1" \
  -H "content-type: application/json" \
  -d '{"text":"Menemen (az yağlı)"}'
# Expected: 200, row with updated text, other fields unchanged

# Delete
curl -s -X DELETE "http://localhost:8888/api/meal-entries?id=test-entry-1"
# Expected: 200, {"ok":true}

# Confirm gone
curl -s "http://localhost:8888/api/meal-entries?householdId=default&from=2026-08-20&to=2026-08-22"
# Expected: 200, empty array (or array without test-entry-1)
```

All five must match their expected output before continuing.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/meal-entries.ts
git commit -m "Add meal-entries Netlify function"
```

---

## Task 3: Client API module — `lib/mealPlan.ts`

**Depends on:** Task 2 (calls its endpoints).

**Files:**
- Create: `src/lib/mealPlan.ts`

**Interfaces:**
- Consumes: `/api/meal-entries` endpoints from Task 2.
- Produces (consumed by Task 5's hook):
  ```ts
  export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

  export type MealEntry = {
    id: string;
    date: string;
    slot: MealSlot;
    text: string;
    kcal: number | null;
    proteinG: number | null;
    fatG: number | null;
    carbsG: number | null;
    fiberG: number | null;
    position: number;
  };

  export type NewMealEntry = {
    id: string;
    householdId: string;
    date: string;
    slot: MealSlot;
    text: string;
    kcal?: number | null;
    proteinG?: number | null;
    fatG?: number | null;
    carbsG?: number | null;
    fiberG?: number | null;
    position: number;
  };

  export type MealEntryPatch = Partial<{
    text: string;
    kcal: number | null;
    proteinG: number | null;
    fatG: number | null;
    carbsG: number | null;
    fiberG: number | null;
    position: number;
  }>;

  export function fetchMealEntries(householdId: string, from: string, to: string): Promise<MealEntry[]>;
  export function createMealEntry(entry: NewMealEntry): Promise<MealEntry | null>;
  export function updateMealEntry(id: string, patch: MealEntryPatch): Promise<MealEntry | null>;
  export function deleteMealEntry(id: string): Promise<boolean>;
  ```

- [ ] **Step 1: Write the module**

Create `src/lib/mealPlan.ts`:

```ts
export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

export type MealEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  text: string;
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
  position: number;
};

type MealEntryRow = {
  id: string;
  household_id: string;
  date: string;
  slot: string;
  text: string;
  kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  position: number;
};

function fromRow(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot as MealSlot,
    text: row.text,
    kcal: row.kcal,
    proteinG: row.protein_g,
    fatG: row.fat_g,
    carbsG: row.carbs_g,
    fiberG: row.fiber_g,
    position: row.position,
  };
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function fetchMealEntries(
  householdId: string,
  from: string,
  to: string
): Promise<MealEntry[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/meal-entries?householdId=${encodeURIComponent(householdId)}&from=${from}&to=${to}`
      ),
      { method: "GET", headers: { "content-type": "application/json" } }
    );
    if (!res.ok) {
      console.warn("[mealPlan] fetch failed:", res.status);
      return [];
    }
    const rows = (await res.json()) as MealEntryRow[];
    return rows.map(fromRow);
  } catch (err) {
    console.warn("[mealPlan] fetch threw:", err);
    return [];
  }
}

export type NewMealEntry = {
  id: string;
  householdId: string;
  date: string;
  slot: MealSlot;
  text: string;
  kcal?: number | null;
  proteinG?: number | null;
  fatG?: number | null;
  carbsG?: number | null;
  fiberG?: number | null;
  position: number;
};

export async function createMealEntry(entry: NewMealEntry): Promise<MealEntry | null> {
  try {
    const res = await fetch(apiUrl("/api/meal-entries"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        household_id: entry.householdId,
        date: entry.date,
        slot: entry.slot,
        text: entry.text,
        kcal: entry.kcal ?? null,
        protein_g: entry.proteinG ?? null,
        fat_g: entry.fatG ?? null,
        carbs_g: entry.carbsG ?? null,
        fiber_g: entry.fiberG ?? null,
        position: entry.position,
      }),
    });
    if (!res.ok) {
      console.warn("[mealPlan] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as MealEntryRow);
  } catch (err) {
    console.warn("[mealPlan] create threw:", err);
    return null;
  }
}

export type MealEntryPatch = Partial<{
  text: string;
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
  position: number;
}>;

export async function updateMealEntry(
  id: string,
  patch: MealEntryPatch
): Promise<MealEntry | null> {
  try {
    const body: Record<string, unknown> = {};
    if (patch.text !== undefined) body.text = patch.text;
    if (patch.kcal !== undefined) body.kcal = patch.kcal;
    if (patch.proteinG !== undefined) body.protein_g = patch.proteinG;
    if (patch.fatG !== undefined) body.fat_g = patch.fatG;
    if (patch.carbsG !== undefined) body.carbs_g = patch.carbsG;
    if (patch.fiberG !== undefined) body.fiber_g = patch.fiberG;
    if (patch.position !== undefined) body.position = patch.position;

    const res = await fetch(apiUrl(`/api/meal-entries?id=${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("[mealPlan] update failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as MealEntryRow);
  } catch (err) {
    console.warn("[mealPlan] update threw:", err);
    return null;
  }
}

export async function deleteMealEntry(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/meal-entries?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[mealPlan] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[mealPlan] delete threw:", err);
    return false;
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run build
```

Expected: succeeds with no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mealPlan.ts
git commit -m "Add mealPlan client API module"
```

---

## Task 4: `Section` type — add `"yemek"`

**Files:**
- Modify: `src/hooks/useUiPrefs.ts`

**Interfaces:**
- Produces: `Section = "alisveris" | "besin" | "yemek"`, consumed by Task 6's `AppHeader` change and Task 7's `App.tsx` change.

- [ ] **Step 1: Extend the type and URL-parsing**

In `src/hooks/useUiPrefs.ts`, change:

```ts
export type Section = "alisveris" | "besin";
```
to:
```ts
export type Section = "alisveris" | "besin" | "yemek";
```

And change:
```ts
function initialSection(): Section {
  return readSectionFromUrl() === "besin" ? "besin" : "alisveris";
}
```
to:
```ts
function initialSection(): Section {
  const fromUrl = readSectionFromUrl();
  if (fromUrl === "besin") return "besin";
  if (fromUrl === "yemek") return "yemek";
  return "alisveris";
}
```

No other changes needed in this file — `writeSectionToUrl` already just writes whatever string it's given.

- [ ] **Step 2: Typecheck**

```bash
npm run build
```

Expected: succeeds. (`App.tsx`'s `section === "besin" ? ... : <AppShoppingTabs>` ternary still compiles because `Section` widening to include `"yemek"` doesn't break an untyped string comparison — this will be narrowed properly in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useUiPrefs.ts
git commit -m "Add yemek to the Section type"
```

---

## Task 5: `useMealPlan` hook

**Depends on:** Task 3 (`lib/mealPlan.ts`).

**Files:**
- Modify: `src/lib/store.ts` (add a `date` URL-param pair, following the existing per-param pattern)
- Create: `src/hooks/useMealPlan.ts`

**Interfaces:**
- Consumes: `MealEntry`, `MealSlot`, `fetchMealEntries`, `createMealEntry`, `updateMealEntry`, `deleteMealEntry` from `src/lib/mealPlan.ts` (Task 3); `uid`, `defaultTitle` from `src/lib/store.ts`.
- Produces (consumed by Task 6's `MealPlanView`):
  ```ts
  export type NutritionValues = {
    kcal: number | null;
    proteinG: number | null;
    fatG: number | null;
    carbsG: number | null;
    fiberG: number | null;
  };

  export function useMealPlan(householdId: string | null): {
    dateLabel: string;
    goToPrevDay: () => void;
    goToNextDay: () => void;
    fixedEntry: (slot: Exclude<MealSlot, "ara">) => MealEntry | undefined;
    araEntries: () => MealEntry[];
    dayTotals: () => { kcal: number; protein: number; fat: number; carbs: number; fiber: number };
    saveFixedSlotText: (slot: Exclude<MealSlot, "ara">, text: string) => void;
    addAraEntry: (text: string) => void;
    saveEntryNutrition: (id: string, values: NutritionValues) => void;
    removeEntry: (id: string) => void;
    errorIds: Set<string>;
    retrySave: (id: string) => void;
  };
  ```

- [ ] **Step 1: Add the `date` URL param to `store.ts`**

In `src/lib/store.ts`, immediately after the existing `NUTRITION_SCOPE_QUERY_PARAM` block (the `readNutritionScopeFromUrl`/`writeNutritionScopeToUrl` pair) and before `export function newTenant`, add:

```ts
const MEAL_DATE_QUERY_PARAM = "date";

export function readMealDateFromUrl(): string | null {
  return readUrlParam(MEAL_DATE_QUERY_PARAM);
}

export function writeMealDateToUrl(date: string) {
  writeUrlParam(MEAL_DATE_QUERY_PARAM, date);
}
```

- [ ] **Step 2: Write the hook**

Create `src/hooks/useMealPlan.ts`:

```ts
import { useEffect, useState } from "react";
import {
  defaultTitle,
  readMealDateFromUrl,
  uid,
  writeMealDateToUrl,
} from "@/lib/store";
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealEntries,
  updateMealEntry,
  type MealEntry,
  type MealSlot,
} from "@/lib/mealPlan";

const WINDOW_DAYS = 3;

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function strToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDaysStr(dateStr: string, delta: number): string {
  const dt = strToDate(dateStr);
  dt.setDate(dt.getDate() + delta);
  return dateToStr(dt);
}

function todayDateStr(): string {
  return dateToStr(new Date());
}

function initialDate(): string {
  const fromUrl = readMealDateFromUrl();
  return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : todayDateStr();
}

export type NutritionValues = {
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
};

export function useMealPlan(householdId: string | null) {
  const [date, setDate] = useState<string>(initialDate);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [unsyncedIds, setUnsyncedIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    writeMealDateToUrl(date);
  }, [date]);

  // Fetch a window around the viewed date so prev/next-day navigation
  // doesn't hit the network on every click.
  useEffect(() => {
    if (!householdId) return;
    let cancelled = false;
    const from = addDaysStr(date, -WINDOW_DAYS);
    const to = addDaysStr(date, WINDOW_DAYS);
    fetchMealEntries(householdId, from, to).then((fetched) => {
      if (cancelled) return;
      setEntries(fetched);
      setUnsyncedIds(new Set());
      setErrorIds(new Set());
    });
    return () => {
      cancelled = true;
    };
  }, [householdId, date]);

  function goToPrevDay() {
    setDate((d) => addDaysStr(d, -1));
  }

  function goToNextDay() {
    setDate((d) => addDaysStr(d, 1));
  }

  function entriesForSlot(slot: MealSlot): MealEntry[] {
    return entries
      .filter((e) => e.date === date && e.slot === slot)
      .sort((a, b) => a.position - b.position);
  }

  function fixedEntry(slot: Exclude<MealSlot, "ara">): MealEntry | undefined {
    return entriesForSlot(slot)[0];
  }

  function araEntries(): MealEntry[] {
    return entriesForSlot("ara");
  }

  function dayTotals() {
    const todays = entries.filter((e) => e.date === date);
    const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    for (const e of todays) {
      if (e.kcal != null) totals.kcal += e.kcal;
      if (e.proteinG != null) totals.protein += e.proteinG;
      if (e.fatG != null) totals.fat += e.fatG;
      if (e.carbsG != null) totals.carbs += e.carbsG;
      if (e.fiberG != null) totals.fiber += e.fiberG;
    }
    return totals;
  }

  function upsertLocal(entry: MealEntry) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx === -1) return [...prev, entry];
      const next = [...prev];
      next[idx] = entry;
      return next;
    });
  }

  async function persistCreate(entry: MealEntry) {
    if (!householdId) return;
    const created = await createMealEntry({
      id: entry.id,
      householdId,
      date: entry.date,
      slot: entry.slot,
      text: entry.text,
      kcal: entry.kcal,
      proteinG: entry.proteinG,
      fatG: entry.fatG,
      carbsG: entry.carbsG,
      fiberG: entry.fiberG,
      position: entry.position,
    });
    if (created) {
      setUnsyncedIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
      setErrorIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
    } else {
      setErrorIds((ids) => new Set(ids).add(entry.id));
    }
  }

  async function persistUpdate(entry: MealEntry) {
    const updated = await updateMealEntry(entry.id, {
      text: entry.text,
      kcal: entry.kcal,
      proteinG: entry.proteinG,
      fatG: entry.fatG,
      carbsG: entry.carbsG,
      fiberG: entry.fiberG,
    });
    if (updated) {
      setErrorIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
    } else {
      setErrorIds((ids) => new Set(ids).add(entry.id));
    }
  }

  function persist(entry: MealEntry) {
    if (unsyncedIds.has(entry.id)) {
      void persistCreate(entry);
    } else {
      void persistUpdate(entry);
    }
  }

  function saveFixedSlotText(slot: Exclude<MealSlot, "ara">, text: string) {
    const trimmed = text.trim();
    const existing = fixedEntry(slot);
    if (!trimmed) {
      if (existing) removeEntry(existing.id);
      return;
    }
    if (existing) {
      const updated: MealEntry = { ...existing, text: trimmed };
      upsertLocal(updated);
      persist(updated);
      return;
    }
    const created: MealEntry = {
      id: uid(),
      date,
      slot,
      text: trimmed,
      kcal: null,
      proteinG: null,
      fatG: null,
      carbsG: null,
      fiberG: null,
      position: 0,
    };
    setUnsyncedIds((ids) => new Set(ids).add(created.id));
    upsertLocal(created);
    persist(created);
  }

  function addAraEntry(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nextPosition = araEntries().length;
    const created: MealEntry = {
      id: uid(),
      date,
      slot: "ara",
      text: trimmed,
      kcal: null,
      proteinG: null,
      fatG: null,
      carbsG: null,
      fiberG: null,
      position: nextPosition,
    };
    setUnsyncedIds((ids) => new Set(ids).add(created.id));
    upsertLocal(created);
    persist(created);
  }

  function saveEntryNutrition(id: string, values: NutritionValues) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    const updated: MealEntry = { ...existing, ...values };
    upsertLocal(updated);
    persist(updated);
  }

  function removeEntry(id: string) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setErrorIds((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
    if (unsyncedIds.has(id)) {
      // Never made it to the server — nothing to delete remotely.
      setUnsyncedIds((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
      return;
    }
    deleteMealEntry(id).then((ok) => {
      // Deletion failed — put it back rather than silently losing it.
      if (!ok) upsertLocal(existing);
    });
  }

  function retrySave(id: string) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    persist(existing);
  }

  return {
    dateLabel: defaultTitle(strToDate(date).getTime()),
    goToPrevDay,
    goToNextDay,
    fixedEntry,
    araEntries,
    dayTotals,
    saveFixedSlotText,
    addAraEntry,
    saveEntryNutrition,
    removeEntry,
    errorIds,
    retrySave,
  };
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run build
```

Expected: succeeds with no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/store.ts src/hooks/useMealPlan.ts
git commit -m "Add useMealPlan hook"
```

---

## Task 6: `MealPlanView` component

**Depends on:** Task 5 (`useMealPlan`).

**Files:**
- Create: `src/components/MealPlanView.tsx`

**Interfaces:**
- Consumes: `useMealPlan`, `NutritionValues` from `src/hooks/useMealPlan.ts`; `MealEntry`, `MealSlot` from `src/lib/mealPlan.ts`.
- Produces: `MealPlanView({ householdId: string | null })`, consumed by Task 7's `App.tsx`.

- [ ] **Step 1: Write the component**

Create `src/components/MealPlanView.tsx`:

```tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMealPlan, type NutritionValues } from "@/hooks/useMealPlan";
import type { MealEntry, MealSlot } from "@/lib/mealPlan";

type Props = {
  householdId: string | null;
};

const FIXED_SLOTS: { slot: Exclude<MealSlot, "ara">; label: string }[] = [
  { slot: "kahvalti", label: "Kahvaltı" },
  { slot: "ogle", label: "Öğle" },
  { slot: "aksam", label: "Akşam" },
];

export function MealPlanView({ householdId }: Props) {
  const {
    dateLabel,
    goToPrevDay,
    goToNextDay,
    fixedEntry,
    araEntries,
    dayTotals,
    saveFixedSlotText,
    addAraEntry,
    saveEntryNutrition,
    removeEntry,
    errorIds,
    retrySave,
  } = useMealPlan(householdId);

  const totals = dayTotals();
  const hasTotals =
    totals.kcal > 0 ||
    totals.protein > 0 ||
    totals.fat > 0 ||
    totals.carbs > 0 ||
    totals.fiber > 0;

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToPrevDay}
          aria-label="Önceki gün"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold tracking-tight">{dateLabel}</span>
        <Button
          type="button"
          variant="quiet"
          size="icon"
          onClick={goToNextDay}
          aria-label="Sonraki gün"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {FIXED_SLOTS.map(({ slot, label }) => {
          const entry = fixedEntry(slot);
          return (
            <FixedSlotRow
              key={slot}
              label={label}
              entry={entry}
              onSaveText={(text) => saveFixedSlotText(slot, text)}
              onSaveNutrition={(values) => entry && saveEntryNutrition(entry.id, values)}
              hasError={entry ? errorIds.has(entry.id) : false}
              onRetry={entry ? () => retrySave(entry.id) : undefined}
            />
          );
        })}

        <AraOgunSection
          entries={araEntries()}
          onAdd={addAraEntry}
          onSaveNutrition={saveEntryNutrition}
          onRemove={removeEntry}
          errorIds={errorIds}
          onRetry={retrySave}
        />
      </div>

      {hasTotals && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Toplam
          </span>
          <span className="ledger tabular-nums">
            {Math.round(totals.kcal)} kcal · P {totals.protein.toFixed(1)} · Y{" "}
            {totals.fat.toFixed(1)} · K {totals.carbs.toFixed(1)} · L {totals.fiber.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

function FixedSlotRow({
  label,
  entry,
  onSaveText,
  onSaveNutrition,
  hasError,
  onRetry,
}: {
  label: string;
  entry: MealEntry | undefined;
  onSaveText: (text: string) => void;
  onSaveNutrition: (values: NutritionValues) => void;
  hasError: boolean;
  onRetry: (() => void) | undefined;
}) {
  const [text, setText] = useState(entry?.text ?? "");

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={text}
        aria-label={`${label} yemeği`}
        placeholder="ör. Menemen"
        onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
        onBlur={() => onSaveText(text)}
        className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-1.5 text-[0.975rem] outline-none focus:border-foreground"
      />
      {entry && (
        <div className="mt-1.5">
          <NutritionFields entry={entry} onSave={onSaveNutrition} />
          {hasError && onRetry && <ErrorRetry onRetry={onRetry} />}
        </div>
      )}
    </div>
  );
}

function AraOgunSection({
  entries,
  onAdd,
  onSaveNutrition,
  onRemove,
  errorIds,
  onRetry,
}: {
  entries: MealEntry[];
  onAdd: (text: string) => void;
  onSaveNutrition: (id: string, values: NutritionValues) => void;
  onRemove: (id: string) => void;
  errorIds: Set<string>;
  onRetry: (id: string) => void;
}) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  }

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Ara öğün</span>
      <ul className="mt-1">
        {entries.map((entry) => (
          <li key={entry.id} className="border-b border-border py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.975rem]">{entry.text}</span>
              <button
                type="button"
                aria-label={`${entry.text} kaldır`}
                onClick={() => onRemove(entry.id)}
                className="rounded p-1 text-muted-foreground hover:text-signal"
              >
                <X className="size-4" />
              </button>
            </div>
            <NutritionFields
              entry={entry}
              onSave={(values) => onSaveNutrition(entry.id, values)}
            />
            {errorIds.has(entry.id) && <ErrorRetry onRetry={() => onRetry(entry.id)} />}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2">
        <Input
          value={text}
          aria-label="Ara öğün ekle"
          placeholder="Ara öğün ekle"
          onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" variant="quiet" size="sm" onClick={submit} disabled={!text.trim()}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

function NutritionFields({
  entry,
  onSave,
}: {
  entry: MealEntry;
  onSave: (values: NutritionValues) => void;
}) {
  const [kcal, setKcal] = useState(str(entry.kcal));
  const [protein, setProtein] = useState(str(entry.proteinG));
  const [fat, setFat] = useState(str(entry.fatG));
  const [carbs, setCarbs] = useState(str(entry.carbsG));
  const [fiber, setFiber] = useState(str(entry.fiberG));

  function commit() {
    onSave({
      kcal: num(kcal),
      proteinG: num(protein),
      fatG: num(fat),
      carbsG: num(carbs),
      fiberG: num(fiber),
    });
  }

  return (
    <div className="mt-1 grid grid-cols-5 gap-1">
      <NumField label="kcal" value={kcal} onInput={setKcal} onBlur={commit} />
      <NumField label="P" value={protein} onInput={setProtein} onBlur={commit} />
      <NumField label="Y" value={fat} onInput={setFat} onBlur={commit} />
      <NumField label="K" value={carbs} onInput={setCarbs} onBlur={commit} />
      <NumField label="L" value={fiber} onInput={setFiber} onBlur={commit} />
    </div>
  );
}

function NumField({
  label,
  value,
  onInput,
  onBlur,
}: {
  label: string;
  value: string;
  onInput: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={value}
        onInput={(e: Event) => onInput((e.target as HTMLInputElement).value)}
        onBlur={onBlur}
        className="ledger h-9 px-2 text-right tabular-nums"
      />
    </label>
  );
}

function ErrorRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="mt-1 text-xs text-destructive underline underline-offset-2"
    >
      kaydedilemedi · tekrar dene
    </button>
  );
}

function str(n: number | null): string {
  return typeof n === "number" ? String(n) : "";
}

function num(s: string): number | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const v = Number(trimmed);
  return Number.isFinite(v) && v >= 0 ? v : null;
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run build
```

Expected: succeeds with no new errors. (This component isn't reachable from the UI yet — that's Task 7 — so this step only proves it compiles.)

- [ ] **Step 3: Commit**

```bash
git add src/components/MealPlanView.tsx
git commit -m "Add MealPlanView component"
```

---

## Task 7: Wire the new section into `AppHeader` and `App`

**Depends on:** Task 4 (`Section` type), Task 6 (`MealPlanView`).

**Files:**
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Section` (Task 4), `MealPlanView` (Task 6).
- Produces: the section is reachable in the running app — this is what Task 8 exercises.

- [ ] **Step 1: Add the third toggle button to `AppHeader.tsx`**

In `src/components/AppHeader.tsx`, find the section-toggle `<div className="inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1">` block (it currently has two `<button>`s: "Alışveriş" and "Besin değerleri"). Add a third button immediately after the "Besin değerleri" button, before the closing `</div>`:

```tsx
          <button
            type="button"
            onClick={() => onSelectSection("yemek")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              section === "yemek"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yemek Planı
          </button>
```

No other change needed in this file: the two `section === "alisveris"` conditionals further down (the title/progress block and the tabs-vs-blank-spacer block) already collapse to their "not alisveris" branch for any other section value, which is the correct behavior for `"yemek"` too (no shopping-list title bar or tab strip under the new section).

- [ ] **Step 2: Render `MealPlanView` in `App.tsx`**

In `src/App.tsx`, add the import:

```tsx
import { MealPlanView } from "@/components/MealPlanView";
```

Then change:

```tsx
      <main className="pt-5">
        {section === "besin" ? (
          <NutritionView items={active.items} />
        ) : (
          <AppShoppingTabs
```

to:

```tsx
      <main className="pt-5">
        {section === "besin" ? (
          <NutritionView items={active.items} />
        ) : section === "yemek" ? (
          <MealPlanView householdId={activeTenantId} />
        ) : (
          <AppShoppingTabs
```

(The `</AppShoppingTabs>`-closing structure and everything below it is unchanged — only the condition chain above it changes from a two-way ternary to a three-way one.)

- [ ] **Step 3: Typecheck**

```bash
npm run build
```

Expected: succeeds with no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppHeader.tsx src/App.tsx
git commit -m "Wire the meal planner into the app's section toggle"
```

---

## Task 8: End-to-end verification

**Depends on:** Task 7 (the feature must be reachable in the running app).

**Files:** none (verification only — a throwaway driver script in the scratch/temp directory, not committed).

- [ ] **Step 1: Start the real backend**

```bash
npm run netlify:dev
```

Wait until it serves on `:8888` (poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/` for `200`).

- [ ] **Step 2: Write and run a Playwright driver script**

If Playwright isn't already available, install it once: `npx --yes playwright install chromium`. Write a script (e.g. `verify-meal-planner.mjs` in a scratch directory) that:

1. Launches headless Chromium, opens `http://localhost:8888/`, waits for the app shell (`input[aria-label="Liste adı"]`).
2. Clicks the "Yemek Planı" toggle, waits for the Kahvaltı label to appear.
3. Fills the Kahvaltı input with a test dish name, blurs it, waits briefly, and asserts the value survived a page reload (fetches the section fresh).
4. Fills in kcal/P/Y/K/L for that entry (via the five `NumField`s), blurs, and asserts the "Toplam" row now shows non-zero values.
5. Adds an "Ara öğün" entry via its add-input + Enter, asserts it appears in the list.
6. Clicks prev-day then next-day, asserts the view returns to the original date's entries.
7. **Section-switch isolation:** clicks "Alışveriş" to leave the meal planner, asserts the shopping-list view renders correctly (e.g. the "Ürün ekle" input is visible), then clicks "Yemek Planı" again and asserts the Kahvaltı entry from step 3 is still showing — confirms neither section clobbers the other's state.
8. **Empty-text removal:** clears the Kahvaltı input back to empty and blurs it, then asserts the row shows no dish name and no `NumField`s (the entry — and its nutrition fields — are gone, not left behind as a blank row). Re-fill it with the same test dish name afterward so the rest of the script has an entry to clean up in step 10.
9. **Network-failure retry path:** use `page.route("**/api/meal-entries*", route => route.abort())` to block the API, edit the Kahvaltı entry's kcal field and blur it, assert the "kaydedilemedi · tekrar dene" retry button appears. Call `page.unroute(...)` to restore normal networking, click the retry button, and assert the retry button disappears (save succeeded).
10. Collect `console` "error"-type messages and `pageerror` events throughout (steps 1–9) — assert both arrays are empty at the end. (The intentionally-aborted request in step 9 will surface as a failed `fetch`, which this app already catches and logs via `console.warn`, not `console.error` — confirm that's still true here, since a `console.error` there would be a real regression, not test noise.)
11. **Cleanup, and don't close the browser immediately after:** remove every test entry created (Kahvaltı text back to empty via the input, Ara öğün entry via its remove button), wait at least 2–3 seconds for the save calls to actually round-trip (this feature has no debounce like the shopping list's 500ms push, but the network round-trip itself still takes time — closing the browser right after firing a `fetch` can abandon it mid-flight), *then* close the browser.
12. Open a **second**, fresh browser instance and reload the app to `/?section=yemek` — confirm the day is back to empty. This is the same "verify with a truly fresh load, not just the same page" discipline that caught a leftover test item during the App.tsx split work earlier in this project — trust the reload, not just the in-page state, to confirm cleanup actually landed.

- [ ] **Step 3: Fix anything the script surfaces**

If any assertion fails or a console/page error appears, that's a real bug in Tasks 1–7 — fix the relevant task's file, re-run `npm run build`, and re-run the script from Step 2 until it's clean.

- [ ] **Step 4: Stop the dev server**

Find and kill the process listening on `:8888` (and the Vite dev server it spawned on `:5173`), the same way as after any other manual verification pass in this repo — don't leave it running.

- [ ] **Step 5: Final commit (if Step 3 required fixes)**

```bash
git add -A
git commit -m "Fix issues found during meal planner end-to-end verification"
```

If Step 3 required no fixes, skip this — there's nothing to commit.

---

## After this plan

The branch `meal-planner-v1` now has the full v1 feature, task-by-task. Merging to `master` and pushing is a separate, explicit step (per this repo's git convention) — not implied by finishing this plan.
