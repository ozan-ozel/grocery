export type Household = {
  id: string;
  name: string;
  created_at: string;
};

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function listHouseholds(): Promise<Household[]> {
  try {
    const res = await fetch(apiUrl("/api/households"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[households] list failed:", res.status);
      return [];
    }
    return (await res.json()) as Household[];
  } catch (err) {
    console.warn("[households] list threw:", err);
    return [];
  }
}

export async function renameHousehold(
  id: string,
  name: string
): Promise<Household | null> {
  try {
    const res = await fetch(apiUrl("/api/households"), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) {
      console.warn("[households] rename failed:", res.status);
      return null;
    }
    return (await res.json()) as Household;
  } catch (err) {
    console.warn("[households] rename threw:", err);
    return null;
  }
}

export async function fetchHousehold(id: string): Promise<Household | null> {
  try {
    const res = await fetch(apiUrl(`/api/households?id=${encodeURIComponent(id)}`), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("[households] fetch failed:", res.status);
      return null;
    }
    return (await res.json()) as Household;
  } catch (err) {
    console.warn("[households] fetch threw:", err);
    return null;
  }
}

export async function deleteHousehold(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/households?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("[households] delete failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[households] delete threw:", err);
    return false;
  }
}

export async function createHousehold(
  id: string,
  name: string
): Promise<Household | null> {
  try {
    const res = await fetch(apiUrl("/api/households"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) {
      console.warn("[households] create failed:", res.status);
      return null;
    }
    return (await res.json()) as Household;
  } catch (err) {
    console.warn("[households] create threw:", err);
    return null;
  }
}
