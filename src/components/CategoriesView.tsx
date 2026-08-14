import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  isCustomId,
  type AnyCategoryId,
  type CategoryOverlay,
  type MergedCategory,
} from "@/lib/userCategories";

type Props = {
  merged: MergedCategory[];
  overlay: CategoryOverlay;
  onRename: (id: AnyCategoryId, label: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onMove: (id: AnyCategoryId, direction: "up" | "down") => void;
  onAdd: (label: string) => void;
  onRemoveCustom: (id: string) => void;
};

export function CategoriesView({
  merged,
  onRename,
  onToggleHidden,
  onMove,
  onAdd,
  onRemoveCustom,
}: Props) {
  const [editingId, setEditingId] = useState<AnyCategoryId | null>(null);
  const [newLabel, setNewLabel] = useState("");

  function commitNew() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewLabel("");
  }

  return (
    <div>
      <p className="pb-3 text-sm text-muted-foreground">
        Kategorileri yeniden adlandır, sırala veya gizle. Kendi kategorilerini
        ekleyebilirsin. Otomatik kategorize etme yalnızca yerleşik kategorilere
        atar; kendi kategorilerini elle seçmen gerekir.
      </p>

      <ul>
        {merged.map((c, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === merged.length - 1;
          const isEditing = editingId === c.id;
          return (
            <li
              key={c.id}
              className={cn(
                "flex items-center gap-2 border-b border-border py-2.5",
                c.hidden && !isEditing && "opacity-60"
              )}
            >
              {isEditing ? (
                <RenameRow
                  initial={c.label}
                  onCancel={() => setEditingId(null)}
                  onSave={(label) => {
                    onRename(c.id, label);
                    setEditingId(null);
                  }}
                />
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-[0.975rem]">
                    {c.label}
                  </span>

                  <button
                    type="button"
                    aria-label={`${c.label} yukarı taşı`}
                    disabled={isFirst}
                    onClick={() => onMove(c.id, "up")}
                    className="rounded p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`${c.label} aşağı taşı`}
                    disabled={isLast}
                    onClick={() => onMove(c.id, "down")}
                    className="rounded p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={`${c.label} yeniden adlandır`}
                    onClick={() => setEditingId(c.id)}
                    className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>

                  {c.builtin ? (
                    <button
                      type="button"
                      aria-label={c.hidden ? `${c.label} göster` : `${c.label} gizle`}
                      onClick={() => onToggleHidden(c.id as string, !c.hidden)}
                      className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {c.hidden ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`${c.label} sil`}
                      onClick={() => {
                        if (isCustomId(c.id)) onRemoveCustom(c.id as string);
                      }}
                      className="rounded p-1 text-muted-foreground transition hover:text-signal"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-2 pt-4">
        <input
          value={newLabel}
          aria-label="Yeni kategori adı"
          placeholder="Yeni kategori"
          onInput={(e: Event) => setNewLabel((e.target as HTMLInputElement).value)}
          onKeyDown={((e: KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitNew();
            }
          }) as never}
          className="flex-1 rounded border border-input bg-background px-2 py-1.5 text-[0.975rem] outline-none focus:border-foreground"
        />
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={commitNew}
          disabled={!newLabel.trim()}
        >
          <Plus className="size-3.5" />
          Ekle
        </Button>
      </div>
    </div>
  );
}

function RenameRow({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (label: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    if (trimmed === initial) {
      onCancel();
      return;
    }
    onSave(trimmed);
  }

  return (
    <div className="flex flex-1 items-center gap-2">
      <input
        autoFocus
        value={value}
        aria-label="Kategori adı"
        onInput={(e: Event) => setValue((e.target as HTMLInputElement).value)}
        onKeyDown={((e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }) as never}
        className="flex-1 rounded border border-input bg-background px-2 py-1.5 text-[0.975rem] outline-none focus:border-foreground"
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
  );
}
