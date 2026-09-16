import { useRef, useState } from "react";

// How far down a bottom sheet must be dragged before release counts as a
// dismiss instead of a snap-back — tuned to feel deliberate, not twitchy.
const DISMISS_THRESHOLD_PX = 90;

// Drag state for a bottom-sheet's grabber handle: attach `dragHandlers` to a
// small handle strip (not the whole sheet, so scrolling content underneath
// keeps working), and apply `dragY`/`isDragging` to the sheet's own
// transform. Downward drag only — a sheet doesn't resist upward drag since
// there's nowhere for it to go past "open."
export function useSwipeToDismiss(onDismiss: () => void) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);

  function onTouchStart(e: { touches: ArrayLike<{ clientY: number }> }) {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  }

  function onTouchMove(e: { touches: ArrayLike<{ clientY: number }> }) {
    if (startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) setDragY(delta);
  }

  function onTouchEnd() {
    if (startYRef.current === null) return;
    startYRef.current = null;
    setIsDragging(false);
    const shouldDismiss = dragY > DISMISS_THRESHOLD_PX;
    setDragY(0);
    if (shouldDismiss) onDismiss();
  }

  return {
    dragY,
    isDragging,
    dragHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
