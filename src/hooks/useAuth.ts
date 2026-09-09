import { useEffect, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseAuthClient, supabaseAuthEnabled } from "../lib/supabaseAuthClient";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!supabaseAuthEnabled) {
      fetchAppSession();
      return;
    }
    fetchAppSessionAfterSupabaseCheck();
    const supabase = getSupabaseAuthClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void fetchAppSessionAfterSupabaseCheck();
      if (event === "SIGNED_OUT") setSession(undefined);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Reads the canonical { email, userId } pair from our own backend — same
  // endpoint, same shape, under either auth mode. userId here is always
  // app_users.id (the Google sub), never a raw Supabase uuid — TenantSwitcher
  // etc. compare it directly against households.owner_id.
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

  async function fetchAppSessionAfterSupabaseCheck(): Promise<void> {
    const supabase = getSupabaseAuthClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSession(undefined);
      setChecked(true);
      return;
    }
    // A fresh login has no app_users/auth_user_map row yet — this call
    // creates it. Safe to call every time: the upserts are idempotent.
    await fetch("/api/auth-link", { method: "POST", credentials: "include" });
    await fetchAppSession();
  }

  function signInWithGoogle() {
    if (supabaseAuthEnabled) {
      void getSupabaseAuthClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      return;
    }
    // Full-page navigation, not fetch — OAuth needs a top-level browser
    // navigation to Google's consent screen.
    window.location.href =
      "/api/auth-google-start?returnTo=" + encodeURIComponent(window.location.href);
  }

  async function signOut() {
    if (supabaseAuthEnabled) {
      await getSupabaseAuthClient().auth.signOut();
    }
    await fetch("/api/auth-logout", { method: "POST", credentials: "include" });
    setSession(undefined);
  }

  async function deleteAccount() {
    await fetch("/api/auth-delete-account", { method: "DELETE", credentials: "include" });
    setSession(undefined);
  }

  return { session, checked, signInWithGoogle, signOut, deleteAccount };
}
