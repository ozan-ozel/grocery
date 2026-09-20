# Knowledge Map

This is a routing index, not an encyclopedia. Do not duplicate canonical content here — every row
just says where to look and when.

| Knowledge type | Canonical source | Owner | Load trigger |
| --- | --- | --- | --- |
| Purpose and scope | `README.md` | Developer | Product/scope questions |
| Governance and behavior | `CLAUDE.md` | Developer | Before any implementation or git operation |
| Current continuity state | `docs/SESSION_FOLLOWUP.md` | Developer/Claude | Session start, resuming work |
| Dated session history | `docs/session-checkpoints/` (index in `SESSION_FOLLOWUP.md`) | Developer/Claude | Reconstructing what a past session did — read as a historical snapshot, not necessarily still-accurate |
| App architecture | `docs/architecture.md` | Developer | Touching state/persistence/sync/theming/the nutrition backend |
| App-engineering roadmap | `docs/archive/roadmap.md` | Developer | Avoiding duplicate work on the general app (not nutrition-curriculum) |
| Nutrition-curriculum MVP roadmap | `docs/roadmap_v2.md` | Developer | Proposing or picking up nutrition-domain work |
| Nutrition-curriculum per-domain scope | `docs/mvp-scope/` (index: `docs/mvp-scope/README.md`) | Developer | Implementing one `roadmap_v2.md` domain — each file maps 1:1 to a domain and its `DEC` range |
| Nutrition-curriculum decisions | `nutrition-curriculum/DEC_REGISTER.md` | Developer | Checking whether a decision is ratified/blocked before building against it |
| Nutrition-curriculum plan↔implementation handoff | `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` | Planner/Implementer (fluid roles, see the file itself) | Resuming curriculum work via `COL` |
| Feature design specs | `docs/superpowers/specs/` | Developer | Understanding why a past feature was designed a certain way — check each spec's own status note before trusting it as current |
| Feature implementation plans | `docs/superpowers/plans/` (index: `docs/superpowers/plans/README.md`) | Developer | Starting or resuming a planned app feature — the index tracks ship status, the plan files themselves don't |
| Historical session narrative | `~/vault/grocery/logs/` (outside the repo) | Developer | Reconstructing session-by-session history in more detail than checkpoints carry |
| Runtime behavior | Source under `src/`/`api/`, plus `tsc -b` | Developer | Bugs, regressions, validation — there is no test suite by design |
| Retired code kept for possible restoration | `archive/` (index and restore steps: `archive/README.md`) | Developer | Before rebuilding something that may already have existed (e.g. the old "Bugün" screen) — it is not compiled or deployed |
| Deep nutrition-science reference | `nutrition-curriculum/` (the numbered phase folders, `01_SOURCE_BOOKS/` for the 7-book corpus itself) | Developer | Detailed investigation beyond what a `DEC_REGISTER.md` note or `mvp-scope` file summarizes |

## Routing

Start with `README.md` and `CLAUDE.md`. Follow the relevant canonical source from the table above.
Do not duplicate canonical content here — this table only routes.

## Escalation

A recurring local problem may become architecture-shaped when repeated evidence shows that local
fixes do not address the underlying constraint. Record the evidence first; create or update a
decision source only when the repository's governance supports it.
