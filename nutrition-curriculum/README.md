# Nutrition Curriculum

A university-level Human Nutrition, Metabolism, and Sport Nutrition curriculum built from an
eight-book source corpus, then translated into decision logic and application architecture for the
Grocery app.

**213 topics · 112 application decisions · Phases 1–8 closed · Phase 9 in progress**

## Start here

| If you want… | Go to |
|---|---|
| **Which decision can I work on?** (standing readiness, all 112) | [DEC_REGISTER.md](DEC_REGISTER.md) — a readiness word per decision |
| **What's the one item actively moving right now** between planning and implementation? (live, per-DEC) | [IMPLEMENTATION_HANDOFF.md](IMPLEMENTATION_HANDOFF.md) |
| Where everything lives, and which folder is which phase | [00_PROJECT_CONTROL/README.md](00_PROJECT_CONTROL/README.md) |
| Project-wide history: phase/gate status, milestones, past sessions (coarse — not live per-DEC status; see `IMPLEMENTATION_HANDOFF.md` for that) | [00_PROJECT_CONTROL/PROJECT_STATUS.md](00_PROJECT_CONTROL/PROJECT_STATUS.md) |
| The rules you must follow when working here | [00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md](00_PROJECT_CONTROL/PROJECT_AI_PROTOCOL.md) |
| A human decision's authoritative record | [00_PROJECT_CONTROL/DECISIONS/](00_PROJECT_CONTROL/DECISIONS/) |

## If you are an agent working in this corpus

Read `PROJECT_AI_PROTOCOL.md` before writing anything. Four of its rules cause the most damage when
missed:

- **§28 — no premature implementation.** Do not build past what a decision actually specifies. Stopping
  and reporting is the correct outcome when a specification runs out.
- **§30 — ID stability.** `DEC-###` and topic IDs (`NUT-01`, `CLIN-03`, …) are architectural
  identifiers. Never rename one. If an ID looks wrong, report it.
- **§31 — document discipline.** Prefer extending an authoritative document over duplicating it. Never
  create a second source of truth for something that already has one.
- **§32 — review gates.** Gates are hard stops. Never cross one autonomously.

Two more things that are easy to get wrong here:

- **Folder numbers do not track phase numbers.** `09_` is Phase 4, `10_` is Phase 7, `11_` is Phase 8,
  `08_` is Phase 9. The mapping table is in `00_PROJECT_CONTROL/README.md`.
- **`PROJECT_STATUS.md` is append-oriented.** Superseded passages are marked, not rewritten. Read it
  top-down and let later entries override earlier ones.

### Navigating large documents

Some authoritative documents here run from ~1,000 to ~24,000 lines. Line count alone is not a reason
to split one. Do not create duplicate summaries or parallel sources of truth just to make a document
shorter (this would also violate §31). Navigate large documents with headings, stable IDs, section
anchors, and targeted search plus the surrounding context — read a document in full only when the task
genuinely requires global synthesis or consistency validation. Split a document only when there is a
clear semantic boundary and the split materially improves retrieval, maintenance, or ownership without
duplicating authoritative content or adding cross-reference complexity; preserve existing
historical/authoritative material and stable references whenever such a restructuring is approved.

### Curriculum → Product Translation Mindset

This curriculum is the scientific foundation, not the product. Grocery's job is to translate that
foundation into a safe, useful, personalized, understandable, and commercially viable application —
not to expose the full complexity of the curriculum to users unless that complexity is genuinely
useful to them. Preserve scientific rigor, provenance, uncertainty, and safety boundaries internally
while simplifying what the user sees; a capability being scientifically correct does not make it a
good product capability. Evaluate application work through four connected lenses: scientific validity
→ decision usefulness → user usability → product/market value. When these conflict, do not silently
weaken scientific or safety constraints — prefer simplification in the translation layer, explicit
uncertainty, deferral, or a safer alternative instead. The goal is not a digital textbook; it's a
product whose underlying intelligence is grounded in this curriculum.

This connects to the Progressive Sanding Model (PSM): build a coherent working MVP before attempting
premature perfection. Use integrated product/browser QA and observed user-facing behavior to discover
where the architecture or decision translation needs refinement. Preserve provisional choices,
alternatives, and uncertainty so later iterations can sand, replace, or defer them rather than treating
early MVP choices as final scientific truth.

## What is and isn't executable right now

Of the 112 decisions: 11 `SHIPPED`, 4 `PROVISIONAL`, 7 `DEFERRED`, 15 `COVERED`, 1 `PARTIAL`, and
**74 `BLOCKED`** — most of the remaining surface depends on subsystems that do not exist yet
(observed-data trend tracking, micronutrient data, training-data capture, pantry, cost/store data) or
on safety parameters that must not be resolved autonomously. **`READY` is currently zero**: every
executable decision today is a deliberately temporary `PROVISIONAL` choice. See
[DEC_REGISTER.md](DEC_REGISTER.md) for the detail.

## Source books

`01_SOURCE_BOOKS/` is **git-ignored** — it holds full copies of copyrighted commercial textbooks, which
are this project's raw material, not its output. Only the analysis derived from them is versioned. The
corpus was fixed at 7 books in Phase 1 and extended exactly once, at Gate 6, with one bounded culinary
source. See `00_PROJECT_CONTROL/README.md` for the rationale.
