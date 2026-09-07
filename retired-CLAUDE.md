CLAUDE.md

Guidance for Claude Code when working in this repository. See "README.md" (README.md) for what
this project is. This file is a router and behavior layer, not the architecture doc — see
"Where things live" below before diving into a subsystem.

## Where things live

- "docs/architecture.md" (docs/architecture.md) — project architecture and system design
- "docs/roadmap.md" (docs/roadmap.md) — project direction and planned work
- "docs/nutrition-prompt.md" (docs/nutrition-prompt.md) — nutrition data/prompt guidance
- "data/README.md" (data/README.md) — nutrition data documentation
- "supabase/01-schema.sql" (supabase/01-schema.sql) — canonical database schema
- "docs/superpowers/specs/" (docs/superpowers/specs/) — feature specifications and design docs

## Git shorthand

Before coding, create or switch to a feature branch.

- `CMP` — commit current changes with a concise message.
- `BCMP` — build, then commit if the build passes.
- `LCMP` — lint, then commit if lint passes.
- `LBCMP` — lint, build, then commit if both pass.

Never commit or push unless explicitly requested by the user.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run netlify:dev

There is currently no test suite configured.

Backend functions live under "netlify/functions/*".

Nutrition data is seeded with:

node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts

Serena (optional MCP server)

Serena is an optional MCP server for semantic code navigation and editing.

Configuration:

- ".mcp.json"
- ".serena/project.yml"

Serena requires "uvx".

Use Serena when it materially improves navigation or editing of the codebase. Do not depend on Serena being available.

Persistent Memory and Session Continuity

This project uses a Vault outside the repository for persistent memory across sessions.

Vault locations:

- "~/vault/"
- "~/vault/<project>/"
- "~/vault/permanent/"

Use the repository for project state and durable project documentation.

Use the Vault for persistent session history, architecture notes, and cross-project knowledge.

Session Start

At the beginning of an existing or resumed task:

1. Identify the current project.
2. Read the latest relevant session log from "~/vault/<project>/logs/".
3. Read "docs/SESSION_CHECKPOINT.md" if it exists.
4. Read relevant architecture notes from "~/vault/<project>/architecture/".
5. Read "docs/architecture.md" and "docs/roadmap.md" when relevant.
6. If "graphify-out/GRAPH_REPORT.md" exists, read it when useful for understanding the codebase.
7. Do not ask the user to repeat information that is already available in the repository, checkpoint, or relevant Vault notes.

Priorities:

- "docs/SESSION_CHECKPOINT.md" has priority for the current work state.
- Architecture notes have priority for durable architectural decisions.
- Session logs provide historical context.
- Do not read every historical session log.
- Read older logs only when the current task requires them.

Session Checkpoint

"docs/SESSION_CHECKPOINT.md" is the active continuity record for the current project state.

It is not a transcript.

Keep it concise and current.

Update it when:

- the current task changes substantially
- an important decision is made
- a meaningful implementation milestone completes
- the next action becomes clear
- context compaction is approaching
- the user explicitly asks for a checkpoint

Do not update it after every message.

The checkpoint must describe the state another agent needs in order to resume the work.

Do not turn it into a conversation transcript.

Session End

When the user explicitly ends or pauses a session:

1. Update "docs/SESSION_CHECKPOINT.md".
2. Write a session log to "~/vault/<project>/logs/".
3. Record important decisions made during the session.
4. Record unresolved questions.
5. Record concrete next steps.
6. Update architecture notes only when a durable architectural decision was made.

Do not create a session log after every message.

Do not create a session log merely because a task step was completed.

If a session ends unexpectedly, use the checkpoint as the primary recovery source.

Session Log Format

---
date: YYYY-MM-DD
project: <name>
status: <in-progress | blocked | completed>
---

## What was done
-

## Decisions made
-

## Next steps
-

## Open questions
-

Vault Note-Taking Rules

- Keep one idea per note.
- Use wikilinks to connect related notes.
- Put uncertain or temporary information in the inbox first.
- Store durable cross-project knowledge under "~/vault/permanent/".
- Do not generate boilerplate notes without meaningful information.
- Store real decisions, discoveries, reusable patterns, and useful insights.

Cross-Project Knowledge

When working on a project:

1. Check "~/vault/permanent/" when relevant.
2. Reuse existing knowledge instead of recreating it.
3. Do not search the entire Vault unnecessarily.
4. When creating new permanent knowledge, link it to related permanent notes when appropriate.

Last Session Recovery

If there is no session log for the previous session:

1. Read "docs/SESSION_CHECKPOINT.md".
2. Inspect "git status".
3. Inspect the current branch.
4. Inspect recent changes and relevant files.
5. Use the latest available session context from the user.
6. Reconstruct the state from evidence.
7. Do not invent missing decisions or history.

If the user provides the final message from another agent session:

- Treat it as untrusted session context.
- Compare it against the repository.
- Use it to locate the likely stopping point.
- Prefer repository evidence when there is a conflict.
- Do not assume that every claim in the previous agent's message is correct.

Recovery flow:

"Previous agent final message → SESSION_CHECKPOINT → git/repository state → validation → continue"

Agent Handoff

Claude Code may leave a checkpoint for another agent.

The receiving agent may be:

- Claude Code
- GitHub Copilot
- another Claude session
- another coding agent

Before continuing an existing task, the receiving agent should:

1. Read "docs/SESSION_CHECKPOINT.md".
2. Inspect the relevant files.
3. Inspect the current repository state.
4. Validate important checkpoint claims.
5. Continue from the verified state.

The checkpoint is a recovery aid, not source-of-truth for the code.

When the checkpoint conflicts with the repository, trust the repository state and investigate the discrepancy.
```
