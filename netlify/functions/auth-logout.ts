// POST /api/auth-logout -> { ok: true }, clears the session cookie.
//
// No token blacklist: a stolen JWT stays valid until its 30-day expiry
// even after logout. Accepted v1 tradeoff for a household app — same
// tolerance class as state.ts's last-write-wins sync.

import type { Context } from "@netlify/functions";

export default async (_request: Request, _context: Context): Promise<Response> => {
  const headers = new Headers({ "content-type": "application/json" });
  headers.append("set-cookie", "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
