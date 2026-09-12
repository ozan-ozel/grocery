import { cn } from "@/lib/utils";

// Smooth Pill (SP) — the app's standard tab style. See CLAUDE.md § UI patterns
// for the full writeup. Exported as shared class strings (for Radix
// TabsTrigger, which needs data-[state=active]: selectors) and as a ready-made
// plain-button component (for anywhere a full Tabs root isn't already wired
// up — the common case).
//
// The active tab's box-shadow is NOT one of these Tailwind classes — it's a
// global CSS rule in index.css keyed off the "sp-trigger" class below plus
// whichever active-state signal the element actually carries
// (data-state="active" from Radix, or data-active="true" set manually here
// for plain buttons). Every SP class string here includes "sp-trigger" so
// that rule always applies; don't strip it when copying these elsewhere.

export const SP_CONTAINER_CLASS =
  "inline-flex items-center gap-1 rounded-lg bg-accent/50 p-1";

export const SP_BASE_CLASS =
  "sp-trigger rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export const SP_ACTIVE_CLASS = "bg-background text-foreground";

export const SP_INACTIVE_CLASS = "text-muted-foreground hover:text-foreground";

// For Radix TabsTrigger: cancels the base component's default
// border-b-2/data-[state=active]:border-foreground underline, which would
// otherwise draw a dark line through the pill background. The active-state
// shadow comes from the global .sp-trigger[data-state="active"] rule, not a
// class here — Radix already stamps data-state on the element itself.
export const SP_TRIGGER_CLASS = cn(
  SP_BASE_CLASS,
  "border-b-0",
  SP_INACTIVE_CLASS,
  "data-[state=active]:border-transparent",
  "data-[state=active]:bg-background",
  "data-[state=active]:text-foreground"
);

type SmoothPillTabsProps<T extends string> = {
  // Widened to `string` (not `T`) on purpose: callers whose state can hold a
  // value outside `items` (e.g. a "list" scope with no corresponding tab)
  // can pass it straight through and simply get no tab highlighted, instead
  // of being forced to coerce it into a false match.
  value: string;
  onChange: (value: T) => void;
  items: { value: T; label: string }[];
  className?: string;
};

export function SmoothPillTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: SmoothPillTabsProps<T>) {
  return (
    <div className={cn(SP_CONTAINER_CLASS, className)}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            data-active={active ? "true" : undefined}
            className={cn(SP_BASE_CLASS, active ? SP_ACTIVE_CLASS : SP_INACTIVE_CLASS)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
