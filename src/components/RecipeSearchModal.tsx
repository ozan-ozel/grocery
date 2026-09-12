import { useState } from "react";
import { Clock, Search, X } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";

type Props = {
  title: string;
  combos: ScoredCombo[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (combo: ScoredCombo) => void;
};

export function RecipeSearchModal({
  title,
  combos,
  isOpen,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const queryLower = query.trim().toLocaleLowerCase("tr-TR");
  const results = queryLower
    ? combos.filter(combo =>
        combo.nameTr.toLocaleLowerCase("tr-TR").includes(queryLower),
      )
    : combos;

  function resetModal() {
    setQuery("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={resetModal}
            className="p-1 text-muted-foreground hover:text-foreground"
            aria-label="Kapat">
            <X className="size-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Yemek ara..."
            value={query}
            onInput={event =>
              setQuery((event.target as HTMLInputElement).value)
            }
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              &quot;{query.trim()}&quot; ile eşleşen yemek yok
            </div>
          ) : (
            results.map(combo => (
              <button
                key={combo.id}
                type="button"
                onClick={() => {
                  onSelect(combo);
                  resetModal();
                }}
                className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {combo.nameTr}
                  </h4>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {combo.prepMinutes} dk
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {combo.items.length} malzeme · {Math.round(combo.totals.kcal)}{" "}
                  kcal · P: {Math.round(combo.totals.proteinG)}g
                </p>
                {combo.hasSoftConflict && (
                  <p className="mt-1 text-xs text-signal">
                    İçinde hassasiyet listendeki bir besin var
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
