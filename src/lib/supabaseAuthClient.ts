// src/lib/supabaseAuthClient.ts
//
// Only used when VITE_SUPABASE_AUTH_ENABLED="true" — set in Vercel's
// project env only. Netlify's build never sets this, so its bundle never
// calls getSupabaseAuthClient() and this module's import has no runtime
// effect there beyond being dead code in the bundle.

import { createBrowserClient } from "@supabase/ssr";

export const supabaseAuthEnabled = import.meta.env.VITE_SUPABASE_AUTH_ENABLED === "true";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseAuthClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !anonKey) {
      throw new Error("VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not configured");
    }
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
