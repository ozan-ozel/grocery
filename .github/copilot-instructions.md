# Repository Copilot Operating Contract

This file is the repository-specific adapter for Copilot. Keep it concise.

## Scope and routing

- Project purpose and approved scope: `README.md`; the hard project rules: `CLAUDE.md`
- Current status and roadmap: `docs/CURRENT_STATE.md` (where the project stands and the next step). There is no app roadmap; nutrition scope is `docs/roadmap_v2.md` and `docs/mvp-scope/README.md`
- Implementation plans: `docs/superpowers/plans/README.md` (the status index — a plan's own checkboxes are not status)
- Domain documentation: `docs/architecture.md` (how the app is built) and `docs/operations.md` (env vars, running, deploying)
- Tests and runtime behavior: there is no test suite by design. The source under `src/` and `api/` is the authority; validate with `npm run build` (`tsc -b`)
- Deep references: `docs/knowledge-map.md` (what to read for a task, and which docs are current vs historical), the numbered migrations in `supabase/` for the database schema, and `docs/session-checkpoints/` for history only

Read the smallest relevant canonical source before acting. Canonical documents own project facts; this file only routes and governs agent behavior.

## Constraints that are easy to break

The full rules are in `CLAUDE.md`; these are the ones most likely to be violated by accident.

- Stack: Preact (not React — shadcn/ui runs through `preact/compat`), Tailwind v4 and Vite on the client; Vercel Functions in `api/*.ts` over Supabase. User-facing copy is Turkish.
- The project is at Vercel's 12-function Hobby limit. Do not add an `api/*.ts` file: fit a new endpoint into an existing function or displace one (`docs/operations.md`).
- Do not add tests, a test framework, or a plan that proposes them.
- Never read, write or print `.env*` files or any secret value. If a step needs one, ask the developer to do it.
- Deploys are manual and developer-run. Do not deploy, and do not describe a push as a release.
- Keep `api/agent-login.ts` listed in `.vercelignore`.

## Approval-first Git policy

Before any `git commit`, `git push`, merge, rebase, reset, cherry-pick, tag creation/deletion, force operation, or branch deletion, the agent must show the exact command, explain the effect, and wait for explicit approval in the current chat. Never infer approval from a general implementation request.

Start work on a new branch with a logical prefix (`feature/`, `fix/`, `chore/`, `docs/`, …), never on `master`; plain branches only, no worktrees.

## Change discipline

- Preserve unrelated user changes.
- State a local hypothesis before the first edit when behavior is unclear.
- Validate the smallest affected slice after editing.
- Do not invent project governance, architecture, scope, or ownership.
