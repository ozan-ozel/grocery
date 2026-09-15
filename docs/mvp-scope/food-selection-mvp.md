# Food Selection — MVP Scope

Domain K is `DEC-060` through `DEC-065`. Your roadmap note is right: for MVP this is covered by the
exclude function. The MISSING label is not.

| DEC | What | Readiness | Reality |
|---|---|---|---|
| `DEC-060` | Per-occasion target to candidate foods | `SHIPPED` | `scoreAllCombos` implements the translation |
| `DEC-061` | Restrictions, allergies and preferences filter | `PARTIAL` | Code done and safety-tested, data incomplete |
| `DEC-062` | Prioritize candidates by nutrient density | `BLOCKED` | Needs micronutrient-density data |
| `DEC-063` | Generate substitutions | `BLOCKED` | No substitution mechanism |
| `DEC-064` | Weight by cost, convenience, culture | `BLOCKED` | No cost or cultural data model |
| `DEC-065` | Use existing grocery and pantry data | `BLOCKED` | Curriculum-blocked, GAP-D |

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
