import { useRef, useState } from "react";

// Matches the details-content height transition in index.css — waits for it
// to finish before scrolling or restoring the glow, so both land once the
// box has actually settled instead of fighting the still-animating height.
const TRANSITION_MS = 340;

// "start" aligns the ref'd element to the top of the viewport — a bounded,
// predictable scroll (depends only on the element's own position, never on
// how tall the revealed content is) that gives a short block full headroom
// to read. "nearest" only moves the minimum needed to bring the element back
// into view — for a long revealed list, that avoids dragging the page down
// trying to fit content far taller than the viewport.
type Block = "start" | "nearest";

export function useDetailsTransition<T extends HTMLElement>(
  block: Block = "start"
) {
  const ref = useRef<T>(null);
  // False for the duration of the open/close transition. A box-shadow (glow)
  // tied to an element that's actively growing/shrinking visibly drags along
  // with it each frame, which reads as a glitch rather than a clean effect —
  // so callers hide their glow while !settled and let it fade back in once
  // the height transition has actually finished.
  const [settled, setSettled] = useState(true);

  function onToggle(open: boolean) {
    setSettled(false);
    window.setTimeout(() => {
      setSettled(true);
      if (open) {
        ref.current?.scrollIntoView({ behavior: "smooth", block });
      }
    }, TRANSITION_MS);
  }

  return { ref, onToggle, settled };
}
