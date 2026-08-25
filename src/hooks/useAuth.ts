import { useEffect, useState } from "react";

type Session = { email: string | null };

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
        const data = (await res.json()) as { email: string | null };
        setSession({ email: data.email });
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

  return { session, checked, signInWithGoogle, signOut };
}
