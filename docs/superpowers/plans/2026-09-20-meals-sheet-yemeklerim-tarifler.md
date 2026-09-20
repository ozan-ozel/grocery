# Yemekler Sheet: Yemeklerim, Hazır Yemekler, Tarifler ("Sana uygun") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Haiku 4.5 — every file below is given in full or as an exact diff, and **all of
it was typechecked and built (`tsc -b`, `tsc -p api/tsconfig.json`, `vite build`) in a scratch copy of
`master` before this plan was written**. No design decisions are left to the implementer. If a step's
code doesn't typecheck in your tree, fix it to satisfy `tsc` — don't redesign.

**Scope:** Frontend + one small backend addition (a `saved_meals` table, and a `saved-meals`
resource inside the existing `api/personal-plan.ts`). Everything else is reuse.

**Goal:** Tapping **Yemekler** on any meal card opens the existing bottom sheet, now with three tabs:

- **Yemeklerim** — the user's own reusable meals. Create one once ("Antrenman akşamı" = 180 g tavuk +
  150 g pirinç + 150 g sebze), then add it to any slot in one tap at its saved grams.
- **Hazır Yemekler** — the built-in meals, exactly as today, with a small **Sana uygun** block on top
  (3–4 deterministic, budget-fit suggestions for the slot being filled).
- **Tarifler** — any meal that has preparation steps: the user's own (optional "Hazırlama adımları
  ekle" when creating a meal) plus the built-in meals that already carry a `prepNote`. A recipe is
  **not** a second kind of object — it is a meal with steps, so nothing is entered twice.

The Meal Plan page itself does **not** change: each card keeps only `Ürünler` and `Yemekler`.

**Architecture:** One saved-meal entity (`SavedMeal`: name + items + optional `steps`) stored per
user, exposed to the UI through an adapter (`savedMealToCombo`) that makes it look like a `Combo`, so
every existing meal helper (`scoreAllCombos`, `scaledComboTotals`, the row UI, `handleComboSelect`) works
on it unchanged. The sheet component `RecipeSearchModal` (which shows *meals*, and would collide with
"Tarifler") is replaced by `MealsSheet`, built from a shared `MealRow`. "Sana uygun" is a pure function
(`lib/mealRecommend.ts`) over the already-computed meal list: slot filter → slot budget → best portion
tier per meal (reusing `scoreInstance` from the evening engine) → rank. Adding a meal still writes the
same flat `meal_entries` rows through `useMealPlan.addItem`; the saved meal's id goes in `combo_id` as
provenance, like a built-in combo's does.

**Tech Stack:** Preact (via `react` alias), TanStack Query, Tailwind v4 tokens, existing
`BottomSheet` / `SmoothPillTabs` / `Button` / `Input` / `MealFoodPicker` / `ConfirmModal`.

**Spec:** No separate spec. Derived from the product owner's 2026-09-20 information-architecture
decision (Meals / My Meals / Ready Meals / Recommendations / Recipes) and the audit of the same day.
Ground truth for the existing code: `src/components/RecipeSearchModal.tsx` (being replaced),
`src/components/MealPlanView.tsx`, `src/lib/combos.ts`, `src/lib/comboMatch.ts`,
`src/lib/eveningRecommend.ts`, `src/hooks/useBatches.ts`, `api/personal-plan.ts`,
`docs/mvp-scope/meal-construction-mvp.md`.

**Supersedes:** `docs/superpowers/plans/2026-09-12-saved-meal-templates.md` (household-scoped
`meal_templates` + a new `api/meal-templates.ts`, which the 12-function limit rules out). Task 7 marks it
`SUPERSEDED` in the plans index.

## Decisions this plan assumes — confirm before starting

These were open questions; the plan uses the recommended answer for each. If the owner changes one, the
task named in brackets is what changes.

1. **Yemeklerim is per user**, not per household (matches `personal_plan`; exclusions are personal).
   [Task 3: table key, RLS, API filter]
2. **DEC-067 is re-scoped, not overturned.** User-authored steps are the user's *own content*
   (display-only, free text, no safety guidance); Grocery's curated meals stay at Level 1. The owner must
   confirm this reading. [Task 7 wording]
3. **The API lives inside `api/personal-plan.ts`** behind a `vercel.json` rewrite (`/api/saved-meals`),
   because the project is at 12/12 functions. [Task 3]
4. **Saved-meal rows have no Küçük/Normal/Büyük chips** — a tap adds the saved grams; only the custom
   multiplier pencil is offered. The form has **Kaydet** and **Kaydet ve ekle**. [Tasks 5]
5. **A "Sana uygun" row's body tap adds at its *recommended* tier and does not change the remembered
   last-used tier.** The remembered-tier behavior everywhere else is untouched. [Task 5, `MealRow`]
6. **The unused combo tags are dropped**; only `kahvalti`, `ara-ogun`, `atistirmalik` remain (the slot
   filter reads them). [Task 1]
7. **The page-level "Akşam için öneriler" section stays** as it is. Whether to merge it into "Sana uygun"
   is a later decision after real use.

## Global Constraints

- **No test suite, no test files, no test framework — ever** (CLAUDE.md). Verify with
  `npm run build` (`tsc -b && vite build`), `npx tsc -p api/tsconfig.json --noEmit`, and by exercising the
  app (Task 6).
- **Do not commit, merge or push.** Implement and verify, then stop; the user commits after testing. Work
  on a new branch `feature/meals-sheet-yemeklerim-tarifler` cut from an up-to-date `master` — never on
  `master`, no worktrees. If the working tree has unrelated uncommitted changes, stop and tell the user.
- `foodId` / `food_id` everywhere in this plan is `nutrition.name_tr`, **never** the opaque
  `Nutrition.food_id` UUID (`src/lib/preparationBatch.ts` header). Look foods up with
  `catalog.get(foodId)` / `lookupNutrition`.
- Hard-tier exclusions (allergy / unclear / unclassified / preference) are never *offered*. Built-in
  meals get this from `scoreAllCombos`; saved meals go through `annotateSavedMeals`, which shows a
  blocked meal disabled with a reason instead of silently dropping it.
- **Do not add a file under `api/`.** The project is at exactly 12 deployable functions
  (`.vercelignore` already excludes `agent-login` and `_auth-test-login`).
- All user-visible copy is Turkish. Use the strings in this plan exactly.
- Use only existing design tokens/classes (`bg-card`, `border-border`, `text-muted-foreground`,
  `text-signal`, `ledger`, `bg-accent`, …). No new colors, no new CSS.
- Bottom sheets are built on `src/components/ui/bottom-sheet.tsx` and mounted only while open. Scrolling
  regions get `min-h-0 overflow-y-auto overscroll-contain`. A `ConfirmModal` opened from inside a sheet
  needs `onTop` (Task 4) or it renders behind the sheet.
- `tsconfig` has `noUnusedLocals` + `noUnusedParameters`: leave no unused imports or params.
- Preserve each file's existing line endings (the working copy is CRLF on Windows; git normalizes).
- **Do not change:** the remembered last-used portion behavior (`grocery.mealPortion.v1`), the
  "Akşam için öneriler" section, the meal cards' two buttons, the Ürünler picker, the `"today"` tab value in
  `useUiPrefs.ts`, or the two "Ara Öğün" card labels (a known oddity: the lunch slot is labeled "Ara" —
  this plan keys off slot **ids**, never labels).
- Supabase migration `28-saved-meals.sql` is **run by the human** in the Supabase SQL editor. You do not
  run SQL. Task 6 starts with a stop-and-ask for it.
- Playwright / local login: follow `CLAUDE.md` exactly (plain tools first, `agent-login` mint/redeem, check
  `:3000` before starting anything, never a second dev server, restore the `.vercelignore` line, throwaway
  accounts for anything destructive).

---

## File Structure

New:
- `supabase/28-saved-meals.sql` — the table + RLS.
- `src/lib/mealRecommend.ts` — "Sana uygun" (pure).
- `src/lib/savedMeals.ts` — `SavedMeal` type, `Combo` adapter, validation, blocked-meal annotation, API client.
- `src/hooks/useSavedMeals.ts` — TanStack Query hook (list + create/update/remove).
- `src/components/MealCompositionEditor.tsx` — foods + grams editor, shared with the batch form.
- `src/components/MealRow.tsx` — one meal row (extracted from the old sheet) + recipe steps.
- `src/components/SavedMealForm.tsx` — "Yeni Yemek" / edit form.
- `src/components/MealsSheet.tsx` — the three-tab sheet (replaces `RecipeSearchModal.tsx`).

Modified: `src/lib/combos.ts`, `src/lib/comboMatch.ts`, `api/personal-plan.ts`, `vercel.json`,
`src/components/ConfirmModal.tsx`, `src/components/BatchCreateForm.tsx`,
`src/components/MealPlanView.tsx`, and (cleanup) `src/components/FoodSearchModal.tsx`,
`src/hooks/useRemainingToday.ts`, `data/combos.json`, `data/README.md`.

Deleted: `src/components/RecipeSearchModal.tsx`, `src/components/MealTrackingView.tsx`.

Data flow:

```
MealPlanView
  ├─ useSavedMeals(userId) ───────────────► savedMeals (prefetched, so the sheet opens instantly)
  ├─ scoreAllCombos(ALL_COMBOS, exclusions) ► combos (built-in meals, totals, exclusions applied)
  ├─ target − consumed (viewed day) ───────► remaining;  itemsForSlot ► filledSlots
  └─ <MealsSheet slot combos remaining filledSlots savedMeals … onSelect={handleComboSelect}/>
        ├─ tab "ready":   recommendMeals(combos, slot, remaining, filledSlots) ► "Sana uygun" + full list
        ├─ tab "mine":    annotateSavedMeals(...) ► rows (saved grams) ─ "+ Yeni Yemek" ► SavedMealForm
        └─ tab "recipes": meals with recipeSteps(...) (saved + built-in prepNote)
   any row ► onSelect(combo, factor) ► handleComboSelect ► addItem(slot, food, grams, combo.id)  (unchanged)
```

What the sheet looks like:

```
┌ Yemekler                              ✕ ┐
│ [ Yemeklerim ][ Hazır Yemekler ][ Tarifler ]
│ ┌ 🔍 Yemek ara... ─────────────────────┐
│ SANA UYGUN            Kalan hedefine göre
│  Somon, patates ve ıspanak       [Tarif]
│  6 malzeme · 512 kcal · P: 48g
│  [Küçük][ Normal ][▮Büyük▮][✎]
│  …
│ TÜM HAZIR YEMEKLER
│  (today's list, unchanged)
└──────────────────────────────────────────┘
```

---

## Task 1: Cleanup — remove the remaining unused code

These are the "to be removed" items from the 2026-09-20 code audit (the reusable pieces were already
moved to `archive/` in commit `bb300a6`). Doing this first leaves the new work starting from a smaller
tree. Nothing here changes behavior.

**Files:** `src/components/MealTrackingView.tsx` (delete), `src/components/FoodSearchModal.tsx`,
`src/hooks/useRemainingToday.ts`, `data/combos.json`, `data/README.md`.

- [ ] **Step 1: Delete `src/components/MealTrackingView.tsx`.** It is fully superseded by
  `MealPlanView.tsx` and nothing imports it (`grep -rn MealTrackingView src` shows only its own file). Git history keeps it.

- [ ] **Step 2: `FoodSearchModal` — remove the two props no caller ever passes** (`recommendationTags`,
  `onSelectTag`) and the chips block that renders them.

Edit `src/components/FoodSearchModal.tsx` (apply exactly):

```diff
--- a/src/components/FoodSearchModal.tsx
+++ b/src/components/FoodSearchModal.tsx
@@ -9,8 +9,6 @@
   isOpen: boolean;
   onClose: () => void;
   onSelect: (food: Nutrition, quantityG: number) => void;
-  recommendationTags?: Array<{ label: string; badge?: string }>;
-  onSelectTag?: (tag: string) => void;
 };
 
 export function FoodSearchModal({
@@ -19,8 +17,6 @@
   isOpen,
   onClose,
   onSelect,
-  recommendationTags = [],
-  onSelectTag,
 }: Props) {
   const [query, setQuery] = useState("");
   const [selected, setSelected] = useState<Nutrition | null>(null);
@@ -66,34 +62,6 @@
           className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
         />
       </div>
-
-      {/* Recommendation Tags */}
-      {recommendationTags.length > 0 && (
-        <div className="mb-4 shrink-0 space-y-2">
-          <p className="text-xs font-semibold uppercase text-muted-foreground">
-            Kalan makroya göre önerilen
-          </p>
-          <div className="flex flex-wrap gap-2">
-            {recommendationTags.map((tag) => (
-              <button
-                key={tag.label}
-                type="button"
-                onClick={() => {
-                  onSelectTag?.(tag.label);
-                  resetModal();
-                }}
-                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary active:border-primary hover:text-primary active:text-primary transition-colors">
-                {tag.label}
-                {tag.badge && (
-                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
-                    {tag.badge}
-                  </span>
-                )}
-              </button>
-            ))}
-          </div>
-        </div>
-      )}
 
       {/* Selected Item Quantity Picker */}
       {selected ? (
```

- [ ] **Step 3: `useRemainingToday` — remove `target`, `consumed`, `isEstimated`** from the `"ready"`
  result. Only the archived `TodayView` read them (`MealPlanView` uses `remaining`, `foodExclusions`,
  `allergenExclusions`, `catalogMap`, `todaysItems`, `logConsumption`, `undoConsumption`).

Edit `src/hooks/useRemainingToday.ts` (apply exactly):

```diff
--- a/src/hooks/useRemainingToday.ts
+++ b/src/hooks/useRemainingToday.ts
@@ -27,14 +27,7 @@
     }
   | {
       status: "ready";
-      target: MacroTotals;
-      consumed: MacroTotals;
       remaining: MacroTotals;
-      // True when there's no real saved profile — target is computed off
-      // DEFAULT_PROFILE (or a real-but-invalid profile fell back the same
-      // way). TodayView shows a "Tahmini" tag when this is true instead of
-      // blocking the screen the way the old "no-profile" status did.
-      isEstimated: boolean;
       foodExclusions: FoodExclusion[];
       allergenExclusions: AllergenClassExclusion[];
       catalogMap: NutritionMap;
@@ -83,7 +76,7 @@
   userId: string | null,
   householdId: string | null
 ): RemainingToday {
-  const { targets, profile, hasSavedProfile } = useMealPersonalization(userId);
+  const { targets, profile } = useMealPersonalization(userId);
   const { catalogMap, status: catalogStatus } = useFoodCatalog();
   // Bugün always means today, whatever day Yemek Planı is currently browsing
   // (both read the same ?date URL param, so this instance opts out of it).
@@ -109,8 +102,7 @@
 
   // A real profile that somehow fails validation (targets === null) is
   // treated the same as no profile at all — both fall back to
-  // DEFAULT_PROFILE's guaranteed-valid numbers, tagged as estimated.
-  const isEstimated = !hasSavedProfile || !targets;
+  // DEFAULT_PROFILE's guaranteed-valid numbers.
   const effectiveTargets = targets ?? calculateTargets(DEFAULT_PROFILE)!;
 
   if (catalogStatus === "error") {
@@ -132,10 +124,7 @@
 
   return {
     status: "ready",
-    target,
-    consumed,
     remaining,
-    isEstimated,
     foodExclusions: profile.foodExclusions,
     allergenExclusions: profile.allergenExclusions,
     catalogMap,
```

- [ ] **Step 4: Trim the unused tags in `data/combos.json`.** Keep only `kahvalti`, `ara-ogun`,
  `atistirmalik` (Task 2's slot filter reads exactly these). Do it as a line-level edit so the file's
  formatting is untouched — **do not** re-serialize the JSON. Run this once from the repo root, then check
  `git diff --stat data/combos.json` shows 20 insertions and 20 deletions (one line per meal):

```python
import re, json
p = "data/combos.json"
raw = open(p, encoding="utf-8", newline="").read()
KEEP = {"kahvalti", "ara-ogun", "atistirmalik"}
def fix(m):
    kept = [t for t in json.loads(m.group(2)) if t in KEEP]
    return m.group(1) + json.dumps(kept, ensure_ascii=False)
new = re.sub(r'("tags":\s*)(\[[^\]]*\])', fix, raw)
open(p, "w", encoding="utf-8", newline="").write(new)
```

  Expected result: `yogurt-muz-ceviz`, `yumurta-tam-bugday-domates`, `beyaz-peynir-tabagi`,
  `kasarli-omlet` → `["kahvalti"]`; `badem-kuru-uzum` → `["ara-ogun", "atistirmalik"]`;
  `elma-ceviz` → `["ara-ogun"]`; every other meal → `[]`.

- [ ] **Step 5: `data/README.md` — update the `tags` line.**

Edit `data/README.md` (apply exactly):

```diff
--- a/data/README.md
+++ b/data/README.md
@@ -39,7 +39,8 @@
   silently skipped rather than shown with wrong totals, so a name that's correct in
   `nutrition.json` but was later renamed/removed in Supabase would quietly drop that combo.
 - `prep_minutes` — rough hands-on time.
-- `tags` — free-form, not filtered on yet; informational only for now.
+- `tags` — only `kahvalti`, `ara-ogun` and `atistirmalik` are used (the "Sana uygun" slot filter in
+  `src/lib/mealRecommend.ts`); leave the array empty for a main meal. Other tags are not read by anything.
 - `prep_note` — optional, concise textual preparation note (DEC-067 Level 1). Plain descriptive
   text only — not structured steps, not a recipe. Omit the key entirely for combos with no note.
 
```

- [ ] **Step 6: Verify.** `npm run build` must pass. `grep -rn "MealTrackingView\|recommendationTags"
  src` must return nothing.

---

## Task 2: Pure logic — recipe accessor, recommender, saved-meal library

No UI and no network yet. Everything here is pure or a thin fetch wrapper.

**Files:** `src/lib/combos.ts`, `src/lib/comboMatch.ts` (small edits); new `src/lib/mealRecommend.ts`,
`src/lib/savedMeals.ts`.

- [ ] **Step 1: `combos.ts` — an optional `steps` field and the `recipeSteps` accessor.** A meal is a
  recipe when it has the user's ordered `steps`, or a built-in's single `prepNote` (shown as one step).

Edit `src/lib/combos.ts` (apply exactly):

```diff
--- a/src/lib/combos.ts
+++ b/src/lib/combos.ts
@@ -9,6 +9,10 @@
   // Optional concise textual preparation note (DEC-067 Level 1). Informational
   // only — never parsed, never consulted by matching/nutrition/shopping logic.
   prepNote?: string;
+  // Ordered preparation steps the USER wrote for their own saved meal (see
+  // savedMeals.ts). Built-in combos never set this — they only have prepNote.
+  // A meal with either one is a "Tarif" (recipe); see recipeSteps below.
+  steps?: string[];
 };
 
 // data/combos.json is hand-authored with snake_case keys (name_tr/food_id/
@@ -37,6 +41,14 @@
 }));
 
 export const COMBO_BY_ID = new Map(ALL_COMBOS.map((c) => [c.id, c]));
+
+// A meal is a recipe when it carries preparation text: the user's own ordered
+// `steps`, or a built-in combo's single `prepNote` (shown as one step). Empty
+// array = not a recipe. One accessor so no caller has to know the two shapes.
+export function recipeSteps(combo: Pick<Combo, "steps" | "prepNote">): string[] {
+  if (combo.steps && combo.steps.length > 0) return combo.steps;
+  return combo.prepNote ? [combo.prepNote] : [];
+}
 
 // Meal portion tiers for the "Yemekler" picker (Meal Plan). A portion is one
 // uniform multiplier over the combo's authored grams — On Cooking ch. 4's
```

- [ ] **Step 2: `comboMatch.ts` — export `preferenceTier`** (the recommender ranks with the same
  household preference: hindi sinks to the bottom, bone-in thigh sinks low).

Edit `src/lib/comboMatch.ts` (apply exactly):

```diff
--- a/src/lib/comboMatch.ts
+++ b/src/lib/comboMatch.ts
@@ -130,8 +130,9 @@
 }
 
 // Higher tier sorts later. 0 = normal ranking, 1 = deprioritized (bone-in
-// chicken thigh), 2 = sunk to the bottom (turkey).
-function preferenceTier(combo: Combo): number {
+// chicken thigh), 2 = sunk to the bottom (turkey). Exported so mealRecommend.ts
+// ranks with the same household preference.
+export function preferenceTier(combo: Combo): number {
   if (hasTurkey(combo)) return 2;
   if (hasBoneInChickenThigh(combo)) return 1;
   return 0;
```

- [ ] **Step 3: Create `src/lib/mealRecommend.ts`.**

  How it works, so a reviewer can check it against the code: `slotBudget` gives the slot a share of the
  day's *remaining* macros — its weight over the weights of every slot still open (empty, or the slot
  being filled); `fitsSlot` uses the three kept tags (untagged = main meal); for each meal
  `recommendMeals` scores all three portion tiers with the existing `scoreInstance` against that budget
  and keeps the best; it returns `[]` when the day has no calories left. `SLOT_WEIGHT` is an MVP tuning
  constant, labeled as such.

Create `src/lib/mealRecommend.ts`:

```ts
// "Sana uygun" — deterministic meal recommendations for one meal slot.
//
// No AI, no network: it ranks the meals the picker already shows against the
// share of the day's REMAINING macros that this slot should take. Pure and
// dependency-light on purpose, so a later version can take more candidates,
// return more results, be cached/precomputed, or be replaced by a smarter
// ranker without touching its callers (see RecommendedMeal below).
import type { MealSlot } from "./mealPlan";
import type { MacroTotals } from "./mealNutrition";
import type { NutritionMap } from "./nutrition";
import { COMBO_PORTIONS, type Combo, type PortionId } from "./combos";
import { scaledComboTotals, preferenceTier, type ScoredCombo } from "./comboMatch";
import { scoreInstance } from "./eveningRecommend";

export type RecommendedMeal = {
  combo: ScoredCombo;
  // The portion tier (COMBO_PORTIONS) that fit the slot budget best.
  portionId: PortionId;
  factor: number;
  // Totals at that tier — computed from the same rounded grams that get logged.
  totals: MacroTotals;
  // Lower is better (scoreInstance). Exposed so a future UI/ranker can use it.
  score: number;
};

const ALL_SLOTS: MealSlot[] = ["kahvalti", "ogle", "aksam", "ara"];

// MVP tuning weights, NOT scientifically derived (same status as the constants
// in eveningRecommend.ts): how much of the day's remaining budget each slot
// gets relative to the others still open. A snack takes half a meal.
export const SLOT_WEIGHT: Record<MealSlot, number> = {
  kahvalti: 1,
  ogle: 1,
  aksam: 1,
  ara: 0.5,
};

// The part of the day's remaining macros this slot should take: remaining ×
// (this slot's weight ÷ the weights of every slot still open). A slot counts
// as open when it is empty OR it is the slot being added to. Negative
// remaining values clamp to 0 (a macro already exceeded contributes no room).
export function slotBudget(
  remaining: MacroTotals,
  slot: MealSlot,
  filledSlots: ReadonlySet<MealSlot>
): MacroTotals {
  let openWeight = 0;
  for (const s of ALL_SLOTS) {
    if (s === slot || !filledSlots.has(s)) openWeight += SLOT_WEIGHT[s];
  }
  const share = SLOT_WEIGHT[slot] / openWeight;
  const part = (value: number) => Math.max(0, value) * share;
  return {
    kcal: part(remaining.kcal),
    proteinG: part(remaining.proteinG),
    fatG: part(remaining.fatG),
    carbsG: part(remaining.carbsG),
    fiberG: part(remaining.fiberG),
  };
}

const SNACK_TAGS = ["ara-ogun", "atistirmalik"];

// Only three of combos.json's tags are used for this: "kahvalti", "ara-ogun",
// "atistirmalik". Untagged meals are treated as main meals.
//  - kahvalti slot: breakfast-tagged meals only
//  - ara slot: snack- or breakfast-tagged (light) meals
//  - ogle / aksam: everything that is neither breakfast- nor snack-tagged
// Slot ids are used, never the card labels (two cards read "Ara Öğün").
export function fitsSlot(combo: Pick<Combo, "tags">, slot: MealSlot): boolean {
  const isBreakfast = combo.tags.includes("kahvalti");
  const isSnack = combo.tags.some((tag) => SNACK_TAGS.includes(tag));
  if (slot === "kahvalti") return isBreakfast;
  if (slot === "ara") return isSnack || isBreakfast;
  return !isBreakfast && !isSnack;
}

export type RecommendInput = {
  // Already exclusion-filtered and totalled — pass scoreAllCombos' output.
  combos: ScoredCombo[];
  slot: MealSlot;
  // The whole day's remaining macros (target − consumed) for the day being viewed.
  remaining: MacroTotals;
  // Slots of that day that already have entries.
  filledSlots: ReadonlySet<MealSlot>;
  catalog: NutritionMap;
  limit?: number;
};

export const DEFAULT_RECOMMEND_LIMIT = 4;

// For each meal that fits the slot, picks the portion tier whose totals score
// best (scoreInstance) against the slot budget, then ranks: household
// preference tier, no soft conflict first, then score. [] when nothing is left
// in the day's calorie budget.
export function recommendMeals(input: RecommendInput): RecommendedMeal[] {
  const { combos, slot, remaining, filledSlots, catalog } = input;
  if (remaining.kcal <= 0) return [];

  const budget = slotBudget(remaining, slot, filledSlots);
  const out: RecommendedMeal[] = [];
  for (const combo of combos) {
    if (!fitsSlot(combo, slot)) continue;
    let best: Omit<RecommendedMeal, "combo"> | null = null;
    for (const portion of COMBO_PORTIONS) {
      const totals = scaledComboTotals(combo, portion.factor, catalog);
      if (!totals) continue;
      const score = scoreInstance(totals, budget);
      if (!best || score < best.score) {
        best = { portionId: portion.id, factor: portion.factor, totals, score };
      }
    }
    if (best) out.push({ combo, ...best });
  }

  out.sort(
    (a, b) =>
      preferenceTier(a.combo) - preferenceTier(b.combo) ||
      Number(a.combo.hasSoftConflict) - Number(b.combo.hasSoftConflict) ||
      a.score - b.score
  );
  return out.slice(0, input.limit ?? DEFAULT_RECOMMEND_LIMIT);
}
```

- [ ] **Step 3b: Sanity-check the recommender (throwaway — do not leave it in the repo).** Write a
  temporary script outside `src/` that bundles `src/lib/mealRecommend.ts` with `esbuild` (already a
  dependency of Vite: `npx esbuild x.ts --bundle --platform=node --format=esm --outfile=x.mjs`), builds a
  catalog from `data/nutrition.json`, runs `scoreAllCombos(ALL_COMBOS, [], [], catalog)` and then
  `recommendMeals` for each slot with a fresh-day remaining of `{kcal:2200, proteinG:130, fatG:70,
  carbsG:250, fiberG:30}`. Expected: `kahvalti` returns only breakfast meals (4), `ogle`/`aksam` return
  four main meals with the best-fitting tier, `ara` returns light meals; with `{kcal:250, …}` the tiers
  drop to `small`; with `kcal <= 0` the result is `[]`. Delete the script and its output afterwards.

- [ ] **Step 4: Create `src/lib/savedMeals.ts`.**

  Notes: `savedMealToCombo` is the adapter that lets saved meals reuse every meal helper.
  `annotateSavedMeals` returns **every** saved meal with a `blocked` reason (`"missing"` = an ingredient
  left the nutrition catalog, `"excluded"` = a hard-excluded food) — because `scoreAllCombos` alone would
  make such a meal silently vanish. The API client mirrors `preparationBatch.ts` (returns `null`/`false`
  and `console.warn`s on failure, never throws).

Create `src/lib/savedMeals.ts`:

```ts
// "Yemeklerim": the user's own reusable meals. One entity for both plain meals
// and recipes — a saved meal with non-empty `steps` IS a recipe (Tarifler), so
// nothing is entered twice and the user never chooses between the two.
//
// Per-USER (api/personal-plan.ts, `saved_meals` table, RLS on user_id), like the
// Personal Plan — not per-household. `items[].foodId` is nutrition.name_tr, the
// same value space as MealEntry.foodId / Combo.items[].foodId — never the
// opaque Nutrition.food_id UUID.
import type { Combo } from "./combos";
import type { ScoredCombo } from "./comboMatch";
import { scoreAllCombos } from "./comboMatch";
import { lookupNutrition, type NutritionMap } from "./nutrition";
import { normalizeComposition, type BatchCompositionItem } from "./preparationBatch";
import type { FoodExclusion, AllergenClassExclusion } from "./foodExclusions";

export type SavedMeal = {
  id: string;
  name: string;
  items: BatchCompositionItem[];
  // Ordered preparation steps. Empty = a plain meal (not a recipe).
  steps: string[];
  createdAt: string;
};

export type NewSavedMeal = {
  id: string;
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
};

export const SAVED_MEAL_LIMITS = {
  nameMax: 60,
  itemsMax: 40,
  stepsMax: 30,
  stepMax: 500,
} as const;

type SavedMealRow = {
  id: string;
  user_id: string;
  name: string;
  items: { food_id: string; quantity_g: number }[];
  steps: string[] | null;
  created_at: string;
};

function fromRow(row: SavedMealRow): SavedMeal {
  return {
    id: row.id,
    name: row.name,
    items: row.items.map((item) => ({ foodId: item.food_id, quantityG: item.quantity_g })),
    steps: row.steps ?? [],
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Pure helpers

// One step per line; blank lines dropped; capped so a paste can't bloat a row.
export function parseSteps(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().slice(0, SAVED_MEAL_LIMITS.stepMax))
    .filter(Boolean)
    .slice(0, SAVED_MEAL_LIMITS.stepsMax);
}

export function stepsToText(steps: string[]): string {
  return steps.join("\n");
}

// A saved meal wearing the Combo shape, so every existing meal helper
// (scoreAllCombos, scaledComboTotals, MealsSheet's rows, handleComboSelect)
// works on it unchanged. prepMinutes 0 = "unknown", which the UI hides.
export function savedMealToCombo(meal: SavedMeal): Combo {
  return {
    id: meal.id,
    nameTr: meal.name,
    items: meal.items.map((item) => ({ foodId: item.foodId, grams: item.quantityG })),
    prepMinutes: 0,
    tags: [],
    steps: meal.steps.length > 0 ? meal.steps : undefined,
  };
}

export type SavedMealEntry = {
  meal: SavedMeal;
  // Null when the meal can't be offered — see `blocked`.
  scored: ScoredCombo | null;
  // "missing": an ingredient is no longer in the nutrition catalog, so it has
  //   no totals. "excluded": it contains a hard-excluded food (allergy etc.).
  // Never silently dropped: the list shows the row disabled with the reason,
  // because scoreAllCombos would otherwise make a saved meal just vanish.
  blocked: "missing" | "excluded" | null;
};

export function annotateSavedMeals(
  meals: SavedMeal[],
  exclusions: FoodExclusion[],
  allergenExclusions: AllergenClassExclusion[],
  catalog: NutritionMap
): SavedMealEntry[] {
  const scoredById = new Map(
    scoreAllCombos(meals.map(savedMealToCombo), exclusions, allergenExclusions, catalog).map(
      (combo) => [combo.id, combo]
    )
  );
  return meals.map((meal) => {
    const scored = scoredById.get(meal.id) ?? null;
    if (scored) return { meal, scored, blocked: null };
    const allResolve = meal.items.every((item) => lookupNutrition(catalog, item.foodId));
    return { meal, scored: null, blocked: allResolve ? "excluded" : "missing" };
  });
}

// Everything the server also enforces, so the form can explain instead of 400.
export function validateSavedMeal(input: {
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
}): string | null {
  const name = input.name.trim();
  if (!name) return "Yemeğe bir ad ver.";
  if (name.length > SAVED_MEAL_LIMITS.nameMax) {
    return `Ad en fazla ${SAVED_MEAL_LIMITS.nameMax} karakter olabilir.`;
  }
  const items = normalizeComposition(input.items);
  if (items.length === 0) return "En az bir besin ekle.";
  if (items.length > SAVED_MEAL_LIMITS.itemsMax) {
    return `En fazla ${SAVED_MEAL_LIMITS.itemsMax} besin ekleyebilirsin.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Persistence (client <-> api/personal-plan.ts?_resource=saved-meals, exposed
// as /api/saved-meals by a vercel.json rewrite — see that file).

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function fetchSavedMeals(): Promise<SavedMeal[]> {
  try {
    const res = await fetch(apiUrl("/api/saved-meals"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[savedMeals] fetch failed:", res.status);
      return [];
    }
    return ((await res.json()) as SavedMealRow[]).map(fromRow);
  } catch (err) {
    console.warn("[savedMeals] fetch threw:", err);
    return [];
  }
}

function toBody(meal: Omit<NewSavedMeal, "id">) {
  return {
    name: meal.name.trim(),
    items: normalizeComposition(meal.items).map((item) => ({
      food_id: item.foodId,
      quantity_g: item.quantityG,
    })),
    steps: meal.steps,
  };
}

export async function createSavedMeal(meal: NewSavedMeal): Promise<SavedMeal | null> {
  try {
    const res = await fetch(apiUrl("/api/saved-meals"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: meal.id, ...toBody(meal) }),
    });
    if (!res.ok) {
      console.warn("[savedMeals] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as SavedMealRow);
  } catch (err) {
    console.warn("[savedMeals] create threw:", err);
    return null;
  }
}

export async function updateSavedMeal(
  id: string,
  meal: Omit<NewSavedMeal, "id">
): Promise<SavedMeal | null> {
  try {
    const res = await fetch(apiUrl(`/api/saved-meals?id=${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(meal)),
    });
    if (!res.ok) {
      console.warn("[savedMeals] update failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as SavedMealRow);
  } catch (err) {
    console.warn("[savedMeals] update threw:", err);
    return null;
  }
}

export async function deleteSavedMeal(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/saved-meals?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[savedMeals] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[savedMeals] delete threw:", err);
    return false;
  }
}
```

- [ ] **Step 5: Verify.** `npm run build` must pass.

---

## Task 3: Backend — the `saved_meals` table, the API resource, the hook

**Files:** new `supabase/28-saved-meals.sql`, new `src/hooks/useSavedMeals.ts`; modified
`api/personal-plan.ts`, `vercel.json`.

- [ ] **Step 1: `supabase/28-saved-meals.sql` (already committed to master — verify, do not recreate).** Per-user table; RLS uses the **current**
  private-schema helper `app_private.current_app_user_id()` (migration 22 moved it there — the older
  `public.current_app_user_id()` no longer exists). `on delete cascade` from `app_users` means account
  deletion needs no code change.

The file already exists in the repo with exactly this content. Check that it matches; if it does, change nothing here. (If it is missing, create it with:)

```sql
-- supabase/28-saved-meals.sql
--
-- "Yemeklerim": a user's own reusable meals (and recipes — a saved meal with
-- non-empty `steps` is a recipe; there is no separate recipe table). Run in the
-- Supabase SQL editor (postgres role), like migrations 19-27.
--
-- Per USER, not per household (matches personal_plan): a household can have
-- several members with different foods and exclusions, and exclusions are
-- personal. Deleting the app_users row cascades here, so account deletion
-- (api/auth-delete-account.ts) needs no change.
--
-- items[].food_id is nutrition.name_tr — the SAME value space as
-- meal_entries.food_id / Combo.items[].foodId — NOT the opaque
-- Nutrition.food_id UUID from 16-nutrition-food-id.sql.
--
-- RLS uses the private-schema helper from 22-security-definer-functions-to-
-- private-schema.sql (app_private.current_app_user_id()), like personal_plan.
--
-- Idempotent: safe to re-run.

create table if not exists public.saved_meals (
  id         text primary key,
  user_id    text not null references public.app_users(id) on delete cascade,
  name       text not null,
  items      jsonb not null,   -- [{ "food_id": "tavuk göğsü", "quantity_g": 180 }, ...]
  steps      jsonb,            -- ["Tavuğu haşla", ...] or null / [] for a plain meal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_meals_user_created_idx
  on public.saved_meals (user_id, created_at desc);

alter table public.saved_meals enable row level security;

drop policy if exists saved_meals_all on public.saved_meals;
create policy saved_meals_all on public.saved_meals
  for all using (user_id = app_private.current_app_user_id())
  with check (user_id = app_private.current_app_user_id());
```

  **Do not run it.** The human runs it in the Supabase SQL editor (Task 6 begins by asking).

- [ ] **Step 2: `api/personal-plan.ts` — add the `saved-meals` resource.** The existing GET/PUT profile
  behavior is untouched; the new branch is selected by `?_resource=saved-meals`. Every request runs as the
  caller's own session (`userRestHeaders`) and additionally filters `user_id=eq.<caller>`, so RLS is a
  second layer, not the only one. Input is validated and *rejected* (never truncated) when oversized;
  there is a per-user cap of 100 saved meals.

Edit `api/personal-plan.ts` (apply exactly):

```diff
--- a/api/personal-plan.ts
+++ b/api/personal-plan.ts
@@ -1,5 +1,15 @@
 // GET /api/personal-plan  -> PersonalPlanRow | null  (read the caller's own profile)
 // PUT /api/personal-plan  { ...profile }             -> PersonalPlanRow  (upsert)
+//
+// Also serves the caller's saved meals ("Yemeklerim") as a second resource,
+// selected by `?_resource=saved-meals` — vercel.json rewrites /api/saved-meals
+// to it. Merged into this function (rather than a new file) because the project
+// sits at the 12-function Hobby limit, and both are per-user data guarded the
+// same way (requireUser + RLS on user_id). See the handlers at the bottom:
+//   GET    /api/saved-meals            -> SavedMealRow[]   (newest first)
+//   POST   /api/saved-meals            -> SavedMealRow     (create; client id)
+//   PATCH  /api/saved-meals?id=<id>    -> SavedMealRow     (replace name/items/steps)
+//   DELETE /api/saved-meals?id=<id>    -> { ok: true }
 //
 // One profile per logged-in user, scoped entirely by the session's userId
 // (never a client-supplied id) — no separate access check needed beyond
@@ -146,6 +156,10 @@
     } catch (err) {
       return authErrorResponse(err);
     }
+    const url = new URL(request.url);
+    if (url.searchParams.get("_resource") === "saved-meals") {
+      return handleSavedMeals(request, user, url);
+    }
     const method = request.method.toUpperCase();
     if (method === "GET") return handleGet(user);
     if (method === "PUT") return handleWrite(request, user);
@@ -283,6 +297,190 @@
   }
 }
 
+// -------- Saved meals ("Yemeklerim") -------------------------------------------
+
+type SavedMealItem = { food_id: string; quantity_g: number };
+
+export type SavedMealRow = {
+  id: string;
+  user_id: string;
+  name: string;
+  items: SavedMealItem[];
+  steps: string[] | null;
+  created_at: string;
+};
+
+const SAVED_MEAL_COLS = "id,user_id,name,items,steps,created_at";
+// Keep in sync with SAVED_MEAL_LIMITS in src/lib/savedMeals.ts (this file does
+// not import from src/, a separate build target).
+const SAVED_MEAL_LIMITS = {
+  nameMax: 60,
+  itemsMax: 40,
+  stepsMax: 30,
+  stepMax: 500,
+  quantityMax: 20000,
+  perUserMax: 100,
+};
+
+// Validates a create/replace body. Returns the cleaned fields, or a message for
+// a 400. Rejects (never silently truncates) oversized input.
+function parseSavedMeal(
+  body: Record<string, unknown>
+): { name: string; items: SavedMealItem[]; steps: string[] } | string {
+  const name = typeof body.name === "string" ? body.name.trim() : "";
+  if (!name || name.length > SAVED_MEAL_LIMITS.nameMax) {
+    return `expected name: string (1-${SAVED_MEAL_LIMITS.nameMax} chars)`;
+  }
+
+  if (
+    !Array.isArray(body.items) ||
+    body.items.length === 0 ||
+    body.items.length > SAVED_MEAL_LIMITS.itemsMax
+  ) {
+    return `expected items: 1-${SAVED_MEAL_LIMITS.itemsMax} entries of { food_id, quantity_g }`;
+  }
+  const items: SavedMealItem[] = [];
+  for (const raw of body.items) {
+    if (typeof raw !== "object" || raw === null) return "invalid items entry";
+    const entry = raw as Record<string, unknown>;
+    if (typeof entry.food_id !== "string" || !entry.food_id.trim()) {
+      return "items[].food_id must be a non-empty string";
+    }
+    if (
+      typeof entry.quantity_g !== "number" ||
+      !Number.isFinite(entry.quantity_g) ||
+      entry.quantity_g <= 0 ||
+      entry.quantity_g > SAVED_MEAL_LIMITS.quantityMax
+    ) {
+      return `items[].quantity_g must be a number in (0, ${SAVED_MEAL_LIMITS.quantityMax}]`;
+    }
+    items.push({ food_id: entry.food_id.trim(), quantity_g: entry.quantity_g });
+  }
+
+  const rawSteps = body.steps === undefined || body.steps === null ? [] : body.steps;
+  if (!Array.isArray(rawSteps) || rawSteps.length > SAVED_MEAL_LIMITS.stepsMax) {
+    return `expected steps: array of at most ${SAVED_MEAL_LIMITS.stepsMax} strings`;
+  }
+  const steps: string[] = [];
+  for (const step of rawSteps) {
+    if (typeof step !== "string") return "steps must be strings";
+    const trimmed = step.trim();
+    if (trimmed.length > SAVED_MEAL_LIMITS.stepMax) {
+      return `each step must be at most ${SAVED_MEAL_LIMITS.stepMax} chars`;
+    }
+    if (trimmed) steps.push(trimmed);
+  }
+
+  return { name, items, steps };
+}
+
+async function handleSavedMeals(
+  request: Request,
+  user: AuthUser,
+  url: URL
+): Promise<Response> {
+  const supabaseUrl = process.env.SUPABASE_URL;
+  if (!supabaseUrl) return json({ error: "supabase not configured" }, 500);
+
+  const base = `${restBase(supabaseUrl)}/saved_meals`;
+  const owner = `user_id=eq.${encodeURIComponent(user.userId)}`;
+  const headers = userRestHeaders(user);
+  const writeHeaders = {
+    ...headers,
+    "content-type": "application/json",
+    prefer: "return=representation",
+  };
+  const method = request.method.toUpperCase();
+
+  try {
+    if (method === "GET") {
+      const res = await fetch(
+        `${base}?select=${SAVED_MEAL_COLS}&${owner}&order=created_at.desc`,
+        { headers }
+      );
+      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
+      return json((await res.json()) as SavedMealRow[], 200);
+    }
+
+    if (method === "POST") {
+      let body: Record<string, unknown>;
+      try {
+        body = (await request.json()) as Record<string, unknown>;
+      } catch {
+        return json({ error: "invalid json" }, 400);
+      }
+      const id = typeof body.id === "string" ? body.id.trim() : "";
+      if (!id || id.length > 64) return json({ error: "expected id: string (1-64 chars)" }, 400);
+      const parsed = parseSavedMeal(body);
+      if (typeof parsed === "string") return json({ error: parsed }, 400);
+
+      // Per-user cap, so a runaway client can't grow one user's list forever.
+      const countRes = await fetch(
+        `${base}?select=id&${owner}&limit=${SAVED_MEAL_LIMITS.perUserMax + 1}`,
+        { headers }
+      );
+      if (!countRes.ok) return json({ error: `supabase ${countRes.status}` }, 502);
+      if (((await countRes.json()) as unknown[]).length >= SAVED_MEAL_LIMITS.perUserMax) {
+        return json({ error: "saved meal limit reached" }, 409);
+      }
+
+      const res = await fetch(`${base}?select=${SAVED_MEAL_COLS}`, {
+        method: "POST",
+        headers: writeHeaders,
+        body: JSON.stringify({ id, user_id: user.userId, ...parsed }),
+      });
+      if (!res.ok) {
+        return json({ error: `supabase ${res.status}` }, res.status === 409 ? 409 : 502);
+      }
+      const rows = (await res.json()) as SavedMealRow[];
+      if (rows.length === 0) return json({ error: "saved meal creation failed" }, 500);
+      return json(rows[0], 201);
+    }
+
+    const id = url.searchParams.get("id")?.trim();
+    if (!id) return json({ error: "expected ?id=<id>" }, 400);
+
+    if (method === "PATCH") {
+      let body: Record<string, unknown>;
+      try {
+        body = (await request.json()) as Record<string, unknown>;
+      } catch {
+        return json({ error: "invalid json" }, 400);
+      }
+      const parsed = parseSavedMeal(body);
+      if (typeof parsed === "string") return json({ error: parsed }, 400);
+      const res = await fetch(
+        `${base}?id=eq.${encodeURIComponent(id)}&${owner}&select=${SAVED_MEAL_COLS}`,
+        {
+          method: "PATCH",
+          headers: writeHeaders,
+          body: JSON.stringify({ ...parsed, updated_at: new Date().toISOString() }),
+        }
+      );
+      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
+      const rows = (await res.json()) as SavedMealRow[];
+      if (rows.length === 0) return json({ error: "not found" }, 404);
+      return json(rows[0], 200);
+    }
+
+    if (method === "DELETE") {
+      const res = await fetch(
+        `${base}?id=eq.${encodeURIComponent(id)}&${owner}&select=id`,
+        { method: "DELETE", headers: writeHeaders }
+      );
+      if (!res.ok) return json({ error: `supabase ${res.status}` }, 502);
+      if (((await res.json()) as unknown[]).length === 0) {
+        return json({ error: "not found" }, 404);
+      }
+      return json({ ok: true }, 200);
+    }
+
+    return json({ error: "method not allowed" }, 405);
+  } catch (e) {
+    return json({ error: `saved meals request failed: ${e}` }, 500);
+  }
+}
+
 function json(data: unknown, status: number) {
   return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
 }
```

- [ ] **Step 3: `vercel.json` — expose it at `/api/saved-meals`.** Same mechanism `auth-google` uses;
  original query params (e.g. `?id=`) are preserved by the rewrite.

Edit `vercel.json` (apply exactly):

```diff
--- a/vercel.json
+++ b/vercel.json
@@ -1,7 +1,8 @@
 {
   "rewrites": [
     { "source": "/api/auth-google-start", "destination": "/api/auth-google?_action=start" },
-    { "source": "/api/auth-callback", "destination": "/api/auth-google?_action=callback" }
+    { "source": "/api/auth-callback", "destination": "/api/auth-google?_action=callback" },
+    { "source": "/api/saved-meals", "destination": "/api/personal-plan?_resource=saved-meals" }
   ]
 }
 
```

- [ ] **Step 4: Create `src/hooks/useSavedMeals.ts`.** Mirrors `useBatches.ts`; keyed by `userId`.

Create `src/hooks/useSavedMeals.ts`:

```ts
// Yemeklerim: the signed-in user's saved meals. Mirrors useBatches.ts's
// TanStack Query pattern. Per-user (not per-household), so the key is the userId.
// Mounted by MealPlanView (not by the sheet) so the list is already fetched by
// the time the "Yemekler" sheet opens.
import { useQuery, useQueryClient } from "@tanstack/preact-query";
import {
  createSavedMeal,
  deleteSavedMeal,
  fetchSavedMeals,
  updateSavedMeal,
  type NewSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";

export function useSavedMeals(userId: string | null) {
  const queryKey = ["savedMeals", userId ?? "local"] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: fetchSavedMeals,
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Each mutation waits for the server before touching the cache (a saved meal
  // has no optimistic UI to protect — the form stays open until it resolves).
  async function create(input: NewSavedMeal): Promise<SavedMeal | null> {
    const created = await createSavedMeal(input);
    if (created) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
    }
    return created;
  }

  async function update(id: string, input: Omit<NewSavedMeal, "id">): Promise<SavedMeal | null> {
    const updated = await updateSavedMeal(id, input);
    if (updated) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) =>
        (prev ?? []).map((meal) => (meal.id === id ? updated : meal))
      );
    }
    return updated;
  }

  async function remove(id: string): Promise<boolean> {
    const ok = await deleteSavedMeal(id);
    if (ok) {
      queryClient.setQueryData<SavedMeal[]>(queryKey, (prev) =>
        (prev ?? []).filter((meal) => meal.id !== id)
      );
    }
    return ok;
  }

  return {
    savedMeals: query.data ?? [],
    isLoading: !!userId && query.isLoading,
    create,
    update,
    remove,
  };
}
```

- [ ] **Step 5: Verify.** `npm run build` and `npx tsc -p api/tsconfig.json --noEmit` must both pass.
  (`vercel dev` reads `vercel.json` only at start — remember that in Task 6.)

---

## Task 4: Shared building blocks — `ConfirmModal onTop` and `MealCompositionEditor`

**Files:** `src/components/ConfirmModal.tsx`, `src/components/BatchCreateForm.tsx` (edits); new
`src/components/MealCompositionEditor.tsx`.

- [ ] **Step 1: Create `MealCompositionEditor.tsx`.** The foods + grams editor that lives inline in
  `BatchCreateForm` today, extracted so the new meal form uses the same code. It gains one thing: grams
  are editable in place.

Create `src/components/MealCompositionEditor.tsx`:

```tsx
import { Input } from "@/components/ui/input";
import { MealFoodPicker } from "@/components/MealFoodPicker";
import type { Nutrition } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import type { BatchCompositionItem } from "@/lib/preparationBatch";

type Props = {
  items: BatchCompositionItem[];
  onChange: (items: BatchCompositionItem[]) => void;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
};

// The "pick foods and grams by hand" editor shared by the batch form's manual
// mode and the Yemeklerim "Yeni Yemek" form: a list of food + grams rows (grams
// editable in place, "Kaldır" to drop one) and MealFoodPicker to add another.
// It only edits the array it is given — merging duplicates and validating is
// the caller's job (normalizeComposition in preparationBatch.ts).
export function MealCompositionEditor({
  items,
  onChange,
  foods,
  exclusions,
  allergenExclusions,
}: Props) {
  function setQuantity(index: number, quantityG: number) {
    onChange(items.map((item, i) => (i === index ? { ...item, quantityG } : item)));
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li
              key={`${item.foodId}-${index}`}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{item.foodId}</span>
              <Input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={item.quantityG > 0 ? item.quantityG : ""}
                aria-label={`${item.foodId} miktarı (gram)`}
                onInput={(event: Event) => {
                  const value = Number((event.target as HTMLInputElement).value);
                  setQuantity(index, Number.isFinite(value) ? value : 0);
                }}
                className="ledger h-8 w-20 px-2 text-right tabular-nums"
              />
              <span className="text-xs text-muted-foreground">g</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="text-xs text-muted-foreground hover:text-foreground active:text-foreground">
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
      <MealFoodPicker
        foods={foods}
        exclusions={exclusions}
        allergenExclusions={allergenExclusions}
        onAdd={(foodId, quantityG) => onChange([...items, { foodId, quantityG }])}
      />
    </div>
  );
}
```

- [ ] **Step 2: `ConfirmModal` gets an optional `onTop`** (`z-[60]` instead of `z-40`), needed so the
  delete confirmation opens *above* a bottom sheet (`z-50`). `BatchCreateForm`'s manual mode now uses the
  shared editor (and no longer imports `MealFoodPicker` itself).

Edit `src/components/ConfirmModal.tsx` (apply exactly):

```diff
--- a/src/components/ConfirmModal.tsx
+++ b/src/components/ConfirmModal.tsx
@@ -18,6 +18,9 @@
   destructive?: boolean;
   // Blocks the confirm button (and only it — cancel always works).
   confirmDisabled?: boolean;
+  // Renders above a BottomSheet (z-50) instead of below it — set when the
+  // modal is opened from inside a sheet.
+  onTop?: boolean;
 };
 
 export function ConfirmModal({
@@ -31,6 +34,7 @@
   onCancel,
   destructive,
   confirmDisabled,
+  onTop,
 }: Props) {
   useEffect(() => {
     function onKey(e: KeyboardEvent) {
@@ -46,7 +50,7 @@
     // field stays centred in the space above the on-screen keyboard instead of
     // ending up underneath it.
     <div
-      className="fixed inset-x-0 top-0 z-40 flex items-center justify-center px-5"
+      className={`fixed inset-x-0 top-0 ${onTop ? "z-[60]" : "z-40"} flex items-center justify-center px-5`}
       style={{
         height: "var(--visual-vh, 100dvh)",
         transform: "translateY(var(--visual-top, 0px))",
```

Edit `src/components/BatchCreateForm.tsx` (apply exactly):

```diff
--- a/src/components/BatchCreateForm.tsx
+++ b/src/components/BatchCreateForm.tsx
@@ -2,7 +2,7 @@
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { SmoothPillTabs } from "@/components/ui/smooth-pill";
-import { MealFoodPicker } from "@/components/MealFoodPicker";
+import { MealCompositionEditor } from "@/components/MealCompositionEditor";
 import { ALL_COMBOS, scaleComboItems } from "@/lib/combos";
 import { scoreAllCombos } from "@/lib/comboMatch";
 import { scaleNutrition, sumMacros } from "@/lib/mealNutrition";
@@ -147,37 +147,13 @@
           </label>
         </div>
       ) : (
-        <div>
-          {manualItems.length > 0 && (
-            <ul className="space-y-1">
-              {manualItems.map((item, index) => (
-                <li
-                  key={`${item.foodId}-${index}`}
-                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
-                  <span>
-                    {item.foodId} — {item.quantityG}g
-                  </span>
-                  <button
-                    type="button"
-                    onClick={() =>
-                      setManualItems((prev) => prev.filter((_, i) => i !== index))
-                    }
-                    className="text-xs text-muted-foreground hover:text-foreground active:text-foreground">
-                    Kaldır
-                  </button>
-                </li>
-              ))}
-            </ul>
-          )}
-          <MealFoodPicker
-            foods={foods}
-            exclusions={exclusions}
-            allergenExclusions={allergenExclusions}
-            onAdd={(foodId, quantityG) =>
-              setManualItems((prev) => [...prev, { foodId, quantityG }])
-            }
-          />
-        </div>
+        <MealCompositionEditor
+          items={manualItems}
+          onChange={setManualItems}
+          foods={foods}
+          exclusions={exclusions}
+          allergenExclusions={allergenExclusions}
+        />
       )}
 
       {mode === "combo" && !multiplierValid && (
```

- [ ] **Step 3: Verify.** `npm run build` must pass. (The batch form's manual mode should look the same
  as before, plus grams inputs — checked in Task 6.)

---

## Task 5: The sheet — `MealRow`, `SavedMealForm`, `MealsSheet`, wired into `MealPlanView`

These four land together (each imports the next), so `tsc` only goes green at the end of the task.

**Files:** new `MealRow.tsx`, `SavedMealForm.tsx`, `MealsSheet.tsx`; modified `MealPlanView.tsx`; deleted
`RecipeSearchModal.tsx`.

- [ ] **Step 1: Create `src/components/MealRow.tsx`.** The row from the old sheet, unchanged in look and
  behavior for built-in meals, plus: a **Tarif** badge and a "Tarifi göster / Tarifi gizle" toggle when
  the meal has steps (tapping it never adds the meal), and a `showTiers={false}` variant for saved meals
  (no tier chips; a bottom line with `actions` and the custom-multiplier pencil). The body tap adds at
  `activeTier` and **never** passes `rememberTier`; only a chip tap does (that is decision 5).

Create `src/components/MealRow.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { ComponentChildren } from "preact";
import { ChevronDown, Clock, Pencil } from "lucide-react";
import { scaledComboTotals, type ScoredCombo } from "@/lib/comboMatch";
import { COMBO_PORTIONS, recipeSteps, scaleComboItems, type PortionId } from "@/lib/combos";
import type { NutritionMap } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Custom amounts are a multiplier too (the batch planner's "Kat sayısı"), kept
// to a sane range so a typo can't log a 50 kg dinner.
const CUSTOM_MIN = 0.25;
const CUSTOM_MAX = 5;

type Props = {
  combo: ScoredCombo;
  catalog: NutritionMap;
  // A unique DOM id for this row (the same meal can appear in two sections, so
  // the combo id alone isn't unique) — used to scroll the open editor into view.
  domId: string;
  // true  = built-in / recommended meals: Küçük / Normal / Büyük chips + custom
  //         multiplier.
  // false = the user's saved meals: added at their saved grams, only the custom
  //         multiplier is offered.
  showTiers: boolean;
  // The tier a tap on the row body adds, shown as the filled chip. For the
  // normal list it is the remembered last tier; for "Sana uygun" rows it is the
  // recommended tier. Ignored when showTiers is false.
  activeTier: PortionId;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  // `rememberTier` is set only by a chip tap — the row-body tap never changes
  // the remembered tier.
  onAdd: (combo: ScoredCombo, factor: number, rememberTier?: PortionId) => void;
  // Extra buttons on the bottom line of a saved meal (Düzenle / Sil).
  actions?: ComponentChildren;
};

export function MealRow({
  combo,
  catalog,
  domId,
  showTiers,
  activeTier,
  editing,
  onStartEdit,
  onCancelEdit,
  onAdd,
  actions,
}: Props) {
  const [customText, setCustomText] = useState("1");
  const [stepsOpen, setStepsOpen] = useState(false);
  const steps = recipeSteps(combo);

  // Reset the multiplier each time the editor opens, and once it has opened
  // bring the row fully into view — after a beat, so it lands against the
  // sheet's final height once the keyboard has opened.
  useEffect(() => {
    if (!editing) return;
    setCustomText("1");
    const id = window.setTimeout(() => {
      document.getElementById(domId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(id);
  }, [editing, domId]);

  const bodyFactor = showTiers
    ? (COMBO_PORTIONS.find((p) => p.id === activeTier)?.factor ?? 1)
    : 1;
  const tierTotals = COMBO_PORTIONS.map(
    (p) => scaledComboTotals(combo, p.factor, catalog) ?? combo.totals
  );
  const shown = showTiers
    ? tierTotals[COMBO_PORTIONS.findIndex((p) => p.id === activeTier)]
    : (scaledComboTotals(combo, 1, catalog) ?? combo.totals);

  const customFactor = Number(customText);
  const customValid =
    Number.isFinite(customFactor) && customFactor >= CUSTOM_MIN && customFactor <= CUSTOM_MAX;
  const customItems = editing && customValid ? scaleComboItems(combo.items, customFactor) : null;
  const customTotals =
    editing && customValid ? scaledComboTotals(combo, customFactor, catalog) : null;

  const pencil = (
    <button
      type="button"
      onClick={onStartEdit}
      aria-label="Özel miktar"
      title="Özel miktar"
      className="flex w-11 shrink-0 items-center justify-center rounded-md border border-border py-1.5 text-muted-foreground transition-colors hover:text-foreground active:text-foreground">
      <Pencil className="size-4" />
    </button>
  );

  return (
    <div id={domId} className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => onAdd(combo, bodyFactor)}
        className="w-full rounded-t-lg p-3 pb-2 text-left transition-colors hover:bg-accent active:bg-accent">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground">
            {combo.nameTr}
            {steps.length > 0 && (
              <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 align-middle text-[0.65rem] font-medium text-muted-foreground">
                Tarif
              </span>
            )}
          </h4>
          {combo.prepMinutes > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {combo.prepMinutes} dk
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {combo.items.length} malzeme · {Math.round(shown.kcal)} kcal · P:{" "}
          {Math.round(shown.proteinG)}g
        </p>
        {combo.hasSoftConflict && (
          <p className="mt-1 text-xs text-signal">İçinde hassasiyet listendeki bir besin var</p>
        )}
      </button>

      {steps.length > 0 && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setStepsOpen((open) => !open)}
            aria-expanded={stepsOpen}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground active:text-foreground">
            <ChevronDown
              className={cn("size-3.5 transition-transform", stepsOpen && "rotate-180")}
            />
            {stepsOpen ? "Tarifi gizle" : "Tarifi göster"}
          </button>
          {stepsOpen &&
            (steps.length === 1 ? (
              <p className="mt-1.5 text-xs text-foreground">{steps[0]}</p>
            ) : (
              <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-foreground">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ))}
        </div>
      )}

      {editing ? (
        <div className="space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`${domId}-custom`} className="text-xs text-muted-foreground">
              Kat sayısı
            </label>
            <Input
              id={`${domId}-custom`}
              type="number"
              inputMode="decimal"
              min={CUSTOM_MIN}
              max={CUSTOM_MAX}
              step="0.25"
              value={customText}
              autoFocus
              onInput={(event: Event) => setCustomText((event.target as HTMLInputElement).value)}
              className="ledger h-9 w-20 px-2 text-right"
            />
            <Button
              type="button"
              size="sm"
              disabled={!customValid}
              onClick={() => onAdd(combo, customFactor)}
              className="ml-auto">
              Ekle
            </Button>
            <Button type="button" variant="quiet" size="sm" onClick={onCancelEdit}>
              Vazgeç
            </Button>
          </div>
          {customItems && customTotals ? (
            <>
              <p className="text-xs text-muted-foreground">
                {customItems.map((item) => `${item.foodId} ${item.grams} g`).join(" · ")}
              </p>
              <p className="ledger text-xs text-foreground">
                {Math.round(customTotals.kcal)} kcal · P: {Math.round(customTotals.proteinG)}g · K:{" "}
                {Math.round(customTotals.carbsG)}g · Y: {Math.round(customTotals.fatG)}g
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {CUSTOM_MIN} ile {CUSTOM_MAX} arasında bir değer gir.
            </p>
          )}
        </div>
      ) : showTiers ? (
        <div className="flex gap-1.5 px-3 pb-3">
          {COMBO_PORTIONS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(combo, p.factor, p.id)}
              aria-label={`${p.label} porsiyon, ${Math.round(tierTotals[i].kcal)} kcal`}
              className={cn(
                "flex-1 rounded-md border px-1 py-1.5 text-center leading-tight transition-colors",
                p.id === activeTier
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-border text-muted-foreground hover:text-foreground active:text-foreground"
              )}>
              <span className="block text-xs font-medium">{p.label}</span>
              <span className="ledger block text-[0.65rem]">
                {Math.round(tierTotals[i].kcal)} kcal
              </span>
            </button>
          ))}
          {pencil}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 pb-3">
          {actions}
          <span className="ml-auto" />
          {pencil}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/SavedMealForm.tsx`.** "Yeni Yemek" / "Yemeği düzenle": name,
  `MealCompositionEditor`, a totals line, a collapsed **"+ Hazırlama adımları ekle"** that reveals a
  one-step-per-line textarea, and **Kaydet** / **Kaydet ve ekle** / **Vazgeç**. Validation is
  `validateSavedMeal` (the same limits the server enforces).

Create `src/components/SavedMealForm.tsx`:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealCompositionEditor } from "@/components/MealCompositionEditor";
import { scaleNutrition, sumMacros } from "@/lib/mealNutrition";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import { normalizeComposition, type BatchCompositionItem } from "@/lib/preparationBatch";
import {
  SAVED_MEAL_LIMITS,
  parseSteps,
  stepsToText,
  validateSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";

export type SavedMealFormData = {
  name: string;
  items: BatchCompositionItem[];
  steps: string[];
};

type Props = {
  foods: Nutrition[];
  catalog: NutritionMap;
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  // Present = editing this meal; absent = "Yeni Yemek".
  initial?: SavedMeal;
  // Show "Kaydet ve ekle" (save, then add to the slot the sheet was opened for).
  canAddToSlot: boolean;
  // Resolves true on success. The parent closes/switches the view itself.
  onSubmit: (data: SavedMealFormData, addToSlot: boolean) => Promise<boolean>;
  onCancel: () => void;
};

// "Yeni Yemek": pick foods + grams, name it, optionally add preparation steps
// (which is all it takes for the meal to also show up under "Tarifler").
export function SavedMealForm({
  foods,
  catalog,
  exclusions,
  allergenExclusions,
  initial,
  canAddToSlot,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [items, setItems] = useState<BatchCompositionItem[]>(initial?.items ?? []);
  const [stepsOpen, setStepsOpen] = useState((initial?.steps.length ?? 0) > 0);
  const [stepsText, setStepsText] = useState(stepsToText(initial?.steps ?? []));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composition = normalizeComposition(items);
  const totals = sumMacros(
    composition.flatMap((item) => {
      const nutrition = catalog.get(item.foodId);
      return nutrition ? [scaleNutrition(nutrition, item.quantityG)] : [];
    })
  );

  // Desktop keeps instant typing; on a touch device an auto-opened keyboard
  // would cover the builder before the person has even chosen to type a name.
  const autoFocusName =
    !initial &&
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(pointer: coarse)").matches;

  async function submit(addToSlot: boolean) {
    if (submitting) return;
    const data: SavedMealFormData = {
      name: name.trim(),
      items: composition,
      steps: stepsOpen ? parseSteps(stepsText) : [],
    };
    const problem = validateSavedMeal(data);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const ok = await onSubmit(data, addToSlot);
      // On success the parent swaps this form out, so only a failure needs to
      // stay visible.
      if (!ok) setError("Yemek kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2">
      <label className="block text-xs text-muted-foreground">
        Yemeğin adı
        <Input
          type="text"
          value={name}
          maxLength={SAVED_MEAL_LIMITS.nameMax}
          autoFocus={autoFocusName}
          placeholder="Örn. Antrenman akşamı"
          onInput={(event: Event) => setName((event.target as HTMLInputElement).value)}
          className="mt-1"
        />
      </label>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Besinler ve miktarlar</p>
        <MealCompositionEditor
          items={items}
          onChange={setItems}
          foods={foods}
          exclusions={exclusions}
          allergenExclusions={allergenExclusions}
        />
      </div>

      {composition.length > 0 && (
        <p className="ledger rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
          Toplam {Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K:{" "}
          {Math.round(totals.carbsG)}g · Y: {Math.round(totals.fatG)}g
        </p>
      )}

      {stepsOpen ? (
        <label className="block text-xs text-muted-foreground">
          Hazırlama adımları (her satır bir adım)
          <textarea
            value={stepsText}
            rows={5}
            onInput={(event: Event) =>
              setStepsText((event.target as HTMLTextAreaElement).value)
            }
            placeholder={"Tavuğu haşla\nPirinci pişir\nBrokoliyi buharda yumuşat"}
            className="mt-1 w-full rounded-md border border-input bg-card p-2 text-base text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
      ) : (
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={() => setStepsOpen(true)}
          className="active:text-foreground">
          + Hazırlama adımları ekle
        </Button>
      )}

      {error && <p className="text-xs text-signal">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="flex-1"
          disabled={submitting}
          onClick={() => submit(false)}>
          {submitting ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {canAddToSlot && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={submitting}
            onClick={() => submit(true)}>
            Kaydet ve ekle
          </Button>
        )}
        <Button type="button" variant="quiet" onClick={onCancel} disabled={submitting}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/MealsSheet.tsx`.** The wrapper returns `null` while closed and
  mounts the body fresh on every open (so tab/search/form state always starts clean and the default tab is
  chosen from the saved meals at that moment: **Yemeklerim** if there are any, else **Hazır Yemekler**).

  Tabs: `Yemeklerim` (only when `canSaveMeals`), `Hazır Yemekler`, `Tarifler`. "Sana uygun" shows on the
  Hazır tab only when the search box is empty and there is at least one recommendation; it is labeled
  "Tahmini hedefine göre" when the user has no saved Kişisel Plan profile, else "Kalan hedefine göre".
  Deleting a saved meal asks first (`ConfirmModal onTop`).

Create `src/components/MealsSheet.tsx`:

```tsx
import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";
import { recipeSteps, type Combo, type PortionId } from "@/lib/combos";
import { recommendMeals } from "@/lib/mealRecommend";
import type { MealSlot } from "@/lib/mealPlan";
import type { MacroTotals } from "@/lib/mealNutrition";
import { loadMealPortion, saveMealPortion } from "@/lib/preferences";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  annotateSavedMeals,
  savedMealToCombo,
  type NewSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";
import { uid } from "@/lib/store";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { LoadingBlock } from "@/components/LoadingBlock";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MealRow } from "@/components/MealRow";
import { SavedMealForm, type SavedMealFormData } from "@/components/SavedMealForm";

type Tab = "mine" | "ready" | "recipes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // The meal slot the sheet was opened for; null while closed.
  slot: MealSlot | null;
  // Every built-in meal, hard-exclusions already dropped (scoreAllCombos output).
  combos: ScoredCombo[];
  catalog: NutritionMap;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  // "Sana uygun" inputs: the viewed day's remaining macros, which slots already
  // have entries, and whether the targets are only an estimate (no saved profile).
  remaining: MacroTotals;
  filledSlots: ReadonlySet<MealSlot>;
  targetsEstimated: boolean;
  // Yemeklerim. `canSaveMeals` is false until there is a signed-in user.
  canSaveMeals: boolean;
  savedMeals: SavedMeal[];
  savedLoading: boolean;
  onCreateSaved: (input: NewSavedMeal) => Promise<SavedMeal | null>;
  onUpdateSaved: (id: string, input: Omit<NewSavedMeal, "id">) => Promise<SavedMeal | null>;
  onDeleteSaved: (id: string) => Promise<boolean>;
  // `factor` is the portion multiplier over the meal's authored grams (1 = as
  // saved/authored); the caller scales the items with scaleComboItems.
  onSelect: (combo: Combo, factor: number) => void;
};

// Mounted fresh on every open (the wrapper returns null while closed), so its
// state — tab, search, form — always starts clean and the default tab is
// chosen from the saved meals as they are at that moment.
export function MealsSheet(props: Props) {
  if (!props.isOpen) return null;
  return <MealsSheetBody {...props} />;
}

type View = { kind: "list" } | { kind: "form"; editing: SavedMeal | null };

const sectionLabel = "ledger text-xs uppercase tracking-widest text-muted-foreground";

function MealsSheetBody({
  onClose,
  slot,
  combos,
  catalog,
  foods,
  exclusions,
  allergenExclusions,
  remaining,
  filledSlots,
  targetsEstimated,
  canSaveMeals,
  savedMeals,
  savedLoading,
  onCreateSaved,
  onUpdateSaved,
  onDeleteSaved,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<Tab>(
    canSaveMeals && savedMeals.length > 0 ? "mine" : "ready"
  );
  const [view, setView] = useState<View>({ kind: "list" });
  const [query, setQuery] = useState("");
  // The last tier picked — what tapping a built-in row's body adds, so the old
  // one-tap "tap a meal, it's added" flow stays one tap.
  const [portion, setPortion] = useState<PortionId>(loadMealPortion);
  // Only one custom-multiplier editor open at a time; keyed by the row's DOM id.
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SavedMeal | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const queryLower = query.trim().toLocaleLowerCase("tr-TR");

  const matches = (name: string) =>
    !queryLower || name.toLocaleLowerCase("tr-TR").includes(queryLower);

  const recommendations = useMemo(
    () =>
      slot ? recommendMeals({ combos, slot, remaining, filledSlots, catalog }) : [],
    [combos, slot, remaining, filledSlots, catalog]
  );
  const savedEntries = useMemo(
    () => annotateSavedMeals(savedMeals, exclusions, allergenExclusions, catalog),
    [savedMeals, exclusions, allergenExclusions, catalog]
  );

  function add(combo: Combo, factor: number, rememberTier?: PortionId) {
    if (rememberTier) {
      setPortion(rememberTier);
      saveMealPortion(rememberTier);
    }
    onSelect(combo, factor);
    onClose();
  }

  async function submitForm(data: SavedMealFormData, addToSlot: boolean): Promise<boolean> {
    const editing = view.kind === "form" ? view.editing : null;
    const saved = editing
      ? await onUpdateSaved(editing.id, data)
      : await onCreateSaved({ id: uid(), ...data });
    if (!saved) return false;
    if (addToSlot) {
      onSelect(savedMealToCombo(saved), 1);
      onClose();
    } else {
      setView({ kind: "list" });
      setTab("mine");
      setQuery("");
    }
    return true;
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const ok = await onDeleteSaved(target.id);
    setNotice(ok ? null : `"${target.name}" silinemedi. Tekrar dene.`);
  }

  // Desktop keeps instant typing; a touch device browses first (rows are tall
  // and an auto-opened keyboard would leave room for ~2 of them).
  const autoFocusSearch =
    typeof window.matchMedia === "function" && !window.matchMedia("(pointer: coarse)").matches;

  const title =
    view.kind === "form" ? (view.editing ? "Yemeği düzenle" : "Yeni yemek") : "Yemekler";

  // ---- one row, three sources -------------------------------------------------
  const builtInRow = (combo: ScoredCombo, scope: string, activeTier: PortionId) => {
    const domId = `${scope}-${combo.id}`;
    return (
      <MealRow
        key={domId}
        combo={combo}
        catalog={catalog}
        domId={domId}
        showTiers
        activeTier={activeTier}
        editing={editingRow === domId}
        onStartEdit={() => setEditingRow(domId)}
        onCancelEdit={() => setEditingRow(null)}
        onAdd={add}
      />
    );
  };

  const savedRow = (entry: (typeof savedEntries)[number], scope: string) => {
    const { meal, scored, blocked } = entry;
    if (!scored) {
      return (
        <div
          key={`${scope}-${meal.id}`}
          className="rounded-lg border border-border bg-background p-3 opacity-70">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground">{meal.name}</h4>
            <button
              type="button"
              onClick={() => setDeleting(meal)}
              aria-label={`${meal.name} yemeğini sil`}
              className="text-muted-foreground hover:text-signal active:text-signal">
              <Trash2 className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-signal">
            {blocked === "excluded"
              ? "Hassasiyet listendeki bir besin içerdiği için gösterilmiyor."
              : "Bir besinin besin değeri artık yok; eklenemiyor."}
          </p>
        </div>
      );
    }
    const domId = `${scope}-${meal.id}`;
    return (
      <MealRow
        key={domId}
        combo={scored}
        catalog={catalog}
        domId={domId}
        showTiers={false}
        activeTier={portion}
        editing={editingRow === domId}
        onStartEdit={() => setEditingRow(domId)}
        onCancelEdit={() => setEditingRow(null)}
        onAdd={add}
        actions={
          <>
            <button
              type="button"
              onClick={() => setView({ kind: "form", editing: meal })}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground active:text-foreground">
              <Pencil className="size-3.5" />
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => setDeleting(meal)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-signal active:text-signal">
              <Trash2 className="size-3.5" />
              Sil
            </button>
          </>
        }
      />
    );
  };

  // ---- tab bodies -------------------------------------------------------------
  const empty = (text: string) => (
    <div className="py-8 text-center text-sm text-muted-foreground">{text}</div>
  );

  let body;
  if (tab === "mine") {
    const rows = savedEntries.filter((entry) => matches(entry.meal.name));
    body = (
      <>
        <button
          type="button"
          onClick={() => setView({ kind: "form", editing: null })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary active:border-primary hover:text-primary active:text-primary">
          <span aria-hidden="true">+</span>
          Yeni Yemek
        </button>
        {savedLoading && savedMeals.length === 0 ? (
          <LoadingBlock className="h-20" />
        ) : rows.length > 0 ? (
          rows.map((entry) => savedRow(entry, "mine"))
        ) : savedMeals.length === 0 ? (
          empty("Henüz yemeğin yok. Sık yediğin bir öğünü buraya kaydet, sonra tek dokunuşla ekle.")
        ) : (
          empty(`"${query.trim()}" ile eşleşen yemeğin yok`)
        )}
      </>
    );
  } else if (tab === "ready") {
    const rows = combos.filter((combo) => matches(combo.nameTr));
    const showRecommendations = !queryLower && recommendations.length > 0;
    body = (
      <>
        {showRecommendations && (
          <section className="space-y-2">
            <div>
              <p className={sectionLabel}>Sana uygun</p>
              <p className="text-xs text-muted-foreground">
                {targetsEstimated ? "Tahmini hedefine göre" : "Kalan hedefine göre"}
              </p>
            </div>
            {recommendations.map((rec) => builtInRow(rec.combo, "rec", rec.portionId))}
            <p className={`${sectionLabel} pt-2`}>Tüm hazır yemekler</p>
          </section>
        )}
        {rows.length === 0
          ? empty(`"${query.trim()}" ile eşleşen yemek yok`)
          : rows.map((combo) => builtInRow(combo, "all", portion))}
      </>
    );
  } else {
    const savedRecipes = savedEntries.filter(
      (entry) => entry.scored && recipeSteps(entry.scored).length > 0 && matches(entry.meal.name)
    );
    const builtInRecipes = combos.filter(
      (combo) => recipeSteps(combo).length > 0 && matches(combo.nameTr)
    );
    body =
      savedRecipes.length + builtInRecipes.length === 0
        ? empty(
            queryLower
              ? `"${query.trim()}" ile eşleşen tarif yok`
              : "Henüz tarif yok. Bir yemek eklerken \"Hazırlama adımları ekle\" dersen burada görünür."
          )
        : (
          <>
            {savedRecipes.map((entry) => savedRow(entry, "recipe"))}
            {builtInRecipes.map((combo) => builtInRow(combo, "recipe", portion))}
          </>
        );
  }

  const tabItems: { value: Tab; label: string }[] = [
    ...(canSaveMeals ? [{ value: "mine" as const, label: "Yemeklerim" }] : []),
    { value: "ready", label: "Hazır Yemekler" },
    { value: "recipes", label: "Tarifler" },
  ];

  return (
    <BottomSheet title={title} titleId="meals-sheet-title" onClose={onClose}>
      {view.kind === "form" ? (
        <SavedMealForm
          foods={foods}
          catalog={catalog}
          exclusions={exclusions}
          allergenExclusions={allergenExclusions}
          initial={view.editing ?? undefined}
          canAddToSlot={slot !== null}
          onSubmit={submitForm}
          onCancel={() => setView({ kind: "list" })}
        />
      ) : (
        <>
          <div className="mb-3 shrink-0">
            <SmoothPillTabs
              value={tab}
              onChange={(next: Tab) => {
                setTab(next);
                setEditingRow(null);
              }}
              items={tabItems}
            />
          </div>

          <div className="relative mb-4 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Yemek ara..."
              value={query}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              autoFocus={autoFocusSearch}
              className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {notice && <p className="mb-2 shrink-0 text-xs text-signal">{notice}</p>}

          {/* min-h-0 + overscroll-contain: this list — not the search field —
              is what gives when the keyboard shrinks the sheet, and a scroll
              that hits its end must not chain into the sheet drag or the page
              behind. */}
          <div className="min-h-0 max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain">
            {body}
          </div>
        </>
      )}

      {deleting && (
        <ConfirmModal
          onTop
          destructive
          title="Bu yemek silinsin mi?"
          description={`"${deleting.name}" Yemeklerim'den kalıcı olarak silinecek. Planına daha önce eklediklerin değişmez.`}
          confirmLabel="Sil"
          cancelLabel="Vazgeç"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </BottomSheet>
  );
}
```

- [ ] **Step 4: Wire it into `MealPlanView.tsx`.** Fetch saved meals there (so the list is ready when the
  sheet opens), compute `remainingMacros` (viewed day's target − consumed) and `filledSlots`, widen
  `handleComboSelect`'s parameter to `Combo`, and swap `<RecipeSearchModal>` for `<MealsSheet>`.

Edit `src/components/MealPlanView.tsx` (apply exactly):

```diff
--- a/src/components/MealPlanView.tsx
+++ b/src/components/MealPlanView.tsx
@@ -8,6 +8,7 @@
 import { useMealPersonalization } from "@/hooks/useMealPersonalization";
 import { useRemainingToday } from "@/hooks/useRemainingToday";
 import { useBatchLedger } from "@/hooks/useBatches";
+import { useSavedMeals } from "@/hooks/useSavedMeals";
 import {
   MEAL_SLOTS,
   calculateItemsNutrition,
@@ -23,8 +24,8 @@
 import { BatchAllocateSheet } from "@/components/BatchAllocateSheet";
 import { FoodSearchModal } from "@/components/FoodSearchModal";
 import { MealShoppingConfirmModal } from "@/components/MealShoppingConfirmModal";
-import { RecipeSearchModal } from "@/components/RecipeSearchModal";
-import { ALL_COMBOS, scaleComboItems } from "@/lib/combos";
+import { MealsSheet } from "@/components/MealsSheet";
+import { ALL_COMBOS, scaleComboItems, type Combo } from "@/lib/combos";
 import { scoreAllCombos, type ScoredCombo } from "@/lib/comboMatch";
 import {
   matchEveningCombos,
@@ -53,7 +54,10 @@
   onRemoveShoppingItem,
 }: Props) {
   const { foods, catalogMap, status } = useFoodCatalog();
-  const { profile: personalizationProfile } = useMealPersonalization(userId);
+  const { profile: personalizationProfile, hasSavedProfile } = useMealPersonalization(userId);
+  // Yemeklerim — fetched here (not inside the sheet) so the list is already
+  // there when the "Yemekler" sheet opens.
+  const savedMeals = useSavedMeals(userId);
   const {
     date,
     dateLabel,
@@ -140,6 +144,19 @@
         carbsG: 0,
         fiberG: 0,
       };
+
+  // What is left of the viewed day's targets, and which slots already have
+  // entries — the inputs "Sana uygun" (src/lib/mealRecommend.ts) needs.
+  const remainingMacros: MacroTotals = {
+    kcal: targetMacros.kcal - totals.kcal,
+    proteinG: targetMacros.proteinG - totals.proteinG,
+    fatG: targetMacros.fatG - totals.fatG,
+    carbsG: targetMacros.carbsG - totals.carbsG,
+    fiberG: targetMacros.fiberG - totals.fiberG,
+  };
+  const filledSlots = new Set<MealSlot>(
+    MEAL_SLOTS.filter(({ slot }) => itemsForSlot(slot).length > 0).map(({ slot }) => slot),
+  );
 
   // DEC-060 extension (src/lib/eveningRecommend.ts) — quantity-solved
   // protein+carb patterns against today's real remaining macros, distinct
@@ -221,7 +238,7 @@
   // combos.ts) — every ingredient is scaled together, so the meal's protein
   // and carb portions stay proportional. The logged comboId is unchanged:
   // it's provenance, the grams are what actually count.
-  function handleComboSelect(combo: ScoredCombo, factor: number) {
+  function handleComboSelect(combo: Combo, factor: number) {
     if (!activeSlot) return;
     for (const item of scaleComboItems(combo.items, factor)) {
       const nutrition = lookupNutrition(catalogMap, item.foodId);
@@ -477,16 +494,28 @@
         onSelect={handleFoodSelect}
       />
 
-      {/* Meal picker */}
-      <RecipeSearchModal
-        title="Yemekler"
-        combos={scoredCombos}
-        catalog={catalogMap}
+      {/* Meal picker: Yemeklerim / Hazır Yemekler / Tarifler */}
+      <MealsSheet
         isOpen={comboModalOpen}
         onClose={() => {
           setComboModalOpen(false);
           setActiveSlot(null);
         }}
+        slot={activeSlot}
+        combos={scoredCombos}
+        catalog={catalogMap}
+        foods={foods}
+        exclusions={personalizationProfile.foodExclusions}
+        allergenExclusions={personalizationProfile.allergenExclusions}
+        remaining={remainingMacros}
+        filledSlots={filledSlots}
+        targetsEstimated={!hasSavedProfile}
+        canSaveMeals={!!userId}
+        savedMeals={savedMeals.savedMeals}
+        savedLoading={savedMeals.isLoading}
+        onCreateSaved={savedMeals.create}
+        onUpdateSaved={savedMeals.update}
+        onDeleteSaved={savedMeals.remove}
         onSelect={handleComboSelect}
       />
 
```

- [ ] **Step 5: Delete `src/components/RecipeSearchModal.tsx`** (its only importer was `MealPlanView`).

- [ ] **Step 6: Verify.** `npm run build` must pass with no unused-import errors. Then
  `grep -rn "RecipeSearchModal" src` should return only comments (update any that now mislead).

---

## Task 6: Live verification (real app)

**Prerequisite — stop and ask the user:** *"Please run `supabase/28-saved-meals.sql` in the Supabase SQL
editor and tell me when it's done."* Do not continue until they confirm. Without it, `/api/saved-meals`
returns 502 (the UI degrades gracefully — Yemeklerim is empty and saving shows an error — but nothing
persists).

Use the `CLAUDE.md` Playwright procedure: check `:3000` first; if it is the developer's server you must
restart it to pick up `vercel.json` and the API change — **say so before doing it**; comment out the
`api/agent-login.ts` line in `.vercelignore`, log in with `agent-login` (a **throwaway account** for
anything that creates data), and **restore the line when done**. Check at 390×844 and 360×800. Do not
build automated interaction tests for gestures/keyboard.

- [ ] **API:** `GET /api/saved-meals` → `200 []` for a new account. `POST` a meal (`id`, `name`, `items`
  `[{food_id, quantity_g}]`, optional `steps`) → `201`. `PATCH ?id=` → `200`. `DELETE ?id=` → `200`, then
  `404` on repeat. Oversized input (name > 60 chars, 41 items, 31 steps) → `400`. Unauthenticated → `401`.
- [ ] **Isolation:** with a **second** throwaway account, `GET /api/saved-meals` must **not** return the
  first account's meal, and `PATCH`/`DELETE ?id=<first account's id>` must `404`.
- [ ] **Yemeklerim:** `+ Yeni Yemek` → add foods + grams (edit a gram value in place, remove one), name it,
  **Kaydet** → back on Yemeklerim with the meal on top. Reload the page → it is still there. **Kaydet ve
  ekle** from a slot → the sheet closes and that slot shows one entry per ingredient at the **saved
  grams**. Tapping a saved meal's row adds it; the pencil opens "Kat sayısı" and adds a scaled copy.
- [ ] **Sheet default tab:** with zero saved meals the sheet opens on Hazır Yemekler; with ≥ 1 it opens on
  Yemeklerim.
- [ ] **Blocked meals:** add a food to the account's exclusions (Kişisel Plan, allergy) that a saved meal
  contains → the meal shows disabled with "Hassasiyet listendeki bir besin içerdiği için gösterilmiyor."
  (not hidden, not addable, still deletable).
- [ ] **Recipes:** create a meal with steps → it shows a **Tarif** badge, appears under **Tarifler**, and
  "Tarifi göster" expands the numbered steps without adding the meal. The 7 built-in `prepNote` meals
  appear under Tarifler too, with one paragraph.
- [ ] **Edit / delete:** Düzenle opens the form pre-filled (the sheet title reads exactly
  **"Yemeği düzenle"**); saving updates the row. Sil asks "Bu yemek silinsin mi?" **above** the sheet;
  confirming removes it; entries already in the plan are unaffected.
- [ ] **Sana uygun:** on a slot, the block shows ≤ 4 meals; the filled chip is the recommended tier.
  Breakfast slot → only breakfast meals; snack slot → light meals. Fill the day → tiers shrink; exceed the
  day's kcal → the block disappears. Typing in the search box hides it. Tapping a recommended row adds it
  at the recommended tier and **does not** change the tier highlighted on ordinary rows next time.
  Browsing to another day changes the suggestions (it uses that day's remaining).
- [ ] **Unchanged behavior:** Ürünler picker; the ordinary Hazır rows' tier chips / remembered tier / custom
  multiplier; "Toplu Hazırlıklar" (the batch form's manual mode still works, now with editable grams);
  "Akşam için öneriler".
- [ ] **Cleanup:** the app builds and runs without `MealTrackingView`; the Ürünler sheet looks unchanged.
- [ ] **Not verifiable here — tell the user to test on a real phone:** swipe-to-dismiss while a list is
  scrolled, the soft keyboard in the name field / the food picker / the steps textarea, the three-pill tab
  row on a 360 px screen, and the delete confirmation sitting above the sheet.
- [ ] **Restore** the `.vercelignore` `api/agent-login.ts` line; leave the test accounts as found (delete
  the throwaway ones via the flow `CLAUDE.md` allows).

---

## Task 7: Docs close-out (CLAUDE.md trio rule — one unit of work)

CLAUDE.md requires these to move together. Read each file's current wording first and keep its style.

- [ ] **`docs/mvp-scope/meal-construction-mvp.md`** — add an "Update <date> — Yemeklerim / Tarifler" note
  under the existing update notes: the three-tab sheet; user-authored saved meals (per user, `saved_meals`);
  a saved meal with steps is a recipe (no separate recipe type); "Sana uygun" (deterministic, slot-aware;
  the weights are MVP tuning constants). **Rewrite "Item 2" and "Item 3"** to state what is now true and
  what is not: user recipes exist and their nutrition comes from catalog-resolved ingredients (the form
  only offers catalog foods), so the "no verified nutrition data" catch is resolved by construction;
  recipe-level detail is available only as the user's own free text (DEC-067 re-scoped, see below);
  **food-safety guidance (cooling / freezing / reheating) is still out of scope**. Note the batch form does
  not yet list saved meals.
- [ ] **`docs/roadmap_v2.md`** — under "Meal Construction/Prep": the "add, update, delete these recipes"
  line becomes `SHIPPED <date> (user-authored saved meals with optional steps; see
  docs/mvp-scope/meal-construction-mvp.md)`. Leave the "sections like ingredients, preparation, cooking,
  serve, storing" line `MISSING`, with a short note that only free-text preparation steps exist.
- [ ] **`nutrition-curriculum/DEC_REGISTER.md`** — `DEC-067` row note: keep `SHIPPED` and Level 1 for
  Grocery's curated meals; add "user-authored meals may carry the user's own free-text preparation steps
  (display-only, not Grocery guidance) — see docs/mvp-scope/meal-construction-mvp.md". `DEC-066` note: add
  that saved meals extend construction; see the same file. **This is a scoping of an existing ratification
  and needs the owner's explicit confirmation (Decision 2)** — if they decline, leave out the steps textarea in
  `SavedMealForm` and the Tarifler tab.
- [ ] **`docs/mvp-scope/README.md`** — the Domain L row's status text: add Yemeklerim / Tarifler /
  "Sana uygun" to the list of what shipped.
- [ ] **`docs/superpowers/plans/README.md`** — flip this plan's row from `NOT_STARTED` to `SHIPPED` with
  evidence. (The row for this plan, the `SUPERSEDED` status on `2026-09-12-saved-meal-templates.md`, and the
  `SUPERSEDED` vocabulary entry were already added when the plan was written.)
- [ ] **`docs/architecture.md`** — add a short "Saved meals (Yemeklerim)" subsection under "Personal meal
  planning": the `saved_meals` table (per user, RLS on `user_id` via `app_private.current_app_user_id()`),
  that it is served by `api/personal-plan.ts` at `/api/saved-meals` through the `vercel.json` rewrite, that
  this is why no new function was added, and that "Sana uygun" is `src/lib/mealRecommend.ts` (pure; slot
  weights are tuning constants). Update the "Function count limit" note if it lists resources.
- [ ] **`docs/session-checkpoints/`** — a dated record (next sequence number for the day) and a line in
  `docs/SESSION_FOLLOWUP.md`. Say what needs a phone test and that `28-saved-meals.sql` must be applied
  wherever this is deployed.
- [ ] **`CLAUDE.md`** — no change needed unless the "Bottom sheets" guidance should mention `ConfirmModal
  onTop`; add one sentence there if so.

---

## Self-Review (done at plan-writing time)

**Requirement → task**

| Requirement (owner, 2026-09-20) | Where |
| --- | --- |
| Meal cards keep only `Ürünler` / `Yemekler`; no new big buttons | Global Constraints; Task 5 changes only the sheet |
| Yemekler opens the existing sheet for any slot, tabs `Yemeklerim / Hazır Yemekler / Tarifler` | Task 5 (`MealsSheet`) |
| Yemeklerim: personal reusable meals, one tap, saved grams preserved, no intermediate screens | Tasks 3, 5 (row body adds at factor 1) |
| Hazır Yemekler = database meals + "Sana uygun" (3–5) above the full list | Tasks 2, 5 |
| Deterministic filter → score → top N, from remaining macros / Personal Plan / slot | Task 2 (`mealRecommend.ts`) |
| Recipes = meals with steps; no Meal/Recipe choice; no duplicate entry | Tasks 2, 5 (`steps`, `recipeSteps`) |
| "Yeni Yemek" lives in Yemeklerim; optional "Hazırlama adımları ekle" | Task 5 (`SavedMealForm`) |
| No "Menü" concept | Not introduced (table is `saved_meals`) |
| Recommendation design extensible (dedicated tab, more results, caching, AI, recipes) | `RecommendedMeal` shape, `limit`, `combos` input is any `ScoredCombo[]` |
| Fast add preserved, no confirmation screens | Row tap adds immediately; only delete confirms |
| Reuse existing components, no unnecessary abstractions | `BottomSheet`, `SmoothPillTabs`, `MealFoodPicker`, `handleComboSelect`, `scoreInstance` reused; two extractions (`MealRow`, `MealCompositionEditor`) remove duplication rather than add layers |

**Deliberately not in this plan:** a dedicated "Sana Uygun" tab; 15–20 results; AI ranking; precomputed /
cached recommendations (the pure function is the seam for them); household-shared meals; saved meals in
the batch form's "Yemekten" list; "save this slot as a meal" from a meal card (would add a card button);
per-role portion scaling; merging or removing "Akşam için öneriler"; the `"today"` tab value in
`useUiPrefs.ts`; fixing the two "Ara Öğün" labels; food-safety (cooling/freezing/reheating) content.

**Known limits, stated so nobody is surprised:** only 6 of the 20 built-in meals carry a slot tag, so the
breakfast slot has at most 4 suggestions and the snack slot ~4 (a `limit` of 4 is a ceiling, not a
guarantee); the slot weights are unvalidated tuning constants; a saved meal stores only foods and grams —
totals are always derived from the live nutrition catalog, so editing a food's nutrition updates them, and
a food removed from the catalog blocks the meal (shown disabled); `tsc` does not compile `archive/`.

**Type consistency:** `Combo` gains optional `steps` (built-ins never set it); `handleComboSelect` takes
`Combo` (a `ScoredCombo` is one); `MealsSheet.onSelect(combo: Combo, factor)`; `MealRow.onAdd(combo:
ScoredCombo, factor, rememberTier?)`; `SavedMeal.items` is `BatchCompositionItem[]` (same as batches);
`ConfirmModal.onTop` is optional, so its other callers are untouched.
