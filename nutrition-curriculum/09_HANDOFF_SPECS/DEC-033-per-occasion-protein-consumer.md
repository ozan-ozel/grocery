# DEC-033 — Per-occasion protein target consumer

**Decision:** Determine how the protein requirement is distributed across the day's eating occasions.
**Ratification:** none — MVP-provisional. `occasionProteinTargetG()` in `src/lib/mealPersonalization.ts`
is already tagged `MVP-1 PROVISIONAL (PSM Iteration 1, DEC-033) / REVISIT AFTER QA-1`; this spec adds a
consumer for that existing, already-ratified-as-provisional function. It does not change the formula.

## Build this

`occasionProteinTargetG(weightKg)` exists (`src/lib/mealPersonalization.ts:249`) and returns
`{ min, max }` grams — a flat 0.3-0.4 g/kg band applied identically to every occasion, per
`docs/mvp-scope/macros-mvp.md`'s "Protein across eating occasions" section. Today nothing calls it. Give
it exactly one consumer: the per-slot protein line already shown in `MealContainer.tsx`'s header.

1. In `MealContainer.tsx`, add a required prop `proteinTargetG: { min: number; max: number }`.
2. In the header (`MealContainer.tsx`, the `<p>` that currently renders
   `{Math.round(totals.kcal)} kcal · P: {Math.round(totals.proteinG)}g · K: ... · Y: ...` when `totals`
   is non-null): change the protein segment from `P: {Math.round(totals.proteinG)}g` to
   `P: {Math.round(totals.proteinG)}g / {proteinTargetG.min}-{proteinTargetG.max}g hedef` — reusing the
   existing "hedef" wording convention (see `PersonalPlanView.tsx`, `MealsSheet.tsx`).
3. Also render this segment when `totals` is null (nothing logged in that slot yet) — a slot with 0g
   consumed should still show its target, so a user knows what to aim for before adding anything. When
   `totals` is null today the whole `<p>` is omitted (`{totals && (...)}`); change that guard so the
   protein-target text always renders, and the kcal/carb/fat segments still only render when `totals`
   is non-null (i.e. keep those conditional, just stop gating the whole line on `totals`).
4. In `MealPlanView.tsx`, at the single call site (`<MealContainer ...>`, currently line 447), compute
   `occasionProteinTargetG(personalizationProfile.weightKg)` once per render (not once per slot — the
   band is the same for every slot, so compute it once above the slot-mapping loop and pass the same
   object to every `<MealContainer>` instance) and pass it as `proteinTargetG`.
   `personalizationProfile` is already destructured in that file
   (`const { profile: personalizationProfile, hasSavedProfile } = useMealPersonalization(userId);`) and
   always has a `weightKg` (falls back to `DEFAULT_PROFILE.weightKg = 70` when nothing is saved yet, same
   as every other consumer of that profile) — no new loading/error state to handle.
5. Import `occasionProteinTargetG` from `@/lib/mealPersonalization` in `MealPlanView.tsx`. No other
   change to that module.

## Do not build

- No redistribution by occasion size, timing, or training proximity — that is `DEC-035`/`DEC-057`, both
  blocked on exercise-timing data the app does not collect. The band stays flat and identical across all
  three displayed slots (ilk/ara/son), exactly as `occasionProteinTargetG` already computes it.
- No gating, warning color, or blocking behavior when consumed protein falls outside the target range.
  Display-only, same as every other target/consumed pair already in this file's header.
- No change to `occasionProteinTargetG`'s formula, its 0.3-0.4 g/kg band, or its rounding.
- No new profile field, endpoint, or persisted state. `weightKg` already exists on `PersonalProfile`.
- No change to the 4-slot (`kahvalti`/`ogle`/`aksam`/`ara`) → 3-container (`ilk`/`ara`/`son`) mapping in
  `getMealType` — that grouping is unrelated to this DEC and out of scope here.

## Files likely touched

- `src/components/MealContainer.tsx` — new prop, header render change.
- `src/components/MealPlanView.tsx` — compute the target once, pass it down, one new import.

## Self-close checklist

- [ ] `npm run build` (`tsc -b`) passes
- [ ] Exercised in `npm run vercel:dev` (or `npm run dev` if no `/api/*` route is involved)
- [ ] Own branch, named for the change, merged to `master`, pushed
- [ ] Row in `../IMPLEMENTATION_HANDOFF.md` moved to Closed with status `DONE`
- [ ] `docs/mvp-scope/macros-mvp.md`'s "Protein across eating occasions" section note updated to say the
      consumer now exists (per `CLAUDE.md`'s trio rule, since this closes an item that section itself
      flagged as open)
