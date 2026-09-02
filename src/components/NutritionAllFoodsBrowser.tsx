import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { browseNutritionCached, type Nutrition } from "@/lib/nutrition";
import { Input } from "@/components/ui/input";
import { Cell } from "@/components/NutritionTableCell";

type BrowseStatus = "idle" | "loading" | "ready" | "error";
const BROWSE_LIMIT = 60;

// Browses/searches the whole nutrition table, independent of the active
// list. Same interaction as the Alışveriş > Liste tab's "Ürün ekle" input —
// icon inside the input, no separate search button, live as you type — but
// this one is backed by the DB instead of an already-loaded local catalog,
// so typing is debounced (300ms) to avoid firing a request per keystroke.
export function AllFoodsBrowser() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Nutrition[]>([]);
  const [status, setStatus] = useState<BrowseStatus>("idle");
  // True once a page comes back shorter than BROWSE_LIMIT — the signal that
  // there's nothing left to page in for the current query.
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const handle = window.setTimeout(() => {
      browseNutritionCached(query, BROWSE_LIMIT)
        .then((next) => {
          if (cancelled) return;
          setRows(next);
          setHasMore(next.length === BROWSE_LIMIT);
          setStatus("ready");
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn(
            "[nutrition] browse failed — if you're running locally, npm run netlify:dev serves /api/*, npm run dev does not:",
            err
          );
          setStatus("error");
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  function loadMore() {
    setLoadingMore(true);
    browseNutritionCached(query, BROWSE_LIMIT, rows.length)
      .then((next) => {
        setRows((prev) => [...prev, ...next]);
        setHasMore(next.length === BROWSE_LIMIT);
      })
      .catch((err) => {
        console.warn("[nutrition] browse (load more) failed:", err);
        setHasMore(false);
      })
      .finally(() => setLoadingMore(false));
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          aria-label="Besin ara"
          placeholder="Besin ara"
          className="pl-9"
          onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)}
        />
      </div>

      <p className="ledger px-1 pb-1 pt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {query.trim() ? `${rows.length} sonuç` : "alfabetik"}
      </p>

      {status === "loading" && rows.length === 0 && (
        <p className="px-1 py-8 text-sm text-muted-foreground">Yükleniyor…</p>
      )}
      {status === "ready" && rows.length === 0 && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          {query.trim()
            ? `"${query.trim()}" ile eşleşen besin yok.`
            : "Henüz kayıtlı besin yok."}
        </p>
      )}
      {status === "error" && (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          Besin verilerine ulaşılamadı. Bağlantını kontrol edip tekrar dene.
        </p>
      )}

      {rows.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pr-2 text-left font-normal">Ürün</th>
              <th className="py-2 px-1 text-right font-normal">kcal</th>
              <th className="py-2 px-1 text-right font-normal">P</th>
              <th className="py-2 px-1 text-right font-normal">Y</th>
              <th className="py-2 px-1 text-right font-normal">K</th>
              <th className="py-2 px-1 text-right font-normal">L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.name_tr} className="border-b border-border/60">
                <td className="py-2 pr-2">{n.name_tr}</td>
                <Cell value={n.kcal_per_100} />
                <Cell value={n.protein_g} />
                <Cell value={n.fat_g} />
                <Cell value={n.carbs_g} />
                <Cell value={n.fiber_g} />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-3 w-full rounded-md border border-border py-2 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          {loadingMore ? "Yükleniyor…" : "Daha fazla göster"}
        </button>
      )}
    </div>
  );
}
