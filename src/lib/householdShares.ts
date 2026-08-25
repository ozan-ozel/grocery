function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE ?? "";
  return `${baseUrl}${path}`;
}

export async function listHouseholdShares(householdId: string): Promise<string[]> {
  try {
    const res = await fetch(
      apiUrl(`/api/household-shares?household_id=${encodeURIComponent(householdId)}`),
      { method: "GET", headers: { "content-type": "application/json" } }
    );
    if (!res.ok) {
      console.warn("[household-shares] list failed:", res.status);
      return [];
    }
    return (await res.json()) as string[];
  } catch (err) {
    console.warn("[household-shares] list threw:", err);
    return [];
  }
}

export async function inviteToHousehold(householdId: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/household-shares"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ household_id: householdId, email }),
    });
    if (!res.ok) {
      console.warn("[household-shares] invite failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[household-shares] invite threw:", err);
    return false;
  }
}

export async function revokeHouseholdShare(householdId: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/household-shares?household_id=${encodeURIComponent(householdId)}&email=${encodeURIComponent(
          email
        )}`
      ),
      { method: "DELETE" }
    );
    if (!res.ok) {
      console.warn("[household-shares] revoke failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[household-shares] revoke threw:", err);
    return false;
  }
}
