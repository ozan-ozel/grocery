# Gram-to-Household-Unit Conversion UX Proposal & Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** Sonnet 5 — new data file plus a formatting utility with real numeric edge
cases (rounding, unit selection) worth getting right.

**Scope:** Frontend only (a static, hand-authored data file — no Supabase/API changes).

**Goal:** Show a gram quantity's equivalent in everyday Turkish household measures (tatlı kaşığı,
çay kaşığı, yemek kaşığı, kepçe, su bardağı, çay bardağı) alongside the gram value, without
forcing every user through an extra unit-picking step.

**Architecture:** Gram stays the single source of truth everywhere it already is (meal item
storage, `meal_entries.quantity_g`, the editable-gram input from
`2026-09-12-editable-meal-item-grams.md`) — this feature only adds a read-only, best-effort
"≈ X birim" helper line under that same input. A small, hand-authored, per-food conversion table
(`data/household-units.json`, bundled into the client build exactly like `data/combos.json` — see
Design Proposal below for why this beats a universal gram→unit formula) supplies the grams-per-unit
factor for the minority of foods where a spoon/glass/ladle measure is actually meaningful; foods
with no entry simply show no helper line, which is itself the correct, honest answer for e.g. a
packaged snack that has no natural "su bardağı" equivalent.

**Tech Stack:** A new static JSON data file (build-time bundled, no Supabase/API changes), one
small pure formatting utility, one UI insertion point.

**Spec:** No separate spec doc — derived from the product owner's request (2026-09-12): "Gram
bilgisinin tatlı/çay/yemek kaşığı, kepçe, su bardağı, çay bardağı gibi farklı birimlerdeki
karşılıklarını kullanıcıya sunmak istiyoruz. Bunu UX'i zorlamadan yapmamız için bir çözüm öner."
Ground truth: `data/combos.json` + `data/README.md` (precedent for a hand-authored,
client-bundled data file that isn't uploaded to Supabase), `src/lib/mealNutrition.ts`
(`scaleNutrition`'s per-100g math, the same shape a per-unit conversion needs),
`src/components/MealItemCard.tsx` (the gram input this attaches to, from the editable-grams plan).

## Global Constraints

- No test suite exists; verify with `npm run build` and `npm run vercel:dev`.
- Never commit without an explicit request; branch first.
- **Depends on** `2026-09-12-editable-meal-item-grams.md` having landed first — this plan attaches
  its helper text to the gram `<input>` that plan creates in `MealItemCard.tsx`.
- The helper text is informational only, never a required interaction: a user who never looks at
  it must be able to add/edit every meal item exactly as before. Never replace the gram input with
  a unit input, and never block saving on a missing conversion entry.
- Conversion factors are inherently food-specific (a tablespoon of flour ≈ 8g; a tablespoon of
  olive oil ≈ 13.5g; a tablespoon of water ≈ 15g) — never introduce a single universal
  gram-per-spoon constant. See Design Proposal, Option A, for why this rules out the "obvious"
  simplest implementation.

---

## Design Proposal

**Problem shape:** the six requested units (tatlı kaşığı, çay kaşığı, yemek kaşığı, kepçe, su
bardağı, çay bardağı) are volume measures; grams-per-unit for a volume measure depends on the
food's density, which varies by roughly 5x across common foods (water ≈ 1g/ml, flour ≈ 0.5g/ml,
olive oil ≈ 0.92g/ml, granulated sugar ≈ 0.85g/ml). There is no honest single conversion table
that works for every food — it has to be per-food (or at least per food-category) data, not a
formula.

**Option A — universal density-free constants (rejected).** Hard-code "1 yemek kaşığı = 15g" for
every food. Fast to build, wrong often enough to actively mislead (a tablespoon of oats is closer
to 8g, of tahini closer to 18g) — this would ship a feature that quietly lies to users planning
their actual intake, which is worse than not having the feature.

**Option B — full per-food density metadata in Supabase, editable via the Besin tab (deferred,
not this plan).** Add real density (g/ml) to every `nutrition` row and compute unit equivalents
from a fixed volume-per-unit table (a Turkish çay bardağı ≈ 100ml, su bardağı ≈ 200ml, yemek
kaşığı ≈ 15ml, tatlı kaşığı ≈ 10ml, çay kaşığı ≈ 5ml, kepçe ≈ 150ml as a ladle-of-soup
approximation). This is the "correct" long-term shape — it scales to every food in the catalog and
becomes user-correctable — but it's a real schema migration plus editor UI work
(`api/nutrition.ts`, `NutritionEditorRow.tsx`, `NutritionUpload.tsx`, `data/nutrition.json`'s
row schema in `data/README.md`) for a feature that only matters for a fairly small set of staple
foods people actually measure by spoon/glass rather than by package or count. Worth revisiting
once Option C's coverage proves the feature earns its UI space — flagged in Roadmap Note below,
not built here.

**Option C — small, hand-authored per-food unit table, additive and sparse (recommended, this
plan).** A new `data/household-units.json`, structured and bundled exactly like
`data/combos.json` (see `data/README.md`'s own description of that file: "not uploaded to
Supabase... bundled directly into the client build and edited by hand"). Each row: `{ food_id,
grams_per_unit: { corba_kasigi?: number, cay_kasigi?: number, yemek_kasigi?: number, kepce?:
number, su_bardagi?: number, cay_bardagi?: number } }` — a food only lists the units that are
actually meaningful for it (a whole egg lists none; milk lists `su_bardagi`/`cay_bardagi`; flour
lists `yemek_kasigi`/`su_bardagi`; olive oil lists `yemek_kasigi`/`tatli_kasigi`/`cay_kasigi`).
Ships with ~25-30 common staples (grains, dairy, oils, sugar, flour, water-based liquids) and
grows by hand over time, the same maintenance model `combos.json` already uses successfully.

**UX for the non-blocking requirement:** the gram input (from the editable-grams plan) gains one
small, grey, non-interactive line directly beneath it — e.g. "≈ 1½ su bardağı" — computed live as
the gram value changes, picking the single best-fit unit (largest unit that divides evenly-ish
into the quantity, rounded to the nearest ½) rather than showing all six at once, which would be
visual noise for a number nobody asked to see six ways. A food with no `household-units.json`
entry shows nothing extra — the UI is identical to before this feature for the ~90%+ of foods
where a spoon/glass measure isn't meaningful (packaged goods, whole fruits/vegetables, meats,
etc.). This satisfies "UX'i zorlamadan" (without forcing the UX): zero new required taps, zero new
required fields, purely additive read-only context for the foods where it's honest to show.

**Recommendation:** build Option C now (this plan); note Option B as a Roadmap follow-up once
usage shows people actually rely on the spoon/glass line enough to justify editor UI + a schema
change.

---

## File Structure

- Create: `data/household-units.json` — hand-authored per-food unit table.
- Create: `data/household-units.README.md` section (append to `data/README.md`) — row schema.
- Create: `src/lib/householdUnits.ts` — loads the table, exposes
  `formatHouseholdUnit(foodId, quantityG): string | null`.
- Modify: `src/components/MealItemCard.tsx` — render the helper line under the gram input.

## Task 1: Data file + schema doc

**Files:**
- Create: `data/household-units.json`
- Modify: `data/README.md`

- [ ] **Step 1: Write the seed data file**

```jsonc
[
  {
    "food_id": "süt",
    "grams_per_unit": { "su_bardagi": 200, "cay_bardagi": 100 }
  },
  {
    "food_id": "un",
    "grams_per_unit": { "yemek_kasigi": 8, "su_bardagi": 120 }
  },
  {
    "food_id": "zeytinyağı",
    "grams_per_unit": { "tatli_kasigi": 9, "cay_kasigi": 4.5, "yemek_kasigi": 13.5 }
  },
  {
    "food_id": "toz şeker",
    "grams_per_unit": { "tatli_kasigi": 6, "cay_kasigi": 4, "yemek_kasigi": 12 }
  },
  {
    "food_id": "pirinç",
    "grams_per_unit": { "su_bardagi": 190 }
  },
  {
    "food_id": "su",
    "grams_per_unit": { "su_bardagi": 200, "cay_bardagi": 100, "yemek_kasigi": 15, "tatli_kasigi": 10, "cay_kasigi": 5 }
  },
  {
    "food_id": "yoğurt",
    "grams_per_unit": { "su_bardagi": 200, "yemek_kasigi": 18 }
  }
]
```

(`food_id` here matches `nutrition.name_tr`/aliases exactly, same value space as
`MealItem.foodId` — resolve it through the live catalog, not by assuming this JSON's spelling is
canonical, same rule `data/README.md` already states for `combos.json`'s `food_id`. Seed with
whatever ~25-30 staple foods actually exist in the current `data/nutrition.json`/live Supabase
catalog before merging — the four rows above are illustrative starting points, not a complete
list; verify each `food_id` resolves via `lookupNutrition` before shipping.)

- [ ] **Step 2: Document the schema**, append to `data/README.md` a new section modeled on its
  existing `## combos.json` section:

```markdown
## `household-units.json`

Optional, hand-authored gram-to-household-measure conversions, shown as a secondary "≈ 1½ su
bardağı"-style helper under a meal item's gram input (`src/lib/householdUnits.ts`). Sparse by
design: most foods have no entry and show no helper line at all — a spoon/glass measure is only
meaningful for a minority of staple foods (liquids, grains, sugar, flour, oil), not for packaged
or whole-item foods. Each row:

- `food_id` — resolved against the live Supabase `nutrition` table via `lookupNutrition`, exactly
  like `combos.json`'s `food_id` — not read directly against this file.
- `grams_per_unit` — an object with any subset of `tatli_kasigi` (dessert spoon), `cay_kasigi`
  (tea spoon), `yemek_kasigi` (tablespoon), `kepce` (ladle), `su_bardagi` (water glass, ~200ml),
  `cay_bardagi` (tea glass, ~100ml). Omit a unit entirely if it isn't a natural way to measure
  that food — never guess a value just to fill in every key.

Not uploaded to Supabase — bundled directly into the client build and edited by hand, same as
`combos.json`.
```

- [ ] **Step 3: Stop for review.**

## Task 2: Formatting utility

**Files:**
- Create: `src/lib/householdUnits.ts`

**Interfaces:**
- Produces: `formatHouseholdUnit(foodId: string, quantityG: number): string | null`.

- [ ] **Step 1: Write the module**

```typescript
import householdUnitsData from "../../data/household-units.json";

type UnitKey = "tatli_kasigi" | "cay_kasigi" | "yemek_kasigi" | "kepce" | "su_bardagi" | "cay_bardagi";

const UNIT_LABELS: Record<UnitKey, string> = {
  tatli_kasigi: "tatlı kaşığı",
  cay_kasigi: "çay kaşığı",
  yemek_kasigi: "yemek kaşığı",
  kepce: "kepçe",
  su_bardagi: "su bardağı",
  cay_bardagi: "çay bardağı",
};

// Larger units first — formatHouseholdUnit prefers the biggest unit that
// still rounds to a reasonably clean fraction, so "1 su bardağı" wins over
// "16 yemek kaşığı" for the same 200g of milk.
const UNIT_ORDER: UnitKey[] = ["su_bardagi", "kepce", "cay_bardagi", "yemek_kasigi", "tatli_kasigi", "cay_kasigi"];

type RawRow = { food_id: string; grams_per_unit: Partial<Record<UnitKey, number>> };

const BY_FOOD_ID = new Map<string, Partial<Record<UnitKey, number>>>(
  (householdUnitsData as RawRow[]).map((row) => [row.food_id, row.grams_per_unit]),
);

// Rounds to the nearest ¼ unit, and only accepts results that read as a
// clean-ish fraction (quarters) — anything that would round to something
// like "0.37 su bardağı" is rejected as not a good display candidate for
// that unit, and the next unit down is tried instead.
function roundToQuarter(value: number): number | null {
  const rounded = Math.round(value * 4) / 4;
  if (rounded <= 0) return null;
  return rounded;
}

function formatFraction(value: number): string {
  const whole = Math.floor(value);
  const frac = value - whole;
  const fracLabel = frac === 0.25 ? "¼" : frac === 0.5 ? "½" : frac === 0.75 ? "¾" : "";
  if (whole === 0) return fracLabel || "0";
  return fracLabel ? `${whole}${fracLabel}` : `${whole}`;
}

// Returns null when this food has no conversion data at all, or when no
// unit produces a clean-enough fraction for this exact quantity — in both
// cases the caller shows no helper line, which is the correct, honest
// default (see the plan's Design Proposal for why a universal fallback
// constant is rejected).
export function formatHouseholdUnit(foodId: string, quantityG: number): string | null {
  const unitsForFood = BY_FOOD_ID.get(foodId);
  if (!unitsForFood || quantityG <= 0) return null;

  for (const unit of UNIT_ORDER) {
    const gramsPerUnit = unitsForFood[unit];
    if (!gramsPerUnit) continue;
    const quantity = roundToQuarter(quantityG / gramsPerUnit);
    if (quantity === null) continue;
    // Skip a unit that would show as "12¼ yemek kaşığı" — past ~4 units,
    // the next-larger unit (or grams alone, if none left) reads better.
    if (quantity > 4 && unit !== UNIT_ORDER[UNIT_ORDER.length - 1]) continue;
    return `${formatFraction(quantity)} ${UNIT_LABELS[unit]}`;
  }
  return null;
}
```

- [ ] **Step 2: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Manual spot-check (no test suite — verify by hand)**

In a scratch file or the browser console after building, confirm:
`formatHouseholdUnit("süt", 200)` → `"1 su bardağı"`; `formatHouseholdUnit("süt", 100)` →
`"1 çay bardağı"`; `formatHouseholdUnit("zeytinyağı", 13.5)` → `"1 yemek kaşığı"`;
`formatHouseholdUnit("elma", 150)` (a food with no entry) → `null`. Delete the scratch file
afterward — per this repo's convention, a one-off verification script doesn't stay in the tree.

- [ ] **Step 4: Stop for review.**

## Task 3: Show the helper line under the gram input

**Files:**
- Modify: `src/components/MealItemCard.tsx`

**Interfaces:**
- Consumes: `formatHouseholdUnit(foodId, quantityG): string | null` from Task 2. Requires the
  gram `<input>` from `2026-09-12-editable-meal-item-grams.md` to already exist in this file.

- [ ] **Step 1: Import it and compute the helper string from the live `draft` value**

```diff
 import { X } from "lucide-react";
 import { useEffect, useState } from "react";
 import type { MealItem } from "@/lib/localMealPlan";
 import type { Nutrition } from "@/lib/nutrition";
 import { scaleNutrition } from "@/lib/mealNutrition";
+import { formatHouseholdUnit } from "@/lib/householdUnits";
```

```typescript
  const draftQuantity = Number(draft);
  const householdUnit =
    Number.isFinite(draftQuantity) && draftQuantity > 0
      ? formatHouseholdUnit(item.foodId, draftQuantity)
      : null;
```

(uses `draft`, the same live-typed state the editable-grams plan already added — the helper
updates as the user types, not only after committing.)

- [ ] **Step 2: Render it**

```diff
               <input ... />
               g
+              {householdUnit && (
+                <span className="ml-1 text-muted-foreground/70">≈ {householdUnit}</span>
+              )}
             </p>
```

- [ ] **Step 3: Run the typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run vercel:dev`, open "Yemek Planı", add "Süt" (or whichever seeded food you verified
in Task 2) at 200g. Expected: the gram field shows "200 g ≈ 1 su bardağı" in muted text next to
it, updating live as the number is edited (e.g. changing to 100 flips it to "≈ 1 çay bardağı").
Add a food with no `household-units.json` entry — expected: no "≈" text appears at all, and the
row looks exactly as it did before this plan.

- [ ] **Step 5: Stop for review**

Do not commit. Leave the diff for the repo owner to review.

---

## Roadmap Note

If usage shows the spoon/glass helper is heavily relied on and its ~25-30-food coverage feels
thin, revisit Option B from the Design Proposal above: real per-food density metadata in
Supabase, editable through the Besin tab's existing row editor, replacing the static JSON file
with live, user-correctable data. Not scoped into this plan.

## Self-Review Notes

- **Spec coverage:** "tatlı/çay/yemek kaşığı, kepçe, su bardağı, çay bardağı" → all six units
  modeled in `UnitKey`/`UNIT_LABELS`; "kullanıcıya sunmak" → Task 3's helper line;
  "UX'i zorlamadan" → Design Proposal's non-blocking, purely-additive framing, enforced by Global
  Constraints (never replace the gram input, never require a conversion entry).
- **Placeholder scan:** none — seed data rows are real illustrative values with a note to verify
  against the live catalog before merging (not a `TODO`, an explicit verification step).
- **Type consistency:** `formatHouseholdUnit`'s signature matches its one call site in Task 3
  exactly (`foodId: string, quantityG: number`).
