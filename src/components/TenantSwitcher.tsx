import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/lib/store";

type Props = {
  tenants: Tenant[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function TenantSwitcher({
  tenants,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const active = tenants.find((t) => t.id === activeId) ?? tenants[0];

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setDraft("");
        setEditingId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setAdding(false);
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function commitAdd() {
    const name = draft.trim();
    if (!name) {
      setAdding(false);
      setDraft("");
      return;
    }
    onAdd(name);
    setDraft("");
    setAdding(false);
  }

  function commitRename(id: string) {
    const name = editDraft.trim();
    if (name) onRename(id, name);
    setEditingId(null);
    setEditDraft("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Ev seç"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ledger flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="max-w-[10ch] truncate">{active?.name ?? "Ev"}</span>
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-64 origin-top-right overflow-hidden rounded-md border border-border bg-card shadow-lg transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          <ul className="max-h-64 overflow-y-auto py-1">
            {tenants.map((t) => {
              const isActive = t.id === activeId;
              const isEditing = editingId === t.id;
              return (
                <li key={t.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        autoFocus
                        value={editDraft}
                        onInput={(e: Event) =>
                          setEditDraft((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === "Enter") commitRename(t.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => commitRename(t.id)}
                        className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-foreground"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 text-sm",
                        isActive ? "bg-accent" : "hover:bg-accent"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(t.id);
                          setOpen(false);
                        }}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <Check
                          className={cn(
                            "size-3.5",
                            isActive ? "text-foreground" : "text-transparent"
                          )}
                        />
                        <span className="truncate">{t.name}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`${t.name} yeniden adlandır`}
                        onClick={() => {
                          setEditingId(t.id);
                          setEditDraft(t.name);
                        }}
                        className="rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {tenants.length > 1 && (
                        <button
                          type="button"
                          aria-label={`${t.name} sil`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `"${t.name}" evini ve tüm listelerini silmek istediğine emin misin?`
                              )
                            ) {
                              onDelete(t.id);
                            }
                          }}
                          className="rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-signal"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="border-t border-border">
            {adding ? (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <input
                  autoFocus
                  value={draft}
                  placeholder="Ev adı"
                  onInput={(e: Event) =>
                    setDraft((e.target as HTMLInputElement).value)
                  }
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") commitAdd();
                    if (e.key === "Escape") {
                      setAdding(false);
                      setDraft("");
                    }
                  }}
                  onBlur={commitAdd}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-foreground"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Yeni ev ekle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
