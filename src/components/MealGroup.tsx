// src/components/MealGroup.tsx
import { useState } from "react";
import type { ComponentChildren } from "preact";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import type { MealGroupSource } from "@/lib/mealGroups";

type Props = {
  name: string;
  kcal: number;
  source: MealGroupSource;
  // Present only for a "saved" (Yemeklerim) group — built-in and evening
  // groups have no meal of the user's own to edit.
  onEdit?: () => void;
  children: ComponentChildren;
};

// Same color family (the primary tint), a different step per source so the
// three kinds of group stay visually distinguishable without introducing a
// second hue: evening suggestions are the most ambient, built-in combos a
// step up, and the user's own Yemeklerim meals the most prominent.
const SOURCE_CLASS: Record<MealGroupSource, string> = {
  evening: "border-primary/20 bg-primary/5",
  builtin: "border-primary/30 bg-primary/10",
  saved: "border-primary/40 bg-primary/15",
};

// The card around items that were added together from the Yemekler sheet.
// The item cards inside keep their own border, so this is deliberately a
// light tint + thin outline rather than a second heavy box. Collapsible so a
// long meal (many ingredients) doesn't dominate the slot — collapsed still
// shows the name and total kcal.
export function MealGroup({ name, kcal, source, onEdit, children }: Props) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`space-y-2 rounded-lg border p-2 ${SOURCE_CLASS[source]}`}>
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1 text-left">
          {expanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <h4 className="min-w-0 truncate text-sm font-semibold text-foreground">{name}</h4>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-xs text-muted-foreground">{Math.round(kcal)} kcal</p>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`${name} yemeğini düzenle`}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground">
              <Pencil className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {expanded && children}
    </div>
  );
}
