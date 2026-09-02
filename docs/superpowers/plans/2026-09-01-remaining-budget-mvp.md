# Remaining Budget MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Historical record — task 8's "Yedim de" was later renamed to "Yedim" and given a
> "Hazırlanıyor" toggle plus a "Bugün yediklerin"/"Geri al" undo flow (2026-09-02, post-QA
> feedback). This doc describes what was originally planned and built; the current behavior
> is documented in `docs/superpowers/specs/2026-09-01-remaining-budget-mvp-design.md`.

**Goal:** Wire the existing Kişisel Plan targets and Yemek Planı consumption log into a
"remaining today" value, surfaced on a new default home screen ("Bugün") with rule-based
suggestions and one-tap list/log actions.

**Architecture:** A new `useRemainingToday` hook composes two existing hooks
(`useMealPersonalization`, `useMealPlan`) into `{target, consumed, remaining}`. A new pure
function `matchCombos` filters a hand-authored static combo catalog against that remaining
budget and an exclusion list. A new `TodayView` component renders both and reuses two
existing write paths (`listActions.addItem`, `useMealPlan.addItem`) for its two actions — no
new backend endpoints except one additive column.

**Tech Stack:** Preact + TypeScript + Vite, TanStack Query (`@tanstack/preact-query`),
Supabase (via existing Netlify functions), Tailwind v4 utility classes matching existing
components.

**Spec:** `docs/superpowers/specs/2026-09-01-remaining-budget-mvp-design.md`

## Global Constraints

- No test runner in this repo — `npm run build` (`tsc -b`) is the only automated check.
  Every task's verification is: build passes + manual QA via `npm run netlify:dev`.
- No new Netlify function. No AI/LLM call anywhere. `data/combos.json` is dev-edited and
  deployed, not live-edited in-app.
- All new/modified TypeScript must satisfy strict mode (repo's existing `tsc -b` config) —
  no `any`, no unchecked nulls.
- Follow the repo's existing commit convention: `type: short description` (`feat:`, `fix:`,
  `docs:`), no `Co-Authored-By` line needed for intermediate task commits (only for the
  final PR-level commit if one is made — match whatever convention the executing skill uses).
- Reuse existing types (`MacroTotals` from `src/lib/mealNutrition.ts`, `NutritionMap`/
  `Nutrition`/`lookupNutrition` from `src/lib/nutrition.ts`) rather than redefining
  equivalent shapes — this was verified against the actual files, not assumed.

---

### Task 1: Personal plan — excluded foods (schema + type + UI)

**Files:**
- Create: `supabase/10-personal-plan-exclusions.sql`
- Modify: `src/lib/mealPersonalization.ts` (add field to `PersonalProfile`)
- Modify: `src/lib/personalPlan.ts` (row mapping + save payload)
- Modify: `netlify/functions/personal-plan.ts` (select cols + write validation)
- Modify: `src/hooks/useMealPersonalization.ts` (`DEFAULT_PROFILE`)
- Modify: `src/components/PersonalPlanView.tsx` (new "Önerilmesin" section)

**Interfaces:**
- Produces: `PersonalProfile.excludedFoodIds: string[]` — consumed by Task 5
  (`useRemainingToday`) and Task 7 (`comboMatch` call).

- [ ] **Step 1: Add the migration**

```sql
-- supabase/10-personal-plan-exclusions.sql
-- Additive: lets a user mark foods that should never appear in a suggested
-- combo (allergies, dislikes). Defaults to empty so existing rows are valid
-- with no backfill needed. Idempotent: safe to re-run.

alter table public.personal_plan
  add column if not exists excluded_food_ids text[] not null default '{}';
```

Run this against the Supabase project (same process used for prior `supabase/0N-*.sql`
files — apply via the Supabase SQL editor or CLI, per how earlier migrations in this repo
were applied; there is no automated migration runner in this repo).

- [ ] **Step 2: Extend `PersonalProfile`**

In `src/lib/mealPersonalization.ts`, add the field to the type (after `waistCm`):

```ts
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
```

- [ ] **Step 3: Update the client row mapping**

In `src/lib/personalPlan.ts`, extend `PersonalPlanRow` and both directions of the mapping:

```ts
type PersonalPlanRow = {
  user_id: string;
  name: string;
  equation_sex: string;
  age_years: number;
  height_cm: number;
  weight_kg: number;
  activity: string;
  goal: string;
  waist_cm: number | null;
  excluded_food_ids: string[] | null;
};

function fromRow(row: PersonalPlanRow): PersonalProfile {
  return {
    name: row.name,
    equationSex: row.equation_sex as PersonalProfile["equationSex"],
    ageYears: row.age_years,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    activity: row.activity as PersonalProfile["activity"],
    goal: row.goal as PersonalProfile["goal"],
    waistCm: row.waist_cm ?? undefined,
    excludedFoodIds: row.excluded_food_ids ?? [],
  };
}
```

And in `savePersonalPlan`'s request body, add `excluded_food_ids: profile.excludedFoodIds,`
right after the existing `waist_cm: profile.waistCm ?? null,` line.

- [ ] **Step 4: Update the Netlify function**

In `netlify/functions/personal-plan.ts`:

Extend `PersonalPlanRow` the same way as Step 3 (`excluded_food_ids: string[] | null`).

Extend `SELECT_COLS`:
```ts
const SELECT_COLS =
  "user_id,name,equation_sex,age_years,height_cm,weight_kg,activity,goal,waist_cm,excluded_food_ids";
```

In `handleWrite`, add to the body type and parse it defensively (default to `[]` if absent
or malformed — this is a nice-to-have field, not worth a 400 error over):

```ts
let body: {
    name?: unknown;
    equation_sex?: unknown;
    age_years?: unknown;
    height_cm?: unknown;
    weight_kg?: unknown;
    activity?: unknown;
    goal?: unknown;
    waist_cm?: unknown;
    excluded_food_ids?: unknown;
  };
```

```ts
const excludedFoodIds = Array.isArray(body.excluded_food_ids)
  ? body.excluded_food_ids.filter((v): v is string => typeof v === "string")
  : [];
```

Add `excluded_food_ids: excludedFoodIds,` to the `payload` object.

- [ ] **Step 5: Update the default profile**

In `src/hooks/useMealPersonalization.ts`, add to `DEFAULT_PROFILE`:

```ts
const DEFAULT_PROFILE: PersonalProfile = {
  name: "Benim profilim",
  equationSex: "female",
  ageYears: 30,
  heightCm: 170,
  weightKg: 70,
  activity: "moderate",
  goal: "maintain",
  excludedFoodIds: [],
};
```

- [ ] **Step 6: Add the exclusions editor UI**

In `src/components/PersonalPlanView.tsx`, add imports:

```ts
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
```

Add local state near the top of the component body (after `const [showSources, ...]`):

```ts
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
```

Insert a new `<section>` right after the existing Profil `<section>` (before the
`{targets && <TargetSummary .../>}` line):

```tsx
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
```

- [ ] **Step 7: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 8: Manual verification**

Run: `npm run netlify:dev`, open the app, go to Kişisel Plan.
- Search a food in the new "Önerilmesin" box (e.g. "tavuk"), click a result → confirm it
  appears as a chip below.
- Reload the page → confirm the chip is still there (round-tripped through Supabase).
- Click the chip's `×` → confirm it's removed and stays removed after reload.

- [ ] **Step 9: Commit**

```bash
git add supabase/10-personal-plan-exclusions.sql src/lib/mealPersonalization.ts src/lib/personalPlan.ts netlify/functions/personal-plan.ts src/hooks/useMealPersonalization.ts src/components/PersonalPlanView.tsx
git commit -m "feat: add excluded-foods list to Kişisel Plan profile"
```

---

### Task 2: Personal plan — group essential vs. default-filled fields

**Files:**
- Modify: `src/components/PersonalPlanView.tsx`

**Interfaces:**
- Consumes: nothing new (pure UI reorganization of the existing Profil section).
- Produces: nothing new.

**Context:** `DEFAULT_PROFILE` already passes validation (age 30 / height 170 / weight 70
are all within range), so targets already render on first load — the actual problem is that
all 8 fields (name, equation, age, height, weight, waist, activity, goal) are presented as
equally important, when only age/height/weight are the user's own data; the rest are
reasonable defaults the strategy review wants de-emphasized, not gated behind validation.

- [ ] **Step 1: Split the Profil section into two visual groups**

Replace the single `<div className="mt-3 grid grid-cols-2 gap-3">...</div>` block in the
Profil `<section>` with two groups: the required fields stay in the prominent grid; the
default-filled ones move into a `<details>` that's open by default (so nothing is hidden,
just visually secondary) with a label signaling they're pre-filled.

```tsx
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
      onChange={(value) => update("ageYears", value)}
    />
  </Field>
  <Field label="Boy (cm)">
    <NumberInput
      value={profile.heightCm}
      onChange={(value) => update("heightCm", value)}
    />
  </Field>
  <Field label="Kilo (kg)">
    <NumberInput
      value={profile.weightKg}
      onChange={(value) => update("weightKg", value)}
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
        onChange={(event) =>
          setEquationSex(
            (event.target as HTMLSelectElement).value as "female" | "male"
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
        onChange={(value) => update("waistCm", value || undefined)}
      />
    </Field>
    <Field label="Günlük aktivite" sourceBadge={showSources ? "WHO" : undefined}>
      <select
        value={profile.activity}
        onChange={(event) =>
          setActivity(
            (event.target as HTMLSelectElement).value as typeof profile.activity
          )
        }
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
        {ACTIVITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
    <Field label="Hedef" sourceBadge={showSources ? "NIDDK" : undefined}>
      <select
        value={profile.goal}
        onChange={(event) =>
          setGoal((event.target as HTMLSelectElement).value as PersonalGoal)
        }
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
        <option value="maintain">Kilomu korumak</option>
        <option value="loss">Kademeli kilo kaybı</option>
        <option value="gain">Kilo almak / performans</option>
      </select>
    </Field>
  </div>
</details>
```

The `<p className="mt-3 text-xs text-muted-foreground">Denklem seçimi...</p>` disclaimer
line right after stays where it is, unchanged.

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 3: Manual verification**

Run: `npm run netlify:dev`, open Kişisel Plan.
- Confirm name/age/height/weight are immediately visible in the main grid.
- Confirm equation/waist/activity/goal are visible under the "Varsayılan olarak..."
  disclosure (open by default) and still editable — change one, confirm targets update.

- [ ] **Step 4: Commit**

```bash
git add src/components/PersonalPlanView.tsx
git commit -m "style: separate required profile fields from default-filled ones"
```

---

### Task 3: Combo catalog data + types

**Files:**
- Create: `data/combos.json`
- Create: `src/lib/combos.ts`
- Modify: `data/README.md`

**Interfaces:**
- Produces: `Combo` type and the `data/combos.json` file — consumed by Task 4
  (`comboMatch`) and Task 7 (`TodayView`).

- [ ] **Step 1: Create the combo type**

```ts
// src/lib/combos.ts
export type Combo = {
  id: string;
  nameTr: string;
  items: { foodId: string; grams: number }[];
  prepMinutes: number;
  tags: string[];
};
```

- [ ] **Step 2: Author the combo catalog**

Every `food_id` below is a verified `name_tr` value from the current
`data/nutrition.json` (checked directly, not guessed).

```json
[
  {
    "id": "tavuk-pirinc-brokoli",
    "name_tr": "Tavuklu pirinç ve brokoli",
    "items": [
      { "food_id": "tavuk göğsü", "grams": 150 },
      { "food_id": "pirinç", "grams": 150 },
      { "food_id": "brokoli", "grams": 100 }
    ],
    "prep_minutes": 20,
    "tags": ["hizli", "yuksek-protein"]
  },
  {
    "id": "somon-brokoli-zeytinyagi",
    "name_tr": "Somon ve brokoli",
    "items": [
      { "food_id": "somon", "grams": 150 },
      { "food_id": "brokoli", "grams": 100 },
      { "food_id": "zeytinyağı", "grams": 10 }
    ],
    "prep_minutes": 20,
    "tags": ["yuksek-protein", "omega3"]
  },
  {
    "id": "yogurt-muz-ceviz",
    "name_tr": "Yoğurt, muz ve ceviz",
    "items": [
      { "food_id": "yoğurt", "grams": 200 },
      { "food_id": "muz", "grams": 100 },
      { "food_id": "ceviz", "grams": 20 }
    ],
    "prep_minutes": 3,
    "tags": ["hizli", "kahvalti"]
  },
  {
    "id": "yumurta-tam-bugday-domates",
    "name_tr": "Yumurta ve tam buğday ekmeği",
    "items": [
      { "food_id": "yumurta", "grams": 100 },
      { "food_id": "tam buğday ekmeği", "grams": 60 },
      { "food_id": "domates", "grams": 80 }
    ],
    "prep_minutes": 10,
    "tags": ["hizli", "kahvalti"]
  },
  {
    "id": "mercimek-corbasi",
    "name_tr": "Mercimek çorbası malzemeleri",
    "items": [
      { "food_id": "kırmızı mercimek", "grams": 100 },
      { "food_id": "soğan", "grams": 50 },
      { "food_id": "havuç", "grams": 50 }
    ],
    "prep_minutes": 30,
    "tags": ["vejetaryen", "yuksek-lif"]
  },
  {
    "id": "nohutlu-salata",
    "name_tr": "Nohutlu salata",
    "items": [
      { "food_id": "nohut", "grams": 150 },
      { "food_id": "domates", "grams": 100 },
      { "food_id": "salatalık", "grams": 100 },
      { "food_id": "zeytinyağı", "grams": 15 }
    ],
    "prep_minutes": 10,
    "tags": ["hizli", "vejetaryen"]
  },
  {
    "id": "karides-kabak-mantar",
    "name_tr": "Karides ve sebze sote",
    "items": [
      { "food_id": "karides", "grams": 150 },
      { "food_id": "kabak", "grams": 100 },
      { "food_id": "mantar", "grams": 80 }
    ],
    "prep_minutes": 15,
    "tags": ["yuksek-protein", "dusuk-kalori"]
  },
  {
    "id": "hindi-bulgur-patlican",
    "name_tr": "Hindi ve bulgur pilavı",
    "items": [
      { "food_id": "hindi göğsü", "grams": 150 },
      { "food_id": "bulgur", "grams": 150 },
      { "food_id": "patlıcan", "grams": 100 }
    ],
    "prep_minutes": 25,
    "tags": ["yuksek-protein"]
  },
  {
    "id": "beyaz-peynir-tabagi",
    "name_tr": "Beyaz peynirli kahvaltı tabağı",
    "items": [
      { "food_id": "beyaz peynir", "grams": 60 },
      { "food_id": "domates", "grams": 80 },
      { "food_id": "salatalık", "grams": 80 },
      { "food_id": "tam buğday ekmeği", "grams": 50 }
    ],
    "prep_minutes": 5,
    "tags": ["hizli", "kahvalti"]
  },
  {
    "id": "kiyma-makarna-domates",
    "name_tr": "Dana kıyma ve makarna",
    "items": [
      { "food_id": "dana kıyma", "grams": 120 },
      { "food_id": "makarna", "grams": 150 },
      { "food_id": "domates", "grams": 100 }
    ],
    "prep_minutes": 25,
    "tags": ["yuksek-protein"]
  },
  {
    "id": "kuru-fasulye-pirinc",
    "name_tr": "Kuru fasulye ve pirinç",
    "items": [
      { "food_id": "kuru fasulye", "grams": 150 },
      { "food_id": "pirinç", "grams": 100 }
    ],
    "prep_minutes": 15,
    "tags": ["vejetaryen", "yuksek-lif"]
  },
  {
    "id": "somon-patates-ispanak",
    "name_tr": "Somon, patates ve ıspanak",
    "items": [
      { "food_id": "somon", "grams": 150 },
      { "food_id": "patates", "grams": 200 },
      { "food_id": "ıspanak", "grams": 80 }
    ],
    "prep_minutes": 30,
    "tags": ["yuksek-protein"]
  },
  {
    "id": "badem-kuru-uzum",
    "name_tr": "Badem ve kuru üzüm",
    "items": [
      { "food_id": "badem", "grams": 30 },
      { "food_id": "kuru üzüm", "grams": 30 }
    ],
    "prep_minutes": 1,
    "tags": ["hizli", "ara-ogun", "atistirmalik"]
  },
  {
    "id": "kasarli-omlet",
    "name_tr": "Kaşarlı omlet",
    "items": [
      { "food_id": "yumurta", "grams": 150 },
      { "food_id": "kaşar peyniri", "grams": 30 },
      { "food_id": "yeşil biber", "grams": 50 }
    ],
    "prep_minutes": 10,
    "tags": ["hizli", "kahvalti"]
  },
  {
    "id": "tavuk-karnabahar",
    "name_tr": "Tavuk ve karnabahar",
    "items": [
      { "food_id": "tavuk göğsü", "grams": 150 },
      { "food_id": "karnabahar", "grams": 150 },
      { "food_id": "zeytinyağı", "grams": 10 }
    ],
    "prep_minutes": 20,
    "tags": ["dusuk-karbon", "yuksek-protein"]
  },
  {
    "id": "elma-ceviz",
    "name_tr": "Elma ve ceviz",
    "items": [
      { "food_id": "elma", "grams": 150 },
      { "food_id": "ceviz", "grams": 20 }
    ],
    "prep_minutes": 1,
    "tags": ["hizli", "ara-ogun"]
  }
]
```

Save this as `data/combos.json`.

- [ ] **Step 3: Document the shape in `data/README.md`**

Append a new section at the end of `data/README.md`:

```markdown
## `combos.json`

Hand-authored meal-combo suggestions used by the "Bugün" recommendation engine
(`src/lib/comboMatch.ts`). Each row:

- `id` — stable string id.
- `name_tr` — display name.
- `items` — `{ food_id, grams }[]`. `food_id` must be an existing `name_tr` value in
  `nutrition.json` (checked at suggestion time via `lookupNutrition`; a combo with an
  unmatched `food_id` is silently skipped rather than shown with wrong totals).
- `prep_minutes` — rough hands-on time.
- `tags` — free-form, not filtered on yet; informational only for now.

Unlike `nutrition.json`, this file is not uploaded to Supabase — it's bundled directly into
the client build and edited by hand.
```

- [ ] **Step 4: Typecheck**

Run: `npm run build`
Expected: no type errors (this task adds no code that's imported anywhere yet, so this
mainly confirms the JSON is syntactically valid — `tsc` will fail the build if
`data/combos.json` doesn't parse once Task 4 imports it, but for this task alone, running a
quick parse check is enough):

Run: `node -e "JSON.parse(require('fs').readFileSync('data/combos.json', 'utf8')); console.log('valid json, ' + JSON.parse(require('fs').readFileSync('data/combos.json', 'utf8')).length + ' combos')"`
Expected: prints `valid json, 16 combos`.

- [ ] **Step 5: Commit**

```bash
git add data/combos.json src/lib/combos.ts data/README.md
git commit -m "feat: add hand-authored combo catalog for meal suggestions"
```

---

### Task 4: Combo matching logic

**Files:**
- Create: `src/lib/comboMatch.ts`

**Interfaces:**
- Consumes: `Combo` (Task 3), `MacroTotals`/`sumMacros`/`scaleNutrition` (existing,
  `src/lib/mealNutrition.ts`), `NutritionMap`/`lookupNutrition` (existing,
  `src/lib/nutrition.ts`).
- Produces: `matchCombos(combos, remaining, excludedFoodIds, catalog): ScoredCombo[]` —
  consumed by Task 7 (`TodayView`).

- [ ] **Step 1: Write the module**

```ts
// src/lib/comboMatch.ts
import { lookupNutrition, type NutritionMap } from "./nutrition";
import { scaleNutrition, sumMacros, type MacroTotals } from "./mealNutrition";
import type { Combo } from "./combos";

export type ScoredCombo = Combo & { totals: MacroTotals };

function comboTotals(combo: Combo, catalog: NutritionMap): MacroTotals | null {
  const parts: MacroTotals[] = [];
  for (const item of combo.items) {
    const nutrition = lookupNutrition(catalog, item.foodId);
    // A combo referencing a food missing from the catalog would otherwise show
    // wrong (partial) totals — skip the whole combo instead.
    if (!nutrition) return null;
    parts.push(scaleNutrition(nutrition, item.grams));
  }
  return sumMacros(parts);
}

// Deterministic, no AI: filters out anything excluded or over the remaining kcal
// budget, then ranks by protein — the macro this app's target persona finds
// hardest to hit without deliberate planning. Returns at most 5.
export function matchCombos(
  combos: Combo[],
  remaining: MacroTotals,
  excludedFoodIds: string[],
  catalog: NutritionMap
): ScoredCombo[] {
  if (remaining.kcal <= 0) return [];

  const scored: ScoredCombo[] = [];
  for (const combo of combos) {
    if (combo.items.some((item) => excludedFoodIds.includes(item.foodId))) continue;
    const totals = comboTotals(combo, catalog);
    if (!totals) continue;
    if (totals.kcal > remaining.kcal) continue;
    scored.push({ ...combo, totals });
  }

  scored.sort((a, b) => b.totals.proteinG - a.totals.proteinG);
  return scored.slice(0, 5);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 3: Manual trace-through verification**

No test runner exists in this repo, so verify by hand-tracing one case and confirming the
build's type system agrees with the shapes used — this is the same posture as the rest of
this repo's pure-logic modules (e.g. `fuzzyMatch.ts`, `categories.ts` have no dedicated test
files either).

Trace: with `remaining = {kcal: 500, proteinG: 40, fatG: 20, carbsG: 60, fiberG: 10}`,
`excludedFoodIds = []`, and a `catalog` containing all 64 `data/nutrition.json` rows keyed
by `name_tr` — combo `tavuk-pirinc-brokoli` totals to roughly
`150g tavuk göğsü (180 kcal, 33.75g protein) + 150g pirinç (547.5 kcal, ...)` — note this
specific combo's rice portion alone exceeds 500 kcal, so it would correctly be filtered out
at this remaining budget; a smaller-portion or leaner combo (e.g. `karides-kabak-mantar` at
~150g karides + 100g kabak + 80g mantar, well under 500 kcal) should survive and rank by
protein. This confirms the kcal filter and protein sort are wired correctly by construction
of the function — full behavioral confidence comes from Task 7's manual QA once this is
wired into the running UI.

- [ ] **Step 4: Commit**

```bash
git add src/lib/comboMatch.ts
git commit -m "feat: add rule-based combo matching against remaining macros"
```

---

### Task 5: `useRemainingToday` hook

**Files:**
- Create: `src/hooks/useRemainingToday.ts`

**Interfaces:**
- Consumes: `useMealPersonalization` (existing, `src/hooks/useMealPersonalization.ts`),
  `useMealPlan` (existing, `src/hooks/useMealPlan.ts`), `useFoodCatalog` (existing,
  `src/hooks/useFoodCatalog.ts`), `MacroTotals`/`sumMacros` (existing,
  `src/lib/mealNutrition.ts`), `PersonalTargets` (existing,
  `src/lib/mealPersonalization.ts`), `MealSlot` (existing, `src/lib/localMealPlan.ts`).
- Produces: `useRemainingToday(userId, householdId): RemainingToday` — consumed by Task 6
  (shell) and Task 7/8 (`TodayView` actions). `RemainingToday` is a discriminated union on
  `status`; both branches expose `catalogMap` and `logConsumption` so callers don't need to
  branch just to read those.

- [ ] **Step 1: Write the hook**

```ts
// src/hooks/useRemainingToday.ts
import { useMealPersonalization } from "./useMealPersonalization";
import { useMealPlan } from "./useMealPlan";
import { useFoodCatalog } from "./useFoodCatalog";
import type { MacroTotals } from "@/lib/mealNutrition";
import type { PersonalTargets } from "@/lib/mealPersonalization";
import type { NutritionMap } from "@/lib/nutrition";
import type { MealSlot } from "@/lib/localMealPlan";

export type RemainingToday =
  | {
      status: "no-profile";
      catalogMap: NutritionMap;
      logConsumption: (foodId: string, grams: number) => void;
    }
  | {
      status: "ready";
      target: MacroTotals;
      consumed: MacroTotals;
      remaining: MacroTotals;
      excludedFoodIds: string[];
      catalogMap: NutritionMap;
      logConsumption: (foodId: string, grams: number) => void;
    };

// Target ranges (protein/fat/carbs/fiber) collapse to their midpoint for a
// single "remaining" number — the range itself stays visible in Kişisel Plan.
function targetToMacros(targets: PersonalTargets): MacroTotals {
  return {
    kcal: targets.targetKcal,
    proteinG: (targets.proteinG.min + targets.proteinG.max) / 2,
    fatG: (targets.fatG.min + targets.fatG.max) / 2,
    carbsG: (targets.carbsG.min + targets.carbsG.max) / 2,
    fiberG: (targets.fiberG.min + targets.fiberG.max) / 2,
  };
}

function subtractMacros(target: MacroTotals, consumed: MacroTotals): MacroTotals {
  return {
    kcal: target.kcal - consumed.kcal,
    proteinG: target.proteinG - consumed.proteinG,
    fatG: target.fatG - consumed.fatG,
    carbsG: target.carbsG - consumed.carbsG,
    fiberG: target.fiberG - consumed.fiberG,
  };
}

// Starting guess (per the design spec's Open Items) — morning/midday/evening/late
// map to breakfast/lunch/dinner/snack. Tune once real usage shows how people
// actually use "Yedim de" at different times of day.
function inferSlot(now: Date = new Date()): MealSlot {
  const hour = now.getHours();
  if (hour < 11) return "kahvalti";
  if (hour < 15) return "ogle";
  if (hour < 21) return "aksam";
  return "ara";
}

export function useRemainingToday(
  userId: string | null,
  householdId: string | null
): RemainingToday {
  const { targets, profile } = useMealPersonalization(userId);
  const { catalogMap } = useFoodCatalog();
  const { dailyNutrition, addItem } = useMealPlan(householdId, catalogMap);

  function logConsumption(foodId: string, grams: number) {
    addItem(inferSlot(), foodId, grams);
  }

  if (!targets) {
    return { status: "no-profile", catalogMap, logConsumption };
  }

  const target = targetToMacros(targets);
  const consumed = dailyNutrition();
  const remaining = subtractMacros(target, consumed);

  return {
    status: "ready",
    target,
    consumed,
    remaining,
    excludedFoodIds: profile.excludedFoodIds,
    catalogMap,
    logConsumption,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 3: Manual verification**

This hook has no UI yet — full manual verification happens in Task 6 once it's rendered.
For this task, confirm via the type checker only (Step 2) plus a quick read-through: the
hook calls exactly one `useMealPersonalization` and one `useMealPlan` instance (no duplicate
instances that would cause double-fetching or racing debounced saves — this was the reason
`logConsumption` wraps the *same* `addItem` returned by this hook's own `useMealPlan` call
rather than a second one).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useRemainingToday.ts
git commit -m "feat: add useRemainingToday hook combining targets and consumption"
```

---

### Task 6: TodayView shell — remaining summary + new tab

**Files:**
- Create: `src/components/TodayView.tsx`
- Modify: `src/hooks/useUiPrefs.ts` (add `"today"` to `Tab`, keep default `"list"` for now)
- Modify: `src/components/AppShoppingTabs.tsx` (new `TabsContent value="today"`)
- Modify: `src/components/AppHeader.tsx` (new `TabsTrigger value="today"`, placed first)

**Interfaces:**
- Consumes: `useRemainingToday` (Task 5).
- Produces: `TodayView` component, rendering the no-profile and remaining-summary states
  only (no suggestions yet — Task 7 adds those to the same file).

- [ ] **Step 1: Write the shell component**

```tsx
// src/components/TodayView.tsx
import { useRemainingToday } from "@/hooks/useRemainingToday";
import type { MacroTotals } from "@/lib/mealNutrition";

type Props = {
  userId: string | null;
  householdId: string | null;
};

export function TodayView({ userId, householdId }: Props) {
  const remaining = useRemainingToday(userId, householdId);

  if (remaining.status === "no-profile") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman
        gerekiyor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RemainingSummary remaining={remaining.remaining} />
    </div>
  );
}

function RemainingSummary({ remaining }: { remaining: MacroTotals }) {
  const rows: [string, number][] = [
    ["Kalori", remaining.kcal],
    ["Protein", remaining.proteinG],
    ["Yağ", remaining.fatG],
    ["Karbonhidrat", remaining.carbsG],
    ["Lif", remaining.fiberG],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border p-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p
            className={`ledger text-lg font-semibold ${value < 0 ? "text-signal" : ""}`}>
            {Math.round(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add the tab value**

In `src/hooks/useUiPrefs.ts`, change:

```ts
export type Tab = "today" | "list" | "history" | "find" | "cats";
const TABS: Tab[] = ["today", "list", "history", "find", "cats"];
```

Leave `initialTab()`'s fallback as `"list"` for now (Task 9 flips this).

- [ ] **Step 3: Add the tab trigger**

In `src/components/AppHeader.tsx`, add a new first trigger before the existing `list` one
(around line 220):

```tsx
<TabsTrigger value="today">Bugün</TabsTrigger>
<TabsTrigger value="list">Liste</TabsTrigger>
```

- [ ] **Step 4: Wire the tab content**

In `src/components/AppShoppingTabs.tsx`:

Add the import:
```ts
import { TodayView } from "@/components/TodayView";
```

Add `userId: string | null;` to `Props` (needed by `TodayView`; `householdId` is already
available via the existing `active: List` — actually check: `active` is a `List`, not the
household id. Add `householdId: string | null;` to `Props` too, since `TodayView` needs it
independently of `active`).

Destructure both in the function signature (`userId, householdId,` added to the existing
destructured props list), and add a new `TabsContent` as the first one, before the existing
`<TabsContent value="list">`:

```tsx
<TabsContent value="today">
  <TodayView userId={userId} householdId={householdId} />
</TabsContent>
```

- [ ] **Step 5: Pass the new props from `App.tsx`**

Verified directly in `App.tsx`: the component receives `currentUserId: string | null` as a
prop (from `session.userId`, line 41) and already computes `activeTenantId` (line 65),
already passed as `<PersonalPlanView userId={currentUserId} />` (line 178) and
`<MealPlanView householdId={activeTenantId} />` (line 176). Find where `<AppShoppingTabs`
is rendered (around line 180-182, where `onAddItem={addItem}` is already passed) and add:

```tsx
<AppShoppingTabs
  ...
  userId={currentUserId}
  householdId={activeTenantId}
  onAddItem={addItem}
  ...
/>
```

- [ ] **Step 6: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 7: Manual verification**

Run: `npm run netlify:dev`, open the app.
- Confirm a new "Bugün" tab appears first in the Alışveriş sub-tabs, before "Liste".
- Click it. Without a Kişisel Plan profile: confirm the setup prompt shows.
- Fill in Kişisel Plan, return to "Bugün": confirm 5 tiles (Kalori/Protein/Yağ/Karbonhidrat/
  Lif) show numbers matching Kişisel Plan's target (since nothing's logged yet, remaining
  should equal target).
- Confirm "Liste" is still the tab that opens by default (Task 9 changes this).

- [ ] **Step 8: Commit**

```bash
git add src/components/TodayView.tsx src/hooks/useUiPrefs.ts src/components/AppShoppingTabs.tsx src/components/AppHeader.tsx src/App.tsx
git commit -m "feat: add Bugün tab showing today's remaining nutrition budget"
```

---

### Task 7: Suggestion cards + "Listeye ekle"

**Files:**
- Modify: `src/components/TodayView.tsx`

**Interfaces:**
- Consumes: `matchCombos` (Task 4), `data/combos.json` (Task 3), `onAddItem` (existing,
  already threaded through `AppShoppingTabs` → now also to `TodayView`).
- Produces: suggestion list rendering + the "Listeye ekle" action.

- [ ] **Step 1: Add the `onAddItem` prop**

In `src/components/TodayView.tsx`, extend `Props`:

```ts
type Props = {
  userId: string | null;
  householdId: string | null;
  onAddItem: (name: string, qty: string) => void;
};
```

Update the function signature to destructure `onAddItem` too.

- [ ] **Step 2: Import the combo catalog and matcher**

```ts
import { useMemo } from "react";
import { matchCombos, type ScoredCombo } from "@/lib/comboMatch";
import combosData from "../../data/combos.json";
import type { Combo } from "@/lib/combos";

const COMBOS = combosData as Combo[];
```

- [ ] **Step 3: Compute and render suggestions**

Inside `TodayView`, after the `remaining` hook call and before the no-profile early return,
nothing changes — the `useMemo` for suggestions must come after the early return check
would normally trip a "hooks after conditional return" lint issue, so instead compute
suggestions guarded by a status check inside the memo itself (keeping the hook call
unconditional, which is the actual React rule):

```tsx
export function TodayView({ userId, householdId, onAddItem }: Props) {
  const remaining = useRemainingToday(userId, householdId);

  const suggestions = useMemo<ScoredCombo[]>(() => {
    if (remaining.status !== "ready") return [];
    return matchCombos(
      COMBOS,
      remaining.remaining,
      remaining.excludedFoodIds,
      remaining.catalogMap
    );
  }, [remaining]);

  if (remaining.status === "no-profile") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Bugün için önerilerin olsun diye önce Kişisel Plan'ını doldurman
        gerekiyor.
      </div>
    );
  }

  function addComboToList(combo: ScoredCombo) {
    for (const item of combo.items) {
      onAddItem(item.foodId, `${item.grams}g`);
    }
  }

  return (
    <div className="space-y-4">
      <RemainingSummary remaining={remaining.remaining} />
      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bugünkü bütçene uyan hazır bir kombinasyon yok — az kaldıysa bu
          normal.
        </p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((combo) => (
            <li key={combo.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{combo.nameTr}</span>
                <span className="text-xs text-muted-foreground">
                  {combo.prepMinutes} dk
                </span>
              </div>
              <p className="ledger mt-1 text-xs text-muted-foreground">
                {Math.round(combo.totals.kcal)} kcal ·{" "}
                {Math.round(combo.totals.proteinG)}g protein
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => addComboToList(combo)}
                  className="rounded-md border border-border px-2 py-1 text-xs">
                  Listeye ekle
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

(This replaces the shell's `return` block from Task 6 — the `RemainingSummary` function
below it stays unchanged.)

- [ ] **Step 4: Pass `onAddItem` down in `AppShoppingTabs.tsx`**

Update the `<TodayView>` call from Task 6, Step 4:

```tsx
<TodayView userId={userId} householdId={householdId} onAddItem={onAddItem} />
```

(`onAddItem` is already a prop `AppShoppingTabs` receives — no new prop needed here, just
pass the existing one through.)

- [ ] **Step 5: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 6: Manual verification**

Run: `npm run netlify:dev`, open "Bugün" with a Kişisel Plan profile set.
- Confirm up to 5 suggestion cards render, each fitting within the remaining kcal shown
  above (spot-check one by hand: e.g. "Badem ve kuru üzüm" should be far under budget for
  most targets and should rank near the top only if its protein-per-serving beats leaner
  competing combos — otherwise confirm the sort still looks protein-descending).
- Click "Listeye ekle" on one combo → switch to the "Liste" tab → confirm its ingredients
  (with correct gram quantities, e.g. "150g" as the qty) were added.
- In Kişisel Plan, exclude one of a suggested combo's ingredients (e.g. "tavuk göğsü") →
  return to "Bugün" → confirm any combo containing it disappears from suggestions.

- [ ] **Step 7: Commit**

```bash
git add src/components/TodayView.tsx src/components/AppShoppingTabs.tsx
git commit -m "feat: show combo suggestions on Bugün with listeye-ekle action"
```

---

### Task 8: "Yedim de" action

**Files:**
- Modify: `src/components/TodayView.tsx`

**Interfaces:**
- Consumes: `remaining.logConsumption` (Task 5, already returned by `useRemainingToday`).
- Produces: the "Yedim de" button and its handler.

- [ ] **Step 1: Add the handler and button**

In `src/components/TodayView.tsx`, add next to `addComboToList`:

```ts
function logComboEaten(combo: ScoredCombo) {
  for (const item of combo.items) {
    remaining.logConsumption(item.foodId, item.grams);
  }
}
```

(This references `remaining.logConsumption` — valid here because `remaining.status ===
"ready"` has already been established by the point this function is defined, same scope as
`addComboToList`. TypeScript narrows `remaining` to the `"ready"` branch within this closure
because the function is defined after the early `no-profile` return.)

Add the second button next to "Listeye ekle" inside the suggestion card's action row:

```tsx
<div className="mt-2 flex gap-2">
  <button
    type="button"
    onClick={() => addComboToList(combo)}
    className="rounded-md border border-border px-2 py-1 text-xs">
    Listeye ekle
  </button>
  <button
    type="button"
    onClick={() => logComboEaten(combo)}
    className="rounded-md border border-border px-2 py-1 text-xs">
    Yedim de
  </button>
</div>
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 3: Manual verification**

Run: `npm run netlify:dev`, open "Bugün" with a profile set and at least one suggestion
showing.
- Note the current "Kalori" remaining value.
- Click "Yedim de" on a suggestion.
- Confirm the remaining-summary numbers update immediately (kcal/protein/etc. all drop by
  roughly the combo's totals shown on its card), without a manual page reload.
- Switch to "Yemek Planı" → confirm the combo's ingredients appear as new entries in the
  time-appropriate slot (e.g. logged at 19:00 should land in "Akşam").
- Reload the page, return to "Bugün" → confirm the reduced remaining value persisted (came
  back from the server, not just local state).
- Keep clicking "Yedim de" until at least one remaining value goes negative → confirm it
  displays as a negative number in the distinct (signal-colored) style, not clamped to zero
  or hidden — this is the spec's explicit "don't hide over-budget days" requirement.
- Once remaining kcal itself goes to zero or below → confirm the suggestion list switches to
  the "Bugünkü bütçene uyan hazır bir kombinasyon yok" empty state rather than continuing to
  show combos that no longer fit.

- [ ] **Step 4: Commit**

```bash
git add src/components/TodayView.tsx
git commit -m "feat: add yedim-de action logging a suggestion as consumed"
```

---

### Task 9: Make "Bugün" the default tab

**Files:**
- Modify: `src/hooks/useUiPrefs.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: changed default landing behavior — the final piece tying the whole MVP
  together into the loop described in the spec.

- [ ] **Step 1: Flip the default**

In `src/hooks/useUiPrefs.ts`, change `initialTab()`:

```ts
function initialTab(): Tab {
  const fromUrl = readTabFromUrl();
  return (TABS as string[]).includes(fromUrl ?? "") ? (fromUrl as Tab) : "today";
}
```

(Only the fallback value changes, from `"list"` to `"today"`.)

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: no type errors.

- [ ] **Step 3: Manual verification**

Run: `npm run netlify:dev`.
- Open the app fresh (clear the `tab` URL query param, or open in a new private window) →
  confirm it lands on "Bugün", not "Liste".
- Confirm a direct link with `?tab=list` still opens directly to "Liste" (URL override still
  works).
- Click through all 5 sub-tabs once more end to end as a final sanity pass.
- Whole-loop check (covers the spec's documented multi-user limitation): if two Google
  accounts are available, invite the second into the household (TenantSwitcher's existing
  share-by-email flow), set a Kişisel Plan profile for each, and log a meal as one user.
  Confirm the other user's "Bugün" reflects their *own* target minus the *same* shared
  household consumption log (both see the same `consumed`, each sees their own `target` and
  therefore a different `remaining`) — this is the documented behavior, not a bug, but
  confirm it doesn't crash or silently show one user's target to the other.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useUiPrefs.ts
git commit -m "feat: make Bugün the default landing tab"
```

---

## Self-Review Notes

- **Spec coverage:** All six spec parts (A–F) map to tasks — A→5, B→6/7/8/9, C→3, D→7/8,
  E→1, F→2. The spec's "Architecture" data-flow diagram is realized exactly as drawn:
  `useRemainingToday` internally owns the single `useMealPlan` instance that both
  `dailyNutrition()` (for `consumed`) and `logConsumption` (for "Yedim de") read/write,
  which is what makes the remaining numbers update in place after "Yedim de" without a
  second, out-of-sync `useMealPlan` instance.
- **Type consistency:** `MacroTotals`, `NutritionMap`, `Nutrition`, `MealSlot` are reused
  from their existing source files throughout rather than redefined — verified against the
  actual files (`mealNutrition.ts`, `nutrition.ts`, `localMealPlan.ts`) during planning, not
  assumed. `Combo`/`ScoredCombo` are the only new shared types, defined once in
  `combos.ts`/`comboMatch.ts` and used identically in every later task.
- **No placeholders:** every step has real code; the only forward reference is Task 6 Step 5
  asking the implementer to match `App.tsx`'s *existing* variable names for user/tenant id
  rather than guessing them — flagged explicitly as something to verify against the actual
  file rather than left silently wrong.
