export type Household = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string | null;
};

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

// Returns null when the request itself failed (401, 502, network throw) —
// deliberately NOT []. useTenants reads a genuinely empty list as "fresh
// account, seed the default household", so conflating the two mints a
// spurious household every time a call fails. That matters more than it
// looks: there is deliberately no session refresh (see lib/auth.ts's header),
// so cookies die on Supabase's 1h default and a 401 here is routine, not
// exotic.
export async function listHouseholds(): Promise<Household[] | null> {
  try {
    const res = await fetch(apiUrl("/api/households"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[households] list failed:", res.status);
      return null;
    }
    return (await res.json()) as Household[];
  } catch (err) {
    console.warn("[households] list threw:", err);
    return null;
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
