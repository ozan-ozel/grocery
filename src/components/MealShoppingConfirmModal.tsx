import { Button } from "@/components/ui/button";

type Props = {
  mode: "add" | "remove";
  items: Array<{ name: string; qty: string }>;
  onConfirm: () => void;
  onCancel: () => void;
};

export function MealShoppingConfirmModal({
  mode,
  items,
  onConfirm,
  onCancel,
}: Props) {
  const title =
    mode === "add"
      ? "Alışveriş listesine eklensin mi?"
      : "Alışveriş listesinden çıkarılsın mı?";
  const confirmLabel = mode === "add" ? "Listeye ekle" : "Listeden çıkar";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Vazgeç"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/20"
      />
      <div className="relative z-10 w-full max-w-[22rem] rounded-xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-base font-semibold">{title}</h2>
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
          {items.map(item => (
            <li
              key={item.name}
              className="flex items-baseline justify-between gap-2">
              <span className="truncate">{item.name}</span>
              <span className="ledger shrink-0 text-xs text-muted-foreground">
                {item.qty}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
            Vazgeç
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
