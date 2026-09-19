# 2026-09-19-02 — Batch preparation UI (implemented and live-verified)

Branch: `feature/batch-preparation-ui` — the plan was written first, then implemented against it on the
same branch and verified live; nothing committed yet. See "Status" below for the verification results.

Plan: [`docs/superpowers/plans/2026-09-19-batch-preparation-ui.md`](../superpowers/plans/2026-09-19-batch-preparation-ui.md)

## Why

DEC-069 (batch cooking, leftovers, storage) is `SHIPPED` in `DEC_REGISTER.md`, backend and all
(`api/preparation-batches.ts`, `src/lib/preparationBatch.ts`, `src/hooks/useBatches.ts`), but the only
UI, `src/components/BatchPlanner.tsx`, was removed from Yemek Planı on 2026-09-12
(`meal-plan-shopping-cleanup` plan, commit `65253bb`, "remove … batch planner") and never re-homed. It is
imported nowhere, so batches cannot be created or used from the app. `docs/SESSION_FOLLOWUP.md`'s
"Failed Approaches" section already recorded it as unrendered.

## Decisions taken in the plan

- **Not** re-mounting the old inline card (that clutter is why it was removed). Instead: a
  "Toplu Hazırlıklar" row on Yemek Planı opening a bottom-sheet manager, plus a per-meal "Partiden"
  button opening an allocate sheet for that slot on the day being viewed.
- Allocation reuses `useMealPlan.addItem(..., batchId)` (already batch-aware, optimistic) instead of the
  old component's own `createMealEntry` + manual invalidation; `useMealPlan` now refreshes the batch
  ledger after the server write for batch-linked entries (add / edit grams / remove).
- One `useBatchLedger` hook (batches + derived remaining) feeds the sheets, the entry row and the origin
  chips; leftovers stay derived, never stored. Batches stay immutable — no edit/delete.
- Multi-day planning needs no new concept (DEC-069 plan §13): navigate to the day, tap "Partiden".
- Storage note ships as free text (DEC-069 plan §21 human decision #1 is unresolved upstream; the column
  and old form already had it).
- `BatchPlanner.tsx` is deleted at the end of the plan, after a grep confirms no importers.

## Status

**Implemented.** All 8 tasks complete:
- Tasks 1–6: ledger plumbing, three new components (`BatchCreateForm`, `BatchSheet`, `BatchAllocateSheet`), UI integration in `MealPlanView.tsx`, wiring; build clean after each task.
- Task 7: `BatchPlanner.tsx` deleted, `useBatchAllocations` removed; no orphaned imports.
- Task 8: docs close-out complete (trio rule applied: `meal-construction-mvp.md`, `roadmap_v2.md`, `DEC_REGISTER.md`, `docs/mvp-scope/README.md`, `docs/superpowers/plans/README.md`, this checkpoint).

**Task 7 Step 4 verification (2026-09-19, live against `npm run vercel:dev` on :3000, `agent-login` session):**
items 1–8 and 10 passed as written; item 9 passed for swipe-down only. Details:
- 1–3: empty-state row + 2-column meal cards; batch created "Yemekten" (4 porsiyon, preview 600g/600g, Toplam 3798 kcal, create button disabled at 0 porsiyon) and "Elle seç" (beyaz pirinç 400g + hindi göğsü 500g, note, 17 Eyl).
- 4–6: "Partiden" subtitle `19 Eyl Cumartesi · İlk Öğün`; ½ → 300g; a double-click created exactly one entry; chip "Parti · 19 Eyl" and day macros updated; editing 300→200g moved "kaldı" 300→400, removing the entry returned it to 600.
- 7–8: next day offered the same leftovers and the add landed on that day only; typing 500g against 400g showed the hint, still added, ledger showed `-100g kaldı` (signal colour — red in Nane, blue in Arduvaz).
- 9: swipe-down dismissed both sheets — with **synthetic** touch events, not a real finger. **Not verified:** the soft-keyboard shrink behaviour (needs a real phone).
- 10: both sheets and the chip legible in Arduvaz.
- **Not observed:** the ~1.5s "Eklendi ✓" flash (too brief for the tooling; the logic is in `BatchAllocateSheet.tsx`, and the disabled state is what blocked the double-tap).
- Minor: batch order can differ between views — the API returns `prepared_date.desc`, while a just-created batch is prepended locally until the next refetch.
- Test account left with: two batches (batches are immutable, no delete UI) and onboarding skipped; all meal entries removed, theme restored to light.
