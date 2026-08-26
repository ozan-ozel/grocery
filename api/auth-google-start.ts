// GET /api/auth-google-start?returnTo=<url> -> 302 redirect to Google's
// consent screen.
//
// returnTo must be same-origin (checked below) — otherwise this endpoint
// would be an open redirect. A random CSRF nonce plus the validated
// returnTo are stashed together in a short-lived httpOnly cookie so the
// callback (auth-google-callback.ts) can verify the round trip and land
// the user back where they started.

const OAUTH_STATE_COOKIE = "oauth_state";
const STATE_MAX_AGE_S = 600; // 10 minutes

function isProd(): boolean {
  return process.env.VERCEL_ENV === "production";
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

export default {
  async fetch(request: Request): Promise<Response> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response(JSON.stringify({ error: "google oauth not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const returnTo = sameOriginReturnTo(url.searchParams.get("returnTo"), url);
  const csrf = crypto.randomUUID();

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth-google-callback`);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", csrf);
  googleUrl.searchParams.set("access_type", "online");
  googleUrl.searchParams.set("prompt", "select_account");

  const stateCookieValue = encodeURIComponent(JSON.stringify({ csrf, returnTo }));
  const stateCookie = [
    `${OAUTH_STATE_COOKIE}=${stateCookieValue}`,
    "HttpOnly",
    isProd() ? "Secure" : "",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${STATE_MAX_AGE_S}`,
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(null, {
    status: 302,
    headers: { location: googleUrl.toString(), "set-cookie": stateCookie },
  });
  },
};
