// GET /api/auth-google-start?returnTo=<url> -> 302 redirect to Google's
// consent screen.
//
// returnTo must be same-origin (checked below) — otherwise this endpoint
// would be an open redirect. The validated returnTo is embedded in a
// JWT-signed `state` param instead of a cookie: on mobile, Chrome/Android
// can hand the accounts.google.com navigation off to a different browser
// context (e.g. after being opened from an in-app browser, or via Chrome's
// own account-picker integration), which drops any cookie set here. Google
// echoes `state` back verbatim regardless of which context completes the
// flow, so the callback (auth-google-callback.ts) can verify it without
// depending on cookie continuity.

import type { Context } from "@netlify/functions";
import jwt from "jsonwebtoken";

const STATE_MAX_AGE_S = 600; // 10 minutes

// A tunnel/reverse proxy in front of the dev server (ngrok, for testing on a
// phone) terminates TLS itself and forwards to us over plain HTTP, so
// `url.origin` reports "http://" even though the browser is on "https://".
// X-Forwarded-Proto is the standard header such a proxy sets to say what the
// original scheme actually was — trust it when present, since Google will
// reject a redirect_uri whose scheme doesn't match what's registered.
function originOf(request: Request, url: URL): string {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return proto ? `${proto}://${url.host}` : url.origin;
}

function sameOriginReturnTo(raw: string | null, requestUrl: URL): string {
  if (!raw) return "/";
  try {
    const target = new URL(raw, requestUrl);
    return target.origin === requestUrl.origin
      ? target.pathname + target.search + target.hash
      : "/";
  } catch {
    return "/";
  }
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const jwtSecret = process.env.JWT_SECRET;
  if (!clientId || !jwtSecret) {
    return new Response(JSON.stringify({ error: "google oauth not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const returnTo = sameOriginReturnTo(url.searchParams.get("returnTo"), url);
  const state = jwt.sign({ returnTo }, jwtSecret, { expiresIn: STATE_MAX_AGE_S });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", `${originOf(request, url)}/api/auth-google-callback`);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "online");
  googleUrl.searchParams.set("prompt", "select_account");

  return new Response(null, {
    status: 302,
    headers: { location: googleUrl.toString() },
  });
};
