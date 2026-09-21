# 2026-09-20-04 — agent-login `_debug` gate fix, secret rotation, `agent-session` / `agent-mint` split

Two branches, stacked:

- `fix/agent-login-debug-gate` — commit `ce01c20`; **committed, not yet merged to `master`**.
- `chore/agent-session-script` — cut from the fix branch (the script relies on the new `_debug` shape);
  **implemented; real `agent-session up` / `down` lifecycle verified on 2026-09-21; uncommitted** (the owner
  reviews and commits).

## Why

Auditing an `agent-session up/down` script idea for credential exposure turned up:

1. **`GET /api/agent-login?_debug=1` bypassed the production gate.** The debug check ran before
   `if (isProd() && !prodEnabled()) return notFound()`, so if the file were ever deployed it would answer in
   production without the secret and without `AGENT_LOGIN_ENABLED`, dumping `VERCEL_ENV`, whether the secret
   exists, **the secret's length**, the matching env-key names and the total env-key count. Latent only —
   `.vercelignore` keeps the file out of every deploy.
2. **The agent-login secret had been written down in several places** (`.env.local`, the `MEMORY.md` index that
   loads into every session, a memory file, a tracked plan doc, a gitignored Playwright log) and printed into tool
   output. It was rotated once (in-process, value never seen); the developer now rotates it **by hand**.
3. **The redeem URL is itself a bearer credential** (`…&token=<64-hex>`): single-use, 10 minutes, hash-only at
   rest, local-only — and it has to reach the MCP browser through the agent's context. Accepted (option "A"):
   print exactly that one URL, nothing else.
4. **`POST ?_action=mint` requires the caller to present `AGENT_LOGIN_SECRET`** — the only code path that creates a
   token row. With the new ground rule that Claude Code never reads `.env.local` or any secret, a script Claude runs
   cannot mint. Hence the split below (no change to the endpoint or to authentication).

## Branch 1 — `fix/agent-login-debug-gate` (`ce01c20`)

- `api/agent-login.ts`: the production gate runs first, before `_debug`. `_debug=1` answers **only**
  `{ "ready": boolean }` (secret + `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SECRET_KEY` present) — no env
  names, counts, lengths or values. Mint/redeem untouched.
- Verified with a throwaway Node harness (deleted): before the fix 18 of 26 checks failed; after, all 26 pass
  (production without the flag — including `"1"`, `"TRUE"`, `"yes"`, `" true"`, `""` — 404s for `_debug`, mint and
  redeem; production with `"true"` and dev return exactly `{ready}`; unrelated behavior unchanged).

## Branch 2 — `chore/agent-session-script`

Two commands, split by **who may know the secret**:

- `npm run agent-session -- up | down | status` → `scripts/agent-session.ps1` (Claude may run it). Secret-free:
  no environment file, no secret, never mints. Manages the local `vercel dev` server and a **transactional**
  `.vercelignore` edit (marker `#AGENT-SESSION-TEMP#`; byte-exact, CRLF-preserving). `up` decides port occupancy
  *before* touching anything: a foreign server already answering `{"ready":true}` is reused untouched; a foreign
  server without the endpoint is **refused, nothing modified**. Otherwise: state file first
  (`%LOCALAPPDATA%\grocery-agent-session\`, outside the repo) → edit → start server (root PID + process start time
  recorded; the listener is recorded only if it descends from that root) → poll `{ready:true}`; any failure rolls
  back the edit, the owned processes and the state. `down` restores the line first, then stops only processes whose
  PID *and* start time still match, then deletes state and logs (logs are never printed — a redeem URL carries the
  token). `-EarlyRestore` restores `.vercelignore` right after readiness and re-probes; see "Not verified".
- `npm run agent-mint [-- --email x@local.dev]` → `scripts/agent-mint.mjs` (**the developer runs it in their own
  terminal, never through Claude Code**). Masked TTY prompt (refuses without a TTY); no file, environment or argv
  input for the secret; sends it only as `x-agent-login-secret` to `http://localhost:3000` (hard-coded, redirects
  never followed, loopback-only name resolution); prints only the redeem URL on stdout; failures print a fixed
  message with an HTTP status at most.
- Flow: Claude `agent-session up` → developer `agent-mint`, pastes the URL → Claude opens it once in the isolated
  in-memory Playwright browser (no storage-state file) → Claude `agent-session down`.
- **The `*@local.dev` email check is a script-side safety guard only, not an authentication boundary.** The
  endpoint still mints for any email to a caller that knows the secret (deliberately unchanged).
- `package.json`: added the `agent-session` and `agent-mint` scripts. Docs updated: `CLAUDE.md` (procedure + SYNC
  must also flag a `#AGENT-SESSION-TEMP#` marker), `docs/architecture.md`, `docs/SESSION_FOLLOWUP.md`. The old
  literal secret was also scrubbed from `docs/superpowers/plans/2026-09-12-agent-test-login.md`.

## Verified (throwaway harnesses, deleted afterwards; nothing touched `:3000` or any secret)

- `agent-mint`: 68 checks against fake local servers and an obviously fake secret — secret only in the header (not
  URL/body), redirects not followed (the redirect target received zero requests), 500/leaky bodies reduce to a
  status code, malformed/foreign-host redeem URLs rejected, header-injection fails closed, the masked prompt echoes
  only `*`, backspace-erase and newline (including pasted input and escape sequences), Ctrl-C and non-TTY refuse,
  CLI refuses non-`local.dev` emails and non-interactive stdin, and a static scan of the source finds no file/env/
  clipboard/child-process/`fetch` use and a single stdout write (the redeem URL).
- `agent-session` (real script functions against a temp repo copy and a fake server on ports 3996–3999): byte-exact
  and idempotent toggle/restore, BOM and foreign-shape refusal, full up → status → up-again → down, `-EarlyRestore`,
  rollback on timeout / immediate exit / `{ready:false}` / early-restore failure (`.vercelignore` byte-identical,
  no process left, port free, no state or logs), foreign servers reused-or-refused and never stopped, PID + start-time
  ownership (wrong start time → not killed; right one → killed), stale-state and orphan-marker recovery. The harness
  also found and fixed a real bug (`File.Replace` given `$null` throws in PowerShell; now `[NullString]::Value`).
- **Real lifecycle (2026-09-21, real `vercel dev`, default mode; `-EarlyRestore` not used, `agent-mint` not run):**
  `:3000` free and `.vercelignore` normal beforehand → `npm run agent-session -- up` started the server in 31 s and
  `_debug=1` answered exactly `{"ready":true}`; the state file recorded the root (`cmd`, PID + start time) and the
  `:3000` listener (`node`, a descendant of that root through `cmd → node → cmd`); the server survived the launching
  tool call ending; `.vercelignore` differed from `HEAD` by exactly the one marker line (the default: it stays until
  `down`) → `status` reported the server owned and alive → `down` stopped only that four-process tree, restored
  `.vercelignore` byte-for-byte and removed the state and logs → `status` reported free/clean. No process outside
  the tree was stopped, no unrelated file changed, and no secret was read or printed.
- Two cosmetic `down` issues from that run were then fixed: a stray `taskkill` "process not found" line with an
  inaccurate "stopped (root, listener)" summary (killing the root's tree had already taken the listener down; `down`
  now waits for that and reports "owned process tree stopped (root and its listener)"), and the empty state
  directory left behind (now removed when empty — only that directory, never anything else in `%LOCALAPPDATA%`,
  and never if anything is still inside it). Verified against the fake-server harness (five repeated up → down
  cycles, a non-empty state dir, root-already-gone, wrong-start-time and failure-rollback cases) and, for the
  directory, by a real `down` with no state. The fixed `down` has **not** been re-run against a real `vercel dev`.

## Not verified — needs the developer

- `agent-mint` has **not** been live-tested: neither its masked prompt in an interactive terminal (only the stream
  logic and the non-TTY refusals were tested) nor a real mint against the running server.
- **`-EarlyRestore`**: whether `vercel dev` re-reads `.vercelignore` after startup is unknown (the CLI appears to
  call `getVercelIgnore` once, but a file watcher was not ruled out). The default keeps the line commented out until
  `down`; the flag verifies itself and rolls back loudly, but treat it as experimental until confirmed live.
- **The developer's own manual rotation of `AGENT_LOGIN_SECRET` is still a remaining step** (Claude rotated it once,
  value never seen); a running server keeps whatever value it started with until restarted.

## Rules recorded (memory + docs)

Claude never reads `.env.local`, never sees/generates/writes/prints/compares any auth secret, never uses
`node --env-file`, never touches `SUPABASE_SECRET_KEY`, and never stops or restarts a server it did not start.
