// GET  /api/households?id=<id>     -> Household       (read by id)
// POST /api/households              -> Household       (create)
//
// Uses PostgREST anon key for reads and service_role key for writes.
// Anyone with the app URL can hit POST. For a small household PWA this is fine;
// if this stops being personal, put the app behind authentication.

import type { Context } from "@netlify/functions";

export type Household = {
  id: string;
  name: string;
  created_at: string;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const method = request.method.toUpperCase();
  if (method === "GET") return handleGet(request);
  if (method === "POST") return handleCreate(request);
  if (method === "PATCH") return handleRename(request);
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

  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    accept: "application/json",
  };

  try {
    // ?id=<id> returns a single household; no query returns all, oldest first.
    const target = id
      ? `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}&select=*`
      : `${restBase(supabaseUrl)}/households?select=*&order=created_at.asc`;

    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as Household[];

    if (id) {
      if (data.length === 0) return json({ error: "household not found" }, 404);
      return json(data[0], 200);
    }
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch household: ${e}` }, 500);
  }
}

async function handleCreate(request: Request): Promise<Response> {
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

  const payload = { id: body.id.trim(), name: body.name.trim() };

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

async function handleRename(request: Request): Promise<Response> {
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

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(body.id.trim())}`,
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

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
