// POST /api/auth-link -> { ok: true, userId: string }
//
// Called once by the client right after Supabase's onAuthStateChange fires
// SIGNED_IN (see src/hooks/useAuth.ts). Resolves the Google `sub` from the
// verified Supabase session, upserts app_users (unchanged shape) and
// auth_user_map. Deliberately does NOT call lib/auth.ts's requireUser() —
// that function requires an auth_user_map row to already exist, which is
// exactly what this endpoint creates on a user's very first login.
//
// Idempotent: safe to call on every sign-in, not just the first.

import { createServerClient } from "@supabase/ssr";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split("; ")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq)] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method.toUpperCase() !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "supabase not configured" }, 500);
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          const jar = parseCookies(request.headers.get("cookie"));
          return Object.entries(jar).map(([name, value]) => ({ name, value }));
        },
        setAll() {},
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || !data.user.email) {
      return json({ error: "invalid or expired session" }, 401);
    }

    const googleIdentity = data.user.identities?.find((i) => i.provider === "google");
    const googleSub =
      googleIdentity?.id ?? (googleIdentity?.identity_data?.sub as string | undefined);
    if (!googleSub) {
      return json({ error: "no linked Google identity" }, 400);
    }

    const email = data.user.email.toLowerCase();
    const serviceHeaders = {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      accept: "application/json",
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    };
    const base = restBase(supabaseUrl);

    try {
      const userRes = await fetch(`${base}/app_users`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ id: googleSub, email }),
      });
      if (!userRes.ok) {
        const text = await userRes.text();
        return json({ error: `failed to upsert app_users: ${text}` }, 502);
      }

      const mapRes = await fetch(`${base}/auth_user_map`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
      });
      if (!mapRes.ok) {
        const text = await mapRes.text();
        return json({ error: `failed to upsert auth_user_map: ${text}` }, 502);
      }
    } catch (e) {
      return json({ error: `link failed: ${e}` }, 500);
    }

    return json({ ok: true, userId: googleSub }, 200);
  },
};
