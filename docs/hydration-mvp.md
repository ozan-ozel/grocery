# Hydration — MVP Scope

Domain H is `DEC-046` through `DEC-050`. One is implemented, four are blocked on data the app does not
collect.

| DEC | What | Readiness | Reality |
|---|---|---|---|
| `DEC-046` | Baseline fluid need | `PROVISIONAL` | Implemented |
| `DEC-047` | Exercise adjustment | `BLOCKED` | Needs exercise-duration data |
| `DEC-048` | Heat and altitude | `BLOCKED` | Ratified at Gate 6, mostly as a prohibition |
| `DEC-049` | Sweat and electrolyte loss | `BLOCKED` | Needs sweat-rate data |
| `DEC-050` | Safety escalation | `BLOCKED` | Needs a real, sourced threshold |

## "How much to drink" is not missing

The roadmap marks it MISSING. It ships today: `waterMl = weightKg * 33` in
`src/lib/mealPersonalization.ts`.

Two things about it are worth fixing, neither of which is new work on the number itself:

- **It is a collapsed range.** 33 is the midpoint of the drafted 30-35 mL/kg/day band, and the code
  comment says so. Showing the band instead of the midpoint is the cheap fix, and it is the same
  pattern flagged in the energy work, where collapsing a range to a point hides the method's own
  uncertainty.
- **One question needs settling first.** The DRI Adequate Intake the spec cites, roughly 2.7 L/day for
  women and 3.7 L/day for men, explicitly **includes water from food**. The app presents its figure as
  a drinking target. Whether the 30-35 mL/kg approximation means total water or beverages only is not
  stated in the spec, and the number should not be labelled "drink this much" until it is.

## "When to drink" has no owning decision

Domain H covers amount, exercise, environment, electrolytes and safety escalation. **None of the five
covers timing**, either relative to meals or across the day. So this item is not blocked, it is
unowned, and creating a new `DEC` is not something to do casually.

It is also the highest-risk item in this section. Advice about drinking around meals is precisely where
unsourced folk claims live, and the corpus bars unsupported guidance. Nothing in the corpus supports a
specific gap before or after eating.

**Recommendation: ship nothing here for MVP unless a source is produced.** Spreading intake across the
day is defensible. A specific number of minutes before or after a meal is not, on anything currently in
the corpus.

## Why the rest stays blocked

- `DEC-047` already has its answer drafted, the ACSM 400-800 mL/hour replacement band. It only needs
  exercise-duration data, which the training-capture work would supply.
- `DEC-048` was ratified at Gate 6 and the ratification is mainly a **prohibition**: no population heat
  multiplier, because sweat rate varies from about 0.5 to over 3 L/h between individuals, so a single
  multiplier would be a misspecification rather than a rough approximation. Altitude gets an additive
  1-1.5 L/day increment, scoped to altitude training and competition only.
- `DEC-050` is the one with real harm potential. Over-drinking guidance is not harmless, and
  hyponatremia escalation needs a sourced threshold nobody has supplied.

## MVP scope

In:

- Show the baseline as a 30-35 mL/kg range rather than a single midpoint.
- Settle and then state what the figure covers, total water or beverages.
- Keep it a context figure, consistent with how BMI and waist are treated.

Out:

- Exercise, heat, altitude, sweat rate and electrolytes. All blocked on absent data.
- Timing guidance, unless sourced.
- Fluid logging or tracking against a target.
