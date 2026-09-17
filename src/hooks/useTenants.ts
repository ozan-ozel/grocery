import { useEffect, useRef, useState } from "react";
import {
  createHousehold,
  deleteHousehold,
  listHouseholds,
  renameHousehold,
  type Household,
} from "@/lib/households";
import { loadLastTenant, saveLastTenant } from "@/lib/bootCache";
import { removeItemCategories } from "@/lib/categorization/itemCategories";
import {
  readTenantFromUrl,
  writeTenantToUrl,
  uid,
  type Tenant,
} from "@/lib/store";

function toTenant(h: Household): Tenant {
  return {
    id: h.id,
    name: h.name,
    createdAt: Date.parse(h.created_at),
    ownerId: h.owner_id,
  };
}

// `tenants` starts null and stays null until /api/households answers, but
// `activeTenantId` resolves *synchronously* at mount from the URL or the
// remembered last tenant. That's the whole point: /api/state used to sit
// behind /api/households purely to learn an id that was already sitting in
// the query string. The fetch below reconciles rather than resolves.
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(
    () => readTenantFromUrl() ?? loadLastTenant()
  );
  // Set by addTenant right before switching into a brand-new (definitely
  // empty) household. useListSync consumes this once, on the switch it was
  // set for, to skip its normal clear-and-repull cycle — see its comment.
  const freshTenantIdRef = useRef<string | null>(null);

  function consumeFreshTenantId(id: string): boolean {
    if (freshTenantIdRef.current !== id) return false;
    freshTenantIdRef.current = null;
    return true;
  }

  // First mount: load the real tenant list and reconcile it against whatever
  // id we already optimistically adopted. Runs once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listHouseholds();
      if (cancelled) return;
      // null means the *request* failed — an expired cookie, a 502, offline —
      // not "this account has no households". Bail out entirely: keep the
      // optimistic tenant and try again on the next load. Seeding here is how
      // an expired session would silently mint a duplicate "Evim".
      if (!list) return;

      let effective: Tenant[] = list.map(toTenant);
      // A real, successful, empty response is the only thing that may seed the
      // default household. This should only happen on a fresh Supabase; if two
      // devices race and one 409s, re-fetch so the loser adopts the winner's
      // row instead of showing a blank tenant list.
      if (effective.length === 0) {
        const created = await createHousehold(uid(), "Evim");
        if (cancelled) return;
        if (created) {
          effective = [toTenant(created)];
        } else {
          const refetched = await listHouseholds();
          if (cancelled) return;
          if (!refetched) return;
          effective = refetched.map(toTenant);
        }
      }

      setTenants(effective);
      // Reconcile, don't resolve. If the optimistic id is real, hand back the
      // *identical string* so React bails out of the state update — load-bearing,
      // because useListSync keys its effect on [activeTenantId] and any new
      // value tears down the in-flight sync channel and re-pulls from scratch.
      // Otherwise fall back: URL first (a shared link should still open its
      // household), then the first household.
      setActiveTenantId((current) => {
        if (current && effective.some((t) => t.id === current)) return current;
        const fromUrl = readTenantFromUrl();
        const active = effective.find((t) => t.id === fromUrl) ?? effective[0];
        return active?.id ?? null;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeTenantId) return;
    writeTenantToUrl(activeTenantId);
    // Remembered so a plain "open the app" (no ?tenant= in the URL) can still
    // start /api/state at t=0 instead of waiting for /api/households.
    saveLastTenant(activeTenantId);
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
      ownerId: created.owner_id,
    };
    setTenants((prev) => [...(prev ?? []), t]);
    freshTenantIdRef.current = t.id;
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

  return {
    tenants,
    activeTenantId,
    selectTenant,
    addTenant,
    renameTenant,
    deleteTenant,
    consumeFreshTenantId,
  };
}
