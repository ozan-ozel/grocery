import { useEffect, useRef, useState } from "react";

// How far down a bottom sheet must be dragged before release counts as a
// dismiss instead of a snap-back — tuned to feel deliberate, not twitchy.
const DISMISS_THRESHOLD_PX = 90;
// A quick downward flick dismisses even if it didn't travel that far.
const FLICK_VELOCITY_PX_PER_MS = 0.6;
const FLICK_MIN_DISTANCE_PX = 24;
// Movement under this is still "a tap"; past it the gesture is classified once
// (sheet-drag vs. content-scroll vs. horizontal) and stays that way until the
// finger lifts, so a scroll can't turn into a drag mid-gesture or vice versa.
const SLOP_PX = 8;
const SLIDE_OUT_MS = 200;

// Touches that start here never begin a sheet drag: text fields (dragging
// there selects text / moves the caret) and anything explicitly opted out —
// the sheet header with its close button carries data-sheet-no-drag.
const NO_DRAG_SELECTOR =
  "[data-sheet-no-drag], input, textarea, select, [contenteditable='true']";

// True if `target` sits inside a scroll container (below `root`) that isn't
// at its top — i.e. a downward finger move there means "scroll the content
// back up", not "drag the sheet". At scrollTop 0 the sheet takes over, which
// is the standard native bottom-sheet hand-off.
function isInsideScrolledContent(target: Element | null, root: HTMLElement) {
  for (let el = target; el && el !== root.parentElement; el = el.parentElement) {
    const style = getComputedStyle(el);
    const scrollable =
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight;
    if (scrollable && el.scrollTop > 0) return true;
    if (el === root) break;
  }
  return false;
}

type Mode = "idle" | "blocked" | "pending" | "drag" | "scroll";

// Drag-to-dismiss for a bottom sheet, from anywhere on the sheet — not just
// the grabber. Attach `sheetRef` to the sheet element and apply
// `dragY`/`isDragging` to its transform.
//
// Native listeners (not JSX onTouch*) because touchmove must be
// non-passive to call preventDefault(): once a gesture is classified as a
// sheet drag, the page/list underneath must not also scroll or pull-to-refresh.
// Downward drag only — a sheet doesn't resist upward drag since there's
// nowhere for it to go past "open."
export function useSwipeToDismiss(onDismiss: () => void) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLElement | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    let mode: Mode = "idle";
    let startX = 0;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let currentDrag = 0;
    let dismissTimer: number | undefined;

    function onTouchStart(e: TouchEvent) {
      if (dismissTimer !== undefined || e.touches.length !== 1) {
        mode = "blocked";
        return;
      }
      const target = e.target as Element | null;
      if (target?.closest(NO_DRAG_SELECTOR)) {
        mode = "blocked";
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = lastY = t.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      currentDrag = 0;
      mode = "pending";
    }

    function onTouchMove(e: TouchEvent) {
      if (mode === "idle" || mode === "blocked" || mode === "scroll") return;
      const t = e.touches[0];
      const dy = t.clientY - startY;
      const dx = t.clientX - startX;

      if (mode === "pending") {
        if (Math.abs(dy) < SLOP_PX && Math.abs(dx) < SLOP_PX) return;
        // Horizontal, upward, or over scrolled-down content: leave the
        // gesture to the browser.
        if (
          Math.abs(dx) > Math.abs(dy) ||
          dy < 0 ||
          isInsideScrolledContent(e.target as Element | null, sheet!)
        ) {
          mode = "scroll";
          return;
        }
        mode = "drag";
        setIsDragging(true);
      }

      // mode === "drag"
      if (e.cancelable) e.preventDefault();
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (t.clientY - lastY) / dt;
      lastY = t.clientY;
      lastT = e.timeStamp;
      // Follow the finger from where the drag was recognised, not from the
      // touch's origin, so the sheet doesn't jump by SLOP_PX on the first move.
      currentDrag = Math.max(0, dy - SLOP_PX);
      setDragY(currentDrag);
    }

    function onTouchEnd() {
      const wasDrag = mode === "drag";
      mode = "idle";
      if (!wasDrag) return;
      setIsDragging(false);
      const shouldDismiss =
        currentDrag > DISMISS_THRESHOLD_PX ||
        (velocity > FLICK_VELOCITY_PX_PER_MS && currentDrag > FLICK_MIN_DISTANCE_PX);
      if (!shouldDismiss) {
        setDragY(0);
        return;
      }
      // Slide the rest of the way off-screen (the sheet's own transform
      // transition animates it — isDragging is already false), then unmount.
      setDragY(sheet!.offsetHeight);
      dismissTimer = window.setTimeout(() => onDismissRef.current(), SLIDE_OUT_MS);
    }

    sheet.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet.addEventListener("touchmove", onTouchMove, { passive: false });
    sheet.addEventListener("touchend", onTouchEnd);
    sheet.addEventListener("touchcancel", onTouchEnd);
    return () => {
      sheet.removeEventListener("touchstart", onTouchStart);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("touchend", onTouchEnd);
      sheet.removeEventListener("touchcancel", onTouchEnd);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, []);

  return { sheetRef, dragY, isDragging };
}
