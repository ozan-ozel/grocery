import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseEntry, type CatalogEntry } from "@/lib/store";
import { isCloseMatch } from "@/lib/fuzzyMatch";

type Props = {
  catalog: CatalogEntry[];
  onAdd: (name: string, qty: string) => void;
  isOnList: (name: string) => boolean;
};

// Collapsed default list length when the input is empty (catalog is already
// sorted most-bought-first — see mergeNearDuplicates in store.ts — so this
// is "en çok alınan"). "Tümünü göster" expands it to this same cap the old
// standalone Bul tab used, so browsing the full catalog is still possible.
const DEFAULT_SUGGESTIONS = 6;
const EXPANDED_SUGGESTIONS = 30;

export function AddItem({ catalog, onAdd, isOnList }: Props) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Turkish-aware casing so "İzmir"/"izmir" and "ŞEKER"/"şeker" match.
  // Substring matches come first; a typo like "maydonoz" isn't a substring
  // of "Maydanoz", so close-but-not-substring matches are appended after,
  // letting the user pick the correct spelling before it's ever committed
  // as a new item.
  const query = parseEntry(value).name.toLocaleLowerCase("tr-TR").trim();
  const matches = useMemo(() => {
    if (!query) return catalog;
    const substringMatches = catalog.filter((entry) =>
      entry.name.toLocaleLowerCase("tr-TR").includes(query)
    );
    const fuzzyMatches = catalog.filter(
      (entry) =>
        !substringMatches.includes(entry) &&
        isCloseMatch(query, entry.name.toLocaleLowerCase("tr-TR"))
    );
    return [...substringMatches, ...fuzzyMatches].filter(
      (entry) => entry.name.toLocaleLowerCase("tr-TR") !== query
    );
  }, [query, catalog]);

  const visibleCount = query || expanded ? EXPANDED_SUGGESTIONS : DEFAULT_SUGGESTIONS;
  const suggestions = matches.slice(0, visibleCount);

  function commit(raw: string, qtyHint?: string) {
    const { name, qty } = parseEntry(raw);
    if (!name) return;
    onAdd(name, qty || qtyHint || "");
    setValue("");
    setActive(-1);
    setExpanded(false);
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
      setOpen(false);
      inputRef.current?.blur();
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
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Deferred so a suggestion's onMouseDown (which already
            // prevented default) still lands as a click before this closes
            // the list out from under it.
            window.setTimeout(() => setOpen(false), 0);
          }}
          onInput={(e: Event) => {
            setValue((e.target as HTMLInputElement).value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown as never}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full origin-top overflow-hidden rounded-md border border-border bg-card shadow-sm transition-[opacity,transform] duration-150 starting:scale-95 starting:opacity-0">
          {!query && (
            <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-widest text-muted-foreground">
              En çok alınan
            </p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {suggestions.map((entry, i) => {
              const already = isOnList(entry.name);
              return (
                <li key={entry.name}>
                  <button
                    type="button"
                    disabled={already}
                    onMouseDown={(e: Event) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(entry.name, entry.lastQty)}
                    className={cn(
                      "flex w-full items-baseline justify-between px-3 py-2.5 text-left text-sm transition-colors",
                      already
                        ? "text-muted-foreground"
                        : i === active
                          ? "bg-accent"
                          : "bg-transparent active:bg-accent"
                    )}>
                    <span>{entry.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {already ? (
                        "listede"
                      ) : (
                        <>
                          {entry.lastQty && (
                            <span className="mr-2">{entry.lastQty}</span>
                          )}
                          &times;{entry.count}
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!query && !expanded && matches.length > DEFAULT_SUGGESTIONS && (
            <button
              type="button"
              onMouseDown={(e: Event) => e.preventDefault()}
              onClick={() => setExpanded(true)}
              className="w-full border-t border-border px-3 py-2 text-center text-xs text-muted-foreground hover:text-foreground">
              Tümünü göster
            </button>
          )}
        </div>
      )}
    </div>
  );
}
