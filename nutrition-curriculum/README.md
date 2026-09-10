# Nutrition Curriculum

A university-level Human Nutrition, Metabolism, and Sport Nutrition curriculum built from an
eight-book source corpus, then translated into decision logic and application architecture for the
Grocery app.

**213 topics · 112 application decisions · Phases 1–8 closed · Phase 9 in progress**

## Start here

| If you want… | Go to |
|---|---|
| **Which decision can I work on?** | [DEC_REGISTER.md](DEC_REGISTER.md) — all 112 with a readiness word |
| Where everything lives, and which folder is which phase | [00_PROJECT_CONTROL/README.md](00_PROJECT_CONTROL/README.md) |
| Current state, what's closed, the current next task | [00_PROJECT_CONTROL/PROJECT_STATUS.md](00_PROJECT_CONTROL/PROJECT_STATUS.md) |
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

## What is and isn't executable right now

Of the 112 decisions: 13 `SHIPPED`, 5 `PROVISIONAL`, 7 `DEFERRED`, 15 `COVERED`, and **72 `BLOCKED`** —
most of the remaining surface depends on subsystems that do not exist yet (observed-data trend tracking,
micronutrient data, training-data capture, pantry, cost/store data) or on safety parameters that must
not be resolved autonomously. **`READY` is currently zero**: every executable decision today is a
deliberately temporary `PROVISIONAL` choice. See [DEC_REGISTER.md](DEC_REGISTER.md) for the detail.

## Source books

`01_SOURCE_BOOKS/` is **git-ignored** — it holds full copies of copyrighted commercial textbooks, which
are this project's raw material, not its output. Only the analysis derived from them is versioned. The
corpus was fixed at 7 books in Phase 1 and extended exactly once, at Gate 6, with one bounded culinary
source. See `00_PROJECT_CONTROL/README.md` for the rationale.
