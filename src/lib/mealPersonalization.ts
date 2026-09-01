export type EquationSex = "female" | "male";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "high"
  | "very_high";
export type PersonalGoal = "maintain" | "loss" | "gain";

export type PersonalProfile = {
  name: string;
  equationSex: EquationSex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: PersonalGoal;
  waistCm?: number;
  excludedFoodIds: string[];
};

export type PersonalTargets = {
  bmi: number;
  bmrKcal: number;
  maintenanceKcal: number;
  targetKcal: number;
  proteinG: { min: number; max: number };
  fatG: { min: number; max: number };
  carbsG: { min: number; max: number };
  fiberG: { min: number; max: number };
  warnings: string[];
  assumptions: string[];
};

export const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  pal: number;
}[] = [
  { value: "sedentary", label: "Hareketsiz", pal: 1.4 },
  { value: "light", label: "Az aktif", pal: 1.55 },
  { value: "moderate", label: "Orta aktif", pal: 1.7 },
  { value: "high", label: "Aktif", pal: 1.9 },
  { value: "very_high", label: "Çok aktif", pal: 2.1 },
];

const MIN_CALORIES = 1200;

function round(value: number): number {
  return Math.round(value);
}

function range(min: number, max: number) {
  return { min: round(min), max: round(max) };
}

export function validateProfile(profile: PersonalProfile): string[] {
  const errors: string[] = [];
  if (!profile.name.trim()) errors.push("Profil adı gerekli.");
  if (
    !Number.isFinite(profile.ageYears) ||
    profile.ageYears < 18 ||
    profile.ageYears > 100
  )
    errors.push("Yaş 18 ile 100 arasında olmalı.");
  if (
    !Number.isFinite(profile.heightCm) ||
    profile.heightCm < 120 ||
    profile.heightCm > 230
  )
    errors.push("Boy 120 ile 230 cm arasında olmalı.");
  if (
    !Number.isFinite(profile.weightKg) ||
    profile.weightKg < 35 ||
    profile.weightKg > 300
  )
    errors.push("Kilo 35 ile 300 kg arasında olmalı.");
  if (
    profile.waistCm !== undefined &&
    (!Number.isFinite(profile.waistCm) ||
      profile.waistCm < 40 ||
      profile.waistCm > 250)
  )
    errors.push("Bel çevresi 40 ile 250 cm arasında olmalı.");
  return errors;
}

export function calculateTargets(
  profile: PersonalProfile,
): PersonalTargets | null {
  if (validateProfile(profile).length > 0) return null;
  const activity =
    ACTIVITY_OPTIONS.find(option => option.value === profile.activity) ??
    ACTIVITY_OPTIONS[0];
  const bmr =
    9.99 * profile.weightKg +
    6.25 * profile.heightCm -
    4.92 * profile.ageYears +
    (profile.equationSex === "male" ? 5 : -161);
  const maintenance = bmr * activity.pal;
  const target =
    profile.goal === "loss"
      ? maintenance - 400
      : profile.goal === "gain"
        ? maintenance + 250
        : maintenance;
  const safeTarget = Math.max(MIN_CALORIES, target);
  const protein =
    profile.weightKg *
    (profile.goal === "gain" ||
    profile.activity === "high" ||
    profile.activity === "very_high"
      ? 1.6
      : 1.2);
  const fatMin = (safeTarget * 0.2) / 9;
  const fatMax = (safeTarget * 0.35) / 9;
  const carbsMin = (safeTarget * 0.45) / 4;
  const carbsMax = (safeTarget * 0.65) / 4;
  const bmi = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
  const warnings: string[] = [];
  if (target < MIN_CALORIES)
    warnings.push(
      "Tahmini hedef düşük; daha büyük bir enerji açığı sağlık uzmanı gözetimi gerektirir.",
    );
  if (profile.waistCm !== undefined)
    warnings.push("Bel çevresi yalnızca sağlık bağlamı sağlar; tanı koymaz.");
  return {
    bmi: round(bmi * 10) / 10,
    bmrKcal: round(bmr),
    maintenanceKcal: round(maintenance),
    targetKcal: round(safeTarget),
    proteinG: range(protein, protein + 20),
    fatG: range(fatMin, fatMax),
    carbsG: range(carbsMin, carbsMax),
    fiberG: range(
      Math.max(25, (safeTarget / 1000) * 14),
      Math.max(30, (safeTarget / 1000) * 14),
    ),
    warnings,
    assumptions: [
      "Mifflin-St Jeor ile tahmin edildi; gerçek enerji ihtiyacı kişiden kişiye değişir.",
      "Aktivite katsayısı günlük hareket ve egzersizin yaklaşık ortalamasıdır.",
      "Hedef, sürdürülebilirlik için koruma tahmininden kademeli olarak ayarlanmıştır.",
    ],
  };
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Düşük";
  if (bmi < 25) return "Genel aralık";
  if (bmi < 30) return "Yüksek";
  return "Çok yüksek";
}

export function activityLabel(activity: ActivityLevel): string {
  return (
    ACTIVITY_OPTIONS.find(option => option.value === activity)?.label ??
    "Hareketsiz"
  );
}
