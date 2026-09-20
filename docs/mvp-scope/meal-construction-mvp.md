# Meal Construction and Prep — MVP Scope

Domain L is `DEC-066` through `DEC-070`. Four of the five are already done.

| DEC | What | Readiness |
|---|---|---|
| `DEC-066` | Foods and portions to constructed meals | `COVERED` |
| `DEC-067` | Level of preparation detail | `SHIPPED` at Level 1 |
| `DEC-068` | Cooking skill and available time | `DEFERRED` for v1 |
| `DEC-069` | Batch cooking, leftovers and storage | `SHIPPED` |
| `DEC-070` | Adjusting when the user deviates | `SHIPPED` |

## Item 1 is not missing

Translating selected foods and portions into constructed meals is `DEC-066`, covered by the curated
`combos.json` and `combos.ts`. Nothing to build.

**Update 2026-09-19 — portion tiers shipped.** The Meal Plan's "Yemekler" picker no longer adds a
combo at one fixed portion. Each meal offers Küçük / Normal / Büyük (×⅔ / ×1 / ×1⅓ of the authored
grams) plus a custom multiplier, and a plain tap adds at the last-used tier (remembered per device).
Every ingredient is scaled by the same factor, so protein and carb stay proportional — the
On Cooking ch. 4 recipe/portion conversion factor, the same mechanism the DEC-069 batch planner's
"Kat sayısı" already uses (`scaleComboItems` in `combos.ts`). The gram anchors are **not** from On
Cooking, whose execution record supplies no portion tables; they come from this app's own data (the
authored combo is Normal; 100/150/200 g protein matches the evening solver's 25 g grid). Large takes
rice/bulgur/pasta carb to 200 g raw, above `eveningRecommend.ts`'s 150 g solver ceiling — accepted,
because that ceiling bounds the solver's recommendations, not what a person may choose. Still open:
per-role scaling (leave oil/vegetables fixed) if uniform scaling proves too blunt.

**Update 2026-09-19 — batch preparation UI re-surfaced.** DEC-069 was already `SHIPPED` in the
backend, but its only UI (`BatchPlanner.tsx`) had been taken off Yemek Planı on 2026-09-12 and left
orphaned, so batches were unreachable in the app. Yemek Planı now has a "Toplu Hazırlıklar" sheet
(create a batch from a meal at N portions, or by hand; see prepared / remaining grams per food) and
a per-meal "Partiden" button that adds a batch food into that day's slot at a chosen gram amount,
with a "Parti · <date>" chip on the resulting entry. Leftovers stay derived, never stored; batches
stay immutable (no edit/delete). Plan:
`docs/superpowers/plans/2026-09-19-batch-preparation-ui.md`. Still open: batch ingredients are not
part of the shopping consolidation (DEC-071) — the day's "Bu günü alışveriş listesine ekle" adds
allocated foods like any other entry.

**Update 2026-09-20 — batch preparation UI hidden.** DEC-069's backend, API
(`api/preparation-batches.ts`) and data are untouched and still `SHIPPED`. Only the two entry points
— the "Toplu Hazırlıklar" row on Yemek Planı and the per-slot "add from a batch" ("Partiden") action —
are hidden behind the `BATCH_PREP_VISIBLE` constant in `src/components/MealPlanView.tsx`, because the
Yemekler sheet's naming changed and batch prep has to be re-wired to it. Until the constant is flipped
back to `true`, batch creation and allocation are not reachable in the app; entries that were already
allocated from a batch keep their "Parti · <date>" label.

**Update 2026-09-20 — Yemeklerim / Tarifler.** The Meal Plan's "Yemekler" button now opens one
sheet with three tabs: **Yemeklerim** (the user's own saved meals), **Hazır Yemekler** (the built-in
combos, with a "Sana uygun" block on top) and **Tarifler** (meals that have preparation steps). A
user builds a meal once (foods and grams, picked from the nutrition catalog) and adds it to any slot
in one tap at its saved grams. Saved meals are **per user**, not per household (`saved_meals` table,
RLS on `user_id`), because exclusions and preferences are personal. There is no separate recipe
type: a saved meal that carries optional free-text steps ("Hazırlama adımları ekle") *is* a recipe
and shows up in Tarifler, next to the built-in meals that have a `prepNote`. "Sana uygun" is
deterministic and slot-aware (`src/lib/mealRecommend.ts`, pure, no AI): it takes the day's
remaining macros, gives the slot its share of them, picks the portion tier that fits best for every
meal the slot accepts, and ranks by the same score the evening solver uses. The per-slot weights
(snack counts as half a meal) are MVP tuning constants, not derived from a source. Saved meals blocked by
an allergy or exclusion are shown disabled with the reason instead of vanishing. Plan:
`docs/superpowers/plans/2026-09-20-meals-sheet-yemeklerim-tarifler.md`. Still open: the batch
form's "Yemekten" list shows only the built-in meals (saved meals are not listed there yet);
"Sana uygun" for the snack slot is only as good as the slot tags in `data/combos.json` — only 6 of
the 20 built-in meals carry one, and in the live check the four snack suggestions were all
breakfast-tagged meals of 410-460 kcal rather than light items. The snack slot also admits
`kahvalti`-tagged meals (`fitsSlot`), and only 2 of the 20 meals carry `ara-ogun` / `atistirmalik`, so on a
partly filled day an egg-and-bread breakfast (about 414 kcal) can outrank the two real snacks; the fix is
data (tag more light meals), not code. When all four slots are already filled, `mealRecommend.ts` scores a
snack against the whole day's remaining budget (the slot weight collapses to 1.0), which amplifies this.
Per-role portion scaling (leaving oil and vegetables fixed) is not part of this feature.

## Item 2: user-authored recipes are now saved meals

Built-in combos are still read-only: `ALL_COMBOS` is derived from the JSON at module load, and no
path edits them. What changed on 2026-09-20 is that a user can add, edit and delete **their own**
meals (Yemeklerim, `saved_meals`, per user). Nothing here edits or overrides a curated combo, and
saved meals are not shared with the household.

The catch that used to define this item — a user-authored recipe has no verified nutrition data —
is resolved by construction. The form only offers foods that exist in the nutrition catalog, and a
saved meal stores only foods and grams; its totals are always derived from the live catalog, the
same way a built-in combo's are. So a saved meal drives macro and energy tracking, "Sana uygun" and
the day's remaining budget exactly like a curated one, with no free-text ingredients and no
unverified numbers. If a food is later removed from the catalog, the meal is blocked and shown
disabled rather than silently miscounted.

## Item 3: recipe-level sections stay Level 1; user steps are the user's own text

Ingredients, preparation, cooking, serving and storage sections are **recipe-level** detail.
`DEC-067` was ratified on 2026-09-08, by a human reviewer, as **Level 1**:

> For a meal already constructed by Grocery, the application provides an ingredient list with
> quantities, optionally accompanied by a concise textual preparation note.

That ratification explicitly did not select recipe-level, and it still stands for **Grocery's own
curated meals**: they keep the ingredient list plus at most one `prepNote`. What 2026-09-20 adds is
scoped to the *user's* content: a saved meal may carry the user's own ordered free-text steps
(display-only, shown in Tarifler). That is the user's text, not guidance from Grocery — Grocery
does not write, check or vouch for it — so it re-scopes `DEC-067` rather than overturning it. The
owner approved that reading on 2026-09-20; the `DEC_REGISTER.md` note for `DEC-067` records it.

What is still **not** built: structured recipe sections (separate ingredients / cooking / serving /
storing blocks) — only one free-text steps list exists — and any recipe-level detail for the curated
meals. Two things keep moving up cheap rather than painful:

- The ratification itself records that **Level 1 is a strict subset of Level 2**, so moving up is
  additive and discards nothing already built.
- Storage is already handled. `DEC-069` covers batch cooking, leftovers and storage in the plan, and it
  is shipped and live-validated.

**Food-safety guidance (cooling, freezing, reheating) is still out of scope.** Treat it as safety
content, not recipe text, because wrong guidance there causes real harm. The corpus already has
somewhere to source it, in `11_PHASE_8_PRACTICAL_TRANSLATION/CULINARY_SOURCE_EXTENSION.md` and the On
Cooking execution record. A user's own steps may mention it, but the app adds none.

## MVP scope

In (shipped 2026-09-20):

- User-authored saved meals, with optional free-text steps, in the Yemekler sheet — nutrition comes
  from catalog-resolved ingredients, so the "no verified nutrition data" catch does not apply.

Out:

- Recipe-level preparation detail for Grocery's own meals, until `DEC-067` is re-ratified at Level 2.
- Structured recipe sections (ingredients / cooking / serving / storing as separate blocks).
- Cooking skill and time constraints, `DEC-068`, deferred by ratification.
- Cooling, freezing and reheating guidance, until it is sourced from the culinary corpus.
- Saved meals in the batch form's "Yemekten" list.
