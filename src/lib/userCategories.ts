import { Tag, type LucideIcon } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  type CategoryDef,
  type CategoryId,
} from "./categories";

export type AnyCategoryId = CategoryId | string;

export type CategoryOverride = {
  label?: string;
  order?: number;
  hidden?: boolean;
};

export type CustomCategory = {
  id: string; // "u:<random>"
  label: string;
  order: number;
};

export type CategoryOverlay = {
  overrides: Partial<Record<CategoryId, CategoryOverride>>;
  custom: CustomCategory[];
};

export type MergedCategory = {
  id: AnyCategoryId;
  label: string;
  order: number;
  hidden: boolean;
  builtin: boolean;
  icon: LucideIcon;
};

// Custom categories have no curated icon of their own; a generic tag icon
// keeps them visually aligned with built-ins in the icon column.
const CUSTOM_ICON = Tag;

const OVERLAY_KEY = "grocery.categories.v1";
const CUSTOM_PREFIX = "u:";

export function isCustomId(id: AnyCategoryId): boolean {
  return typeof id === "string" && id.startsWith(CUSTOM_PREFIX);
}

export function newCustomId(): string {
  return CUSTOM_PREFIX + Math.random().toString(36).slice(2, 10);
}

export function emptyOverlay(): CategoryOverlay {
  return { overrides: {}, custom: [] };
}

export function loadOverlay(): CategoryOverlay {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (!raw) return emptyOverlay();
    const parsed = JSON.parse(raw) as Partial<CategoryOverlay>;
    return {
      overrides: parsed?.overrides ?? {},
      custom: Array.isArray(parsed?.custom) ? parsed.custom : [],
    };
  } catch {
    return emptyOverlay();
  }
}

export function saveOverlay(overlay: CategoryOverlay) {
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
  } catch {
    // Best-effort persistence, same as the rest of the app.
  }
}

/**
 * Merged view of built-ins + user overrides + custom categories, sorted by
 * effective order. Hidden flag is included so callers can decide whether to
 * skip a category (e.g. grouped list still shows hidden ones that hold items).
 */
export function mergeCategories(overlay: CategoryOverlay): MergedCategory[] {
  const merged: MergedCategory[] = [];
  for (const c of CATEGORIES as CategoryDef[]) {
    const o = overlay.overrides[c.id] ?? {};
    merged.push({
      id: c.id,
      label: o.label ?? c.label,
      order: o.order ?? c.order,
      hidden: o.hidden ?? false,
      builtin: true,
      icon: c.icon,
    });
  }
  for (const c of overlay.custom) {
    merged.push({
      id: c.id,
      label: c.label,
      order: c.order,
      hidden: false,
      builtin: false,
      icon: CUSTOM_ICON,
    });
  }
  return merged.sort((a, b) => a.order - b.order);
}

export function labelFor(
  overlay: CategoryOverlay,
  id: AnyCategoryId | undefined
): string {
  if (!id) return overrideLabel(overlay, "diger");
  if (isCustomId(id)) {
    const found = overlay.custom.find((c) => c.id === id);
    if (found) return found.label;
    return overrideLabel(overlay, "diger");
  }
  return overrideLabel(overlay, id as CategoryId);
}

function overrideLabel(overlay: CategoryOverlay, id: CategoryId): string {
  const o = overlay.overrides[id];
  if (o?.label) return o.label;
  return CATEGORY_BY_ID[id]?.label ?? CATEGORY_BY_ID.diger.label;
}

export function renameCategory(
  overlay: CategoryOverlay,
  id: AnyCategoryId,
  label: string
): CategoryOverlay {
  const trimmed = label.trim();
  if (!trimmed) return overlay;
  if (isCustomId(id)) {
    return {
      ...overlay,
      custom: overlay.custom.map((c) => (c.id === id ? { ...c, label: trimmed } : c)),
    };
  }
  const cid = id as CategoryId;
  const prev = overlay.overrides[cid] ?? {};
  return { ...overlay, overrides: { ...overlay.overrides, [cid]: { ...prev, label: trimmed } } };
}

export function setHidden(
  overlay: CategoryOverlay,
  id: CategoryId,
  hidden: boolean
): CategoryOverlay {
  const prev = overlay.overrides[id] ?? {};
  return { ...overlay, overrides: { ...overlay.overrides, [id]: { ...prev, hidden } } };
}

export function addCustomCategory(
  overlay: CategoryOverlay,
  label: string
): { overlay: CategoryOverlay; id: string } | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const merged = mergeCategories(overlay);
  const maxOrder = merged.reduce((m, c) => Math.max(m, c.order), 0);
  // Slot new customs just before "diger" (order 99) so they land above the
  // catch-all but below every real built-in.
  const order = Math.min(maxOrder + 1, 98);
  const next: CustomCategory = { id: newCustomId(), label: trimmed, order };
  return {
    overlay: { ...overlay, custom: [...overlay.custom, next] },
    id: next.id,
  };
}

export function removeCustomCategory(
  overlay: CategoryOverlay,
  id: string
): CategoryOverlay {
  if (!isCustomId(id)) return overlay;
  return { ...overlay, custom: overlay.custom.filter((c) => c.id !== id) };
}

/**
 * Reorder by swapping the target category with its neighbour in the merged
 * list. Persists the swap as an explicit order on both categories so a later
 * built-in label change doesn't drop us back to the default order.
 */
export function moveCategory(
  overlay: CategoryOverlay,
  id: AnyCategoryId,
  direction: "up" | "down"
): CategoryOverlay {
  const merged = mergeCategories(overlay);
  const idx = merged.findIndex((c) => c.id === id);
  if (idx < 0) return overlay;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= merged.length) return overlay;

  const a = merged[idx];
  const b = merged[swapWith];
  let next = overlay;
  next = writeOrder(next, a.id, b.order);
  next = writeOrder(next, b.id, a.order);
  return next;
}

/**
 * Reorder by drag-and-drop: caller supplies the full category list in its
 * new order, and every category gets a fresh dense order (1, 2, 3, ...) so
 * later inserts don't need fractional gaps.
 */
export function reorderCategories(
  overlay: CategoryOverlay,
  orderedIds: AnyCategoryId[]
): CategoryOverlay {
  let next = overlay;
  orderedIds.forEach((id, idx) => {
    next = writeOrder(next, id, idx + 1);
  });
  return next;
}

function writeOrder(
  overlay: CategoryOverlay,
  id: AnyCategoryId,
  order: number
): CategoryOverlay {
  if (isCustomId(id)) {
    return {
      ...overlay,
      custom: overlay.custom.map((c) => (c.id === id ? { ...c, order } : c)),
    };
  }
  const cid = id as CategoryId;
  const prev = overlay.overrides[cid] ?? {};
  return { ...overlay, overrides: { ...overlay.overrides, [cid]: { ...prev, order } } };
}
