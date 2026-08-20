# Roadmap

A survey of where the project's own seams point, based on reading `package.json`,
`supabase/01-schema.sql`, the `netlify/functions/` vs `functions/api/` split, and
`src/components/` / `src/lib/`, cross-referenced with what's already documented in
`CLAUDE.md`. Nothing here is scheduled — this is a menu, not a commitment.

## Foundational — visible from the code today

The lowest-effort, most "intended" directions: things the codebase is already
halfway toward.

1. **Finish the Supabase-normalized persistence migration.** `items.ts`, `lists.ts`,
   and their `netlify/functions/` counterparts already do per-row CRUD against
   `lists`/`items`, but nothing calls them — the app still runs on the
   single-blob-per-tenant sync in `sync.ts`/`state.ts`. This is scaffolding waiting
   to be wired up. It would unlock real per-item conflict resolution instead of
   last-write-wins, and per-row history queries.

2. **Wire up `item_category_memory`.** The table exists in `01-schema.sql:45-51`
   but has no reader/writer. Right now item-name → category memory lives only in
   `localStorage` per device (`itemCategories.ts`), so a category correction made
   on one phone doesn't follow to another. Syncing this table would fix that — a
   natural pairing with #1.

3. **Retire the Cloudflare Pages path.** Two backends coexist
   (`functions/api/*` vs `netlify/functions/*`), manually kept in sync for
   `nutrition.ts`/`state.ts` only. Since Netlify is what's actually deployed, the
   Cloudflare path is dead weight that risks drifting silently — a bug fixed on one
   side, forgotten on the other. Deleting it is small but removes an entire
   category of "which backend am I even testing" mistakes.

4. **PWA / offline support.** No manifest, no service worker — despite a genuinely
   offline-friendly shape (local cache + optimistic sync). Grocery-list apps live
   at the exact intersection of "used at a store with bad signal" and "wants to
   feel like a native app," so this is a strong product fit, not just a technical
   nice-to-have.

## Product-facing — build on what's there

5. **Cross-device category sync.** Same work as #2, framed as a feature: *teach it
   once, it remembers everywhere.*

6. **Shared/collaborative lists in real time.** Current sync is poll-every-15s +
   push-on-change, deliberately not a websocket — fine for 2-4 people. A "someone's
   shopping right now" indicator or live cursor would need actual realtime
   (Supabase Realtime is already in the stack via `@supabase/supabase-js`).

7. **Meal planning / recipes → auto-generate list.** The nutrition table and
   `NutritionView.tsx` already model per-item nutrition data; a recipe layer that
   expands "tavuklu pilav" into its ingredient list is a natural extension of that
   data model, not a new subsystem.

8. **Budget / price tracking.** `qty` exists on items but no price field —
   storing price history alongside `buildCatalog()`'s existing
   name/count/last-bought table would be additive, not a rearchitecture.

9. **Smarter categorization.** The three-layer system
   (`itemCategories` → `categorize()` → `userCategories`) is rule/stem-based, not
   ML. Could stay rule-based (extend keyword lists) or, if it starts mis-guessing
   often, graduate to an LLM call for the head-noun fallback case specifically —
   worth measuring the actual miss rate first rather than assuming.

10. **Multi-language taxonomy.** Categorization is Turkish-specific (Snowball
    Turkish stemmer, Migros/CarrefourSA aisle layout). If this ever needs to serve
    non-Turkish households, that's a real architectural fork, not a tweak.

11. **Native mobile app.** Currently a web app with light PWA aspirations at best.
    If "an actual iOS/Android app" becomes a goal, that's a distinct, large
    decision (Expo/React Native rewrite vs. wrapping the PWA) — flagged here, not
    recommended.

## Infra / ops

12. **Test suite.** `CLAUDE.md` is explicit: *"There is no test suite and no lint
    script in this repo."* For a project with sync/conflict logic and a
    category-merging system, this is the highest-leverage infra gap — bugs there
    are exactly the kind that stay silent until two devices disagree.

13. **Observability on the sync path.** 409-conflict rate, Blob read/write
    failures, and `hydrateFromSupabase()` fallback frequency are all currently
    invisible in production.

## On tooling

There's no single skill that *is* the roadmap tool — this list came from reading
the repo, not from a packaged planning tool. Once a direction here gets picked,
the right skill follows from the choice itself: UI-heavy work (PWA polish,
theming, mobile-first redesign) reaches for a design skill; nutrition/budget
dashboards reach for a data-visualization skill; a genuine native app reaches for
the Expo skill family. Any of these, once scoped, is worth a proper design pass
before code — several items here cross subsystem boundaries and deserve that.
