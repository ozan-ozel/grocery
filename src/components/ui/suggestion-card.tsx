import { ChefHat, Undo2 } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";

// Mechanically extracted from TodayView.tsx (originally private to that
// file) so MealPlanView.tsx's evening-recommendation section can render the
// exact same card without a second implementation. `eaten`/`onUndo` are a
// later addition (not part of the original TodayView card) so a single
// pattern's card can flip in place from "recommended" to "already eaten,
// with undo" without moving to a separate section or requiring the caller
// to hunt down the logged ingredients elsewhere to remove them.
export function SuggestionCard({
  combo,
  preparing,
  added,
  overBudgetBy,
  onAdd,
  onRemove,
  onTogglePreparing,
  onEat,
  eaten,
  onUndo,
}: {
  combo: ScoredCombo;
  preparing: boolean;
  added: boolean;
  // Only set for "Diğer kombinasyonlar" entries that don't fit today's
  // remaining kcal — how far over, so it reads as an honest heads-up
  // rather than hiding why it wasn't in the top suggestions.
  overBudgetBy?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  onTogglePreparing?: () => void;
  onEat?: () => void;
  // When true, renders this same card in its eaten state (real logged
  // totals, single "Geri al" action) instead of the normal recommendation
  // actions. onAdd/onRemove/onTogglePreparing/onEat are ignored in this
  // state — only onUndo is called.
  eaten?: boolean;
  onUndo?: () => void;
}) {
  // Both states share the exact same box model (1px frame + p-3 content) so
  // toggling "Hazırlanıyor" only swaps backgrounds, never the layout — a
  // gradient border of a different thickness than the plain one would shift
  // the card size on toggle. The background wash is signal-only (not the
  // border's primary→signal blend) and low-opacity so it reads as a subtle
  // tint rather than a loud color in every theme, light or dark, without
  // touching text contrast. Eaten reuses that same signal-tinted wash
  // permanently (no toggle) — same visual language TodayView's separate
  // "Bugün yediklerin" section already used for "this was eaten."
  const content = (
    <div
      className={`rounded-[calc(0.5rem-1px)] bg-background p-3 ${
        eaten
          ? "bg-signal/10"
          : preparing
            ? "bg-gradient-to-br from-signal/10 to-transparent"
            : ""
      }`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{combo.nameTr}</span>
        <span className="text-xs text-muted-foreground">
          {combo.prepMinutes} dk
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {Math.round(combo.totals.kcal)} kcal ·{" "}
        {Math.round(combo.totals.proteinG)}g protein
      </p>
      {combo.prepNote && (
        <p className="mt-1 text-xs text-muted-foreground">{combo.prepNote}</p>
      )}
      {!!overBudgetBy && overBudgetBy > 0 && (
        <p className="mt-1 text-xs text-signal">
          Kalan makronun {Math.round(overBudgetBy)} kcal üzerinde
        </p>
      )}
      {eaten ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-signal">Bugün yedin</span>
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs">
            <Undo2 className="size-3.5" />
            Geri al
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={added}
            onClick={added ? onRemove : onAdd}
            className={`rounded-md border px-2 py-1 text-xs ${
              added ? "border-signal/70 bg-signal/10 text-signal" : "border-border"
            }`}>
            {added ? "Listeden çıkar" : "Listeye ekle"}
          </button>
          <button
            type="button"
            aria-pressed={preparing}
            onClick={onTogglePreparing}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
              preparing ? "border-signal bg-signal/10" : "border-border"
            }`}>
            <ChefHat className="size-3.5" />
            Hazırlanıyor
          </button>
          <button
            type="button"
            onClick={onEat}
            className="rounded-md border border-border px-2 py-1 text-xs">
            Yedim
          </button>
        </div>
      )}
    </div>
  );

  return (
    <li>
      <div className={`rounded-lg p-px ${!eaten && preparing ? "gradient-edge" : "bg-border"}`}>
        {content}
      </div>
    </li>
  );
}
