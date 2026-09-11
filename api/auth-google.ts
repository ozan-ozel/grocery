// GET /api/auth-google-start?returnTo=<path> -> 302 to Google (via
// Supabase Auth's hosted OAuth flow). Google redirects back to Supabase,
// which redirects to /api/auth-callback. Both public paths are rewritten
// (see vercel.json) onto this one file — merged to stay under Vercel's
// Hobby-plan Serverless Function count limit, with each request
// distinguished by the `_action` query param the rewrite injects. This
// kicks off the whole handshake server-side so the frontend never needs
// SUPABASE_URL/SUPABASE_ANON_KEY at all — see
// docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.
//
// Calling signInWithOAuth() on a server client (not the browser client) is
// the documented @supabase/ssr pattern for starting the flow: it still
// generates and writes the PKCE code_verifier cookie via writableCookies,
// just from a route handler instead of client-side JS. The callback half's
// exchangeCodeForSession() reads that same cookie back. The callback half
// also folds in what api/auth-link.ts used to do as a separate
// client-triggered POST: resolve the Google `sub` from the verified
// Supabase session, upsert app_users (unchanged shape) and auth_user_map.

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

async function handleStart(request: Request, url: URL): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return new Response("supabase not configured", { status: 500 });
  }

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
  // above by signInWithOAuth via writableCookies) — this one just carries
  // where to land the user after the callback half finishes, since
  // redirect_to must exactly match an allow-listed URL in Supabase's Auth
  // settings and can't carry it directly.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, returnTo, 600));
  responseHeaders.set("location", data.url);

  return new Response(null, { status: 302, headers: responseHeaders });
}

function errorRedirect(request: Request, returnTo: string, responseHeaders: Headers): Response {
  const separator = returnTo.includes("?") ? "&" : "?";
  responseHeaders.set("location", `${returnTo}${separator}auth_error=1`);
  // Clear any half-set returnTo cookie regardless of outcome.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
  return new Response(null, { status: 302, headers: responseHeaders });
}

async function handleCallback(request: Request, url: URL): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  const responseHeaders = new Headers();
  const rawReturnTo = parseCookies(request.headers.get("cookie"))[RETURN_TO_COOKIE] ?? null;
  const returnTo = isSafeReturnTo(rawReturnTo) ? rawReturnTo : "/";

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("[auth-callback] missing env", {
      supabaseUrl: !!supabaseUrl,
      anonKey: !!anonKey,
      serviceKey: !!serviceKey,
    });
    return errorRedirect(request, returnTo, responseHeaders);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    // Google/Supabase redirects here with an error param (access_denied,
    // etc.) instead of code when the user declines consent.
    console.error("[auth-callback] no code param", Object.fromEntries(url.searchParams));
    return errorRedirect(request, returnTo, responseHeaders);
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: writableCookies(request, responseHeaders),
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user || !data.user.email) {
    console.error("[auth-callback] exchangeCodeForSession failed", {
      error: error?.message,
      status: error?.status,
      hasUser: !!data.user,
      hasEmail: !!data.user?.email,
    });
    return errorRedirect(request, returnTo, responseHeaders);
  }

  const googleIdentity = data.user.identities?.find((i) => i.provider === "google");
  const googleSub =
    googleIdentity?.id ?? (googleIdentity?.identity_data?.sub as string | undefined);
  if (!googleSub) {
    console.error("[auth-callback] no googleSub", { identities: data.user.identities });
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
    if (!userRes.ok) {
      console.error("[auth-callback] app_users upsert failed", {
        status: userRes.status,
        body: await userRes.text(),
      });
      return errorRedirect(request, returnTo, responseHeaders);
    }

    const mapRes = await fetch(`${base}/auth_user_map`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
    });
    if (!mapRes.ok) {
      console.error("[auth-callback] auth_user_map upsert failed", {
        status: mapRes.status,
        body: await mapRes.text(),
      });
      return errorRedirect(request, returnTo, responseHeaders);
    }
  } catch (err) {
    console.error("[auth-callback] unexpected error", err);
    return errorRedirect(request, returnTo, responseHeaders);
  }

  // Success: clear the returnTo cookie, keep the session cookies
  // exchangeCodeForSession already wrote via writableCookies above.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
  responseHeaders.set("location", returnTo);
  return new Response(null, { status: 302, headers: responseHeaders });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.searchParams.get("_action");
    if (action === "callback") return handleCallback(request, url);
    if (action === "start") return handleStart(request, url);
    return new Response("not found", { status: 404 });
  },
};
