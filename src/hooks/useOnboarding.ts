import { useEffect, useState } from "react";

const STORAGE_PREFIX = "grocery.onboarding.v1";

export type OnboardingStatus = "unseen" | "skipped" | "completed";

// Device-local only, same pattern as theme/swipeMode in lib/preferences.ts —
// this is "has this device seen the quick-setup prompt," not part of the
// synced profile itself. Deliberately does not sync to Supabase (see the
// spec's "Open items" — cross-device re-prompting is an accepted v1 gap).
function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function loadSkipped(userId: string | null): boolean {
  try {
    return localStorage.getItem(storageKey(userId)) === "skipped";
  } catch {
    return false;
  }
}

function saveSkipped(userId: string | null) {
  try {
    localStorage.setItem(storageKey(userId), "skipped");
  } catch {
    // Best-effort, same as preferences.ts — the flag just won't persist.
  }
}

// hasSavedProfile always wins over a stale "skipped" flag: if the user later
// opens Kişisel Plan directly and fills it in, onboarding should read as
// "completed," not stay stuck on "skipped" from an earlier session.
export function useOnboarding(
  userId: string | null,
  hasSavedProfile: boolean,
): { status: OnboardingStatus; skip: () => void } {
  const [skipped, setSkipped] = useState(() => loadSkipped(userId));

  useEffect(() => {
    setSkipped(loadSkipped(userId));
  }, [userId]);

  function skip() {
    saveSkipped(userId);
    setSkipped(true);
  }

  const status: OnboardingStatus = hasSavedProfile
    ? "completed"
    : skipped
      ? "skipped"
      : "unseen";

  return { status, skip };
}
