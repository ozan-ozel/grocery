import type { Undo } from "@/hooks/useUndo";

type Props = {
  undo: Undo;
  onRestore: () => void;
};

export function UndoToast({ undo, onRestore }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto mb-5 flex w-[calc(100%-2.5rem)] max-w-[27.5rem] items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg">
      <span className="truncate text-sm">
        {undo.kind === "remove"
          ? `${undo.item.name} kaldırıldı`
          : undo.kind === "bulkRemove"
            ? `${undo.items.length} ürün kaldırıldı`
            : undo.kind === "deleteList"
              ? `${undo.list.title} silindi`
              : "Bugün için yeni liste başlatıldı"}
      </span>
      <button
        type="button"
        onClick={onRestore}
        className="ledger shrink-0 text-sm underline underline-offset-4"
      >
        Geri al
      </button>
    </div>
  );
}
