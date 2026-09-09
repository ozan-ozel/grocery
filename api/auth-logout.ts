// POST /api/auth-logout -> { ok: true }, clears the Supabase session
// cookies via supabase.auth.signOut().

import { createServerClient } from "@supabase/ssr";

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

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "supabase not configured" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const responseHeaders = new Headers({ "content-type": "application/json" });
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          const jar = parseCookies(request.headers.get("cookie"));
          return Object.entries(jar).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax"];
            if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
            responseHeaders.append("set-cookie", parts.join("; "));
          }
        },
      },
    });

    await supabase.auth.signOut();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
  },
};
