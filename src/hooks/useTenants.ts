import { useEffect, useMemo, useState } from "react";
import {
  createHousehold,
  deleteHousehold,
  listHouseholds,
  renameHousehold,
} from "@/lib/households";
import {
  hideHousehold,
  listHiddenHouseholds,
  unhideHousehold,
} from "@/lib/hiddenHouseholds";
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
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // First mount: load tenants + per-user hidden list from server, resolve
  // active from URL or first, then let the sync effect (see useListSync) pull
  // state. Runs once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [list, hidden] = await Promise.all([
        listHouseholds(),
        listHiddenHouseholds(),
      ]);
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
      // The URL takes precedence even if it points to a hidden tenant — a
      // shared link should still open the household. Otherwise pick the first
      // visible one; fall back to first-overall if every tenant is hidden
      // (shouldn't happen thanks to toggleHiddenTenant's guard, but defensive).
      const fromUrl = readTenantFromUrl();
      const visible = effective.filter((t) => !hidden.includes(t.id));
      const active =
        effective.find((t) => t.id === fromUrl) ?? visible[0] ?? effective[0];
      setTenants(effective);
      setHiddenIds(hidden);
      setActiveTenantId(active?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTenantId) writeTenantToUrl(activeTenantId);
  }, [activeTenantId]);

  const visibleTenants = useMemo(
    () => (tenants ?? []).filter((t) => !hiddenIds.includes(t.id)),
    [tenants, hiddenIds]
  );

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
    // Drop from hidden ids too — the row is gone.
    setHiddenIds((prev) => prev.filter((h) => h !== id));
    if (id === activeTenantId) {
      // Same path as selectTenant: switching tears down the sync channel
      // and clears state until the new tenant's pull lands.
      const nextVisible = next.filter((t) => !hiddenIds.includes(t.id));
      setActiveTenantId(nextVisible[0]?.id ?? next[0]?.id ?? null);
    }
  }

  async function toggleHiddenTenant(id: string) {
    const isHidden = hiddenIds.includes(id);
    if (isHidden) {
      const ok = await unhideHousehold(id);
      if (!ok) return;
      setHiddenIds((prev) => prev.filter((h) => h !== id));
      return;
    }
    // Guard: hiding this would leave zero visible households — refuse.
    const wouldBeVisible = (tenants ?? []).filter(
      (t) => t.id !== id && !hiddenIds.includes(t.id)
    );
    if (wouldBeVisible.length === 0) return;
    const ok = await hideHousehold(id);
    if (!ok) return;
    setHiddenIds((prev) => [...prev, id]);
    // If the user hid the active tenant, switch to a still-visible one.
    if (id === activeTenantId) {
      setActiveTenantId(wouldBeVisible[0].id);
    }
  }

  return {
    tenants,
    visibleTenants,
    hiddenIds,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    toggleHiddenTenant,
  };
}
