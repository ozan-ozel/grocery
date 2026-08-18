// GET  /api/items?id=<id>          -> Item         (read by id)
// GET  /api/items?list_id=<id>     -> Item[]       (list all for list)
// POST /api/items                  -> Item         (create)
// PUT  /api/items                  -> Item         (update)
//
// Uses PostgREST anon key for reads and service_role key for writes.
// Anyone with the app URL can hit POST/PUT. For a small household PWA this is fine;
// if this stops being personal, put the app behind authentication.

import type { Context } from "@netlify/functions";

export type Item = {
  id: string;
  list_id: string;
  name: string;
  qty: string;
  checked: boolean;
  category: string | null;
  added_at: string;
  position: number | null;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS = "id,list_id,name,qty,checked,category,added_at,position";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request);
  if (method === "POST") return handleCreate(request);
  if (method === "PUT") return handleUpdate(request);
  return json({ error: "method not allowed" }, 405);
};

async function handleGet(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const listId = url.searchParams.get("list_id")?.trim();

  if (!id && !listId) {
    return json({ error: "expected ?id=<item_id> or ?list_id=<list_id>" }, 400);
  }

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

  try {
    const target = id
      ? `${restBase(supabaseUrl)}/items?select=${SELECT_COLS}&id=eq.${encodeURIComponent(id)}`
      : `${restBase(supabaseUrl)}/items?select=${SELECT_COLS}&list_id=eq.${encodeURIComponent(listId!)}&order=added_at.asc`;

    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as Item[];
    if (id) {
      if (data.length === 0) return json({ error: "item not found" }, 404);
      return json(data[0], 200);
    }
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch items: ${e}` }, 500);
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
    list_id?: unknown;
    name?: unknown;
    qty?: unknown;
    checked?: unknown;
    category?: unknown;
    added_at?: unknown;
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
  if (typeof body.list_id !== "string" || body.list_id.trim().length === 0) {
    return json({ error: "expected list_id: string (non-empty)" }, 400);
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return json({ error: "expected name: string (non-empty)" }, 400);
  }
  if (typeof body.added_at !== "string") {
    return json({ error: "expected added_at: string (ISO 8601 timestamp)" }, 400);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = {
    id: body.id.trim(),
    list_id: body.list_id.trim(),
    name: body.name.trim(),
    qty: typeof body.qty === "string" ? body.qty : "",
    checked: typeof body.checked === "boolean" ? body.checked : false,
    category:
      typeof body.category === "string" && body.category.trim().length > 0
        ? body.category.trim()
        : null,
    added_at: body.added_at,
    position: typeof body.position === "number" ? body.position : null,
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/items`, {
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
    const data = (await response.json()) as Item[];
    if (data.length === 0) return json({ error: "item creation failed" }, 500);
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create item: ${e}` }, 500);
  }
}

async function handleUpdate(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: {
    id?: unknown;
    name?: unknown;
    qty?: unknown;
    checked?: unknown;
    category?: unknown;
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim().length > 0) {
    payload.name = body.name.trim();
  }
  if (typeof body.qty === "string") {
    payload.qty = body.qty;
  }
  if (typeof body.checked === "boolean") {
    payload.checked = body.checked;
  }
  if (body.category !== undefined) {
    payload.category =
      typeof body.category === "string" && body.category.trim().length > 0
        ? body.category.trim()
        : null;
  }
  if (body.position !== undefined) {
    payload.position = typeof body.position === "number" ? body.position : null;
  }

  if (Object.keys(payload).length === 0) {
    return json(
      { error: "no fields to update (name, qty, checked, category, position)" },
      400
    );
  }

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/items?id=eq.${encodeURIComponent(body.id.trim())}`,
      { method: "PATCH", headers, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 404 ? 404 : 502
      );
    }
    const data = (await response.json()) as Item[];
    if (data.length === 0) return json({ error: "item not found" }, 404);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to update item: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
