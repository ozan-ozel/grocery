// POST /api/auth-logout -> { ok: true }, clears the Supabase session
// cookies via supabase.auth.signOut().

import { createServerClient } from "@supabase/ssr";
import { writableCookies } from "../lib/auth.js";

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
      cookies: writableCookies(request, responseHeaders),
    });

    await supabase.auth.signOut();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
  },
};
