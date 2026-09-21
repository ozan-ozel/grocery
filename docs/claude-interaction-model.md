# Claude Interaction Model

How a task flows through this repository, from first read to hand-off. **This is the process doc.** The rules it
refers to live in [CLAUDE.md](../CLAUDE.md) (git, secrets, commands, definition of done); *what to read* for a
given task is [knowledge-map.md](knowledge-map.md); how the app is built is [architecture.md](architecture.md).
Nothing here restates those — if you need a rule, follow the link.

## Lifecycle

`Discover → Plan → Implement → Validate → Promote → Checkpoint → Close`

| Stage | What happens | Where the detail lives |
| --- | --- | --- |
| **Discover** | `CLAUDE.md` is already loaded. Check `git status` (which branch? uncommitted work?). Find your task in the knowledge-map table and read **only the section(s) it names** (if several rows match, the union of them; only an explicit repository/architecture analysis reads `architecture.md` in full). Resuming earlier work: `docs/CURRENT_STATE.md` (current state only), then just the one plan or checkpoint it links. Anything touching nutrition guidance, macros or meal structure: check `docs/mvp-scope/README.md` *before* writing code | knowledge-map; `CLAUDE.md` § Session continuity |
| **Plan** | Only for multi-step work: a plan under `docs/superpowers/plans/`, via the planning skills below. If a requirement is unclear or the decision is the user's, ask instead of assuming | `docs/superpowers/plans/README.md` |
| **Implement** | Branch first — before writing any code, never on `master`; plain branches in the shared checkout, no worktrees. Read the code you will change, then make the smallest change that does the job | `CLAUDE.md` § Git shorthand |
| **Validate** | `npm run build` (`tsc -b`); exercise the running app when behavior matters. No tests — by design. Browser checks only through the agent-session flow | `CLAUDE.md` § Commands, § Agent sessions; [operations.md](operations.md) |
| **Promote** | If the change added or altered a durable fact — an endpoint, table/migration, env var, persisted key, invariant, command/script or other durable repository fact — update its owner doc (`architecture.md` or `operations.md`) and the current state in `docs/CURRENT_STATE.md` as part of the same logical change; flip the plan's status row; keep the nutrition status documents in step. A `.vercelignore` change also carries its own deploy-safety rule. `SYNC` flags what was missed | `CLAUDE.md` § Close-out checklist (item 4); § Git shorthand (`SYNC`, checks 4 and 5) |
| **Checkpoint** | A branch alone does not require a historical record. When the close-out checklist (item 3) judges the work significant enough, write a dated record in `docs/session-checkpoints/` with its row in that folder's `README.md` index (`session-checkpoint`); routine work gets none. Separately, keep `docs/CURRENT_STATE.md` (state, open items, next step) accurate when the state has changed (`current-state-update`, `current-state-and-compact`) — it is the current-state guide, not a log, and the checkpoints are the historical record, not a substitute for it | `CLAUDE.md` § Session continuity; `docs/session-checkpoints/README.md` |
| **Close** | Run the close-out checklist (say explicitly if no item applies) and report plainly what was verified and what was not, then **stop**. Committing, merging and pushing happen only when the user asks, through the canonical workflows — `CMP`, `BCMP`, `LCMP`, `LBCMP` — whose definitions and sequencing are owned by `CLAUDE.md`, not restated here; `SYNC` is run standalone right before one of them | `CLAUDE.md` § Close-out checklist, § Git shorthand |

## Loading context

Load the smallest set of current, authoritative documents the task needs.

- **Always:** `CLAUDE.md` and `git status`. (Claude's personal memory index is auto-loaded as well, but it lives
  outside the repo and is not a project source — see "What memory is for".)
- **Then, by task:** the knowledge-map row — a section of `architecture.md` or `operations.md`, not the whole file.
- **Only when the process calls for it:** `docs/CURRENT_STATE.md` (resuming), the plan index (starting or
  resuming a planned feature), `nutrition-curriculum/IMPLEMENTATION_HANDOFF.md` (`COL`).
- **Explicit repository or architecture analysis** is the one comprehensive case: `knowledge-map.md` has its own row
  (`architecture.md` in full, then `operations.md`, and source as ground truth). It never applies to ordinary tasks.
- **Normally skip:** session checkpoints, shipped plans and specs, the audits, `docs/archive/`, `archive/`, and the
  curriculum phase folders. They are SNAPSHOT or HISTORICAL in the registry; consult one only to learn why
  something was built, never to learn how it works today.
- Prefer reading a section (by heading or offset) over reading a whole document; the note at the top of
  `knowledge-map.md` shows how to list `architecture.md`'s headings.

## Skills, and where this repo overrides them

Skills set the approach before implementation begins and normally override defaults. They come from different
places: the four repo-local skills live in `.claude/skills/`; `superpowers:*` come from the user-level `superpowers`
plugin (installed outside this repo); `code-review` and `claude-api` are built-in Claude Code skills; and
`claude-code-guide` is an agent, not a skill. In this repo a few are overridden by project rules:

| Task | Skill | In this repo |
| --- | --- | --- |
| Debugging | `superpowers:systematic-debugging` | as written |
| Designing a feature | `superpowers:brainstorming` | as written |
| Multi-step implementation | `superpowers:writing-plans`, `superpowers:executing-plans` | as written — but **plans never include tests** |
| Code review | `code-review` | as written |
| Finishing a branch | `superpowers:finishing-a-development-branch` | follow `CLAUDE.md`'s `CMP` / `BCMP` / `LCMP` / `LBCMP`; never merge or commit unless asked |
| Test-driven development | `superpowers:test-driven-development` | **not used** — there is no test suite by design |
| Isolated workspaces | `superpowers:using-git-worktrees` | **not used** — plain branches in the shared checkout |
| Claude API / LLM work | `claude-api` (skill); the `claude-code-guide` agent for Claude Code / SDK questions | as written |
| Checkpoints and follow-ups | `session-checkpoint` (a historical record plus its `README.md` index row), `current-state-update` and `current-state-and-compact` (update `docs/CURRENT_STATE.md`), `session-log` (the vault) — all in `.claude/skills/` | as written; they keep the two systems apart: `CURRENT_STATE.md` is the current-state guide, `docs/session-checkpoints/` the historical record |

Never install a skill or plugin without asking (see `CLAUDE.md` § Project constraints).

## Ask, proceed, or stop

- **Ask** when a requirement is unclear or the decision belongs to the user.
- **Proceed** when the task is clear and reversible, inside the branch.
- **Stop** at anything the rules in `CLAUDE.md` reserve for the developer: secrets and env files, deploys, commits,
  merges or pushes nobody asked for, a dev server Claude did not start, and any permission check that blocks an
  action (treat the block as final). Do not present something unverified as fact — mark it uncertain or leave it
  out.

## What memory is for

Claude's memory (outside the repo, in `~/.claude/projects/…/memory/`) carries personal preferences and feedback
between sessions. It is not canonical and is not linked from the repo: a rule that matters to the project belongs
in `CLAUDE.md`, and a fact about how the app works belongs in `architecture.md` or `operations.md`.

## Worked example

Prompt: *"Poll for list changes more/less often."*

1. **Discover** — `CLAUDE.md` is loaded; `git status` is clean on a topic branch. The knowledge-map row for list
   state and sync points at `architecture.md` § Sync, which names the tunable by symbol: `POLL_MS` in
   `src/lib/sync/sync.ts`.
2. **Plan** — none; it is a one-line change.
3. **Implement** — read `sync.ts`, change the constant.
4. **Validate** — `npm run build`.
5. **Promote** — nothing to update: the doc names the symbol, not the value.
6. **Checkpoint** — a one-line constant change is not significant enough to warrant a historical record, so none
   is created (close-out item 3); `CURRENT_STATE.md` needs no change either.
7. **Close** — report what was verified (types) and what was not (behavior on a real device), then stop; a commit
   happens only when the user asks for it (`CMP` / `BCMP` / …, `CLAUDE.md` § Git shorthand).
