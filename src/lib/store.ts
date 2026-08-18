import { categorize } from "./categories";
import { isCustomId, type AnyCategoryId } from "./userCategories";

export type Item = {
  id: string;
  name: string;
  qty: string; // free text: "2", "500g", "1 L" — empty means unspecified
  checked: boolean;
  addedAt: number;
  // Either a built-in CategoryId or a user-created custom id ("u:...").
  category?: AnyCategoryId;
};

export type List = {
  id: string;
  title: string;
  createdAt: number;
  closedAt?: number; // set when the list is filed into history
  items: Item[];
};

export type State = {
  lists: List[]; // newest first
  activeId: string | null;
  version?: number; // monotonic, assigned by the server; absent until first sync
  groupByCategory?: boolean; // remembered per tenant
};

export type Tenant = {
  id: string;
  name: string;
  createdAt: number;
};

const STATE_KEY_PREFIX = "grocery.state.v1:";
const TENANTS_KEY = "grocery.tenants.v1";
const ACTIVE_TENANT_KEY = "grocery.activeTenant.v1";
const LEGACY_KEY = "grocery.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function newList(title?: string): List {
  const createdAt = Date.now();
  return {
    id: uid(),
    title: title ?? defaultTitle(createdAt),
    createdAt,
    items: [],
  };
}

export function defaultTitle(at: number) {
  return new Date(at).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function emptyState(): State {
  const list = newList();
  return { lists: [list], activeId: list.id };
}

function stateKey(tenantId: string) {
  return `${STATE_KEY_PREFIX}${tenantId}`;
}

export function loadTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Tenant[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTenants(tenants: Tenant[]) {
  try {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  } catch {
    // Storage full or blocked; in-memory state is still fine for the session.
  }
}

export function loadActiveTenantId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TENANT_KEY);
  } catch {
    return null;
  }
}

const TENANT_QUERY_PARAM = "tenant";

export function readTenantFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(TENANT_QUERY_PARAM);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function writeTenantToUrl(id: string) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(TENANT_QUERY_PARAM) === id) return;
    url.searchParams.set(TENANT_QUERY_PARAM, id);
    window.history.replaceState(null, "", url.toString());
  } catch {
    // Ignored — URL sync is best-effort.
  }
}

export function saveActiveTenantId(id: string) {
  try {
    localStorage.setItem(ACTIVE_TENANT_KEY, id);
  } catch {
    // Ignored — persistence is best-effort.
  }
}

export function newTenant(name: string): Tenant {
  return { id: uid(), name: name.trim() || "Ev", createdAt: Date.now() };
}

/**
 * Stable id used for the default tenant on first run. Every device that
 * migrates lands on this same id, so two phones that used to share the
 * pre-tenant global blob keep sharing after the update. New tenants added
 * after that get random ids from newTenant().
 */
export const DEFAULT_TENANT_ID = "default";

/**
 * On first run there are no tenants. Migrate any pre-tenant state saved under
 * the legacy key into a default "Evim" tenant, otherwise seed an empty one.
 */
export function bootstrapTenants(): { tenants: Tenant[]; activeId: string } {
  const existing = loadTenants();
  if (existing.length > 0) {
    // URL param wins over stored preference so a shared link opens the
    // intended tenant. Unknown ids fall back to the stored/first tenant.
    const fromUrl = readTenantFromUrl();
    const savedActive = loadActiveTenantId();
    const active =
      existing.find((t) => t.id === fromUrl) ??
      existing.find((t) => t.id === savedActive) ??
      existing[0];
    return { tenants: existing, activeId: active.id };
  }

  const first: Tenant = {
    id: DEFAULT_TENANT_ID,
    name: "Evim",
    createdAt: Date.now(),
  };
  const tenants = [first];
  saveTenants(tenants);
  saveActiveTenantId(first.id);

  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      localStorage.setItem(stateKey(first.id), legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // Migration is best-effort; the user just starts fresh if it fails.
  }

  return { tenants, activeId: first.id };
}

export function loadState(tenantId: string): State {
  try {
    const raw = localStorage.getItem(stateKey(tenantId));
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as State;
    if (!parsed?.lists?.length) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveState(tenantId: string, state: State) {
  try {
    localStorage.setItem(stateKey(tenantId), JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode). The app keeps working
    // in memory for this session; nothing to recover here.
  }
}

export function removeTenantState(tenantId: string) {
  try {
    localStorage.removeItem(stateKey(tenantId));
  } catch {
    // Ignored.
  }
}

/**
 * Splits a typed line into a name and a quantity so people can type
 * naturally: "2 süt", "domates 500g", "zeytinyağı".
 */
export function parseEntry(raw: string): { name: string; qty: string } {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return { name: "", qty: "" };

  const trailing = text.match(/^(.+?)\s+(\d+[\d.,]*\s?[a-zA-ZçÇğĞıİöÖşŞüÜ]{0,4})$/);
  if (trailing) return { name: titleCase(trailing[1]), qty: trailing[2] };

  const leading = text.match(/^(\d+[\d.,]*\s?[a-zA-ZçÇğĞıİöÖşŞüÜ]{0,4})\s+(.+)$/);
  if (leading) return { name: titleCase(leading[2]), qty: leading[1] };

  return { name: titleCase(text), qty: "" };
}

function titleCase(s: string) {
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

export type CatalogEntry = {
  name: string;
  count: number; // how many lists it has appeared on
  lastAt: number;
  lastQty: string;
};

/**
 * Every item ever added, collapsed by name. This one derivation backs
 * both the add-field autocomplete and the search tab.
 */
export function buildCatalog(lists: List[]): CatalogEntry[] {
  const map = new Map<string, CatalogEntry>();
  for (const list of lists) {
    for (const item of list.items) {
      const key = item.name.toLocaleLowerCase("tr-TR");
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: item.name,
          count: 1,
          lastAt: item.addedAt,
          lastQty: item.qty,
        });
      } else {
        existing.count += 1;
        if (item.addedAt > existing.lastAt) {
          existing.lastAt = item.addedAt;
          existing.lastQty = item.qty;
          existing.name = item.name;
        }
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || b.lastAt - a.lastAt
  );
}

export function relativeDay(at: number) {
  const days = Math.floor((Date.now() - at) / 86_400_000);
  if (days <= 0) return "bugün";
  if (days === 1) return "dün";
  if (days < 30) return `${days} gün önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

/**
 * Assigns a category to every item that doesn't already have one, using
 * the built-in Turkish grocery taxonomy.
 */
export function categorizeItems(items: Item[]): Item[] {
  // Re-classify anything without a category or stuck in "diger" so an improved
  // classifier gets a chance. Non-diger stamps (including custom "u:..." ids
  // the user picked manually) are preserved.
  return items.map((item) => {
    const c = item.category;
    if (c && c !== "diger") return item;
    return { ...item, category: categorize(item.name) };
  });
}

export function isSameCategory(a: AnyCategoryId | undefined, b: AnyCategoryId | undefined) {
  return (a ?? undefined) === (b ?? undefined);
}

// Re-export so callers importing from the store also get the item-level id type.
export { isCustomId, type AnyCategoryId };

/**
 * Same calendar day in the user's local timezone. We compare year/month/day
 * rather than Math.floor(ms / 86_400_000) because the latter is UTC-relative
 * and would misfire around midnight for anyone east or west of UTC.
 */
function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * If the active list was started on a previous calendar day and has any
 * items, archive it and open a fresh list for today. Unchecked items carry
 * over with new ids so the two lists don't share references. Preserves each
 * item's original `addedAt` so the newest-on-top order stays intact.
 *
 * Returns the previous state as well so callers can offer an undo.
 * Returns null when nothing should happen (same day, or list empty).
 */
export function rolloverIfNeeded(
  state: State,
  now: number = Date.now()
): { next: State; previous: State } | null {
  const active = state.lists.find((l) => l.id === state.activeId);
  if (!active) return null;
  if (active.items.length === 0) return null;
  if (isSameLocalDay(active.createdAt, now)) return null;

  const carried: Item[] = active.items
    .filter((i) => !i.checked)
    .map((i) => ({
      id: uid(),
      name: i.name,
      qty: i.qty,
      checked: false,
      addedAt: i.addedAt,
      category: i.category,
    }));

  const fresh: List = {
    id: uid(),
    title: defaultTitle(now),
    createdAt: now,
    items: carried,
  };

  const next: State = {
    ...state,
    lists: [
      fresh,
      ...state.lists.map((l) =>
        l.id === active.id ? { ...l, closedAt: now } : l
      ),
    ],
    activeId: fresh.id,
  };
  return { next, previous: state };
}
