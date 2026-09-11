// GET /api/auth-google-start?returnTo=<path> -> 302 to Google, using our own
// Google OAuth client directly (not Supabase's hosted /auth/v1/authorize
// relay). Google redirects back here (/api/auth-callback), we exchange the
// code with Google ourselves, then hand the resulting Google ID token to
// Supabase via signInWithIdToken() to mint the session. Both public paths
// are rewritten (see vercel.json) onto this one file — merged to stay under
// Vercel's Hobby-plan Serverless Function count limit, with each request
// distinguished by the `_action` query param the rewrite injects.
//
// Why not Supabase's hosted relay: going through
// `<SUPABASE_URL>/auth/v1/authorize` means Google's own consent screen
// displays *.supabase.co (the redirect_uri Supabase registered with Google)
// instead of this app's domain — cosmetic, but avoidable for free by doing
// the code exchange ourselves with our own GOOGLE_CLIENT_ID/SECRET (same
// values used by this app's original pre-Supabase-Auth JWT flow) and our
// own domain as the redirect_uri. Supabase Auth + RLS as the actual
// authorization layer is unchanged — only where the authorization-code
// exchange happens moves.
//
// This also drops Supabase's own PKCE code_verifier cookie (no longer
// applicable — we're not calling signInWithOAuth()) in favor of a plain
// `state` cookie as the CSRF guard on the authorize round-trip.

import { createServerClient } from "@supabase/ssr";
import {
  writableCookies,
  RETURN_TO_COOKIE,
  OAUTH_STATE_COOKIE,
  parseCookies,
  isSafeReturnTo,
  returnToCookieHeader,
  oauthStateCookieHeader,
} from "../lib/auth.js";

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

// Decodes (not verifies — Supabase's signInWithIdToken already verified the
// token's signature/issuer/audience server-side by the time this runs) the
// `sub` claim out of the Google ID token's payload, since that's the value
// this app has always used as app_users.id / auth_user_map.app_user_id.
function decodeGoogleSub(idToken: string): string | null {
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const claims = JSON.parse(json) as { sub?: string };
    return claims.sub ?? null;
  } catch {
    return null;
  }
}

async function handleStart(request: Request, url: URL): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response("google oauth not configured", { status: 500 });
  }

  const requestedReturnTo = url.searchParams.get("returnTo");
  const returnTo = isSafeReturnTo(requestedReturnTo) ? requestedReturnTo : "/";
  const callbackUrl = `${url.origin}/api/auth-callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("access_type", "online");
  authorizeUrl.searchParams.set("prompt", "select_account");

  const responseHeaders = new Headers();
  responseHeaders.append("set-cookie", returnToCookieHeader(request, returnTo, 600));
  responseHeaders.append("set-cookie", oauthStateCookieHeader(request, state, 600));
  responseHeaders.set("location", authorizeUrl.toString());

  return new Response(null, { status: 302, headers: responseHeaders });
}

function errorRedirect(request: Request, returnTo: string, responseHeaders: Headers): Response {
  const separator = returnTo.includes("?") ? "&" : "?";
  responseHeaders.set("location", `${returnTo}${separator}auth_error=1`);
  // Clear any half-set returnTo/state cookies regardless of outcome.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
  responseHeaders.append("set-cookie", oauthStateCookieHeader(request, "", 0));
  return new Response(null, { status: 302, headers: responseHeaders });
}

async function handleCallback(request: Request, url: URL): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const responseHeaders = new Headers();
  const cookies = parseCookies(request.headers.get("cookie"));
  const rawReturnTo = cookies[RETURN_TO_COOKIE] ?? null;
  const returnTo = isSafeReturnTo(rawReturnTo) ? rawReturnTo : "/";

  function fail(reason: string, extra?: unknown): Response {
    console.error(`[auth-callback] ${reason}`, extra);
    return errorRedirect(request, returnTo, responseHeaders);
  }

  if (!supabaseUrl || !anonKey || !serviceKey || !clientId || !clientSecret) {
    return fail("missing env", {
      supabaseUrl: !!supabaseUrl,
      anonKey: !!anonKey,
      serviceKey: !!serviceKey,
      clientId: !!clientId,
      clientSecret: !!clientSecret,
    });
  }

  const state = url.searchParams.get("state");
  const expectedState = cookies[OAUTH_STATE_COOKIE];
  if (!state || !expectedState || state !== expectedState) {
    return fail("state mismatch", { hasState: !!state, hasExpected: !!expectedState });
  }

  const code = url.searchParams.get("code");
  if (!code) {
    // Google redirects here with an error param (access_denied, etc.)
    // instead of code when the user declines consent.
    return fail("no code param", Object.fromEntries(url.searchParams));
  }

  let googleTokens: { id_token?: string; access_token?: string };
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/api/auth-callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      return fail("google token exchange failed", {
        status: tokenRes.status,
        body: await tokenRes.text(),
      });
    }
    googleTokens = (await tokenRes.json()) as typeof googleTokens;
  } catch (err) {
    return fail("google token exchange threw", err);
  }

  if (!googleTokens.id_token) {
    return fail("no id_token from google", googleTokens);
  }

  const googleSub = decodeGoogleSub(googleTokens.id_token);
  if (!googleSub) {
    return fail("could not decode google id_token sub");
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: writableCookies(request, responseHeaders),
  });

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: googleTokens.id_token,
    access_token: googleTokens.access_token,
  });
  if (error || !data.user || !data.user.email) {
    return fail("signInWithIdToken failed", {
      error: error?.message,
      status: error?.status,
      hasUser: !!data.user,
      hasEmail: !!data.user?.email,
    });
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
      return fail("app_users upsert failed", {
        status: userRes.status,
        body: await userRes.text(),
      });
    }

    const mapRes = await fetch(`${base}/auth_user_map`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ supabase_uid: data.user.id, app_user_id: googleSub }),
    });
    if (!mapRes.ok) {
      return fail("auth_user_map upsert failed", {
        status: mapRes.status,
        body: await mapRes.text(),
      });
    }
  } catch (err) {
    return fail("unexpected error", err);
  }

  // Success: clear the returnTo/state cookies, keep the session cookies
  // signInWithIdToken already wrote via writableCookies above.
  responseHeaders.append("set-cookie", returnToCookieHeader(request, "", 0));
  responseHeaders.append("set-cookie", oauthStateCookieHeader(request, "", 0));
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
