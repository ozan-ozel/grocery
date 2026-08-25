function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// Thin wrapper around fetch() that always sends the httpOnly session
// cookie (credentials: "include") so every netlify/functions/*.ts
// endpoint's requireUser() check succeeds — no Authorization header, no
// client-readable token. See netlify/functions/_auth.ts.
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), { ...init, credentials: "include" });
}
