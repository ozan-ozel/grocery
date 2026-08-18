import { useEffect, useMemo, useRef, useState } from "react";
import { CloudOff, FilePlus2, Moon, RefreshCw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddItem } from "@/components/AddItem";
import { ActiveList } from "@/components/ActiveList";
import { CategoriesView } from "@/components/CategoriesView";
import { HistoryView } from "@/components/HistoryView";
import { SearchView } from "@/components/SearchView";
import { NutritionView } from "@/components/NutritionView";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import {
  addCustomCategory,
  loadOverlay,
  mergeCategories,
  moveCategory,
  reorderCategories,
  removeCustomCategory,
  renameCategory,
  saveOverlay,
  setHidden,
  type AnyCategoryId,
  type CategoryOverlay,
} from "@/lib/userCategories";
import type { CategoryId } from "@/lib/categories";
import {
  buildCatalog,
  bootstrapTenants,
  categorizeItems,
  defaultTitle,
  emptyState,
  loadState,
  newList,
  newTenant,
  removeTenantState,
  rolloverIfNeeded,
  saveActiveTenantId,
  saveState,
  saveTenants,
  uid,
  writeTenantToUrl,
  type Item,
  type State,
  type Tenant,
} from "@/lib/store";
import { createSync, type SyncStatus } from "@/lib/sync";
import {
  loadItemCategories,
  lookupItemCategory,
  rememberItemCategory,
  saveItemCategories,
  type ItemCategoryMap,
} from "@/lib/itemCategories";
import {
  loadSwipeMode,
  loadTheme,
  saveSwipeMode,
  saveTheme,
  type Theme,
} from "@/lib/preferences";

type Undo =
  | { kind: "remove"; item: Item; listId: string }
  | { kind: "bulkRemove"; items: Item[]; listId: string }
  | { kind: "rollover"; previous: State };

export function App() {
  const [{ tenants, activeTenantId }, setTenantState] = useState(() => {
    const boot = bootstrapTenants();
    return { tenants: boot.tenants, activeTenantId: boot.activeId };
  });
  const [state, setState] = useState<State>(() => loadState(activeTenantId));
  const [overlay, setOverlay] = useState<CategoryOverlay>(() => loadOverlay());
  const [itemCategories, setItemCategories] = useState<ItemCategoryMap>(() =>
    loadItemCategories(activeTenantId)
  );
  const [undo, setUndo] = useState<Undo | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [swipeMode, setSwipeMode] = useState(() => loadSwipeMode());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#161F1C" : "#F2F5F2");
  }, [theme]);

  useEffect(() => {
    saveSwipeMode(swipeMode);
  }, [swipeMode]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function toggleSwipeMode() {
    setSwipeMode((s) => !s);
  }

  useEffect(() => {
    saveOverlay(overlay);
  }, [overlay]);

  useEffect(() => {
    saveItemCategories(activeTenantId, itemCategories);
  }, [activeTenantId, itemCategories]);

  useEffect(() => {
    setItemCategories(loadItemCategories(activeTenantId));
  }, [activeTenantId]);

  useEffect(() => {
    writeTenantToUrl(activeTenantId);
  }, [activeTenantId]);

  const mergedCategories = useMemo(() => mergeCategories(overlay), [overlay]);

  function showUndo(u: Undo, ttlMs: number) {
    setUndo(u);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), ttlMs);
  }

  const stateRef = useRef(state);
  stateRef.current = state;
  const syncRef = useRef<ReturnType<typeof createSync> | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  // A single sync channel per tenant. When the tenant switches we tear the
  // old one down before starting a new one so pushes never leak across tenants.
  useEffect(() => {
    const sync = createSync({
      getState: () => stateRef.current,
      setState,
      tenantId: activeTenantId,
      baseUrl: import.meta.env.VITE_API_BASE ?? "",
      onStatusChange: setSyncStatus,
    });
    syncRef.current = sync;
    sync.start();
    return () => {
      sync.stop();
      syncRef.current = null;
    };
  }, [activeTenantId]);

  useEffect(() => {
    saveState(activeTenantId, state);
    syncRef.current?.notifyChange();
  }, [state, activeTenantId]);

  // Daily rollover: on mount, on tenant switch, and whenever the tab regains
  // focus after being backgrounded (which is when "next open" actually fires
  // for a PWA left running overnight). Cheap idempotent check.
  useEffect(() => {
    function check() {
      const result = rolloverIfNeeded(stateRef.current);
      if (!result) return;
      setState(result.next);
      showUndo({ kind: "rollover", previous: result.previous }, 10_000);
    }
    check();
    function onVisible() {
      if (document.visibilityState === "visible") check();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [activeTenantId]);

  const active = state.lists.find((l) => l.id === state.activeId) ?? state.lists[0];

  // Selection is tied to one list's rows; drop it if the active list changes
  // out from under it (tenant switch, new list, rollover) so stale ids can't
  // linger into a different list.
  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [active.id]);

  const past = state.lists.filter((l) => l.id !== active.id);
  const catalog = useMemo(() => buildCatalog(state.lists), [state.lists]);
  const groupByCategory = state.groupByCategory ?? false;

  const total = active.items.length;
  const done = active.items.filter((i) => i.checked).length;
  const progress = total ? (done / total) * 100 : 0;

  function updateActive(fn: (items: Item[]) => Item[]) {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === active.id ? { ...l, items: fn(l.items) } : l)),
    }));
  }

  function addItem(name: string, qty: string) {
    const existing = active.items.find(
      (i) => i.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")
    );
    // Re-adding something already on the list just un-checks it rather
    // than creating a confusing duplicate row.
    if (existing) {
      updateActive((items) =>
        items.map((i) => (i.id === existing.id ? { ...i, checked: false } : i))
      );
      return;
    }
    const remembered = lookupItemCategory(itemCategories, name);
    updateActive((items) => [
      ...items,
      {
        id: uid(),
        name,
        qty,
        checked: false,
        addedAt: Date.now(),
        category: remembered,
      },
    ]);
  }

  function toggleItem(id: string) {
    updateActive((items) =>
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  }

  function editItem(id: string, name: string, qty: string, category?: AnyCategoryId) {
    if (category !== undefined) {
      setItemCategories((m) => rememberItemCategory(m, name, category));
    }
    updateActive((items) =>
      items.map((i) => {
        if (i.id !== id) return i;
        // If the user explicitly picked a category in the edit row, that stamp
        // wins and survives even a name change. Otherwise we only wipe the
        // stored category when the name changed, so a qty-only edit doesn't
        // erase a manual assignment.
        const explicit = category !== undefined;
        const nameChanged = i.name !== name;
        return {
          ...i,
          name,
          qty,
          category: explicit ? category : nameChanged ? undefined : i.category,
        };
      })
    );
  }

  function removeItem(id: string) {
    const item = active.items.find((i) => i.id === id);
    if (!item) return;
    updateActive((items) => items.filter((i) => i.id !== id));
    showUndo({ kind: "remove", item, listId: active.id }, 6000);
  }

  function toggleSelectMode() {
    setSelectMode((on) => !on);
    setSelectedIds(new Set());
  }

  function selectAll() {
    setSelectMode(true);
    setSelectedIds(new Set(active.items.map((i) => i.id)));
  }

  function selectCategory(ids: string[], selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkRemove() {
    const items = active.items.filter((i) => selectedIds.has(i.id));
    if (items.length === 0) return;
    updateActive((current) => current.filter((i) => !selectedIds.has(i.id)));
    showUndo({ kind: "bulkRemove", items, listId: active.id }, 6000);
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function restore() {
    if (!undo) return;
    if (undo.kind === "remove") {
      const target = undo;
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === target.listId ? { ...l, items: [...l.items, target.item] } : l
        ),
      }));
    } else if (undo.kind === "bulkRemove") {
      const target = undo;
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === target.listId
            ? { ...l, items: [...l.items, ...target.items] }
            : l
        ),
      }));
    } else {
      setState(undo.previous);
    }
    setUndo(null);
  }

  function startNewList() {
    // An untouched list isn't worth filing — just keep using it.
    if (active.items.length === 0) return;
    const next = newList();
    setState((s) => ({
      ...s,
      lists: [
        next,
        ...s.lists.map((l) =>
          l.id === active.id ? { ...l, closedAt: Date.now() } : l
        ),
      ],
      activeId: next.id,
    }));
  }

  function reuseList(listId: string) {
    const source = state.lists.find((l) => l.id === listId);
    if (!source) return;
    const present = new Set(
      active.items.map((i) => i.name.toLocaleLowerCase("tr-TR"))
    );
    const additions = source.items
      .filter((i) => !present.has(i.name.toLocaleLowerCase("tr-TR")))
      .map((i) => ({
        id: uid(),
        name: i.name,
        qty: i.qty,
        checked: false,
        addedAt: Date.now(),
        // Carry the source item's category so manual/custom stamps survive
        // a reuse. Matches the rollover behavior.
        category: i.category,
      }));
    updateActive((items) => [...items, ...additions]);
  }

  function renameActive(title: string) {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) => (l.id === active.id ? { ...l, title } : l)),
    }));
  }

  function toggleGrouping() {
    setState((s) => ({ ...s, groupByCategory: !(s.groupByCategory ?? false) }));
  }

  function categorizeActive() {
    updateActive((items) => categorizeItems(items));
  }

  function selectTenant(id: string) {
    if (id === activeTenantId) return;
    saveActiveTenantId(id);
    setTenantState((prev) => ({ ...prev, activeTenantId: id }));
    setState(loadState(id));
  }

  function addTenant(name: string) {
    const t = newTenant(name);
    const next = [...tenants, t];
    saveTenants(next);
    saveActiveTenantId(t.id);
    setTenantState({ tenants: next, activeTenantId: t.id });
    setState(emptyState());
  }

  function renameTenant(id: string, name: string) {
    const next = tenants.map((t) => (t.id === id ? { ...t, name } : t));
    saveTenants(next);
    setTenantState((prev) => ({ ...prev, tenants: next }));
  }

  function deleteTenant(id: string) {
    if (tenants.length <= 1) return;
    const next = tenants.filter((t) => t.id !== id);
    saveTenants(next);
    removeTenantState(id);
    if (id === activeTenantId) {
      const fallback = next[0];
      saveActiveTenantId(fallback.id);
      setTenantState({ tenants: next, activeTenantId: fallback.id });
      setState(loadState(fallback.id));
    } else {
      setTenantState((prev) => ({ ...prev, tenants: next }));
    }
  }

  const isOnList = (name: string) =>
    active.items.some(
      (i) => i.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")
    );

  function renameCat(id: AnyCategoryId, label: string) {
    setOverlay((o) => renameCategory(o, id, label));
  }

  function toggleHidden(id: string, hidden: boolean) {
    setOverlay((o) => setHidden(o, id as CategoryId, hidden));
  }

  function moveCat(id: AnyCategoryId, direction: "up" | "down") {
    setOverlay((o) => moveCategory(o, id, direction));
  }

  function reorderCats(ids: AnyCategoryId[]) {
    setOverlay((o) => reorderCategories(o, ids));
  }

  function addCategory(label: string) {
    setOverlay((o) => {
      const result = addCustomCategory(o, label);
      return result?.overlay ?? o;
    });
  }

  function removeCategory(id: string) {
    setOverlay((o) => removeCustomCategory(o, id));
  }

  return (
    <Tabs
      defaultValue="list"
      className="mx-auto min-h-dvh w-full max-w-[30rem] px-5 pb-28"
    >
      <header className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-6 backdrop-blur">
        <div className="flex items-center justify-between gap-2 pb-2">
          <TenantSwitcher
            tenants={tenants as Tenant[]}
            activeId={activeTenantId}
            onSelect={selectTenant}
            onAdd={addTenant}
            onRename={renameTenant}
            onDelete={deleteTenant}
          />
          <div className="flex items-center gap-1">
            {syncStatus !== "synced" && (
              <span
                title={
                  syncStatus === "offline"
                    ? "Çevrimdışı — bağlantı gelince senkronize edilecek"
                    : "Senkronize ediliyor…"
                }
                className="flex items-center px-1.5 text-muted-foreground"
              >
                {syncStatus === "offline" ? (
                  <CloudOff className="size-4 text-signal" />
                ) : (
                  <RefreshCw className="size-4 animate-spin" />
                )}
              </span>
            )}
            <Button
              type="button"
              variant="quiet"
              size="icon"
              onClick={toggleTheme}
              title={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <input
            value={active.title}
            aria-label="Liste adı"
            onInput={(e: Event) =>
              renameActive((e.target as HTMLInputElement).value)
            }
            onBlur={() => {
              if (!active.title.trim()) renameActive(defaultTitle(active.createdAt));
            }}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight outline-none"
          />
          <span className="ledger shrink-0 text-lg">
            <span className={done > 0 ? "text-signal" : "text-muted-foreground"}>
              {String(done).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground">/{String(total).padStart(2, "0")}</span>
          </span>
        </div>

        {/* The tally line fills as the cart fills — the one moving part. */}
        <div className="mt-3 h-px w-full bg-border">
          <div
            className="h-px bg-signal transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-3">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
            <TabsTrigger value="find">Bul</TabsTrigger>
            <TabsTrigger value="nutrition">Besin</TabsTrigger>
            <TabsTrigger value="cats">Kategoriler</TabsTrigger>
          </TabsList>
          <Button
            variant="quiet"
            size="sm"
            onClick={startNewList}
            disabled={active.items.length === 0}
            title="Bu listeyi arşivle ve yenisini başlat"
          >
            <FilePlus2 className="size-3.5" />
            Yeni liste
          </Button>
        </div>
        <div className="-mx-5 h-px bg-border" />
      </header>

      <main className="pt-5">
        <TabsContent value="list">
          <AddItem catalog={catalog} onAdd={addItem} />
          <div className="pt-2">
            <ActiveList
              list={active}
              groupByCategory={groupByCategory}
              categories={mergedCategories}
              overlay={overlay}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectItem}
              onToggleSelectMode={toggleSelectMode}
              onSelectAll={selectAll}
              onSelectCategory={selectCategory}
              onBulkRemove={bulkRemove}
              swipeMode={swipeMode}
              onToggleSwipeMode={toggleSwipeMode}
              onToggle={toggleItem}
              onRemove={removeItem}
              onEdit={editItem}
              onCategorize={categorizeActive}
              onToggleGrouping={toggleGrouping}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <HistoryView lists={past} onReuse={reuseList} />
        </TabsContent>

        <TabsContent value="find">
          <SearchView catalog={catalog} onAdd={addItem} isOnList={isOnList} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionView items={active.items} />
        </TabsContent>

        <TabsContent value="cats">
          <CategoriesView
            merged={mergedCategories}
            overlay={overlay}
            onRename={renameCat}
            onToggleHidden={toggleHidden}
            onMove={moveCat}
            onReorder={reorderCats}
            onAdd={addCategory}
            onRemoveCustom={removeCategory}
          />
        </TabsContent>
      </main>

      {undo && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto mb-5 flex w-[calc(100%-2.5rem)] max-w-[27.5rem] items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg">
          <span className="truncate text-sm">
            {undo.kind === "remove"
              ? `${undo.item.name} kaldırıldı`
              : undo.kind === "bulkRemove"
                ? `${undo.items.length} ürün kaldırıldı`
                : "Bugün için yeni liste başlatıldı"}
          </span>
          <button
            type="button"
            onClick={restore}
            className="ledger shrink-0 text-sm underline underline-offset-4"
          >
            Geri al
          </button>
        </div>
      )}
    </Tabs>
  );
}
