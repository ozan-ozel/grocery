# 2026-09-20-04 — agent-login `_debug` gate fix, secret rotation, planned `agent-session` script

Branch: `fix/agent-login-debug-gate` — implemented, verified, and committed on the branch after the owner's review;
**not yet merged to `master`**.
A second branch, `chore/agent-session-script`, is **planned but not started** — it begins only after this one is
approved and merged, because the script relies on the new `_debug` response shape.

## Why

Auditing an `agent-session up/down` script idea for credential exposure turned up:

1. **`GET /api/agent-login?_debug=1` bypassed the production gate.** The debug check ran before
   `if (isProd() && !prodEnabled()) return notFound()`, so if the file were ever deployed it would answer in
   production without the secret and without `AGENT_LOGIN_ENABLED`, dumping `VERCEL_ENV`, whether the secret
   exists, **the secret's length**, the matching env-key names and the total env-key count. Latent only —
   `.vercelignore` keeps the file out of every deploy.
2. **The agent-login secret had been written down in several places.** The old literal was in `.env.local`
   (its live value), the `MEMORY.md` index line (loaded into every session), `agent_login_secret.md`, a tracked plan
   doc (one commit in git history), a gitignored Playwright console log, and had been printed into tool output.
3. The **redeem URL is itself a bearer credential** (`…&token=<64-hex>`). It is single-use, 10-minute, hash-only at
   rest, and local-only — and it must pass through the agent's context to reach the MCP browser. Accepted
   (option "A"): print exactly that one URL, nothing else.

## What changed on this branch

- `api/agent-login.ts`: the production gate now runs first, before `_debug`. `_debug=1` answers **only**
  `{ "ready": boolean }` (secret + `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SECRET_KEY` all present) — no
  env names, counts, lengths or values. Nothing else in the auth path changed (mint/redeem untouched).
- Docs that described the old `hasAgentLoginSecret` field: `CLAUDE.md`, `docs/SESSION_FOLLOWUP.md`,
  `docs/architecture.md` (also documents the gate-before-debug rule).

## Outside the repo (done this session, not in the diff)

- `AGENT_LOGIN_SECRET` in `.env.local` **rotated** (in-process, never printed; other lines verified byte-identical,
  CRLF preserved). `TEST_LOGIN_SECRET` holds a *different* value, so it was not the exposed credential and was left
  alone; it is read only by the unroutable `api/_auth-test-login.ts`.
- The stale `.playwright-mcp` console log that contained the old secret was deleted.
- The old literal was removed from `agent_login_secret.md` and the `MEMORY.md` index (memory files).
- **A running `vercel dev` still holds the old secret** until it is restarted; only the owner's server (or one this
  session started) may be restarted — the process on :3000 was deliberately left untouched.

## Verified

A throwaway Node harness (deleted afterwards) imported `api/agent-login.ts` with fake env values and no network:
before the fix 18 of 26 checks failed (prod-not-enabled `_debug` answered 200); after it all 26 pass — prod
without `AGENT_LOGIN_ENABLED` (including `"1"`, `"TRUE"`, `"yes"`, `" true"`, `""`) returns 404 for `_debug`, mint and
redeem; prod with `"true"` and dev return exactly `{ready}`; wrong/missing mint secret, wrong method, unknown action and a
token-less redeem behave as before. `npx tsc -b` passes (note: `tsc -b` covers `src/` only, not `api/`).

## Still open

- Old literal remains in `docs/superpowers/plans/2026-09-12-agent-test-login.md` (lines ~417, 422) and in git
  history. It is dead after the rotation; scrub the doc in the script branch.
- Planned `chore/agent-session-script` (`scripts/agent-session.ps1`, `up`/`down`): default `agent@local.dev`,
  script-side `*@local.dev` guard only — **not an authentication boundary** (the endpoint still mints for any email
  once the secret is known; server-side auth is intentionally unchanged); reuse a correct server on :3000, refuse
  (touching nothing) if :3000 answers without the endpoint; never stop/restart a process it did not start (PID +
  start time recorded); restore `.vercelignore` only if `up` changed it, after first verifying empirically whether a
  running `vercel dev` keeps its function list when the file is restored; secret read in-process from the exact
  `AGENT_LOGIN_SECRET` key only; prints only the redeem URL; server log kept outside the repo and never printed.
  Live start → mint → stop testing needs :3000 free.
