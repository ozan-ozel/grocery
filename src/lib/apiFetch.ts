function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// Thin wrapper around fetch() that always sends the httpOnly session
// cookie (credentials: "include") so every api/*.ts
// endpoint's requireUser() check succeeds — no Authorization header, no
// client-readable token. See lib/auth.ts.
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), { ...init, credentials: "include" });
}
