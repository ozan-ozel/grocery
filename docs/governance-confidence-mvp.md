# Governance and Confidence — MVP Scope

Domain T is `DEC-108` through `DEC-112`, plus `DEC-024` which carries the same convention for energy.

| DEC | What | Readiness |
|---|---|---|
| `DEC-108` | Flagging guidance that rests on active scientific debate | `BLOCKED` |
| `DEC-109` | Detecting conflicting user-provided inputs | `BLOCKED` |
| `DEC-110` | Observed response contradicting the model estimate | `BLOCKED` |
| `DEC-111` | Periodic review of guidance logic | `DEFERRED` |
| `DEC-112` | Communicating data-quality and confidence consistently | `COVERED` |

## The roadmap item is DEC-112, and it is covered

"Determine how data-quality/confidence levels are communicated consistently across all decisions" is
`DEC-112` word for word, and the register marks it `COVERED`. The convention is the
`warnings`/`assumptions` string arrays on `PersonalTargets`, which the register describes in its own
words as ad hoc and not scaled, but adequate for MVP.

Your instinct to keep this simple matches the corpus. Nothing needs building.

## What "consistent" means in practice

The roadmap asks for consistency across all decisions. For MVP that is achieved by **not adding a
second mechanism**: when a new feature needs to express a caveat, it uses the same two arrays rather
than inventing its own confidence display.

That is the whole MVP requirement. It costs nothing and it is the thing that actually breaks if
ignored.

## The known limitation, for V2

The energy individualization work identified precisely where this convention runs out: the arrays
carry fixed sentences, so nothing in the pipeline knows how much data a user has actually produced.
Confidence cannot scale with evidence when no stage counts the evidence.

That is a V2 upgrade and it is already described in
`nutrition-curriculum/12_ENERGY_INDIVIDUALIZATION/`, including the typed output shape that would
replace the arrays. Do not start it here.

## Out of scope

- Evolving-consensus flagging, `DEC-108`.
- Cross-input conflict detection, `DEC-109`.
- Model-versus-observation contradiction handling, `DEC-110`. It shares the unresolved deviation-cap
  parameter with `DEC-021`.
- Periodic guidance review, `DEC-111`, deferred as a future feature.
