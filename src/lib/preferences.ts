// Device-level UI preferences: how the interface behaves and looks on this
// device. Unlike list data these never sync across devices — they're not
// part of a tenant's State, so they get their own plain localStorage keys.

export type Theme =
  | "light"
  | "dark"
  | "grafit"
  | "arduvaz"
  | "karbon"
  | "bulut"
  | "ipek"
  | "nova"
  | "parsomen";

export type ThemeGroup = "light" | "dark";

export type ThemeOption = { id: Theme; label: string; group: ThemeGroup };

// "light" and "dark" are the two original themes; the rest were added
// alongside them as a picker instead of replacing them. Order here is
// display order in the picker.
export const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", label: "Nane", group: "light" },
  { id: "bulut", label: "Bulut", group: "light" },
  { id: "ipek", label: "İpek", group: "light" },
  { id: "nova", label: "Nova", group: "light" },
  { id: "parsomen", label: "Parşömen", group: "light" },
  { id: "dark", label: "Çam", group: "dark" },
  { id: "grafit", label: "Grafit", group: "dark" },
  { id: "arduvaz", label: "Arduvaz", group: "dark" },
  { id: "karbon", label: "Karbon", group: "dark" },
];

const THEME_IDS = new Set<string>(THEME_OPTIONS.map((t) => t.id));

// Mirrors each theme's --color-background from index.css. Duplicated here
// because the PWA theme-color meta tag needs a literal hex, not a CSS
// custom property.
export const THEME_META_COLOR: Record<Theme, string> = {
  light: "#F2F5F2",
  bulut: "#EEF3FB",
  ipek: "#F6F0FA",
  nova: "#FAF9F6",
  parsomen: "#F5F1E8",
  dark: "#161F1C",
  grafit: "#131316",
  arduvaz: "#0A0E14",
  karbon: "#09090C",
};

// Mirrors each theme's --color-signal from index.css — the accent used for
// the checkbox/progress fill and (on the two original themes) destructive
// actions too. Duplicated here for the same reason as THEME_META_COLOR: the
// theme switcher needs to show every option's accent while only one theme's
// CSS custom properties are actually active on :root at a time.
export const THEME_SIGNAL_COLOR: Record<Theme, string> = {
  light: "#D8402F",
  bulut: "#2F6FED",
  ipek: "#9333EA",
  nova: "#5E6AD2",
  parsomen: "#B34A30",
  dark: "#E2564A",
  grafit: "#E2564A",
  arduvaz: "#4F8CFF",
  karbon: "#B455F5",
};

const THEME_KEY = "grocery.theme.v1";
const SWIPE_KEY = "grocery.swipeMode.v1";

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && THEME_IDS.has(stored) ? (stored as Theme) : "light";
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

export function themeGroup(theme: Theme): ThemeGroup {
  return THEME_OPTIONS.find((t) => t.id === theme)?.group ?? "light";
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
