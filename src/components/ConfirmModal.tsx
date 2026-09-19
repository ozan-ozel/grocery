import { useEffect } from "react";
import type { ComponentChildren } from "preact";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description?: string;
  // Small uppercase line above the title, same treatment as a page's eyebrow —
  // used by multi-step flows ("Hesabı sil · Adım 2/3").
  eyebrow?: string;
  // Extra body between the description and the buttons (a choice list, a
  // field, an error line). The buttons stay pinned below it.
  children?: ComponentChildren;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  // Blocks the confirm button (and only it — cancel always works).
  confirmDisabled?: boolean;
};

export function ConfirmModal({
  title,
  description,
  eyebrow,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive,
  confirmDisabled,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    // Sized to the visual viewport (the vars useVisualViewportVars publishes;
    // they fall back to the full viewport where unset), so a modal with a text
    // field stays centred in the space above the on-screen keyboard instead of
    // ending up underneath it.
    <div
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-center px-5"
      style={{
        height: "var(--visual-vh, 100dvh)",
        transform: "translateY(var(--visual-top, 0px))",
      }}>
      <button
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 max-h-[calc(100%-2rem)] w-full max-w-[22rem] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-5 shadow-lg">
        {eyebrow && (
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "outline"}
            size="sm"
            disabled={confirmDisabled}
            onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
