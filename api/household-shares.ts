// GET    /api/household-shares?household_id=<id>                  -> string[]     (invited emails; owner only, 404 otherwise)
// POST   /api/household-shares  { household_id, email }            -> { ok: true } (invite; owner only)
// DELETE /api/household-shares?household_id=<id>&email=<email>     -> { ok: true } (revoke; owner only)
//
// Owner-only management of who else can access a household. See
// docs/superpowers/specs/2026-08-25-household-ownership-sharing-design.md.

import { requireUser, requireHouseholdAccess, authErrorResponse, type AuthUser } from "../lib/auth.js";

type ShareRow = { email: string };

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
  if (method === "POST") return handleInvite(request, user);
  if (method === "DELETE") return handleRevoke(request, user);
  return json({ error: "method not allowed" }, 405);
  },
};

async function handleGet(request: Request, user: AuthUser): Promise<Response> {
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

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
  };

  try {
    const target = `${restBase(supabaseUrl)}/household_shares?household_id=eq.${encodeURIComponent(
      householdId
    )}&select=email&order=created_at.asc`;
    const response = await fetch(target, { headers });
    if (!response.ok) return json({ error: `supabase ${response.status}` }, 502);
    const data = (await response.json()) as ShareRow[];
    return json(data.map((r) => r.email), 200);
  } catch (e) {
    return json({ error: `failed to list household shares: ${e}` }, 500);
  }
}

async function handleInvite(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  let body: { household_id?: unknown; email?: unknown };
  try {
    body = (await request.json()) as { household_id?: unknown; email?: unknown };
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const householdId = typeof body.household_id === "string" ? body.household_id.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!householdId || !email) {
    return json({ error: "expected { household_id, email }" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "resolution=merge-duplicates,return=minimal",
  };

  try {
    const response = await fetch(`${restBase(supabaseUrl)}/household_shares`, {
      method: "POST",
      headers,
      body: JSON.stringify({ household_id: householdId, email }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to invite: ${e}` }, 500);
  }
}

async function handleRevoke(request: Request, user: AuthUser): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "supabase not configured" }, 500);
  }

  const url = new URL(request.url);
  const householdId = url.searchParams.get("household_id")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!householdId || !email) {
    return json({ error: "expected ?household_id=<id>&email=<email>" }, 400);
  }

  try {
    await requireHouseholdAccess(householdId, user, { ownerOnly: true });
  } catch (err) {
    return authErrorResponse(err);
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    accept: "application/json",
    prefer: "return=minimal",
  };

  try {
    const response = await fetch(
      `${restBase(supabaseUrl)}/household_shares?household_id=eq.${encodeURIComponent(
        householdId
      )}&email=eq.${encodeURIComponent(email)}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) {
      const errorData = await response.text();
      return json({ error: `supabase ${response.status}`, details: errorData }, 502);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: `failed to revoke: ${e}` }, 500);
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
