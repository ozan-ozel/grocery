import { useEffect, type RefObject } from "react";
import { rolloverIfNeeded, type State } from "@/lib/store";
import type { Undo } from "@/hooks/useUndo";

// Daily rollover: on mount, on tenant switch, and whenever the tab regains
// focus after being backgrounded (which is when "next open" actually fires
// for a PWA left running overnight). Cheap idempotent check.
export function useRollover(
  activeTenantId: string | null,
  stateRef: RefObject<State | null>,
  setState: (s: State) => void,
  showUndo: (u: Undo, ttlMs: number) => void
) {
  useEffect(() => {
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
  }, [activeTenantId]);
}
