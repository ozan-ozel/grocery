// GET /api/auth-google-callback?code=<code>&state=<csrf> -> 302 redirect
// back into the app with the session cookie set.
//
// Exchanges the authorization code for Google's tokens, verifies the
// id_token's signature via google-auth-library (handles Google's key
// rotation — do not hand-roll JWKS fetching), upserts the user into
// public.app_users, then signs our own session JWT.

import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { parseCookies } from "../lib/auth.js";

const OAUTH_STATE_COOKIE = "oauth_state";
const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days — no refresh flow in v1

function isProd(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function restBase(url: string): string {
  return `${url.replace(/\/$/, "")}/rest/v1`;
}

function clearedStateCookie(): string {
  return `${OAUTH_STATE_COOKIE}=; Max-Age=0; Path=/`;
}

function badRequest(message: string): Response {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append("set-cookie", clearedStateCookie());
  return new Response(JSON.stringify({ error: message }), { status: 400, headers });
}

export default {
  async fetch(request: Request): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clientId || !clientSecret || !jwtSecret || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "auth not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return badRequest("missing code or state");

  const stateCookieRaw = parseCookies(request.headers.get("cookie"))[OAUTH_STATE_COOKIE];
  if (!stateCookieRaw) return badRequest("missing oauth state cookie");

  let stashed: { csrf?: unknown; returnTo?: unknown };
  try {
    stashed = JSON.parse(decodeURIComponent(stateCookieRaw));
  } catch {
    return badRequest("invalid oauth state cookie");
  }
  if (stashed.csrf !== state) return badRequest("state mismatch");
  const returnTo = typeof stashed.returnTo === "string" ? stashed.returnTo : "/";

  const redirectUri = `${url.origin}/api/auth-google-callback`;

  // Exchange the authorization code for Google's tokens.
  let idToken: string;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return badRequest(`token exchange failed: ${text}`);
    }
    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) return badRequest("no id_token returned");
    idToken = tokenData.id_token;
  } catch (e) {
    return badRequest(`token exchange threw: ${e}`);
  }

  // Verify the id_token's signature and claims against Google's public keys.
  const oauthClient = new OAuth2Client(clientId);
  let sub: string;
  let email: string;
  try {
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) return badRequest("invalid id_token payload");
    if (payload.email_verified !== true) return badRequest("email not verified");
    sub = payload.sub;
    email = payload.email.toLowerCase();
  } catch (e) {
    return badRequest(`id_token verification failed: ${e}`);
  }

  // Upsert into public.app_users.
  try {
    const res = await fetch(`${restBase(supabaseUrl)}/app_users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ id: sub, email }),
    });
    if (!res.ok) {
      const text = await res.text();
      return badRequest(`failed to upsert app_users: ${text}`);
    }
  } catch (e) {
    return badRequest(`failed to upsert app_users: ${e}`);
  }

  const session = jwt.sign({ sub, email }, jwtSecret, { expiresIn: "30d" });
  const sessionCookie = [
    `${SESSION_COOKIE}=${session}`,
    "HttpOnly",
    isProd() ? "Secure" : "",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_S}`,
  ]
    .filter(Boolean)
    .join("; ");

  const headers = new Headers({ location: returnTo });
  headers.append("set-cookie", sessionCookie);
  headers.append("set-cookie", clearedStateCookie());
  return new Response(null, { status: 302, headers });
  },
};
