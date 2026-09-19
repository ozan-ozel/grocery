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

## Item 2: editable recipes are unowned, and there is a catch

Combos are read-only. `ALL_COMBOS` is derived from the JSON at module load, and no add, update or
delete path exists. No `DEC` in Domain L covers user-authored recipes either, so this is a new
capability rather than a blocked one.

The catch worth deciding up front: **a user-authored recipe has no verified nutrition data.** Curated
combos can drive macro and energy targets because their numbers are known. A user's own recipe cannot,
unless every ingredient resolves to the nutrition table. So either user recipes are display-only, or
ingredient resolution becomes part of the feature. That choice defines the scope more than the CRUD
does.

## Item 3: recipe-level sections need a new ratification

Ingredients, preparation, cooking, serving and storage sections are **recipe-level** detail.
`DEC-067` was ratified on 2026-09-08, by a human reviewer, as **Level 1**:

> For a meal already constructed by Grocery, the application provides an ingredient list with
> quantities, optionally accompanied by a concise textual preparation note.

That ratification explicitly did not select recipe-level. So item 3 is not a gap to fill, it is a
ratified decision to revisit, and only a human can revisit it.

Two things make that cheap rather than painful:

- The ratification itself records that **Level 1 is a strict subset of Level 2**, so moving up is
  additive and discards nothing already built.
- Storage is already handled. `DEC-069` covers batch cooking, leftovers and storage in the plan, and it
  is shipped and live-validated.

What is genuinely new in item 3 is the **food-safety procedural content**: how to cool, freeze and
reheat safely. Treat that as safety content, not recipe text, because wrong guidance there causes real
harm. The corpus already has somewhere to source it, in
`11_PHASE_8_PRACTICAL_TRANSLATION/CULINARY_SOURCE_EXTENSION.md` and the On Cooking execution record.

## MVP scope

In:

- Decide the user-recipe question above, then build the smaller half of it.

Out:

- Recipe-level preparation detail, until `DEC-067` is re-ratified at Level 2.
- Cooking skill and time constraints, `DEC-068`, deferred by ratification.
- Cooling, freezing and reheating guidance, until it is sourced from the culinary corpus.
