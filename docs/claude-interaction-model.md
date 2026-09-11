# Claude Interaction Model

How Claude Code approaches every task in this repository: the doc-reading sequence, skill checks, and decision pipeline that precede any implementation.

## Overview

For every prompt, Claude follows a structured initialization sequence before writing code. This document describes that sequence, which docs are consulted, and why order matters.

## Initialization Sequence

### Step 1: Load Core Context

Before engaging with the task, Claude reads these files in order:

1. **[CLAUDE.md](../CLAUDE.md)** — project-specific ground rules
   - Git shorthand (BCMP, CMP, LCMP conventions)
   - Command reference (npm scripts, no tests philosophy)
   - Historical context (retired Netlify/Cloudflare, current Vercel)
   - This file is the **first source of truth** for any decision

2. **[MEMORY.md](../MEMORY.md)** — persistent session context
   - User preferences & feedback from prior conversations
   - Known project decisions & constraints
   - Ground rules (e.g., "no worktrees", "no auto-commit", branch naming)
   - Carries forward what Claude has learned about *this user's* style

3. **Git status** (`git status`, `git log`) — current working state
   - What branch is checked out?
   - Are there uncommitted changes?
   - What recent commits set the tone?

### Step 2: Route to Subsystem Docs (If Needed)

Depending on the task, Claude reads specialized documentation:

- **[docs/architecture.md](./architecture.md)** — consulted for any subsystem changes
  - State & persistence patterns
  - RLS policies & auth model
  - Sync, categorization, nutrition backends
  - Deployment & environment variable setup

- **[docs/roadmap.md](./roadmap.md)** — consulted before proposing new work
  - Prevents duplication of queued tasks
  - Clarifies prioritization & status

- **[docs/SESSION_CHECKPOINT.md](./SESSION_CHECKPOINT.md)** — consulted if resuming from a prior session
  - Where the last agent left off
  - What's blocking or ready next

- **Spec docs** (`docs/superpowers/specs/*.md`) — consulted for feature detail
  - Historical design rationale
  - Each spec includes its own status note (check before trusting implementation details as current)

### Step 3: Check Applicable Skills

Claude evaluates whether specialized skills apply to the task:

| Task Type | Skill |
|-----------|-------|
| Debugging a bug | `/superpowers:systematic-debugging` |
| Designing a feature | `/superpowers:brainstorming` |
| Multi-step implementation | `/superpowers:writing-plans` or `/superpowers:executing-plans` |
| Code review | `/code-review` (with effort level: low/medium/high/ultra) |
| Git operations | `/superpowers:using-git-worktrees` |
| API/LLM questions | `/claude-api` or `claude-code-guide` |

Skills set the approach *before* implementation begins. They override defaults.

### Step 4: Verify State & Execute

Once context is loaded:

1. Read affected files (via `Read` tool, not `grep`, to see full context)
2. Check git status before any destructive operations
3. **Branch first, code second** — never implement on `master`
4. Verify changes with `tsc -b` or `npm run vercel:dev` before committing
5. Commit on the branch with proper message format

### Step 5: Update Memory (If Learning Occurred)

If Claude discovered something that will be relevant in future sessions:

- Save to `C:\Users\4D\.claude\projects\d--CodeSpace-grocery\memory\`
- Use proper frontmatter format with `name`, `description`, `type` (user/feedback/project/reference)
- Link to `MEMORY.md` index

## Doc Priority & Rationale

| Priority | Doc | Why | Example |
|----------|-----|-----|---------|
| 1 | CLAUDE.md | **Project rules trump defaults** | "never commit to master", "no tests", "Vercel only" |
| 2 | MEMORY.md | **User feedback is authoritative** | "don't use worktrees", "user commits manually after testing" |
| 3 | git status | **Current state must be known** | Am I already on a branch? Uncommitted work? |
| 4 | architecture.md | **Core system design before changes** | "State lives in App.tsx", "RLS is auth layer #2" |
| 5 | roadmap.md | **Avoid work duplication** | "this refactor is queued, don't propose it again" |
| 6 | Spec docs | **Historical context when needed** | Why was this design chosen? What was the rationale? |
| 7 | Source files | **Only after above context loaded** | Now safe to read actual code |

## What Claude Does NOT Do

❌ Read every spec in `docs/superpowers/specs/` unless the prompt concerns that feature  
❌ Check git history unless the prompt asks "why did we do X?"  
❌ Consult package-lock.json unless dependency changes are involved  
❌ Commit to `master` directly, even if the user says "just commit this"  
❌ Add tests, test frameworks, or test files (explicit ground rule)  
❌ Make assumptions; if something is unclear, ask the user first  

## Example: Touching the Sync System

A prompt arrives: *"The sync polling interval should be 20s instead of 15s."*

Claude's sequence:

1. ✅ Read CLAUDE.md → "Vercel only, tsc -b to verify, test with vercel:dev"
2. ✅ Check MEMORY.md → "No worktrees, no auto-commit, user tests themselves"
3. ✅ Check git status → "On fix/some-branch, working tree clean"
4. ✅ Read architecture.md § Sync → "Polling is `GET /api/state` every 15s, implemented in `src/lib/sync/sync.ts` + `api/state.ts`"
5. ✅ No skill needed (straightforward change)
6. ✅ Read `src/lib/sync/sync.ts` to locate the interval
7. ✅ Edit the file, change 15s → 20s
8. ✅ Run `npm run build` to verify types
9. ✅ Suggest: "Ready for you to test with `npm run vercel:dev`"
10. ✅ Wait for user to test, then commit with: `fix: increase sync polling interval from 15s to 20s`

The docs guided every step; Claude didn't guess or improvise.

## Implications

This model means:

- **Claude is fast to respond** because context is loaded upfront, not discovered mid-task
- **Claude respects ground rules** because they're checked first, not overridden by defaults
- **Claude doesn't duplicate work** because the roadmap is consulted before proposing changes
- **Claude learns over time** because memory persists and is applied next session
- **Claude avoids surprises** because the architecture doc explains WHY the system works before changes are made

New collaborators reading this document understand why Claude behaves the way it does, and can trust that every prompt follows a reasoned, documented process.

---

## See Also

- [CLAUDE.md](../CLAUDE.md) — project rules & ground rules (read first)
- [docs/architecture.md](./architecture.md) — system design (read before subsystem changes)
- [docs/roadmap.md](./roadmap.md) — current prioritized work (read before proposing new tasks)
- [MEMORY.md](../MEMORY.md) — persistent session context (carries user feedback forward)
