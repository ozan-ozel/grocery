import { useEffect, useRef, useState } from "react";
import { createSync, type SyncStatus } from "@/lib/sync/sync";
import { emptyState, type State } from "@/lib/store";

// A single sync channel per tenant. When the tenant switches we tear the
// old one down and clear state before starting a new one so pushes never
// leak across tenants and the UI shows a spinner until the pull returns.
export function useListSync(activeTenantId: string | null) {
  const [state, setState] = useState<State | null>(null);
  const stateRef = useRef<State | null>(state);
  stateRef.current = state;
  const syncRef = useRef<ReturnType<typeof createSync> | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  useEffect(() => {
    if (!activeTenantId) return;
    setState(null);
    stateRef.current = null;
    const sync = createSync({
      // Sync only sees state once it's been hydrated; before that a push
      // would just re-send the empty placeholder. Return a sentinel so the
      // push path skips until real state is loaded.
      getState: () => stateRef.current ?? { lists: [], activeId: null },
      setState,
      tenantId: activeTenantId,
      baseUrl: import.meta.env.VITE_API_BASE ?? "",
      onStatusChange: setSyncStatus,
      onEmpty: emptyState,
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
