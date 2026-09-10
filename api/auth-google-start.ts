// GET /api/auth-google-start?returnTo=<path> -> 302 to Google (via
// Supabase Auth's hosted OAuth flow). Google redirects back to Supabase,
// which redirects to api/auth-callback.ts. This kicks off the whole
// handshake server-side so the frontend never needs
// SUPABASE_URL/SUPABASE_ANON_KEY at all — see
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.
//
// Calling signInWithOAuth() on a server client (not the browser client) is
// the documented @supabase/ssr pattern for this: it still generates and
// writes the PKCE code_verifier cookie via writableCookies below, just
// from a route handler instead of client-side JS. api/auth-callback.ts's
// exchangeCodeForSession() reads that same cookie back.

import { createServerClient } from "@supabase/ssr";
import { writableCookies, isSafeReturnTo, returnToCookieHeader } from "../lib/auth.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return new Response("supabase not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const requestedReturnTo = url.searchParams.get("returnTo");
    const returnTo = isSafeReturnTo(requestedReturnTo) ? requestedReturnTo : "/";
    const callbackUrl = `${url.origin}/api/auth-callback`;

    const responseHeaders = new Headers();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: writableCookies(request, responseHeaders),
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (error || !data.url) {
      return new Response(`failed to start sign-in: ${error?.message ?? "no url"}`, {
        status: 502,
        headers: responseHeaders,
      });
    }

    // Stashed separately from Supabase's own PKCE cookie (already appended
    // above by signInWithOAuth via writableCookies) — this one just
    // carries where to land the user after api/auth-callback.ts finishes,
    // since redirect_to must exactly match an allow-listed URL in
    // Supabase's Auth settings and can't carry it directly.
    responseHeaders.append("set-cookie", returnToCookieHeader(request, returnTo, 600));
    responseHeaders.set("location", data.url);

    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
