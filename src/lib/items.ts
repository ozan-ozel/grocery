import type { Item } from "../../netlify/functions/items";

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function getItem(id: string): Promise<Item | null> {
  try {
    const res = await fetch(
      apiUrl(`/api/items?id=${encodeURIComponent(id)}`),
      {
        method: "GET",
        headers: { "content-type": "application/json" },
      }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("[items] get failed:", res.status);
      return null;
    }
    return (await res.json()) as Item;
  } catch (err) {
    console.warn("[items] get threw:", err);
    return null;
  }
}

export async function listByList(listId: string): Promise<Item[]> {
  try {
    const res = await fetch(
      apiUrl(`/api/items?list_id=${encodeURIComponent(listId)}`),
      {
        method: "GET",
        headers: { "content-type": "application/json" },
      }
    );
    if (!res.ok) {
      console.warn("[items] list failed:", res.status);
      return [];
    }
    return (await res.json()) as Item[];
  } catch (err) {
    console.warn("[items] list threw:", err);
    return [];
  }
}

export interface CreateItemInput {
  id: string;
  list_id: string;
  name: string;
  qty?: string;
  checked?: boolean;
  category?: string | null;
  added_at: string; // ISO 8601
  position?: number | null;
}

export async function createItem(input: CreateItemInput): Promise<Item | null> {
  try {
    const res = await fetch(apiUrl("/api/items"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      console.warn("[items] create failed:", res.status);
      return null;
    }
    return (await res.json()) as Item;
  } catch (err) {
    console.warn("[items] create threw:", err);
    return null;
  }
}

export interface UpdateItemInput {
  id: string;
  name?: string;
  qty?: string;
  checked?: boolean;
  category?: string | null;
  position?: number | null;
}

export async function updateItem(input: UpdateItemInput): Promise<Item | null> {
  try {
    const res = await fetch(apiUrl("/api/items"), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("[items] update failed:", res.status);
      return null;
    }
    return (await res.json()) as Item;
  } catch (err) {
    console.warn("[items] update threw:", err);
    return null;
  }
}
