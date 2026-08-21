import { useEffect, useState } from "react";
import {
  createHousehold,
  deleteHousehold,
  listHouseholds,
  renameHousehold,
} from "@/lib/households";
import { removeItemCategories } from "@/lib/categorization/itemCategories";
import {
  DEFAULT_TENANT_ID,
  readTenantFromUrl,
  writeTenantToUrl,
  uid,
  type Tenant,
} from "@/lib/store";

// Both tenants and activeTenantId start as null so the app can render a
// spinner until the first /api/tenants response lands. After that they stay
// populated.
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);

  // First mount: load tenants from server, resolve active from URL or first,
  // then let the sync effect (see useListSync) pull state. Runs once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listHouseholds();
      if (cancelled) return;
      let effective: Tenant[] = list.map((h) => ({
        id: h.id,
        name: h.name,
        createdAt: Date.parse(h.created_at),
      }));
      // If the server has no households at all, seed the default one so the
      // app still boots. This should only happen on a fresh Supabase; if two
      // devices race and one 409s, re-fetch so the loser adopts the winner's
      // row instead of showing a blank tenant list.
      if (effective.length === 0) {
        const created = await createHousehold(DEFAULT_TENANT_ID, "Evim");
        if (cancelled) return;
        if (created) {
          effective = [
            { id: created.id, name: created.name, createdAt: Date.parse(created.created_at) },
          ];
        } else {
          const refetched = await listHouseholds();
          if (cancelled) return;
          effective = refetched.map((h) => ({
            id: h.id,
            name: h.name,
            createdAt: Date.parse(h.created_at),
          }));
        }
      }
      const fromUrl = readTenantFromUrl();
      const active = effective.find((t) => t.id === fromUrl) ?? effective[0];
      setTenants(effective);
      setActiveTenantId(active?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTenantId) writeTenantToUrl(activeTenantId);
  }, [activeTenantId]);

  function selectTenant(id: string) {
    if (id === activeTenantId) return;
    // Switching tears down the sync channel (see useListSync's effect on
    // activeTenantId); that effect also clears state so the spinner shows
    // until the new pull.
    setActiveTenantId(id);
  }

  async function addTenant(name: string) {
    // Optimistic id — Supabase's PK is text so we control it. Server persists,
    // then we adopt so a failed create doesn't leave a ghost tenant.
    const id = uid();
    const created = await createHousehold(id, name.trim() || "Ev");
    if (!created) return;
    const t: Tenant = {
      id: created.id,
      name: created.name,
      createdAt: Date.parse(created.created_at),
    };
    setTenants((prev) => [...(prev ?? []), t]);
    setActiveTenantId(t.id);
  }

  async function renameTenant(id: string, name: string) {
    const updated = await renameHousehold(id, name.trim());
    if (!updated) return;
    setTenants((prev) =>
      (prev ?? []).map((t) => (t.id === id ? { ...t, name: updated.name } : t))
    );
  }

  async function deleteTenant(id: string) {
    const current = tenants ?? [];
    // Never delete the last household — the app has nowhere to fall back
    // to mid-session (a fresh reload would reseed one, but that's not a
    // substitute for a working UI right now).
    if (current.length <= 1) return;
    const ok = await deleteHousehold(id);
    if (!ok) return;
    removeItemCategories(id);
    const next = current.filter((t) => t.id !== id);
    setTenants(next);
    if (id === activeTenantId) {
      // Same path as selectTenant: switching tears down the sync channel
      // and clears state until the new tenant's pull lands.
      setActiveTenantId(next[0]?.id ?? null);
    }
  }

  return { tenants, activeTenantId, selectTenant, addTenant, renameTenant, deleteTenant };
}
