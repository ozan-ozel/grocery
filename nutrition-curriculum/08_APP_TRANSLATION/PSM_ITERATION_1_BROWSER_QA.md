# PSM Iteration 1 — Integrated Browser QA #1

**QA STATUS: PARTIAL.** A real, authenticated primary-journey pass was completed this time (the
prior attempt in this document was blocked before login and has been superseded). Coverage is
broad but not exhaustive — see §3 for what was and wasn't exercised. One **critical, confirmed
safety regression** was found (§6.1) and is the headline result of this session.

---

## 1. QA Metadata

- **Date:** 2026-09-10
- **Branch:** `master`, HEAD `b2d0f36` (Netlify retirement + PSM Iteration 1, both merged)
- **Environment:** `npm run vercel:dev` on `http://localhost:3000` (the user's own already-running
  instance, `.env.local`-configured against the real project's Supabase instance)
- **Test account:** a real Google account, authenticated interactively by the user through the
  actual Google OAuth flow (the `auth-test-login` shortcut was attempted first but is currently
  unroutable — see §6.2 — so real login was used instead, with the user's explicit authorization:
  "you can test the app or do your qa wherever you want in solely that account", "please do not
  delete the account"). All test data created during this session (a manually-added `hindi göğsü`
  meal-plan/shopping-list entry, a since-reverted consumption log entry) was removed again before
  finishing; the account itself was never deleted, and no other account's data was touched.

## 2. Executive Summary

Login is now solved (real OAuth, not the broken local test-login shortcut — see §6.2 for why that
shortcut is currently unusable). This allowed a real, authenticated pass through onboarding,
Personal Plan, Meal Plan, Shopping, and Consumption for the first time this PSM cycle.

**Headline finding:** food-level and allergen-class exclusions entered in Personal Plan
("Önerilmesin" / "Alerjen grubu hariç tut") are **silently never persisted** by the current
(post-Netlify-retirement) backend. `api/personal-plan.ts` — the Vercel port of the retired Netlify
function — dropped `food_exclusions`, `excluded_food_ids`, and `allergen_class_exclusions` from
both its read `SELECT_COLS` and its write validation/payload during the migration. This was
reproduced live: marking `hindi göğsü` as "Alerjim var" (hard allergy) showed no error to the user,
but the food reappeared unfiltered in the meal-plan food picker even after a full page reload, and
direct inspection of both the `/api/personal-plan` response and the client's own localStorage cache
confirmed the exclusion was gone entirely — not delayed, not stale-cached, genuinely discarded. This
is a regression against the B3 closed decision's own conservative-safety guarantee, introduced by
the Vercel migration, not by anything in PSM Iteration 1's four provisional decisions.

A second, lower-severity regression of the same class was found by inspection: `api/meal-entries.ts`
also dropped `combo_id`/`batch_id` from both read and write, breaking combo-attribution and DEC-069
batch-cooking linkage for any meal entry created since the migration.

The four PSM-1 provisional decisions (DEC-046, DEC-009, DEC-033, DEC-071) were all click-tested
successfully this session (§4) — all four render and behave exactly as designed, no changes needed.

## 3. Main User Journey

Exercised: **first-run onboarding** (age/height/weight → equation sex → activity → goal) → **Personal
Plan** (profile, targets, exclusions) → **Meal Plan** (add food to a slot, per-slot protein target) →
**Shopping** (day → list wiring, manual list) → **Bugün / combo suggestions** (add to list, mark
preparing, mark eaten, undo) → **Consumption** (remaining macros recalculate correctly after "Yedim").

Not exercised: **Besin değerleri** (nutrition catalog browsing) tab beyond incidental use, **Geçmiş**
(history) tab, **Kategoriler** (category memory) tab, household sharing/multi-user flows, DEC-069
batch-cooking UI ("Yeni parti"), account menu (sign-out/delete-account — deliberately not touched,
per the instruction not to delete the account).

## 4. PSM-1 Provisional DEC Results

| DEC | Result | Verdict |
|---|---|---|
| DEC-046 (hydration) | "Su" card shows `2.3 L` / "temel, taslak" for 70kg, matching `70×33=2310mL`. Recalculated correctly to `1.2 L` when weight was changed to 35kg. Label reads clearly as provisional. | **KEEP** |
| DEC-009 (BMI plausibility) | Normal values (170cm/70kg) show `BMI 24.2 (Genel aralık)`, no warning. Extreme values (230cm/35kg) correctly triggered `BMI 6.6 (Düşük)` plus the warning text "Boy ve kilo birlikte olağan dışı bir oran veriyor; değerleri kontrol et." Exactly as designed. | **KEEP** |
| DEC-033 (per-occasion protein) | "Protein hedefi 21-28 g" (70kg × 0.3-0.4) renders on every slot, including confirmed on **Ara öğün** (snack) — the exact concern flagged in the implementation ledger. Functionally correct, but a snack showing the same protein target as a full meal reads oddly in the UI. | **SAND** — UX only; keep the underlying flat-rate logic, but consider a visibly smaller/secondary treatment for `Ara öğün`, or a footnote explaining the target is occasion-count-based, not meal-size-based, in PSM-2. |
| DEC-071 (meal plan → shopping) | Added `hindi göğsü` to Kahvaltı, clicked "Bu günü alışveriş listesine ekle" — item counter went from 00/00 to 00/01, and the item appeared correctly in the Liste tab with the right quantity (100g). Reproduced end-to-end with no issues. | **KEEP** |

## 5. Closed-Decision Regression Results

- **Food Identity:** Not directly probed for rename/alias-collision behavior this session (would
  require DB-level manipulation out of scope for a UI QA pass); nothing observed contradicts it.
  **DEFER** — genuinely not exercised at the level the decision requires.
- **B3 allergen/exclusion safety:** **REGRESSED — see §6.1.** This is not a "cannot verify" case;
  it was actively tested and found broken. Marking a food as a hard allergy does not survive even a
  page reload — the exclusion is discarded, not merely unenforced in one surface.
- **DEC-067 (ingredient-list-only preparation):** Combo cards on the "Bugün" tab show name, prep
  time, kcal/protein, and an optional plain-text preparation note (e.g. "Tavuğu haşlayıp parçalayın,
  pirinci pişirin, brokoliyi buharda hafifçe yumuşatın.") — no structured steps, no yield/portion
  field, no equipment matching, nothing clickable to expand into a richer recipe view. **KEEP —
  CLOSED DECISION** (actually observed this session, not assumed).

## 6. Bugs

### 6.1 CRITICAL — Food/allergen exclusions are silently not persisted (SAFETY, P0)

`api/personal-plan.ts` (the Vercel port of the retired `netlify/functions/personal-plan.ts`, from
commit `b60a6b3`) dropped three fields during the port:

- `SELECT_COLS` no longer includes `excluded_food_ids`, `food_exclusions`, or
  `allergen_class_exclusions` (confirmed by diffing against the pre-retirement Netlify function,
  which explicitly selected, validated, and wrote all three — including a `parseFoodExclusions`/
  `parseAllergenClassExclusions` validation step entirely absent from the Vercel version).
- The `PUT` handler's body type, validation, and `payload` object sent to Supabase likewise never
  mention any of the three fields — they are silently ignored if present in the request body.

**Reproduction:** In Personal Plan, marked `hindi göğsü` as "Alerjim var" (hard allergy). No error
was shown (the save appears to succeed, because the POST to `personal_plan` genuinely does succeed —
it just never included the exclusion fields). Confirmed via direct calls from the browser console:
- `GET /api/personal-plan` response contains no `food_exclusions`/`excluded_food_ids`/
  `allergen_class_exclusions` keys at all.
- `localStorage`'s `grocery.personalPlan.v1:<userId>` cache — which paints instantly on load, then
  is overwritten by the server ("server wins," per `useMealPersonalization.ts`'s own comment) — shows
  `"foodExclusions":[]` after a reload, i.e. the exclusion is gone from the client cache too, not
  just unread from the server.
- Re-opened the meal-plan food picker for a different slot after a full page reload: `hindi göğsü`
  still appears, completely unfiltered and unflagged, confirming the loss is real and not a stale
  render.

**Why this matters:** the "Önerilmesin" UI copy explicitly promises "alerji ve emin olmadığın
besinler önerilerden tamamen çıkarılır" (allergy and unsure foods are completely removed from
suggestions) — B3's own closed-decision safety guarantee. A user who marks a real allergy today,
using the currently-deployed (post-Netlify-retirement) backend, would reasonably believe it is saved
and enforced. It is neither.

- **Classification:** SAFETY / BUG (regression, not a PSM-1 decision)
- **Next action:** **BLOCKED for this session** (no fixes made, per the QA task's own rules) —
  **P0, should be fixed immediately**, independent of any further PSM iteration. The fix is
  mechanical: restore the three fields to `SELECT_COLS`, the write body type, validation, and
  payload in `api/personal-plan.ts`, matching the retired Netlify function's already-correct
  implementation (`git show 99f4f44^:netlify/functions/personal-plan.ts`).

### 6.2 `api/meal-entries.ts` dropped `combo_id`/`batch_id` (DATA / ARCHITECTURE, P1)

Same migration-drop pattern as §6.1, found by direct diff against the retired Netlify function
(`SELECT_COLS` lost `combo_id,batch_id`; the write body/validation/payload lost them too). Any meal
entry created via the current Vercel-backed app can no longer be attributed to a combo, and cannot be
linked to a DEC-069 preparation batch. Not reproduced live in the browser this session (would require
creating a batch first, out of this session's time budget), but the code-level evidence is direct and
unambiguous — this is the same class of regression as §6.1, just not safety-critical.

- **Classification:** DATA / ARCHITECTURE (regression against DEC-069's already-closed batch model)
- **Next action:** **P1** — fix alongside §6.1 using the same restore-from-Netlify-original approach.

### 6.3 `api/_auth-test-login.ts` unroutable locally (ARCHITECTURE, P2 — tooling only)

Confirmed this session: the file was intentionally renamed with a leading underscore (commit
`33693db`) to stay under Vercel's Hobby-plan 12-serverless-function cap. `vercel dev` enforces the
same cap locally (empirically confirmed: copying it to a routable `api/auth-test-login.ts` name made
it a 13th function and it silently 404'd, exactly like production would). This is a deliberate,
already-made tradeoff, not a bug — but it means there is currently **no working local QA login
shortcut**; only real Google OAuth works. Real OAuth was used for this session with the user's
authorization.

- **Classification:** ARCHITECTURE (known tradeoff)
- **Next action:** **P2** — not urgent; three options were already given to the user (merge two
  endpoints to free a slot, upgrade the Vercel plan, or keep using real OAuth for QA). No action
  taken this session.

## 7. Safety Findings

See §6.1 — the one safety finding this session, and the most severe one.

## 8. Data Findings

See §6.2. No other data-integrity issues observed in the surfaces exercised (shopping-list
persistence, meal-plan-to-shopping wiring, and consumption logging all round-tripped correctly
through page reloads).

## 9. UX Findings

- DEC-033's flat per-occasion protein target reads oddly on `Ara öğün` (snack) — see §4's SAND note.
- No other UX issues observed in the flows exercised; Turkish copy throughout is clear and the
  onboarding wizard is short and low-friction.

## 10. Architecture Findings

1. **The Netlify → Vercel API port silently dropped columns in at least two endpoints** (§6.1, §6.2).
   Given this pattern appeared twice, a targeted audit of the other ported endpoints
   (`households.ts`, `household-shares.ts`, `hidden-households.ts`, `item-category-memory.ts`,
   `state.ts`, `preparation-batches.ts`) for the same class of silent field-drop would be worthwhile
   before trusting any of them fully — this session only spot-checked line counts (all within a few
   lines of their Netlify originals, unlike `meal-entries.ts`'s -37 lines) and did not diff their
   actual column lists field-by-field.
2. **"Server wins" profile merge (`useMealPersonalization.ts`) has no way to detect a
   partial/degraded server response** — it treats any successful `fetchPersonalPlan()` response as
   authoritative and overwrites local state unconditionally. This is precisely what let §6.1's bug
   destroy the local cache too, not just fail to read from the server. Worth considering a
   "did the server actually understand this field" sanity check in a future pass, though that's a
   bigger discussion than this QA document should settle.

## 11. PSM-2 Sanding List

- **P0:** Fix `api/personal-plan.ts` to restore `food_exclusions`/`excluded_food_ids`/
  `allergen_class_exclusions` read+write, matching the retired Netlify function. This is a safety
  fix, not a PSM decision change, and should not wait for a full PSM-2 pass.
- **P1:** Fix `api/meal-entries.ts` to restore `combo_id`/`batch_id` read+write, same approach.
- **P1:** Once §6's fixes land, re-verify B3 exclusion enforcement end-to-end in the browser (this
  session only got as far as proving it's broken, not re-confirming it works after a fix).
- **P2:** Audit the remaining ported `api/*.ts` endpoints for the same silent-field-drop pattern.
- **P2:** DEC-033 UX — consider distinguishing the snack slot's protein-target display from full
  meals in a future pass.
- **P3:** Resolve `auth-test-login`'s function-cap unroutability (merge endpoints, upgrade plan, or
  formally accept real-OAuth-only local QA going forward) — not urgent, three options already on the
  table for the user to choose from.

## 12. KEEP / SAND / REPLACE / DEFER / BLOCKED

- DEC-046 (hydration): **KEEP**
- DEC-009 (BMI plausibility): **KEEP**
- DEC-033 (per-occasion protein): **SAND** (UX treatment of the snack slot only; logic unchanged)
- DEC-071 (meal plan → shopping): **KEEP**
- Food Identity: **DEFER** (not exercised at the level the decision requires)
- B3 allergen/exclusion safety: **REGRESSED** — not a decision problem, a Vercel-port implementation
  bug; fix is **BLOCKED** for this session, **P0** for immediate follow-up outside PSM-2 proper.
- DEC-067 (ingredient-list-only prep): **KEEP — CLOSED DECISION** (actually observed)
- DEC-069 (batch cooking) linkage: **REGRESSED** (via `combo_id`/`batch_id` drop) — **P1**.

## 13. Recommended Next Steps

1. Fix `api/personal-plan.ts` (§6.1) — small, mechanical, safety-critical. Recommend doing this
   immediately, separately from and before any PSM-2 sanding work, given it's a regression fix, not
   a decision change.
2. Fix `api/meal-entries.ts` (§6.2) alongside it.
3. Re-run the B3 exclusion portion of this QA pass after the fix to confirm it actually works
   end-to-end (add allergy → reload → verify filtered from picker → verify combo suggestions also
   respect it).
4. Everything else in §11 can wait for a proper PSM-2 pass.

No implementation was performed for any of this during the session itself, per the QA task's own
no-code-changes rule — this section is a recommendation only.
