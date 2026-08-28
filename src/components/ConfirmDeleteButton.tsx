import { useState } from "react";
import { Trash2, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onConfirm: () => void;
  label: string;
  // Icon shown before the button is armed. The armed state always shows the
  // same trash (confirm) + X (cancel) pair, regardless of the trigger icon.
  triggerIcon?: LucideIcon;
  iconClassName?: string;
  className?: string;
};

export function ConfirmDeleteButton({
  onConfirm,
  label,
  triggerIcon: TriggerIcon = Trash2,
  iconClassName = "size-3.5",
  className,
}: Props) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={`${label} — onayla`}
          onClick={() => {
            setArmed(false);
            onConfirm();
          }}
          className="rounded p-1.5 text-signal transition hover:text-signal/80">
          <Trash2 className={iconClassName} />
        </button>
        <button
          type="button"
          aria-label="Vazgeç"
          onClick={() => setArmed(false)}
          className="rounded p-1.5 text-muted-foreground transition hover:text-foreground">
          <X className={iconClassName} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setArmed(true)}
      className={cn(
        "shrink-0 rounded p-1.5 text-muted-foreground transition hover:text-signal",
        className
      )}>
      <TriggerIcon className={iconClassName} />
    </button>
  );
}
