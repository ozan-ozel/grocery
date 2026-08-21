import { useRef, useState } from "react";
import type { Item, State } from "@/lib/store";

export type Undo =
  | { kind: "remove"; item: Item; listId: string }
  | { kind: "bulkRemove"; items: Item[]; listId: string }
  | { kind: "rollover"; previous: State };

export function useUndo(
  updateState: (fn: (s: State) => State) => void,
  setState: (s: State) => void
) {
  const [undo, setUndo] = useState<Undo | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

  function showUndo(u: Undo, ttlMs: number) {
    setUndo(u);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), ttlMs);
  }

  function restore() {
    if (!undo) return;
    if (undo.kind === "remove") {
      const target = undo;
      updateState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === target.listId ? { ...l, items: [...l.items, target.item] } : l
        ),
      }));
    } else if (undo.kind === "bulkRemove") {
      const target = undo;
      updateState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === target.listId
            ? { ...l, items: [...l.items, ...target.items] }
            : l
        ),
      }));
    } else {
      setState(undo.previous);
    }
    setUndo(null);
  }

  return { undo, showUndo, restore };
}
