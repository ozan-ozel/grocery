// GET /api/item-category-memory?household_id=<id>            -> Row[]   (read)
// PUT /api/item-category-memory  { household_id, name_lower, category } -> Row (upsert)
//
// The read proxies to PostgREST so the anon key stays server-side. The write
// uses the service_role key (also server-side) so RLS on
// public.item_category_memory can stay locked to reads only.
//
// Anyone with the app URL can hit PUT. That is a deliberate trade-off for a
// small household PWA; if this stops being personal, put the app behind
// authentication.

import type { Context } from "@netlify/functions";

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
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request);
  if (method === "PUT") return handleWrite(request);
  return json({ error: "method not allowed" }, 405);
};

async function handleGet(request: Request): Promise<Response> {
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

async function handleWrite(request: Request): Promise<Response> {
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
