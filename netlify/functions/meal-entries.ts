// GET    /api/meal-entries?householdId=<id>&from=<date>&to=<date>  -> MealEntryRow[]  (read range)
// POST   /api/meal-entries                                          -> MealEntryRow    (create)
// PATCH  /api/meal-entries?id=<id>                                  -> MealEntryRow    (update)
// DELETE /api/meal-entries?id=<id>                                  -> { ok: true }    (delete)
//
// Uses PostgREST anon key for reads and service_role key for writes.
// Anyone with the app URL can hit POST/PATCH/DELETE. For a small household PWA
// this is fine; if this stops being personal, put the app behind authentication.

import type { Context } from "@netlify/functions";
import { requireUser, authErrorResponse } from "./_auth";

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
