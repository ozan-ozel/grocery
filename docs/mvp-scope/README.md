# MVP Scope — Index

One file per `docs/roadmap_v2.md` domain, each mapping that domain to its `nutrition-curriculum`
`DEC` range and to what's actually built. Cross-check against
`nutrition-curriculum/DEC_REGISTER.md` for the authoritative readiness word on any individual `DEC`
— this table summarizes, it doesn't override that register.

| File | Domain | DEC range | MVP status |
| --- | --- | --- | --- |
| [goal-mvp-roadmap.md](goal-mvp-roadmap.md) | A · Goal | DEC-001–004 | `DONE` — maintain/loss/gain selection already shipped |
| [body-composition-mvp.md](body-composition-mvp.md) | E · Body Composition | DEC-025–030 | `NOT_STARTED` — capture-only scope defined, not built |
| [macros-mvp.md](macros-mvp.md) | F · Macros | DEC-031–040 | `PARTIAL` — carb-band correction shipped 2026-09-15; per-occasion protein consumer, per-meal macro bounds, and dietary-pattern-as-exclusion still open |
| [hydration-mvp.md](hydration-mvp.md) | H · Hydration | DEC-046–050 | `PARTIAL` — baseline fluid need (DEC-046) implemented; the rest blocked on missing exercise/environmental data |
| [gi-tolerance-mvp.md](gi-tolerance-mvp.md) | I · GI Tolerance | DEC-051–054 | `DONE` — nothing left to build for MVP (only DEC-053 is shippable; the rest are blocked) |
| [meal-structure-mvp.md](meal-structure-mvp.md) | J · Meal Structure | DEC-055–059 | `PARTIAL` — see file for which of the four roadmap items are already covered |
| [food-selection-mvp.md](food-selection-mvp.md) | K · Food Selection | DEC-060–065 | `PARTIAL` — the one open item is a data-coverage gap (19/89 foods have curated allergen-class mappings), not a code gap |
| [meal-construction-mvp.md](meal-construction-mvp.md) | L · Meal Construction/Prep | DEC-066–070 | `DONE` — four of five already shipped; portion tiers on the Yemekler picker added 2026-09-19; batch-preparation UI re-surfaced 2026-09-19 (hidden again 2026-09-20 pending re-wiring); Yemeklerim (user-authored saved meals), Tarifler and "Sana uygun" added to the Yemekler sheet 2026-09-20; meal cards, slot/day clear and a 5-step undo on Yemek Planı added 2026-09-21 |
| [shopping-mvp.md](shopping-mvp.md) | M · Shopping | DEC-071–075 | `PARTIAL` — meal-plan→shopping-list consolidation (DEC-071) implemented; the rest blocked/deferred |
| [monitoring-mvp.md](monitoring-mvp.md) | N · Monitoring | DEC-076–080 | `DONE` — nothing left to build for MVP (one covered, four blocked on a missing subsystem) |
| [sport-training-mvp.md](sport-training-mvp.md) | P · Sport/Training Data | DEC-092–095 | `NOT_STARTED` — explicitly deferred to V3 (2026-09-15 decision); real per-activity energy-cost research already done (see `docs/session-checkpoints/` around that date) if picked back up |
| [access-affordability-mvp.md](access-affordability-mvp.md) | S · Access/Affordability | DEC-106–107 | `DONE` — already covered, nothing to build |
| [governance-confidence-mvp.md](governance-confidence-mvp.md) | T · Governance/Confidence | DEC-108–112, DEC-024 | `DONE` — nothing needs building; also the file that flags the range-based energy-target idea as an explicit V2-upgrade, not MVP |
| [life-stage-mvp.md](life-stage-mvp.md) | R · Life Stages | DEC-103–105 | `DONE` — excluded-populations copy shipped 2026-09-15 |

## Status vocabulary

- `DONE` — nothing left to build for this domain's MVP scope (may still have `BLOCKED` DECs beyond MVP)
- `PARTIAL` — some of the domain's MVP scope is shipped, some isn't
- `NOT_STARTED` — scope is written, nothing built

## Keeping this current

Per `CLAUDE.md`'s "Session continuity" rule: when an MVP-scope item ships, update this table's status
column in the same commit — alongside the `*-mvp.md` file's own note, `docs/roadmap_v2.md`'s line, and
the `DEC_REGISTER.md` row. Don't let this drift into a second stale index.
