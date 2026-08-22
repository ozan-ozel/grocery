# Repository Copilot Operating Contract

This file is the repository-specific adapter for Copilot. Keep it concise.

## Scope and routing

- Project purpose and approved scope: `<canonical path>`
- Current status and roadmap: `<canonical path>`
- Implementation plans: `<canonical path>`
- Domain documentation: `<canonical path or none>`
- Tests and runtime behavior: `<canonical paths>`
- Deep references: `<canonical path or none>`

Read the smallest relevant canonical source before acting. Canonical documents own project facts; this file only routes and governs agent behavior.

## Approval-first Git policy

Before any `git commit`, `git push`, merge, rebase, reset, cherry-pick, tag creation/deletion, force operation, or branch deletion, the agent must show the exact command, explain the effect, and wait for explicit approval in the current chat. Never infer approval from a general implementation request.

## Change discipline

- Preserve unrelated user changes.
- State a local hypothesis before the first edit when behavior is unclear.
- Validate the smallest affected slice after editing.
- Do not invent project governance, architecture, scope, or ownership.
