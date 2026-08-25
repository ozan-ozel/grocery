function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function listHiddenHouseholds(): Promise<string[]> {
  try {
    const res = await fetch(apiUrl("/api/hidden-households"), {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      console.warn("[hidden-households] list failed:", res.status);
      return [];
    }
    return (await res.json()) as string[];
  } catch (err) {
    console.warn("[hidden-households] list threw:", err);
    return [];
  }
}

export async function hideHousehold(householdId: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/hidden-households"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ household_id: householdId }),
    });
    if (!res.ok) {
      console.warn("[hidden-households] hide failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[hidden-households] hide threw:", err);
    return false;
  }
}

export async function unhideHousehold(householdId: string): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(`/api/hidden-households?household_id=${encodeURIComponent(householdId)}`),
      { method: "DELETE" }
    );
    if (!res.ok) {
      console.warn("[hidden-households] unhide failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[hidden-households] unhide threw:", err);
    return false;
  }
}
