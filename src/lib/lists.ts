import type { List } from "../../netlify/functions/lists";

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function getList(id: string): Promise<List | null> {
  try {
    const res = await fetch(
      apiUrl(`/api/lists?id=${encodeURIComponent(id)}`),
      {
        method: "GET",
        headers: { "content-type": "application/json" },
      }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("[lists] get failed:", res.status);
      return null;
    }
    return (await res.json()) as List;
  } catch (err) {
    console.warn("[lists] get threw:", err);
    return null;
  }
}

export async function listsByHousehold(householdId: string): Promise<List[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/lists?household_id=${encodeURIComponent(householdId)}`
      ),
      {
        method: "GET",
        headers: { "content-type": "application/json" },
      }
    );
    if (!res.ok) {
      console.warn("[lists] list failed:", res.status);
      return [];
    }
    return (await res.json()) as List[];
  } catch (err) {
    console.warn("[lists] list threw:", err);
    return [];
  }
}

export interface CreateListInput {
  id: string;
  household_id: string;
  title: string;
  created_at: string; // ISO 8601
  group_by_category?: boolean;
}

export async function createList(input: CreateListInput): Promise<List | null> {
  try {
    const res = await fetch(apiUrl("/api/lists"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      console.warn("[lists] create failed:", res.status);
      return null;
    }
    return (await res.json()) as List;
  } catch (err) {
    console.warn("[lists] create threw:", err);
    return null;
  }
}

export interface UpdateListInput {
  id: string;
  title?: string;
  closed_at?: string | null; // ISO 8601 or null
  group_by_category?: boolean;
}

export async function updateList(input: UpdateListInput): Promise<List | null> {
  try {
    const res = await fetch(apiUrl("/api/lists"), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("[lists] update failed:", res.status);
      return null;
    }
    return (await res.json()) as List;
  } catch (err) {
    console.warn("[lists] update threw:", err);
    return null;
  }
}
