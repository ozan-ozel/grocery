import { useEffect, useState } from "react";
import {
  defaultTitle,
  readMealDateFromUrl,
  uid,
  writeMealDateToUrl,
} from "@/lib/store";
import {
  createMealEntry,
  deleteMealEntry,
  fetchMealEntries,
  updateMealEntry,
  type MealEntry,
  type MealSlot,
} from "@/lib/mealPlan";

const WINDOW_DAYS = 3;

function dateToStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function strToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDaysStr(dateStr: string, delta: number): string {
  const dt = strToDate(dateStr);
  dt.setDate(dt.getDate() + delta);
  return dateToStr(dt);
}

function todayDateStr(): string {
  return dateToStr(new Date());
}

function initialDate(): string {
  const fromUrl = readMealDateFromUrl();
  return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : todayDateStr();
}

export type NutritionValues = {
  kcal: number | null;
  proteinG: number | null;
  fatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
};

export function useMealPlan(householdId: string | null) {
  const [date, setDate] = useState<string>(initialDate);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [unsyncedIds, setUnsyncedIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    writeMealDateToUrl(date);
  }, [date]);

  // Fetch a window around the viewed date so prev/next-day navigation
  // doesn't hit the network on every click.
  useEffect(() => {
    if (!householdId) return;
    let cancelled = false;
    const from = addDaysStr(date, -WINDOW_DAYS);
    const to = addDaysStr(date, WINDOW_DAYS);
    fetchMealEntries(householdId, from, to).then((fetched) => {
      if (cancelled) return;
      setEntries(fetched);
      setUnsyncedIds(new Set());
      setErrorIds(new Set());
    });
    return () => {
      cancelled = true;
    };
  }, [householdId, date]);

  function goToPrevDay() {
    setDate((d) => addDaysStr(d, -1));
  }

  function goToNextDay() {
    setDate((d) => addDaysStr(d, 1));
  }

  function entriesForSlot(slot: MealSlot): MealEntry[] {
    return entries
      .filter((e) => e.date === date && e.slot === slot)
      .sort((a, b) => a.position - b.position);
  }

  function fixedEntry(slot: Exclude<MealSlot, "ara">): MealEntry | undefined {
    return entriesForSlot(slot)[0];
  }

  function araEntries(): MealEntry[] {
    return entriesForSlot("ara");
  }

  function dayTotals() {
    const todays = entries.filter((e) => e.date === date);
    const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    for (const e of todays) {
      if (e.kcal != null) totals.kcal += e.kcal;
      if (e.proteinG != null) totals.protein += e.proteinG;
      if (e.fatG != null) totals.fat += e.fatG;
      if (e.carbsG != null) totals.carbs += e.carbsG;
      if (e.fiberG != null) totals.fiber += e.fiberG;
    }
    return totals;
  }

  function upsertLocal(entry: MealEntry) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx === -1) return [...prev, entry];
      const next = [...prev];
      next[idx] = entry;
      return next;
    });
  }

  async function persistCreate(entry: MealEntry) {
    if (!householdId) return;
    const created = await createMealEntry({
      id: entry.id,
      householdId,
      date: entry.date,
      slot: entry.slot,
      text: entry.text,
      kcal: entry.kcal,
      proteinG: entry.proteinG,
      fatG: entry.fatG,
      carbsG: entry.carbsG,
      fiberG: entry.fiberG,
      position: entry.position,
    });
    if (created) {
      setUnsyncedIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
      setErrorIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
    } else {
      setErrorIds((ids) => new Set(ids).add(entry.id));
    }
  }

  async function persistUpdate(entry: MealEntry) {
    const updated = await updateMealEntry(entry.id, {
      text: entry.text,
      kcal: entry.kcal,
      proteinG: entry.proteinG,
      fatG: entry.fatG,
      carbsG: entry.carbsG,
      fiberG: entry.fiberG,
    });
    if (updated) {
      setErrorIds((ids) => {
        const next = new Set(ids);
        next.delete(entry.id);
        return next;
      });
    } else {
      setErrorIds((ids) => new Set(ids).add(entry.id));
    }
  }

  function persist(entry: MealEntry) {
    if (unsyncedIds.has(entry.id)) {
      void persistCreate(entry);
    } else {
      void persistUpdate(entry);
    }
  }

  function saveFixedSlotText(slot: Exclude<MealSlot, "ara">, text: string) {
    const trimmed = text.trim();
    const existing = fixedEntry(slot);
    if (!trimmed) {
      if (existing) removeEntry(existing.id);
      return;
    }
    if (existing) {
      const updated: MealEntry = { ...existing, text: trimmed };
      upsertLocal(updated);
      persist(updated);
      return;
    }
    const created: MealEntry = {
      id: uid(),
      date,
      slot,
      text: trimmed,
      kcal: null,
      proteinG: null,
      fatG: null,
      carbsG: null,
      fiberG: null,
      position: 0,
    };
    setUnsyncedIds((ids) => new Set(ids).add(created.id));
    upsertLocal(created);
    persist(created);
  }

  function addAraEntry(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nextPosition = araEntries().length;
    const created: MealEntry = {
      id: uid(),
      date,
      slot: "ara",
      text: trimmed,
      kcal: null,
      proteinG: null,
      fatG: null,
      carbsG: null,
      fiberG: null,
      position: nextPosition,
    };
    setUnsyncedIds((ids) => new Set(ids).add(created.id));
    upsertLocal(created);
    persist(created);
  }

  function saveEntryNutrition(id: string, values: NutritionValues) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    const updated: MealEntry = { ...existing, ...values };
    upsertLocal(updated);
    persist(updated);
  }

  function removeEntry(id: string) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setErrorIds((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
    if (unsyncedIds.has(id)) {
      // Never made it to the server — nothing to delete remotely.
      setUnsyncedIds((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
      return;
    }
    deleteMealEntry(id).then((ok) => {
      // Deletion failed — put it back rather than silently losing it.
      if (!ok) upsertLocal(existing);
    });
  }

  function retrySave(id: string) {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;
    persist(existing);
  }

  return {
    dateLabel: defaultTitle(strToDate(date).getTime()),
    goToPrevDay,
    goToNextDay,
    fixedEntry,
    araEntries,
    dayTotals,
    saveFixedSlotText,
    addAraEntry,
    saveEntryNutrition,
    removeEntry,
    errorIds,
    retrySave,
  };
}
