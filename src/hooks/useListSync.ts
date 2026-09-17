import { useEffect, useRef, useState } from "react";
import { createSync, type SyncStatus } from "@/lib/sync/sync";
import { loadCachedState, saveCachedState } from "@/lib/bootCache";
import { emptyState, type State } from "@/lib/store";

// A single sync channel per tenant. When the tenant switches we tear the
// old one down and clear state before starting a new one so pushes never
// leak across tenants and the UI shows a spinner until the pull returns.
//
// "Clear" now means "fall back to this tenant's cached state", not "fall back
// to null": state is mirrored into localStorage per tenant so a reload paints
// the real list in the first frame instead of holding the skeleton for the
// ~2s /api/state round trip. The cache is only ever a head start — the first
// pull still decides, via sync's version gate.
export function useListSync(
  activeTenantId: string | null,
  consumeFreshTenantId?: (id: string) => boolean
) {
  const [state, setState] = useState<State | null>(() =>
    loadCachedState(activeTenantId)
  );
  const stateRef = useRef<State | null>(state);
  stateRef.current = state;
  // Which tenant the current `state` belongs to, so the effect below can tell
  // "already seeded at first render" from "switched tenants".
  const stateTenantRef = useRef<string | null>(state ? activeTenantId : null);
  const syncRef = useRef<ReturnType<typeof createSync> | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  // False until this tenant's first pull settles. useRollover waits on it so
  // an overnight reload doesn't roll over the cached state and then roll over
  // again when a differing server version lands.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!activeTenantId) return;
    let disposed = false;
    setHydrated(false);
    // A tenant we just created (see useTenants.addTenant) is known to have
    // no server state yet — seed it immediately instead of clearing to
    // null, which would drop the whole app to the loading spinner just to
    // wait on a pull that can only confirm the same emptiness. Cache the
    // seed and hand the same object to onEmpty below so sync's own first
    // pull (which will *also* find nothing server-side yet) converges on
    // the identical list instead of minting a second, different one.
    const fresh = consumeFreshTenantId?.(activeTenantId) ?? false;
    const seed = fresh
      ? emptyState()
      : stateTenantRef.current === activeTenantId && stateRef.current
        ? // Already seeded from the cache during the initial render — reuse
          // that exact object rather than re-parsing it into an equal-but-new
          // one, which would cost a second render for no change.
          stateRef.current
        : loadCachedState(activeTenantId);
    if (seed !== stateRef.current) {
      setState(seed);
      stateRef.current = seed;
    }
    stateTenantRef.current = activeTenantId;
    const sync = createSync({
      // Sync only sees state once it's been hydrated; before that a push
      // would just re-send the empty placeholder. Return a sentinel so the
      // push path skips until real state is loaded.
      getState: () => stateRef.current ?? { lists: [], activeId: null },
      setState,
      tenantId: activeTenantId,
      baseUrl: import.meta.env.VITE_API_BASE ?? "",
      onStatusChange: setSyncStatus,
      // A missing server row with a cache in hand means restoring the cache,
      // not discarding it — the next push repopulates the row.
      onEmpty: () => seed ?? emptyState(),
      // Without this the restored cache would be PUT straight back on mount,
      // since lastSentSerialized would otherwise start empty.
      initialState: seed,
      onFirstPullSettled: () => {
        if (!disposed) setHydrated(true);
      },
    });
    syncRef.current = sync;
    sync.start();
    return () => {
      disposed = true;
      sync.stop();
      syncRef.current = null;
    };
  }, [activeTenantId]);

  useEffect(() => {
    if (state) syncRef.current?.notifyChange();
  }, [state]);

  // Mirror to localStorage so the next boot (or tenant switch back) paints
  // instantly. Deliberately not debounced alongside the push — a write here is
  // cheap and losing the last edit to a closed tab is the thing we're fixing.
  //
  // Reads stateRef, not `state`: on the render where activeTenantId flips, the
  // rendered `state` is still the *outgoing* tenant's, and pairing it with the
  // incoming id here would file one household's lists under another's key. The
  // effect above runs first in the same commit and re-points stateRef at the
  // new tenant's seed, so stateRef is the only value guaranteed to belong to
  // activeTenantId by the time this runs.
  useEffect(() => {
    const current = stateRef.current;
    if (activeTenantId && current) saveCachedState(activeTenantId, current);
  }, [activeTenantId, state]);

  const updateState = (fn: (s: State) => State) =>
    setState((s) => (s ? fn(s) : s));

  return { state, setState, updateState, stateRef, syncStatus, hydrated };
}
