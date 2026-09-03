import { useEffect, useRef, useState } from "react";
import {
  calculateTargets,
  type PersonalGoal,
  type PersonalProfile,
  type EquationSex,
  type ActivityLevel,
} from "@/lib/mealPersonalization";
import { fetchPersonalPlan, savePersonalPlan } from "@/lib/personalPlan";

const STORAGE_PREFIX = "grocery.personalPlan.v1";

export const DEFAULT_PROFILE: PersonalProfile = {
  name: "Benim profilim",
  equationSex: "female",
  ageYears: 30,
  heightCm: 170,
  weightKg: 70,
  activity: "moderate",
  goal: "maintain",
  excludedFoodIds: [],
};

// Not synced yet (session not ready) falls back to a bare device-local key,
// same as before this landed.
function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function loadProfile(userId: string | null): PersonalProfile {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw
      ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<PersonalProfile>) }
      : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

// Distinguishes "the user has a profile" from "we fell back to DEFAULT_PROFILE".
// calculateTargets(DEFAULT_PROFILE) returns perfectly valid targets, so callers
// that need to know whether those targets describe a real person (Bugün's
// setup prompt) can't infer it from `targets` alone.
function hasSavedProfileLocally(userId: string | null): boolean {
  try {
    return localStorage.getItem(storageKey(userId)) !== null;
  } catch {
    return false;
  }
}

function saveProfileCache(userId: string | null, profile: PersonalProfile) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(profile));
  } catch {
    // Best effort: the calculation remains available for this session.
  }
}

const SAVE_DEBOUNCE_MS = 600;

// One profile per logged-in user (supabase/08-personal-plan.sql /
// 09-personal-plan-user-scoped.sql) — a personal profile is inherently
// per-person, not per-household, since a household can have multiple
// invited members (see docs/architecture.md#personal-meal-planning). The
// local cache paints instantly on load, then a background fetch merges in
// the server copy (server wins, same pattern as useItemCategories); without
// a signed-in user yet this stays device-local only.
export function useMealPersonalization(userId: string | null) {
  const [profile, setProfile] = useState<PersonalProfile>(() => loadProfile(userId));
  const [hasSavedProfile, setHasSavedProfile] = useState<boolean>(() =>
    hasSavedProfileLocally(userId),
  );
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setProfile(loadProfile(userId));
    setHasSavedProfile(hasSavedProfileLocally(userId));
    if (!userId) return;

    let cancelled = false;
    fetchPersonalPlan().then((server) => {
      if (cancelled || !server) return;
      setProfile(server);
      setHasSavedProfile(true);
      saveProfileCache(userId, server);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    // The untouched DEFAULT_PROFILE fallback is not something the user ever
    // filled in, so it must not be written anywhere: persisting it would
    // fabricate a "saved" profile on the very first render and permanently
    // hide the Kişisel Plan setup prompt Bugün owes a new user. Every real
    // profile — device cache, server copy, or an edit via update() — is a
    // fresh object, so identity is what separates the two.
    if (profile === DEFAULT_PROFILE) return;
    saveProfileCache(userId, profile);
    setHasSavedProfile(true);
    if (!userId) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      savePersonalPlan(profile).then((ok) => {
        if (ok) setHasSavedProfile(true);
        else console.warn("[personalPlan] profile saved locally but failed to persist");
      });
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, userId]);

  function update<K extends keyof PersonalProfile>(
    key: K,
    value: PersonalProfile[K],
  ) {
    setProfile(current => ({ ...current, [key]: value }));
  }

  return {
    profile,
    hasSavedProfile,
    targets: calculateTargets(profile),
    update,
    setEquationSex: (value: EquationSex) => update("equationSex", value),
    setActivity: (value: ActivityLevel) => update("activity", value),
    setGoal: (value: PersonalGoal) => update("goal", value),
  };
}
