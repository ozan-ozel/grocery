export type MealSlot = "kahvalti" | "ogle" | "aksam" | "ara";

export type MealEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  foodId: string; // Nutrition.name_tr
  quantityG: number;
  position: number;
};

type MealEntryRow = {
  id: string;
  household_id: string;
  date: string;
  slot: string;
  food_id: string;
  quantity_g: number;
  position: number;
};

function fromRow(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot as MealSlot,
    foodId: row.food_id,
    quantityG: row.quantity_g,
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
  foodId: string;
  quantityG: number;
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
        food_id: entry.foodId,
        quantity_g: entry.quantityG,
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
  quantityG: number;
  position: number;
}>;

export async function updateMealEntry(
  id: string,
  patch: MealEntryPatch
): Promise<MealEntry | null> {
  try {
    const body: Record<string, unknown> = {};
    if (patch.quantityG !== undefined) body.quantity_g = patch.quantityG;
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
