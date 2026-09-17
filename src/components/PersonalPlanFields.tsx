import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InfoModal } from "@/components/InfoModal";
import { cn } from "@/lib/utils";

// Shared with OnboardingQuickSetup (the profile-setup wizard) — kept in its
// own module, separate from PersonalPlanView, so that a static import of
// these small form primitives doesn't drag PersonalPlanView's much larger
// module (charts, formulas, source citations) into whatever bundle imports
// them. See docs/session-checkpoints/2026-09-16-04-lazy-load-app-sections.md.

export function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-signal/70 bg-signal/10 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-signal shadow-sm">
      {label}
    </span>
  );
}

export function Field({
  label,
  children,
  sourceBadge,
  info,
}: {
  label: string;
  children: React.ReactNode;
  sourceBadge?: string;
  info?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="mb-1 flex items-center gap-1">
        {label} {sourceBadge && <SourceBadge label={sourceBadge} />}
        {info && (
          <button
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setShowInfo(true);
            }}
            aria-label="Daha fazla bilgi"
            className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/50 text-[10px] leading-none hover:bg-accent active:bg-accent">
            i
          </button>
        )}
      </span>
      {children}
      {info && showInfo && (
        <InfoModal
          title={label}
          description={info}
          onClose={() => setShowInfo(false)}
        />
      )}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  className,
}: {
  value: number | string;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      value={value}
      onInput={(event: Event) =>
        onChange(Number((event.target as HTMLInputElement).value))
      }
      className={className}
    />
  );
}

// Native <select>, styled to match NumberInput/Field's h-9 text-sm sizing
// (the default Input/select browser chrome runs bigger — h-11/text-base —
// which looked visibly mismatched sitting in the same grid as the compact
// fields it's paired with). appearance-none strips the native dropdown
// arrow so the small ChevronDown adornment below is the only one shown,
// consistent with the rest of the app's icon sizing instead of each
// platform's own (differently sized) native arrow glyph.
export function Select({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (event: Event) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-input bg-background px-2 pr-7 text-sm",
          className,
        )}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
