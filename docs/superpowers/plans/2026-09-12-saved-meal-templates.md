# Saved Meal Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Opus 5 — new Supabase table, RLS policy, and Vercel function on top of the
frontend work; the highest correctness/security surface in this batch.

**Scope:** Backend and Frontend (new `meal_templates` table + `api/meal-templates.ts`, plus a
client wrapper, hook, and two new UI components).

**Goal:** Let a user save a meal's current set of items as a named template, and later re-add
that same set of items into any meal slot on any day — without re-picking every ingredient.

**Architecture:** No existing table models this — it's new, but it's a small variant of a
pattern already proven twice in this codebase (`preparation_batches` for immutable batch
snapshots, `meal_entries` for household-scoped CRUD): a new `meal_templates` table
(`id`, `household_id`, `name`, `items jsonb`, `created_at`), a new `api/meal-templates.ts`
function (GET list / POST create / DELETE, mirroring `api/meal-entries.ts`'s auth and RLS
conventions exactly), a client wrapper (`src/lib/mealTemplates.ts`), and a TanStack Query hook
(`src/hooks/useMealTemplates.ts`, mirroring `useBatches.ts`). UI-wise: the save action is scoped
to one specific meal's current contents, so — per the product owner's own "pick the best
UI/UX" instruction — the save button lives **inside each meal card** next to that meal's other
per-meal actions, not as a separate bottom section; a bottom-of-page save button would force an
extra "which meal do you mean?" step for an action that's already anchored to a specific meal the
user is looking at. Loading a saved template back into a slot gets its own small "Kayıtlı öğün
ekle" affordance in the same card, next to Save.

**Tech Stack:** Preact function components, TanStack Query (`@tanstack/preact-query`, already a
dependency), a new Supabase table + Vercel function, following `api/meal-entries.ts` and
`api/preparation-batches.ts` conventions exactly.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Öğün
kaydetme seçeneği ekle. Sonradan seçim yapılabilsin. Button öğün kartlarının içinde veya en
aşağıda ayrı bir kısım olarak yer alabilir. UI/UX için en iyisini seç." Ground truth:
`api/meal-entries.ts`, `api/preparation-batches.ts`, `src/lib/preparationBatch.ts`,
`src/hooks/useBatches.ts`, `supabase/17-preparation-batches.sql`,
`supabase/22-security-definer-functions-to-private-schema.sql` (current RLS policy shape),
`lib/auth.ts`.

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- `items[].food_id` uses the same value space as `meal_entries.food_id` / `Combo.items[].foodId`
  (`nutrition.name_tr`) — never the opaque `Nutrition.food_id` UUID. Same rule as
  `preparation_batches.composition[].food_id`; don't conflate them.
- RLS on the new table must use `app_private.has_household_access(household_id)`, the current
  (post-migration-22) pattern every other household-scoped table uses — not the older
  `public.has_household_access` name from migration 19, which no longer exists.
- Every request authenticates as the caller's own Supabase session (`userRestHeaders`), matching
  `api/meal-entries.ts` — do not use `SUPABASE_SECRET_KEY` for ordinary reads/writes here.
- Watch Vercel's Hobby-plan function-count budget (`docs/architecture.md`'s Environment
  variables section notes the 12-function limit and the `_action`-param merge used to stay under
  it for `auth-google.ts`). Adding one new file (`api/meal-templates.ts`) is the same cost every
  other household-scoped resource (`meal-entries.ts`, `preparation-batches.ts`) already paid —
  flag to the repo owner if the deployed function count is already at the ceiling before adding
  another.

---

## File Structure

- Create: `supabase/25-meal-templates.sql` — table + RLS policy.

  > Note: if the agent-test-login plan (`2026-09-12-agent-test-login.md`) lands first and claims
  > `25-agent-login-tokens.sql`, renumber this file to the next free number — migrations are
  > applied in filename order and must not collide.
- Create: `api/meal-templates.ts` — GET (list)/POST (create)/DELETE.
- Create: `src/lib/mealTemplates.ts` — client wrapper (fetch/create/delete + row↔domain mapping).
- Create: `src/hooks/useMealTemplates.ts` — TanStack Query hook, mirroring `useBatches.ts`.
- Create: `src/components/SaveMealTemplateModal.tsx` — name-and-save dialog.
- Create: `src/components/LoadMealTemplateModal.tsx` — pick a saved template to add.
- Modify: `src/components/MealContainer.tsx` — add Save/Load affordances.
- Modify: `src/components/MealPlanView.tsx` — wire the two modals + hook.

## Task 1: `meal_templates` table

**Files:**
- Create: `supabase/25-meal-templates.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/25-meal-templates.sql
--
-- A named, reusable snapshot of a meal's items, so a user can save "my usual
-- breakfast" once and re-add it into any slot on any day. Mirrors
-- preparation_batches' shape (id/household_id/items as jsonb/created_at) but
-- is a distinct concept: a template has no prepared_date, no storage_note,
-- no source_combo_id, and is user-named rather than combo-derived.
--
-- items[].food_id uses the SAME value space as meal_entries.food_id /
-- Combo.items[].foodId (nutrition.name_tr) — NOT the opaque Nutrition.food_id
-- UUID. See supabase/17-preparation-batches.sql for the identical rule
-- applied to preparation_batches.composition.
--
-- RLS follows the current (post-22-security-definer-functions-to-private-
-- schema.sql) pattern: app_private.has_household_access(household_id), full
-- CRUD, same as meal_entries_all/preparation_batches_all.
--
-- Idempotent: safe to re-run.

create table if not exists public.meal_templates (
  id           text primary key,
  household_id text not null references public.households(id) on delete cascade,
  name         text not null,
  items        jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists meal_templates_household_idx
  on public.meal_templates (household_id, created_at desc);

alter table public.meal_templates enable row level security;

drop policy if exists meal_templates_all on public.meal_templates;
create policy meal_templates_all on public.meal_templates
  for all using (app_private.has_household_access(household_id))
  with check (app_private.has_household_access(household_id));
```

- [ ] **Step 2: Apply it** against the project's Supabase instance (same mechanism used for prior
  numbered migrations — see `docs/architecture.md`'s Deployment section).

- [ ] **Step 3: Verify** in the Supabase table editor: `meal_templates` exists with RLS enabled
  and one policy (`meal_templates_all`, `FOR ALL`).

- [ ] **Step 4: Stop for review.**

## Task 2: `api/meal-templates.ts`

**Files:**
- Create: `api/meal-templates.ts`

**Interfaces:**
- Produces: `GET /api/meal-templates?householdId=<id>` → `MealTemplateRow[]` (newest first).
  `POST /api/meal-templates` (body `{ id, household_id, name, items: {food_id,quantity_g}[] }`)
  → `MealTemplateRow`. `DELETE /api/meal-templates?id=<id>` → `{ ok: true }`.

- [ ] **Step 1: Write the function**, following `api/meal-entries.ts`'s exact shape for auth,
  validation, and error handling, adapted to this table's simpler payload:

```typescript
// GET    /api/meal-templates?householdId=<id>  -> MealTemplateRow[]  (list, newest first)
// POST   /api/meal-templates                    -> MealTemplateRow   (create)
// DELETE /api/meal-templates?id=<id>             -> { ok: true }      (delete)
//
// Persists named, reusable meal snapshots (see src/lib/mealTemplates.ts).
// Every request authenticates as the caller's own Supabase session —
// meal_templates_all RLS policy backs household access on top of
// requireHouseholdAccess, same layering as api/meal-entries.ts. The one
// service_role lookup is mealTemplateHouseholdId, resolving which household
// a template belongs to for a DELETE that only carries the template's id —
// same rationale as api/meal-entries.ts's mealEntryHouseholdId.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

export type MealTemplateRow = {
  id: string;
  household_id: string;
  name: string;
  items: { food_id: string; quantity_g: number }[];
  created_at: string;
};

const JSON_HEADERS = { "content-type": "application/json", "cache-control": "no-store" };
const SELECT_COLS = "id,household_id,name,items,created_at";

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
    if (method === "DELETE") return handleDelete(request, user);
    return json({ error: "method not allowed" }, 405);
  },
};

async function mealTemplateHouseholdId(id: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("supabase not configured");
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };
  const res = await fetch(
    `${restBase(supabaseUrl)}/meal_templates?id=eq.${encodeURIComponent(id)}&select=household_id`,
    { headers },
  );
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  const rows = (await res.json()) as { household_id: string }[];
  return rows[0]?.household_id ?? null;
}

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return json({ error: "supabase not configured" }, 500);

  const url = new URL(request.url);
  const householdId = url.searchParams.get("householdId")?.trim();
  if (!householdId) return json({ error: "expected ?householdId=<id>" }, 400);

  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = userRestHeaders(user);
  try {
    const target =
      `${restBase(supabaseUrl)}/meal_templates?select=${SELECT_COLS}` +
      `&household_id=eq.${encodeURIComponent(householdId)}&order=created_at.desc`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    return json((await response.json()) as MealTemplateRow[], 200);
  } catch (e) {
    return json({ error: `failed to fetch meal templates: ${e}` }, 500);
  }
}

async function handleCreate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return json({ error: "supabase not configured" }, 500);

  let body: {
    id?: unknown;
    household_id?: unknown;
    name?: unknown;
    items?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return json({ error: "expected id: string (non-empty)" }, 400);
  }
  if (typeof body.household_id !== "string" || !body.household_id.trim()) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }
  try {
    await requireHouseholdAccess(body.household_id.trim(), user);
  } catch (err) {
    return authErrorResponse(err);
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return json({ error: "expected name: string (non-empty)" }, 400);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json({ error: "expected items: non-empty array" }, 400);
  }
  const items: { food_id: string; quantity_g: number }[] = [];
  for (const raw of body.items) {
    const item = raw as { food_id?: unknown; quantity_g?: unknown };
    if (typeof item.food_id !== "string" || !item.food_id.trim()) {
      return json({ error: "each item needs food_id: string (non-empty)" }, 400);
    }
    if (typeof item.quantity_g !== "number" || !Number.isFinite(item.quantity_g) || item.quantity_g <= 0) {
      return json({ error: "each item needs quantity_g: positive number" }, 400);
    }
    items.push({ food_id: item.food_id.trim(), quantity_g: item.quantity_g });
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };
  const payload = {
    id: body.id.trim(),
    household_id: body.household_id.trim(),
    name: body.name.trim(),
    items,
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/meal_templates`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return json(
        { error: `supabase ${response.status}`, details: await response.text() },
        response.status === 409 ? 409 : 502,
      );
    }
    const data = (await response.json()) as MealTemplateRow[];
    if (data.length === 0) return json({ error: "meal template creation failed" }, 500);
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create meal template: ${e}` }, 500);
  }
}

async function handleDelete(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return json({ error: "supabase not configured" }, 500);

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) return json({ error: "expected ?id=<meal_template_id>" }, 400);

  let householdId: string | null;
  try {
    householdId = await mealTemplateHouseholdId(id);
  } catch (e) {
    return json({ error: `failed to look up meal template: ${e}` }, 502);
  }
  if (householdId === null) return json({ error: "not found" }, 404);
  try {
    await requireHouseholdAccess(householdId, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/meal_templates?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: userRestHeaders(user) },
    );
    if (!response.ok) {
      return json(
        { error: `supabase ${response.status}`, details: await response.text() },
        502,
      );
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to delete meal template: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -p api/tsconfig.json --noEmit`
Expected: no errors.

- [ ] **Step 3: Stop for review.**

## Task 3: Client wrapper + hook

**Files:**
- Create: `src/lib/mealTemplates.ts`
- Create: `src/hooks/useMealTemplates.ts`

**Interfaces:**
- Produces (from `mealTemplates.ts`): `type MealTemplate = { id: string; householdId: string;
  name: string; items: { foodId: string; quantityG: number }[] }`;
  `fetchMealTemplates(householdId): Promise<MealTemplate[]>`;
  `createMealTemplate(input: { id, householdId, name, items }): Promise<MealTemplate | null>`;
  `deleteMealTemplate(id): Promise<boolean>`.
- Produces (from `useMealTemplates.ts`): `useMealTemplates(householdId: string | null)` →
  `{ templates: MealTemplate[], isLoading: boolean, saveTemplate, removeTemplate }`.

- [ ] **Step 1: Write `src/lib/mealTemplates.ts`**, following `src/lib/preparationBatch.ts`'s
  persistence section shape (`fromRow`, `apiUrl`, fetch wrappers that `console.warn` and return a
  safe default on failure rather than throwing):

```typescript
export type MealTemplateItem = { foodId: string; quantityG: number };

export type MealTemplate = {
  id: string;
  householdId: string;
  name: string;
  items: MealTemplateItem[];
};

type MealTemplateRow = {
  id: string;
  household_id: string;
  name: string;
  items: { food_id: string; quantity_g: number }[];
  created_at: string;
};

function fromRow(row: MealTemplateRow): MealTemplate {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    items: row.items.map((item) => ({ foodId: item.food_id, quantityG: item.quantity_g })),
  };
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function fetchMealTemplates(householdId: string): Promise<MealTemplate[]> {
  try {
    const res = await fetch(
      apiUrl(`/api/meal-templates?householdId=${encodeURIComponent(householdId)}`),
      { method: "GET", headers: { "content-type": "application/json" } },
    );
    if (!res.ok) {
      console.warn("[mealTemplates] fetch failed:", res.status);
      return [];
    }
    return ((await res.json()) as MealTemplateRow[]).map(fromRow);
  } catch (err) {
    console.warn("[mealTemplates] fetch threw:", err);
    return [];
  }
}

export type NewMealTemplate = {
  id: string;
  householdId: string;
  name: string;
  items: MealTemplateItem[];
};

export async function createMealTemplate(
  input: NewMealTemplate,
): Promise<MealTemplate | null> {
  try {
    const res = await fetch(apiUrl("/api/meal-templates"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: input.id,
        household_id: input.householdId,
        name: input.name,
        items: input.items.map((item) => ({ food_id: item.foodId, quantity_g: item.quantityG })),
      }),
    });
    if (!res.ok) {
      console.warn("[mealTemplates] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as MealTemplateRow);
  } catch (err) {
    console.warn("[mealTemplates] create threw:", err);
    return null;
  }
}

export async function deleteMealTemplate(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/meal-templates?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[mealTemplates] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[mealTemplates] delete threw:", err);
    return false;
  }
}
```

- [ ] **Step 2: Write `src/hooks/useMealTemplates.ts`**, mirroring `src/hooks/useBatches.ts`:

```typescript
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createMealTemplate,
  deleteMealTemplate,
  fetchMealTemplates,
  type MealTemplate,
  type NewMealTemplate,
} from "@/lib/mealTemplates";

export function useMealTemplates(householdId: string | null) {
  const queryKey = ["mealTemplates", householdId ?? "local"] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMealTemplates(householdId as string),
    enabled: !!householdId,
    staleTime: 30_000,
  });

  async function saveTemplate(input: NewMealTemplate): Promise<MealTemplate | null> {
    const created = await createMealTemplate(input);
    if (created) {
      queryClient.setQueryData<MealTemplate[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
    }
    return created;
  }

  async function removeTemplate(id: string): Promise<void> {
    const ok = await deleteMealTemplate(id);
    if (ok) {
      queryClient.setQueryData<MealTemplate[]>(queryKey, (prev) =>
        (prev ?? []).filter((t) => t.id !== id),
      );
    }
  }

  return {
    templates: query.data ?? [],
    isLoading: !!householdId && query.isLoading,
    saveTemplate,
    removeTemplate,
  };
}
```

- [ ] **Step 3: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Stop for review.**

## Task 4: Save/Load UI in the meal card

**Files:**
- Create: `src/components/SaveMealTemplateModal.tsx`
- Create: `src/components/LoadMealTemplateModal.tsx`
- Modify: `src/components/MealContainer.tsx`
- Modify: `src/components/MealPlanView.tsx`

- [ ] **Step 1: `SaveMealTemplateModal`** — a name input + Save/Cancel, styled like
  `ConfirmModal.tsx`:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onSave: (name: string) => void;
  onCancel: () => void;
};

export function SaveMealTemplateModal({ onSave, onCancel }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Vazgeç"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 w-full max-w-[22rem] rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-base font-semibold">Öğünü kaydet</h2>
        <Input
          value={name}
          onInput={(e: Event) => setName((e.target as HTMLInputElement).value)}
          placeholder="Örn. Hafta içi kahvaltım"
          autoFocus
          className="mt-3"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!name.trim()}
            onClick={() => onSave(name.trim())}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `LoadMealTemplateModal`** — list saved templates, pick one to add:

```tsx
import { X } from "lucide-react";
import type { MealTemplate } from "@/lib/mealTemplates";

type Props = {
  templates: MealTemplate[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: MealTemplate) => void;
};

export function LoadMealTemplateModal({ templates, isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Kayıtlı öğün seç</h2>
          <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        {templates.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Henüz kayıtlı öğün yok.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors">
                <h4 className="font-medium text-foreground text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.items.length} ürün
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Save/Load affordances to `MealContainer`**

```diff
-import { Plus, ShoppingCart } from "lucide-react";
+import { Plus, ShoppingCart, BookmarkPlus, FolderOpen } from "lucide-react";
```

```diff
       <div className="flex items-baseline justify-between gap-2">
         <h3 className="font-semibold text-foreground">{label.tr}</h3>
-        {totals && ( ... )}
+        <div className="flex items-center gap-2">
+          {totals && ( ... /* unchanged from the meal-row-macro-totals plan */ )}
+          <button
+            type="button"
+            onClick={onLoadTemplate}
+            aria-label="Kayıtlı öğün ekle"
+            className="p-1 text-muted-foreground hover:text-primary">
+            <FolderOpen className="size-4" />
+          </button>
+          <button
+            type="button"
+            disabled={items.length === 0}
+            onClick={onSaveTemplate}
+            aria-label="Bu öğünü kaydet"
+            className="p-1 text-muted-foreground hover:text-primary disabled:opacity-40">
+            <BookmarkPlus className="size-4" />
+          </button>
+        </div>
       </div>
```

Add `onSaveTemplate: () => void` and `onLoadTemplate: () => void` to `MealContainer`'s `Props`
type and destructuring.

- [ ] **Step 4: Wire it in `MealPlanView`**

```typescript
  const { templates, saveTemplate } = useMealTemplates(householdId);
  const [savingSlot, setSavingSlot] = useState<MealSlot | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<MealSlot | null>(null);

  function handleSaveTemplate(name: string) {
    if (!savingSlot || !householdId) return;
    const items = itemsForSlot(savingSlot).map((item) => ({
      foodId: item.foodId,
      quantityG: item.quantityG,
    }));
    saveTemplate({ id: uid(), householdId, name, items });
    setSavingSlot(null);
  }

  function handleLoadTemplate(template: MealTemplate) {
    if (!loadingSlot) return;
    for (const item of template.items) {
      addItem(loadingSlot, item.foodId, item.quantityG);
    }
    setLoadingSlot(null);
  }
```

Pass `onSaveTemplate={() => setSavingSlot(slot)}` and `onLoadTemplate={() => setLoadingSlot(slot)}`
to each `<MealContainer>`, and render `{savingSlot && <SaveMealTemplateModal onSave=... />}` and
`<LoadMealTemplateModal templates={templates} isOpen={!!loadingSlot} ... />` near the other
modals. Import `uid` from `@/lib/store` (already used elsewhere in this file's sibling
components) if not already imported.

- [ ] **Step 5: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run vercel:dev`. Add items to a meal, tap the bookmark icon, name it, save. Reload the
page — tap the folder icon on any meal (including a different slot), pick the saved template.
Expected: all of the template's items get added to that slot with their original gram amounts.

- [ ] **Step 7: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Self-Review Notes

- **Spec coverage:** "Öğün kaydetme seçeneği ekle" → Tasks 1-3 (persistence) + Task 4 Step 3-4
  (save UI). "Sonradan seçim yapılabilsin" → Task 4's `LoadMealTemplateModal` + `handleLoadTemplate`.
  "Button öğün kartlarının içinde... UI/UX için en iyisini seç" → Architecture section states and
  justifies the in-card placement choice.
- **Placeholder scan:** none.
- **Type consistency:** `MealTemplate.items: MealTemplateItem[]` (`{ foodId, quantityG }`) is used
  identically across `mealTemplates.ts`, `useMealTemplates.ts`, and `MealPlanView.tsx`'s
  `handleSaveTemplate`/`handleLoadTemplate`.
