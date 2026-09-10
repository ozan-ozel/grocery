import { BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ACTIVITY_OPTIONS,
  activityLabel,
  bmiLabel,
  type PersonalGoal,
} from "@/lib/mealPersonalization";
import {
  upsertAllergenClassExclusion,
  type ExclusionReason,
  type AllergenClassExclusion,
} from "@/lib/foodExclusions";
import {
  ALLERGEN_CLASS_IDS,
  ALLERGEN_CLASS_LABEL_TR,
  type AllergenClassId,
} from "@/lib/allergenClasses";
import type { Nutrition } from "@/lib/nutrition";
import { buildFoodIdentityIndex } from "@/lib/foodIdentity";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { useDetailsTransition } from "@/hooks/useDetailsTransition";
import { cn } from "@/lib/utils";

// A user only ever picks one of these four — "unclassified" is a migration
// artifact (Phase 9 §20 Milestone 1), never a choice offered here.
const REASON_OPTIONS: { value: ExclusionReason; label: string }[] = [
  { value: "preference", label: "Sevmiyorum" },
  { value: "intolerance", label: "Hassasiyetim var" },
  { value: "allergy", label: "Alerjim var" },
  { value: "unclear", label: "Emin değilim" },
];

const REASON_LABEL_SHORT: Record<ExclusionReason, string> = {
  preference: "tercih",
  intolerance: "hassasiyet",
  allergy: "alerji",
  unclear: "emin değil",
  unclassified: "neden yok",
};

type Source = { label: string; href: string; badge: string };

const SOURCE_GROUPS: { feature: string; sources: Source[] }[] = [
  {
    feature: "Profil girdileri ve enerji planlama çerçevesi",
    sources: [
      {
        label: "NIDDK Body Weight Planner",
        href: "https://www.niddk.nih.gov/bwp",
        badge: "NIDDK",
      },
      {
        label: "NCBI Endotext: dietary treatment",
        href: "https://www.ncbi.nlm.nih.gov/books/NBK278991/",
        badge: "Endotext",
      },
    ],
  },
  {
    feature: "Bazal metabolizma, koruma ve hedef kalorisi",
    sources: [
      {
        label: "NCBI Endotext: Mifflin-St Jeor ve aktivite katsayıları",
        href: "https://www.ncbi.nlm.nih.gov/books/NBK278991/",
        badge: "Endotext",
      },
      {
        label: "NIDDK Body Weight Planner",
        href: "https://www.niddk.nih.gov/bwp",
        badge: "NIDDK",
      },
    ],
  },
  {
    feature: "Günlük aktivite seviyesi",
    sources: [
      {
        label: "WHO physical activity guidance",
        href: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        badge: "WHO",
      },
    ],
  },
  {
    feature: "Protein, yağ, karbonhidrat ve lif aralıkları",
    sources: [
      {
        label: "National Academies DRI tables",
        href: "https://www.ncbi.nlm.nih.gov/books/NBK545442/",
        badge: "DRI",
      },
      {
        label: "NCBI Endotext: dietary treatment",
        href: "https://www.ncbi.nlm.nih.gov/books/NBK278991/",
        badge: "Endotext",
      },
      {
        label: "Hector & Phillips (2018): protein during energy restriction",
        href: "https://pubmed.ncbi.nlm.nih.gov/29182451/",
        badge: "Hector 2018",
      },
      {
        label:
          "ACSM/AND/DC joint position stand: carbohydrate by training load",
        href: "https://pubmed.ncbi.nlm.nih.gov/26891166/",
        badge: "ACSM 2016",
      },
    ],
  },
  {
    feature: "BMI ve bel çevresi bağlamı",
    sources: [
      {
        label: "NCBI Endotext: BMI ve bel çevresi",
        href: "https://www.ncbi.nlm.nih.gov/books/NBK278991/",
        badge: "Endotext",
      },
    ],
  },
];

type Props = { userId: string | null };

export function PersonalPlanView({ userId }: Props) {
  const {
    profile,
    targets,
    update,
    setActivity,
    setEquationSex,
    setGoal,
    saveError,
    retrySave,
  } = useMealPersonalization(userId);
  const [showSources, setShowSources] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const howDetails = useDetailsTransition<HTMLElement>();
  const sourcesDetails = useDetailsTransition<HTMLElement>();

  const { foods } = useFoodCatalog();
  // Display-only resolver for an exclusion chip's foodId: an entry created
  // before Canonical Food Identity holds a bare name_tr string (never a key
  // in byId, so this falls through to the id itself, unchanged — the same
  // string it always displayed); one created after it holds an opaque
  // food_id UUID that must be resolved through the catalog to show anything
  // readable. Exact food_id -> canonical name only (same precedence as
  // src/lib/foodIdentity.ts, no fuzzy step) — never used for matching or
  // safety, only for what the chip renders.
  const foodIdentityIndex = useMemo(() => buildFoodIdentityIndex(foods), [foods]);
  function displayNameForFoodId(foodId: string): string {
    return foodIdentityIndex.byId.get(foodId)?.name_tr ?? foodId;
  }
  const [excludeQuery, setExcludeQuery] = useState("");
  // A food picked from search but not yet given a reason — nothing is
  // written to foodExclusions until one of the four reasons is chosen
  // (Phase 9 §20 Milestone 1: an exclusion must carry why it exists). Holds
  // the whole resolved Nutrition object, not just a display string, so the
  // eventual addExclusion call can prefer the stable food_id over the
  // mutable name_tr (Canonical Food Identity decision 6) while the
  // confirmation UI still shows the readable name, not an opaque id.
  const [pendingFood, setPendingFood] = useState<Nutrition | null>(null);

  const excludedIds = new Set(profile.foodExclusions.map(e => e.foodId));
  const excludeMatches = excludeQuery.trim()
    ? foods
        .filter(f => {
          const q = excludeQuery.trim().toLocaleLowerCase("tr-TR");
          const nameMatches = f.name_tr.toLocaleLowerCase("tr-TR").includes(q);
          // Alias-aware: useFoodCatalog's map already keys by alias too, but
          // `foods` here is the plain list — check aliases directly so a
          // search by an alias spelling still finds the row (§20.6 C5).
          const aliasMatches = (f.aliases ?? []).some(a =>
            a.toLocaleLowerCase("tr-TR").includes(q),
          );
          return (nameMatches || aliasMatches) && !excludedIds.has(f.name_tr);
        })
        .slice(0, 5)
    : [];

  function addExclusion(foodId: string, reason: ExclusionReason) {
    update("foodExclusions", [
      ...profile.foodExclusions,
      { foodId, reason, createdAt: new Date().toISOString() },
    ]);
    setPendingFood(null);
    setExcludeQuery("");
  }

  // For a legacy "unclassified" entry — gives it a real reason without
  // touching its foodId or createdAt.
  function reclassifyExclusion(foodId: string, reason: ExclusionReason) {
    update(
      "foodExclusions",
      profile.foodExclusions.map(e =>
        e.foodId === foodId ? { ...e, reason } : e,
      ),
    );
  }

  function removeExclusion(foodId: string) {
    update(
      "foodExclusions",
      profile.foodExclusions.filter(e => e.foodId !== foodId),
    );
  }

  const unclassifiedExclusions = profile.foodExclusions.filter(
    e => e.reason === "unclassified",
  );
  const classifiedExclusions = profile.foodExclusions.filter(
    e => e.reason !== "unclassified",
  );

  // Allergen-class exclusions — a separate list from food-level exclusions
  // above (B3's own binding rule: a specific food and an allergen class are
  // not interchangeable). No "unclassified" migration state exists here —
  // this is a brand new field, every entry always carries the reason it
  // was created with.
  const [pendingAllergenClass, setPendingAllergenClass] =
    useState<AllergenClassId | null>(null);
  const excludedAllergenClasses = new Set(
    profile.allergenExclusions.map(e => e.allergenClass),
  );
  const availableAllergenClasses = ALLERGEN_CLASS_IDS.filter(
    id => !excludedAllergenClasses.has(id),
  );

  function addAllergenExclusion(
    allergenClass: AllergenClassId,
    reason: ExclusionReason,
  ) {
    const entry: AllergenClassExclusion = {
      allergenClass,
      reason,
      createdAt: new Date().toISOString(),
    };
    update("allergenExclusions", current =>
      upsertAllergenClassExclusion(current, entry),
    );
    setPendingAllergenClass(null);
  }

  function removeAllergenExclusion(allergenClass: AllergenClassId) {
    update("allergenExclusions", current =>
      current.filter(e => e.allergenClass !== allergenClass),
    );
  }

  // Shown once anything hard-tier-and-clinical-adjacent is present — not a
  // safety claim, a caveat that this app does not replace one (Phase 9
  // §20 Milestone 1: no allergy-safety claim in product copy).
  const hasClinicalAdjacentExclusion =
    unclassifiedExclusions.length > 0 ||
    classifiedExclusions.some(
      e => e.reason === "allergy" || e.reason === "unclear",
    ) ||
    profile.allergenExclusions.some(
      e => e.reason === "allergy" || e.reason === "unclear",
    );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Kişisel Plan
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Sana göre günlük hedefler
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tahmini enerji ihtiyacını ve dengeli beslenme aralıklarını kendi
          bilgilerinle oluştur.
        </p>
      </div>

      {saveError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          Değişiklikler cihazında kaydedildi ama sunucuya kaydedilemedi.{" "}
          <button type="button" onClick={retrySave} className="underline">
            Tekrar dene
          </button>
        </div>
      )}

      <section className="rounded-lg border border-border p-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          Profil {showSources && <SourceBadge label="NIDDK" />}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Profil adı">
            <Input
              value={profile.name}
              onInput={(event: Event) =>
                update("name", (event.target as HTMLInputElement).value)
              }
            />
          </Field>
          <Field label="Yaş (yıl)">
            <NumberInput
              value={profile.ageYears}
              onChange={value => update("ageYears", value)}
            />
          </Field>
          <Field label="Boy (cm)">
            <NumberInput
              value={profile.heightCm}
              onChange={value => update("heightCm", value)}
            />
          </Field>
          <Field label="Kilo (kg)">
            <NumberInput
              value={profile.weightKg}
              onChange={value => update("weightKg", value)}
            />
          </Field>
        </div>
        <details className="group mt-3" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 text-signal shadow-sm">
              <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
            </span>
            Varsayılan olarak dolduruldu — istersen değiştir
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="Denklem seçimi">
              <select
                value={profile.equationSex}
                onChange={event =>
                  setEquationSex(
                    (event.target as HTMLSelectElement).value as
                      | "female"
                      | "male",
                  )
                }
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="female">Kadın katsayısı</option>
                <option value="male">Erkek katsayısı</option>
              </select>
            </Field>
            <Field label="Bel (cm), isteğe bağlı">
              <NumberInput
                value={profile.waistCm ?? ""}
                onChange={value => update("waistCm", value || undefined)}
              />
            </Field>
            <Field
              label="Günlük aktivite"
              sourceBadge={showSources ? "WHO" : undefined}>
              <select
                value={profile.activity}
                onChange={event =>
                  setActivity(
                    (event.target as HTMLSelectElement)
                      .value as typeof profile.activity,
                  )
                }
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {ACTIVITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Hedef"
              sourceBadge={showSources ? "NIDDK" : undefined}>
              <select
                value={profile.goal}
                onChange={event =>
                  setGoal(
                    (event.target as HTMLSelectElement).value as PersonalGoal,
                  )
                }
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="maintain">Kilomu korumak</option>
                <option value="loss">Kademeli kilo kaybı</option>
                <option value="gain">Kilo almak / performans</option>
              </select>
            </Field>
          </div>
        </details>
        <p className="mt-3 text-xs text-muted-foreground">
          Denklem seçimi yalnızca enerji tahminindeki biyolojik katsayıyı
          belirtir; cinsiyet kimliğinden otomatik olarak çıkarılmaz.
        </p>
      </section>

      <section className="rounded-lg border border-border p-3">
        <h2 className="text-sm font-semibold">Önerilmesin</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Besini işaretle ve nedenini seç — öneriler buna göre değişir: alerji
          ve emin olmadığın besinler önerilerden tamamen çıkarılır, hassasiyet
          daha az önerilir, sevmediğin besinler önerilmez.
        </p>
        {!pendingFood && (
          <Input
            className="mt-2"
            placeholder="Besin ara..."
            value={excludeQuery}
            onInput={(event: Event) =>
              setExcludeQuery((event.target as HTMLInputElement).value)
            }
          />
        )}
        {!pendingFood && excludeMatches.length > 0 && (
          <ul className="mt-1 divide-y divide-border rounded-md border border-border">
            {excludeMatches.map(f => (
              <li key={f.name_tr}>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => setPendingFood(f)}>
                  {f.name_tr}
                </button>
              </li>
            ))}
          </ul>
        )}
        {pendingFood && (
          <div className="mt-2 rounded-md border border-border p-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {pendingFood.name_tr}
              </span>{" "}
              — nedeni ne?
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {REASON_OPTIONS.map(opt => (
                <ReasonButton
                  key={opt.value}
                  label={opt.label}
                  onClick={() =>
                    // Prefer the stable food_id over the mutable name_tr so
                    // this new entry survives a future rename (Canonical
                    // Food Identity decision 6); pendingFood is only ever
                    // set from a resolved catalog row, so name_tr is always
                    // a safe fallback for anything pre-migration.
                    addExclusion(pendingFood.food_id ?? pendingFood.name_tr, opt.value)
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPendingFood(null)}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2">
              Vazgeç
            </button>
          </div>
        )}

        {unclassifiedExclusions.length > 0 && (
          <div className="mt-3 space-y-2 rounded-md border border-signal/40 bg-signal/5 p-2">
            <p className="text-xs font-medium text-foreground">
              Bu besinlerin nedeni hiç seçilmemiş — lütfen seç:
            </p>
            {unclassifiedExclusions.map(e => (
              <div key={e.foodId} className="space-y-1">
                <p className="text-xs">{displayNameForFoodId(e.foodId)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {REASON_OPTIONS.map(opt => (
                    <ReasonButton
                      key={opt.value}
                      small
                      label={opt.label}
                      onClick={() => reclassifyExclusion(e.foodId, opt.value)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeExclusion(e.foodId)}
                    aria-label={`${displayNameForFoodId(e.foodId)} hariç tutmayı kaldır`}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {classifiedExclusions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {classifiedExclusions.map(e => (
              <span
                key={e.foodId}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs">
                {displayNameForFoodId(e.foodId)}
                <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {REASON_LABEL_SHORT[e.reason]}
                </span>
                <button
                  type="button"
                  onClick={() => removeExclusion(e.foodId)}
                  aria-label={`${displayNameForFoodId(e.foodId)} hariç tutmayı kaldır`}
                  className="text-muted-foreground">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {hasClinicalAdjacentExclusion && (
          <p className="mt-2 text-xs text-signal">
            Bu uygulama tıbbi bir alerji kontrolü yapmaz. Ciddi bir alerjin ya
            da hassasiyetin varsa etiketleri her zaman kontrol et ve gerekiyorsa
            bir sağlık uzmanına danış.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border p-3">
        <h2 className="text-sm font-semibold">Alerjen grubu hariç tut</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Belirli bir besin yerine bütün bir alerjen grubunu (ör. "sert kabuklu
          yemişler") hariç tutabilirsin — Türkiye/AB'nin 14 alerjen grubuna
          göre. Bu, tek bir besini hariç tutmaktan farklıdır: grup eşleşmesi
          bilinmeyen (henüz değerlendirilmemiş) bir besin de, alerji/emin
          değilim nedeniyle hariç tutulmuş bir grup için önerilerden çıkarılır —
          güvenlik için, veri eksikliği asla "güvenli" sayılmaz.
        </p>
        {!pendingAllergenClass && availableAllergenClasses.length > 0 && (
          <ul className="mt-2 divide-y divide-border rounded-md border border-border">
            {availableAllergenClasses.map(id => (
              <li key={id}>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => setPendingAllergenClass(id)}>
                  {ALLERGEN_CLASS_LABEL_TR[id]}
                </button>
              </li>
            ))}
          </ul>
        )}
        {pendingAllergenClass && (
          <div className="mt-2 rounded-md border border-border p-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {ALLERGEN_CLASS_LABEL_TR[pendingAllergenClass]}
              </span>{" "}
              — nedeni ne?
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {REASON_OPTIONS.map(opt => (
                <ReasonButton
                  key={opt.value}
                  label={opt.label}
                  onClick={() =>
                    addAllergenExclusion(pendingAllergenClass, opt.value)
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPendingAllergenClass(null)}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2">
              Vazgeç
            </button>
          </div>
        )}
        {profile.allergenExclusions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.allergenExclusions.map(e => (
              <span
                key={e.allergenClass}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs">
                {ALLERGEN_CLASS_LABEL_TR[e.allergenClass]}
                <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {REASON_LABEL_SHORT[e.reason]}
                </span>
                <button
                  type="button"
                  onClick={() => removeAllergenExclusion(e.allergenClass)}
                  aria-label={`${ALLERGEN_CLASS_LABEL_TR[e.allergenClass]} hariç tutmayı kaldır`}
                  className="text-muted-foreground">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {targets && (
        <TargetSummary
          targets={targets}
          activity={activityLabel(profile.activity)}
          showSources={showSources}
        />
      )}

      <div className="glow-signal rounded-lg">
        <details
          open={howOpen}
          onToggle={event => {
            const opened = (event.target as HTMLDetailsElement).open;
            setHowOpen(opened);
            howDetails.onToggle(opened);
          }}
          className={cn(
            "rounded-lg",
            howOpen && howDetails.settled
              ? "gradient-edge-flow p-px"
              : "border-signal-solid",
          )}>
          <summary
            ref={howDetails.ref}
            className={`flex cursor-pointer list-none items-center gap-2 bg-background p-3 text-sm font-semibold ${
              howOpen
                ? "rounded-t-[calc(0.5rem-1px)]"
                : "rounded-[calc(0.5rem-1px)]"
            }`}>
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 font-serif text-xs font-bold italic leading-none text-signal shadow-sm">
              i
            </span>
            Nasıl hesaplanıyor?
          </summary>
          <div className="space-y-2 rounded-b-[calc(0.5rem-1px)] bg-background px-3 pb-3 text-xs text-muted-foreground">
            <ul className="space-y-1.5">
              <li>
                <span className="font-medium text-foreground">
                  Bazal metabolizma (BMR):
                </span>{" "}
                Mifflin-St Jeor formülü — 9.99×Kilo + 6.25×Boy − 4.92×Yaş, artı
                denklem seçimine göre erkek katsayısı (+5) ya da kadın katsayısı
                (−161).
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Koruma kalorisi:
                </span>{" "}
                BMR × aktivite katsayısı — Hareketsiz için 1.4, Az aktif 1.55,
                Orta aktif 1.7, Aktif 1.9, Çok aktif 2.1 ("Günlük aktivite"
                seçimine göre).
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Günlük enerji hedefi:
                </span>{" "}
                Kademeli kilo kaybında koruma −400 kcal, kilo alma/performansta
                +250 kcal; kilomu korumak seçiliyse değişmez. Hedef hiçbir zaman
                1200 kcal'in altına inmez.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Protein / Yağ / Karbonhidrat / Lif aralıkları:
                </span>{" "}
                yağ hedef kalorinin %20-35'i (DRI); karbonhidrat, aktivite
                seviyesine göre kilo başına 3-12g (spor beslenmesi literatürü,
                kalori hedefinden bağımsız); protein kilo başına 1.2g (temel),
                1.6g (aktif/çok aktif ya da kilo alma hedefinde) veya 2.0g (kilo
                verme hedefinde, kas kütlesini korumak için); lif her 1000 kcal
                için ~14g (DRI).
              </li>
            </ul>
            <p>
              Bu sonuçlar klinik ölçüm veya tıbbi tavsiye değildir. İlaç, kronik
              hastalık, gebelik, emzirme veya yeme bozukluğu durumlarında
              diyetisyen ya da hekimle görüş.
            </p>
          </div>
        </details>
      </div>

      <div className="glow-signal rounded-lg">
        <details
          open={showSources}
          onToggle={event => {
            const opened = (event.target as HTMLDetailsElement).open;
            setShowSources(opened);
            sourcesDetails.onToggle(opened);
          }}
          className={cn(
            "group rounded-lg",
            showSources ? "border-gradient-edge" : "border-signal-solid",
          )}>
          <summary
            ref={sourcesDetails.ref}
            className={`flex cursor-pointer list-none items-center justify-between bg-background p-3 text-sm font-semibold ${
              showSources
                ? "rounded-t-[calc(0.5rem-1px)]"
                : "rounded-[calc(0.5rem-1px)]"
            }`}>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 text-signal shadow-sm">
                <BookOpen className="size-3" />
              </span>
              Kaynakları göster
            </span>
            <span
              aria-hidden="true"
              className="relative inline-flex items-center">
              <span className="h-5 w-9 rounded-full bg-signal/10 transition-colors group-open:bg-signal" />
              <span className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-background shadow transition-transform group-open:translate-x-4" />
            </span>
          </summary>
          <div className="rounded-b-[calc(0.5rem-1px)] bg-background px-3 pb-3">
            <SourceMap />
          </div>
        </details>
      </div>
    </div>
  );
}

function ReasonButton({
  label,
  onClick,
  small,
}: {
  label: string;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border text-left transition-colors hover:bg-accent",
        small ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
      )}>
      {label}
    </button>
  );
}

export function Field({
  label,
  children,
  sourceBadge,
}: {
  label: string;
  children: React.ReactNode;
  sourceBadge?: string;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="mb-1 flex items-center gap-1">
        {label} {sourceBadge && <SourceBadge label={sourceBadge} />}
      </span>
      {children}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
}: {
  value: number | string;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      value={value}
      onInput={(event: Event) =>
        onChange(Number((event.target as HTMLInputElement).value))
      }
    />
  );
}

function TargetSummary({
  targets,
  activity,
  showSources,
}: {
  targets: NonNullable<
    ReturnType<typeof import("@/lib/mealPersonalization").calculateTargets>
  >;
  activity: string;
  showSources: boolean;
}) {
  const cards = [
    ["Günlük enerji", `${targets.targetKcal} kcal`, "hedef"],
    ["Protein", `${targets.proteinG.min}-${targets.proteinG.max} g`, "aralık"],
    ["Yağ", `${targets.fatG.min}-${targets.fatG.max} g`, "aralık"],
    ["Karbonhidrat", `${targets.carbsG.min}-${targets.carbsG.max} g`, "aralık"],
    ["Lif", `${targets.fiberG.min}-${targets.fiberG.max} g`, "minimum"],
    // MVP-1 PROVISIONAL (DEC-046) — baseline only, see mealPersonalization.ts.
    ["Su", `${(targets.waterMl / 1000).toFixed(1)} L`, "temel, taslak"],
  ];
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold">Günlük hedeflerin</h2>
          <p className="text-xs text-muted-foreground">
            {activity} {showSources && <SourceBadge label="WHO" />} · BMI{" "}
            {targets.bmi} ({bmiLabel(targets.bmi)}){" "}
            {showSources && <SourceBadge label="Endotext" />}
          </p>
        </div>
        <span className="ledger text-xs text-muted-foreground">
          Koruma {targets.maintenanceKcal} kcal
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cards.map(([label, value, suffix]) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {label} {showSources && <SourceBadge label="DRI" />}
            </p>
            <p className="ledger mt-1 text-lg font-semibold">{value}</p>
            <p className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">
              {suffix}
            </p>
          </div>
        ))}
      </div>
      {targets.warnings.map(warning => (
        <p key={warning} className="text-xs text-signal">
          {warning}
        </p>
      ))}
      <p className="text-xs text-muted-foreground">
        Hedefler tahminidir; düzenli ağırlık ve besin kaydıyla zaman içinde
        kişiselleştirilmelidir.
      </p>
    </section>
  );
}

function SourceMap() {
  return (
    <div className="space-y-2 border-t border-border pt-3 text-xs">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BookOpen className="size-4" /> Özellik kaynakları
      </div>
      {SOURCE_GROUPS.map(group => (
        <div key={group.feature} className="border-t border-border pt-2">
          <p className="font-medium text-foreground">{group.feature}</p>
          <div className="mt-1.5 space-y-1">
            {group.sources.map(source => (
              <a
                key={`${group.feature}-${source.href}-${source.label}`}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-foreground/80 underline decoration-dotted underline-offset-2 transition-colors hover:bg-accent hover:text-signal hover:decoration-solid"
                href={source.href}
                target="_blank"
                rel="noreferrer">
                <SourceBadge label={source.badge} />
                <span className="flex-1">{source.label}</span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-signal/70 bg-signal/10 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-signal shadow-sm">
      {label}
    </span>
  );
}
