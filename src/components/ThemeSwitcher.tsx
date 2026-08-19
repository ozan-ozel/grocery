import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_OPTIONS, THEME_SIGNAL_COLOR, type Theme } from "@/lib/preferences";

type Props = {
  theme: Theme;
  onSelect: (theme: Theme) => void;
};

const LIGHT_OPTIONS = THEME_OPTIONS.filter((t) => t.group === "light");
const DARK_OPTIONS = THEME_OPTIONS.filter((t) => t.group === "dark");

export function ThemeSwitcher({ theme, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Tema seç"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent"
      >
        <Palette className="size-4" style={{ color: THEME_SIGNAL_COLOR[theme] }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 origin-top-right overflow-hidden rounded-md border border-border bg-card shadow-lg transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          <ThemeGroup
            label="Açık"
            options={LIGHT_OPTIONS}
            active={theme}
            onSelect={(t) => {
              onSelect(t);
              setOpen(false);
            }}
          />
          <div className="h-px bg-border" />
          <ThemeGroup
            label="Koyu"
            options={DARK_OPTIONS}
            active={theme}
            onSelect={(t) => {
              onSelect(t);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ThemeGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: typeof THEME_OPTIONS;
  active: Theme;
  onSelect: (theme: Theme) => void;
}) {
  return (
    <div className="py-1">
      <div className="px-3 pb-1 pt-1.5 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <ul>
        {options.map((opt) => {
          const isActive = opt.id === active;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => onSelect(opt.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                  isActive ? "bg-accent" : "hover:bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    isActive ? "text-foreground" : "text-transparent"
                  )}
                />
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full border border-border/60"
                  style={{ backgroundColor: THEME_SIGNAL_COLOR[opt.id] }}
                />
                <span className="truncate">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
