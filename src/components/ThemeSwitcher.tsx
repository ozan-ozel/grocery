import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_SIGNAL_COLOR, type Theme } from "@/lib/preferences";

type Props = {
  theme: Theme;
  onSelect: (theme: Theme) => void;
};

// Binary switch, not a dropdown: with only two themes (Nane/Arduvaz) left
// after retiring the other seven, a sliding on/off toggle is a more direct
// match for the choice than a picker menu. The knob's travel distance is
// sized by hand to land exactly on the track's inner edges (see the
// left-1/w-14/size-6/translate-x-6 comment below) rather than relying on a
// toggle-switch library for a single reusable control.
export function ThemeSwitcher({ theme, onSelect }: Props) {
  const isDark = theme === "arduvaz";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Koyu tema"
      onClick={() => onSelect(isDark ? "light" : "arduvaz")}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border transition-colors duration-300",
        isDark ? "bg-foreground/85" : "bg-accent"
      )}>
      {/* Track width 56px (w-14), 4px inset (left-1) on both sides, 24px
          knob (size-6) -> 24px of travel exactly matches translate-x-6, so
          the knob's far edge always lands flush against the track's inset,
          never overshooting or falling short. */}
      <span
        className={cn(
          "absolute left-1 flex size-6 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-300 ease-out",
          isDark && "translate-x-6"
        )}>
        <Sun
          className={cn(
            "absolute size-3.5 transition-all duration-300",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
          style={{ color: THEME_SIGNAL_COLOR.light }}
        />
        <Moon
          className={cn(
            "absolute size-3.5 transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )}
          style={{ color: THEME_SIGNAL_COLOR.arduvaz }}
        />
      </span>
    </button>
  );
}
