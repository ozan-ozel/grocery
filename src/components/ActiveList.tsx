import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  LayoutList,
  MoreHorizontal,
  Pencil,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { categorize } from "@/lib/categories";
import {
  parseEntry,
  type AnyCategoryId,
  type Item,
  type List,
} from "@/lib/store";
import {
  labelFor,
  type CategoryOverlay,
  type MergedCategory,
} from "@/lib/userCategories";

type Props = {
  list: List;
  groupByCategory: boolean;
  categories: MergedCategory[];
  overlay: CategoryOverlay;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (itemId: string) => void;
  onToggleSelectMode: () => void;
  onSelectAll: () => void;
  onSelectCategory: (itemIds: string[], selected: boolean) => void;
  onBulkRemove: () => void;
  swipeMode: boolean;
  onToggleSwipeMode: () => void;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onEdit: (
    itemId: string,
    name: string,
    qty: string,
    category?: AnyCategoryId,
  ) => void;
  onCategorize: () => void;
  onToggleGrouping: () => void;
};

export function ActiveList({
  list,
  groupByCategory,
  categories,
  overlay,
  selectMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectMode,
  onSelectAll,
  onSelectCategory,
  onBulkRemove,
  swipeMode,
  onToggleSwipeMode,
  onToggle,
  onRemove,
  onEdit,
  onCategorize,
  onToggleGrouping,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  // Newest at the top so the item just added is visible without scrolling.
  const sorted = [...list.items].sort((a, b) => b.addedAt - a.addedAt);
  const pending = sorted.filter(i => !i.checked);
  const done = sorted.filter(i => i.checked);

  const pendingGrouped = useMemo(
    () => groupItems(pending, categories),
    [pending, groupByCategory, categories], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (list.items.length === 0) {
    return (
      <p className="px-1 py-10 text-sm text-muted-foreground">
        Bu listede henüz bir şey yok. İlk ürünü yukarıdan ekle — yazdıkça geçmiş
        ürünler önerilmeye başlayacak.
      </p>
    );
  }

  const rowProps = {
    editingId,
    categories,
    overlay,
    selectMode,
    selectedIds,
    onToggleSelect,
    swipeMode,
    onStartEdit: (id: string) => setEditingId(id),
    onFinishEdit: () => setEditingId(null),
    onToggle,
    onRemove,
    onEdit,
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 pb-2">
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={onToggleGrouping}
          title={
            groupByCategory
              ? "Düz listeye geri dön"
              : "Ürünleri kategorilere göre grupla"
          }>
          {groupByCategory ? (
            <>
              <LayoutList className="size-3.5" />
              Düz liste
            </>
          ) : (
            <>
              <Tags className="size-3.5" />
              Kategorilere göre grupla
            </>
          )}
        </Button>
        <div className="flex items-center gap-2">
          {groupByCategory &&
            pending.some(i => !i.category || i.category === "diger") && (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                onClick={onCategorize}
                title="Kategorisi olmayan ürünleri otomatik ata">
                Otomatik kategorize et
              </Button>
            )}

          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              title="Toplu işlemler">
              <MoreHorizontal className="size-4" />
            </Button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[9rem] origin-top-right rounded-md border border-border bg-card py-1 shadow-md transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectAll();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent">
                  Hepsini Seç
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={swipeMode}
                  onClick={() => {
                    onToggleSwipeMode();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent">
                  Kaydırma hareketleri
                  {swipeMode && <Check className="size-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          selectMode ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!selectMode}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "flex items-center justify-end gap-2 pb-2 transition-opacity duration-200",
              selectMode ? "opacity-100 delay-100" : "pointer-events-none opacity-0",
            )}
          >
            {selectedIds.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onBulkRemove}>
                <Trash2 className="size-3.5" />
                Sil ({selectedIds.size})
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onToggleSelectMode}>
              İptal
            </Button>
          </div>
        </div>
      </div>

      {groupByCategory ? (
        <div>
          {pendingGrouped.map(({ id, items }) => {
            const selectedCount = items.filter(i =>
              selectedIds.has(i.id),
            ).length;
            const catChecked =
              selectedCount === 0
                ? false
                : selectedCount === items.length
                  ? true
                  : "indeterminate";
            const CategoryIcon = categories.find(c => c.id === id)?.icon;
            return (
              <section key={id} className="pt-3">
                <div className="flex items-center gap-3 pb-1">
                  {selectMode && (
                    <Checkbox
                      checked={catChecked}
                      onCheckedChange={() =>
                        onSelectCategory(
                          items.map(i => i.id),
                          selectedCount !== items.length,
                        )
                      }
                      aria-label={`${labelFor(overlay, id)} kategorisini seç`}
                      className="starting:scale-75 starting:opacity-0 transition-[transform,opacity] duration-200"
                    />
                  )}
                  {CategoryIcon && (
                    <CategoryIcon
                      aria-hidden="true"
                      className="size-3.5 text-muted-foreground"
                    />
                  )}
                  <span className="ledger text-xs uppercase tracking-widest text-muted-foreground">
                    {labelFor(overlay, id)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="ledger text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <ul>
                  {items.map(item => (
                    <Row key={item.id} item={item} {...rowProps} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul>
          {pending.map(item => (
            <Row key={item.id} item={item} {...rowProps} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <div className="flex items-center gap-3 pb-1 pt-6">
            <span className="ledger text-xs uppercase tracking-widest text-muted-foreground">
              sepette
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="ledger text-xs text-muted-foreground">
              {done.length}
            </span>
          </div>
          <ul>
            {done.map(item => (
              <Row key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function groupItems(
  items: Item[],
  categories: MergedCategory[],
): { id: AnyCategoryId; items: Item[] }[] {
  const known = new Set<AnyCategoryId>(categories.map(c => c.id));
  const byId = new Map<AnyCategoryId, Item[]>();
  for (const item of items) {
    // Ignore stored "diger" so improvements to the classifier take effect
    // without the user re-running "Otomatik kategorize et". Non-diger stamps
    // (including custom "u:..." ids) are kept because the user set them.
    const stored =
      item.category && item.category !== "diger" ? item.category : undefined;
    let id: AnyCategoryId = stored ?? categorize(item.name);
    // If the stored id points at a category that no longer exists (deleted
    // custom, or came in from an older shape), fall back to a fresh guess so
    // the item never disappears from the grouped view.
    if (!known.has(id)) {
      const guess = categorize(item.name);
      id = known.has(guess) ? guess : "diger";
    }
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id)!.push(item);
  }
  // Follow the user's merged category order. Hidden categories still show up
  // if they hold items so nothing gets orphaned.
  return categories
    .filter(c => byId.has(c.id))
    .map(c => ({ id: c.id, items: byId.get(c.id)! }));
}

type RowProps = {
  item: Item;
  editingId: string | null;
  categories: MergedCategory[];
  overlay: CategoryOverlay;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  swipeMode: boolean;
  onStartEdit: (id: string) => void;
  onFinishEdit: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (
    id: string,
    name: string,
    qty: string,
    category?: AnyCategoryId,
  ) => void;
};

const SWIPE_MAX = 88;
const SWIPE_THRESHOLD = 56;

function Row({
  item,
  editingId,
  categories,
  selectMode,
  selectedIds,
  onToggleSelect,
  swipeMode,
  onStartEdit,
  onFinishEdit,
  onToggle,
  onRemove,
  onEdit,
}: RowProps) {
  const isEditing = editingId === item.id;
  const swipeActive = swipeMode && !selectMode;

  const [dragX, setDragX] = useState(0);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef<"x" | "y" | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  function onPointerDown(e: PointerEvent) {
    if (!swipeActive) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input")) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    axisRef.current = null;
    pointerIdRef.current = e.pointerId;
  }

  function onPointerMove(e: PointerEvent) {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (axisRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axisRef.current === "x") {
        draggingRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    }
    if (axisRef.current !== "x") return;
    e.preventDefault();
    setDragX(Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx)));
  }

  function onPointerUp(e: PointerEvent) {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    if (draggingRef.current) {
      if (dragX >= SWIPE_THRESHOLD) onToggle(item.id);
      else if (dragX <= -SWIPE_THRESHOLD) onRemove(item.id);
    }
    draggingRef.current = false;
    axisRef.current = null;
    setDragX(0);
  }

  if (isEditing) {
    return (
      <li className="border-b border-border py-2">
        <EditRow
          item={item}
          categories={categories}
          onCancel={onFinishEdit}
          onSave={(name, qty, category) => {
            onEdit(item.id, name, qty, category);
            onFinishEdit();
          }}
        />
      </li>
    );
  }

  return (
    <li className="group relative flex items-stretch border-b border-border">
      <div className="relative min-w-0 flex-1 overflow-hidden">
        {swipeActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between text-background">
            <div
              className={cn(
                "flex h-full flex-1 items-center bg-foreground pl-4 transition-opacity duration-100",
                dragX > 8 ? "opacity-100" : "opacity-0",
              )}>
              <Check className="size-5" />
            </div>
            <div
              className={cn(
                "flex h-full flex-1 items-center justify-end bg-signal pr-4 transition-opacity duration-100",
                dragX < -8 ? "opacity-100" : "opacity-0",
              )}>
              <Trash2 className="size-5" />
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex items-center gap-3 bg-background py-3.5",
            swipeActive && "touch-pan-y pr-3",
          )}
          onPointerDown={swipeActive ? (onPointerDown as never) : undefined}
          onPointerMove={swipeActive ? (onPointerMove as never) : undefined}
          onPointerUp={swipeActive ? (onPointerUp as never) : undefined}
          onPointerCancel={swipeActive ? (onPointerUp as never) : undefined}
          style={{
            transform: dragX ? `translateX(${dragX}px)` : undefined,
            transition: draggingRef.current ? "none" : "transform 200ms ease-out",
          }}>
          {selectMode && (
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => onToggleSelect(item.id)}
              id={`select-${item.id}`}
              aria-label={`${item.name} seç`}
              className="border-1 starting:scale-75 starting:opacity-0 border-dashed border-signal bg-signal/15 transition-[transform,opacity] duration-200 data-[state=checked]:border-signal data-[state=checked]:bg-signal"
            />
          )}
          <Checkbox
            checked={item.checked}
            onCheckedChange={() => onToggle(item.id)}
            id={`item-${item.id}`}
          />
          <label
            htmlFor={`item-${item.id}`}
            className={cn(
              "flex-1 cursor-pointer select-none text-[0.975rem] transition-colors",
              item.checked &&
                "text-muted-foreground line-through decoration-[1.5px]",
            )}>
            {item.name}
          </label>

          {item.qty && (
            <span
              className={cn(
                "ledger text-sm text-muted-foreground",
                item.checked && "line-through",
              )}>
              {item.qty}
            </span>
          )}

          {/* Touch devices don't fire :hover, so keep the row actions visible
              there. On pointer devices they still fade in on hover / focus.
              Hidden in select mode so a stray tap can't edit/remove instead
              of toggling selection. In swipe mode both move to a pinned
              column outside the draggable area — see below — since a
              control that translates with the drag is unreliable to tap. */}
          {!selectMode && !swipeMode && (
            <>
              <button
                type="button"
                aria-label={`${item.name} düzenle`}
                onClick={() => onStartEdit(item.id)}
                className={cn(
                  "rounded p-1 text-muted-foreground transition",
                  "hover:text-foreground",
                  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
                )}>
                <Pencil className="size-4" />
              </button>

              <button
                type="button"
                aria-label={`${item.name} kaldır`}
                onClick={() => onRemove(item.id)}
                className={cn(
                  "-mr-1 rounded p-1 text-muted-foreground transition",
                  "hover:text-signal",
                  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
                )}>
                <X className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {swipeActive && (
        <>
          <div className="my-2 w-px shrink-0 bg-border" />
          <button
            type="button"
            aria-label={`${item.name} düzenle`}
            onClick={() => onStartEdit(item.id)}
            className="flex shrink-0 items-center px-3 text-muted-foreground transition hover:text-foreground">
            <Pencil className="size-4" />
          </button>
        </>
      )}
    </li>
  );
}

function EditRow({
  item,
  categories,
  onSave,
  onCancel,
}: {
  item: Item;
  categories: MergedCategory[];
  onSave: (name: string, qty: string, category?: AnyCategoryId) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty);
  // Default the dropdown to the item's stored category, or the auto-guess if
  // nothing's been stamped yet, so the shown value matches the grouped view.
  const initialCategory: AnyCategoryId =
    (item.category && item.category !== "diger" ? item.category : undefined) ??
    categorize(item.name);
  const [category, setCategory] = useState<AnyCategoryId>(initialCategory);

  function commit() {
    const trimmed = name.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    // Reuse the same parser as add-item so someone editing "domates" to
    // "domates 500g" gets the qty split off automatically.
    const parsed = parseEntry(trimmed);
    const finalName = parsed.name || trimmed;
    const finalQty = parsed.qty || qty.trim();
    const categoryChanged = category !== initialCategory;
    if (finalName === item.name && finalQty === item.qty && !categoryChanged) {
      onCancel();
      return;
    }
    // Only send an explicit category when the user actually touched the
    // dropdown, so name-only edits keep the current stamp-preservation logic.
    onSave(finalName, finalQty, categoryChanged ? category : undefined);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={name}
          aria-label="Ürün adı"
          onInput={(e: Event) => setName((e.target as HTMLInputElement).value)}
          onKeyDown={onKeyDown as never}
          className="flex-1 rounded border border-input bg-background px-2 py-1.5 text-[0.975rem] outline-none focus:border-foreground"
        />
        <input
          value={qty}
          aria-label="Miktar"
          placeholder="miktar"
          onInput={(e: Event) => setQty((e.target as HTMLInputElement).value)}
          onKeyDown={onKeyDown as never}
          className="ledger w-20 rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
        />
        <button
          type="button"
          onClick={commit}
          className="ledger rounded-md border border-input px-2.5 py-1.5 text-xs transition-colors hover:bg-accent">
          kaydet
        </button>
        <button
          type="button"
          aria-label="İptal"
          onClick={onCancel}
          className="rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      <select
        value={category}
        aria-label="Kategori"
        onChange={(e: Event) =>
          setCategory((e.target as HTMLSelectElement).value as AnyCategoryId)
        }
        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground">
        {categories.map(c => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
