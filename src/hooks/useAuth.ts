import { useEffect, useState } from "react";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchAppSession();
  }, []);

  // Reads the canonical { email, userId } pair from our own backend.
  // userId here is always app_users.id (the Google sub), never a raw
  // Supabase uuid — TenantSwitcher etc. compare it directly against
  // households.owner_id.
  async function fetchAppSession(): Promise<void> {
    try {
      const res = await fetch("/api/auth-session", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { email: string | null; userId: string | null };
        setSession({ email: data.email, userId: data.userId });
      } else {
        setSession(undefined);
      }
    } catch {
      setSession(undefined);
    } finally {
      setChecked(true);
    }
  }

  function signInWithGoogle() {
    // Full-page navigation, not fetch — OAuth needs a top-level browser
    // navigation to Google's consent screen. Handled entirely server-side
    // by api/auth-google-start.ts / api/auth-callback.ts — see
    // docs/superpowers/specs/2026-09-10-backend-only-oauth-design.md.
    // returnTo is a relative path, not the full URL: the backend's
    // isSafeReturnTo() rejects absolute URLs as an open-redirect guard.
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = "/api/auth-google-start?returnTo=" + encodeURIComponent(returnTo);
  }

  async function signOut() {
    await fetch("/api/auth-logout", { method: "POST", credentials: "include" });
    setSession(undefined);
  }

  async function deleteAccount() {
    await fetch("/api/auth-delete-account", { method: "DELETE", credentials: "include" });
    setSession(undefined);
  }

  return { session, checked, signInWithGoogle, signOut, deleteAccount };
}
