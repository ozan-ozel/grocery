import { BookOpen, ChevronRight, ExternalLink } from "lucide-react";
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
import { useDetailsTransition } from "@/hooks/useDetailsTransition";
import { cn } from "@/lib/utils";

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
  const [howOpen, setHowOpen] = useState(false);
  const howDetails = useDetailsTransition<HTMLElement>();
  const sourcesDetails = useDetailsTransition<HTMLElement>();

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

      <div
        className="glow-signal rounded-lg">
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
              : "border-signal-solid"
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
                Mifflin-St Jeor formülü — 9.99×Kilo + 6.25×Boy − 4.92×Yaş,
                artı denklem seçimine göre erkek katsayısı (+5) ya da kadın
                katsayısı (−161).
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
                Kademeli kilo kaybında koruma −400 kcal, kilo
                alma/performansta +250 kcal; kilomu korumak seçiliyse
                değişmez. Hedef hiçbir zaman 1200 kcal'in altına inmez.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Protein / Yağ / Karbonhidrat / Lif aralıkları:
                </span>{" "}
                hedef kaloriye göre DRI aralıklarından türetilir — yağ
                hedefin %20-35'i, karbonhidrat %45-65'i, protein kilo başına
                1.2g (temel), 1.6g (aktif/çok aktif ya da kilo alma
                hedefinde) veya 2.0g (kilo verme hedefinde, kas kütlesini
                korumak için), lif her 1000 kcal için ~14g.
              </li>
            </ul>
            <p>
              Bu sonuçlar klinik ölçüm veya tıbbi tavsiye değildir. İlaç,
              kronik hastalık, gebelik, emzirme veya yeme bozukluğu
              durumlarında diyetisyen ya da hekimle görüş.
            </p>
          </div>
        </details>
      </div>

      <div
        className="glow-signal rounded-lg">
        <details
          open={showSources}
          onToggle={event => {
            const opened = (event.target as HTMLDetailsElement).open;
            setShowSources(opened);
            sourcesDetails.onToggle(opened);
          }}
          className={cn(
            "group rounded-lg",
            showSources ? "border-gradient-edge" : "border-signal-solid"
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
