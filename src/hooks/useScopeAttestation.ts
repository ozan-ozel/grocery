import { useEffect, useState } from "react";

// DEC-012 MVP-1 PROVISIONAL (owner decision 2026-10-28): the user confirms
// whether they belong to a population outside the app's safe automated
// scope (under 18, pregnant, breastfeeding, in eating-disorder treatment).
// When they do, no calorie/macro targets are shown anywhere; lists, meals and
// recipes keep working. REVISIT AFTER QA-1.
//
// Stored per user in this browser only: personal_plan has no column for it
// and adding one needs a live migration. Another device asks again until it
// is answered there too.
const STORAGE_PREFIX = "grocery.scopeAttestation.v1";
const CHANGE_EVENT = "grocery:scope-attestation";

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function load(userId: string | null): boolean {
  try {
    return localStorage.getItem(storageKey(userId)) === "out";
  } catch {
    return false;
  }
}

export function useScopeAttestation(userId: string | null) {
  const [outOfScope, setOutOfScopeState] = useState<boolean>(() => load(userId));

  // Several components read this at once (Kişisel Plan, Yemek Planı); the
  // event keeps every instance in step when one of them changes it.
  useEffect(() => {
    setOutOfScopeState(load(userId));
    const sync = () => setOutOfScopeState(load(userId));
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  function setOutOfScope(value: boolean) {
    try {
      if (value) localStorage.setItem(storageKey(userId), "out");
      else localStorage.removeItem(storageKey(userId));
    } catch {
      // Blocked storage: the choice still applies for this page view.
    }
    setOutOfScopeState(value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return { outOfScope, setOutOfScope };
}

