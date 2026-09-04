import { useEffect, useState } from "react";

type Session = { email: string | null; userId: string | null };

// null = still checking; undefined = signed out; Session = signed in.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
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
    // navigation to Google's consent screen.
    window.location.href =
      "/api/auth-google-start?returnTo=" + encodeURIComponent(window.location.href);
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
