// GET    /api/households?id=<id>     -> Household       (read by id; access-gated)
// GET    /api/households              -> Household[]     (list; filtered to owned + invited)
// POST   /api/households              -> Household       (create; creator becomes owner)
// PATCH  /api/households               -> Household       (rename; any member)
// DELETE /api/households?id=<id>     -> { ok: true }     (delete; owner only)
//
// Uses PostgREST anon... no — service_role key throughout (households has no
// public read policy). Access is owner-or-invited, see
// docs/superpowers/specs/2026-08-25-household-ownership-sharing-design.md.

import type { Context } from "@netlify/functions";
import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "./_auth";

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

export default async (request: Request, _context: Context): Promise<Response> => {
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
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

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

  // No id: list only households this user can access (owns, or was invited to
  // by email) instead of gating a single lookup.
  try {
    const sharesTarget = `${restBase(supabaseUrl)}/household_shares?email=eq.${encodeURIComponent(
      user.email
    )}&select=household_id`;
    const sharesRes = await fetch(sharesTarget, { headers });
    if (!sharesRes.ok) return json({ error: `supabase ${sharesRes.status}` }, 502);
    const shareRows = (await sharesRes.json()) as { household_id: string }[];
    const invitedIds = shareRows.map((r) => r.household_id);
    const safeInvitedIds = invitedIds.filter((i) => /^[a-zA-Z0-9_-]{1,64}$/.test(i));

    const filter =
      safeInvitedIds.length > 0
        ? `or=${encodeURIComponent(
            `(owner_id.eq.${user.userId},id.in.(${safeInvitedIds.map((i) => `"${i}"`).join(",")}))`
          )}`
        : `owner_id=eq.${encodeURIComponent(user.userId)}`;

    const target = `${restBase(supabaseUrl)}/households?select=*&order=created_at.asc&${filter}`;
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

  if (typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(body.id.trim())) {
    return json({ error: "expected id: string (alphanumeric, underscore, hyphen, 1-64 chars)" }, 400);
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

  const id = body.id.trim();
  try {
    await requireHouseholdAccess(id, user);
  } catch (err) {
    return authErrorResponse(err);
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
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

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    prefer: "return=representation",
  };

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
    // cleanup needed here, unlike the old Blobs-backed store.
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to delete household: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
