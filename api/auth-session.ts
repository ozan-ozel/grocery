// GET /api/auth-session -> { email } (200) or unauthorized (401).
// Lets the frontend ask "am I logged in" without needing to read the
// httpOnly cookie itself.

import { requireUser, authErrorResponse } from "../lib/auth.js";

export default {
  async fetch(request: Request): Promise<Response> {
  let user;
  try {
    user = await requireUser(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  return new Response(JSON.stringify({ email: user.email, userId: user.userId }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
  },
};
