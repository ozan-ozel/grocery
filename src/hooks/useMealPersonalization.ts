import { useEffect, useState } from "react";
import {
  calculateTargets,
  type PersonalGoal,
  type PersonalProfile,
  type EquationSex,
  type ActivityLevel,
} from "@/lib/mealPersonalization";

const STORAGE_KEY = "grocery.personalPlan.v1";

const DEFAULT_PROFILE: PersonalProfile = {
  name: "Benim profilim",
  equationSex: "female",
  ageYears: 30,
  heightCm: 170,
  weightKg: 70,
  activity: "moderate",
  goal: "maintain",
};

function loadProfile(): PersonalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<PersonalProfile>) }
      : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useMealPersonalization() {
  const [profile, setProfile] = useState<PersonalProfile>(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Best effort: the calculation remains available for this session.
    }
  }, [profile]);

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
