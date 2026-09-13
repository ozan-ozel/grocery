# Macros — MVP Scope

The daily macro layer is mostly shipped: protein, carbohydrate, fat and fiber all have implemented
targets. What is left is per-occasion distribution, per-meal bounds, and dietary patterns.

One shipped value contradicts a correction the corpus already ratified. That should be fixed before
anything new is built.

## The four roadmap items

| Item | Owning DEC | Readiness | Reality |
|---|---|---|---|
| Protein across eating occasions | `DEC-033` | `PROVISIONAL` | Implemented, but flat and display-only |
| Total daily carbohydrate | `DEC-034` | `SHIPPED` | Implemented, with one value that needs correcting |
| Min/max macros per meal | `DEC-056` | `COVERED` | Per-slot totals exist, per-meal macro bounds do not |
| Dietary pattern constraint | `DEC-038` | `BLOCKED` | Nothing in the code today |

## Fix first: the very-active carbohydrate band

`CARB_G_PER_KG` in `src/lib/mealPersonalization.ts` ships `very_high: 10-12 g/kg/day` as a routine
daily band. Gate 6, applied 2026-09-07, corrected exactly this in
`DECISION_LOGIC_SPECIFICATION.md` §3.3:

- Routine daily fueling tops out at **6-10 g/kg/day**.
- **8-12 g/kg/day is a pre-event loading protocol**, run about 2-3 days before competition, not a
  routine requirement for anyone.
- The spec calls presenting the loading protocol as a daily target "a safety-relevant misstatement
  rather than a presentational one."

The app is currently making that misstatement to any user who selects the highest activity level.
Pre-event loading needs a disclosed event date, which is `DEC-094` and does not exist, so loading is
simply out of MVP. Capping the routine band is the whole fix.

Two smaller gaps in the same calculation, both worth folding in:

- The DRI floor of **130 g/day** is specified and not implemented.
- Sedentary and light users get a sports-nutrition g/kg band. The spec gives the general population an
  AMDR of **45-65% of total energy** instead. The code comment acknowledges the source has no
  sedentary tier.

## Protein across eating occasions

`occasionProteinTargetG()` returns a flat 0.3-0.4 g/kg band and applies it uniformly to every slot. It
is display-only: nothing reads it to gate or resize an entry.

For MVP, keep the band flat and give it a consumer, so a per-slot protein target shows against what was
actually eaten. Redistributing by occasion size, timing, or training proximity is `DEC-035` and
`DEC-057`, both blocked on exercise-timing data that the app does not collect.

## Min and max macros per meal

The fixed four-slot structure and per-slot target-vs-consumed totals already exist. What is missing is
a macro range per meal.

For MVP, derive slot bounds from the existing daily targets and the existing slot split. Nothing
timing-sensitive, for the same reason as above.

## Dietary pattern: vegan, vegetarian, pescatarian

The useful split here is that a pattern constrains **food selection**, not macro numbers.

Changing macro targets per pattern is `DEC-038`, and it is blocked because it would require inventing
values. Filtering foods is the translation layer, and the machinery is already built:
`src/lib/foodExclusions.ts` has a reason taxonomy and hard/soft tiers.

So for MVP a pattern is a saved set of hard exclusions. Macro targets stay exactly as they are, which
keeps the blocked decision closed.

One question to settle when building it: the existing reasons are allergy, intolerance, unclear,
preference and unclassified, and `preference` maps to the soft tier. A vegan's exclusion is not a soft
preference. Either add a pattern reason at the hard tier, or map patterns to hard explicitly.

## Out of scope

- Macro overrides driven by dietary pattern, which is `DEC-038`.
- Carbohydrate timing around exercise and nutrient timing, `DEC-035` and `DEC-057`. Both need
  exercise-timing data.
- Macro adjustment in response to observed data, `DEC-039`, deferred by explicit ratification. Macros
  recompute only downstream of an energy change.
- Pre-event carbohydrate loading, which needs a disclosed event date.
- Conflicting macro-input resolution, `DEC-040`.
