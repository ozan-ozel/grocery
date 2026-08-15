// Device-level UI preferences: how the interface behaves and looks on this
// device. Unlike list data these never sync across devices — they're not
// part of a tenant's State, so they get their own plain localStorage keys.

export type Theme = "light" | "dark";

const THEME_KEY = "grocery.theme.v1";
const SWIPE_KEY = "grocery.swipeMode.v1";

export function loadTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignored — theme just won't persist across sessions.
  }
}

export function loadSwipeMode(): boolean {
  try {
    return localStorage.getItem(SWIPE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveSwipeMode(enabled: boolean) {
  try {
    localStorage.setItem(SWIPE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignored — preference just won't persist across sessions.
  }
}
