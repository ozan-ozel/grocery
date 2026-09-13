# 12 — Energy Individualization (cross-cutting research)

This folder holds four documents on how the application should move from a population-formula energy
estimate to an individualized one driven by the user's own observed response. All four are
**cross-cutting rather than a new phase** — they draw on Phase 3's decision model, Phase 7's
specification, and Phase 9's layer boundaries without amending any of them — and none is
**implementation-ready**: none selects a formula, a coefficient, a threshold, or a macro percentage,
creates a `DEC` ID, or amends an existing decision.

- [`ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md`](ENERGY_INDIVIDUALIZATION_RESEARCH_SPEC.md) — the
  narrative: problem, the decision architecture, the evidence behind each candidate, and an explicit
  list of choices that need human ratification before anything here can be built. Read this first.
- [`ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md`](ENERGY_INDIVIDUALIZATION_ARCHITECTURE.md) — the same
  ratified content re-indexed by pipeline stage: what goes into each stage, what comes out, which
  `DEC` owns it, and what state it's in today. A map, not a narrative.
- [`ENERGY_INDIVIDUALIZATION_CALCULATIONS.md`](ENERGY_INDIVIDUALIZATION_CALCULATIONS.md) — the same
  evidence re-indexed by formula: every equation or numeric finding named anywhere in the research
  spec, with its inputs, outputs, source citation, and adoption status (shipped / candidate / rejected).
- [`ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html`](ENERGY_INDIVIDUALIZATION_MVP_ARCHITECTURE.html) —
  a **proposal** for a Phase 1 MVP: individualization from an enriched profile, with weigh-in and
  intake logging optional rather than load-bearing. Includes a flow chart, the exact calculations, the
  finding that the shipped PAL points sit at or above the top of their own drafted bands, and the list
  of choices needing human ratification. Unlike the three documents above it recommends a scope — it
  still ratifies nothing.

The architecture and calculations documents are reorganizations of the research spec's own content,
not new findings or new decisions — every number in either one traces back to a research-spec §4 entry
or to `../../src/lib/mealPersonalization.ts`.
