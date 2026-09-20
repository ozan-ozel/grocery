# Shopping — MVP Scope

Domain M is `DEC-071` through `DEC-075`. The answer to "check whether it is implemented already" is
yes.

| DEC | What | Readiness |
|---|---|---|
| `DEC-071` | Meal plan to consolidated shopping list | `PROVISIONAL`, implemented |
| `DEC-072` | Reconcile against pantry and on-hand items | `BLOCKED` |
| `DEC-073` | Adapt to a disclosed budget | `BLOCKED` |
| `DEC-074` | Adapt to store availability | `BLOCKED` |
| `DEC-075` | Minimize shopping frequency and list complexity | `DEFERRED` |

## It is implemented

`src/components/MealPlanView.tsx` puts planned foods onto the active list: `toggleDayShoppingList()`
for a whole day, `requestShoppingToggle()` per item, and `addEveningComboToList()` for an evening
suggestion. That is the meal-plan-to-shopping-list path, and it is the one thing Domain M needs for
MVP. (The earlier `addComboToList()` lived in `TodayView.tsx`, now in `archive/` — see
`archive/README.md`.)

`PROVISIONAL` means it is a deliberately temporary MVP choice, not that it is incomplete. The part
worth verifying rather than assuming is in `DEC-071`'s own wording, **consolidation**: when two combos
share an ingredient, does the list merge the quantities or add a second line? Either behaviour can be
defensible, but it should be a choice rather than an accident.

## Out of scope

- Pantry reconciliation, `DEC-072`. Blocked behind `DEC-065`, which is itself curriculum-blocked.
- Budget adaptation, `DEC-073`. There is no cost data model, and inventing prices would be fabricated
  data.
- Store availability, `DEC-074`. No data model.
- Trip minimization, `DEC-075`. Deferred, and flagged in the register as a future feature rather than
  core.
