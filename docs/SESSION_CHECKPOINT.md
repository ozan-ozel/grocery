# Session Checkpoint

_Last updated: 2026-09-10_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

**Branch: `chore/retire-netlify`** (branched from `feature/psm-iteration-1-dec-triage`, which already
carries PSM Iteration 1's commit `b09d90b` — see Important Context). Retire Netlify completely
(NUT-52): delete the Netlify function backend, config, and migration scripts; remove now-unused
dependencies; update docs and code comments so Vercel (`api/*.ts`) is described as the sole backend.
**Implemented and verified, not committed** (no-auto-commit convention — see Constraints).

## Current State

Netlify retirement is done on this branch:

- Deleted `netlify/functions/*` (16 files), `netlify.toml`, `scripts/migrate-blobs-to-supabase.ts`,
  `scripts/migrate-kv-to-blobs.ts`.
- Removed now-unused deps: `@netlify/blobs`, `@netlify/functions`, `netlify-cli`, and (verified
  unused via grep across `api/`/`lib/`/`src/`) `jsonwebtoken`, `@types/jsonwebtoken`,
  `google-auth-library` — leftovers from the old Netlify Google-OAuth/self-signed-JWT flow, superseded
  by Supabase Auth on the Vercel side. `npm install` removed 1037 packages.
- Added `npm run vercel:dev` (`vercel dev`) as the replacement for the deleted `netlify:dev` script.
- Updated `CLAUDE.md`, `README.md`, `docs/architecture.md` (Supabase RLS / Sync / Nutrition /
  Deployment / Environment-variables sections), `docs/roadmap.md`, and inline comments across
  `src/` and `api/` that pointed at `netlify/functions/*.ts` paths.
- Drive-by fix (unrelated to Netlify, found while editing the same lines): `docs/architecture.md` and
  `docs/roadmap.md` described a `lists.ts`/`items.ts` per-row-CRUD scaffold as if it still existed —
  it was removed as dead code in commit `42c6d08`, before this session. Both docs corrected.
- **Deliberately left untouched** (historical record; rewriting would misrepresent history):
  `supabase/*.sql` migration files, `docs/superpowers/plans/`, `docs/superpowers/specs/`,
  `nutrition-curriculum/**`, `docs/netlify-vercel-migration-plan.md`.
- Verified: `tsc -b` (root), `tsc -p api/tsconfig.json --noEmit`, `vite build`, and `vitest run`
  (108/108) all pass clean.

PSM Iteration 1 (previous objective) is already committed (`b09d90b`, on the parent branch) — the
only thing still open from it is browser QA (see Problems / Unresolved Issues).

## Files Changed

Uncommitted on `chore/retire-netlify`:

- Deleted: `netlify/` (whole tree), `netlify.toml`, `scripts/migrate-blobs-to-supabase.ts`,
  `scripts/migrate-kv-to-blobs.ts`.
- Modified: `package.json`, `package-lock.json`, `.gitignore`, `.vercelignore`, `CLAUDE.md`,
  `README.md`, `docs/architecture.md`, `docs/roadmap.md`, `api/_auth-test-login.ts`,
  `api/preparation-batches.ts`, `src/components/NutritionAllFoodsBrowser.tsx`,
  `src/components/NutritionView.tsx`, `src/hooks/useFoodCatalog.ts`, `src/hooks/useMealPlan.ts`,
  `src/lib/apiFetch.ts`, `src/lib/nutrition.ts`, `src/lib/personalPlan.ts`,
  `src/lib/preparationBatch.ts`, `src/lib/store.ts`.

Untracked, pre-existing, unrelated to this task (left alone): `docs/VERCEL_ARCHITECTURE.md`,
`docs/superpowers/plans/2026-09-10-netlify-vercel-env-separation.md`,
`nutrition-curriculum/08_APP_TRANSLATION/PSM_ITERATION_1_BROWSER_QA.md`.

## Important Decisions

- Vercel (`api/*.ts`) is now the sole backend and deploy target — no more Netlify/Vercel duality
  anywhere in the docs or code comments.
- Historical docs (superpowers plans/specs, nutrition-curriculum, the Netlify→Vercel migration plan,
  applied `supabase/*.sql` migrations) were not rewritten even where they mention Netlify — they
  describe what was true when written.
- `docs/SESSION_CHECKPOINT.md`'s prior text ("decision made not to decommission Netlify today... no
  scheduled cutover date", NUT-52 "deferred until an actual cutover date is set") is now superseded by
  this session's work and has been replaced rather than preserved.

## Constraints

- No-auto-commit convention: implement and verify, then stop — user commits manually after testing.
  Applies here; nothing on `chore/retire-netlify` is committed yet.
- Branch-first: all coding work happens on a branch, never on `master` — already satisfied
  (`chore/retire-netlify`).
- Do not modify stable IDs, historical decisions, or Phase 9 documents in `nutrition-curriculum/`
  (carried forward from prior objective, still applies — untouched this session).

## Problems / Unresolved Issues

1. **The actual Netlify site (dashboard) has not been shut down** — no dashboard access from this
   session; NUT-52's own description flags this as a manual step for the user.
2. **PSM Iteration 1 browser QA still pending** (carried over, unrelated to Netlify retirement) — see
   `nutrition-curriculum/08_APP_TRANSLATION/PSM_ITERATION_1_IMPLEMENTATION_LEDGER.md` and the new
   untracked `PSM_ITERATION_1_BROWSER_QA.md`.
3. **DEC-069 (batch cooking) browser QA still pending** (carried over, older) — see
   `nutrition-curriculum/08_APP_TRANSLATION/DEC-069_IMPLEMENTATION_PLAN.md`.
4. **"Sub-project B" (real Supabase Auth migration) may already be substantially further along than
   the prior checkpoint text ("not started") claimed** — `api/auth-link.ts` (commit `f50f487`) and
   `docs/superpowers/plans/2026-09-09-supabase-auth-migration.md` (explicitly scoped "Vercel only")
   indicate real implementation work already happened. Not investigated further this session (out of
   scope for Netlify retirement) — worth a status check before trusting either description.
5. Supabase migration files `21`/`22`/`23` (security-definer schema move) were flagged in an earlier
   checkpoint as needing to be run against the live Supabase project by the user — status not
   re-verified this session; recent commits (`62f75f6`, merged via `79ff13d`) suggest this may already
   be done, but confirm before assuming so.

## Next Steps

1. Review the diff on `chore/retire-netlify` (`git diff master...chore/retire-netlify`), then CMP
   (commit, merge into `master`, push) when satisfied — the branch already exists and is checked out,
   so plain CMP applies.
2. Manually shut down the Netlify site in its dashboard (not doable from this session).
3. Close/update NUT-52 in Linear once merged and the Netlify site is shut down.
4. Separately: check actual Sub-project B (Supabase Auth migration) status against the code
   (`api/auth-link.ts`, `src/hooks/useAuth.ts`, `src/lib/supabaseAuthClient.ts`) rather than trusting
   the old "not started" checkpoint text — start a fresh design conversation if picking it up, per the
   prior checkpoint's own guidance.
5. PSM Iteration 1 and DEC-069 browser QA remain queued whenever a browser-automation environment is
   available (unrelated to Netlify retirement, carried over from before).

## Important Context

- This session's Netlify-retirement work is layered on top of `feature/psm-iteration-1-dec-triage`
  (which already contains PSM Iteration 1's commit `b09d90b`), not on a fresh branch off `master` —
  `chore/retire-netlify` carries both.
- Nutrition-curriculum historical detail (DEC-067/068/069, Canonical Food Identity, Phase 9 doc
  architecture) is settled, merged history — see `nutrition-curriculum/08_APP_TRANSLATION/` and
  `~/vault/grocery/logs/2026-09-08.md`/`2026-09-09.md` for the full narrative; not reproduced here to
  keep this checkpoint focused on what's actionable now.
- A concurrent Copilot-driven process has previously done substantial work on this branch's ancestry
  (the B3 allergen-class implementation) — re-read files before editing if resuming after a gap; do not
  assume this checkpoint's description of a file is current without a fresh read.
