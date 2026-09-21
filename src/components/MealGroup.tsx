// src/components/MealGroup.tsx
import type { ComponentChildren } from "preact";

type Props = {
  name: string;
  kcal: number;
  children: ComponentChildren;
};

// The card around items that were added together from the Yemekler sheet.
// The item cards inside keep their own border, so this is deliberately a
// light tint + thin outline rather than a second heavy box.
export function MealGroup({ name, kcal, children }: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h4 className="min-w-0 truncate text-sm font-semibold text-foreground">{name}</h4>
        <p className="shrink-0 text-xs text-muted-foreground">{Math.round(kcal)} kcal</p>
      </div>
      {children}
    </div>
  );
}
