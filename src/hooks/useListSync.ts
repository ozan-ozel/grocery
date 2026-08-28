import { useEffect, useRef, useState } from "react";
import { createSync, type SyncStatus } from "@/lib/sync/sync";
import { emptyState, type State } from "@/lib/store";

// A single sync channel per tenant. When the tenant switches we tear the
// old one down and clear state before starting a new one so pushes never
// leak across tenants and the UI shows a spinner until the pull returns.
export function useListSync(
  activeTenantId: string | null,
  consumeFreshTenantId?: (id: string) => boolean
) {
  const [state, setState] = useState<State | null>(null);
  const stateRef = useRef<State | null>(state);
  stateRef.current = state;
  const syncRef = useRef<ReturnType<typeof createSync> | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  useEffect(() => {
    if (!activeTenantId) return;
    // A tenant we just created (see useTenants.addTenant) is known to have
    // no server state yet — seed it immediately instead of clearing to
    // null, which would drop the whole app to the loading spinner just to
    // wait on a pull that can only confirm the same emptiness. Cache the
    // seed and hand the same object to onEmpty below so sync's own first
    // pull (which will *also* find nothing server-side yet) converges on
    // the identical list instead of minting a second, different one.
    const freshSeed = consumeFreshTenantId?.(activeTenantId)
      ? emptyState()
      : null;
    setState(freshSeed);
    stateRef.current = freshSeed;
    const sync = createSync({
      // Sync only sees state once it's been hydrated; before that a push
      // would just re-send the empty placeholder. Return a sentinel so the
      // push path skips until real state is loaded.
      getState: () => stateRef.current ?? { lists: [], activeId: null },
      setState,
      tenantId: activeTenantId,
      baseUrl: import.meta.env.VITE_API_BASE ?? "",
      onStatusChange: setSyncStatus,
      onEmpty: () => freshSeed ?? emptyState(),
    });
    syncRef.current = sync;
    sync.start();
    return () => {
      sync.stop();
      syncRef.current = null;
    };
  }, [activeTenantId]);

  useEffect(() => {
    if (state) syncRef.current?.notifyChange();
  }, [state]);

  const updateState = (fn: (s: State) => State) =>
    setState((s) => (s ? fn(s) : s));

  return { state, setState, updateState, stateRef, syncStatus };
}
