import { useEffect, type RefObject } from "react";
import { rolloverIfNeeded, type State } from "@/lib/store";
import type { Undo } from "@/hooks/useUndo";

// Daily rollover: once this tenant's first pull has settled, on tenant switch,
// and whenever the tab regains focus after being backgrounded (which is when
// "next open" actually fires for a PWA left running overnight). Cheap
// idempotent check.
//
// `hydrated` (from useListSync) is what the old mount-time check has become.
// State can now start from the localStorage cache, and rolling that over
// immediately would fire a toast, then fire a second one when a differing
// server version arrives and gets rolled over in turn. rolloverIfNeeded is
// idempotent so state stayed correct either way, but two toasts for one
// rollover is not. Waiting for the pull to *settle* — rather than to succeed —
// keeps rollover working offline, where no server version is ever coming.
export function useRollover(
  activeTenantId: string | null,
  stateRef: RefObject<State | null>,
  setState: (s: State) => void,
  showUndo: (u: Undo, ttlMs: number) => void,
  hydrated: boolean
) {
  useEffect(() => {
    if (!hydrated) return;
    function check() {
      if (!stateRef.current) return;
      const result = rolloverIfNeeded(stateRef.current);
      if (!result) return;
      setState(result.next);
      showUndo({ kind: "rollover", previous: result.previous }, 10_000);
    }
    check();
    function onVisible() {
      if (document.visibilityState === "visible") check();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [activeTenantId, hydrated]);
}
