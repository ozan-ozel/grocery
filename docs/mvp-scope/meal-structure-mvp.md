# Meal Structure — MVP Scope

Domain J is `DEC-055` through `DEC-059`. Two of the four roadmap items marked MISSING are already
covered.

| DEC | What | Readiness | Reality |
|---|---|---|---|
| `DEC-055` | How many eating occasions, and what drives that | `COVERED` | Fixed four-slot structure |
| `DEC-056` | Distributing daily targets across occasions | `COVERED` | Per-slot target-vs-consumed totals |
| `DEC-057` | Pre, during and post-exercise timing | `BLOCKED` | Needs exercise-timing data |
| `DEC-058` | Hunger and satiety shaping structure | `BLOCKED` | No principled basis |
| `DEC-059` | Schedule, access and cultural overrides | `BLOCKED` | No input surface |

## Two items are not missing

**How many eating occasions** is `DEC-055`, covered by the fixed four-slot structure. **Distributing
daily macro and energy targets across those occasions** is `DEC-056`, covered by the existing per-slot
target-vs-consumed totals.

Neither needs building. What is genuinely missing is a macro **range** per meal rather than a per-slot
total, and that item is already scoped in `macros-mvp.md` rather than duplicated here.

## The gut-composition question has no owning decision

"What is the best combination of macros in a meal for digestion and gut health" does not map to any
`DEC` in Domain J or Domain I.

It carries the same risk as the hydration timing item: it is a nutrition-science claim that needs a
source, and nothing in the corpus supplies one. The nearest decision, `DEC-058`, is blocked for a
related reason, that hunger and satiety responsiveness has no principled numeric basis to build on.

**Recommendation: leave it out of MVP unless a source is produced.** Shipping a per-meal macro
combination framed as better for digestion, without one, would be inventing guidance.

## MVP scope

In:

- Verify the four-slot structure and per-slot totals behave as `DEC-055` and `DEC-056` describe. This
  is a check, not a build.
- Per-meal macro bounds, tracked in `macros-mvp.md`.

Out:

- Exercise-timed nutrition, `DEC-057`. Already V2 in the roadmap and blocked on the same training data
  the energy work needs.
- Structure that adapts to reported hunger or satiety, `DEC-058`.
- Schedule and cultural overrides, `DEC-059`. No input surface exists.
- Gut-optimal macro combinations, unless sourced.
