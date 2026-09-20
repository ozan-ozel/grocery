import { useCallback, useRef } from "react";

// Taps closer together than this belong to the same group; a longer pause ends
// the group. Comfortably above a quick tapping cadence (~150-250ms) and below
// a deliberate pause.
const GROUP_GAP_MS = 450;
// The whole passcode has to be finished within this long of its first tap.
const WINDOW_MS = 12_000;

// A tap "passcode" with no visible UI: `pattern` is the tap count of each
// group, groups being separated by a pause — [1, 3, 2, 7] is one tap, pause,
// three taps, pause, two taps, pause, seven taps. Wire the returned callback
// to an element's onClick; `onMatch` fires on the tap that completes the last
// group, and the progress resets so the sequence must be entered again.
//
// This is UI concealment only — anything it unlocks must still be authorized
// server-side.
export function useTapSequence(pattern: readonly number[], onMatch: () => void) {
  const state = useRef({
    groups: [] as number[],
    startedAt: 0,
    lastAt: 0,
    // True while the group being tapped has already overshot its target: the
    // rest of that group is ignored, so its leftover taps can't pose as the
    // start of a new attempt.
    ignoring: false,
  });
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

  return useCallback(() => {
    const now = Date.now();
    const s = state.current;
    const sameGroup = now - s.lastAt <= GROUP_GAP_MS;
    s.lastAt = now;

    if (s.ignoring && sameGroup) return;
    s.ignoring = false;

    if (s.groups.length === 0 || now - s.startedAt > WINDOW_MS) {
      s.groups = [1];
      s.startedAt = now;
    } else if (!sameGroup) {
      s.groups.push(1);
    } else {
      s.groups[s.groups.length - 1] += 1;
    }

    // A finished group must equal its target exactly; the open one may only
    // grow up to its target.
    const onTrack = (groups: number[]) =>
      groups.length <= pattern.length &&
      groups.every((count, i) =>
        i < groups.length - 1 ? count === pattern[i] : count <= pattern[i],
      );

    // Off track: an earlier stray group (a wrong attempt just before this
    // one) may be what is throwing it off, so drop leading groups until the
    // rest fits — that lets a retry work right after a miss. If even the open
    // group alone is too big, ignore it until the next pause.
    while (!onTrack(s.groups) && s.groups.length > 1) {
      s.groups.shift();
      s.startedAt = now;
    }
    if (!onTrack(s.groups)) {
      s.groups = [];
      s.ignoring = true;
      return;
    }

    const open = s.groups.length - 1;
    if (open === pattern.length - 1 && s.groups[open] === pattern[open]) {
      s.groups = [];
      onMatchRef.current();
    }
  }, [pattern]);
}
