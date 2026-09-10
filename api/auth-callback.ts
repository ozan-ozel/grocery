// GET /api/auth-callback -> 302 to the original returnTo, session cookie
// set. Google redirects here via Supabase after the user approves (or
// denies) consent — see api/auth-google-start.ts for how the flow starts.
// Folds in what api/auth-link.ts used to do as a separate client-triggered
// POST: resolve the Google `sub` from the verified Supabase session,
// upsert app_users (unchanged shape) and auth_user_map. See
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.

import { createServerClient } from "@supabase/ssr";
import {
  writableCookies,
  RETURN_TO_COOKIE,
  parseCookies,
  isSafeReturnTo,
  returnToCookieHeader,
} from "../lib/auth.js";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function errorRedirect(request: Request, returnTo: string, responseHeaders: Headers): Response {
  const separator = returnTo.includes("?") ? "&" : "?";
  responseHeaders.set("location", `${returnTo}${separator}auth_error=1`);
  // Clear any half-set returnTo cookie regardless of outcome.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
  return new Response(null, { status: 302, headers: responseHeaders });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const responseHeaders = new Headers();
    const rawReturnTo = parseCookies(request.headers.get("cookie"))[RETURN_TO_COOKIE] ?? null;
    const returnTo = isSafeReturnTo(rawReturnTo) ? rawReturnTo : "/";

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return errorRedirect(request, returnTo, responseHeaders);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      // Google/Supabase redirects here with an error param (access_denied,
      // etc.) instead of code when the user declines consent.
      return errorRedirect(request, returnTo, responseHeaders);
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: writableCookies(request, responseHeaders),
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user || !data.user.email) {
      return errorRedirect(request, returnTo, responseHeaders);
    }

    const googleIdentity = data.user.identities?.find((i) => i.provider === "google");
    const googleSub =
      googleIdentity?.id ?? (googleIdentity?.identity_data?.sub as string | undefined);
    if (!googleSub) {
      return errorRedirect(request, returnTo, responseHeaders);
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
      if (!userRes.ok) return errorRedirect(request, returnTo, responseHeaders);

      const mapRes = await fetch(`${base}/auth_user_map`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
      });
      if (!mapRes.ok) return errorRedirect(request, returnTo, responseHeaders);
    } catch {
      return errorRedirect(request, returnTo, responseHeaders);
    }

    // Success: clear the returnTo cookie, keep the session cookies
    // exchangeCodeForSession already wrote via writableCookies above.
    responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
    responseHeaders.set("location", returnTo);
    return new Response(null, { status: 302, headers: responseHeaders });
  },
};
