import { useEffect, useRef, useState } from "react";
import {
  clearBootCaches,
  loadSessionHint,
  saveSessionHint,
} from "@/lib/bootCache";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
//
// `cachedSession` is a purely *rendering* optimism: the { email, userId } pair
// a previous visit saw, remembered so App() can mount AppShell immediately
// instead of blocking the entire tree on /api/auth-session. It is an identity
// hint and never a token — it authorizes nothing, and every /api/* handler
// still validates the real httpOnly cookie via requireUser(). The worst case
// for an expired cookie is a second of skeleton while the requests 401, then
// LoginGate. See src/lib/bootCache.ts.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);
  const cachedRef = useRef<ReturnType<typeof loadSessionHint>>(null);
  // Read once, at mount, before the first paint.
  const [cachedSession] = useState(() => {
    cachedRef.current = loadSessionHint();
    return cachedRef.current;
  });

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
        // A different user on this browser than the hint claimed (someone
        // signed in after someone else's cookie expired without a sign-out):
        // drop every boot cache before recording the new one, so the previous
        // account's cached lists can't be painted on the next visit.
        const previous = cachedRef.current;
        if (previous && previous.userId !== data.userId) clearBootCaches();
        if (data.userId) {
          saveSessionHint({ email: data.email, userId: data.userId });
          cachedRef.current = { email: data.email, userId: data.userId };
        } else {
          clearBootCaches();
          cachedRef.current = null;
        }
        setSession({ email: data.email, userId: data.userId });
      } else {
        // Confirmed no session. Wipe the caches now rather than leaving them
        // for whoever opens this browser next.
        clearBootCaches();
        cachedRef.current = null;
        setSession(undefined);
      }
    } catch {
      // Network failure, not a rejection — the cookie may well still be good,
      // so leave the caches alone and let the next load re-check.
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
    clearBootCaches();
    cachedRef.current = null;
    setSession(undefined);
  }

  // Resolves only once the server confirms the account is gone. It used to
  // ignore the response — which hid that the endpoint didn't exist on Vercel,
  // so "Hesabı Sil" looked like a sign-out while deleting nothing. Throws on
  // any failure so the caller (DeleteAccountFlow) can say so.
  async function deleteAccount(feedback?: { reason: string; otherText?: string }) {
    const res = await fetch("/api/auth-delete-account", {
      method: "DELETE",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(feedback ?? {}),
    });
    if (!res.ok) throw new Error(`account deletion failed (${res.status})`);
    clearBootCaches();
    cachedRef.current = null;
    setSession(undefined);
  }

  return {
    session,
    cachedSession,
    checked,
    signInWithGoogle,
    signOut,
    deleteAccount,
  };
}
