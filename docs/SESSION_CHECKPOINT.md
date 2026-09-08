# Session Checkpoint

_Last updated: 2026-09-08_

**This is the project's single active session-continuity record.** Historical logs live outside the
repository in `~/vault/grocery/logs/`. `nutrition-curriculum/00_PROJECT_CONTROL/PROJECT_STATUS.md`
remains the durable phase/project status source; phase artifacts and `DECISIONS/` records remain the
authoritative technical content. This file references those artifacts rather than duplicating them.

## Current Objective

Phase 9 (Application / Product Architecture) architecture work is **complete through the
post-ratification reconciliation** (§20). **The first implementation milestone — "Food Identity +
Exclusion Foundation," bounded by §20.12/§20.5 — is complete**, scoped exactly as a foundation: it
makes A1 and B3's food-level half structurally real, establishes (but does not enforce) B3's
allergen-class half, and correctly does not implement C2. Recipe/shopping-architecture work,
`DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`, and clinical functionality remain untouched and out of
scope, as before.

Execution status (protocol §48.8 state machine): **`READY`** — milestone 1 checkpointed, no
autonomous execution active, no review gate open. Gate 7 (end of Phase 9) has **not** opened.

## Current State

- **Phase 8: CLOSED.** Gate 6 resolved GO (2026-09-07). Gates 1–6 all GO.
- **Phase 9: architecture complete through §20** (post-ratification reconciliation). No further
  architecture-document work occurred this milestone; §0–20 are unchanged by it.
- **Implementation milestone 1: COMPLETE (foundation-scoped).** See "Implementation Milestone 1"
  below for exactly what that does and does not cover.

### Ratified safety semantics (detail in §19 and §20.2; record in `DECISIONS/`) — unchanged by
implementation

- **A1 — intolerance stays a soft constraint.** `DEC-053` unchanged: allergy → hard exclusion;
  unclear → safer hard treatment/confirmation; intolerance → soft; preference → weaker filtering.
  **Now implemented**: `src/lib/foodExclusions.ts`'s `tierOf()` gives intolerance `"soft"` and
  everything else `"hard"`; `comboMatch.ts` and `MealFoodPicker` consume the split (soft = stays
  selectable/offered, de-prioritised; hard = removed).
- **B3 — hybrid exclusion unit**: food-level *and* allergen-class-level. **Invariant: a safety-level
  allergen-class exclusion must not be defeated by a food-level "allow" or omission.** Food-level is
  fully implemented and enforced. **Allergen-class is a type-level foundation only — not enforced —
  because no allergen vocabulary, no per-food allergen mapping, and no unmapped-food default policy
  exist anywhere in this project** (checked: the nutrition table's columns, `data/nutrition.json`'s
  row schema, every `supabase/*.sql` migration — none carry allergen data). Wiring enforcement in
  with no real data and no decided default would misrepresent B3 as protecting something it
  structurally cannot yet.
- **C2 — validity window** on exclusions. **Not implemented.** The ratification record itself
  proposes no schema; building one now would mean inventing field names/semantics that aren't
  established, which is explicitly out of bounds. Current absence is not unsafe — nothing has an
  expiry, so nothing can silently expire — it is simply not built yet.
- No `DEC` was amended and no `DEC` ID created. `DEC-053`, `DEC-061`, `DEC-011`, `DEC-054` are
  unmodified by both the ratification and the implementation milestone.

### ⚠ Label collision (see §20.0) — unchanged

The ratified **A1/B3/C2 are §18/§19's options**, never §16's. §16.2's "B3" means *"do nothing now"*
and is marked "Not recommended." §16.1's identity options A1/A2/A3 are a different, still-**open**
question — untouched by this milestone (see "Food identity" below).

## Implementation Milestone 1 — "Food Identity + Exclusion Foundation"

- **Food identity: no new entity/table was needed.** `nutrition.name_tr` (normalized: trim + tr-TR
  lowercase) plus an exact-match `aliases[]` array already forms a deterministic canonical identity —
  every alias resolves to the *same* object as its canonical name (verified by `===` identity, not
  just equal fields, in `src/lib/nutrition.test.ts`).
- **Fuzzy matching is confirmed NOT a safety identity mechanism.** `isCloseMatch`/`findCanonicalName`
  (in `fuzzyMatch.ts`/`store.ts`) exist only for shopping-list-item dedup on free-typed text; neither
  `foodExclusions.ts` nor `comboMatch.ts` imports them. `src/lib/foodIdentitySafety.test.ts` is a new
  structural regression guard that fails if either file ever does. The combo→shopping-list path
  (`TodayView` → `listActions.addItem`) already explicitly bypasses fuzzy rewriting via an `exact:
  true` flag when adding a combo's canonical Food id.
- **Exclusion semantics**: allergy/unclear/unclassified → hard; intolerance → soft; preference →
  hard (deliberately unchanged from pre-migration behavior, documented in-file, not a new decision).
  `food_exclusions` (reason-tagged, `supabase/13-personal-plan-food-exclusions.sql`) replaces the old
  undifferentiated `excluded_food_ids text[]`, which is kept read-only for rollback.
- **B3 allergen-class foundation** (`Nutrition.allergenClasses?: string[]`,
  `AllergenClassExclusion`, `allergenMappingStatus()`, `hasAllergenClassExclusion()` in
  `foodExclusions.ts`): type-level only, not wired into any UI or into `comboMatch.ts`'s live
  filtering — see "Current State" above for why.
- **User vs. household scope**: verified, not touched. `personal_plan`/`food_exclusions` scope by
  `user_id` alone (`requireUser`); the shared `items`/`lists` tables use a separate
  `requireHouseholdAccess` check. Exclusions only filter personal suggestion surfaces, never the
  shared list itself. No accidental household-wide treatment found — nothing needed fixing.
- **UI behavior preserved, not redesigned**: allergy/unclear disappear from suggestions, intolerance
  stays selectable and flagged, save failures show a visible retry banner (`useMealPersonalization`'s
  `saveError`/`retrySave`).

### Verification

- **Tests: 35/35 passing** (16 pre-existing behavioral tests + 19 new — identity/alias determinism,
  the fuzzy-match structural guard, allergen-class foundation, preference-tier documentation).
  `npm run test` (`vitest run`).
- **`tsc -b`: clean.**
- **Production build (`npm run build`): clean** (pre-existing 630 KB chunk-size warning, unrelated).
- **Prior real-backend QA (hard allergy, soft intolerance, unclear reconfirmation, save-error, picker
  behavior) remains valid and was NOT rerun this milestone** — every change in this milestone is
  additive types and pure-function tests; no UI, persistence path, or API route was touched.

### Files changed by this milestone

- `src/lib/nutrition.ts` — added `allergenClasses?: string[]` to `Nutrition`, pass-through in
  `pickNutrition`.
- `src/lib/foodExclusions.ts` — added `AllergenClassExclusion`, `AllergenMappingStatus`,
  `allergenMappingStatus()`, `hasAllergenClassExclusion()`.
- `src/lib/foodExclusions.test.ts` — extended with allergen-class and preference-tier tests.
- `src/lib/nutrition.test.ts` — new; canonical identity + alias resolution tests.
- `src/lib/foodIdentitySafety.test.ts` — new; structural fuzzy-match guard.

(`foodExclusions.ts`/`.test.ts`, `comboMatch.ts`/`.test.ts`, the UI components, the personal-plan API
route, and `supabase/13-personal-plan-food-exclusions.sql` predate this milestone — they were already
implemented and QA-validated before this session inspected and extended them.)

## Important Decisions

- Session continuity is this checkpoint plus `~/vault/grocery/logs/`; `AI_SESSION_STATE.md` was
  retired 2026-09-07 and protocol §48 points here.
- Phase 9 is extended **in place** in its one artifact — do not create new Phase 9 documents (§31).
- Corrections are recorded forward, never by rewriting earlier sections (§0.1, §12.1, §17, §20.0).
- Implementation milestone 1 is scoped as a **foundation**: where authoritative data or a decided
  schema was missing (allergen taxonomy/mapping/unmapped-default, C2's validity-window schema), the
  milestone stopped and reported rather than inventing one. This was a deliberate scope decision, not
  an oversight — see "Problems / Unresolved Issues" below for exactly what's still needed.

## Constraints

- **Do not reverse or reinterpret the ratified A1/B3/C2 semantics autonomously**, and do not amend
  `DEC-053`/`061`/`011`/`054`.
- Do not resolve autonomously: canonical Food identity's **anchor** (§16.1 A1/A2/A3 — still open,
  untouched by milestone 1), user-vs-household scope, allergen vocabulary, unmapped-food default,
  precedence mechanics, C2's schema, `DEC-067`, `DEC-069`, `DEC-099`/`DEC-100`, `DEC-021`/`110`,
  `DEC-090`.
- Do not modify stable IDs (213 topics, 112 decisions), rewrite historical decisions, or reopen
  Phase 8.
- **A1 and B3's food-level half are now enforced in shipped code.** B3's allergen-class half and C2
  are not — see "Current State" above. Do not describe either as enforced without the underlying data
  or schema decision existing.
- Recipe engine, batch production, shopping-architecture redesign, pantry architecture,
  pricing/availability, and clinical functionality remain out of scope, as before.

### Work that must not be repeated

- On Cooking 7e content inspection (`ON_COOKING_7E_EXECUTION_RECORD.md`) and the Phase 8 closure
  audit (`~/vault/grocery/logs/2026-09-07.md`).
- The `DEC-060`–`075` capability map (§2), the 13-area dependency inventory (§12), the domain-boundary
  pass (§14), the Human Decision Package (§16), the code trace (§17), the review package (§18), the
  ratification (§19), and the readiness/dependency/milestone reconciliation (§20). Extend; do not
  recreate.
- Implementation milestone 1's inspection pass (current alias/canonical-name mechanism, `foodExclusions.ts`,
  `comboMatch.ts`, the exclusion API/schema, the fuzzy-match separation) — re-read this checkpoint's
  "Implementation Milestone 1" section instead of re-deriving it.

## Problems / Unresolved Issues

1. **Canonical Food identity anchor** (§16.1 A1/A2/A3) — still open; milestone 1 confirmed the
   existing `name_tr`/`aliases` mechanism is safe to build on without resolving the anchor question.
2. **Allergen vocabulary, per-food mapping, and the unmapped-food default policy** — all three
   required before B3's allergen-class half can go live. None exists in this project today. A
   fail-open unmapped default would negate B3; this milestone deliberately did not choose one.
3. **C2's schema** — validity-window field shape and the reconfirmation-flow API contract are
   undecided. Not implemented; the ratification record itself proposes no schema.
4. **User-vs-household exclusion scope** (§18.4, §20.7) — collision mapped, seam identified
   (`netlify/functions/_auth.ts`), decision preserved. Re-verified in milestone 1: no accidental
   household-wide leak found.

Lower priority: `DEC-067`; `DEC-069`; `DEC-099`/`DEC-100`; `DEC-021`/`110` and `DEC-090` values; the
Linear update the user requested but never specified.

## Next Steps

1. Human decisions needed before further B3/C2 work: allergen vocabulary source, per-food mapping
   approach, the unmapped-food default policy, and C2's validity-window schema — all listed above,
   none decided here.
2. Once those exist: wire B3's allergen-class matching into `comboMatch.ts`/`MealFoodPicker` and add
   the UI to create an allergen-class exclusion; build C2's schema/migration and reconfirmation flow.
3. `DEC-067` gates all recipe work; `DEC-069` gates only restaurant-scale batching, **not** household
   batch preparation (§20.8) — unchanged, not evaluated this milestone.
4. Start every piece of coding work on a new branch before writing code (`CLAUDE.md`), and do not
   commit without being asked.

## Important Context

- Authoritative evidence: the Phase 9 artifact (technical content), `PROJECT_STATUS.md` (phase
  status), `00_PROJECT_CONTROL/DECISIONS/` (gate and ratification records), `APP_DECISION_INVENTORY.md`,
  `DECISION_LOGIC_SPECIFICATION.md`, `APP_DECISION_DEPENDENCY_GRAPH.md`.
- A concurrent Copilot-driven process previously edited files in `00_PROJECT_CONTROL/` — re-read files
  before editing if resuming after a gap.
