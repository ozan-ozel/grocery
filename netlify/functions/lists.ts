// GET  /api/lists?id=<id>                -> List         (read by id)
// GET  /api/lists?household_id=<id>      -> List[]       (list all for household)
// POST /api/lists                        -> List         (create)
// PUT  /api/lists                        -> List         (update)
//
// Uses PostgREST anon key for reads and service_role key for writes.
// Anyone with the app URL can hit POST/PUT. For a small household PWA this is fine;
// if this stops being personal, put the app behind authentication.

import type { Context } from "@netlify/functions";

export type List = {
  id: string;
  household_id: string;
  title: string;
  created_at: string;
  closed_at: string | null;
  group_by_category: boolean;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const SELECT_COLS =
  "id,household_id,title,created_at,closed_at,group_by_category";

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
  const householdId = url.searchParams.get("household_id")?.trim();

  if (!id && !householdId) {
    return json(
      { error: "expected ?id=<list_id> or ?household_id=<household_id>" },
      400
    );
  }

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

  try {
    const target = id
      ? `${restBase(supabaseUrl)}/lists?select=${SELECT_COLS}&id=eq.${encodeURIComponent(id)}`
      : `${restBase(supabaseUrl)}/lists?select=${SELECT_COLS}&household_id=eq.${encodeURIComponent(householdId!)}&order=created_at.desc`;

    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as List[];
    if (id) {
      if (data.length === 0) return json({ error: "list not found" }, 404);
      return json(data[0], 200);
    }
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch lists: ${e}` }, 500);
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
    title?: unknown;
    created_at?: unknown;
    group_by_category?: unknown;
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
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return json({ error: "expected title: string (non-empty)" }, 400);
  }
  if (typeof body.created_at !== "string") {
    return json({ error: "expected created_at: string (ISO 8601 timestamp)" }, 400);
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
    household_id: body.household_id.trim(),
    title: body.title.trim(),
    created_at: body.created_at,
    group_by_category:
      typeof body.group_by_category === "boolean" ? body.group_by_category : true,
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/lists`, {
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
    const data = (await response.json()) as List[];
    if (data.length === 0) return json({ error: "list creation failed" }, 500);
    return json(data[0], 201);
  } catch (e) {
    return json({ error: `failed to create list: ${e}` }, 500);
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
    title?: unknown;
    closed_at?: unknown;
    group_by_category?: unknown;
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
  if (typeof body.title === "string" && body.title.trim().length > 0) {
    payload.title = body.title.trim();
  }
  if (body.closed_at !== undefined) {
    payload.closed_at = body.closed_at;
  }
  if (typeof body.group_by_category === "boolean") {
    payload.group_by_category = body.group_by_category;
  }

  if (Object.keys(payload).length === 0) {
    return json(
      { error: "no fields to update (title, closed_at, group_by_category)" },
      400
    );
  }

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/lists?id=eq.${encodeURIComponent(body.id.trim())}`,
      { method: "PATCH", headers, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        response.status === 404 ? 404 : 502
      );
    }
    const data = (await response.json()) as List[];
    if (data.length === 0) return json({ error: "list not found" }, 404);
    return json(data[0], 200);
  } catch (e) {
    return json({ error: `failed to update list: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
