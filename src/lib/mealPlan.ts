export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

export type MealEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  text: string;
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
  position: number;
};

type MealEntryRow = {
  id: string;
  household_id: string;
  date: string;
  slot: string;
  text: string;
  kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  position: number;
};

function fromRow(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot as MealSlot,
    text: row.text,
    kcal: row.kcal,
    proteinG: row.protein_g,
    fatG: row.fat_g,
    carbsG: row.carbs_g,
    fiberG: row.fiber_g,
    position: row.position,
  };
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function fetchMealEntries(
  householdId: string,
  from: string,
  to: string
): Promise<MealEntry[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/meal-entries?householdId=${encodeURIComponent(householdId)}&from=${from}&to=${to}`
      ),
      { method: "GET", headers: { "content-type": "application/json" } }
    );
    if (!res.ok) {
      console.warn("[mealPlan] fetch failed:", res.status);
      return [];
    }
    const rows = (await res.json()) as MealEntryRow[];
    return rows.map(fromRow);
  } catch (err) {
    console.warn("[mealPlan] fetch threw:", err);
    return [];
  }
}

export type NewMealEntry = {
  id: string;
  householdId: string;
  date: string;
  slot: MealSlot;
  text: string;
  kcal?: number | null;
  proteinG?: number | null;
  fatG?: number | null;
  carbsG?: number | null;
  fiberG?: number | null;
  position: number;
};

export async function createMealEntry(entry: NewMealEntry): Promise<MealEntry | null> {
  try {
    const res = await fetch(apiUrl("/api/meal-entries"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        household_id: entry.householdId,
        date: entry.date,
        slot: entry.slot,
        text: entry.text,
        kcal: entry.kcal ?? null,
        protein_g: entry.proteinG ?? null,
        fat_g: entry.fatG ?? null,
        carbs_g: entry.carbsG ?? null,
        fiber_g: entry.fiberG ?? null,
        position: entry.position,
      }),
    });
    if (!res.ok) {
      console.warn("[mealPlan] create failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as MealEntryRow);
  } catch (err) {
    console.warn("[mealPlan] create threw:", err);
    return null;
  }
}

export type MealEntryPatch = Partial<{
  text: string;
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
  position: number;
}>;

export async function updateMealEntry(
  id: string,
  patch: MealEntryPatch
): Promise<MealEntry | null> {
  try {
    const body: Record<string, unknown> = {};
    if (patch.text !== undefined) body.text = patch.text;
    if (patch.kcal !== undefined) body.kcal = patch.kcal;
    if (patch.proteinG !== undefined) body.protein_g = patch.proteinG;
    if (patch.fatG !== undefined) body.fat_g = patch.fatG;
    if (patch.carbsG !== undefined) body.carbs_g = patch.carbsG;
    if (patch.fiberG !== undefined) body.fiber_g = patch.fiberG;
    if (patch.position !== undefined) body.position = patch.position;

    const res = await fetch(apiUrl(`/api/meal-entries?id=${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("[mealPlan] update failed:", res.status);
      return null;
    }
    return fromRow((await res.json()) as MealEntryRow);
  } catch (err) {
    console.warn("[mealPlan] update threw:", err);
    return null;
  }
}

export async function deleteMealEntry(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/meal-entries?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[mealPlan] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[mealPlan] delete threw:", err);
    return false;
  }
}
