# Operations

The runbook: how to run, configure, test in a browser and deploy this app. **Status: CURRENT.** How the app is
*built* is in [architecture.md](architecture.md); what Claude may and may not do is in
[CLAUDE.md](../CLAUDE.md). **The secrets boundary is owned by `CLAUDE.md` § "Secrets and environment files
(hard boundary)"** — this file describes procedures around it and never relaxes it; if the two ever differ,
`CLAUDE.md` wins. Nothing here contains, or should ever contain, a secret value: variables are named, never
shown.

## 1. Who runs what

| Step | Developer (own terminal) | Claude |
| --- | --- | --- |
| Generate, rotate and copy secrets; copy `.env.local` → `.env` | ✅ always | ❌ never |
| `npm run agent-mint` (needs the secret at a masked prompt) | ✅ only the developer | ❌ never |
| `npm run agent-session -- up \| down \| status` | ✅ | ✅ when a task needs a local server |
| Browser QA with Playwright against the local server | — | ✅ via the agent-session flow only (§5) |
| `npm run build` (`tsc -b` + `vite build`) | ✅ | ✅ |
| `npm run deploy` / `deploy:prod` | ✅ | ❌ unless explicitly asked |
| `npm run kill-ports` | ✅ | ❌ (see §2) |
| `node --env-file=.env.local … scripts/upload-nutrition.ts` | ✅ | ❌ never |
| `node --env-file=.env.local … scripts/fetch-usda-nutrition.ts` | ✅ | ❌ never |
| Set Vercel env vars, edit Supabase/Google console settings, apply SQL migrations | ✅ | ❌ |

## 2. Commands

```bash
npm install
npm run dev          # Vite dev server, client only — /api/* calls will 404 (no functions here)
npm run build        # tsc -b (typecheck src/) && vite build -> dist/
npm run preview      # serve the built dist/ (still no /api/*)
npm run vercel:dev   # vercel dev — the real local stack: Vite + every api/*.ts, proxied on :3000
npm run deploy       # vercel — preview deploy (throwaway URL), manual
npm run deploy:prod  # vercel --prod — production deploy, manual
npm run agent-session -- up | down | status   # §5
npm run agent-mint                            # §5, developer only
npm run kill-ports                            # developer only, see below
```

`vercel:dev` is what production actually runs; plain `dev` is only for client-side UI work.
`localhost:3000` is the standard local port. There is no test suite and no lint script: `tsc -b` (via `npm run
build`) is the only automated check — see `CLAUDE.md` for the no-tests rule.

**`kill-ports`** ([scripts/kill-ports.ps1](../scripts/kill-ports.ps1)) frees local dev ports (default 3000 and
3001, or a list you pass) by killing whatever is listening on them. It kills *by port*, so it can take down a
server Claude did not start — possibly your live session, or one behind ngrok. It is a developer convenience;
Claude does not run it. `CLAUDE.md`'s rule for Claude is the opposite: identify the exact process, never sweep
ports (`agent-session` enforces this by PID + process start time).

## 3. Environment

### 3.1 Variables (names only)

| Variable | Where it lives | Notes |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` | Vercel project settings (production); locally the linked project's Development vars or the repo-root `.env` (§3.2) | Server-only. The frontend bundle never receives Supabase or Google credentials directly |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Same as above | This app's own Google OAuth client; how it is used is in [architecture.md](architecture.md) § Auth & session |
| `ADMIN_EMAILS` | Same as above | Comma-separated, case-insensitive; who may write the global nutrition table (§3.4) |
| `AGENT_LOGIN_SECRET` | **Local only** — the repo-root `.env`; deliberately **not** in Vercel Development, never add it there | Gates `agent-login`'s mint step (§3.5) |
| `AGENT_LOGIN_ENABLED` | Would be a Vercel production var; **do not set** without an explicit go-ahead | §3.5 |
| `USDA_API_KEY` | `.env.local`, for the one-off scripts only | Listed in `.env.local.example` |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_AUTH_ENABLED` | **Removed** — nothing reads them; delete from Vercel if still set | §7 |

`.env.local.example` only lists `SUPABASE_URL` / `SUPABASE_SECRET_KEY` / `USDA_API_KEY` because it is scoped
to the one-off `scripts/upload-nutrition.ts` seeding script — it does not cover `SUPABASE_ANON_KEY`, which the
functions also need.

### 3.2 Local env for `vercel dev` (Vercel CLI 59.7.0)

`vercel dev` reads the repo-root `.env` for local functions and does **not** read `.env.local` (the dev server's
env loader only looks at `.env` / `.env.build`; without a `.env` it falls back to the linked project's Development
vars pulled from Vercel). A non-empty `.env` replaces that Development set entirely — it does not merge — so it
must contain every var the functions need (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus `AGENT_LOGIN_SECRET`, and `ADMIN_EMAILS` if used), and `vercel
dev` then talks to whichever Supabase project `.env` points at. `AGENT_LOGIN_SECRET` is local-only: it is
deliberately **not** in Vercel Development and must not be added there. `.env.local` remains the developer-managed
source of truth (it is also what the one-off seeding scripts load via `--env-file`); the developer copies it to
`.env` by hand when needed for the local agent-session workflow (`Copy-Item .env.local .env -Force`, in their own
terminal). `.env` is covered by `.gitignore` (`.env*`) and `.vercelignore`, so it is neither committed nor
deployed. `vercel env pull` writes `.env.local` by default — never run it bare. Without a complete `.env`, `GET
/api/agent-login?_debug=1` answers `{"ready":false}` and `agent-session up` rolls back.

The server reads its env at startup: after a rotation, a running `vercel dev` keeps the value it started with
until it is restarted.

### 3.3 Server-only

Most `api/*.ts` functions authenticate to PostgREST as the caller's own Supabase session; a handful of endpoints
use `SUPABASE_SECRET_KEY` for operations that must bypass RLS — the per-function list is in
[architecture.md](architecture.md) § API surface.

### 3.4 `ADMIN_EMAILS`

Comma-separated, case-insensitive; lists the accounts allowed to write the global nutrition table via `PUT
/api/nutrition` (see architecture § Nutrition). Set it in the local `.env` (not `.env.local`, which `vercel dev`
ignores) for local dev and with `vercel env add ADMIN_EMAILS production` for the deployed app; with it unset,
nobody can write. Use the email the account actually signs in with (Google).

### 3.5 `AGENT_LOGIN_SECRET` / `AGENT_LOGIN_ENABLED`

These enable `api/agent-login.ts` — a separate, two-step mint/redeem flow (`?_action=mint` then `?_action=redeem`)
that gives a QA/CI agent a real, working Supabase session for a bounded 10-minute, single-use window, without a
permanently-valid shared secret sitting in the app's auth surface. `AGENT_LOGIN_SECRET` gates the mint call (sent
as the `x-agent-login-secret` header on a server-to-server `POST`, never from a browser, and never sent to the
client bundle) and is compared with `timingSafeEqual`. This endpoint is not hard-blocked in production by its own
code — `AGENT_LOGIN_ENABLED` must be the literal string `"true"` for it to do anything at all when `VERCEL_ENV ===
"production"`. **Only set `AGENT_LOGIN_ENABLED=true` in the production Vercel project after an explicit go-ahead
from the repo owner** (see Task 4 of
[the agent-test-login plan](superpowers/plans/2026-09-12-agent-test-login.md)).

That production gate runs before every route, including `GET ?_debug=1` — the readiness probe never bypasses it.
`_debug=1` answers only `{ "ready": boolean }` (true when the secret and the three Supabase vars are all present);
it deliberately reports no env-key names, counts or value lengths.

**It is currently local-only by deployment, not by code.** `.vercelignore` lists `api/agent-login.ts` (commit
`48078cb`, to stay within the 12-function Hobby limit), so it is in **no** deployment — Preview included — and the
env-var gate above never even comes into play. Merging it into a deployed function instead would put a
mint-a-session-for-any-email endpoint on production behind a single env flag, which is why the `.vercelignore` +
local-session procedure (§4–§5) was chosen over that. **Never merge `agent-login` into a deployed function.**

## 4. `.vercelignore`

[`.vercelignore`](../.vercelignore) does two jobs: it keeps the deploy small and correct, and it keeps the
dev-only `agent-login` endpoint out of production (the 12-function Hobby limit, §6). Its active lines exclude, among others,
`nutrition-curriculum` (multi-hundred-MB source textbooks), `archive`, `.env` / `.env.local`
and `api/agent-login.ts`.

- **`vercel dev` honors this file too.** While the `api/agent-login.ts` line is active, `/api/agent-login` 404s
  locally as well. That is the normal, deploy-safe state.
- **Temporary state for a browser QA session:** `agent-session up` comments that one line out by prefixing the marker
  `#AGENT-SESSION-TEMP#`, and `agent-session down` (or its rollback) puts it back. The edit is transactional and
  byte-exact — the file uses CRLF and must stay CRLF.
- **How `agent-session` reads the file:** it matches *whole lines*. The active state is exactly one line equal to
  `api/agent-login.ts` and none equal to the marker form; the toggled state is exactly one line equal to
  `#AGENT-SESSION-TEMP#api/agent-login.ts` and none equal to the plain form. Other lines, including comment lines,
  are ignored, and it refuses a file that starts with a BOM.
- **Before any deploy:** `.vercelignore` must still list `api/agent-login.ts` as
  a live line, with no `#AGENT-SESSION-TEMP#` marker anywhere. Deploying with the line commented out pushes 13+
  functions, which fails the Hobby limit (or ships the login endpoint). **`SYNC`** flags a diff that leaves the
  line commented out or the marker in place.
- The optional `agent-session up -EarlyRestore` restores the line right after readiness — see §5.

## 5. Agent sessions and browser QA

`POST ?_action=mint` requires the caller to present `AGENT_LOGIN_SECRET`, and Claude Code (and anything it
launches) must never hold it: it never reads `.env` / `.env.local`, never generates, writes, prints, copies or
compares the value, and never uses `node --env-file`; the developer rotates the secret by hand. So the flow is
split by who may know the secret (record:
[2026-09-20-04](session-checkpoints/2026-09-20-04-agent-login-debug-gate-and-secret-rotation.md)):

0. **Prerequisite (developer, own terminal):** the repo-root `.env` must be current — a copy of `.env.local`
   holding the full var set (§3.2). `agent-session` never reads or writes it.
1. **Claude** runs `npm run agent-session -- up` — starts the local server (or reuses one that already answers
   `{"ready":true}`) and temporarily comments the `.vercelignore` line out. It refuses, touching nothing, if `:3000`
   is held by a server without the endpoint, and never stops a process it did not start.
2. **The developer** runs `npm run agent-mint [-- --email x@local.dev]` in their own terminal — masked prompt for
   the secret, never through Claude Code — and pastes the printed redeem URL (a single-use, 10-minute bearer
   token) to Claude.
3. **Claude** opens the URL once in the isolated in-memory Playwright browser (no storage-state file, no cookies
   on disk; `browser_close` discards the session) and tests.
4. **Claude** runs `npm run agent-session -- down`, which restores the line and stops only the server it started.

Details:

- `npm run agent-session -- up | down | status` ([scripts/agent-session.ps1](../scripts/agent-session.ps1); Claude
  may run it) manages the server lifecycle and the temporary `.vercelignore` edit, and is secret-free by
  construction (no environment file, no secret, no token minting). `up` probes `:3000` first: a foreign server
  that already answers `{"ready":true}` is reused untouched; a foreign server without the endpoint is refused and
  nothing is modified — it never stops, restarts or takes over a process it did not start. Otherwise it runs a
  transaction: state file first (`%LOCALAPPDATA%\grocery-agent-session\`, outside the repo), then a byte-exact,
  CRLF-preserving `.vercelignore` edit (marker `#AGENT-SESSION-TEMP#`), then the server (root PID + process start
  time recorded; the port listener recorded only if it descends from that root), then a `{ready:true}` poll — any
  failure rolls back the edit, the owned processes and the state. `down` restores the line first, stops only
  processes whose PID *and* start time still match, and deletes state and logs. The server logs are never printed
  (a redeem request URL carries the token).
- `npm run agent-mint` ([scripts/agent-mint.mjs](../scripts/agent-mint.mjs); **the developer runs it in their own
  terminal, never through Claude Code**) asks for the secret at a masked TTY prompt (it refuses without a TTY),
  sends it only as the `x-agent-login-secret` header to `http://localhost:3000` (hard-coded, redirects never
  followed, loopback-only name resolution), and prints only the redeem URL on stdout; failures print a fixed
  message with an HTTP status at most. It reads no file and no environment variable and writes nothing.
- The redeem URL is a bearer credential (single-use, 10 minutes, hash-only at rest).
- **The `*@local.dev` email check in `agent-mint` is a script-side safety guard only, not an authentication
  boundary.** The endpoint itself still mints for any email to a caller that knows the secret (deliberately
  unchanged), so protecting the secret is what protects real accounts.
- `.vercelignore` timing: by default the line stays commented out until `down`. `agent-session up -EarlyRestore`
  restores it right after readiness and re-probes to verify the endpoint survived, rolling back loudly if not.
  Whether a running `vercel dev` keeps its function list when `.vercelignore` changes is **unverified** (the CLI
  appears to call `getVercelIgnore` once in the dev server, but a file watcher was not ruled out), so the option
  stays opt-in until confirmed live.

### Playwright and dev-server rules

Plain tools first (`navigate` / `click` / `snapshot` / `screenshot` / read-only `evaluate`);
`browser_run_code_unsafe` only when nothing else fits. Sign in only via the mint/redeem flow above against the
local `npm run vercel:dev`. Claude may start `npm run vercel:dev` itself, via `agent-session`, when a task needs it.
Check `:3000` first: if it answers, reuse it and never start a second dev server on top of it; a server Claude did
not start is never stopped or restarted without the developer's explicit go-ahead (it may be their live session,
possibly behind ngrok for phone testing); find the exact process listening on `:3000` rather than sweeping ports;
only stop servers Claude started. Leave the test account as found; use a throwaway account (`agent-mint --email
x@local.dev`) for anything destructive such as `/api/auth-delete-account`; keep screenshots out of the repo root.
A mocked viewport height is not a real soft keyboard, and desktop Chromium is not iOS Safari — report what was
verified live versus faked.

### Phone testing through ngrok

Live device testing has used an ngrok tunnel to `localhost:3000` (`ngrok http 3000`, with `vercel dev` already
running). `lib/auth.ts` trusts `x-forwarded-proto` / `x-forwarded-host`, so the OAuth redirect URI and the cookie
`Secure` flag reflect the public URL. Editing source while the developer is connected can make their phone fetch a
half-written module — say so when finishing a batch of edits.

## 6. Deployment

**Vercel is the sole deploy target** (project `grocery`, linked via `.vercel/project.json`). A parallel Netlify
deploy existed during the `api/*.ts` migration ([the migration plan](archive/netlify-vercel-migration-plan.md),
NUT-29) and was retired once Vercel was verified end-to-end (NUT-52); there is no Netlify site, no `netlify.toml`,
and no `netlify/functions/` anymore.

Vercel deploys are **not** wired to auto-deploy on push — there's no GitHub App access to this repo under that
account, so every deploy is a manual CLI invocation, run from whatever the local working tree looks like at that
moment (uncommitted changes and all — the CLI deploys the filesystem, not a git ref):

- `npx vercel link` — one-time, links this directory to the Vercel project
- `npx vercel dev` (`npm run vercel:dev`) — local dev server running Vite + `api/*.ts` together
- `npm run deploy` (= `vercel`) — preview deploy to a throwaway `*.vercel.app` URL, doesn't touch production
- `npm run deploy:prod` (= `vercel --prod`) — deploys to `https://grocery-five-ecru.vercel.app`

These two package.json scripts are the normal way to deploy; `npx vercel [--prod]` is the same thing. **Pushing or
merging to `master` never deploys** — a merged change is not live until someone runs `npm run deploy:prod`, and a
deploy can go out with nothing committed at all. Treat `npm run deploy:prod` with the same weight as any other
"deploy to prod" action — it's a manual step, but a production-effecting one, with no confirmation prompt of its
own. Claude never runs `deploy` / `deploy:prod` unless explicitly asked, and doesn't describe a push as a release.

**Function-count limit.** The Hobby plan allows 12 serverless functions per deployment, and the project is at that
limit. Three things keep it there: (1) `.vercelignore` excludes `api/agent-login.ts`
(§4); (2) `api/auth-google.ts` serves both public OAuth paths — `/api/auth-google-start` and `/api/auth-callback` —
dispatched by an `_action` query param that `vercel.json`'s rewrites inject; (3) saved meals have no function of
their own: `/api/saved-meals` is a `vercel.json` rewrite onto `api/personal-plan.ts` (`?_resource=saved-meals`).
A new endpoint therefore needs an existing function to absorb it, or one of the above to give way. The function
inventory is in [architecture.md](architecture.md) § API surface.

**Pre-deploy checklist:** `.vercelignore` in its normal state per §4; the developer, not Claude, runs the deploy.

## 7. External configuration

Two things outside this repo have to be set for the OAuth flow to work at all: Supabase's Auth → URL Configuration
→ Redirect URLs must include `<vercel-domain>/api/auth-callback` (and the local dev equivalent if testing against a
real Supabase project) — without it, every login fails with an unlisted-redirect error from Supabase, not anything
this codebase can catch — and the Google Cloud OAuth client's authorized redirect URI must be set to this app's own
`<domain>/api/auth-callback` (not a Supabase URL). And the old frontend env vars — `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_AUTH_ENABLED` — should be removed from Vercel's project settings if still
set there, since nothing reads them anymore. Manual QA of the OAuth flow should also include closing the browser
fully and reopening it to confirm the session persists — the session cookie's lifetime is this app's own
responsibility via `writableCookies`, not the browser Supabase client's.

**SQL migrations** in `supabase/` are applied by hand (Supabase's SQL editor); the repo does not record which
migration has been applied where. Known gaps are tracked in [CURRENT_STATE.md](CURRENT_STATE.md) § Open
items.

## 8. Data seeding

One-off nutrition data seeding (bypasses the app, writes straight to Supabase):

```bash
node --env-file=.env.local --experimental-strip-types scripts/upload-nutrition.ts
```

The developer runs this in their own terminal — Claude never runs it (it loads `.env.local`; see `CLAUDE.md`'s
secrets boundary). Requires `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env.local` (see `.env.local.example`).
Source data lives in `data/nutrition.json`; row shape is documented in `data/README.md`. The app's hidden
maintenance upload modal is the other way in — see architecture § Nutrition.

**Refreshing `data/nutrition.json` from USDA** (optional, rarer still):

```bash
node --env-file=.env.local --experimental-strip-types scripts/fetch-usda-nutrition.ts
```

Developer-only, for the same reason (it loads `.env.local`; it needs `USDA_API_KEY`). `scripts/usda-mapping.json`
is the input: a hand-curated array of `{ name_tr, aliases, fdc_id }` entries, each `fdc_id` picked and verified
against the USDA FoodData Central API in advance. The script does not search — it resolves those ids to values
and upserts the rows by `name_tr` into `data/nutrition.json`, in place. It uploads nothing: review the git diff,
then seed Supabase with `scripts/upload-nutrition.ts` as above.

## 9. Troubleshooting

| Symptom | Likely cause | Who acts |
| --- | --- | --- |
| `/api/agent-login…` returns Vercel's own `NOT_FOUND` locally | The `.vercelignore` line is active (normal) | Claude: `agent-session up` |
| `_debug=1` answers `{"ready":false}`, or `agent-session up` rolls back | The repo-root `.env` is missing or incomplete (§3.2) | Developer: refresh `.env` from `.env.local` |
| `agent-session up` refuses | `:3000` is held by a server without the endpoint | Developer decides; Claude never stops a server it did not start |
| After a secret rotation the mint still fails | The running `vercel dev` still holds the old value | Restart it (Claude only if Claude started it) |
| `agent-mint` refuses to run | No TTY — it needs a real masked prompt | Developer: run it in their own terminal |
| Stale dev-server ports after a crash | Orphaned process | Developer: `npm run kill-ports` |
| `.vercelignore` still shows `#AGENT-SESSION-TEMP#` | A session ended without `down` | `agent-session down`; check before any commit or deploy (§4) |
| Every login fails with an unlisted-redirect error | Supabase Redirect URLs missing this domain (§7) | Developer |
| `-EarlyRestore` behaves unexpectedly | Unverified feature (§5) | Use the default mode |

If a step seems to need a secret value, stop and ask the developer to do it themselves — never work around it.

## 10. Optional tooling: Serena

[Serena](https://github.com/oraios/serena) is an optional semantic-code MCP server. Claude Code picks it up
automatically from `.mcp.json`; other MCP-capable clients can point at it themselves. It's optional — the repo is
fully usable without it — but it gives faster and more accurate symbol-level edits than plain grep/read.
Requirements: [`uvx`](https://docs.astral.sh/uv/) on your `PATH`; the first run of `uvx --from
git+https://github.com/oraios/serena serena ...` fetches Serena into the uv cache.

- `.mcp.json` — MCP server registration, uses `"."` for the project path so it works from any checkout location.
- `.serena/project.yml` — checked-in project config (language server: typescript, etc.).
- `.serena/cache/`, `.serena/memories/`, `.serena/project.local.yml` — per-developer state, gitignored.

If you don't want it running, delete or gitignore `.mcp.json` locally.
