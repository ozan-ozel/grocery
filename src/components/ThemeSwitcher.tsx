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
// left-1/w-16/size-7/translate-x-7 comment below) rather than relying on a
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
        "relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border transition-colors duration-300",
        // Dark-on state used --color-foreground before, which is a light
        // near-white in Arduvaz — the track rendered as a bright bar on an
        // otherwise dark page. Signal is theme-aware in both directions
        // (red on Nane, blue on Arduvaz), so tinting the "on" track with it
        // instead stays dark-appropriate without a separate light/dark case.
        isDark ? "bg-signal/25" : "bg-accent"
      )}>
      {/* Track width 64px (w-16), 4px inset (left-1) on both sides, 28px
          knob (size-7) -> 28px of travel exactly matches translate-x-7, so
          the knob's far edge always lands flush against the track's inset,
          never overshooting or falling short. */}
      <span
        className={cn(
          "absolute left-1 flex size-7 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-300 ease-out",
          isDark && "translate-x-7"
        )}>
        <Sun
          className={cn(
            "absolute size-4 transition-all duration-300",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
          style={{ color: THEME_SIGNAL_COLOR.light }}
        />
        <Moon
          className={cn(
            "absolute size-4 transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )}
          style={{ color: THEME_SIGNAL_COLOR.arduvaz }}
        />
      </span>
    </button>
  );
}
