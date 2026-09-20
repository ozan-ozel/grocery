# Food Selection — MVP Scope

Domain K is `DEC-060` through `DEC-065`. Your roadmap note is right: for MVP this is covered by the
exclude function. The MISSING label is not.

| DEC | What | Readiness | Reality |
|---|---|---|---|
| `DEC-060` | Per-occasion target to candidate foods | `SHIPPED` | `scoreAllCombos` implements the translation; `matchEveningCombos` (`src/lib/eveningRecommend.ts`, shipped 2026-09-16) extends it with a quantity-solving evening path — see below |
| `DEC-061` | Restrictions, allergies and preferences filter | `PARTIAL` | Code done and safety-tested, data incomplete |
| `DEC-062` | Prioritize candidates by nutrient density | `BLOCKED` | Needs micronutrient-density data |
| `DEC-063` | Generate substitutions | `BLOCKED` | No substitution mechanism |
| `DEC-064` | Weight by cost, convenience, culture | `BLOCKED` | No cost or cultural data model |
| `DEC-065` | Use existing grocery and pantry data | `BLOCKED` | Curriculum-blocked, GAP-D |

## Evening-meal quantity-aware recommendation (2026-09-16)

`DEC-060` was already `SHIPPED` via `scoreAllCombos`/`matchCombos` (`src/lib/comboMatch.ts`), which
rank fixed-gram authored combos by protein within a kcal budget. `src/lib/eveningRecommend.ts` adds a
second, additive path — `matchEveningCombos` — that solves grams per candidate protein+carb pattern
against the caller's actual remaining macros (bounded discrete search over realistic gram grids, not a
sequential protein-then-kcal formula, so a higher-fat protein source doesn't blow the remaining fat
budget the way a sequential solver would). `comboMatch.ts` itself is unchanged.

Candidates are limited to foods confirmed in the checked-in `data/nutrition.json` seed (`tavuk göğsü`,
`dana kıyma`, `hindi göğsü` × `pirinç`, `bulgur`, `makarna`, 7 patterns) — antrikot/bonfile/kontrfile/
chicken thigh were not added because live-catalog access (the `nutrition` table can differ from the
seed) wasn't available in the implementing session. Add them once their exact live `name_tr` is
confirmed, e.g. via the Besin tab.

Shown as the "Akşam için öneriler" section of `MealPlanView.tsx` (it was first wired into the "Bugün"
tab of `TodayView.tsx`, which has since been retired to `archive/` — see `archive/README.md`), reusing
the existing `SuggestionCard`/"Listeye ekle"/"Hazırlanıyor"/"Yedim" UI and the existing gram-edit flow
after logging — no new UI component, no backend/schema change.

## The one work item

`DEC-061` is `PARTIAL` for a single reason: allergen-class enforcement is implemented and
safety-tested, but only **19 of 89 foods** have curated allergen-class mappings. That is a data-coverage
gap, not a code gap.

It is the same item tracked in `gi-tolerance-mvp.md`, listed here because this is the decision it
actually belongs to. Do it once.

## Out of scope

- Nutrient-density ranking, `DEC-062`. Blocked behind the micronutrient data, which is itself V2.
- Substitutions, `DEC-063`.
- Cost, convenience and cultural weighting, `DEC-064`. Inventing prices would be fabricated data.
- Pantry-aware selection, `DEC-065`, and the shopping reconciliation that waits on it.
