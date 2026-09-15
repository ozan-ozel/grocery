import type { FoodExclusion, AllergenClassExclusion } from "./foodExclusions";

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
  // Reason-tagged exclusion list (Phase 9 §20 Milestone 1), replacing the
  // old undifferentiated `excludedFoodIds: string[]`. See
  // src/lib/foodExclusions.ts for the reason taxonomy and tier semantics.
  foodExclusions: FoodExclusion[];
  // Allergen-class exclusions (B3, Türkiye/EU 14 vocabulary) — a separate
  // array rather than folded into foodExclusions, since a food-level entry
  // and a class-level entry are not interchangeable (B3's own binding
  // rule). See src/lib/allergenClasses.ts.
  allergenExclusions: AllergenClassExclusion[];
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
  // MVP-1 PROVISIONAL (PSM Iteration 1, DEC-046): baseline fluid need only —
  // no exercise/heat adjustment (DEC-047/048), no per-occasion timing.
  // REVISIT AFTER QA-1. See PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md.
  waterMl: number;
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

// Plain-language elaboration for the activity dropdown, shown behind an "i"
// toggle since the bare labels above test as too vague on their own — see
// docs/session-checkpoints/2026-09-15-04-activity-level-info-copy.md. Anchored
// to the IOM/DRI walking-equivalent framework (2002/2005, cited in KM16 ch.2)
// rather than invented category boundaries.
export const ACTIVITY_INFO_INTRO =
  "Bu seçim tüm gününüzle ilgilidir, sadece antrenmanla değil. Zorlu bir spor seansı genellikle sadece 45-60 dakikadır — asıl önemli olan günün geri kalan 22+ saatinde ne kadar hareket ettiğinizdir. Haftada birkaç kez sıkı çalışıp günün geri kalanında oturuyorsanız, bu ölçekte beklenenden daha düşük bir seviyede olabilirsiniz.";

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary:
    "Gününüz çoğunlukla oturarak veya ayakta durarak geçiyor — masa başı iş, araçla ulaşım, düzenli ekstra hareket yok. Örnek: ofis işi, arabayla işe gidiş, çoğu gün yürüyüş veya egzersiz yok.",
  light:
    "Günlük yaşamın yanında çoğu gün hafif bir ekstra hareket var — günde yaklaşık 30-40 dakika tempolu yürüyüş veya benzeri. Örnek: günlük kısa bir yürüyüş, günün bir kısmında ayakta olduğunuz bir iş, ya da çoğu gün hafif ev işleri.",
  moderate:
    "Gün boyunca belirgin şekilde daha fazla hareket var — ya sürekli günlük yürüyüş (bir saat veya daha fazla) ya da sizi çoğu gün hareket halinde tutan bir iş/yaşam tarzı. Örnek: fiziksel olarak aktif bir iş (perakende, hizmet, ayakta öğretmenlik), ya da düzenli günde ~1 saatlik yürüyüş.",
  high: "Günde önemli miktarda hareket var — günde yaklaşık iki saatlik yürüyüş eşdeğeri hareket ve/veya zaten aktif bir günlük rutine ek olarak düzenli antrenman. Örnek: günde bir saatten fazla yürüyüş artı haftada 4-5 antrenman, ya da egzersizle birleşen fiziksel olarak zorlu bir iş.",
  very_high:
    "Çok yüksek günlük aktivite — dayanıklılık sporcularının veya fiziksel olarak yoğun işlerde çalışanların gün be gün sürdürdüğü seviyeye yakın. Örnek: çoğu gün birden fazla saat antrenman veya ağır bedensel iş — inşaat, yarışmaya yönelik dayanıklılık antrenmanı vb.",
};

const MIN_CALORIES = 1200;

// g of carbohydrate per kg body weight per day, for disclosed structured training
// (moderate/high/very_high activity). DEC-034 (DECISION_LOGIC_SPECIFICATION.md §3.3, Gate 6
// correction 2026-09-07): routine daily fueling tops out at 6-10 g/kg/day (high-volume
// endurance). 8-12 g/kg/day is a pre-event loading protocol conditional on a disclosed event
// date (DEC-094, not collected), not a routine band for any activity level — "very_high" reuses
// the same 6-10 ceiling as "high" rather than exceeding it. Sedentary and light are excluded
// here; the general population uses the AMDR percentage-of-energy basis below instead of a
// sports-nutrition g/kg band.
const CARB_G_PER_KG: Record<
  Extract<ActivityLevel, "moderate" | "high" | "very_high">,
  { min: number; max: number }
> = {
  moderate: { min: 5, max: 7 },
  high: { min: 6, max: 10 },
  very_high: { min: 6, max: 10 },
};

// DEC-034: DRI RDA floor — the brain's minimum glucose requirement, applied regardless of
// activity-level band or AMDR percentage.
const CARB_DRI_FLOOR_G = 130;

// DEC-034: AMDR for the general population (sedentary/light), used instead of a sports-nutrition
// g/kg band per DECISION_LOGIC_SPECIFICATION.md §3.3.
const CARB_AMDR_ENERGY_SHARE = { min: 0.45, max: 0.65 };

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
    (profile.goal === "loss"
      ? 2.0
      : profile.goal === "gain" ||
          profile.activity === "high" ||
          profile.activity === "very_high"
        ? 1.6
        : 1.2);
  const fatMin = (safeTarget * 0.2) / 9;
  const fatMax = (safeTarget * 0.35) / 9;
  const trainingCarbRange =
    profile.activity === "sedentary" || profile.activity === "light"
      ? null
      : CARB_G_PER_KG[profile.activity];
  const carbsMin = trainingCarbRange
    ? Math.max(profile.weightKg * trainingCarbRange.min, CARB_DRI_FLOOR_G)
    : Math.max(
        (safeTarget * CARB_AMDR_ENERGY_SHARE.min) / 4,
        CARB_DRI_FLOOR_G,
      );
  const carbsMax = trainingCarbRange
    ? profile.weightKg * trainingCarbRange.max
    : (safeTarget * CARB_AMDR_ENERGY_SHARE.max) / 4;
  const bmi = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
  // MVP-1 PROVISIONAL (DEC-046): midpoint of the drafted 30-35 mL/kg/day DRI
  // baseline-fluid range — no exercise (DEC-047) or heat/altitude (DEC-048)
  // adjustment. REVISIT AFTER QA-1.
  const waterMl = round(profile.weightKg * 33);
  const warnings: string[] = [];
  if (target < MIN_CALORIES)
    warnings.push(
      "Tahmini hedef düşük; daha büyük bir enerji açığı sağlık uzmanı gözetimi gerektirir.",
    );
  if (profile.waistCm !== undefined)
    warnings.push("Bel çevresi yalnızca sağlık bağlamı sağlar; tanı koymaz.");
  // MVP-1 PROVISIONAL (DEC-009): coarse implausibility flag on top of
  // validateProfile()'s existing per-field bounds, which can still combine
  // into a physiologically nonsensical BMI (e.g. 35 kg at 230 cm). A warning,
  // not a gate — validateProfile() remains the only hard stop. REVISIT AFTER
  // QA-1.
  if (bmi < 12 || bmi > 60)
    warnings.push(
      "Boy ve kilo birlikte olağan dışı bir oran veriyor; değerleri kontrol et.",
    );
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
    waterMl,
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

// MVP-1 PROVISIONAL (PSM Iteration 1, DEC-033): a flat 0.3-0.4 g/kg/occasion
// band (the curriculum's own drafted figure) applied uniformly to every meal
// slot — no per-occasion redistribution by size, timing, or training
// proximity (DEC-035/057). Display-only; nothing reads this to gate or
// resize an entry. REVISIT AFTER QA-1.
export function occasionProteinTargetG(weightKg: number) {
  return range(weightKg * 0.3, weightKg * 0.4);
}

export function activityLabel(activity: ActivityLevel): string {
  return (
    ACTIVITY_OPTIONS.find(option => option.value === activity)?.label ??
    "Hareketsiz"
  );
}
