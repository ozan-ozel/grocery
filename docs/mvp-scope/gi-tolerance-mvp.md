# GI Tolerance — MVP Scope

Domain I is `DEC-051` through `DEC-054`. One is shipped. The other three are blocked on the same
missing thing: a symptom-logging surface.

| DEC | What | Readiness |
|---|---|---|
| `DEC-051` | Capture GI symptoms and modify guidance from them | `BLOCKED` |
| `DEC-052` | When symptoms mean escalation rather than adjustment | `BLOCKED` |
| `DEC-053` | Intolerance vs allergy, for downstream filtering | `SHIPPED` |
| `DEC-054` | How tolerance adapts with repeated exposure | `BLOCKED` |

## Checked: exclusion already works, for foods and for meals

The roadmap marks this TO BE CHECKED. It is present on both levels.

- **Foods.** `src/lib/foodExclusions.ts` carries a reason taxonomy of allergy, intolerance, unclear,
  preference and unclassified, split into hard and soft tiers. That split is `DEC-053`, shipped.
- **Meals.** `src/lib/comboMatch.ts` blocks a composite combo the moment any one of its items is hard
  excluded.

**The real gap is data, not code.** `DEC-061` is `PARTIAL` for one reason: allergen-class enforcement
is implemented and safety-tested, but only **19 of 89 foods** have curated allergen-class mappings.
Closing that coverage gap is the actionable work item here, and it is data entry rather than
engineering.

## Restricted scope: declare, do not diagnose

The three blocked decisions all need symptom logging. Do not build it for MVP. Capturing symptoms
means interpreting them, and interpretation is `DEC-051` and `DEC-052`, which are blocked precisely
because no threshold exists for when a symptom is a dietary adjustment versus a reason to escalate.

The buildable cut is the same shape as the dietary-pattern cut in `macros-mvp.md`: **a declared
constraint is safe, an interpreted symptom is not.**

So for MVP: a short pick-list of the most common declared intolerances, each mapping onto the existing
exclusion system. Nothing new underneath it.

One thing to respect while building it: `intolerance` already maps to the **soft** tier and `allergy`
to **hard**. That is `DEC-053`'s shipped split, and a pick-list must not quietly promote an
intolerance to a hard exclusion or demote an allergy.

## Out of scope

- Symptom logging, and anything derived from it.
- Escalation thresholds, `DEC-052`. The app must not judge whether a reported symptom is serious.
- Tolerance adaptation over time, `DEC-054`.
- Elimination protocols such as staged FODMAP reintroduction.
