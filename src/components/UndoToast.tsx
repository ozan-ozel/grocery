import type { Undo } from "@/hooks/useUndo";
import { SwipeToast } from "@/components/ui/swipe-toast";

type Props = {
  undo: Undo;
  onRestore: () => void;
  onDismiss: () => void;
};

function undoMessage(undo: Undo): string {
  switch (undo.kind) {
    case "remove":
      return `${undo.item.name} kaldırıldı`;
    case "bulkRemove":
      return `${undo.items.length} ürün kaldırıldı`;
    case "deleteList":
      return `${undo.list.title} silindi`;
    default:
      return "Bugün için yeni liste başlatıldı";
  }
}

export function UndoToast({ undo, onRestore, onDismiss }: Props) {
  return (
    <SwipeToast message={undoMessage(undo)} onAction={onRestore} onDismiss={onDismiss} />
  );
}
