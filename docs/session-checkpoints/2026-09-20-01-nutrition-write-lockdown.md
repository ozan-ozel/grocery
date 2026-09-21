# 2026-09-20-01 — Nutrition write lockdown, hidden maintenance upload, UI tweaks

Branches: `fix/nutrition-write-lockdown` (the lockdown, `1745729`) and `fix/ui-tweaks-star-chip-badges` (the UI tweaks,
`a67488c`) — implemented and build-verified, merged into `master` and pushed. Not deployed: `ADMIN_EMAILS` still has to be
set on production first.

## The security finding

`public.nutrition` is one global table shared by every household. Before the lockdown, `PUT /api/nutrition`
was guarded only by `requireUser()`, so any signed-in account could overwrite it (service-role key, RLS
bypassed). Two client paths reached it: the Listem pencil (`NutritionEditorRow` → `saveNutrition`, single
`row`) and the JSON upload (`NutritionUpload` → `saveNutritionBulk`, `rows`). Both hit the same handler, the
same table, and the same merge-duplicates upsert. No login allowlist exists in `api/auth-google.ts`, and
there was no role/admin mechanism anywhere in the repo.

The pencil was also destructive beyond "editing": it always sent `aliases` (usually `[]`), wiping a row's
curated aliases, and when the list item's name differed from the canonical name it created a *new* global row
named after the item with the canonical name as an alias, which can redirect lookups for the canonical name.

## What changed

- **`lib/auth.ts` `requireAdmin(user)`** — allowlist in the comma-separated `ADMIN_EMAILS` env var (lower-cased,
  trimmed), checked against the server-verified email from `requireUser()`. Fails closed (unset/empty → 403).
- **`api/nutrition.ts`** — `PUT` now needs `requireAdmin`; GET/POST unchanged. PUT is bulk-only (`{ rows }` →
  `{ saved }`); the single-`row` mode had no caller left and was removed. Stays in this file: the project sits at
  exactly the 12-function Hobby limit, so a separate admin endpoint was not an option.
- **Listem pencil removed for everyone** (user decision) — `NutritionEditorRow.tsx` deleted, `saveNutrition`
  deleted, `editingId`/`uploadOpen`/`upsertLocal`/`upsertBulkLocal` removed from `NutritionView`. Listem itself is
  untouched otherwise (still a pill, still totals + fiber).
- **JSON upload → hidden** — `NutritionUpload.tsx` moved to `components/dev/NutritionUploadModal.tsx` and rebuilt
  on `ConfirmModal` (a real modal now, not an inline panel). Opened from Settings by tapping the page heading in
  the rhythm **1 · 3 · 2 · 7** (`hooks/useTapSequence.ts`: groups separated by a >450ms pause, whole code within
  12s, a wrong attempt drops stray leading groups so an immediate retry works, progress resets on open). Closing
  the modal leaves nothing unlocked. The rhythm is concealment only; the endpoint check is the boundary. A
  non-admin who finds it gets "Bu işlem için yetkin yok." (403 mapped in `saveNutritionBulk`).
- **Kept as the developer path:** `scripts/upload-nutrition.ts` (service-role key directly, no HTTP).

## UI tweaks in the same branch

1. Bottom sheet: only the X button is `data-sheet-no-drag` now; the title and the empty stretch beside it start
   the swipe-to-dismiss drag.
2. Shopping title pen chip now sits ~4px after the last character (was pinned to the far right), and has a
   transparent background instead of the white `bg-card` tile — fused into the header, with the Smooth Pill
   box-shadow kept (a box-shadow is never painted under its own box, so it still shows around the chip).
3. Shopping apple toggle: "Besin değerleri" label; the per-row values animate open/closed (same `grid-rows`
   0fr↔1fr trick as the select-mode bar). `ActiveList` builds the food lookup map once and hands it to rows
   (each row used to rebuild a 1000-entry map). With the label the toolbar wraps to two lines on phones.
4. Kişisel Plan jump star: 1.3× larger (11px → 14.3px, offsets scaled too) and filled with a two-stop gradient
   from `--jump-star-from` to `--jump-star-to` instead of a flat color. Light: ink (`--color-foreground`) → the
   signal red; dark (Arduvaz): signal blue → white. (A flat lime was tried first: 14.7:1 on dark but only ~1.2:1
   on light, so it nearly vanished.) Checked in a real browser at the animation's hold frame, both themes.
5. Meal Plan skeleton: the `+ Ürünler` / `+ Yemekler` dashed lookalikes are now shimmer blocks (`LoadingBlock
   h-12`, measured equal to the real button's 48px). One shared skeleton, so both loading phases change together.
6. Kişisel Plan `Field` (`PersonalPlanFields.tsx`): the title, source badge and "i" button all sat inside one
   `<label>`. A label with no `for` activates its first labelable descendant, and a `<button>` is labelable, so
   tapping anywhere on "Günlük aktivite" opened the info modal (and never focused the field). Reproduced in a
   real browser, then fixed: the title is a `<label htmlFor>` bound to the control (Field passes it an `id`), and
   the badge and "i" are separate controls outside the label. The "i" is now a 20px signal-colored circle (same
   family as the WHO/NIDDK badge and the chevron circles). The two source badges next to "Günlük aktivite"
   (WHO) and "Hedef" (NIDDK) are now buttons that call the existing `jumpToSource` (opens "Kaynakları göster",
   scrolls to the entry, highlights it).

## Needs the developer

- **Set `ADMIN_EMAILS`** to the email you actually sign in with — in `.env.local` for local, and
  `vercel env add ADMIN_EMAILS production` for the deployed app, then redeploy. Until then the hidden upload
  returns 403 for everyone (fail-closed, by design).
- **Real-phone checks:** header drag-to-dismiss vs the X; the 1-3-2-7 rhythm feel; apple expand/collapse; the
  two-line toolbar at 360px; the star colour on both themes.

## Verification

`tsc -b` + `vite build` clean; `tsc -p api/tsconfig.json --noEmit` clean. One-off scripts (deleted afterwards):
`useTapSequence` logic under a fake clock (14 cases) and `requireAdmin` (8 cases incl. unset/empty/case/prefix).
Toolbar widths measured on a static replica at 360px (flat: 2 lines, no overflow; grouped + "Otomatik
kategorize et": ~2px padding overlap, no worse than before). **Not verified live:** the 403/200 behaviour of
`PUT /api/nutrition` end to end (needs a session on a server started per the agent-login procedure), and that
RLS on the live table really is SELECT-only — that is taken from the `supabase/24-nutrition-rls.sql` snapshot.
