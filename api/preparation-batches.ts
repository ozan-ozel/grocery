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
