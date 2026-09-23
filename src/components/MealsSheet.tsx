import { useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2 } from "lucide-react";
import type { ScoredCombo } from "@/lib/comboMatch";
import { recipeSteps, type Combo, type PortionId } from "@/lib/combos";
import { recommendMeals } from "@/lib/mealRecommend";
import type { MealSlot } from "@/lib/mealPlan";
import type { MacroTotals } from "@/lib/mealNutrition";
import { loadMealPortion, saveMealPortion } from "@/lib/preferences";
import type { Nutrition, NutritionMap } from "@/lib/nutrition";
import type { FoodExclusion, AllergenClassExclusion } from "@/lib/foodExclusions";
import {
  annotateSavedMeals,
  savedMealToCombo,
  type NewSavedMeal,
  type SavedMeal,
} from "@/lib/savedMeals";
import { uid } from "@/lib/store";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SmoothPillTabs } from "@/components/ui/smooth-pill";
import { LoadingBlock } from "@/components/LoadingBlock";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MealRow } from "@/components/MealRow";
import { SavedMealForm, type SavedMealFormData } from "@/components/SavedMealForm";

type Tab = "mine" | "ready" | "recipes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // The meal slot the sheet was opened for; null while closed.
  slot: MealSlot | null;
  // Every built-in meal, hard-exclusions already dropped (scoreAllCombos output).
  combos: ScoredCombo[];
  catalog: NutritionMap;
  foods: Nutrition[];
  exclusions: FoodExclusion[];
  allergenExclusions: AllergenClassExclusion[];
  // "Sana uygun" inputs: the viewed day's remaining macros, which slots already
  // have entries, and whether the targets are only an estimate (no saved profile).
  remaining: MacroTotals;
  filledSlots: ReadonlySet<MealSlot>;
  targetsEstimated: boolean;
  // Yemeklerim. `canSaveMeals` is false until there is a signed-in user.
  canSaveMeals: boolean;
  savedMeals: SavedMeal[];
  savedLoading: boolean;
  onCreateSaved: (input: NewSavedMeal) => Promise<SavedMeal | null>;
  onUpdateSaved: (id: string, input: Omit<NewSavedMeal, "id">) => Promise<SavedMeal | null>;
  onDeleteSaved: (id: string) => Promise<boolean>;
  // `factor` is the portion multiplier over the meal's authored grams (1 = as
  // saved/authored); the caller scales the items with scaleComboItems.
  onSelect: (combo: Combo, factor: number) => void;
  // A saved meal id to open straight into edit mode for, instead of the
  // normal Yemeklerim list — set when a MealGroup's edit pencil opens this
  // sheet. Ignored (falls back to the list) if the id no longer matches a
  // saved meal.
  openEditMealId?: string | null;
};

// Mounted fresh on every open (the wrapper returns null while closed), so its
// state — tab, search, form — always starts clean and the default tab is
// chosen from the saved meals as they are at that moment.
export function MealsSheet(props: Props) {
  if (!props.isOpen) return null;
  return <MealsSheetBody {...props} />;
}

type View = { kind: "list" } | { kind: "form"; editing: SavedMeal | null };

const sectionLabel = "ledger text-xs uppercase tracking-widest text-muted-foreground";

function MealsSheetBody({
  onClose,
  slot,
  combos,
  catalog,
  foods,
  exclusions,
  allergenExclusions,
  remaining,
  filledSlots,
  targetsEstimated,
  canSaveMeals,
  savedMeals,
  savedLoading,
  onCreateSaved,
  onUpdateSaved,
  onDeleteSaved,
  onSelect,
  openEditMealId,
}: Props) {
  const editTarget = openEditMealId
    ? (savedMeals.find(meal => meal.id === openEditMealId) ?? null)
    : null;
  const [tab, setTab] = useState<Tab>(
    editTarget || (canSaveMeals && savedMeals.length > 0) ? "mine" : "ready"
  );
  const [view, setView] = useState<View>(
    editTarget ? { kind: "form", editing: editTarget } : { kind: "list" }
  );
  const [query, setQuery] = useState("");
  // The last tier picked — what tapping a built-in row's body adds, so the old
  // one-tap "tap a meal, it's added" flow stays one tap.
  const [portion, setPortion] = useState<PortionId>(loadMealPortion);
  // Only one custom-multiplier editor open at a time; keyed by the row's DOM id.
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SavedMeal | null>(null);
  // The saved meal whose delete request is in flight (after the confirm
  // modal already closed) — drives the row's trash icon -> spinner swap.
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const queryLower = query.trim().toLocaleLowerCase("tr-TR");

  const matches = (name: string) =>
    !queryLower || name.toLocaleLowerCase("tr-TR").includes(queryLower);

  const recommendations = useMemo(
    () =>
      slot ? recommendMeals({ combos, slot, remaining, filledSlots, catalog }) : [],
    [combos, slot, remaining, filledSlots, catalog]
  );
  const savedEntries = useMemo(
    () => annotateSavedMeals(savedMeals, exclusions, allergenExclusions, catalog),
    [savedMeals, exclusions, allergenExclusions, catalog]
  );

  function add(combo: Combo, factor: number, rememberTier?: PortionId) {
    if (rememberTier) {
      setPortion(rememberTier);
      saveMealPortion(rememberTier);
    }
    onSelect(combo, factor);
    onClose();
  }

  async function submitForm(data: SavedMealFormData, addToSlot: boolean): Promise<boolean> {
    const editing = view.kind === "form" ? view.editing : null;
    const saved = editing
      ? await onUpdateSaved(editing.id, data)
      : await onCreateSaved({ id: uid(), ...data });
    if (!saved) return false;
    if (addToSlot) {
      onSelect(savedMealToCombo(saved), 1);
      onClose();
    } else {
      setView({ kind: "list" });
      setTab("mine");
      setQuery("");
    }
    return true;
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setDeletingId(target.id);
    try {
      const ok = await onDeleteSaved(target.id);
      setNotice(ok ? null : `"${target.name}" silinemedi. Tekrar dene.`);
    } finally {
      setDeletingId(null);
    }
  }

  // Desktop keeps instant typing; a touch device browses first (rows are tall
  // and an auto-opened keyboard would leave room for ~2 of them).
  const autoFocusSearch =
    typeof window.matchMedia === "function" && !window.matchMedia("(pointer: coarse)").matches;

  const title =
    view.kind === "form" ? (view.editing ? "Yemeği düzenle" : "Yeni yemek") : "Yemekler";

  // ---- one row, three sources -------------------------------------------------
  const builtInRow = (combo: ScoredCombo, scope: string, activeTier: PortionId) => {
    const domId = `${scope}-${combo.id}`;
    return (
      <MealRow
        key={domId}
        combo={combo}
        catalog={catalog}
        domId={domId}
        showTiers
        activeTier={activeTier}
        editing={editingRow === domId}
        onStartEdit={() => setEditingRow(domId)}
        onCancelEdit={() => setEditingRow(null)}
        onAdd={add}
      />
    );
  };

  const savedRow = (entry: (typeof savedEntries)[number], scope: string) => {
    const { meal, scored, blocked } = entry;
    if (!scored) {
      return (
        <div
          key={`${scope}-${meal.id}`}
          className="rounded-lg border border-border bg-background p-3 opacity-70">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground">{meal.name}</h4>
            <button
              type="button"
              onClick={() => setDeleting(meal)}
              disabled={deletingId === meal.id}
              aria-label={`${meal.name} yemeğini sil`}
              className="text-muted-foreground hover:text-signal active:text-signal disabled:opacity-50">
              {deletingId === meal.id ? (
                <Loader2 className="size-4 animate-spin text-signal" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-signal">
            {blocked === "excluded"
              ? "Hassasiyet listendeki bir besin içerdiği için gösterilmiyor."
              : "Bir besinin besin değeri artık yok; eklenemiyor."}
          </p>
        </div>
      );
    }
    const domId = `${scope}-${meal.id}`;
    return (
      <MealRow
        key={domId}
        combo={scored}
        catalog={catalog}
        domId={domId}
        showTiers={false}
        activeTier={portion}
        editing={editingRow === domId}
        onStartEdit={() => setEditingRow(domId)}
        onCancelEdit={() => setEditingRow(null)}
        onAdd={add}
        actions={
          <>
            <button
              type="button"
              onClick={() => setView({ kind: "form", editing: meal })}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground active:text-foreground">
              <Pencil className="size-3.5" />
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => setDeleting(meal)}
              disabled={deletingId === meal.id}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-signal active:text-signal disabled:opacity-50">
              {deletingId === meal.id ? (
                <Loader2 className="size-3.5 animate-spin text-signal" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {deletingId === meal.id ? "Siliniyor…" : "Sil"}
            </button>
          </>
        }
      />
    );
  };

  // ---- tab bodies -------------------------------------------------------------
  const empty = (text: string) => (
    <div className="py-8 text-center text-sm text-muted-foreground">{text}</div>
  );

  let body;
  if (tab === "mine") {
    const rows = savedEntries.filter((entry) => matches(entry.meal.name));
    body = (
      <>
        <button
          type="button"
          onClick={() => setView({ kind: "form", editing: null })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary active:border-primary hover:text-primary active:text-primary">
          <span aria-hidden="true">+</span>
          Yeni Yemek
        </button>
        {savedLoading && savedMeals.length === 0 ? (
          <LoadingBlock className="h-20" />
        ) : rows.length > 0 ? (
          rows.map((entry) => savedRow(entry, "mine"))
        ) : savedMeals.length === 0 ? (
          empty("Henüz yemeğin yok. Sık yediğin bir öğünü buraya kaydet, sonra tek dokunuşla ekle.")
        ) : (
          empty(`"${query.trim()}" ile eşleşen yemeğin yok`)
        )}
      </>
    );
  } else if (tab === "ready") {
    const rows = combos.filter((combo) => matches(combo.nameTr));
    const showRecommendations = !queryLower && recommendations.length > 0;
    body = (
      <>
        {showRecommendations && (
          <section className="space-y-2">
            <div>
              <p className={sectionLabel}>Sana uygun</p>
              <p className="text-xs text-muted-foreground">
                {targetsEstimated ? "Tahmini hedefine göre" : "Kalan hedefine göre"}
              </p>
            </div>
            {recommendations.map((rec) => builtInRow(rec.combo, "rec", rec.portionId))}
            <p className={`${sectionLabel} pt-2`}>Tüm hazır yemekler</p>
          </section>
        )}
        {rows.length === 0
          ? empty(`"${query.trim()}" ile eşleşen yemek yok`)
          : rows.map((combo) => builtInRow(combo, "all", portion))}
      </>
    );
  } else {
    const savedRecipes = savedEntries.filter(
      (entry) => entry.scored && recipeSteps(entry.scored).length > 0 && matches(entry.meal.name)
    );
    const builtInRecipes = combos.filter(
      (combo) => recipeSteps(combo).length > 0 && matches(combo.nameTr)
    );
    body =
      savedRecipes.length + builtInRecipes.length === 0
        ? empty(
            queryLower
              ? `"${query.trim()}" ile eşleşen tarif yok`
              : "Henüz tarif yok. Bir yemek eklerken \"Hazırlama adımları ekle\" dersen burada görünür."
          )
        : (
          <>
            {savedRecipes.map((entry) => savedRow(entry, "recipe"))}
            {builtInRecipes.map((combo) => builtInRow(combo, "recipe", portion))}
          </>
        );
  }

  const tabItems: { value: Tab; label: string }[] = [
    ...(canSaveMeals ? [{ value: "mine" as const, label: "Yemeklerim" }] : []),
    { value: "ready", label: "Hazır Yemekler" },
    { value: "recipes", label: "Tarifler" },
  ];

  return (
    <BottomSheet title={title} titleId="meals-sheet-title" onClose={onClose}>
      {view.kind === "form" ? (
        <SavedMealForm
          foods={foods}
          catalog={catalog}
          exclusions={exclusions}
          allergenExclusions={allergenExclusions}
          initial={view.editing ?? undefined}
          canAddToSlot={slot !== null}
          onSubmit={submitForm}
          onCancel={() => setView({ kind: "list" })}
        />
      ) : (
        <>
          <div className="mb-3 shrink-0">
            <SmoothPillTabs
              value={tab}
              onChange={(next: Tab) => {
                setTab(next);
                setEditingRow(null);
              }}
              items={tabItems}
              surface="card"
            />
          </div>

          <div className="relative mb-4 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Yemek ara..."
              value={query}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              autoFocus={autoFocusSearch}
              className="w-full rounded-lg border border-border bg-background px-9 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {notice && <p className="mb-2 shrink-0 text-xs text-signal">{notice}</p>}

          {/* min-h-0 + overscroll-contain: this list — not the search field —
              is what gives when the keyboard shrinks the sheet, and a scroll
              that hits its end must not chain into the sheet drag or the page
              behind. */}
          <div className="min-h-0 max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain">
            {body}
          </div>
        </>
      )}

      {deleting && (
        <ConfirmModal
          onTop
          destructive
          title="Bu yemek silinsin mi?"
          description={`"${deleting.name}" Yemeklerim'den kalıcı olarak silinecek. Planına daha önce eklediklerin değişmez.`}
          confirmLabel="Sil"
          cancelLabel="Vazgeç"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </BottomSheet>
  );
}
