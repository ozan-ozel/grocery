// DELETE /api/auth-delete-account -> { ok: true }
//
// Permanently deletes the caller's account: every household they own (which
// cascades lists/items/item_category_memory per existing FKs), their
// invite-shares into other people's households, then the app_users row
// itself (which cascades hidden_households and personal_plan data via its
// own FKs — see 04-hidden-households.sql, 09-personal-plan-user-scoped.sql).
// Clears the session cookie last so the frontend lands signed out.

import type { Context } from "@netlify/functions";
import { requireUser, authErrorResponse, type AuthUser } from "./_auth";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  if (request.method.toUpperCase() !== "DELETE") {
    return json({ error: "method not allowed" }, 405);
  }

  let user: AuthUser;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }

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
    const ownedHouseholds = await fetch(
      `${restBase(supabaseUrl)}/households?owner_id=eq.${encodeURIComponent(user.userId)}`,
      { method: "DELETE", headers }
    );
    if (!ownedHouseholds.ok) {
      const details = await ownedHouseholds.text();
      return json({ error: `supabase ${ownedHouseholds.status}`, details }, 502);
    }

    const shares = await fetch(
      `${restBase(supabaseUrl)}/household_shares?email=eq.${encodeURIComponent(user.email)}`,
      { method: "DELETE", headers }
    );
    if (!shares.ok) {
      const details = await shares.text();
      return json({ error: `supabase ${shares.status}`, details }, 502);
    }

    const account = await fetch(
      `${restBase(supabaseUrl)}/app_users?id=eq.${encodeURIComponent(user.userId)}`,
      { method: "DELETE", headers }
    );
    if (!account.ok) {
      const details = await account.text();
      return json({ error: `supabase ${account.status}`, details }, 502);
    }
  } catch (e) {
    return json({ error: `failed to delete account: ${e}` }, 500);
  }

  const responseHeaders = new Headers(JSON_HEADERS);
  responseHeaders.append("set-cookie", "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
