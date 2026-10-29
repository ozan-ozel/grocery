# 2026-10-29: ready-meal QA and account-switch profile isolation

**Date:** 2026-10-29
**Branch:** `fix/account-switch-profile-isolation`
**Status:** local QA complete and build clean; fix remains uncommitted

## Current Objective

Verify the rename, source citations and DEC-012/013/020 safety posture shipped in `1ebe9b4`.

## Verified in the browser

- On Kişisel Plan, checking ScopeCheck removes target values and leaves the out-of-scope message and
  red-flag note. Unchecking restores targets and the starting-estimate note.
- On Yemek Planı, the choice hides the daily macro card, per-occasion protein targets, evening suggestions
  and the picker's "Sana uygun" section. Ready meals and recipe instructions remain accessible.
- The scope choice survives reload in the same browser.
- After the fix, redeeming a fresh account without signing out opens onboarding with fresh defaults
  (170 cm, female equation, maintain), rather than the previous account's 182 cm/male/gain profile.
  `/api/personal-plan` renders `null` both before onboarding interaction and after skipping and reloading.
- Onboarding's ScopeCheck remains selected through its four steps. Using "Atla" on the final step leaves
  the server profile unsaved; meal targets and recommendations are hidden, including after reload.
  Kişisel Plan shows the same checked choice, and the shopping list remains accessible. The choice was
  reset to unchecked after verification. "Bitir" profile submission was not exercised.
- Source UI shows FAO 2004 Table 5.3, Krause 16e p. 218, AS3 p. 44 + Schoenfeld 2018, and USDA + Turkish
  labels. The water card says "toplam sıvı, yiyecekler dahil". The Krause badge jumps to its source row.
- Adding Kaşarlı omlet creates a named meal card with three foods and 345 kcal; it survives reload.
- "Yedim" creates the suggested meal's entries and "Bugün yedin" marker; both survive reload. The card's
  "Geri al" removes those entries. Test meal entries were removed and their absence verified after reload.
- Verification used desktop Chrome against local `vercel dev`, not a production deploy or a real phone.
  Screenshots are outside the repository in `D:/CodeSpace/qa-artifacts/grocery-2026-10-29/`.

## Bug found and fix

Directly redeeming a different test account while the browser retained the previous identity hint caused
the previous profile to appear in the new account and be persisted there. The server profile response
confirmed the copied values; this also prevented onboarding from appearing.

`App` previously mounted AppShell from `cachedSession` before `/api/auth-session` confirmed the cookie's
identity. User-scoped hooks could therefore read and auto-save a cached profile with the new cookie.
App now waits for the session check and keys AppShell by the confirmed user id. `useAuth` retains the
previous hint only for cache invalidation. Architecture documentation and boot-cache comments match.

## Validation and limits

- `npm run build` passes after the code change; `git diff --check` passes.
- Post-fix reload shows the auth skeleton before the shell; an existing account still opens normally.
- Fresh-account regression and onboarding ScopeCheck verification passed using the developer's next
  single-use URL. Tokens and secrets are never recorded in repository files.
- Concurrent account changes in another already-mounted tab, mobile and production were not tested.
- The fix adds an auth round trip before mounting user-scoped screens. Nutrition calculations, sources,
  DEC readiness and MVP scope are unchanged; no nutrition trio status change or new feature-plan entry
  applies. No migration, commit, merge, push or deploy was performed.

## Continuation

- The user explicitly asked to keep this workspace open. Leave the QA tab and the owned local server
  running; do not run `agent-session down` as an automatic close-out step.
- `.vercelignore` is restored and has no git diff. The script's `Restore-Ignore` failed at `File.Replace`
  with a file-in-use error while the server was running. Replacing only the exact temporary marker with
  an in-place UTF-8 write succeeded; the server was not stopped. Status confirms the owned server alive
  and the ignore line active; the app continued responding. The locking process remains unidentified.
- The intermediate test account already received a copied profile before the fix. It is unsuitable for
  a fresh-onboarding regression. No account was deleted or reset to manufacture a clean result.
