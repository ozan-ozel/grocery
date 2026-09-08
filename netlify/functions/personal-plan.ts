// GET /api/personal-plan  -> PersonalPlanRow | null  (read the caller's own profile)
// PUT /api/personal-plan  { ...profile }             -> PersonalPlanRow  (upsert)
//
// One profile per logged-in user — see src/hooks/useMealPersonalization.ts
// and supabase/08-personal-plan.sql/09-personal-plan-user-scoped.sql. Scoped
// entirely by the session's userId (never a client-supplied id), so no
// separate access check is needed beyond requireUser. Uses PostgREST anon
// key for reads and service_role key for writes.

import type { Context } from "@netlify/functions";
import { requireUser, authErrorResponse, type AuthUser } from "./_auth";

export type FoodExclusionRow = {
  foodId: string;
  reason: "allergy" | "intolerance" | "unclear" | "preference" | "unclassified";
  createdAt: string;
};

// Türkiye/EU 14 — see src/lib/allergenClasses.ts for the canonical
// definition. Duplicated here rather than imported: netlify/functions/*
// already keeps its own literal copies of shared validation constants
// (VALID_REASONS below is the existing precedent) since it's a separate
// build/deploy target from src/.
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
const VALID_REASONS = [
  "allergy",
  "intolerance",
  "unclear",
  "preference",
  "unclassified",
];
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

// Rejects a malformed/unrecognized entry outright (400) rather than
// silently dropping or coercing it — fail-closed, matching the resolver's
// own rule (Phase 9 §20 Milestone 1). Returns null on any validation
// failure so the caller can report which entry was bad.
function parseFoodExclusions(value: unknown): FoodExclusionRow[] | null {
  if (!Array.isArray(value)) return null;
  const parsed: FoodExclusionRow[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (typeof e.foodId !== "string" || !e.foodId.trim()) return null;
    if (typeof e.reason !== "string" || !VALID_REASONS.includes(e.reason))
      return null;
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
function parseAllergenClassExclusions(
  value: unknown,
): AllergenClassExclusionRow[] | null {
  if (!Array.isArray(value)) return null;
  const parsed = new Map<AllergenClassId, AllergenClassExclusionRow>();
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (
      typeof e.allergenClass !== "string" ||
      !VALID_ALLERGEN_CLASSES.includes(e.allergenClass)
    )
      return null;
    if (typeof e.reason !== "string" || !VALID_REASONS.includes(e.reason))
      return null;
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

export default async (
  request: Request,
  _context: Context,
): Promise<Response> => {
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
};

async function handleGet(user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

  try {
    const target = `${restBase(supabaseUrl)}/personal_plan?select=${SELECT_COLS}&user_id=eq.${encodeURIComponent(
      user.userId,
    )}`;
    const response = await fetch(target, { headers });
    if (!response.ok)
      return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as PersonalPlanRow[];
    return json(data[0] ?? null, 200);
  } catch (e) {
    return json({ error: `failed to fetch personal plan: ${e}` }, 500);
  }
}

async function handleWrite(
  request: Request,
  user: AuthUser,
): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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
  if (
    typeof body.equation_sex !== "string" ||
    !VALID_SEX.includes(body.equation_sex)
  ) {
    return json({ error: "expected equation_sex: 'female' | 'male'" }, 400);
  }
  if (
    typeof body.activity !== "string" ||
    !VALID_ACTIVITY.includes(body.activity)
  ) {
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
    return json(
      { error: "age_years, height_cm, weight_kg must be numbers" },
      400,
    );
  }
  const waistCm =
    body.waist_cm === undefined || body.waist_cm === null
      ? null
      : num(body.waist_cm);
  // food_exclusions is the sole source of truth going forward (Phase 9 §20
  // Milestone 1); excluded_food_ids is derived from it purely as a
  // read-only historical mirror, not written from client input anymore.
  const foodExclusions = parseFoodExclusions(body.food_exclusions ?? []);
  if (foodExclusions === null) {
    return json(
      {
        error:
          "invalid food_exclusions: expected [{foodId, reason, createdAt}]",
      },
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
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
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
    const response = await fetch(
      `${restBase(supabaseUrl)}/personal_plan?select=${SELECT_COLS}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502,
      );
    }
    const data = (await response.json()) as PersonalPlanRow[];
    if (data.length === 0)
      return json({ error: "personal plan save failed" }, 500);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to save personal plan: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
