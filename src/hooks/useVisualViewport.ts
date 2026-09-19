import { useEffect } from "react";

// Anything under this is treated as "no keyboard" for --kb-inset: browser
// chrome (a collapsing URL bar, the iOS home-indicator strip) also moves the
// visual viewport by a few dozen px, and a soft keyboard is never that small.
const KEYBOARD_MIN_PX = 100;

// Mirrors window.visualViewport into CSS custom properties on <html>, so any
// CSS can react to the on-screen keyboard without every component subscribing:
//   --visual-vh   height of the region the user can actually see
//   --visual-top  how far the visible region is offset from the layout
//                 viewport's top (iOS pans the layout viewport under the
//                 keyboard to keep a focused input in view)
//   --kb-inset    height of the keyboard (0 when closed)
//
// Why not just resize the layout? `interactive-widget=resizes-content` would
// do it on Chrome Android, but it also floats the fixed bottom nav up above
// the keyboard, and iOS Safari ignores it anyway. Position:fixed elements
// (the bottom sheets) live in the *layout* viewport, which the keyboard
// overlaps rather than shrinks — so they read these vars to size themselves to
// the visible region instead.
//
// Mounted once, in AppShell. Falls back to nothing (vars stay unset, CSS
// defaults like `var(--visual-vh, 100dvh)` apply) where visualViewport isn't
// available.
export function useVisualViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    let frame = 0;

    function apply() {
      frame = 0;
      if (!vv) return;
      // Pinch-zoom also shrinks the visual viewport; that isn't a keyboard,
      // and sizing a sheet to a zoomed-in sliver of the page would be wrong.
      if (vv.scale > 1.01) {
        root.style.removeProperty("--visual-vh");
        root.style.removeProperty("--visual-top");
        root.style.setProperty("--kb-inset", "0px");
        return;
      }
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--visual-vh", `${vv.height}px`);
      root.style.setProperty("--visual-top", `${vv.offsetTop}px`);
      root.style.setProperty(
        "--kb-inset",
        `${inset >= KEYBOARD_MIN_PX ? inset : 0}px`,
      );
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    apply();
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    return () => {
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--visual-vh");
      root.style.removeProperty("--visual-top");
      root.style.removeProperty("--kb-inset");
    };
  }, []);
}

// Scrolls `el` (a search-results panel) into the visible region above the
// keyboard, without ever scrolling its own `anchor` (the search input) out of
// view. Only acts when something is actually hidden, so it's a no-op on
// desktop and with the keyboard closed.
//
// `topInset` is how much of the top of the visible region is already spoken
// for (a sticky header) — the anchor is never scrolled up under it.
//
// Needed on top of the --kb-inset padding: the browser scrolls a *focused
// input* into view on its own, but results that render below it (dropdowns,
// inline result lists) can still land under the keyboard.
export function revealAboveKeyboard(
  el: HTMLElement | null,
  anchor?: HTMLElement | null,
  topInset = 0,
) {
  const vv = window.visualViewport;
  if (!el || !vv) return;
  const visibleTop = vv.offsetTop + Math.max(topInset, 8);
  const visibleBottom = vv.offsetTop + vv.height - 8;
  const overshoot = el.getBoundingClientRect().bottom - visibleBottom;
  if (overshoot <= 0) return;
  // Never scroll further than would push the anchor above the visible top.
  const anchorTop = anchor?.getBoundingClientRect().top ?? visibleTop;
  const by = Math.min(overshoot, Math.max(0, anchorTop - visibleTop));
  if (by > 0) window.scrollBy({ top: by, behavior: "smooth" });
}

// Keeps a search-results panel above the keyboard while `active`: once when it
// appears (and whenever `dep` — typically the result count — changes), and
// again when the keyboard finishes opening, since at focus time the viewport
// hasn't shrunk yet. `getTopInset` reads a sticky header's bottom edge lazily
// so it's measured against the current scroll position.
export function useRevealAboveKeyboard(
  active: boolean,
  elRef: { current: HTMLElement | null },
  anchorRef: { current: HTMLElement | null },
  dep?: unknown,
  getTopInset?: () => number,
) {
  useEffect(() => {
    if (!active) return;
    const run = () =>
      revealAboveKeyboard(elRef.current, anchorRef.current, getTopInset?.() ?? 0);
    // Deferred a tick so the panel has rendered (and been measured) first.
    const timer = window.setTimeout(run, 50);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", run);
    return () => {
      window.clearTimeout(timer);
      vv?.removeEventListener("resize", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dep]);
}
