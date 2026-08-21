import { useEffect, useState } from "react";
import {
  readSectionFromUrl,
  readTabFromUrl,
  writeSectionToUrl,
  writeTabToUrl,
} from "@/lib/store";
import {
  loadSwipeMode,
  loadTheme,
  saveSwipeMode,
  saveTheme,
  THEME_META_COLOR,
  type Theme,
} from "@/lib/preferences";

export type Section = "alisveris" | "besin" | "yemek";
export type Tab = "list" | "history" | "find" | "cats";
const TABS: Tab[] = ["list", "history", "find", "cats"];

function initialSection(): Section {
  const fromUrl = readSectionFromUrl();
  if (fromUrl === "besin") return "besin";
  if (fromUrl === "yemek") return "yemek";
  return "alisveris";
}

function initialTab(): Tab {
  const fromUrl = readTabFromUrl();
  return (TABS as string[]).includes(fromUrl ?? "") ? (fromUrl as Tab) : "list";
}

export function useUiPrefs() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [swipeMode, setSwipeMode] = useState(() => loadSwipeMode());
  const [section, setSection] = useState<Section>(initialSection);
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    writeSectionToUrl(section);
  }, [section]);

  useEffect(() => {
    writeTabToUrl(tab);
  }, [tab]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", THEME_META_COLOR[theme]);
  }, [theme]);

  useEffect(() => {
    saveSwipeMode(swipeMode);
  }, [swipeMode]);

  function toggleSwipeMode() {
    setSwipeMode((s) => !s);
  }

  return { theme, setTheme, swipeMode, toggleSwipeMode, section, setSection, tab, setTab };
}
