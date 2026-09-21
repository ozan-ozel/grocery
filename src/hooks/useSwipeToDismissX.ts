// src/hooks/useSwipeToDismissX.ts
import { useEffect, useRef, useState } from "react";

// Same feel as useSwipeToDismiss (the vertical bottom-sheet hook), turned on
// its side for a toast: drag left or right, past the threshold or with a
// quick flick and it slides off and dismisses; otherwise it snaps back.
const DISMISS_THRESHOLD_PX = 80;
const FLICK_VELOCITY_PX_PER_MS = 0.5;
const FLICK_MIN_DISTANCE_PX = 24;
// Movement under this is still a tap; past it the gesture is classified once
// (horizontal drag vs. vertical scroll) and stays that way until release.
const SLOP_PX = 8;
const SLIDE_OUT_MS = 180;

type Mode = "idle" | "pending" | "drag" | "scroll";

// Pointer events (not touch) so it also works with a mouse for desktop QA.
// The element must set `touch-action: pan-y`, so the browser keeps vertical
// scrolling and hands horizontal movement to us. Pointer capture starts only
// once a horizontal drag is recognised, so a plain tap on the buttons inside
// the toast still clicks.
export function useSwipeToDismissX<T extends HTMLElement = HTMLDivElement>(
  onDismiss: () => void
) {
  const ref = useRef<T | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let mode: Mode = "idle";
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let current = 0;
    let dismissTimer: number | undefined;

    function onDown(e: PointerEvent) {
      if (dismissTimer !== undefined || pointerId !== null) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      current = 0;
      mode = "pending";
    }

    function onMove(e: PointerEvent) {
      if (e.pointerId !== pointerId || mode === "idle" || mode === "scroll") return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (mode === "pending") {
        if (Math.abs(dx) < SLOP_PX && Math.abs(dy) < SLOP_PX) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          mode = "scroll";
          return;
        }
        mode = "drag";
        setIsDragging(true);
        el!.setPointerCapture(e.pointerId);
      }
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = e.timeStamp;
      current = dx;
      setDragX(current);
    }

    function onUp(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      const wasDrag = mode === "drag";
      pointerId = null;
      mode = "idle";
      if (!wasDrag) return;
      setIsDragging(false);
      const distance = Math.abs(current);
      const shouldDismiss =
        distance > DISMISS_THRESHOLD_PX ||
        (Math.abs(velocity) > FLICK_VELOCITY_PX_PER_MS && distance > FLICK_MIN_DISTANCE_PX);
      if (!shouldDismiss) {
        setDragX(0);
        return;
      }
      // Slide the rest of the way off-screen (the toast's own transition
      // animates it — isDragging is already false), then dismiss.
      setDragX(Math.sign(current) * el!.offsetWidth);
      dismissTimer = window.setTimeout(() => onDismissRef.current(), SLIDE_OUT_MS);
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, []);

  return { ref, dragX, isDragging };
}
