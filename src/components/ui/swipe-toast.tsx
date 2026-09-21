// src/components/ui/swipe-toast.tsx
import { X } from "lucide-react";
import { useSwipeToDismissX } from "@/hooks/useSwipeToDismissX";

type Props = {
  message: string;
  onAction: () => void;
  onDismiss: () => void;
  // Distance from the bottom of the viewport, in rem. 1.25 is the toast's
  // original mb-5; a second toast stacks above it with a larger value.
  bottomRem?: number;
};

// The undo toast shell shared by the shopping list (UndoToast) and the meal
// plan. Swiping it away only dismisses the toast — it never triggers the
// action.
export function SwipeToast({ message, onAction, onDismiss, bottomRem = 1.25 }: Props) {
  const { ref, dragX, isDragging } = useSwipeToDismissX<HTMLDivElement>(onDismiss);
  return (
    <div
      ref={ref}
      role="status"
      style={{
        marginBottom: `${bottomRem}rem`,
        touchAction: "pan-y",
        transform: dragX ? `translateX(${dragX}px)` : undefined,
        opacity: dragX ? Math.max(0, 1 - Math.abs(dragX) / 240) : undefined,
      }}
      className={`fixed inset-x-0 bottom-0 z-20 mx-auto flex w-[calc(100%-2.5rem)] max-w-[27.5rem] items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg ${isDragging ? "" : "transition-[transform,opacity] duration-200"}`}>
      <span className="line-clamp-2 min-w-0 text-sm leading-snug">{message}</span>
      <span className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onAction}
          className="text-sm underline underline-offset-4">
          Geri al
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className="rounded p-0.5 text-background/70 hover:text-background active:text-background">
          <X className="size-4" />
        </button>
      </span>
    </div>
  );
}
