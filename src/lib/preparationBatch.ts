// DEC-069 (batch cooking, leftovers, storage-aware planning) — Option 3, v1
// scope. Architecture: nutrition-curriculum/08_APP_TRANSLATION/
// DEC-069_IMPLEMENTATION_PLAN.md.
//
// A PreparationBatch is an immutable snapshot of what was actually prepared
// in one cooking occasion. `composition` is captured once at creation and
// never updated by any function in this file — a correction means creating
// a new batch, not editing an existing one (see the implementation plan's
// "Immutability" section, §6.3).
//
// CRITICAL: composition[].foodId uses the SAME value space as
// MealEntry.foodId / Combo.items[].foodId (nutrition.name_tr) — NOT the
// opaque Nutrition.food_id UUID from Canonical Food Identity. These are two
// different "food_id" concepts in this codebase; conflating them would
// break leftover derivation's equality join against meal_entries.food_id.
// See DEC-069_IMPLEMENTATION_PLAN.md §6.1.

export type BatchCompositionItem = {
  foodId: string; // same value space as MealEntry.foodId — nutrition.name_tr
  quantityG: number;
};

export type PreparationBatch = {
  id: string;
  householdId: string;
  preparedDate: string; // YYYY-MM-DD
  storageNote?: string;
  sourceComboId?: string; // provenance only — never authoritative for composition
  composition: BatchCompositionItem[];
};

type PreparationBatchRow = {
  id: string;
  household_id: string;
  prepared_date: string;
  storage_note: string | null;
  source_combo_id: string | null;
  composition: { food_id: string; quantity_g: number }[];
};

function fromRow(row: PreparationBatchRow): PreparationBatch {
  return {
    id: row.id,
    householdId: row.household_id,
    preparedDate: row.prepared_date,
    storageNote: row.storage_note ?? undefined,
    sourceComboId: row.source_combo_id ?? undefined,
    composition: row.composition.map((item) => ({
      foodId: item.food_id,
      quantityG: item.quantity_g,
    })),
  };
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// ---------------------------------------------------------------------------
// Composition construction (pure, no network — testable in isolation)

// Merges duplicate foodId entries by summing their quantities ("prefer one
// canonical entry per Food in a composition" — a manual multi-pick UI could
// let the same food be added twice) and drops any entry that isn't a real,
// positive quantity against a non-empty food reference. Never fuzzy-matches
// or treats near-identical strings as the same food — only exact foodId
// string equality merges two entries.
export function normalizeComposition(
  items: BatchCompositionItem[]
): BatchCompositionItem[] {
  const merged = new Map<string, number>();
  const order: string[] = [];
  for (const item of items) {
    if (!item.foodId || !Number.isFinite(item.quantityG) || item.quantityG <= 0) {
      continue;
    }
    if (!merged.has(item.foodId)) order.push(item.foodId);
    merged.set(item.foodId, (merged.get(item.foodId) ?? 0) + item.quantityG);
  }
  return order.map((foodId) => ({ foodId, quantityG: merged.get(foodId)! }));
}

// A batch must contain at least one food — an empty composition can't
// represent "something was prepared" at all. Called after normalization, so
// a submission of only invalid/zero entries is caught here too.
export function isValidComposition(items: BatchCompositionItem[]): boolean {
  return items.length > 0;
}

// ---------------------------------------------------------------------------
// Leftover derivation (pure, no network — the core DEC-069 calculation)

export type MealAllocation = {
  foodId: string;
  quantityG: number;
};

export type RemainingItem = BatchCompositionItem & {
  // Can go negative on over-allocation — never clamped to zero here. The
  // caller/UI decides how to present that (this app's existing convention,
  // e.g. TodayView's RemainingSummary, is to show the raw negative number in
  // a warning color rather than hide or auto-correct it).
  remainingG: number;
};

// remaining(food) = batch.composition[food].quantityG − SUM(allocations for
// that food). Groups strictly by exact foodId equality — no fuzzy matching,
// no inferring equivalence from similar names or similar nutrition, per the
// same identity rule composition itself follows (§ above).
export function remainingComposition(
  batch: Pick<PreparationBatch, "composition">,
  allocations: MealAllocation[]
): RemainingItem[] {
  const consumed = new Map<string, number>();
  for (const allocation of allocations) {
    consumed.set(
      allocation.foodId,
      (consumed.get(allocation.foodId) ?? 0) + allocation.quantityG
    );
  }
  return batch.composition.map((item) => ({
    ...item,
    remainingG: item.quantityG - (consumed.get(item.foodId) ?? 0),
  }));
}

// ---------------------------------------------------------------------------
// Persistence (client <-> api/preparation-batches.ts)

export async function fetchPreparationBatches(
  householdId: string
): Promise<PreparationBatch[]> {
  try {
    const res = await fetch(
      apiUrl(`/api/preparation-batches?householdId=${encodeURIComponent(householdId)}`),
      { method: "GET", headers: { "content-type": "application/json" } }
    );
    if (!res.ok) {
      console.warn("[preparationBatch] fetch failed:", res.status);
      return [];
    }
    const rows = (await res.json()) as PreparationBatchRow[];
    return rows.map(fromRow);
  } catch (err) {
    console.warn("[preparationBatch] fetch threw:", err);
    return [];
  }
}

export type NewPreparationBatch = {
  id: string;
  householdId: string;
  preparedDate: string;
  storageNote?: string;
  sourceComboId?: string;
  composition: BatchCompositionItem[];
};

export async function createPreparationBatch(
  batch: NewPreparationBatch
): Promise<PreparationBatch | null> {
  try {
    const res = await fetch(apiUrl("/api/preparation-batches"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: batch.id,
        household_id: batch.householdId,
        prepared_date: batch.preparedDate,
        storage_note: batch.storageNote ?? null,
        source_combo_id: batch.sourceComboId ?? null,
        composition: batch.composition.map((item) => ({
          food_id: item.foodId,
          quantity_g: item.quantityG,
        })),
      }),
    });
    if (!res.ok) {
      console.warn("[preparationBatch] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as PreparationBatchRow);
  } catch (err) {
    console.warn("[preparationBatch] create threw:", err);
    return null;
  }
}
