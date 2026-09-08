# Session Checkpoint

_Last updated: 2026-09-08_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

**Branch: `feature/phase-9-canonical-food-identity`.** The Canonical Food Identity implementation
(the six decisions in `nutrition-curriculum/08_APP_TRANSLATION/CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`
§17) is **code-complete, live-verified, and ready to commit.** `supabase/16-nutrition-food-id.sql`
has been applied to the live database (user-run); the live identity audit and a full
`netlify:dev` + `auth-test-login` + Playwright browser QA pass have both completed successfully —
see "Verification" below. A final pre-commit audit found the diff clean and scoped. Nothing is
blocking a commit except explicit authorization to perform one.

Execution status (protocol §48.8 state machine): **`READY`** — no autonomous execution active, no
review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

**What it does:** adds an opaque, stable `food_id` (Postgres `uuid`, `gen_random_uuid()` default) to
the existing `nutrition` table — no separate Food table, per decision 1. A new resolver
(`src/lib/foodIdentity.ts`) gives an exact precedence chain — `food_id → canonical name → unique
alias → AMBIGUOUS/UNKNOWN` — with **no fuzzy step**, structurally guarded by an extended
`foodIdentitySafety.test.ts`. Food-level safety checks (`hasHardExclusion`/`hasSoftConstraint` in
`foodExclusions.ts`) now accept either a bare name string (every pre-existing exclusion) or a
resolved `{name_tr, food_id}` object, matching on whichever an entry holds — additive, non-breaking.
New exclusions (`PersonalPlanView.tsx`) now store `food_id ?? name_tr` so they survive a future
rename. Shopping (`listActions.addItem`) resolves the final chosen name exactly and attaches
`Item.foodId`; the existing-row dedup now prefers exact `foodId` equality over fuzzy matching when
both sides have one, fixing the investigation's flagged residual bug (an exact combo add could be
silently absorbed into an unrelated near-spelling shopping row).

**Key scope-reducing findings from this pass, worth knowing before touching this again:**
- `items`/`sync_state` persist the whole shopping `State` tree as **one opaque JSON blob** —
  `Item.foodId` is a client-type-only addition, no migration/API change needed.
- `combos.json`/`meal_entries` already resolve through the shared nutrition catalog at use time, so
  they inherit `food_id` transitively the instant a `Nutrition` object carries one — **no schema
  change to either was needed or made**. `meal_entries.food_id` (pre-existing, means "name_tr
  string") and `Combo.id` were both left completely untouched to avoid a name collision with the new
  opaque concept.
- `FoodExclusion.foodId` was **not renamed** despite already being a misleading name (it held a
  display-name string, not an opaque id, from the earlier B3 milestone) — the dual-match approach
  above avoids restructuring the already-tested exclusion system.

**Corrected mid-implementation:** the migration originally used `food_id text` with
`gen_random_uuid()::text`; changed to native `food_id uuid` with `gen_random_uuid()` (no cast) per
explicit instruction — PostgREST serializes `uuid` as a plain JSON string, so this required **zero**
application-code changes (`food_id?: string` stays correct everywhere).

### Verification

- **Tests: 85/85 passing** (`npm run test`) across 7 files, including 12 new resolver tests and 5 new
  `listActions` dedup tests.
- **`tsc -b`: clean. `npm run build`: clean.** Netlify functions typecheck standalone: clean.
- **Live DB audit (migration applied):** 89 `nutrition` rows, all 89 with a populated, valid, unique
  `food_id` — 0 NULLs, 0 duplicates, 0 invalid UUIDs, 0 canonical-name collisions. One live alias
  collision found (`"pirinç"`, absent from the seed catalog) — see Problems item 4 below; does not
  affect resolution correctness today.
- **Live API verified:** `GET /api/nutrition` returns `food_id` on every row; `resolveFood()` run
  against real API output confirms the full precedence chain (`food_id` → canonical name → unique
  alias → AMBIGUOUS/UNKNOWN) and confirms no fuzzy step (a typo never resolves).
- **Browser QA: completed**, two full passes via `netlify:dev` + `auth-test-login` + Playwright
  against isolated, cleaned-up test accounts — nutrition resolution, shopping add with `Item.foodId`,
  exact Food-ID shopping dedup, existing fuzzy shopping behavior, MealFoodPicker, MealPlanView,
  TodayView, food-level exclusion, B3 allergen-class exclusion (add/remove/re-add `tree_nuts`,
  independent `milk`), legacy name-based exclusions, no duplicate React keys. All passed. No test
  data left behind (test accounts deleted after each pass).
- **UI defect found and fixed during QA:** exclusion chips in `PersonalPlanView.tsx` were rendering
  the raw opaque `food_id` UUID instead of the Food's name for any exclusion created after this
  work. Fixed with a display-only `food_id → name_tr` resolver (`displayNameForFoodId`); legacy
  name-based exclusions still display unchanged. No effect on matching, persistence, or safety logic.
- **Final pre-commit audit (read-only):** re-confirmed the live DB numbers above, reviewed every
  file in the diff for scope, confirmed no Phase 1–8 artifacts touched, confirmed no fuzzy-matching
  bypass, confirmed B3's fail-closed unknown-allergen-class handling (`allergenClasses.ts`) is
  untouched. Verdict: **CANONICAL FOOD IDENTITY — READY TO COMMIT.**

## Files Changed

New: `supabase/16-nutrition-food-id.sql`, `src/lib/foodIdentity.ts`, `src/lib/foodIdentity.test.ts`,
`src/lib/listActions.test.ts`, `nutrition-curriculum/08_APP_TRANSLATION/
CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` (pre-existing investigation artifact, read not authored
this pass).

Modified: `netlify/functions/nutrition.ts`, `src/App.tsx`, `src/components/MealFoodPicker.tsx`,
`src/components/PersonalPlanView.tsx` (also carries the exclusion-chip display fix — see
"Verification" above), `src/lib/comboMatch.ts`, `src/lib/foodExclusions.ts`,
`src/lib/foodIdentitySafety.test.ts`, `src/lib/listActions.ts`, `src/lib/nutrition.ts`,
`src/lib/store.ts`, `docs/SESSION_CHECKPOINT.md` (this file, kept current through live verification).

**No commit, push, or merge performed** — explicitly withheld per instruction, working tree only.

## Important Decisions

- Session continuity is this checkpoint plus `~/vault/grocery/logs/`.
- Phase 9 is extended **in place** in its one architecture artifact — do not create new Phase 9
  documents (§31). This session's work lives in the separate, already-approved
  `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`, not in the main Phase 9 doc — no new section was added
  to the main doc this session.
- `food_id` is `uuid`, not `text` — see "Corrected mid-implementation" above. Do not revert this.
- The six approved Canonical Food Identity decisions (investigation §17) are binding architecture —
  do not reopen them without a technical-impossibility finding, reported rather than silently worked
  around.

## Constraints

- `supabase/16-nutrition-food-id.sql` **has been applied** to the live database (user-run, confirmed
  via live audit) — this constraint is now satisfied, kept here as historical record.
- Do not commit, push, merge, or create another branch without explicit authorization.
- Do not resolve autonomously: allergen vocabulary, unmapped-food default, precedence mechanics, C2's
  schema, user-vs-household exclusion scope, `DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`,
  `DEC-021`/`110`, `DEC-090`. None of these were touched or resolved by this session.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen
  Phase 8.
- Recipe engine, pantry, portion/scaling, substitution, shopping optimization, and clinical
  functionality remain explicitly out of scope for this work, per the investigation's own §16.

### Work that must not be repeated

- The full repository re-inspection this session did before implementing (confirmed `items` is a
  JSON blob not normalized rows; confirmed `combos.json`/`meal_entries` resolve transitively through
  the catalog; confirmed the nutrition write path's `merge-duplicates` upsert semantics) — re-read
  this checkpoint's "Current State" section instead of re-deriving it.
- The B3 allergen-class implementation (`allergenClasses.ts`, `foodExclusions.ts`'s
  `hasHardAllergenClassExclusion`/`hasSoftAllergenClassConstraint`, `supabase/14`/`15-*.sql`) — fully
  implemented, tested, and wired end-to-end from an earlier session; this session only read and
  extended it, did not redo it.

## Problems / Unresolved Issues

1. ~~`supabase/16-nutrition-food-id.sql` not yet applied to the live database`~~ — **resolved**:
   applied by the user, confirmed via live audit (89/89 rows populated, 0 nulls/duplicates/invalid
   UUIDs). Live identity audit and browser QA (both previously blocked on this) have since been
   completed — see "Verification" above.
2. **Canonical Food identity anchor question (investigation §17 decision 1) itself is now
   implemented**, not just decided — `name_tr` stays canonical, `food_id` is the new stable anchor.
   Nothing further needed here unless a future session decides to revisit it.
3. Allergen vocabulary/mapping/unmapped-default, C2's schema, `DEC-067`/`069`/`099`/`100`,
   user-vs-household scope — all unchanged, all still open, none touched this session.
4. **Live-data alias collision: `"pirinç"`** is aliased by both `"beyaz pirinç"` and `"baldo
   pirinç"` in the live `nutrition` table (absent from the seed catalog, so not caught by the
   earlier seed-only audit). `resolveFood('pirinç')` still resolves correctly today because a row
   literally named `"pirinç"` exists and canonical-name lookup wins before alias lookup runs
   (decision 3/4's precedence) — not a live bug. Worth a data-quality pass later: either drop the
   redundant `"pirinç"` alias from the two rice rows, or accept the collision as permanent and
   confirm `auditFoodIdentityCollisions()` output is surfaced somewhere an editor would see it.
   Not resolved or touched this session — do not resolve autonomously.
5. **70/89 live foods have no curated `allergen_classes` mapping** (only 19/89 do). Per
   `allergenClassStatusForFood()`'s existing, unchanged fail-closed design, an unmapped food is
   `"unknown"` for every class, and `"unknown"` is never treated as safe — so excluding a class for
   an `allergy`/`unclear` reason correctly (not a bug) removes any unmapped food from
   recommendations too, observed during QA when excluding `tree_nuts` hid nearly all 16 seed combos.
   This is existing B3 behavior, not something this session changed, weakened, or touched — left
   as-is; expanding curated allergen coverage is separate, unstarted work.

## Next Steps

1. ~~Wait for the user to apply the migration, then live-verify~~ — **done**: migration applied,
   live identity audit and a full Playwright QA pass both completed successfully, one UI display
   bug found and fixed, and a final pre-commit audit confirmed the diff is clean and scoped.
2. **Commit, when explicitly authorized** — nothing else is blocking. Commit message should cover
   the full Canonical Food Identity milestone (resolver, `food_id`-aware exclusions/shopping,
   migration, the exclusion-chip display fix) per this checkpoint's "Current State" section.
3. Do not commit/push/merge without explicit authorization, per instruction §20 of the task.

## Important Context

- Authoritative evidence: `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md` (this work's own spec),
  `PROJECT_STATUS.md`, `00_PROJECT_CONTROL/DECISIONS/`, the main Phase 9 architecture artifact
  (`08_APP_TRANSLATION/PHASE_9_APPLICATION_CAPABILITY_ARCHITECTURE.md`, unchanged this session).
- A concurrent Copilot-driven process has previously done substantial work on this branch's ancestry
  (the B3 allergen-class implementation) — re-read files before editing if resuming after a gap;
  do not assume this checkpoint's own description of a file is still current without a fresh read.
