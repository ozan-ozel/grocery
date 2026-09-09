// GET    /api/households?id=<id>     -> Household       (read by id; access-gated)
// GET    /api/households              -> Household[]     (list; RLS-filtered to owned + invited)
// POST   /api/households              -> Household       (create; creator becomes owner)
// PATCH  /api/households               -> Household       (rename; any member)
// DELETE /api/households?id=<id>     -> { ok: true }     (delete; owner only)
//
// Every request authenticates to PostgREST as the caller's own Supabase
// session (userRestHeaders) — RLS (supabase/19-auth-user-map-and-rls.sql)
// is the real filter for the list/read paths; requireHouseholdAccess stays
// as the first-layer check for write paths, matching every other function.

import {
  requireUser,
  requireHouseholdAccess,
  userRestHeaders,
  authErrorResponse,
  type AuthUser,
} from "../lib/auth.js";

export type Household = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string | null;
};

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

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
  if (method === "PATCH") return handleRename(request, user);
  if (method === "DELETE") return handleDelete(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const headers = userRestHeaders(user);

  if (id) {
    try {
      await requireHouseholdAccess(id, user);
    } catch (err) {
      return authErrorResponse(err);
    }
    try {
      const target = `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}&select=*`;
      const response = await fetch(target, { headers });
      if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
      const data = (await response.json()) as Household[];
      if (data.length === 0) return json({ error: "household not found" }, 404);
      return json(data[0], 200);
    } catch (e) {
      return json({ error: `failed to fetch household: ${e}` }, 500);
    }
  }

  // No id: list every household this user can access. RLS's
  // households_select policy already restricts this to owned + invited —
  // no manual owner/shares filter needed on this side anymore.
  try {
    const target = `${restBase(supabaseUrl)}/households?select=*&order=created_at.asc`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as Household[];
    return json(data, 200);
  } catch (e) {
    return json({ error: `failed to fetch households: ${e}` }, 500);
  }
}

async function handleCreate(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { id?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; name?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(body.id.trim())) {
    return json({ error: "expected id: string (alphanumeric, underscore, hyphen, 1-64 chars)" }, 400);
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return json({ error: "expected name: string (non-empty)" }, 400);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  const payload = { id: body.id.trim(), name: body.name.trim(), owner_id: user.userId };

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

async function handleRename(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
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

  const id = body.id.trim();
  try {
    await requireHouseholdAccess(id, user);
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    ...userRestHeaders(user),
    "content-type": "application/json",
    prefer: "return=representation",
  };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}`,
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

async function handleDelete(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return json({ error: "expected ?id=<id>" }, 400);
  }

  try {
    await requireHouseholdAccess(id, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = { ...userRestHeaders(user), prefer: "return=representation" };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/households?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    const data = (await response.json()) as unknown[];
    if (data.length === 0) return json({ error: "household not found" }, 404);

    // sync_state cascades automatically (FK ON DELETE CASCADE) — no manual
    // cleanup needed here.
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to delete household: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
