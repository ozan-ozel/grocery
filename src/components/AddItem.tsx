import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseEntry, type CatalogEntry } from "@/lib/store";

type Props = {
  catalog: CatalogEntry[];
  onAdd: (name: string, qty: string) => void;
};

export function AddItem({ catalog, onAdd }: Props) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggest from what has actually been bought before, most-bought first.
  // Turkish-aware casing so "İzmir"/"izmir" and "ŞEKER"/"şeker" match.
  const suggestions = useMemo(() => {
    const q = parseEntry(value).name.toLocaleLowerCase("tr-TR").trim();
    if (!q) return [];
    return catalog
      .filter((entry) => entry.name.toLocaleLowerCase("tr-TR").includes(q))
      .filter((entry) => entry.name.toLocaleLowerCase("tr-TR") !== q)
      .slice(0, 5);
  }, [value, catalog]);

  function commit(raw: string, qtyHint?: string) {
    const { name, qty } = parseEntry(raw);
    if (!name) return;
    onAdd(name, qty || qtyHint || "");
    setValue("");
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = suggestions[active];
      // Read the element directly: a fast typist can hit Enter before
      // the controlled value has flushed back through state.
      if (picked) commit(picked.name, picked.lastQty);
      else commit((e.target as HTMLInputElement).value);
    } else if (e.key === "Escape") {
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Plus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          placeholder="Ürün ekle"
          aria-label="Ürün ekle"
          autoComplete="off"
          className="pl-9"
          onInput={(e: Event) => {
            setValue((e.target as HTMLInputElement).value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown as never}
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full origin-top overflow-hidden rounded-md border border-border bg-card shadow-sm transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          {suggestions.map((entry, i) => (
            <li key={entry.name}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(entry.name, entry.lastQty)}
                className={cn(
                  "flex w-full items-baseline justify-between px-3 py-2.5 text-left text-sm transition-colors",
                  i === active ? "bg-accent" : "bg-transparent"
                )}
              >
                <span>{entry.name}</span>
                <span className="ledger text-xs text-muted-foreground">
                  {entry.lastQty && <span className="mr-2">{entry.lastQty}</span>}
                  &times;{entry.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
