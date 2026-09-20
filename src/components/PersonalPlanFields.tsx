import { cloneElement, isValidElement, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InfoModal } from "@/components/InfoModal";
import { cn } from "@/lib/utils";

// Shared with OnboardingQuickSetup (the profile-setup wizard) — kept in its
// own module, separate from PersonalPlanView, so that a static import of
// these small form primitives doesn't drag PersonalPlanView's much larger
// module (charts, formulas, source citations) into whatever bundle imports
// them. See docs/session-checkpoints/2026-09-16-04-lazy-load-app-sections.md.

const SOURCE_BADGE_CLASS =
  "inline-flex shrink-0 items-center rounded border border-signal/70 bg-signal/10 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-signal shadow-sm";

// A citation badge. With `onClick` it is a button (a jump to that source's
// entry in "Kaynakları göster"); without, a plain tag.
export function SourceBadge({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  if (!onClick) return <span className={SOURCE_BADGE_CLASS}>{label}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        SOURCE_BADGE_CLASS,
        "transition-colors hover:bg-signal/20 active:bg-signal/20",
      )}>
      {label}
    </button>
  );
}

export function Field({
  label,
  children,
  sourceBadge,
  onSourceBadgeClick,
  info,
  labelClassName,
}: {
  label: string;
  // A single control (Input / NumberInput / Select). Field hands it an `id`
  // so the visible title can be a real <label htmlFor> for it.
  children: React.ReactNode;
  sourceBadge?: string;
  // Makes the source badge a jump button (see SourceBadge).
  onSourceBadgeClick?: () => void;
  info?: string;
  // Styles just the label text (e.g. italic/bold to visually tie it to an
  // explanatory sentence elsewhere that opens with the same words) without
  // affecting the InfoModal title, which still reads the plain `label`.
  labelClassName?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const controlId = useId();
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: controlId,
      })
    : children;
  // The title row is NOT inside a <label>. A <label> with no `for` activates
  // its first labelable descendant, and a <button> is labelable — so with the
  // badge and the "i" inside the label, a tap anywhere on the title opened the
  // info modal. Now only the label text itself is a label (tapping it focuses
  // the control, via htmlFor), and the badge and "i" are separate controls.
  return (
    <div className="block text-xs text-muted-foreground">
      <div className="mb-1 flex items-center gap-1">
        <label htmlFor={controlId} className={labelClassName}>
          {label}
        </label>
        {sourceBadge && (
          <SourceBadge label={sourceBadge} onClick={onSourceBadgeClick} />
        )}
        {info && (
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            aria-label={`${label}: daha fazla bilgi`}
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-signal/70 bg-signal/10 text-[0.7rem] font-semibold leading-none text-signal shadow-sm transition-colors hover:bg-signal/20 active:bg-signal/20">
            i
          </button>
        )}
      </div>
      {control}
      {info && showInfo && (
        <InfoModal
          title={label}
          description={info}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  className,
  id,
}: {
  value: number | string;
  onChange: (value: number) => void;
  className?: string;
  // Set by Field so its title is a <label htmlFor> for this input.
  id?: string;
}) {
  return (
    <Input
      id={id}
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
  id,
}: {
  value: string;
  onChange: (event: Event) => void;
  children: React.ReactNode;
  className?: string;
  // Set by Field so its title is a <label htmlFor> for this select.
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
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
