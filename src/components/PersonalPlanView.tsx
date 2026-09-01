import { BookOpen, Info } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ACTIVITY_OPTIONS,
  activityLabel,
  bmiLabel,
  type PersonalGoal,
} from "@/lib/mealPersonalization";
import { useMealPersonalization } from "@/hooks/useMealPersonalization";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";

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
  const { profile, targets, update, setActivity, setEquationSex, setGoal } =
    useMealPersonalization(userId);
  const [showSources, setShowSources] = useState(false);

  const { foods } = useFoodCatalog();
  const [excludeQuery, setExcludeQuery] = useState("");

  const excludeMatches = excludeQuery.trim()
    ? foods
        .filter(
          (f) =>
            f.name_tr
              .toLocaleLowerCase("tr-TR")
              .includes(excludeQuery.trim().toLocaleLowerCase("tr-TR")) &&
            !profile.excludedFoodIds.includes(f.name_tr)
        )
        .slice(0, 5)
    : [];

  function addExclusion(nameTr: string) {
    update("excludedFoodIds", [...profile.excludedFoodIds, nameTr]);
    setExcludeQuery("");
  }

  function removeExclusion(nameTr: string) {
    update(
      "excludedFoodIds",
      profile.excludedFoodIds.filter((id) => id !== nameTr)
    );
  }

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
        <details className="mt-3" open>
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
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
            <Field label="Hedef" sourceBadge={showSources ? "NIDDK" : undefined}>
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
          Sevmediğin veya yiyemediğin besinleri işaretle — öneriler bunları hiç
          göstermez.
        </p>
        <Input
          className="mt-2"
          placeholder="Besin ara..."
          value={excludeQuery}
          onInput={(event: Event) =>
            setExcludeQuery((event.target as HTMLInputElement).value)
          }
        />
        {excludeMatches.length > 0 && (
          <ul className="mt-1 divide-y divide-border rounded-md border border-border">
            {excludeMatches.map((f) => (
              <li key={f.name_tr}>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => addExclusion(f.name_tr)}>
                  {f.name_tr}
                </button>
              </li>
            ))}
          </ul>
        )}
        {profile.excludedFoodIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.excludedFoodIds.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs">
                {id}
                <button
                  type="button"
                  onClick={() => removeExclusion(id)}
                  aria-label={`${id} hariç tutmayı kaldır`}
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

      <details className="rounded-lg border border-border p-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold">
          <Info className="size-4 text-muted-foreground" />
          Nasıl hesaplanıyor?
        </summary>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <p>
            Mifflin-St Jeor ile bazal metabolizma, aktivite katsayısı ile günlük
            koruma tahmini hesaplanır. Hedef değeri bunun üzerine ölçülü bir
            değişiklik uygular.
          </p>
          <p>
            Bu sonuçlar klinik ölçüm veya tıbbi tavsiye değildir. İlaç, kronik
            hastalık, gebelik, emzirme veya yeme bozukluğu durumlarında
            diyetisyen ya da hekimle görüş.
          </p>
        </div>
      </details>

      <div className="gradient-edge rounded-lg p-px">
        <label className="flex cursor-pointer items-center justify-between rounded-[calc(0.5rem-1px)] bg-background px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            Kaynakları göster
          </span>
          <span className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={showSources}
              onChange={event =>
                setShowSources((event.target as HTMLInputElement).checked)
              }
              className="peer sr-only"
            />
            <span className="h-5 w-9 rounded-full bg-signal/10 transition-colors peer-checked:bg-signal" />
            <span className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-background shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
      </div>

      {showSources && (
        <>
          <SourceConnector />
          <SourceMap />
        </>
      )}
    </div>
  );
}

function Field({
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

function NumberInput({
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
    <div className="gradient-edge rounded-lg p-px">
      <div className="space-y-2 rounded-[calc(0.5rem-1px)] bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="size-4" /> Özellik kaynakları
        </div>
        {SOURCE_GROUPS.map(group => (
          <div
            key={group.feature}
            className="border-t border-border pt-2 text-xs">
            <p className="font-medium text-foreground">{group.feature}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {group.sources.map(source => (
                <a
                  key={`${group.feature}-${source.href}-${source.label}`}
                  className="underline underline-offset-2"
                  href={source.href}
                  target="_blank"
                  rel="noreferrer">
                  <span className="inline-flex items-center gap-1">
                    <SourceBadge label={source.badge} />
                    {source.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceConnector() {
  return (
    <div
      className="flex h-5 items-stretch justify-around px-8"
      aria-hidden="true">
      <span className="w-0.5 border-l-2 border-dashed border-signal/70 bg-signal/10" />
      <span className="w-0.5 border-l-2 border-dashed border-signal/70 bg-signal/10" />
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
