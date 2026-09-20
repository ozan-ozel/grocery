import { useEffect } from "react";
import type { ComponentChildren } from "preact";
import { X } from "lucide-react";
import { SheetDragHandle } from "@/components/ui/sheet-drag-handle";
import { useSwipeToDismiss } from "@/hooks/useSwipeToDismiss";

type Props = {
  title: string;
  // Id for the title element, so the dialog's aria-labelledby has a target.
  titleId: string;
  onClose: () => void;
  children: ComponentChildren;
};

// The shell the search sheets (Ürünler / Yemekler) share: backdrop, dialog,
// grabber, and the title + close-button header. Mount it only while open —
// the swipe hook binds to the sheet element on mount.
//
// Two mobile behaviours live here so every sheet gets them for free:
//  - Swipe down from anywhere on the sheet to dismiss (see useSwipeToDismiss).
//    Only the close button is opted out (data-sheet-no-drag) so a tap on it
//    never starts a drag; the title and the empty stretch beside it drag like
//    the rest of the sheet. Text fields are skipped by the hook itself.
//  - Keyboard-aware sizing. The outer container tracks the *visual* viewport
//    (--visual-vh/--visual-top, set by useVisualViewportVars) instead of the
//    layout viewport, so with the soft keyboard open the sheet sits just above
//    it and its max-height shrinks with the visible area. A flex-col sheet
//    plus a `min-h-0 overflow-y-auto` results list then squeezes the list —
//    not the search field — to fit. Without visualViewport support the vars
//    are unset and this degrades to the old full-viewport overlay.
export function BottomSheet({ title, titleId, onClose, children }: Props) {
  const { sheetRef, dragY, isDragging } = useSwipeToDismiss(onClose);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-end"
      style={{
        height: "var(--visual-vh, 100dvh)",
        transform: "translateY(var(--visual-top, 0px))",
      }}>
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 touch-none bg-black/50 transition-opacity duration-200 starting:opacity-0"
      />
      <div
        ref={sheetRef as never}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        className={`relative z-10 flex max-h-[calc(100%-1rem)] w-full flex-col rounded-t-2xl border border-border bg-card p-5 pt-2 ease-out starting:translate-y-full ${isDragging ? "" : "transition-transform duration-200"}`}>
        <SheetDragHandle />
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            data-sheet-no-drag
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent active:bg-accent hover:text-foreground active:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
