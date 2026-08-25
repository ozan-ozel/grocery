// Placeholder for Stream A's real auth module.
// The contract is: requireUser(request) resolves to an AuthUser on success,
// or throws AuthError with an HTTP status. Callers should catch AuthError
// and translate it to a Response via authErrorResponse().
//
// Until Stream A lands the Google flow, this stub throws 401 unconditionally
// so the gate holds in manual testing: any /api/* call without Stream A's
// cookie-check in place returns 401. Stream A will replace this file.

export type AuthUser = {
  userId: string;
  email: string;
};

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUser(_request: Request): Promise<AuthUser> {
  throw new AuthError(401, "authentication required");
}

export function authErrorResponse(err: unknown): Response {
  const status = err instanceof AuthError ? err.status : 401;
  const message = err instanceof AuthError ? err.message : "unauthorized";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
