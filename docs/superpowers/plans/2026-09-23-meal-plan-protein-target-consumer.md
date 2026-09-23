# Meal-Plan Per-Occasion Protein Target Consumer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Recommended Model:** cheap/fast tier — two files, a fully specified prop and render change, no
new logic to design.

**Scope:** Frontend only. `occasionProteinTargetG()` (the formula) already exists and is not
touched by this plan.

**Goal:** Show each meal-plan slot's protein target next to the protein actually logged there, so a
user sees whether they're roughly on track before the day is over — not just what they've eaten.

**Architecture:** `occasionProteinTargetG(weightKg)` in `src/lib/mealPersonalization.ts` already
computes a `{min, max}` gram band per occasion; nothing calls it today. `MealContainer.tsx`'s header
already shows consumed protein (`P: {Math.round(totals.proteinG)}g`) next to kcal/carbs/fat. This
plan wires the existing function into that existing display line — no new component, no new API
call, no persisted state.

**Tech Stack:** Preact function components — no new API or DB work.

**Spec:** `nutrition-curriculum/09_HANDOFF_SPECS/DEC-033-per-occasion-protein-consumer.md` (DEC-033,
readiness `PROVISIONAL`). That spec is the binding authority for exact values/copy; this plan
restates it as a single task for subagent-driven-development.

## Global Constraints

- No test suite exists; verify with `npm run build` (`tsc -b`) and, if practical, `npm run
  vercel:dev`.
- Never commit without an explicit request beyond "implement this plan" — branch first (already
  done: `feature/meal-plan-protein-target-consumer`).
- Display-only. No gating, no warning styling, no change to `occasionProteinTargetG`'s formula or
  rounding, no redistribution by occasion size/timing/training (that's DEC-035/DEC-057, out of
  scope).
- Reuse the existing "hedef" (target) wording convention already used elsewhere in the app
  (`PersonalPlanView.tsx`, `MealsSheet.tsx`) — do not invent new copy conventions.
- This plan depends on nothing else in this batch and nothing else in this batch depends on it.

---

## File Structure

- Modify: `src/components/MealContainer.tsx` — new required prop `proteinTargetG: { min: number;
  max: number }`; header render change.
- Modify: `src/components/MealPlanView.tsx` — compute the target once per render from the
  personalization profile's `weightKg`, pass it to the (single) `<MealContainer>` render site.

## Task 1: Wire `occasionProteinTargetG` into the meal-slot header

**Files:**
- Modify: `src/components/MealContainer.tsx`
- Modify: `src/components/MealPlanView.tsx`

**Interfaces:**
- Produces: new prop `proteinTargetG: { min: number; max: number }` on `MealContainer`'s `Props`
  type.
- Consumes: `occasionProteinTargetG(weightKg: number): { min: number; max: number }`, exported from
  `src/lib/mealPersonalization.ts` (already exists, already exported — no changes needed there).
  Consumes `personalizationProfile.weightKg`, already available in `MealPlanView.tsx` via
  `const { profile: personalizationProfile, hasSavedProfile } =
  useMealPersonalization(userId);` (existing line — do not change how this is obtained).

**Build this** (copied from the DEC-033 spec — follow these steps exactly; the spec is the source
of truth if anything here seems to conflict with it):

1. In `MealContainer.tsx`, add a required prop `proteinTargetG: { min: number; max: number }` to
   the component's `Props` type and destructured parameters.
2. In the header — the `<p>` that currently renders `{Math.round(totals.kcal)} kcal · P:
   {Math.round(totals.proteinG)}g · K: {Math.round(totals.carbsG)}g · Y:
   {Math.round(totals.fatG)}g` only when `totals` is non-null — change the protein segment from
   `P: {Math.round(totals.proteinG)}g` to `P: {Math.round(totals.proteinG)}g /
   {proteinTargetG.min}-{proteinTargetG.max}g hedef`.
3. Also render the protein-target text when `totals` is null (nothing logged in that slot yet): a
   slot with 0g consumed should still show its target. Today the whole `<p>` is gated on `{totals
   && (...)}`; change that guard so the protein-target segment always renders (e.g. `P: 0g /
   {min}-{max}g hedef` when nothing is logged), while the kcal/carb/fat segments stay conditional
   on `totals` being non-null. Do not fabricate a `totals` object to satisfy this — branch the
   render so protein-target text is unconditional and the other three segments remain gated.
4. In `MealPlanView.tsx`, above the slot-mapping loop that renders `<MealContainer>` (the loop
   containing the single `<MealContainer ...>` call site), compute
   `occasionProteinTargetG(personalizationProfile.weightKg)` **once** (not once per slot — the
   band is identical for every slot) and pass that same object as `proteinTargetG` to every
   `<MealContainer>` instance the loop renders.
5. Import `occasionProteinTargetG` from `@/lib/mealPersonalization` in `MealPlanView.tsx`. No other
   change to that module, and no change to `getMealType`'s slot→container mapping.

**Do not build** (explicit scope fence — do not expand into any of these):
- Redistribution of the protein band by occasion size, timing, or training proximity.
- Any gating, warning color, or blocking behavior when consumed protein is outside the target
  range — display-only.
- Any change to `occasionProteinTargetG`'s formula, its 0.3-0.4 g/kg band, or its rounding.
- Any new profile field, endpoint, or persisted state.

**Verify:**
- `npm run build` passes (`tsc -b` — this repo has no test suite; do not add one).
- If practical in the sandbox, run `npm run vercel:dev` and open the meal plan to visually confirm
  each slot header shows `P: Xg / Y-Zg hedef`, including a slot with nothing logged yet.

**Commit:** one commit for this task, on the current branch
(`feature/meal-plan-protein-target-consumer` — already checked out; do not create another branch).
