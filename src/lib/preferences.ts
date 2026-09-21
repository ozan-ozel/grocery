// Device-level UI preferences: how the interface behaves and looks on this
// device. Unlike list data these never sync across devices — they're not
// part of a tenant's State, so they get their own plain localStorage keys.

export type Theme = "light" | "arduvaz";

export type ThemeGroup = "light" | "dark";

export type ThemeOption = { id: Theme; label: string; group: ThemeGroup };

// The theme picker previously offered 9 options; retired down to these two
// (Nane, Arduvaz) per an explicit product decision. loadTheme() below falls
// back to "light" for any stored value outside THEME_IDS, so a device with
// an old retired theme selected just resets to Nane on next load.
export const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", label: "Nane", group: "light" },
  { id: "arduvaz", label: "Arduvaz", group: "dark" },
];

const THEME_IDS = new Set<string>(THEME_OPTIONS.map((t) => t.id));

// Mirrors each theme's --color-background from index.css. Duplicated here
// because the PWA theme-color meta tag needs a literal hex, not a CSS
// custom property.
export const THEME_META_COLOR: Record<Theme, string> = {
  light: "#F2F5F2",
  arduvaz: "#0A0E14",
};

// Mirrors each theme's --color-signal from index.css — the accent used for
// the checkbox/progress fill and (on the two original themes) destructive
// actions too. Duplicated here for the same reason as THEME_META_COLOR: the
// theme switcher needs to show every option's accent while only one theme's
// CSS custom properties are actually active on :root at a time.
export const THEME_SIGNAL_COLOR: Record<Theme, string> = {
  light: "#D8402F",
  arduvaz: "#4F8CFF",
};

const THEME_KEY = "grocery.theme.v1";
const SWIPE_KEY = "grocery.swipeMode.v1";
const NUTRITION_VALUES_KEY = "grocery.showNutritionValues.v1";
const SHOPPING_TAB_KEY = "grocery.shoppingTab.v1";
const MEAL_PORTION_KEY = "grocery.mealPortion.v1";

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

export function loadShowNutritionValues(): boolean {
  try {
    return localStorage.getItem(NUTRITION_VALUES_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveShowNutritionValues(enabled: boolean) {
  try {
    localStorage.setItem(NUTRITION_VALUES_KEY, enabled ? "1" : "0");
  } catch {
    // Ignored — preference just won't persist across sessions.
  }
}

export function loadShoppingTab(): "list" | "history" {
  try {
    const stored = localStorage.getItem(SHOPPING_TAB_KEY);
    return stored === "history" ? "history" : "list";
  } catch {
    return "list";
  }
}

export function saveShoppingTab(tab: "list" | "history") {
  try {
    localStorage.setItem(SHOPPING_TAB_KEY, tab);
  } catch {
    // Ignored — preference just won't persist across sessions.
  }
}

// The last portion tier picked in the Meal Plan's "Yemekler" sheet — what a
// plain tap on a meal row adds, so one-tap adding stays one tap. Per device,
// like the other UI preferences here. Custom amounts are one-offs and never
// stored.
export function loadMealPortion(): "small" | "normal" | "large" {
  try {
    const stored = localStorage.getItem(MEAL_PORTION_KEY);
    return stored === "small" || stored === "large" ? stored : "normal";
  } catch {
    return "normal";
  }
}

export function saveMealPortion(portion: "small" | "normal" | "large") {
  try {
    localStorage.setItem(MEAL_PORTION_KEY, portion);
  } catch {
    // Ignored — preference just won't persist across sessions.
  }
}
