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

const DEFAULT_PROFILE: PersonalProfile = {
  name: "Benim profilim",
  equationSex: "female",
  ageYears: 30,
  heightCm: 170,
  weightKg: 70,
  activity: "moderate",
  goal: "maintain",
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
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setProfile(loadProfile(userId));
    if (!userId) return;

    let cancelled = false;
    fetchPersonalPlan().then((server) => {
      if (cancelled || !server) return;
      setProfile(server);
      saveProfileCache(userId, server);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    saveProfileCache(userId, profile);
    if (!userId) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      savePersonalPlan(profile).then((ok) => {
        if (!ok) console.warn("[personalPlan] profile saved locally but failed to persist");
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
    targets: calculateTargets(profile),
    update,
    setEquationSex: (value: EquationSex) => update("equationSex", value),
    setActivity: (value: ActivityLevel) => update("activity", value),
    setGoal: (value: PersonalGoal) => update("goal", value),
  };
}
