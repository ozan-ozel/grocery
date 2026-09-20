// GET /api/personal-plan  -> PersonalPlanRow | null  (read the caller's own profile)
// PUT /api/personal-plan  { ...profile }             -> PersonalPlanRow  (upsert)
//
// Also serves the caller's saved meals ("Yemeklerim") as a second resource,
// selected by `?_resource=saved-meals` — vercel.json rewrites /api/saved-meals
// to it. Merged into this function (rather than a new file) because the project
// sits at the 12-function Hobby limit, and both are per-user data guarded the
// same way (requireUser + RLS on user_id). See the handlers at the bottom:
//   GET    /api/saved-meals            -> SavedMealRow[]   (newest first)
//   POST   /api/saved-meals            -> SavedMealRow     (create; client id)
//   PATCH  /api/saved-meals?id=<id>    -> SavedMealRow     (replace name/items/steps)
//   DELETE /api/saved-meals?id=<id>    -> { ok: true }
//
// One profile per logged-in user, scoped entirely by the session's userId
// (never a client-supplied id) — no separate access check needed beyond
// requireUser. Every request authenticates to PostgREST as the caller's own
// Supabase session — RLS's personal_plan_all policy (user_id =
// current_app_user_id()) backs this.

import { requireUser, userRestHeaders, authErrorResponse, type AuthUser } from "../lib/auth.js";

export type FoodExclusionRow = {
  foodId: string;
  reason: "allergy" | "intolerance" | "unclear" | "preference" | "unclassified";
  createdAt: string;
};

// Türkiye/EU 14 — see src/lib/allergenClasses.ts for the canonical
// definition. Duplicated here rather than imported, matching this file's
// existing precedent of keeping its own literal copies of shared validation
// constants (VALID_REASONS below).
export type AllergenClassId =
  | "gluten_cereals"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "peanuts"
  | "soybeans"
  | "milk"
  | "tree_nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs";

export type AllergenClassExclusionRow = {
  allergenClass: AllergenClassId;
  reason: "allergy" | "intolerance" | "unclear" | "preference" | "unclassified";
  createdAt: string;
};

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
  excluded_food_ids: string[] | null;
  food_exclusions: FoodExclusionRow[] | null;
  allergen_class_exclusions: AllergenClassExclusionRow[] | null;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS =
  "user_id,name,equation_sex,age_years,height_cm,weight_kg,activity,goal,waist_cm,excluded_food_ids,food_exclusions,allergen_class_exclusions";

const VALID_SEX = ["female", "male"];
const VALID_ACTIVITY = ["sedentary", "light", "moderate", "high", "very_high"];
const VALID_GOAL = ["maintain", "loss", "gain"];
const VALID_REASONS = ["allergy", "intolerance", "unclear", "preference", "unclassified"];
const VALID_ALLERGEN_CLASSES = [
  "gluten_cereals",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soybeans",
  "milk",
  "tree_nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
];

// Rejects a malformed/unrecognized entry outright (400) rather than silently
// dropping or coercing it — fail-closed, matching the resolver's own rule
// (Phase 9 §20 Milestone 1). Returns null on any validation failure so the
// caller can report which entry was bad.
function parseFoodExclusions(value: unknown): FoodExclusionRow[] | null {
  if (!Array.isArray(value)) return null;
  const parsed: FoodExclusionRow[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (typeof e.foodId !== "string" || !e.foodId.trim()) return null;
    if (typeof e.reason !== "string" || !VALID_REASONS.includes(e.reason)) return null;
    if (typeof e.createdAt !== "string" || !e.createdAt) return null;
    parsed.push({
      foodId: e.foodId,
      reason: e.reason as FoodExclusionRow["reason"],
      createdAt: e.createdAt,
    });
  }
  return parsed;
}

// Same fail-closed rule as parseFoodExclusions — an unrecognized
// allergenClass is rejected outright (400), never silently dropped or
// coerced, since a class string outside the fixed 14 could otherwise be
// stored and then silently never match anything at enforcement time.
function parseAllergenClassExclusions(value: unknown): AllergenClassExclusionRow[] | null {
  if (!Array.isArray(value)) return null;
  const parsed = new Map<AllergenClassId, AllergenClassExclusionRow>();
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (typeof e.allergenClass !== "string" || !VALID_ALLERGEN_CLASSES.includes(e.allergenClass))
      return null;
    if (typeof e.reason !== "string" || !VALID_REASONS.includes(e.reason)) return null;
    if (typeof e.createdAt !== "string" || !e.createdAt) return null;
    const parsedEntry: AllergenClassExclusionRow = {
      allergenClass: e.allergenClass as AllergenClassId,
      reason: e.reason as AllergenClassExclusionRow["reason"],
      createdAt: e.createdAt,
    };
    // Keep the most recent submitted choice for a class. Other classes are
    // preserved, so normalization cannot create duplicate React keys or
    // discard independent allergen exclusions.
    parsed.set(parsedEntry.allergenClass, parsedEntry);
  }
  return [...parsed.values()];
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
    const url = new URL(request.url);
    if (url.searchParams.get("_resource") === "saved-meals") {
      return handleSavedMeals(request, user, url);
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
    excluded_food_ids?: unknown;
    food_exclusions?: unknown;
    allergen_class_exclusions?: unknown;
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
  // food_exclusions is the sole source of truth going forward (Phase 9 §20
  // Milestone 1); excluded_food_ids is derived from it purely as a
  // read-only historical mirror, not written from client input anymore.
  const foodExclusions = parseFoodExclusions(body.food_exclusions ?? []);
  if (foodExclusions === null) {
    return json(
      { error: "invalid food_exclusions: expected [{foodId, reason, createdAt}]" },
      400,
    );
  }
  const excludedFoodIds = foodExclusions.map(e => e.foodId);
  const allergenClassExclusions = parseAllergenClassExclusions(
    body.allergen_class_exclusions ?? [],
  );
  if (allergenClassExclusions === null) {
    return json(
      {
        error:
          "invalid allergen_class_exclusions: expected [{allergenClass, reason, createdAt}]",
      },
      400,
    );
  }

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
    excluded_food_ids: excludedFoodIds,
    food_exclusions: foodExclusions,
    allergen_class_exclusions: allergenClassExclusions,
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

// -------- Saved meals ("Yemeklerim") -------------------------------------------

type SavedMealItem = { food_id: string; quantity_g: number };

export type SavedMealRow = {
  id: string;
  user_id: string;
  name: string;
  items: SavedMealItem[];
  steps: string[] | null;
  created_at: string;
};

const SAVED_MEAL_COLS = "id,user_id,name,items,steps,created_at";
// Keep in sync with SAVED_MEAL_LIMITS in src/lib/savedMeals.ts (this file does
// not import from src/, a separate build target).
const SAVED_MEAL_LIMITS = {
  nameMax: 60,
  itemsMax: 40,
  stepsMax: 30,
  stepMax: 500,
  quantityMax: 20000,
  perUserMax: 100,
};

// Validates a create/replace body. Returns the cleaned fields, or a message for
// a 400. Rejects (never silently truncates) oversized input.
function parseSavedMeal(
  body: Record<string, unknown>
): { name: string; items: SavedMealItem[]; steps: string[] } | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > SAVED_MEAL_LIMITS.nameMax) {
    return `expected name: string (1-${SAVED_MEAL_LIMITS.nameMax} chars)`;
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > SAVED_MEAL_LIMITS.itemsMax
  ) {
    return `expected items: 1-${SAVED_MEAL_LIMITS.itemsMax} entries of { food_id, quantity_g }`;
  }
  const items: SavedMealItem[] = [];
  for (const raw of body.items) {
    if (typeof raw !== "object" || raw === null) return "invalid items entry";
    const entry = raw as Record<string, unknown>;
    if (typeof entry.food_id !== "string" || !entry.food_id.trim()) {
      return "items[].food_id must be a non-empty string";
    }
    if (
      typeof entry.quantity_g !== "number" ||
      !Number.isFinite(entry.quantity_g) ||
      entry.quantity_g <= 0 ||
      entry.quantity_g > SAVED_MEAL_LIMITS.quantityMax
    ) {
      return `items[].quantity_g must be a number in (0, ${SAVED_MEAL_LIMITS.quantityMax}]`;
    }
    items.push({ food_id: entry.food_id.trim(), quantity_g: entry.quantity_g });
  }

  const rawSteps = body.steps === undefined || body.steps === null ? [] : body.steps;
  if (!Array.isArray(rawSteps) || rawSteps.length > SAVED_MEAL_LIMITS.stepsMax) {
    return `expected steps: array of at most ${SAVED_MEAL_LIMITS.stepsMax} strings`;
  }
  const steps: string[] = [];
  for (const step of rawSteps) {
    if (typeof step !== "string") return "steps must be strings";
    const trimmed = step.trim();
    if (trimmed.length > SAVED_MEAL_LIMITS.stepMax) {
      return `each step must be at most ${SAVED_MEAL_LIMITS.stepMax} chars`;
    }
    if (trimmed) steps.push(trimmed);
  }

  return { name, items, steps };
}

async function handleSavedMeals(
  request: Request,
  user: AuthUser,
  url: URL
): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return json({ error: "supabase not configured" }, 500);

  const base = `${restBase(supabaseUrl)}/saved_meals`;
  const owner = `user_id=eq.${encodeURIComponent(user.userId)}`;
  const headers = userRestHeaders(user);
  const writeHeaders = {
    ...headers,
    "content-type": "application/json",
    prefer: "return=representation",
  };
  const method = request.method.toUpperCase();

  try {
    if (method === "GET") {
      const res = await fetch(
        `${base}?select=${SAVED_MEAL_COLS}&${owner}&order=created_at.desc`,
        { headers }
      );
      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
      return json((await res.json()) as SavedMealRow[], 200);
    }

    if (method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return json({ error: "invalid json" }, 400);
      }
      const id = typeof body.id === "string" ? body.id.trim() : "";
      if (!id || id.length > 64) return json({ error: "expected id: string (1-64 chars)" }, 400);
      const parsed = parseSavedMeal(body);
      if (typeof parsed === "string") return json({ error: parsed }, 400);

      // Per-user cap, so a runaway client can't grow one user's list forever.
      const countRes = await fetch(
        `${base}?select=id&${owner}&limit=${SAVED_MEAL_LIMITS.perUserMax + 1}`,
        { headers }
      );
      if (!countRes.ok) return json({ error: `supabase ${countRes.status}` }, 502);
      if (((await countRes.json()) as unknown[]).length >= SAVED_MEAL_LIMITS.perUserMax) {
        return json({ error: "saved meal limit reached" }, 409);
      }

      const res = await fetch(`${base}?select=${SAVED_MEAL_COLS}`, {
        method: "POST",
        headers: writeHeaders,
        body: JSON.stringify({ id, user_id: user.userId, ...parsed }),
      });
      if (!res.ok) {
        return json({ error: `supabase ${res.status}` }, res.status === 409 ? 409 : 502);
      }
      const rows = (await res.json()) as SavedMealRow[];
      if (rows.length === 0) return json({ error: "saved meal creation failed" }, 500);
      return json(rows[0], 201);
    }

    const id = url.searchParams.get("id")?.trim();
    if (!id) return json({ error: "expected ?id=<id>" }, 400);

    if (method === "PATCH") {
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return json({ error: "invalid json" }, 400);
      }
      const parsed = parseSavedMeal(body);
      if (typeof parsed === "string") return json({ error: parsed }, 400);
      const res = await fetch(
        `${base}?id=eq.${encodeURIComponent(id)}&${owner}&select=${SAVED_MEAL_COLS}`,
        {
          method: "PATCH",
          headers: writeHeaders,
          body: JSON.stringify({ ...parsed, updated_at: new Date().toISOString() }),
        }
      );
      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
      const rows = (await res.json()) as SavedMealRow[];
      if (rows.length === 0) return json({ error: "not found" }, 404);
      return json(rows[0], 200);
    }

    if (method === "DELETE") {
      const res = await fetch(
        `${base}?id=eq.${encodeURIComponent(id)}&${owner}&select=id`,
        { method: "DELETE", headers: writeHeaders }
      );
      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
      if (((await res.json()) as unknown[]).length === 0) {
        return json({ error: "not found" }, 404);
      }
      return json({ ok: true }, 200);
    }

    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: `saved meals request failed: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
