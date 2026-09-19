// DELETE /api/auth-delete-account  { reason?, otherText? }  -> { ok: true }
//
// Permanently deletes the caller's account. Ported from the retired Netlify
// function of the same name — it was never carried over to Vercel, so
// "Hesabı Sil" had been silently doing nothing (a 404 the client ignored) since
// that migration. Two additions over the original: it also deletes the
// Supabase Auth user (the old one predates Supabase Auth, so there was no
// auth.users row to remove), and it records the optional deletion reason.
//
// What goes, in order (every step uses the service key, and each depends only
// on FKs verified across supabase/*.sql):
//   1. every household the caller OWNS — cascades lists, items,
//      item_category_memory, meal_entries, sync_state, preparation_batches,
//      household_shares and hidden_households (all `on delete cascade` to
//      households). People the household was shared with lose it too.
//   2. the caller's own shares into other people's households (by email).
//   3. the app_users row — cascades personal_plan, hidden_households and
//      auth_user_map.
//   4. the Supabase Auth user (Admin API), so the Google identity is gone and
//      a later sign-in starts a brand-new account.
// Then the sb-* session cookies are expired so the browser lands signed out.
//
// Households the caller merely has access to (owned by someone else) are left
// alone — only their invite row is removed in step 2.
//
// The deletion reason is written *last* and best-effort: a missing table or a
// failed insert must never block, or be reported as a failure of, the
// deletion itself. It carries no user identifier (see
// supabase/27-account-deletion-feedback.sql).

import { requireUser, authErrorResponse, parseCookies, requestOrigin } from "../lib/auth.js";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

// Mirrors DELETE_REASONS in src/components/DeleteAccountFlow.tsx and the CHECK
// constraint in supabase/27-account-deletion-feedback.sql.
const REASON_CODES = new Set([
  "not_using",
  "missing_features",
  "hard_to_use",
  "switched_app",
  "privacy",
  "bugs",
  "other",
  "prefer_not_to_say",
]);
const OTHER_TEXT_MAX = 300;

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function json(data: unknown, status: number, headers?: Headers) {
  const h = headers ?? new Headers();
  for (const [k, v] of Object.entries(JSON_HEADERS)) h.set(k, v);
  return new Response(JSON.stringify(data), { status, headers: h });
}

class StepError extends Error {}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method.toUpperCase() !== "DELETE") {
      return json({ error: "method not allowed" }, 405);
    }

    let user;
    try {
      user = await requireUser(request);
    } catch (err) {
      return authErrorResponse(err);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "supabase not configured" }, 500);
    }

    // Optional and lenient: a missing/garbled body just means no feedback.
    let feedback: { reason: string; otherText: string | null } | null = null;
    try {
      const body = (await request.json()) as { reason?: unknown; otherText?: unknown };
      if (typeof body.reason === "string" && REASON_CODES.has(body.reason)) {
        const text =
          body.reason === "other" && typeof body.otherText === "string"
            ? body.otherText.trim().slice(0, OTHER_TEXT_MAX)
            : "";
        feedback = { reason: body.reason, otherText: text || null };
      }
    } catch {
      // no body
    }

    const headers = {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      accept: "application/json",
      prefer: "return=minimal",
    };
    const rest = restBase(supabaseUrl);

    // Deleting a row that's already gone is fine (an interrupted earlier
    // attempt can be retried) — only a real error status aborts.
    async function del(what: string, url: string, init?: RequestInit) {
      const res = await fetch(url, { method: "DELETE", headers, ...init });
      if (!res.ok && res.status !== 404) {
        console.error(`[delete-account] ${what} failed: ${res.status} ${await res.text()}`);
        throw new StepError(what);
      }
    }

    try {
      // Read before step 3 — the map row cascades away with app_users.
      const mapRes = await fetch(
        `${rest}/auth_user_map?app_user_id=eq.${encodeURIComponent(user.userId)}&select=supabase_uid`,
        { headers: { ...headers, prefer: "" } }
      );
      if (!mapRes.ok) throw new StepError("identity lookup");
      const mapRows = (await mapRes.json()) as { supabase_uid: string }[];
      const supabaseUid = mapRows[0]?.supabase_uid;

      await del(
        "owned households",
        `${rest}/households?owner_id=eq.${encodeURIComponent(user.userId)}`
      );
      await del(
        "household shares",
        `${rest}/household_shares?email=eq.${encodeURIComponent(user.email)}`
      );
      await del("app user", `${rest}/app_users?id=eq.${encodeURIComponent(user.userId)}`);
      if (supabaseUid) {
        await del(
          "auth user",
          `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users/${encodeURIComponent(supabaseUid)}`
        );
      }
    } catch (err) {
      const stage = err instanceof StepError ? err.message : "unexpected error";
      console.error("[delete-account] aborted:", err);
      return json({ error: `account deletion failed (${stage})` }, 502);
    }

    if (feedback) {
      try {
        const res = await fetch(`${rest}/account_deletion_feedback`, {
          method: "POST",
          headers: { ...headers, "content-type": "application/json" },
          body: JSON.stringify({ reason: feedback.reason, other_text: feedback.otherText }),
        });
        if (!res.ok) {
          console.warn(`[delete-account] feedback not recorded: ${res.status} ${await res.text()}`);
        }
      } catch (err) {
        console.warn("[delete-account] feedback not recorded:", err);
      }
    }

    // Expire every Supabase session cookie the browser sent (they can be
    // chunked: sb-<ref>-auth-token.0, .1, ...). The auth user is already gone,
    // so these tokens are dead either way — this just leaves the browser clean.
    const responseHeaders = new Headers();
    const secure = requestOrigin(request).startsWith("https://");
    for (const name of Object.keys(parseCookies(request.headers.get("cookie")))) {
      if (!name.startsWith("sb-")) continue;
      const parts = [`${name}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
      if (secure) parts.push("Secure");
      responseHeaders.append("set-cookie", parts.join("; "));
    }
    return json({ ok: true }, 200, responseHeaders);
  },
};
