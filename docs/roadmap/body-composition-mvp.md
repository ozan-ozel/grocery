# Body Composition — MVP Scope

Domain E of the decision corpus is `DEC-025` through `DEC-030`. All six are `BLOCKED`, and the
register gives all six the same reason: "a weight/body-comp logging-and-trend subsystem that does not
exist."

That subsystem splits cleanly in two. **Capture** is safe to build now. **Interpretation** is not.
This MVP is the capture half, and nothing else.

## The feature

A measurement log. The user records body measurements over time and sees them plotted. The app stores
and displays them. It does not judge them.

## In scope

- Add a dated measurement: weight required, waist optional.
- Edit and delete past entries.
- A history list and a simple chart of each measure over time.
- BMI recomputed from the most recent weight, as a context signal only. This already exists in
  `src/lib/mealPersonalization.ts` and does not change.
- Keeping one source of truth for current weight, so the profile and the log cannot disagree.
- Metric units only: kg and cm.

## Out of scope

- Body-fat percentage from tape measurements or any anthropometric equation.
- Smart-scale, bioimpedance, or DXA import.
- Any target computed from fat-free mass, including protein per kg FFM and energy availability.
- Trend calls, reassessment triggers, and target rates of change. These are `DEC-026`, `DEC-027` and
  `DEC-028`, all still blocked.
- A distinct metric set for recomposition goals, which is `DEC-030`.
- Progress photos.

## Inputs and outputs

| Input | Notes |
|---|---|
| Date | Defaults to today |
| Weight, kg | Required. kg only, no unit switcher |
| Waist, cm | Optional. cm only. The profile already has a `waist_cm` field |

| Output | Consumer |
|---|---|
| The stored measurement series | History view, chart |
| Most recent weight | The existing target calculation, via the profile |
| BMI and its label | Context display only, as today |

## The boundary that has to hold

Measurements feed nothing except the existing current-weight path. Recomputing the same population
formula with a newer weight is not individualization, and it must not be presented as though the app
has learned something about the user. Anything that reads the series as evidence about the person's
energy requirement belongs to the adaptive loop, which is blocked and out of scope here.

## Decided

**Units: kg and cm only.** No lb or inch support and no unit switcher.

## Deferred to V2

The rest were raised and parked. Parking a question still implies a default, so the default the MVP
ships with is stated next to each one. None of them changes what gets stored, so all four stay cheap
to revisit.

| Question | What V2 would add | MVP default |
|---|---|---|
| Does a newly logged weight update the profile weight? | A prompt, or a separate field kept in sync | The most recent entry becomes the profile weight on save. One value, no prompt, no sync step |
| Raw points or a smoothed line on the chart? | Smoothing | Raw points only, which is also the safer side of `DEC-026` |
| Does the app prompt for weigh-ins on a cadence? | Cadence and reminders, decided with the Monitoring scope | No prompts. The user logs when they want to |
| Retention | An explicit retention policy | Keep everything. Measurements are scoped to the profile and are removed with it |

## Why this feature specifically

The same log is the prerequisite for the optional second phase of energy individualization, where
observed weight change is what makes an individualized estimate possible at all. Building capture now
costs nothing extra and unblocks that path later, without committing to any of it today.

See `nutrition-curriculum/12_ENERGY_INDIVIDUALIZATION/` for that work, in particular
`ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html`, where this subsystem is named as the highest-leverage
missing piece.
