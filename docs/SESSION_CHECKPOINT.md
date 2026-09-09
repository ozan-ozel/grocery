# Session Checkpoint

_Last updated: 2026-09-09_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

No task is currently in progress. The last completed unit of work was implementing DEC-069 (batch
cooking, leftovers, storage-aware planning) per its ratified scope and reconciled architecture, then
live-validating it against the actual configured Supabase project.

```text
DEC-067 decision:         CLOSED (ratified Level 1)
DEC-067 implementation:   CLOSED
DEC-068 decision:         CLOSED — DEFERRED FOR V1 (not implemented; no constraint model built)
DEC-069 decision:         CLOSED — V1 SCOPE RATIFIED (Option 3: household-scale multi-day batch
                          cooking, leftovers, storage-aware planning; restaurant-scale NOT ratified)
DEC-069 architecture:     investigated, audited, and reconciled — PreparationBatch + immutable
                          composition snapshot + MealEntry.batch_id
DEC-069 implementation:   COMPLETE — live data/API/database validated; browser click-through
                          QA PENDING (tooling unavailable, not an architectural gap)
DEC-070/DEC-071:          unchanged (DEC-069 exposes composition as DEC-071's future input only;
                          DEC-071 itself not implemented)
Canonical Food Identity:  CLOSED
Phase 9 doc architecture: investigated — no split justified
Next task:                none formally queued — interactive browser QA for DEC-069 is the only
                          outstanding validation follow-up; see Next Steps
```

Execution status (protocol §48.8 state machine): **`READY`** — no autonomous execution active, no
review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

- **Canonical Food Identity, DEC-067 (Level 1), DEC-068 (deferred for v1), and the Phase 9
  documentation-architecture/stale-reference maintenance pass are all settled, merged history.** Full
  detail: `CANONICAL_FOOD_IDENTITY_INVESTIGATION.md`, `DEC-067_*_INVESTIGATION.md`,
  `DEC-068_INVESTIGATION.md`, `2026-09-09-dec-068-deferred-v1-ratification.md`,
  `PHASE_9_DOCUMENTATION_ARCHITECTURE_INVESTIGATION.md`, and `~/vault/grocery/logs/2026-09-08.md`/
  `2026-09-09.md` — not reproduced here.
- **DEC-069 scope/architecture chain (investigation → ratification → implementation-architecture
  investigation → batch-composition audit → reconciliation) is settled, merged into `master`
  (commit `9a980c4`).** Full detail: `DEC-069_INVESTIGATION.md`, `2026-09-09-dec-069-v1-scope-
  ratification.md`, `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (read its "Revised
  Architecture (Post-Audit)" section — authoritative for the `PreparationBatch` shape),
  `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md` (found the original pointer-only shape
  **REVISION REQUIRED**), `DEC-069_IMPLEMENTATION_PLAN.md`.
- **DEC-069 implementation** — built on `feature/dec-069-batch-implementation` (branched from the
  verified clean `master` at `9a980c4`), two commits:
  - `842aed3` — the implementation itself: `preparation_batches` table (immutable JSONB
    `composition` snapshot, `source_combo_id` as non-authoritative provenance, optional
    `storage_note`) plus a nullable `meal_entries.batch_id`; `src/lib/preparationBatch.ts`'s pure
    `normalizeComposition`/`remainingComposition` (leftover derivation, 16 new passing tests);
    `netlify/functions/preparation-batches.ts` (GET/POST, no PATCH/DELETE — composition is
    write-once); `meal-entries.ts` extended with `batch_id` and a `batchId`-scoped GET; a minimal
    UI (`BatchPlanner.tsx`, mounted in `MealPlanView`) supporting both Combo-originated (scaled,
    reusing `scoreAllCombos`'s existing hard-exclusion filtering) and manually-assembled batches
    (reusing `MealFoodPicker`), plus per-batch remaining-quantity display and a mini
    allocate-to-meal form.
  - `24e58e5` — a live-QA-discovered fix: Supabase silently enabled RLS-with-zero-policies on the
    new `preparation_batches` table (identical drift class to the pre-existing
    `11-fix-anon-read-rls-drift.sql` incident on `meal_entries`/`personal_plan`) — disabled to match
    this app's Netlify-function-layer authorization model. Not an application code defect; no
    `src/` or `netlify/functions/` change was needed.
  - **Critical identity invariant, preserved and live-verified:** `composition[].food_id` uses the
    same value space as `meal_entries.food_id`/`Combo.items[].foodId` (`nutrition.name_tr`) — never
    the separate, opaque `Nutrition.food_id` UUID from Canonical Food Identity. Documented in
    `preparationBatch.ts`'s header comment and `DEC-069_IMPLEMENTATION_PLAN.md` §6.1.
- **Live validation performed** (both migrations `17-preparation-batches.sql` and
  `18-preparation-batches-rls-drift.sql` applied to the real Supabase project via its SQL editor,
  by the user):
  - Live schema confirmed via direct PostgREST queries: exact expected columns on
    `preparation_batches`; `meal_entries.batch_id` present; the pre-existing 42 `meal_entries` rows
    confirmed untouched.
  - Authenticated/unauthenticated/cross-household-isolation behavior all confirmed correct (401 /
    201 / 404 respectively) against the live API.
  - Combo-originated and manually-assembled batches both created and retrieved live, composition
    round-tripping exactly (an initial encoding mismatch was traced to a Windows/Git-Bash `curl -d`
    argv artifact in the verification tooling itself, not the application — confirmed by re-testing
    with a file-based payload).
  - **Leftover derivation worked example reproduced live, exactly**, across two real dates (multi-
    day): 1000/800/500 g batch → two 200/160/100 g allocations → **600/480/300 g remaining**.
  - **Mandatory historical-integrity test performed live and passed:** the real `combos.json`
    entry the test batch was created from was mutated (quantities changed, one ingredient
    swapped), the existing batch was re-fetched, and its `composition` was **provably unchanged**;
    the edit was then reverted via `git checkout`.
  - **Food Identity separation confirmed live:** the actual `Nutrition.food_id` UUID for a food was
    fetched and confirmed distinct from the string stored in that food's `composition[].food_id`.
  - All test data (batches, meal entries, households) created during verification was deleted
    afterward and confirmed gone.
  - 104/104 tests pass (16 new), `tsc -b` clean, `vite build` clean, `netlify/functions/tsconfig.json`
    typecheck clean.
  - **Not performed: interactive rendered-browser QA** (clicking through the actual `BatchPlanner`
    UI, observing exclusion filtering in the rendered picker, checking for React-key/console errors
    during the live flow) — no browser-automation tool was available in that session. This is a
    validation follow-up, not an unresolved architectural or product decision; everything the
    browser pass would exercise at the data/logic level has already been proven correct via the live
    API/DB verification above plus the existing/expanded automated test suite.
  - A minimal additive status note was added to the top of `DEC-069_IMPLEMENTATION_PLAN.md`
    pointing here; the plan's own body (options, invariants, sequence, verdict) is left as historical
    reasoning, unmodified.
- **2026-09-09 — Supabase RLS warnings reviewed; NUT-29 (Netlify→Vercel) closed; Netlify decommission
  split into backlog.** Unrelated to DEC-069. Supabase Advisor flagged `meal_entries`/`personal_plan`
  (and, per the DEC-069 entry above, `preparation_batches`) as "RLS not enabled." Reviewed and
  confirmed this is the same deliberate tradeoff as `11-fix-anon-read-rls-drift.sql`: this app has no
  Supabase Auth, so `auth.uid()` is always null, and authorization is enforced entirely at the
  Netlify-function layer (`requireUser`/`requireHouseholdAccess` in `_auth.ts`). A proposed
  "swap `SUPABASE_ANON_KEY` for `SUPABASE_SERVICE_ROLE_KEY` everywhere + enable RLS on all tables"
  fix was rejected as illogical: `service_role` always bypasses RLS, so that would make RLS
  decorative for all of this app's own traffic while consolidating every backend operation onto the
  single highest-privilege key — worse for blast radius, not better. Real bulletproofing would
  require migrating to actual Supabase Auth (so `auth.uid()` is non-null and real per-row policies can
  run as a second, independent layer behind the existing Netlify-function checks) — scoped as a
  separate, larger architectural sub-project (**Sub-project B**, below), not started.
  - **NUT-29 (Netlify→Vercel migration) marked Done.** Steps 0–5.2 (code migrated to `api/*.ts`,
    already on `master`; Vercel project verified end-to-end; parallel observation since 2026-08-27
    with no issues) are complete. Decision made **not** to decommission Netlify today — it stays the
    live deploy target indefinitely, in parallel with Vercel, with no scheduled cutover date.
  - **[NUT-52](https://linear.app/nutrition-grocery-planner/issue/NUT-52/netlifyi-sok-eski-deploy-hedefini-kaldir)
    created (Backlog)** carrying the old Adım 5.3/5.4 (delete `netlify/functions/`, `netlify.toml`,
    the two migration scripts; remove `@netlify/blobs`/`netlify-cli` from `package.json`; update
    `README.md`/`CLAUDE.md` to describe Vercel; shut down the Netlify site) — deferred until an actual
    cutover date is set.
  - **Vercel prod is stale**: last deployed 2026-08-28 (`e13d625`); `master` has moved on
    significantly since (DEC-069, NUT-32/33/34, an ESM-resolution fix). A `npx vercel --prod` redeploy
    was attempted this session and **blocked by the Claude Code auto-mode classifier** (production-
    effecting command, no autonomous approval) — noted on NUT-29 and as NUT-52's prerequisite; needs a
    human-run (or explicitly approved) `npx vercel --prod` plus an end-to-end re-verification before
    NUT-52 starts.
  - **Sub-project B (not started, no branch/issue yet):** real Supabase Auth migration — replace the
    custom Google-OAuth-then-self-signed-JWT flow (`auth-google-callback.ts`, `_auth.ts`) with
    Supabase's own session/identity system, forward the user's own access token (not `anon`/
    `service_role`) as the PostgREST bearer for their own data, and rewrite RLS policies on
    `households`/`lists`/`items`/`meal_entries`/`personal_plan`/`preparation_batches`/
    `household_shares` around `auth.uid()`. The hard part flagged during review: `app_users.id` is
    today the Google `sub` (text), and `owner_id`/`user_id` columns already point at it on live data —
    migrating to Supabase Auth's own uuid needs either a mapping table or a careful backfill, not a
    config flip. User explicitly wants both this and the Netlify code-retirement (NUT-52) eventually
    done; sequencing (this doc's own recommendation) is cutover-adjacent work first, this second,
    given both touch the same `api/`/`netlify/functions/` trees.

## Files Changed

Committed on `feature/dec-069-batch-implementation`, since merged into `master` (`67de28c`):

- `supabase/17-preparation-batches.sql`, `supabase/18-preparation-batches-rls-drift.sql` — new.
- `src/lib/preparationBatch.ts`, `src/lib/preparationBatch.test.ts` — new.
- `netlify/functions/preparation-batches.ts` — new.
- `src/hooks/useBatches.ts`, `src/components/BatchPlanner.tsx` — new.
- `netlify/functions/meal-entries.ts`, `src/lib/mealPlan.ts`, `src/lib/localMealPlan.ts`,
  `src/hooks/useMealPlan.ts`, `src/components/MealPlanView.tsx` — modified (additive `batchId`
  threading).
- `src/lib/combos.ts` — modified (extracted the existing raw-JSON-to-`Combo[]` loader, already used
  by `TodayView.tsx`, into a shared `ALL_COMBOS`/`COMBO_BY_ID` export so `BatchPlanner` reuses it
  rather than duplicating it).
- `src/components/TodayView.tsx` — modified (consumes the extracted loader; behavior unchanged).
- `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md` — additive
  implementation-status note only; original plan body untouched.
- This file.

Already committed/merged into `master` (`9a980c4`): the full DEC-069 investigation/ratification/
architecture/audit/plan document set (see Current State above).

## Important Decisions

- DEC-069's ratified scope (Option 3) and reconciled architecture are unchanged by implementation —
  building it surfaced no need to reopen either.
- **`composition[].food_id` uses the existing `meal_entries.food_id`/`Combo.items[].foodId` value
  space (`nutrition.name_tr`), never `Nutrition.food_id`.** This is binding for any future work
  touching `PreparationBatch` — do not silently "upgrade" it to the opaque Canonical-Food-Identity
  UUID; doing so would break leftover derivation's equality join against `meal_entries.food_id`.
- The `preparation_batches` table has **no PATCH/DELETE endpoint** — `composition` is write-once by
  design (a correction creates a new batch; nothing edits an existing one in place).
- A newly created Supabase table in this project should be assumed to need the same RLS-disable
  treatment as `11-fix-anon-read-rls-drift.sql` already established, until/unless this project's
  Supabase account-level defaults are changed — this is now a second confirmed occurrence of the same
  platform-level drift, not a one-off.
- Interactive browser QA remaining pending is a **tooling-availability gap in this session, not a
  product or architecture question** — do not treat it as blocking further DEC-069-adjacent work, and
  do not reopen DEC-069's scope or architecture because of it.

## Constraints

- Do not resolve autonomously: `DEC-099`/`DEC-100`, `DEC-021`/`110`, `DEC-090`, allergen vocabulary,
  unmapped-food default, precedence mechanics, user-vs-household exclusion scope, DEC-069's
  restaurant-scale sub-question.
- Do not revert `PreparationBatch` to a scalar `total_quantity` or pointer-only `source_combo_id`
  design — proven insufficient and unsafe by the batch-composition audit, and now also the shipped,
  live-validated implementation.
- Do not conflate `composition[].food_id` with `Nutrition.food_id` in any future change.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen
  Phase 8.
- Do not split, restructure, or reorganize Phase 9's documents.
- Recipe engine, pantry, portion/scaling beyond DEC-069's own needs, substitution, shopping
  optimization (`DEC-071`), and clinical functionality remain out of scope until their own decisions
  are made.

## Problems / Unresolved Issues

1. **Interactive browser QA for DEC-069 remains pending** — no browser-automation tool was available
   in the implementation session. Next step, whenever a working browser-automation environment is
   available: click through batch creation (Combo-originated and manual), confirm exclusion filtering
   renders correctly in the picker, confirm remaining-quantity display, and check for React-key/console
   errors during the live flow.
2. **Live-data alias collision: `"pirinç"`** — aliased by both `"beyaz pirinç"` and `"baldo pirinç"` in
   the live `nutrition` table. Not a live bug; worth a future data-quality pass. Not touched.
3. **70/89 live foods have no curated `allergen_classes` mapping** (only 19/89 do) — existing,
   unchanged, fail-closed B3 behavior.
4. `DEC-069`'s restaurant-scale sub-question remains fully open, untouched.
5. Two narrower open items from `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md`'s "Requires
   Human Decision," re-confirmed still open by the implementation plan: whether
   `listActions.ts`'s existing non-quantity-aggregating shopping dedup should ever be improved
   (orthogonal to DEC-069, belongs to `DEC-071`'s future scope), and per-household-member attribution
   of a shared batch's leftovers (pre-existing limitation, unrelated to DEC-069). The storage-note
   depth question was resolved pragmatically during implementation — shipped at the minimum viable
   level (optional free text), not a structured model.
6. **Pre-existing documentation discrepancy, unrelated to DEC-068/069, flagged not fixed:** `DEC-065`'s
   own Inventory text claims Grocery "already tracks a household's... pantry" — confirmed via code
   trace that no pantry/inventory mechanism exists anywhere in the codebase.

## Next Steps

1. ~~Merge `feature/dec-069-batch-implementation` into `master`~~ — done (`67de28c`).
2. **Interactive browser QA for DEC-069**, whenever a working browser-automation environment is
   available (see Problems/Unresolved Issues, item 1) — a validation follow-up, not a new task with
   its own scope.
3. The `"pirinç"` alias collision, expanded `allergen_classes` coverage, DEC-069's restaurant-scale
   sub-question, and the two orthogonal "Requires Human Decision" items above remain unstarted,
   unscheduled follow-ups — no next Phase 9 milestone is currently queued beyond these.
4. **Redeploy Vercel prod** (`npx vercel --prod`, manual — no git integration) to catch it up to
   current `master`, then re-verify end-to-end (login/logout, CRUD, sync, throttled connection) —
   prerequisite for [NUT-52](https://linear.app/nutrition-grocery-planner/issue/NUT-52/netlifyi-sok-eski-deploy-hedefini-kaldir).
   Blocked this session by the auto-mode classifier; needs to be run by a human or explicitly approved.
5. **Sub-project B (real Supabase Auth migration)** — not yet brainstormed/spec'd. Start a fresh
   design conversation when picked up; do not start coding from this checkpoint's summary alone.

## Important Context

- Authoritative evidence: `00_PROJECT_CONTROL/DECISIONS/` (ratification records),
  `08_APP_TRANSLATION/DEC-067_*_INVESTIGATION.md`, `DEC-068_INVESTIGATION.md`,
  `DEC-069_INVESTIGATION.md`, `DEC-069_IMPLEMENTATION_ARCHITECTURE_INVESTIGATION.md` (read its
  "Revised Architecture (Post-Audit)" section, not the earlier superseded shape),
  `DEC-069_BATCH_COMPOSITION_ARCHITECTURE_AUDIT.md`, `DEC-069_IMPLEMENTATION_PLAN.md` (read its
  top-of-file implementation-status note for the current state), `PHASE_9_APPLICATION_CAPABILITY_
  ARCHITECTURE.md`, `PROJECT_STATUS.md`.
- Implementation source of truth: `src/lib/preparationBatch.ts`'s header comment states the critical
  Food-Identity value-space invariant directly in code, not just in docs.
- Full session narrative and discoveries: `~/vault/grocery/logs/2026-09-08.md` and `2026-09-09.md`
  (the latter predates this implementation pass — update it via `/session-log` if a durable historical
  record of the implementation itself is wanted).
- A concurrent Copilot-driven process has previously done substantial work on this branch's ancestry
  (the B3 allergen-class implementation) — re-read files before editing if resuming after a gap; do not
  assume this checkpoint's description of a file is current without a fresh read.
