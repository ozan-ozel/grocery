// GET    /api/hidden-households                       -> string[]     (household ids hidden by this user)
// POST   /api/hidden-households  { household_id }     -> { ok: true } (hide)
// DELETE /api/hidden-households?household_id=<id>     -> { ok: true } (unhide)
//
// Per-user preference. Requires auth (Stream A's requireUser).

import { requireUser, authErrorResponse, type AuthUser } from "./_auth";

type HiddenRow = { household_id: string };

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
  if (method === "GET") return handleGet(user);
  if (method === "POST") return handleHide(request, user);
  if (method === "DELETE") return handleUnhide(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

  try {
    const target = `${restBase(supabaseUrl)}/hidden_households?user_id=eq.${encodeURIComponent(user.userId)}&select=household_id`;
    const response = await fetch(target, { headers });
    if (!response.ok) {
      return json({ error: `supabase ${response.status}` }, 502);
    }
    const data = (await response.json()) as HiddenRow[];
    return json(data.map((r) => r.household_id), 200);
  } catch (e) {
    return json({ error: `failed to list hidden households: ${e}` }, 500);
  }
}

async function handleHide(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { household_id?: unknown };
  try {
    body = (await request.json()) as { household_id?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (typeof body.household_id !== "string" || body.household_id.trim().length === 0) {
    return json({ error: "expected household_id: string (non-empty)" }, 400);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    // Upsert semantics: if the row already exists, do nothing rather than 409.
    prefer: "resolution=merge-duplicates,return=minimal",
  };

  const payload = { user_id: user.userId, household_id: body.household_id.trim() };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/hidden_households`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to hide household: ${e}` }, 500);
  }
}

async function handleUnhide(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  if (!householdId) {
    return json({ error: "expected ?household_id=<id>" }, 400);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    prefer: "return=minimal",
  };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/hidden_households?user_id=eq.${encodeURIComponent(user.userId)}&household_id=eq.${encodeURIComponent(householdId)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json(
        { error: `supabase ${response.status}`, details: errorData },
        502
      );
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to unhide household: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
