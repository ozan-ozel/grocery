import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { relativeDay, type CatalogEntry } from "@/lib/store";
import { isCloseMatch } from "@/lib/fuzzyMatch";

type Props = {
  catalog: CatalogEntry[];
  onAdd: (name: string, qty: string) => void;
  isOnList: (name: string) => boolean;
};

export function SearchView({ catalog, onAdd, isOnList }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return catalog.slice(0, 30);
    const substringMatches = catalog.filter((entry) =>
      entry.name.toLocaleLowerCase("tr-TR").includes(q)
    );
    const fuzzyMatches = catalog.filter(
      (entry) =>
        !substringMatches.includes(entry) &&
        isCloseMatch(q, entry.name.toLocaleLowerCase("tr-TR"))
    );
    return [...substringMatches, ...fuzzyMatches];
  }, [query, catalog]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          placeholder="Aldığın her şeyi ara"
          aria-label="Geçmiş ürünlerde ara"
          className="pl-9"
          onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
        />
      </div>

      <p className="ledger px-1 pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {query.trim() ? `${results.length} sonuç` : "en çok alınan"}
      </p>

      {results.length === 0 ? (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          "{query.trim()}" ile eşleşen bir şey yok. Liste sekmesinden ekle,
          bir sonraki sefer burada görünsün.
        </p>
      ) : (
        <ul>
          {results.map((entry) => {
            const already = isOnList(entry.name);
            return (
              <li
                key={entry.name}
                className="flex items-center gap-3 border-b border-border py-3"
              >
                <span className="flex-1">
                  <span className="block text-[0.975rem]">{entry.name}</span>
                  <span className="ledger text-xs text-muted-foreground">
                    {entry.count} kez alındı · son {relativeDay(entry.lastAt)}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={already}
                  onClick={() => onAdd(entry.name, entry.lastQty)}
                  aria-label={`${entry.name} listeye ekle`}
                  className="ledger flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs transition-colors hover:bg-accent active:bg-accent disabled:border-transparent disabled:text-muted-foreground disabled:hover:bg-transparent"
                >
                  {already ? (
                    "listede"
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      ekle
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
