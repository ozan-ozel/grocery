import { useMemo, useState } from "react";
import { LayoutList, Pencil, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { categorize } from "@/lib/categories";
import { parseEntry, type AnyCategoryId, type Item, type List } from "@/lib/store";
import { labelFor, type CategoryOverlay, type MergedCategory } from "@/lib/userCategories";

type Props = {
  list: List;
  groupByCategory: boolean;
  categories: MergedCategory[];
  overlay: CategoryOverlay;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onEdit: (itemId: string, name: string, qty: string, category?: AnyCategoryId) => void;
  onCategorize: () => void;
  onToggleGrouping: () => void;
};

export function ActiveList({
  list,
  groupByCategory,
  categories,
  overlay,
  onToggle,
  onRemove,
  onEdit,
  onCategorize,
  onToggleGrouping,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  // Newest at the top so the item just added is visible without scrolling.
  const sorted = [...list.items].sort((a, b) => b.addedAt - a.addedAt);
  const pending = sorted.filter((i) => !i.checked);
  const done = sorted.filter((i) => i.checked);

  const pendingGrouped = useMemo(
    () => groupItems(pending, categories),
    [pending, groupByCategory, categories] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (list.items.length === 0) {
    return (
      <p className="px-1 py-10 text-sm text-muted-foreground">
        Bu listede henüz bir şey yok. İlk ürünü yukarıdan ekle — yazdıkça
        geçmiş ürünler önerilmeye başlayacak.
      </p>
    );
  }

  const rowProps = {
    editingId,
    categories,
    overlay,
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
          }
        >
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
        {groupByCategory && pending.some((i) => !i.category || i.category === "diger") && (
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={onCategorize}
            title="Kategorisi olmayan ürünleri otomatik ata"
          >
            Otomatik kategorize et
          </Button>
        )}
      </div>

      {groupByCategory ? (
        <div>
          {pendingGrouped.map(({ id, items }) => (
            <section key={id} className="pt-3">
              <div className="flex items-center gap-3 pb-1">
                <span className="ledger text-xs uppercase tracking-widest text-muted-foreground">
                  {labelFor(overlay, id)}
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="ledger text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <ul>
                {items.map((item) => (
                  <Row key={item.id} item={item} {...rowProps} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul>
          {pending.map((item) => (
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
            <span className="ledger text-xs text-muted-foreground">{done.length}</span>
          </div>
          <ul>
            {done.map((item) => (
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
  categories: MergedCategory[]
): { id: AnyCategoryId; items: Item[] }[] {
  const known = new Set<AnyCategoryId>(categories.map((c) => c.id));
  const byId = new Map<AnyCategoryId, Item[]>();
  for (const item of items) {
    // Ignore stored "diger" so improvements to the classifier take effect
    // without the user re-running "Otomatik kategorize et". Non-diger stamps
    // (including custom "u:..." ids) are kept because the user set them.
    const stored = item.category && item.category !== "diger" ? item.category : undefined;
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
    .filter((c) => byId.has(c.id))
    .map((c) => ({ id: c.id, items: byId.get(c.id)! }));
}

type RowProps = {
  item: Item;
  editingId: string | null;
  categories: MergedCategory[];
  overlay: CategoryOverlay;
  onStartEdit: (id: string) => void;
  onFinishEdit: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string, qty: string, category?: AnyCategoryId) => void;
};

function Row({
  item,
  editingId,
  categories,
  onStartEdit,
  onFinishEdit,
  onToggle,
  onRemove,
  onEdit,
}: RowProps) {
  const isEditing = editingId === item.id;

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
    <li className="group flex items-center gap-3 border-b border-border py-3.5">
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        id={`item-${item.id}`}
      />
      <label
        htmlFor={`item-${item.id}`}
        className={cn(
          "flex-1 cursor-pointer select-none text-[0.975rem] transition-colors",
          item.checked && "text-muted-foreground line-through decoration-[1.5px]"
        )}
      >
        {item.name}
      </label>

      {item.qty && (
        <span
          className={cn(
            "ledger text-sm text-muted-foreground",
            item.checked && "line-through"
          )}
        >
          {item.qty}
        </span>
      )}

      {/* Touch devices don't fire :hover, so keep the row actions visible
          there. On pointer devices they still fade in on hover / focus. */}
      <button
        type="button"
        aria-label={`${item.name} düzenle`}
        onClick={() => onStartEdit(item.id)}
        className={cn(
          "rounded p-1 text-muted-foreground transition",
          "hover:text-foreground",
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
        )}
      >
        <Pencil className="size-4" />
      </button>

      <button
        type="button"
        aria-label={`${item.name} kaldır`}
        onClick={() => onRemove(item.id)}
        className={cn(
          "-mr-1 rounded p-1 text-muted-foreground transition",
          "hover:text-signal",
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
        )}
      >
        <X className="size-4" />
      </button>
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
    if (
      finalName === item.name &&
      finalQty === item.qty &&
      !categoryChanged
    ) {
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
          className="ledger rounded-md border border-input px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
        >
          kaydet
        </button>
        <button
          type="button"
          aria-label="İptal"
          onClick={onCancel}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <select
        value={category}
        aria-label="Kategori"
        onChange={(e: Event) =>
          setCategory((e.target as HTMLSelectElement).value as AnyCategoryId)
        }
        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
