import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InfoModal } from "@/components/InfoModal";

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
}: {
  value: number | string;
  onChange: (value: number) => void;
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
    />
  );
}
