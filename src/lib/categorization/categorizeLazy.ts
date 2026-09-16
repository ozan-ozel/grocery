import type { CategoryId } from "./categories";

// categories.ts pulls in snowball-stemmers, a single monolithic ~850 kB file
// bundling every Snowball language (not just Turkish, the only one used
// here) that can't be tree-shaken — by far the single largest piece of the
// app's main bundle. categorize()'s two synchronous call sites (the grouped
// shopping view's uncategorized-item fallback, and the edit-row category
// dropdown's initial guess) are both gated behind user interaction — opting
// into "group by category", or opening an item's edit row — never the
// default initial paint. So the module is dynamically imported here instead
// of statically, moving its parse cost off the critical render path; the
// import still kicks off immediately (this module itself loads eagerly via
// store.ts), so in practice it's almost always ready by the time a user
// reaches either call site. See
// docs/session-checkpoints/2026-09-16-06-lazy-load-categorizer.md.
type CategorizeModule = typeof import("./categories");

let mod: CategorizeModule | null = null;
const ready: Promise<CategorizeModule> = import("./categories").then((m) => {
  mod = m;
  return m;
});

// Used from render paths that can't await — returns "diger" for the brief
// window (usually sub-frame) before the module has finished loading, same
// as the existing "couldn't classify this" fallback already shown elsewhere.
export function categorizeSync(name: string): CategoryId {
  return mod ? mod.categorize(name) : "diger";
}

export async function categorizeAsync(name: string): Promise<CategoryId> {
  const m = mod ?? (await ready);
  return m.categorize(name);
}
